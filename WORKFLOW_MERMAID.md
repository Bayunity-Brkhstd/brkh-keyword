# 🚀 Alur Kerja Lengkap StockMeta Studio (Mermaid Diagram)

Dokumen ini menjelaskan alur kerja aplikasi **StockMeta Studio by BRKH STUDIO (v1.0.3)** dari tahap instalasi pengguna, pengaturan API Key & Kotak Khusus Custom Rules, analisis visual AI Gemini, riset SEO pembeli, hingga penulisan metadata biner langsung ke header file fisik gambar (`.jpg`) dan vektor (`.eps`).

---

## 📊 1. Diagram Alur Utama (End-to-End User Flowchart)

```mermaid
flowchart TD
    subgraph PHASE1["1. Instalasi & Launch Aplikasi"]
        A["User Unduh StockMetaStudio.exe / Source Code"] --> B["Menjalankan Aplikasi (python main.py / StockMetaStudio.exe)"]
        B --> C["Inisialisasi DesktopBridge (PyWebView + Edge WebView2 Window)"]
        C --> D["Auto-Check Pembaruan (updater.py & version.json)"]
    end

    subgraph PHASE2["2. Konfigurasi User (Settings & Custom Rules)"]
        D --> E["User Memasukkan API Key Gemini (1-30 Keys, Impor TXT Auto-Rolling)"]
        E --> F["User Mengatur Kotak Khusus Custom Rules"]
        F --> F1["Kata Kunci Dilarang (Banned Keywords)"]
        F --> F2["Kata Kunci Wajib (Mandatory Tags) + Checklist Urutan Akhir/Awal"]
        F --> F3["Template Pola Title & Description"]
        F --> F4["Checkbox Kurasi Ketat 100% Bahasa Inggris"]
    end

    subgraph PHASE3["3. Pemilihan Aset Gambar (Input)"]
        F --> G["User Drag & Drop / Pilih File Gambar (JPG / pasangan EPS)"]
        G --> H["Pillow Generate Thumbnail Base64 Low-RAM (max 280px)"]
        H --> I["User Memilih Preset Platform & Kategori Niche Tema"]
        I --> J["User Klik 'Mulai Batch Processing'"]
    end

    subgraph PHASE4["4. Core AI & SEO Curation Pipeline"]
        J --> K["Workers Paralel (Pacing Delay 2.5s)"]
        K --> L["SafeMemoryCurator: Gemini Vision AI Analysis"]
        L -- "Error 503 / High Demand" --> L1["Auto-Fallback ke Model Berikutnya (Gemini 2.5 / 3.5 Flash)"]
        L -- "Error 429 Rate Limit" --> L2["Auto-Rolling ke API Key Berikutnya"]
        L --> M["Keluaran JSON (Title, Description, Keywords, AssetType)"]
        M --> N["SEO Pipeline: Buyer Demand & SERP Research Engine"]
        N --> O["KeywordAnalyzer: Commercial Scoring & Adobe Stock 10-First Ranking"]
        O --> P["LanguageFilter: Strict 100% English Filter & Custom Banned Filter"]
        P --> Q["Custom Rules Formatter: Format Title Pattern, Desc Pattern & Mandatory Tags Position"]
    end

    subgraph PHASE5["5. Output & Direct Binary Metadata Injection"]
        Q --> R["IPTCInjector: Inject Biner EXIF XPTitle/XPKeywords & IPTC ke JPG Header"]
        R --> S["Match Auto-Vector: Inject XMP Metadata ke File Pair .eps"]
        S --> T["Update Status UI & Terminal Realtime Console Log"]
        T --> U["User Dapatkan File Fisik Ter-inject + Ekspor CSV / JSON Data"]
    end
```

---

## 🔄 2. Sequence Diagram (Detail Interaksi Komponen & IPC Bridge)

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Pengguna)
    participant UI as Frontend (index.html & script.js)
    participant Py as DesktopBridge (main.py)
    participant Curator as Gemini Curator (memory_curator.py)
    participant SEO as SEO Engine (buyer_demand & analyzer)
    participant Filter as Language & Custom Filter (language_filter.py)
    participant Injector as IPTC Injector (iptc_injector.py)

    User->>UI: 1. Jalankan Aplikasi & Buka Dashboard
    UI->>Py: 2. pywebviewready -> Inisialisasi Bridge & Load Config
    User->>UI: 3. Masukkan API Key & Atur Kotak Khusus Custom Rules
    UI->>UI: 4. Simpan Rules ke localStorage
    User->>UI: 5. Drag & Drop File Gambar JPG
    UI->>Py: 6. select_files() / get_image_preview_b64()
    Py-->>UI: 7. Kirim Base64 Low-RAM Thumbnail (< 280px)
    User->>UI: 8. Klik "Mulai Batch Processing"
    
    loop Setiap File Aset dalam Antrean
        UI->>Py: 9. process_and_save(file_path, min_kw, max_kw, niche_theme, custom_rules)
        Py->>Curator: 10. curate(file_path, prompt_notes, niche_theme)
        Note over Curator: Gemini Vision AI Analysis with 503 Failover & Key Rotation
        Curator-->>Py: 11. Return Raw Metadata JSON (Title, Desc, Keywords)
        Py->>SEO: 12. Buyer Demand & SERP Scoring (Adobe Stock 10-First)
        SEO-->>Py: 13. Return Commercial Ranked Keywords
        Py->>Filter: 14. filter_english_keywords(ranked_kw, custom_banned_list)
        Filter-->>Py: 15. Return Clean 100% English Keywords
        Py->>Py: 16. apply_custom_rules_to_metadata() (Title/Desc Patterns & Mandatory Tag Position)
        Py->>Injector: 17. embed_to_jpg(file_path, title, desc, final_keywords)
        Note over Injector: Direct Binary EXIF & IPTC Header Write
        Py->>Injector: 18. embed_to_eps(eps_path, title, desc, final_keywords) (jika ada file .eps)
        Injector-->>Py: 19. Return Success Status (IPTC + EPS Injected)
        Py-->>UI: 20. Return Result Dict Payload
        UI->>UI: 21. Update UI Status Badge & Realtime Terminal Log
    end

    User->>UI: 22. Ekspor Hasil Curation ke CSV / JSON
