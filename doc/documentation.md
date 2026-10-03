# Technical Documentation & User Guide: StockMeta Studio by BRKH STUDIO (v1.0.0)

Panduan lengkap instalasi, arsitektur kode, modul SEO, fitur unggulan, dan petunjuk penggunaan aplikasi desktop StockMeta Studio by BRKH STUDIO versi 1.0.0.

---

## 1. Prasyarat Sistem & Dependensi

* **OS:** Windows 10 / 11 (64-bit).
* **Python:** Versi 3.10 atau lebih baru (opsional jika menggunakan file standalone `StockMetaStudio.exe`).
* **Google Gemini API Key:** Kunci API dari Google AI Studio.
* **Link Unduhan Resmi (.exe):** [Download StockMetaStudio.exe via Google Drive](https://drive.google.com/uc?export=download&id=1QP2BFVeqrFIhvatQFSoqRa69q0uipKm9)

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
│   ├── updater.py             # In-App Auto-Update System & SemVer Checker
│   ├── memory_curator.py      # Gemini Vision Curator, 503 Failover & Multi-Key Rotation
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
│   ├── architecture.md        # Dokumen Arsitektur Sistem v1.0.0
│   ├── documentation.md       # Panduan Teknis & Dokumentasi Pengguna v1.0.0
│   ├── readme.md              # Ringkasan Proyek
│   └── LICENSE                # Lisensi MIT (BRKH STUDIO)
├── GITHUB_RELEASE.md          # Form & Catatan Rilis Resmi GitHub v1.0.0
├── version.json               # Manifest Versi & Link Update Publik
├── index.html                 # Antarmuka Modern (Tailwind CSS, FontAwesome, Modals)
├── style.css                  # Custom CSS & Terminal Log Animations
├── script.js                  # Logika Antarmuka JavaScript & Realtime Console Logger
├── main.py                    # PyWebView Host, Bridge IPC & Full SEO Pipeline
└── build_exe.py               # Script Kompilasi PyInstaller Standalone
```

---

## 3. Fitur Utama Versi 1.0.0

### A. System Auto-Update Mandiri (`core/updater.py`)
- **Pengecekan versi non-blocking:** Menggunakan `httpx` dengan timeout 5 detik agar startup aplikasi tidak pernah lag.
- **Detached Windows Runner (`update_runner.bat`):** Mengunduh paket biner baru dan mengeksekusi launcher sementara yang menunggu proses lama berhenti sebelum menimpa executable, mengatasi hambatan Windows File Locking (`WinError 32`).

### B. Security & API Key Sensor Masking
- **Sensor Bintang Default (`*`):** API Key pada textarea dan chip preview secara otomatis disensor demi keamanan privasi pengguna.
- **Toggle Icon Mata (`Lihat Key` / `Sembunyikan`):** Pengguna dapat menekan tombol ikon mata untuk melihat atau menyembunyikan API Key sewaktu-waktu.

### C. Realtime Console Log Console & Red Error Alert
- **Terminal Log Live:** Menampilkan seluruh alur eksekusi sistem secara real-time (AI Vision, Buyer Demand, Scoring, IPTC Injection).
- **Notifikasi Error Merah:** Baris log error ditampilkan dalam warna merah dengan tag `FAILED` berkedip dan status badge `SYSTEM ERROR!`.

### D. Modul Riset Buyer Demand & Microstock SEO
- **Realtime Buyer Suggestions (`buyer_demand.py`):** Meriset kueri pencarian komersial nyata dari Google & Bing.
- **Single-Word High-CTR Filtering:** Memastikan seluruh kata kunci berupa kata tunggal berkadar jual tinggi.
- **Commercial Intent Scorer & Adobe Stock 10-First (`keyword_analyzer.py`):** Menilai skor komersial (0-100), mendemosi kata pasif visual, dan menaruh 10 tag komersial terbaik di urutan awal.

### E. Penanganan Server 503 & Rotasi Multi-API Key
- **Instant 503 Failover:** Otomatis beralih seketika ke model kandidat berikutnya (`gemini-2.5-flash`, `gemini-1.5-flash`, dst.) saat server sibuk.
- **Auto-Rolling Up to 30 API Keys:** Mendukung hingga 30 API key dengan rotasi *Round-Robin* dan penanganan *Quota Limit (429)* otomatis.

### F. Injeksi Metadata Biner Fisik (JPG EXIF/IPTC + Vector EPS XMP)
- **Windows Details Tab:** `XPTitle`, `XPSubject`, `XPKeywords` tertulis langsung ke header EXIF.
- **IPTC Binary Header:** `ObjectName`, `Caption/Abstract`, `Keywords` via `iptcinfo3`.
- **EPS XMP Vector Injection:** Menginjeksikan metadata XMP secara otomatis ke file `.eps` pasangan di folder yang sama.

---

## 4. Panduan Penggunaan Antarmuka

1. **Konfigurasi API Key:**
   - Buka menu **Pengaturan** (Icon Slider di top-right).
   - Masukkan API Key Gemini. Klik tombol ikon mata untuk melihat/menyembunyikan key.
2. **Pilihan Kategori Tema & Preset:**
   - Pilih tema khusus pada dropdown **Kategori** (misal: *Text Effect & Typography*, *Desain Isometrik 3D*, dll).
   - Sesuaikan target platform pada dropdown **Preset** (Universal, Adobe Stock, Shutterstock, Freepik, Getty).
3. **Batch Processing:**
   - Masukkan gambar JPG ke dropzone.
   - Klik **Mulai Batch Processing** dan pantau alurnya via **Console Log**.

---

## 5. Kompilasi Executable (.exe)

```bash
python build_exe.py
```
Executable mandiri akan dibuat di folder `dist/StockMetaStudio.exe`.
