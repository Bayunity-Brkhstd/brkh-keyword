# Technical Documentation & User Guide: StockMeta Studio by BRKH STUDIO (v1.0.3)

Panduan lengkap instalasi, arsitektur kode, modul SEO, fitur unggulan, dan petunjuk penggunaan aplikasi desktop StockMeta Studio by BRKH STUDIO versi 1.0.3.

---

## 1. Prasyarat Sistem & Dependensi

* **OS:** Windows 10 / 11 (64-bit).
* **Python:** Versi 3.10 atau lebih baru (opsional jika menggunakan file standalone `StockMetaStudio.exe`).
* **Google Gemini API Key:** Kunci API dari Google AI Studio.
* **Link Unduhan Resmi (.exe v1.0.3):** [Download StockMetaStudio.exe v1.0.3 via Google Drive](https://drive.google.com/uc?export=download&id=1vhbDJA1fUnT8nejoQK0pRHLGW3FEAjz5)
* **Master Folder Google Drive:** [Buka Folder Master StockMeta Studio](https://drive.google.com/drive/folders/14724m0TmLfqovKGj26beYAigJTfuE6Zo?usp=drive_link)

### Instalasi Dependensi Python (Development Mode)
```bash
pip install pywebview google-genai iptcinfo3 Pillow pyinstaller httpx packaging
```

---

## 2. Struktur Berkas Proyek

```text
StockMetaStudio/
├── core/
│   ├── __init__.py
│   ├── path_utils.py          # Normalisasi Path & Windows MAX_PATH Handling
│   ├── updater.py             # In-App Auto-Update System & SemVer Checker (v1.0.3)
│   ├── memory_curator.py      # Gemini Vision Curator (Model 2.5 & 3.x), 503 Failover & Multi-Key Rotation
│   ├── buyer_demand.py        # Realtime Buyer Search Query Engine (Google, Bing, DDG)
│   ├── keyword_analyzer.py    # Commercial Intent Scoring (0-100) & Adobe Stock 10-First Rule
│   ├── keyword_cluster.py     # Semantic Tier Clustering & Batch Series Deduplicator
│   ├── keyword_serp.py        # SERP Research & Trend Signals (PAA & Related Searches)
│   └── iptc_injector.py       # Injeksi Memory-Buffered EXIF, IPTC & EPS XMP Metadata
├── public/
│   ├── icon.jpg               # Logo aplikasi utama
│   ├── icon.ico               # Icon executable Windows
│   └── icon.png               # Icon PNG
├── doc/
│   ├── agents.md              # Peta Arsitektur Utama untuk AI Agent v1.0.3
│   ├── architecture.md        # Dokumen Arsitektur Sistem v1.0.3
│   ├── documentation.md       # Panduan Teknis & Dokumentasi Pengguna v1.0.3
│   ├── readme.md              # Ringkasan Proyek
│   └── LICENSE                # Lisensi MIT (BRKH STUDIO)
├── GITHUB_RELEASE.md          # Form & Catatan Rilis Resmi GitHub v1.0.3
├── version.json               # Manifest Versi & Link Update Publik v1.0.3
├── index.html                 # Antarmuka Modern (Tailwind CSS, FontAwesome, Modals)
├── style.css                  # Custom CSS & Terminal Log Animations
├── script.js                  # Logika Antarmuka JavaScript & Realtime Console Logger
├── main.py                    # PyWebView Host, Bridge IPC & Full SEO Pipeline
└── build_exe.py               # Script Kompilasi PyInstaller Standalone
```
