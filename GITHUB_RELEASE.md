# 🚀 StockMeta Studio v1.0.0 - Official Windows Release

**StockMeta Studio** adalah aplikasi desktop Windows canggih berbasis Python & PyWebView yang didesain khusus untuk kontributor Microstock (Adobe Stock, Shutterstock, Freepik, Getty Images, dsb). Aplikasi ini memanfaatkan kekuatan AI Gemini Vision dengan fitur auto-rolling key rotation & penulisan IPTC/EXIF metadata biner secara langsung ke file gambar (JPG) dan file vektor pendamping (EPS).

---

## 🌟 Fitur Unggulan Versi 1.0.0

- 🤖 **AI Vision Metadata Curation**: Ekstraksi Judul, Deskripsi, dan 35–45 Kata Kunci presisi menggunakan model Gemini Vision.
- 🔄 **Auto-Rolling Multi-API Key**: Mendukung hingga 30 API Keys Gemini dengan penanganan otomatis batasan kuota HTTP 429.
- 🔒 **API Key Sensor & Masking**: Melindungi kode API Key pengguna dengan fitur sensor bintang (`*`) dan tombol toggle ikon mata (*Lihat/Sembunyikan*).
- 🚀 **In-App Auto-Update Mandiri**: Fitur pemeriksa & pemasang pembaruan otomatis tanpa backend server kustom (menggunakan GitHub Releases / Raw JSON).
- 📸 **Direct IPTC & EPS Vector Injector**: Penulisan biner langsung ke header EXIF/IPTC file gambar dan file vektor EPS tanpa perlu software pihak ketiga.
- 📊 **Niche Theme Selector & Multi-Platform Presets**: Optimasi gaya untuk Adobe Stock, Shutterstock, Freepik, Getty Images, dan kategori produk spesifik (3D, Text Effect, UI/UX, dsb).

---

## 📦 Aset Rilis (Release Assets)

| File / Aset | Ukuran Paket | Deskripsi |
| :--- | :--- | :--- |
| **`StockMetaStudio.exe`** | `dist/StockMetaStudio.exe` | Binary Portabel Windows (Single Executable Standalone, Tanpa Instalasi) |
| **`version.json`** | ~1 KB | File manifest pembaruan versi mandiri |

---

## 📋 Catatan Rilis & Log Perubahan (Changelog)

### Added
- [NEW] Sistem In-App Auto-Update mandiri (`core/updater.py`) yang terintegrasi dengan PyWebView bridge.
- [NEW] Fitur sensor teks API Key di Modal Pengaturan beserta tombol toggle ikon mata.
- [NEW] Komponen Banner Pembaruan UI modern di Dashboard Utama dengan animasi progress bar.

### Improved
- [IMP] Penanganan concurrency worker (2-3 worker) untuk mencegah kelebihan batas RPM Gemini API.
- [IMP] Tampilan preview thumbnail base64 hemat RAM.

---

## 🛠️ Panduan Instalasi & Penggunaan

1. Unduh file **`StockMetaStudio.exe`** dari tabel *Assets* di bawah.
2. Jalankan `StockMetaStudio.exe` di OS Windows (Windows 10/11 64-bit).
3. Buka menu **Pengaturan** (ikon gerigi/slider di pojok kanan atas) untuk memasukkan **Gemini API Key**.
4. Klik **Simpan Pengaturan** dan aplikasi siap digunakan untuk proses batch metadata!

---

> 💡 **Informasi Pengembang**: Dikembangkan oleh **BRKH STUDIO** untuk kebutuhan workflow kontributor microstock profesional.