```

---

## 📝 3. Rincian Tahapan Alur Eksekusi Sistem

### Tahap 1: Instalasi & Peluncuran Aplikasi
1. **Pilihan Jalur Eksekusi**:
   - **Standalone Exe**: Pengguna mengunduh `StockMetaStudio.exe` v1.0.3 dan menjalankannya di OS Windows tanpa menginstal Python.
   - **Source Code**: Pengguna menjalankan via `python main.py` menggunakan Python 3.10+.
2. **Auto-Update Check**: Modul `core/updater.py` memeriksa file manifest versi `version.json`. Jika ada rilis baru, banner pemberitahuan pembaruan akan ditampilkan di dashboard UI.

### Tahap 2: Konfigurasi API Key & Kotak Khusus Custom Rules
1. **Manajemen Multi-API Key**: Pengguna memasukkan 1 hingga 30 API Key Gemini (dukungan impor file `.txt`). Sistem akan melakukan rotasi key secara *round-robin* dan otomatis pindah key jika terkena kuota limit (HTTP 429).
2. **Kotak Khusus Custom Rules & Patterns**:
   - 🛑 **Kata Kunci Dilarang (*Banned Keywords*)**: Kata-kata yang wajib dibuang dari hasil output.
   - 📌 **Kata Kunci Wajib (*Mandatory Tags*)**: Kata-kata yang wajib dimasukkan ke setiap file.
   - 🔀 **Checklist Urutan Kata Kunci Wajib**:
     - **Dicentang (`mandatoryAtEnd = true`)**: Kata kunci wajib ditaruh di **urutan akhir** (*tail tags*).
     - **Tidak Dicentang (`mandatoryAtEnd = false`)**: Kata kunci wajib ditaruh di **urutan awal** (*top priority tags*).
   - ✍️ **Template Pola Title & Description**: Penggunaan placeholder `{title}` dan `{description}` untuk menyeragamkan format judul & deskripsi komersial.
   - 🇬🇧 **Kurasi Ketat 100% Bahasa Inggris**: Menyaring kata non-ASCII, membuang kosa kata Bahasa Indonesia, dan mengunci kurasi hanya dalam Bahasa Inggris murni.

### Tahap 3: Pemilihan File Gambar & Thumbnail Generation
1. **File Picker Native & Drag-and-Drop**: Pengguna memasukkan file gambar JPG lokal.
2. **Low-RAM Base64 Preview**: Python Pillow menghasilkan thumbnail `BytesIO` Base64 resolusi rendah (max 280px) untuk menjaga penggunaan RAM di bawah 100 MB dan memfasilitasi antarmuka peramban.

### Tahap 4: Kurasi Vision AI, SEO Engine, & Custom Formatting
1. **Gemini Vision AI Curation**: Menggunakan `SafeMemoryCurator` untuk menganalisis subjek visual gambar. Jika server mengalami error 503 (*High Demand*), sistem otomatis beralih (*failover*) ke model kandidat berikutnya (`gemini-2.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.8-flash`).
2. **Buyer Demand & SERP Research**: Meriset kueri pencarian komersial nyata dari Google/Bing.
3. **Commercial Scoring & Adobe Stock 10-First Rule**: Menilai skor komersial kata kunci dan memposisikan 10 tag komersial terbaik di posisi awal.
4. **Strict English & Custom Rule Application**: Menapis kata kunci dilarang, menerapkan format template pola judul/deskripsi, dan mengatur posisi kata kunci wajib (di awal atau di akhir).

### Tahap 5: Output & Direct Binary Metadata Injection
1. **Penulisan Biner EXIF & IPTC**: Library `Pillow` & `iptcinfo3` menginjeksi metadata langsung ke Windows Details Tab (`XPTitle`, `XPSubject`, `XPKeywords`) dan header IPTC biner file `.jpg` tanpa merusak piksel gambar.
2. **Automatic EPS Vector Matching**: Jika terdapat file vektor `.eps` berpasangan di folder yang sama, metadata XMP disuntikkan secara otomatis.
3. **Hasil & Ekspor Data**: Pengguna dapat melihat badge status selesai pada antarmuka, memantau *terminal log console*, serta mengekspor data batch ke format CSV atau JSON.

---

> 💡 **BRKH STUDIO Documentation Notice**: Dokumentasi ini dibuat secara resmi untuk memudahkan pemahaman arsitektur dan alur kerja aplikasi **StockMeta Studio**.
