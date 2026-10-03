# Software Architecture Document: StockMeta Studio by BRKH STUDIO (v1.0.0)

## 1. System Overview
StockMeta Studio by BRKH STUDIO (v1.0.0) is a hybrid desktop application built with Python (`pywebview`) and a modern web UI (HTML5, Vanilla JS, Tailwind CSS, FontAwesome). It automates microstock metadata curation end-to-end by integrating Gemini Vision AI visual analysis, real-time Buyer Demand search intelligence, Commercial Intent Scoring, In-App Auto-Updating (`core/updater.py`), and direct binary IPTC/EXIF/XMP metadata injection for JPGs and EPS vector files.

---

## 2. High-Level Architecture Diagram

```text
+-----------------------------------------------------------------------+
|                    FRONTEND LAYER (Edge WebView2)                     |
|  - Precompiled Low-RAM Vanilla JS Logic (script.js)                   |
|  - In-App Auto-Update Banner Component & Progress Bar Overlay        |
|  - API Key Sensor & Eye Toggle Visibility Control                     |
|  - Realtime System Log Console Drawer (with Red Error Alerts)          |
|  - License & Comprehensive FAQ/User Guide Modals                       |
|  - Ephemeral Base64 Thumbnail Renderer (Bypasses file:// CORS)         |
+-----------------------------------┬-----------------------------------+
                                    │ IPC (window.pywebview.api)
+-----------------------------------▼-----------------------------------+
|                   BACKEND CORE LAYER (Python 3.10+)                   |
|  - DesktopBridge (main.py): IPC Bridge, File Dialogs, Config Storage  |
|  - AutoUpdater (core/updater.py): SemVer Checker & Detached Runner    |
|  - PathUtils (core/path_utils.py): Windows MAX_PATH & Normalization   |
|  - SafeMemoryCurator: Multi-Key Auto-Rolling & 503 Fallback Engine    |
|  - BuyerDemandFetcher: Realtime Buyer Suggestion Engine               |
|  - KeywordAnalyzer: Commercial Score (0-100) & Adobe Stock 10-First   |
|  - KeywordClusterer: Semantic Hierarchy & Batch Series Deduplication  |
|  - KeywordSERP: SERP Signals & Related Search Research                |
|  - IPTCInjector: Direct EXIF, IPTC & EPS XMP Metadata Embedding       |
+-------------------┬-------------------------------+-------------------+
                    │ Encrypted HTTPS               │ Binary I/O
+-------------------▼---------------+ +-------------▼-------------------+
|     GOOGLE GEMINI VISION AI       | |       LOCAL STORAGE / DISK      |
|  - Gemini 2.5 / 1.5 / 3.8 / 2.0   | |  - Native JPG / EPS Files       |
|  - Instant 503 High-Demand Switch | |  - ~/.stockmeta_config.json     |
|  - JSON Schema Strict Output      | |  - Universal CSV/JSON Exports   |
+-----------------------------------+ +---------------------------------+
```

---

## 3. Core Architectural Principles

### A. Auto-Update & Windows File-Locking Resolution (`core/updater.py`)
1. **Non-blocking Startup Check:** `httpx` with a strict 5-second timeout fetches `version.json` asynchronously, preventing startup freezes.
2. **SemVer Comparison Engine:** Uses `packaging.version` with fallback tuple parsing to determine update eligibility.
3. **Detached Launcher Script (`update_runner.bat`):** Resolves Windows process file locking (`WinError 32`) by spawning a detached subprocess that waits for `StockMetaStudio.exe` to terminate cleanly, replaces the executable, and restarts the updated application automatically.

### B. Security & API Key Sensor Layer
1. **Masked State by Default:** Textarea inputs and preview chips render obscured text (`-webkit-text-security: disc` and asterisk masks) to protect user credentials.
2. **On-Demand Unmasking:** Eye button toggle allows immediate toggling between masked (`*`) and unmasked plain text states.

### C. Memory-Safe & Low-RAM Execution Target (~80 MB – 130 MB)
1. **Low-RAM Vanilla JS Frontend:** Eliminates heavy web framework overhead, keeping RAM footprint under 100MB.
2. **Base64 Ephemeral Thumbnail Buffering:** PyWebView generates small 400px Base64 thumbnails in memory, avoiding Chromium local resource security policies.
3. **Pillow Ephemeral Buffer & Garbage Collection:** Ephemeral buffers resize images before sending to Gemini API, followed by explicit garbage collection (`gc.collect()`).

### D. Direct Multi-Format Metadata Embedding
1. **EXIF Injection (Windows Details Tab):** Writes `XPTitle` (`0x9c9b`), `XPSubject` (`0x9c9f`), `XPKeywords` (`0x9c9e`), and `ImageDescription` (`0x010e`) into JPG EXIF headers.
2. **IPTC Binary Injection:** Writes `ObjectName`, `Caption/Abstract`, and `Keywords` via `iptcinfo3`.
3. **EPS XMP Vector Injection:** Auto-detects matching `.eps` files in the same folder and embeds `%BEGINXMP:Main` ... `%ENDXMP:Main` XMP packets.

---

## 4. Module Decomposition

1. **`main.py`**: Entry point and IPC bridge (`DesktopBridge`), orchestrating the end-to-end SEO pipeline.
2. **`core/updater.py`**: Auto-update manager and detached update batch script executor.
3. **`core/path_utils.py`**: Central path sanitizer & Windows long path (`\\?\`) handler.
4. **`core/memory_curator.py`**: Gemini Vision AI engine with Niche Category Theme guidance prompts.
5. **`core/buyer_demand.py`**: Realtime buyer search query fetcher.
6. **`core/keyword_analyzer.py`**: Commercial intent scorer & Adobe Stock 10-first priority sorter.
7. **`core/keyword_cluster.py`**: Semantic tier clustering & series asset deduplicator.
8. **`core/keyword_serp.py`**: Lightweight SERP search research and trend signals.
9. **`core/iptc_injector.py`**: Memory-buffered EXIF, IPTC, and EPS XMP metadata injector.
