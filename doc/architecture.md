# Software Architecture Document: StockMeta Studio by BRKH STUDIO (v1.0.3)

## 1. System Overview
StockMeta Studio by BRKH STUDIO (v1.0.3) is a hybrid desktop application built with Python (`pywebview`) and a modern web UI (HTML5, Vanilla JS, Tailwind CSS, FontAwesome). It automates microstock metadata curation end-to-end by integrating Gemini Vision AI visual analysis (`gemini-2.5-flash`, `gemini-3.5-flash-lite`, `gemini-3.8-flash`, etc.), real-time Buyer Demand search intelligence, Commercial Intent Scoring, In-App Auto-Updating (`core/updater.py`), and direct binary IPTC/EXIF/XMP metadata injection for JPGs and EPS vector files.

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
|  - AutoUpdater (core/updater.py): SemVer Checker (v1.0.3) & Runner   |
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
|  - Gemini 2.5 / 3.5 / 3.8 Flash   | |  - Native JPG / EPS Files       |
|  - Instant 503 High-Demand Switch | |  - ~/.stockmeta_config.json     |
|  - JSON Schema Strict Output      | |  - Universal CSV/JSON Exports   |
+-----------------------------------+ +---------------------------------+
```
