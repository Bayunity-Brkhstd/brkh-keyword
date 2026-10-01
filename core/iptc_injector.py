import os
import io
import gc
import re
import xml.sax.saxutils
import logging
from PIL import Image
import iptcinfo3

# Suppress iptcinfo3 verbose log warnings on network shares
iptcinfo3.logger.setLevel(logging.ERROR)

from core.path_utils import normalize_path

class IPTCInjector:
    """
    Direct Binary IPTC, EXIF (Windows Details XPTitle/XPSubject/XPKeywords),
    and EPS XMP Metadata Injector for Microstock Assets.
    """
    @staticmethod
    def embed_to_jpg(file_path: str, title: str, description: str, keywords: list) -> bool:
        file_path = normalize_path(file_path)
        if not os.path.exists(file_path):
            print(f"[METADATA ERROR] File tidak ditemukan: {file_path}")
            return False

        if not file_path.lower().endswith(('.jpg', '.jpeg')):
            print(f"[METADATA SKIPPED] Bukan file JPG/JPEG: {file_path}")
            return False

        clean_title = (title or "").strip()
        clean_desc = (description or "").strip()
        clean_kw = [str(k).strip().lower() for k in keywords if str(k).strip()]

        # 1. EXIF Injection (Windows File Explorer Properties -> Details Tab: XPTitle, XPSubject, XPKeywords)
        # Processed in memory to ensure file handle is immediately closed before IPTC injection
        try:
            img_bytes = None
            with Image.open(file_path) as img:
                img.load()
                exif = img.getexif()
                
                # ImageDescription (Standard EXIF 0x010e)
                if clean_title:
                    exif[0x010e] = clean_title
                
                # XPTitle (Windows Details Title - 0x9c9b / 40091)
                if clean_title:
                    exif[0x9c9b] = (clean_title + '\0').encode('utf-16le')
                
                # XPSubject (Windows Details Subject - 0x9c9f / 40095)
                if clean_desc:
                    exif[0x9c9f] = (clean_desc + '\0').encode('utf-16le')
                
                # XPKeywords (Windows Details Tags - 0x9c9e / 40094)
                if clean_kw:
                    exif[0x9c9e] = ('; '.join(clean_kw) + '\0').encode('utf-16le')

                buf = io.BytesIO()
                fmt = img.format if img.format else 'JPEG'
                img.save(buf, format=fmt, exif=exif, quality=95)
                img_bytes = buf.getvalue()
                del buf

            if img_bytes:
                with open(file_path, 'wb') as f:
                    f.write(img_bytes)
                del img_bytes
                gc.collect()
        except Exception as e:
            print(f"[EXIF WARNING] Gagal menulis EXIF tags ke {file_path}: {e}")

        # 2. Binary IPTC Injection (iptcinfo3: ObjectName, Caption/Abstract, Keywords)
        try:
            # Pre-clean any leftover backup file (~filename.jpg) on NAS/network shares
            backup_file = file_path + '~'
            if os.path.exists(backup_file):
                try:
                    os.remove(backup_file)
                except Exception:
                    pass

            info = iptcinfo3.IPTCInfo(file_path, force=True)

            if clean_title:
                info['object name'] = clean_title.encode('utf-8')

            if clean_desc:
                info['caption/abstract'] = clean_desc.encode('utf-8')

            if clean_kw:
                info['keywords'] = [k.encode('utf-8') for k in clean_kw]

            info.save()

            # Clean up automatic backup file (~filename.jpg)
            if os.path.exists(backup_file):
                try:
                    os.remove(backup_file)
                except Exception:
                    pass

            return True

        except Exception as e:
            print(f"[IPTC ERROR] Penulisan biner IPTC gagal untuk {file_path}: {e}")
            return False


    @staticmethod
    def embed_to_eps(eps_path: str, title: str, description: str, keywords: list) -> bool:
        eps_path = normalize_path(eps_path)
        if not os.path.exists(eps_path):
            return False

        try:
            clean_title = xml.sax.saxutils.escape((title or "").strip())
            clean_desc = xml.sax.saxutils.escape((description or "").strip())
            clean_kw = [xml.sax.saxutils.escape(str(k).strip().lower()) for k in keywords if str(k).strip()]

            kw_items = "\n".join([f"     <rdf:li>{k}</rdf:li>" for k in clean_kw])

            xmp_block = f"""%BEGINXMP:Main
<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 5.6-c140">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">
   <dc:title>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">{clean_title}</rdf:li>
    </rdf:Alt>
   </dc:title>
   <dc:description>
    <rdf:Alt>
     <rdf:li xml:lang="x-default">{clean_desc}</rdf:li>
    </rdf:Alt>
   </dc:description>
   <dc:subject>
    <rdf:Bag>
{kw_items}
    </rdf:Bag>
   </dc:subject>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>
%ENDXMP:Main"""

            with open(eps_path, 'rb') as f:
                content_bytes = f.read()

            try:
                content_str = content_bytes.decode('utf-8', errors='ignore')
            except Exception:
                content_str = content_bytes.decode('latin-1')

            if '%BEGINXMP:Main' in content_str and '%ENDXMP:Main' in content_str:
                content_str = re.sub(r'%BEGINXMP:Main.*?%ENDXMP:Main', xmp_block, content_str, flags=re.DOTALL)
            elif '<x:xmpmeta' in content_str and '</x:xmpmeta>' in content_str:
                content_str = re.sub(r'<\?xpacket begin=.*?<\?xpacket end="w"\?>', xmp_block, content_str, flags=re.DOTALL)
            elif '%%EndComments' in content_str:
                content_str = content_str.replace('%%EndComments', xmp_block + '\n%%EndComments', 1)
            else:
                content_str = xmp_block + '\n' + content_str

            with open(eps_path, 'wb') as f:
                f.write(content_str.encode('utf-8', errors='ignore'))

            print(f"[EPS METADATA SUCCESS] Injected XMP into: {eps_path}")
            return True

        except Exception as e:
            print(f"[EPS METADATA ERROR] Gagal menulis XMP ke {eps_path}: {e}")
            return False


