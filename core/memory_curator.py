import io
import json
import time
import gc
from PIL import Image
from core.path_utils import normalize_path

class SafeMemoryCurator:
    """
    Memory-safe Gemini Vision Curator with Multi-API Key Auto-Rolling Rotation.
    Reduces image dimensions in ephemeral memory buffers to minimize TPM and RAM footprint,
    enforces structured JSON output schema, and automatically rotates through up to 30 API keys
    on rate limits (429/RESOURCE_EXHAUSTED) or per request (Round-Robin).
    """
    def __init__(self, api_keys):
        self.api_keys = self._parse_keys(api_keys)
        self.current_key_idx = 0
        self.clients_cache = {}

    def _parse_keys(self, keys_input) -> list:
        if not keys_input:
            return []
        if isinstance(keys_input, str):
            # Split by line breaks, commas, spaces
            raw_list = [k.strip() for k in keys_input.replace(',', '\n').split('\n') if k.strip()]
        elif isinstance(keys_input, list):
            raw_list = [str(k).strip() for k in keys_input if str(k).strip()]
        else:
            raw_list = []
        
        # Deduplicate while preserving order and cap at maximum 30 keys
        seen = set()
        clean_keys = []
        for k in raw_list:
            if k not in seen and not k.startswith('#'):
                seen.add(k)
                clean_keys.append(k)
                if len(clean_keys) >= 30:
                    break
        return clean_keys

    def _get_client_for_key(self, api_key: str):
        if not api_key:
            return None, None
        if api_key in self.clients_cache:
            return self.clients_cache[api_key]

        # Try google.genai SDK first (modern), fallback to google.generativeai
        client = None
        sdk_type = None
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            sdk_type = "google-genai"
        except ImportError:
            try:
                import google.generativeai as genai_legacy
                genai_legacy.configure(api_key=api_key)
                client = genai_legacy
                sdk_type = "google-generativeai"
            except ImportError:
                raise ImportError("Neither 'google-genai' nor 'google-generativeai' library is installed. Please install 'google-genai'.")
        
        self.clients_cache[api_key] = (client, sdk_type)
        return client, sdk_type

    def get_next_key_client(self):
        if not self.api_keys:
            return None, None, None, -1
        
        idx = self.current_key_idx
        key = self.api_keys[idx]
        self.current_key_idx = (self.current_key_idx + 1) % len(self.api_keys)
        client, sdk_type = self._get_client_for_key(key)
        return key, client, sdk_type, idx

    def optimize_image_bytes(self, file_path: str, max_dim: int = 1024) -> bytes:
        """
        Resize image in an ephemeral BytesIO buffer to a max dimension of 1024px.
        Lowers RAM footprint and reduces Vision API Token (TPM) consumption by 60-75%.
        """
        file_path = normalize_path(file_path)
        with Image.open(file_path) as img:
            img = img.convert('RGB')
            img.thumbnail((max_dim, max_dim))
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG', quality=80)
            data = buffer.getvalue()
        
        del buffer
        gc.collect()
        return data

    def curate(self, file_path: str, min_kw: int = 35, max_kw: int = 45, notes: str = "", niche_theme: str = "auto") -> dict:
        file_path = normalize_path(file_path)
        if not self.api_keys:
            raise ValueError("Belum ada Gemini API Key yang dikonfigurasi. Harap unggah/masukkan API Key.")

        img_bytes = self.optimize_image_bytes(file_path, max_dim=1024)

        THEME_INSTRUCTIONS = {
            "text_effect": "FOKUS KHUSUS TEMA ASET: Text Effect & Typography (PSD/EPS Graphic Style). Wajib masukkan kata kunci terkait efek teks, gaya tulisan, editable text style, font layer, typography, 3d text, dan graphic style template!",
            "vector_illustration": "FOKUS KHUSUS TEMA ASET: Vector Illustration & Digital Graphics. Wajib masukkan kata kunci terkait format ilustrasi vektor, elemen gambar digital, grafis kreatif, dan aset desainer!",
            "ui_ux": "FOKUS KHUSUS TEMA ASET: UI/UX Component & Web Template. Wajib masukkan kata kunci terkait elemen antarmuka pengguna, komponen web, dashboard kit, UI layout, dan elemen aplikasi digital!",
            "icon_set": "FOKUS KHUSUS TEMA ASET: Icon Set & Symbol Pack. Wajib masukkan kata kunci terkait kumpulan ikon, simbol vektor, icon collection, set grafik, dan simbol navigasi!",
            "isometric": "FOKUS KHUSUS TEMA ASET: Isometric 3D Design. Wajib masukkan kata kunci terkait perspektif isometrik, proyeksi 3D, arsitektur isometrik, dan objekisometri!",
            "social_media": "FOKUS KHUSUS TEMA ASET: Social Media Post & Flyer Banner. Wajib masukkan kata kunci terkait promosi media sosial, template postingan Instagram/Facebook, banner pemasaran, dan flyer acara!",
            "render_3d": "FOKUS KHUSUS TEMA ASET: 3D Render & Object Modeling. Wajib masukkan kata kunci terkait 3D render, clay modeling, pencahayaan 3D, isolasi objek 3D, dan pemodelan tiga dimensi!",
            "pattern": "FOKUS KHUSUS TEMA ASET: Seamless Pattern & Texture. Wajib masukkan kata kunci terkait pola berulang tanpa sambungan (seamless pattern), tekstur latar belakang, motif dekoratif, dan kain/kertas!",
            "character": "FOKUS KHUSUS TEMA ASET: Character Design & Mascot. Wajib masukkan kata kunci terkait desain karakter, maskot digital, ilustrasi tokoh, ekspresi, dan kartun komersial!",
            "logo_emblem": "FOKUS KHUSUS TEMA ASET: Logo, Badge & Emblem Label. Wajib masukkan kata kunci terkait desain logo, identitas brand, lencana vintage, stempel, dan insignia perusahaan!",
            "background": "FOKUS KHUSUS TEMA ASET: Background & Abstract Texture. Wajib masukkan kata kunci terkait latar belakang komersial, tekstur abstrak, wallpaper digital, dan ruang kosong desain!"
        }

        theme_text = THEME_INSTRUCTIONS.get(niche_theme, "")

        system_prompt = f"""Kamu adalah kurator metadata aset microstock profesional kelas dunia untuk agensi terkemuka (Adobe Stock, Shutterstock, Freepik, Getty Images).

TUGAS UTAMA:
Menganalisis gambar aset digital secara visual dan menghasilkan metadata komersial yang presisi, relevan, dan terbebas dari pelanggaran hak cipta.
{f'PETUNJUK KATEGORI TEMA: {theme_text}' if theme_text else ''}

ATURAN TITLE:
- Buat 1 judul deskriptif bahasa Inggris dengan panjang antara 60 sampai 90 karakter.
- Wajib gunakan pola judul: [Karakteristik Visual Utama / Subjek] + [Gaya / Format Aset] + [Konteks Penggunaan].
  (Contoh: "Gold Trophy on Podium 3D Render for Achievement Celebration Award")
- Hindari keyword stuffing (dilarang menumpuk kata yang sama).
- Jangan gunakan tanda baca aneh atau simbol berlebihan (hindari: |, !, #, @, emoji).

ATURAN DESCRIPTION:
- Buat 1-2 kalimat bahasa Inggris yang menjelaskan subjek visual, elemen pendukung, palet/nuansa, dan fleksibilitas penggunaannya untuk proyek komersial.

ATURAN KEYWORDS:
1. Format Kata Kunci:
   - Wajib huruf kecil semua (lowercase).
   - Setiap elemen keyword HARUS berupa 1 KATA TUNGGAL (single word, tanpa spasi). Jika ada konsep gabungan, pecah menjadi kata mandiri yang relevan (misal: "hair cut" -> "hair", "cut"; "barber shop" -> "barbershop", "barber", "shop").
   - Hapus semua tanda baca, angka, atau simbol (hanya karakter huruf a-z).
2. Jumlah: Hasilkan tepat antara {min_kw} sampai {max_kw} kata kunci yang unik (tanpa duplikasi).
3. Hierarki & Urutan Relevansi (Wajib urutkan dari kata 1 sampai selesai):
   - Level 1 (Kata 1-10): Subjek literal dan teks eksplisit yang terlihat pada gambar.
   - Level 2 (Kata 11-20): Gaya desain, estetika visual, palet warna dominan, dan format teknis (contoh: vector, editable, vintage, blue, typography).
   - Level 3 (Kata 21-35): Objek pendukung, metafora, dan elemen sekunder di latar belakang.
   - Level 4 (Kata 36-selesai): Kasus penggunaan komersial dan target media (contoh: banner, poster, signage, branding, template).
4. Larangan Mutlak (Negative Rules):
   - Dilarang menyertakan nama merek dagang/brand/trademark (contoh: Photoshop, Illustrator, Apple, Instagram).
   - Dilarang menyertakan kata-kata tidak bermakna seperti 'the', 'and', 'image', 'picture', 'photo' (jika aset bukan fotografi).
   - Dilarang memasukkan kata yang tidak memiliki kaitan visual langsung dengan gambar.

{f'CATATAN TAMBAHAN DARI PENGGUNA: {notes}' if notes else ''}"""

        metadata_schema = {
            "type": "OBJECT",
            "properties": {
                "title": {"type": "STRING", "description": "English commercial title 60-90 characters"},
                "description": {"type": "STRING", "description": "1-2 English sentences detailing visual value"},
                "assetType": {"type": "STRING", "description": "Technical format e.g. 3D Render, Vector Illustration, Photo"},
                "keywords": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"},
                    "description": f"Strictly {min_kw} to {max_kw} unique single-word lowercase keywords"
                }
            },
            "required": ["title", "description", "assetType", "keywords"]
        }

        total_keys = len(self.api_keys)
        max_attempts = max(total_keys * 2, 3)
        delay = 2.0
        last_error = None

        # Priority model candidate list (stable & high capacity vision models)
        model_candidates = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-3.8-flash", "gemini-2.0-flash"]

        for attempt in range(max_attempts):
            key, client, sdk_type, key_idx = self.get_next_key_client()
            if not client:
                continue

            masked_key = key[:6] + "..." + key[-4:] if len(key) > 10 else "***"
            
            # Try model candidates for this key
            for model_name in model_candidates:
                print(f"[API ROTATION] Attempt #{attempt + 1} using Key #{key_idx + 1}/{total_keys} ({masked_key}) with model '{model_name}'")

                try:
                    if sdk_type == "google-genai":
                        from google.genai import types
                        response = client.models.generate_content(
                            model=model_name,
                            contents=[
                                types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
                                "Analisis aset ini dan keluarkan metadata sesuai aturan."
                            ],
                            config=types.GenerateContentConfig(
                                system_instruction=system_prompt,
                                response_mime_type="application/json",
                                response_schema=metadata_schema,
                                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
                                temperature=0.2
                            )
                        )
                        text_content = response.text
                    else:
                        # Fallback for google-generativeai legacy
                        model = client.GenerativeModel(
                            model_name=model_name,
                            system_instruction=system_prompt,
                            generation_config={
                                "response_mime_type": "application/json",
                                "temperature": 0.2
                            }
                        )
                        image_part = {"mime_type": "image/jpeg", "data": img_bytes}
                        response = model.generate_content([image_part, "Analisis aset ini dan keluarkan metadata sesuai aturan."])
                        text_content = response.text

                    del img_bytes
                    gc.collect()
                    return json.loads(text_content)

                except Exception as e:
                    err_str = str(e)
                    err_lower = err_str.lower()
                    last_error = e

                    # 1. Handle 503 UNAVAILABLE / High Demand / 500 Server Overload
                    if "503" in err_str or "unavailable" in err_lower or "high demand" in err_lower or "overloaded" in err_lower or "500" in err_str:
                        print(f"[HIGH DEMAND FALLBACK] Model '{model_name}' (503 High Demand). Switching instantly to next model candidate...")
                        time.sleep(1.0)
                        continue  # Try next model candidate on same key!

                    # 2. Handle 404 / NOT FOUND
                    if "404" in err_str or "not_found" in err_lower or "not found" in err_lower:
                        print(f"[MODEL FALLBACK] Model '{model_name}' 404 Not Found. Trying next model candidate...")
                        continue  # Try next model candidate on same key!

                    # 3. Handle 429 Rate Limit / Quota Exhausted / Invalid Key
                    if "429" in err_str or "resource_exhausted" in err_lower or "quota" in err_lower or "api_key_invalid" in err_lower:
                        print(f"[API ROTATION WARNING] Key #{key_idx + 1} ({masked_key}) quota limit: {err_str}. Auto-rolling to next key...")
                        time.sleep(delay)
                        break  # Switch to next key!
                    else:
                        print(f"[API WARNING] Key #{key_idx + 1} error on '{model_name}': {err_str}. Trying fallback model candidate...")
                        time.sleep(1.0)
                        continue  # Try next model candidate!

        del img_bytes
        gc.collect()
        raise last_error or RuntimeError("Gagal memproses metadata setelah mencoba seluruh daftar API Key dan Model.")


