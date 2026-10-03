# StockMeta Studio by BRKH STUDIO (v1.0.0)

> **Microstock Metadata Curation Studio & Direct Binary IPTC/EXIF/XMP Injector by BRKH STUDIO**

StockMeta Studio by BRKH STUDIO adalah aplikasi desktop mandiri berbasis Python (`pywebview`) dan UI Web modern yang dirancang untuk mengotomatisasi analisis visual aset microstock, pembuat judul komersial (60-90 karakter), deskripsi, serta penulisan metadata biner langsung ke file gambar lokal (JPG EXIF/IPTC) dan file vektor (EPS XMP).

---

## 📥 Link Unduhan Aplikasi (v1.0.0)

* 🚀 **Download Executable (.exe)**: [StockMetaStudio.exe via Google Drive](https://drive.google.com/uc?export=download&id=1QP2BFVeqrFIhvatQFSoqRa69q0uipKm9)
* 👁️ **Link Mirror Google Drive**: [Buka di Google Drive](https://drive.google.com/file/d/1QP2BFVeqrFIhvatQFSoqRa69q0uipKm9/view?usp=drive_link)

---

## ✨ Fitur Unggulan Versi 1.0.0

* 🤖 **Gemini 2.5 / 1.5 / 3.8 / 2.0 Flash Vision AI:** Analisis gambar cerdas berbasis model AI terbaru dari Google dengan fitur **503 Instant Fallback** otomatis saat server sibuk.
* 🚀 **In-App Auto-Update Mandiri (`core/updater.py`):** Pengecekan dan pembaruan aplikasi otomatis di background tanpa memerlukan backend server kustom.
* 🔒 **API Key Sensor & Eye Toggle:** Melindungi kunci API Gemini di menu Pengaturan dengan sensor bintang (`*`) dan tombol toggle ikon mata (*Lihat Key* / *Sembunyikan*).
* 🎯 **Niche Category / Theme Selector & Uji Sampel Tema:** Pilihan kategori spesifik (Text Effect, Vector, UI/UX, Icon, Isometric, Poster, 3D, Pattern, Character, Logo, Background) untuk memandu AI.
* 📈 **Riset Buyer Demand & Single-Word High-CTR:** Meriset kueri pencarian pembeli real-time dari Google & Bing dan menyaring kata kunci tunggal bernilai jual tinggi.
* 🎯 **Commercial Scoring & Adobe Stock 10-First Rule:** Menilai skor komersial kata kunci dan menaruh 10 tag komersial utama di urutan awal.
* 🔄 **Multi-API Key Auto-Rolling (Max 30 Key):** Mendukung hingga 30 API key dengan rotasi otomatis dan failover saat terkena limit quota 429.
* 📟 **Realtime Console Log & Red Error Alert:** Pemantauan alur pemrosesan live lengkap dengan highlight merah jika ada kegagalan.
* 🏷️ **Direct EXIF & IPTC Injection:** Menulis metadata langsung ke Windows Details Tab (`Title`, `Subject`, `Tags`) dan header IPTC biner tanpa mengunci file.
* 🎨 **Automatic Matching EPS Vector Injection:** Menginjeksikan metadata XMP secara otomatis ke file `.eps` pasangan.

---

## 📁 Struktur Dokumentasi

* 🤖 [`doc/agents.md`](./doc/agents.md): Peta Utama Arsitektur, Fungsi & Alur Data untuk AI Agent
* 📐 [`doc/architecture.md`](./doc/architecture.md): Arsitektur Perangkat Lunak & Diagram Sistem
* 📖 [`doc/documentation.md`](./doc/documentation.md): Panduan Pengguna & Pengembang Lengkap
* 🚀 [`GITHUB_RELEASE.md`](./GITHUB_RELEASE.md): Form Rilis Resmi GitHub v1.0.0
* ⚖️ [`doc/LICENSE`](./doc/LICENSE): Lisensi Perangkat Lunak MIT (BRKH STUDIO)


---

## 🚀 Cara Menjalankan

### Opsi A: Menggunakan Executable Mandiri (.exe)
1. Unduh `StockMetaStudio.exe` dari [Link Google Drive](https://drive.google.com/uc?export=download&id=1QP2BFVeqrFIhvatQFSoqRa69q0uipKm9).
2. Jalankan file `StockMetaStudio.exe` langsung di OS Windows tanpa instalasi Python.

### Opsi B: Mengembangkan via Python Source Code
```bash
# 1. Install Dependensi
pip install pywebview google-genai iptcinfo3 Pillow pyinstaller httpx packaging

# 2. Jalankan Aplikasi
python main.py

# 3. Build Standalone EXE
python build_exe.py
```
