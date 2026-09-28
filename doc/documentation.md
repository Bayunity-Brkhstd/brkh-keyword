# Technical Documentation & User Guide: StockMeta Studio by BRKH STUDIO

Panduan lengkap instalasi, arsitektur kode, modul SEO, fitur unggulan, dan petunjuk penggunaan aplikasi desktop StockMeta Studio by BRKH STUDIO.

---

## 1. Prasyarat Sistem & Dependensi

* **OS:** Windows 10 / 11 (64-bit).
* **Python:** Versi 3.10 atau lebih baru (opsional jika menggunakan file standalone `StockMetaStudio.exe`).
* **Google Gemini API Key:** Kunci API (Gratis atau Berbayar) dari Google AI Studio.

### Instalasi Dependensi Python (Development Mode)
```bash
pip install pywebview google-genai iptcinfo3 Pillow pyinstaller httpx
```

---

## 2. Struktur Berkas Proyek

```text
StockMetaStudio/
├── core/
│   ├── __init__.py
│   ├── path_utils.py          # Normalisasi Path & Windows MAX_PATH Handling
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
│   ├── architecture.md        # Dokumen Arsitektur Sistem
│   ├── documentation.md       # Panduan Teknis & Dokumentasi Pengguna
│   ├── README.md              # Ringkasan Proyek
│   └── LICENSE                # Lisensi MIT (BRKH STUDIO)
├── index.html                 # Antarmuka Modern (Tailwind CSS, FontAwesome, Modals)
├── style.css                  # Custom CSS & Terminal Log Animations
├── script.js                  # Logika Antarmuka JavaScript & Realtime Console Logger
├── main.py                    # PyWebView Host, Bridge IPC & Full SEO Pipeline
└── build_exe.py               # Script Kompilasi PyInstaller Standalone
```

---

## 3. Fitur Utama

### A. Realtime Console Log Console & Red Error Alert
- **Terminal Log Live:** Menampilkan seluruh alur eksekusi sistem secara real-time (AI Vision, Buyer Demand, Scoring, IPTC Injection).
- **Notifikasi Error Merah:** Jika terjadi hambatan pada jaringan atau file, baris log ditampilkan dalam warna merah gelap dengan tag `FAILED` berkedip dan status badge `SYSTEM ERROR!`.
- **Aksi Log:** Filter log (`Semua`, `Error`, `Sukses`), tombol *Clear Log*, dan *Salin Log* ke clipboard.

### B. Modul Riset Buyer Demand & Microstock SEO
- **Realtime Buyer Suggestions (`buyer_demand.py`):** Meriset kueri pencarian komersial nyata dari Google & Bing.
- **Single-Word High-CTR Filtering:** Memastikan seluruh kata kunci yang disuntikkan berupa kata tunggal berkadar jual tinggi tanpa kata sampah.
- **Commercial Intent Scorer & Adobe Stock 10-First (`keyword_analyzer.py`):** Menilai skor komersial (0-100), mendemosi kata pasif visual (`white`, `isolated`, `background`), dan menaruh 10 tag komersial terbaik di urutan awal.

### C. Penanganan Error Server 503 & Rotasi Multi-API Key
- **Instant 503 High Demand Fallback:** Jika server Google sibuk pada satu model, sistem otomatis beralih seketika ke model kandidat berikutnya (`gemini-2.5-flash`, `gemini-1.5-flash`, dst.).
- **Auto-Rolling Up to 30 API Keys:** Mendukung hingga 30 API key dengan rotasi *Round-Robin* dan penanganan *Quota Limit (429)* otomatis.

### D. Niche Category / Theme Selector
- **Kategori Tema AI Custom:** Dropdown pilihan tema (Text Effect, Vector Illustration, UI/UX Component, Icon Set, Isometric 3D, Social Media Poster, 3D Render, Seamless Pattern, Character Mascot, Logo/Badge, Background Texture) yang langsung memberi instruksi khusus ke Gemini AI agar kurasi metadata fokus pada karakteristik visual tema tersebut.

### E. Injeksi Metadata Biner Fisik (JPG EXIF/IPTC + Vector EPS XMP)
- **Windows Details Tab:** `XPTitle`, `XPSubject`, `XPKeywords` tertulis langsung ke header EXIF tanpa mengunci file (`WinError 32` safe).
- **IPTC Binary Header:** `ObjectName`, `Caption/Abstract`, `Keywords` via `iptcinfo3`.
- **EPS XMP Vector Injection:** Menginjeksikan metadata XMP secara otomatis ke file `.eps` pasangan di folder yang sama.

---

## 4. Panduan Penggunaan Antarmuka

1. **Konfigurasi API Key:**
   - Buka menu **Pengaturan** (Icon Slider di top-right).
   - Unggah file `.txt` atau tempelkan daftar API Key Gemini (1 key per baris).
2. **Pilih Kategori Tema & Preset:**
   - Pilih tema khusus pada dropdown **Kategori** (misal: *Text Effect & Typography*, *Desain Isometrik 3D*, dll) agar AI fokus ke karakteristik aset Anda.
   - Sesuaikan target platform pada dropdown **Preset** (Universal, Adobe Stock, Shutterstock, Freepik, Getty).
3. **Memuat Gambar:**
   - Tarik file JPG ke area dropzone atau pilih file melalui file picker bawaan Windows.
4. **Jalankan Batch:**
   - Klik **Mulai Batch Processing**. Pantau alurnya secara live lewat tombol **Console Log**.
5. **Lisensi & FAQ:**
   - Klik tombol **Lisensi** untuk melihat hak cipta MIT BRKH STUDIO.
   - Klik tombol **FAQ** untuk membuka panduan cepat dan pertanyaan sering diajukan.

---

## 5. Kompilasi Executable (.exe)

```bash
python build_exe.py
```
Executable mandiri akan dibuat di folder `dist/StockMetaStudio.exe`.
