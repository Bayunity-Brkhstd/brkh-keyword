# Software Architecture Document: StockMeta Studio by BRKH STUDIO

## 1. System Overview
StockMeta Studio by BRKH STUDIO is a hybrid desktop application built with Python (`pywebview`) and a modern web UI (HTML5, Vanilla JS, Tailwind CSS, FontAwesome). It automates microstock metadata curation end-to-end by integrating Gemini Vision AI visual analysis, real-time Buyer Demand search intelligence, Commercial Intent Scoring, and direct binary IPTC/EXIF/XMP metadata injection for JPGs and EPS vector files.

---

## 2. High-Level Architecture Diagram

```text
+-----------------------------------------------------------------------+
|                    FRONTEND LAYER (Edge WebView2)                     |
|  - Precompiled Low-RAM Vanilla JS Logic (script.js)                   |
|  - Realtime System Log Console Drawer (with Red Error Alerts)          |
|  - License & Comprehensive FAQ/User Guide Modals                       |
|  - Base64 Thumbnail Renderer (Bypasses file:// CORS Restrictions)     |
|  - Throttled Batch Worker Queue Runner (Pacing Delay: 2500ms)         |
+-----------------------------------┬-----------------------------------+
                                    │ IPC (window.pywebview.api)
+-----------------------------------▼-----------------------------------+
|                   BACKEND CORE LAYER (Python 3.10+)                   |
|  - DesktopBridge (main.py): IPC Bridge, File Dialogs, Config Storage  |
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

### A. Memory-Safe & Low-RAM Execution Target (~80 MB – 130 MB)
1. **Low-RAM Vanilla JS Frontend:** Eliminates heavy web framework overhead, keeping RAM footprint under 100MB.
2. **Base64 Ephemeral Thumbnail Buffering:** PyWebView generates small 400px Base64 thumbnails in memory, avoiding Chromium local resource security policies (`Not allowed to load local resource`).
3. **Pillow Ephemeral Buffer & Garbage Collection:** Ephemeral `io.BytesIO` buffers resize images to 1024px before sending to Gemini API, followed by explicit garbage collection (`gc.collect()`).

### B. High-Demand Server Overload Handling & Multi-API Key Auto-Rolling
1. **Instant 503 High Demand Failover:** When Google Gemini servers report `503 UNAVAILABLE` / High Demand on a model, the curator instantly switches to the next fallback model candidate (`gemini-2.5-flash`, `gemini-1.5-flash`, etc.) on the same key without breaking the batch.
2. **Up to 30 API Keys Support:** Users can load up to 30 Gemini API Keys manually or by uploading a `.txt` file with automatic round-robin and rate limit (`429`) failover.
3. **Pacing Delay Throttling:** 2500 ms cycle delay per worker prevents exceeding 15 RPM limits on free tier keys.

### C. Advanced Microstock SEO Pipeline
1. **Buyer Demand Retrieval (`core/buyer_demand.py`):** Pulls live search query suggestions from Google, Bing, and DuckDuckGo for commercial single-word High-CTR tags.
2. **Commercial Intent Scoring & 10-First Sorter (`core/keyword_analyzer.py`):** Calculates Commercial Score (0-100), demotes passive words (`white`, `isolated`, `background`) to the tail, and places top commercial utility tags in positions 1-10.
3. **Clustering & Batch Deduplication (`core/keyword_cluster.py`):** Categorizes keywords into Core Pillars, Commercial Actions, and Variant Attributes while preventing duplicate tag penalties across batch files.
4. **SERP Signals & Research (`core/keyword_serp.py`):** Fetches related search insights and query signals lightweight without headless browsers.

### D. Direct Multi-Format Metadata Embedding
1. **EXIF Injection (Windows Details Tab):** Writes `XPTitle` (`0x9c9b`), `XPSubject` (`0x9c9f`), `XPKeywords` (`0x9c9e`), and `ImageDescription` (`0x010e`) into JPG EXIF headers in memory before saving to prevent `WinError 32` file locks.
2. **IPTC Binary Injection:** Writes `ObjectName`, `Caption/Abstract`, and `Keywords` via `iptcinfo3`.
3. **EPS XMP Vector Injection:** Auto-detects matching `.eps` files in the same folder and embeds `%BEGINXMP:Main` ... `%ENDXMP:Main` XMP packets.

---

## 4. Module Decomposition

1. **`main.py`**: Entry point and IPC bridge (`DesktopBridge`), orchestrating the end-to-end SEO pipeline.
2. **`core/path_utils.py`**: Central path sanitizer & Windows long path (`\\?\`) handler.
3. **`core/memory_curator.py`**: Gemini Vision AI engine with Niche Category Theme guidance prompts, 503 high-demand instant failover, and auto-rolling key rotation.
4. **`core/buyer_demand.py`**: Realtime buyer search query fetcher for Google, Bing, and DuckDuckGo.
5. **`core/keyword_analyzer.py`**: Commercial intent scorer & Adobe Stock 10-first priority sorter.
6. **`core/keyword_cluster.py`**: Semantic tier clustering & series asset deduplicator.
7. **`core/keyword_serp.py`**: Lightweight SERP search research and trend signals.
8. **`core/iptc_injector.py`**: Memory-buffered EXIF, IPTC, and EPS XMP metadata injector.
