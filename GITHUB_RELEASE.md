# 🚀 StockMeta Studio v1.0.3 - Official Release

**StockMeta Studio** adalah aplikasi desktop Windows canggih berbasis Python & PyWebView yang didesain khusus untuk kontributor Microstock (Adobe Stock, Shutterstock, Freepik, Getty Images, dsb). Aplikasi ini memanfaatkan kekuatan AI Gemini Vision (Model 2.5 & 3.x) dengan fitur auto-rolling key rotation & penulisan IPTC/EXIF metadata biner secara langsung ke file gambar (JPG) dan file vektor pendamping (EPS).

---

## 📥 Link Unduhan v1.0.3 & Google Drive Utama

- 📂 **Folder Utama Rilis Google Drive**: [Buka Folder Master StockMeta Studio](https://drive.google.com/drive/folders/14724m0TmLfqovKGj26beYAigJTfuE6Zo?usp=drive_link)
- 🚀 **Direct Download File `.exe` (v1.0.3)**: [Unduh StockMetaStudio.exe v1.0.3](https://drive.google.com/uc?export=download&id=1vhbDJA1fUnT8nejoQK0pRHLGW3FEAjz5)
- 👁️ **Link Mirror Google Drive v1.0.3**: [Lihat File v1.0.3 di Google Drive](https://drive.google.com/file/d/1vhbDJA1fUnT8nejoQK0pRHLGW3FEAjz5/view?usp=sharing)

---

## 🌟 Fitur Unggulan Versi 1.0.3

- 🤖 **AI Vision Metadata Curation**: Ekstraksi Judul, Deskripsi, dan 35–45 Kata Kunci presisi menggunakan model Gemini Vision terbaru (`gemini-2.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.8-flash`, dsb.).
- 🔄 **Auto-Rolling Multi-API Key**: Mendukung hingga 30 API Keys Gemini dengan penanganan otomatis batasan kuota HTTP 429 & fallback 503.
- 🔒 **API Key Sensor & Masking**: Melindungi kode API Key pengguna dengan fitur sensor bintang (`*`) dan tombol toggle ikon mata (*Lihat Key / Sembunyikan*).
- 🚀 **In-App Auto-Update Mandiri**: Fitur pemeriksa & pemasang pembaruan otomatis tanpa backend server kustom dengan Google Drive Virus Warning Auto-Resolver (`core/updater.py`).
- 📸 **Direct IPTC & EPS Vector Injector**: Penulisan biner langsung ke header EXIF/IPTC file gambar dan file vektor EPS tanpa perlu software pihak ketiga.
- 🎯 **Proteksi & Presisi Path Absolut**: Pemindaian path otomatis dengan File Picker Native Windows untuk mencegah error `File tidak ditemukan`.

---

## 📦 Skema Folder & Pembaruan Versi (v1.0.x)

| Versi Rilis | Lokasi Folder Google Drive | Link Unduhan Direct File |
| :--- | :--- | :--- |
| **v1.0.3** | `stock meta studio/v1.0.3/` | [Download v1.0.3 .exe](https://drive.google.com/uc?export=download&id=1vhbDJA1fUnT8nejoQK0pRHLGW3FEAjz5) |
| **v1.0.0** | `stock meta studio/v1.0.0/` | [Download v1.0.0 .exe](https://drive.google.com/uc?export=download&id=1QP2BFVeqrFIhvatQFSoqRa69q0uipKm9) |

---

## 🛠️ Panduan Instalasi & Penggunaan

1. Unduh file **`StockMetaStudio.exe`** v1.0.3 melalui link Google Drive di atas.
2. Jalankan `StockMetaStudio.exe` di OS Windows (Windows 10/11 64-bit).
3. Buka menu **Pengaturan** untuk memasukkan **Gemini API Key**.
4. Klik **Simpan Pengaturan** dan aplikasi siap digunakan!
