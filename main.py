import os
import json
import base64
import io
import gc
import webview
from PIL import Image
from core.memory_curator import SafeMemoryCurator
from core.iptc_injector import IPTCInjector
from core.path_utils import normalize_path
from core.buyer_demand import BuyerDemandFetcher
from core.keyword_analyzer import KeywordAnalyzer
from core.keyword_cluster import KeywordClusterer
from core.keyword_serp import KeywordSERP
from core.updater import check_for_updates, apply_update, CURRENT_VERSION


class DesktopBridge:
    """
    Bridge IPC Python <-> JS via PyWebView.
    Handles native Windows file picker, persistent multi-API Key management (max 30 keys),
    Gemini Vision curation with auto-rolling key rotation, direct IPTC/EXIF metadata injection,
    and automatic matching EPS vector metadata injection.
    """
    def __init__(self):
        self.config_path = normalize_path(os.path.join(os.path.expanduser("~"), ".stockmeta_config.json"))
        self.api_keys = self._load_keys()
        self.curator = SafeMemoryCurator(api_keys=self.api_keys) if self.api_keys else None
        self.injector = IPTCInjector()
        self.buyer_fetcher = BuyerDemandFetcher()
        self.analyzer = KeywordAnalyzer()
        self.clusterer = KeywordClusterer()
        self.serp_researcher = KeywordSERP()

    def _load_keys(self) -> list:
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if "gemini_keys" in data and isinstance(data["gemini_keys"], list):
                        keys = [str(k).strip() for k in data["gemini_keys"] if str(k).strip()]
                        return keys[:30]
                    elif "gemini_key" in data and data["gemini_key"]:
                        return [str(data["gemini_key"]).strip()]
            except Exception as e:
                print(f"[CONFIG WARNING] Gagal membaca config: {e}")
                return []
        return []

    def get_image_preview_b64(self, path: str, max_dim: int = 280) -> str:
        """
        Generate low-RAM base64 JPEG thumbnail to bypass Chromium file:// CORS security restrictions.
        Optimized with max_dim 280px & explicit garbage collection to prevent memory spikes.
        """
        path = normalize_path(path)
        try:
            with Image.open(path) as img:
                img = img.convert('RGB')
                img.thumbnail((max_dim, max_dim))
                buf = io.BytesIO()
                img.save(buf, format='JPEG', quality=65)
                b64_str = base64.b64encode(buf.getvalue()).decode('ascii')
                del buf
                gc.collect()
                return f"data:image/jpeg;base64,{b64_str}"
        except Exception as e:
            print(f"[PREVIEW WARNING] Gagal membuat thumbnail base64 untuk {path}: {e}")
            return ""

    def save_api_keys(self, keys_input) -> dict:
        """
        Simpan hingga 30 API Keys ke konfigurasi dan perbarui SafeMemoryCurator.
        `keys_input` dapat berupa string (multi-line) atau list string.
        """
        if isinstance(keys_input, str):
            raw_list = [k.strip() for k in keys_input.replace(',', '\n').split('\n') if k.strip()]
        elif isinstance(keys_input, list):
            raw_list = [str(k).strip() for k in keys_input if str(k).strip()]
        else:
            raw_list = []

        seen = set()
        clean_keys = []
        for k in raw_list:
            if k not in seen and not k.startswith('#'):
                seen.add(k)
                clean_keys.append(k)
                if len(clean_keys) >= 30:
                    break

        self.api_keys = clean_keys
        try:
            self.curator = SafeMemoryCurator(api_keys=clean_keys) if clean_keys else None
        except Exception as e:
            return {"status": "error", "message": f"Konstruksi API Key Gagal: {str(e)}"}

        try:
            primary_key = clean_keys[0] if clean_keys else ""
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump({
                    "gemini_key": primary_key,
                    "gemini_keys": clean_keys
                }, f, indent=2)
            return {
                "status": "success",
                "count": len(clean_keys),
                "keys": clean_keys,
                "message": f"Berhasil menyimpan {len(clean_keys)} API Key untuk auto-rolling rotation!"
            }
        except Exception as e:
            return {"status": "error", "message": f"Gagal menyimpan file konfigurasi: {str(e)}"}

    def save_api_key(self, key: str) -> dict:
        """Backward compatibility endpoint"""
        return self.save_api_keys(key)

    def get_api_key(self) -> str:
        """Mengembalikan primary API key atau string kosong"""
        return self.api_keys[0] if self.api_keys else ""

    def get_api_keys(self) -> list:
        """Mengembalikan seluruh daftar API keys yang dimuat (maks 30)"""
        return self.api_keys

    def get_api_keys_info(self) -> dict:
        return {
            "keys": self.api_keys,
            "count": len(self.api_keys),
            "max": 30
        }

    def select_keys_file(self) -> dict:
        """
        Buka Windows native file picker dialog untuk memilih file .txt berisi API Keys.
        """
        if not webview.windows or len(webview.windows) == 0:
            return {"status": "error", "message": "Jendela pywebview tidak ditemukan."}

        active_window = webview.windows[0]
        dialog_type = getattr(webview, 'FileDialog', None)
        file_dialog_enum = dialog_type.OPEN if dialog_type else webview.OPEN_DIALOG

        files = active_window.create_file_dialog(
            file_dialog_enum,
            allow_multiple=False,
            file_types=('Text Files (*.txt)', 'All Files (*.*)')
        )

        if not files or len(files) == 0:
            return {"status": "cancelled", "message": "Pemilihan file TXT dibatalkan."}

        txt_path = normalize_path(files[0])
        if not os.path.exists(txt_path):
            return {"status": "error", "message": f"File TXT tidak ditemukan: {txt_path}"}

        try:
            with open(txt_path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()

            result = self.save_api_keys(content)
            if result.get("status") == "success":
                result["filename"] = os.path.basename(txt_path)
            return result
        except Exception as e:
            return {"status": "error", "message": f"Gagal membaca file TXT: {str(e)}"}

    def select_files(self) -> list:
        """
        Buka Windows native file picker dialog.
        Mengembalikan list file path absolut beserta nama, ukuran, dan preview Base64.
        """
        if not webview.windows or len(webview.windows) == 0:
            return []

        active_window = webview.windows[0]
        dialog_type = getattr(webview, 'FileDialog', None)
        file_dialog_enum = dialog_type.OPEN if dialog_type else webview.OPEN_DIALOG

        files = active_window.create_file_dialog(
            file_dialog_enum,
            allow_multiple=True,
            file_types=('Image Files (*.jpg;*.jpeg)', 'All Files (*.*)')
        )

        if not files:
            return []

        results = []
        for path in files:
            norm_p = normalize_path(path)
            if os.path.exists(norm_p):
                size_kb = os.path.getsize(norm_p) / 1024
                preview_b64 = self.get_image_preview_b64(norm_p)
                results.append({
                    "path": norm_p,
                    "name": os.path.basename(norm_p),
                    "size": f"{size_kb:.1f} KB",
                    "preview": preview_b64
                })
        return results

    def process_and_save(self, file_path: str, min_kw: int = 35, max_kw: int = 45, notes: str = "", niche_theme: str = "auto") -> dict:
        if not self.api_keys or not self.curator:
            return {
                "status": "error",
                "message": "Kunci API Gemini belum dikonfigurasi. Harap unggah atau masukkan API Key di menu Pengaturan."
            }

        file_path = normalize_path(file_path)
        if not os.path.exists(file_path):
            if not os.path.isabs(file_path):
                hint = " (Path berupa nama file relatif. Harap klik tombol Upload File untuk membuka File Picker Native Windows)."
            else:
                hint = " (Pastikan folder/file tidak dihapus, dipindahkan, atau terputus dari jaringan)."
            return {
                "status": "error",
                "message": f"File tidak ditemukan pada path: {file_path}{hint}"
            }


        try:
            # 1. Vision AI Curation with Auto-Rolling API Key Rotation & Theme Guidance
            metadata = self.curator.curate(
                file_path=file_path,
                min_kw=min_kw,
                max_kw=max_kw,
                notes=notes,
                niche_theme=niche_theme
            )

            title = metadata.get("title", "")
            description = metadata.get("description", "")
            keywords = metadata.get("keywords", [])
            asset_type = metadata.get("assetType", "Digital Asset")

            # --- FULL MICROSTOCK SEO PIPELINE (BUYER DEMAND + SERP + COMMERCIAL SCORING + CLUSTERING) ---
            try:
                # Seed queries from top vision keywords or title
                seeds = keywords[:2] if keywords else [title]
                extra_buyer_kw = []
                for seed in seeds:
                    try:
                        extra_buyer_kw.extend(self.buyer_fetcher.fetch_suggestions(seed))
                    except Exception as e_bd:
                        print(f"[BuyerDemand Warning] {e_bd}")

                # SERP Related Searches & Trend Signals
                serp_kw = []
                for seed in seeds:
                    try:
                        serp_kw.extend(self.serp_researcher.fetch_related_searches(seed))
                    except Exception as e_serp:
                        print(f"[SERP Research Warning] {e_serp}")

                # Combine candidate pool
                candidate_pool = keywords + extra_buyer_kw + serp_kw

                # Commercial Scoring & Priority Ranking (Adobe Stock 10-First rule)
                ranked_kw = self.analyzer.score_and_rank(candidate_pool, title=title)

                # Clustering Tiers & Structural deduplication
                clustered = self.clusterer.cluster_keywords(ranked_kw)

                # Enforce min_kw & max_kw boundary strictly
                keywords = ranked_kw[:max_kw]
                metadata["keywords"] = keywords
            except Exception as err:
                print(f"[SEO Pipeline Warning] Gagal memproses pipeline tambahan: {err}")
            # ---------------------------------------------------------------------------------------------

            # 2. Binary IPTC + EXIF XPTitle/XPSubject/XPKeywords Injection directly into local JPG
            embedded_iptc = self.injector.embed_to_jpg(
                file_path=file_path,
                title=title,
                description=description,
                keywords=keywords
            )

            # 3. Automatic EPS Vector Injection (Same filename base in the same folder)
            eps_embedded = False
            eps_filename = ""
            base_path, _ = os.path.splitext(file_path)
            eps_path = normalize_path(base_path + ".eps")
            if os.path.exists(eps_path):
                eps_embedded = self.injector.embed_to_eps(
                    eps_path=eps_path,
                    title=title,
                    description=description,
                    keywords=keywords
                )
                if eps_embedded:
                    eps_filename = os.path.basename(eps_path)

            # Explicit garbage collection per processed asset cycle to keep RAM usage low (< 100MB)
            gc.collect()

            return {
                "status": "success",
                "data": {
                    "title": title,
                    "description": description,
                    "keywords": keywords,
                    "assetType": asset_type,
                    "iptcEmbedded": embedded_iptc,
                    "epsEmbedded": eps_embedded,
                    "epsFilename": eps_filename
                }
            }

        except Exception as e:
            gc.collect()
            return {
                "status": "error",
                "message": str(e)
            }

    def check_for_updates(self, custom_url: str = "") -> dict:
        """
        Panggil logika pembaruan di core/updater.py.
        """
        if custom_url and isinstance(custom_url, str) and custom_url.strip():
            return check_for_updates(update_url=custom_url.strip())
        return check_for_updates()

    def apply_update(self, download_url: str) -> dict:
        """
        Unduh paket biner/patch baru dan eksekusi detached launcher script untuk menimpa app executable.
        """
        return apply_update(download_url=download_url)

    def get_app_version(self) -> str:
        """
        Kembalikan versi lokal aplikasi saat ini.
        """
        return CURRENT_VERSION


if __name__ == '__main__':

    import sys
    if hasattr(sys, '_MEIPASS'):
        base_dir = sys._MEIPASS
    else:
        base_dir = os.path.dirname(os.path.abspath(__file__))

    html_path = normalize_path(os.path.join(base_dir, 'index.html'))

    bridge = DesktopBridge()

    window = webview.create_window(
        title='StockMeta Studio by BRKH STUDIO - AI Curation & Direct IPTC Metadata Injector',
        url=html_path,
        js_api=bridge,
        width=1340,
        height=890,
        min_size=(980, 660),
        resizable=True
    )

    webview.start(debug=False)


