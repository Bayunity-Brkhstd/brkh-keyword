# 🚀 StockMeta Studio v1.0.0 - Official Windows Release

**StockMeta Studio** adalah aplikasi desktop Windows canggih berbasis Python & PyWebView yang didesain khusus untuk kontributor Microstock (Adobe Stock, Shutterstock, Freepik, Getty Images, dsb). Aplikasi ini memanfaatkan kekuatan AI Gemini Vision dengan fitur auto-rolling key rotation & penulisan IPTC/EXIF metadata biner secara langsung ke file gambar (JPG) dan file vektor pendamping (EPS).

---

## 📁 Repository & Unduhan Google Drive Utama

- 📂 **Folder Utama Rilis Google Drive**: [Buka Folder Master StockMeta Studio](https://drive.google.com/drive/folders/14724m0TmLfqovKGj26beYAigJTfuE6Zo?usp=drive_link)
- 🚀 **Direct Download File `.exe` (v1.0.0)**: [Unduh StockMetaStudio.exe v1.0.0](https://drive.google.com/uc?export=download&id=1QP2BFVeqrFIhvatQFSoqRa69q0uipKm9)

---

## 🌟 Fitur Unggulan Versi 1.0.0

- 🤖 **AI Vision Metadata Curation**: Ekstraksi Judul, Deskripsi, dan 35–45 Kata Kunci presisi menggunakan model Gemini Vision.
- 🔄 **Auto-Rolling Multi-API Key**: Mendukung hingga 30 API Keys Gemini dengan penanganan otomatis batasan kuota HTTP 429.
- 🔒 **API Key Sensor & Masking**: Melindungi kode API Key pengguna dengan fitur sensor bintang (`*`) dan tombol toggle ikon mata (*Lihat/Sembunyikan*).
- 🚀 **In-App Auto-Update Mandiri**: Fitur pemeriksa & pemasang pembaruan otomatis tanpa backend server kustom (`core/updater.py`).
- 📸 **Direct IPTC & EPS Vector Injector**: Penulisan biner langsung ke header EXIF/IPTC file gambar dan file vektor EPS tanpa perlu software pihak ketiga.
- 📊 **Niche Theme Selector & Multi-Platform Presets**: Optimasi gaya untuk Adobe Stock, Shutterstock, Freepik, Getty Images, dan kategori produk spesifik.

---

## 📦 Skema Folder & Pembaruan Versi (v1.0.x)

Setiap rilis pembaruan versi (misal `v1.0.0`, `v1.0.1`, `v1.0.2`, dst.) disimpan di folder versi masing-masing di dalam [Google Drive Utama](https://drive.google.com/drive/folders/14724m0TmLfqovKGj26beYAigJTfuE6Zo?usp=drive_link):

| Versi Rilis | Lokasi Folder Google Drive | File Biner Executable |
| :--- | :--- | :--- |
| **v1.0.0** | `stock meta studio/v1.0.0/` | `StockMetaStudio.exe` |
| **v1.0.1** | `stock meta studio/v1.0.1/` | `StockMetaStudio.exe` |
| **v1.0.2** | `stock meta studio/v1.0.2/` | `StockMetaStudio.exe` |
| **v1.0.3** | `stock meta studio/v1.0.3/` | `StockMetaStudio.exe` |

---

## 🛠️ Panduan Instalasi & Penggunaan

1. Unduh file **`StockMetaStudio.exe`** dari folder versi terbaru di Google Drive.
2. Jalankan `StockMetaStudio.exe` di OS Windows (Windows 10/11 64-bit).
3. Buka menu **Pengaturan** untuk memasukkan **Gemini API Key**.
4. Klik **Simpan Pengaturan** dan aplikasi siap digunakan!
