/* StockMeta Studio - Low-RAM Vanilla JS Frontend (ES6) */

// Application State
const state = {
    assets: [],
    isProcessing: false,
    concurrencyLimit: 2,
    minKeywords: 35,
    maxKeywords: 45,
    customNotes: "",
    nicheTheme: "auto",
    filter: "all",
    preset: "universal"
};

// Realtime Console Logger State
const loggerState = {
    logs: [],
    filter: 'all',
    hasError: false
};

function addLog(msg, type = 'info', filename = '') {
    const timestamp = new Date().toLocaleTimeString('id-ID', { hour12: false });
    const logItem = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        time: timestamp,
        msg: msg,
        type: type, // 'info', 'success', 'warning', 'error'
        filename: filename
    };

    loggerState.logs.push(logItem);

    // Memory protection: cap log array to max 300 items to prevent JS heap growth
    if (loggerState.logs.length > 300) {
        loggerState.logs = loggerState.logs.slice(-250);
    }

    if (type === 'error') {
        loggerState.hasError = true;
        updateLogErrorStatus(true);
    }

    renderLogs();
}

function updateLogErrorStatus(hasError) {
    const errorBadge = document.getElementById('logErrorBadge');
    const statusTag = document.getElementById('logStatusTag');
    const consoleBtn = document.getElementById('btnOpenConsoleLog');

    if (hasError || loggerState.hasError) {
        if (errorBadge) errorBadge.classList.remove('hidden');
        if (consoleBtn) {
            consoleBtn.classList.add('border-rose-500/80', 'bg-rose-950/40', 'text-rose-200');
        }
        if (statusTag) {
            statusTag.textContent = 'SYSTEM ERROR!';
            statusTag.className = 'text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-600 text-white border border-rose-400 animate-pulse shadow-md shadow-rose-900/50';
        }
    } else {
        if (errorBadge) errorBadge.classList.add('hidden');
        if (consoleBtn) {
            consoleBtn.classList.remove('border-rose-500/80', 'bg-rose-950/40', 'text-rose-200');
        }
        if (statusTag) {
            statusTag.textContent = 'NORMAL';
            statusTag.className = 'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
        }
    }
}

function renderLogs() {
    const container = document.getElementById('consoleLogContainer');
    if (!container) return;

    const countAll = loggerState.logs.length;
    const countError = loggerState.logs.filter(l => l.type === 'error').length;
    const countSuccess = loggerState.logs.filter(l => l.type === 'success').length;

    const elAll = document.getElementById('logCountAll');
    const elErr = document.getElementById('logCountError');
    const elSuc = document.getElementById('logCountSuccess');
    if (elAll) elAll.textContent = countAll;
    if (elErr) elErr.textContent = countError;
    if (elSuc) elSuc.textContent = countSuccess;

    let filtered = loggerState.logs;
    if (loggerState.filter === 'error') filtered = loggerState.logs.filter(l => l.type === 'error');
    if (loggerState.filter === 'success') filtered = loggerState.logs.filter(l => l.type === 'success');

    if (loggerState.logs.length === 0) {
        container.innerHTML = `<div class="text-slate-500 italic">[SYSTEM] Terminal log kosong. Belum ada aktivitas.</div>`;
        return;
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="text-slate-500 italic">[SYSTEM] Tidak ada log untuk filter '${loggerState.filter}'.</div>`;
        return;
    }

    container.innerHTML = filtered.map(log => {
        if (log.type === 'error') {
            const diag = parseErrorDiagnostic(log.msg);
            return `
                <div class="bg-rose-950/90 border-l-4 border-rose-600 text-rose-100 p-3 rounded-lg shadow-md shadow-rose-950/60 space-y-1.5 my-2">
                    <div class="flex items-center justify-between gap-2 border-b border-rose-800/60 pb-1.5">
                        <span class="text-rose-300 font-bold flex items-center gap-1.5 text-[11px]">
                            <i class="fa-solid fa-circle-exclamation text-rose-400"></i>
                            <span>[${log.time}] ERROR REPORT</span>
                            ${log.filename ? `<span class="text-rose-200/70 font-mono">(${escapeHtml(log.filename)})</span>` : ''}
                        </span>
                        <span class="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black tracking-wider uppercase shrink-0 shadow">
                            <i class="fa-solid fa-triangle-exclamation mr-1"></i> FAILED
                        </span>
                    </div>
                    <div class="text-xs text-rose-100 font-semibold pt-0.5 leading-snug">
                        📌 <strong>Penyebab:</strong> ${escapeHtml(diag.cause)}
                    </div>
                    <div class="bg-slate-950/70 border border-rose-900/60 rounded-md p-2 space-y-1 text-[11px] text-slate-200">
                        <div class="font-bold text-amber-300 text-[10.5px] flex items-center gap-1">
                            <i class="fa-solid fa-wrench text-amber-400"></i> Langkah Perbaikan Mandiri:
                        </div>
                        <ul class="list-disc list-inside space-y-0.5 text-slate-300 text-[10.5px] leading-relaxed">
                            ${diag.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="text-[10px] text-rose-300/60 font-mono pt-0.5 truncate" title="${escapeHtml(log.msg)}">
                        Detail Pesan Teknis: ${escapeHtml(log.msg)}
                    </div>
                </div>
            `;
        } else if (log.type === 'success') {
            return `
                <div class="border-l-2 border-emerald-500 bg-emerald-950/30 text-emerald-300 px-3 py-1.5 rounded-lg flex items-center justify-between gap-2 text-xs">
                    <div>
                        <span class="text-emerald-400 font-bold">[${log.time}] SUCCESS:</span> ${escapeHtml(log.msg)}
                    </div>
                    <span class="text-[10px] text-emerald-400/80 font-mono shrink-0"><i class="fa-solid fa-check"></i> OK</span>
                </div>
            `;
        } else if (log.type === 'warning') {
            return `
                <div class="border-l-2 border-amber-500 bg-amber-950/30 text-amber-300 px-3 py-1.5 rounded-lg text-xs">
                    <span class="text-amber-400 font-bold">[${log.time}] WARNING:</span> ${escapeHtml(log.msg)}
                </div>
            `;
        } else {
            return `
                <div class="border-l-2 border-indigo-500 bg-slate-900/60 text-slate-300 px-3 py-1.5 rounded-lg text-xs">
                    <span class="text-indigo-400 font-bold">[${log.time}] INFO:</span> ${escapeHtml(log.msg)}
                </div>
            `;
        }
    }).join('');

    container.scrollTop = container.scrollHeight;
}

// User-Facing Diagnostic & Troubleshooting Parser
function parseErrorDiagnostic(rawMsg) {
    const msg = (rawMsg || '').toString().trim();
    const lower = msg.toLowerCase();

    // 1. API Key Not Configured / Missing
    if (lower.includes('api key') && (lower.includes('belum dikonfigurasi') || lower.includes('kosong') || lower.includes('belum ada') || lower.includes('tidak ada'))) {
        return {
            cause: "Kunci API Gemini belum dimasukkan atau dikonfigurasi di aplikasi.",
            steps: [
                "Buka menu Pengaturan (ikon gerigi di sudut kanan atas).",
                "Unggah file API Key TXT atau tempelkan API Key Gemini Anda (dapatkan gratis di aistudio.google.com).",
                "Klik tombol 'Simpan API Keys', lalu tekan 'Proses Ulang' pada item ini."
            ]
        };
    }

    // 2. 429 Rate Limit / Quota Exhausted / Resource Exhausted / API Key Invalid
    if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota') || lower.includes('rate limit') || lower.includes('api_key_invalid')) {
        return {
            cause: "Seluruh API Key Gemini yang terpasang telah mencapai batas kuota penggunaan (RPM/TPM limit).",
            steps: [
                "Buka Pengaturan dan tambahkan beberapa API Key Gemini tambahan (aplikasi mendukung hingga 30 API Key untuk auto-rotation).",
                "Atau tunggu 1 - 2 menit agar batas kuota per menit Gemini diperbarui secara otomatis oleh Google.",
                "Klik tombol 'Proses Ulang' pada item ini."
            ]
        };
    }

    // 3. 503 Server Overload / High Demand / Unavailable
    if (lower.includes('503') || lower.includes('unavailable') || lower.includes('high demand') || lower.includes('overloaded') || lower.includes('500')) {
        return {
            cause: "Server AI Gemini Google sedang mengalami lonjakan beban tinggi (High Demand / Server Overload).",
            steps: [
                "Tunggu 30 - 60 detik agar server Google kembali stabil.",
                "Pastikan koneksi internet komputer Anda tidak terputus.",
                "Klik tombol 'Proses Ulang' pada item ini."
            ]
        };
    }

    // 4. File Not Found / NAS Network Server Disconnect / Invalid Path
    if (lower.includes('tidak ditemukan') || lower.includes('not found') || lower.includes('file_path') || lower.includes('path') || lower.includes('winerror 3')) {
        return {
            cause: "File tidak ditemukan pada lokasi path terdaftar (termasuk folder NAS/Network Server yang terputus atau nama folder berubah).",
            steps: [
                "Jika file berada di Network Server / NAS, pastikan koneksi jaringan server terhubung di Windows Explorer.",
                "Pastikan lokasi folder dan nama file tidak diubah atau dihapus saat aplikasi berjalan.",
                "Jika masalah berlanjut, coba salin file ke Drive lokal (Drive D: atau C:) lalu tambahkan ulang."
            ]
        };
    }

    // 5. Permission Error / Read Only / File Locked
    if (lower.includes('permission') || lower.includes('access denied') || lower.includes('izin') || lower.includes('winerror 5') || lower.includes('winerror 32')) {
        return {
            cause: "Akses file ditolak oleh Windows / Server NAS (File sedang terbuka di software lain atau berstatus Read-Only).",
            steps: [
                "Tutup software Adobe Photoshop, Illustrator, Bridge, atau Photo Viewer yang sedang membuka file ini.",
                "Klik kanan file/folder di Windows Explorer -> Properties -> Hapus centang pada 'Read-Only'.",
                "Jalankan aplikasi StockMeta Studio ini sebagai Administrator (Right-Click -> Run as Administrator)."
            ]
        };
    }

    // 6. Non-JPG / Format Unsupported
    if (lower.includes('bukan file jpg') || lower.includes('jpeg') || lower.includes('format')) {
        return {
            cause: "File utama bukan berformat JPG/JPEG yang valid untuk analisis Vision AI & penulisan IPTC.",
            steps: [
                "Pastikan file yang diproses berformat .jpg atau .jpeg.",
                "Untuk file vector EPS, pastikan terdapat file gambar pendamping bernama sama (contoh: asset01.jpg dan asset01.eps) di folder yang sama."
            ]
        };
    }

    // 7. IPTC / EXIF Injection Fail
    if (lower.includes('iptc') || lower.includes('exif')) {
        return {
            cause: "Gagal menulis biner EXIF/IPTC langsung ke file gambar.",
            steps: [
                "Pastikan file gambar tidak dalam keadaan Read-Only dan tidak sedang dibuka oleh aplikasi lain.",
                "Hapus file backup sisa yang berakhiran ~ (contoh: gambar.jpg~) di folder asal jika ada.",
                "Pastikan sisa ruang penyimpanan (disk space) pada Drive / NAS Anda masih mencupi."
            ]
        };
    }

    // 8. Connection / Network Error / Timeout
    if (lower.includes('connection') || lower.includes('connect') || lower.includes('timeout') || lower.includes('network') || lower.includes('socket')) {
        return {
            cause: "Koneksi jaringan internet atau komunikasi bridge terputus.",
            steps: [
                "Periksa koneksi internet Wi-Fi / LAN komputer Anda.",
                "Jika menggunakan VPN atau Proxy, coba nonaktifkan sementara.",
                "Klik tombol 'Proses Ulang' setelah koneksi terhubung kembali."
            ]
        };
    }

    // 9. Default Generic Fallback
    return {
        cause: msg || "Terjadi kesalahan sistem yang tidak terduga.",
        steps: [
            "Periksa koneksi internet dan status API Key di menu Pengaturan.",
            "Pastikan file tidak sedang dibuka oleh aplikasi lain.",
            "Klik tombol 'Proses Ulang' pada item ini."
        ]
    };
}

// Preset configurations for microstock platforms
const PRESETS = {
    universal: { minTitleLen: 60, maxTitleLen: 90, maxKeywords: 45, minKeywords: 35, name: "Universal Microstock (Adobe, Shutterstock, Freepik, Getty)" },
    adobestock: { minTitleLen: 60, maxTitleLen: 90, maxKeywords: 45, minKeywords: 35, name: "Adobe Stock" },
    shutterstock: { minTitleLen: 60, maxTitleLen: 90, maxKeywords: 45, minKeywords: 35, name: "Shutterstock" },
    freepik: { minTitleLen: 60, maxTitleLen: 85, maxKeywords: 45, minKeywords: 35, name: "Freepik" },
    getty: { minTitleLen: 60, maxTitleLen: 90, maxKeywords: 40, minKeywords: 35, name: "iStock / Getty" }
};

const STOPWORDS = new Set(['the', 'and', 'in', 'on', 'with', 'for', 'of', 'at', 'to', 'from', 'by', 'an', 'a']);

function sanitizeWord(str) {
    return (str || '').toLowerCase().replace(/[^a-z]/g, '').trim();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Toast notification system
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    const colors = {
        success: 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200',
        error: 'border-rose-500/40 bg-rose-950/90 text-rose-200',
        warning: 'border-amber-500/40 bg-amber-950/90 text-amber-200',
        info: 'border-indigo-500/40 bg-indigo-950/90 text-indigo-200'
    };
    const icons = {
        success: 'fa-circle-check text-emerald-400',
        error: 'fa-circle-exclamation text-rose-400',
        warning: 'fa-triangle-exclamation text-amber-400',
        info: 'fa-circle-info text-indigo-400'
    };

    toast.className = `pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur shadow-xl text-xs max-w-sm transition-all duration-300 transform translate-y-2 opacity-0 ${colors[type] || colors.info}`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info} text-base mt-0.5"></i>
        <div class="flex-1">
            <div class="font-bold text-white text-xs">${escapeHtml(title)}</div>
            <div class="mt-0.5 text-[11px] opacity-90">${escapeHtml(message)}</div>
        </div>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function copyToClipboard(text, feedbackMsg = "Tersalin ke clipboard!") {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showToast('Sukses Salin', feedbackMsg, 'success');
    } catch (err) {
        showToast('Gagal Salin', 'Tidak dapat mengakses papan klip', 'error');
    }
    document.body.removeChild(textarea);
}

// Native File Picker Trigger via PyWebView IPC Bridge
async function triggerFilePicker() {
    if (window.pywebview && window.pywebview.api && window.pywebview.api.select_files) {
        try {
            const files = await window.pywebview.api.select_files();
            if (files && files.length > 0) {
                files.forEach(f => {
                    const assetId = 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                    // Use Python Base64 thumbnail preview if provided, fallback to file:///
                    const previewUri = f.preview || ('file:///' + f.path.replace(/\\/g, '/'));

                    state.assets.push({
                        id: assetId,
                        filename: f.name,
                        filePath: f.path,
                        fileSize: f.size,
                        previewUrl: previewUri,
                        status: 'queued',
                        errorMsg: null,
                        title: '',
                        description: '',
                        assetType: 'Menunggu...',
                        keywords: [],
                        epsEmbedded: false,
                        epsFilename: ''
                    });
                });

                updateStats();
                renderAssets();
                showToast('Aset Ditambahkan', `${files.length} file gambar siap di antrean batch.`, 'info');
            }
        } catch (err) {
            showToast('Gagal Buka Picker', err.message || 'Error file picker', 'error');
        }
    } else {
        // Web Fallback for browser testing
        document.getElementById('fileInput').click();
    }
}

// Single Asset Processor via Python PyWebView IPC Bridge
async function processSingleAsset(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;

    asset.status = 'processing';
    asset.errorMsg = null;
    renderAssets();
    updateStats();

    addLog(`[START] Memproses aset "${asset.filename}" (Ukuran: ${asset.fileSize})...`, 'info', asset.filename);

    if (window.pywebview && window.pywebview.api && window.pywebview.api.process_and_save) {
        try {
            addLog(`[VISION AI & BUYER DEMAND] Mengirim data ke Python bridge & mengeksekusi rotasi API Key...`, 'info', asset.filename);

            const res = await window.pywebview.api.process_and_save(
                asset.filePath,
                state.minKeywords,
                state.maxKeywords,
                state.customNotes,
                state.nicheTheme || "auto"
            );

            if (res.status === 'success' && res.data) {
                asset.title = res.data.title || '';
                asset.description = res.data.description || '';
                asset.assetType = res.data.assetType || 'Digital Asset';
                asset.keywords = res.data.keywords || [];
                asset.status = 'completed';
                asset.epsEmbedded = !!res.data.epsEmbedded;
                asset.epsFilename = res.data.epsFilename || '';

                if (asset.epsEmbedded) {
                    addLog(`[SUCCESS 🎯] "${asset.filename}" & vector "${asset.epsFilename}" berhasil disuntikkan IPTC + EXIF (${asset.keywords.length} tags)!`, 'success', asset.filename);
                    showToast('IPTC & EPS Sukses', `"${asset.filename}" & "${asset.epsFilename}" berhasil diinjeksi metadata!`, 'success');
                } else {
                    addLog(`[SUCCESS 🎯] "${asset.filename}" berhasil dikurasi & metadata EXIF/IPTC tertanam (${asset.keywords.length} tags)!`, 'success', asset.filename);
                    showToast('Analisis & IPTC Sukses', `"${asset.filename}" berhasil dikurasi & metadata EXIF/IPTC tertanam!`, 'success');
                }
            } else {
                asset.status = 'error';
                asset.errorMsg = res.message || 'Gagal memproses metadata';
                const diag = parseErrorDiagnostic(asset.errorMsg);
                addLog(`[ERROR ❌] Gagal memproses "${asset.filename}": ${diag.cause}`, 'error', asset.filename);
                showToast('Gagal Kurasi', `[${asset.filename}]: ${diag.cause}`, 'error');
            }
        } catch (err) {
            asset.status = 'error';
            asset.errorMsg = err.message || 'Koneksi bridge error';
            const diag = parseErrorDiagnostic(asset.errorMsg);
            addLog(`[ERROR ❌] Kegagalan sistem/bridge pada "${asset.filename}": ${diag.cause}`, 'error', asset.filename);
            showToast('Error System', `[${asset.filename}]: ${diag.cause}`, 'error');
        }
    } else {
        // Fallback for demo web mode
        await new Promise(r => setTimeout(r, 1500));
        asset.title = `Isometric Datacenter Server 3D Render for Network Infrastructure`;
        asset.description = `High quality 3D render illustration of cloud datacenter server isolated for commercial banner and poster.`;
        asset.assetType = `3D Render`;
        asset.keywords = ['server', 'cloud', 'datacenter', 'network', 'technology', 'hosting', 'isometric', 'database', 'render', 'digital', 'isolated', 'concept', 'hardware', 'computing', 'storage', 'data', 'infrastructure', 'banner', 'business', 'system', 'cyber', 'connection', 'web', 'internet', 'communication', 'element', 'symbol', 'graphic', 'modern', 'telecommunication', 'vector', 'illustration', 'creative', 'icon', 'object', 'security', 'futuristic', 'center', 'technological'];
        asset.status = 'completed';
        addLog(`[DEMO MODE 🎯] "${asset.filename}" dikurasi dalam Mode Demo Web.`, 'success', asset.filename);
        showToast('Demo Mode', `"${asset.filename}" berhasil dikurasi (Demo Mode)`, 'info');
    }

    updateStats();
    renderAssets();
}

// Batch Queue Processing with Mandatory Pacing Delay (2.5s) to Protect 15 RPM
async function processBatchQueue() {
    if (state.isProcessing) {
        showToast('Sedang Berjalan', 'Proses batch sedang berlangsung.', 'warning');
        return;
    }

    const pendingAssets = state.assets.filter(a => a.status === 'queued' || a.status === 'error');
    if (pendingAssets.length === 0) {
        showToast('Semua Selesai', 'Tidak ada aset dalam antrean yang perlu diproses.', 'info');
        return;
    }

    state.isProcessing = true;
    const progressWrapper = document.getElementById('batchProgressWrapper');
    const progressBar = document.getElementById('batchProgressBar');
    const progressPercent = document.getElementById('batchProgressPercent');
    const progressStatus = document.getElementById('batchProgressStatus');
    const processBtn = document.getElementById('btnProcessQueue');

    progressWrapper.classList.remove('hidden');
    processBtn.disabled = true;

    const totalItems = pendingAssets.length;
    let completedCount = 0;

    addLog(`[BATCH START 🚀] Memulai eksekusi batch untuk ${totalItems} aset dengan ${state.concurrencyLimit} worker paralel (Pacing 2.5s)...`, 'info');

    const queue = [...pendingAssets];
    const activeWorkers = [];

    const updateProgressUI = () => {
        const pct = Math.round((completedCount / totalItems) * 100);
        progressBar.style.width = `${pct}%`;
        progressPercent.textContent = `${pct}%`;
        progressStatus.textContent = `Memproses (${completedCount}/${totalItems}) aset dengan ${state.concurrencyLimit} worker paralel (Pacing jeda 2.5s)...`;
    };

    updateProgressUI();

    const worker = async () => {
        while (queue.length > 0) {
            const item = queue.shift();
            if (!item) break;

            await processSingleAsset(item.id);
            completedCount++;
            updateProgressUI();

            // Mandatory 2.5 second delay per worker cycle to prevent 429 Too Many Requests (< 15 RPM limit)
            if (queue.length > 0) {
                await new Promise(r => setTimeout(r, 2500));
            }
        }
    };

    const workerCount = Math.min(state.concurrencyLimit, queue.length);
    for (let i = 0; i < workerCount; i++) {
        activeWorkers.push(worker());
    }

    await Promise.all(activeWorkers);

    state.isProcessing = false;
    processBtn.disabled = false;
    progressStatus.textContent = 'Seluruh antrean batch berhasil diproses & IPTC tertanam!';
    setTimeout(() => {
        progressWrapper.classList.add('hidden');
    }, 2500);

    addLog(`[BATCH FINISH 🎉] Seluruh antrean batch selesai diproses (${completedCount}/${totalItems} aset).`, 'info');
    showToast('Batch Selesai', `Selesai memproses ${totalItems} gambar dengan penulisan IPTC biner!`, 'success');
}

// Export functions
function exportToCSV() {
    const completed = state.assets.filter(a => a.status === 'completed');
    if (completed.length === 0) {
        showToast('Belum Ada Data', 'Selesaikan proses metadata minimal 1 aset sebelum ekspor CSV.', 'warning');
        return;
    }

    const headers = ["Filename", "Title", "Description", "Keywords", "Category"];
    const rows = completed.map(item => {
        const cleanFilename = item.filename.replace(/"/g, '""');
        const cleanTitle = (item.title || '').replace(/"/g, '""');
        const cleanDesc = (item.description || '').replace(/"/g, '""');
        const cleanKeywords = (item.keywords || []).join(', ').replace(/"/g, '""');
        const cleanCategory = (item.assetType || 'Graphic Resources').replace(/"/g, '""');

        return `"${cleanFilename}","${cleanTitle}","${cleanDesc}","${cleanKeywords}","${cleanCategory}"`;
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `microstock_metadata_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Ekspor CSV Berhasil', `${completed.length} baris metadata telah diekspor.`, 'success');
}

function exportToJSON() {
    const data = state.assets.map(a => ({
        filename: a.filename,
        filePath: a.filePath,
        title: a.title,
        description: a.description,
        assetType: a.assetType,
        keywords: a.keywords,
        status: a.status
    }));

    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `microstock_metadata_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Ekspor JSON', 'Data metadata berhasil diekspor ke JSON.', 'success');
}

// UI Render & DOM Helpers
function updateStats() {
    const total = state.assets.length;
    const completed = state.assets.filter(a => a.status === 'completed').length;
    const processing = state.assets.filter(a => a.status === 'processing').length;
    const queued = state.assets.filter(a => a.status === 'queued' || a.status === 'error').length;

    document.getElementById('statTotal').textContent = total;
    document.getElementById('statCompleted').textContent = completed;
    document.getElementById('statProcessing').textContent = processing;
    document.getElementById('statConcurrency').textContent = `${state.concurrencyLimit} Threads (Pacing 2.5s)`;

    document.getElementById('countAll').textContent = total;
    document.getElementById('countQueued').textContent = queued + processing;
    document.getElementById('countDone').textContent = completed;
}

function renderAssets() {
    const container = document.getElementById('assetsGrid');
    const emptyState = document.getElementById('emptyState');
    if (!container) return;

    let filtered = state.assets;
    if (state.filter === 'queued') filtered = state.assets.filter(a => a.status === 'queued' || a.status === 'processing');
    if (state.filter === 'completed') filtered = state.assets.filter(a => a.status === 'completed');

    if (state.assets.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="py-12 text-center border border-slate-800/60 bg-slate-900/30 rounded-2xl text-slate-400 text-xs">
                <i class="fa-solid fa-filter mr-1.5 text-slate-500"></i> Tidak ada aset pada filter "<strong>${state.filter}</strong>".
            </div>
        `;
        return;
    }

    filtered.forEach((item) => {
        const card = document.createElement('div');
        const isProc = item.status === 'processing';
        const isDone = item.status === 'completed';
        const isErr = item.status === 'error';

        card.className = `bg-slate-900 border ${isProc ? 'border-indigo-500/80 processing-pulse' : isDone ? 'border-slate-800' : isErr ? 'border-rose-500/60' : 'border-slate-800/80'} rounded-2xl p-4 sm:p-5 transition shadow-lg`;
        card.id = `card_${item.id}`;

        const statusBadge = isProc
            ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20"><i class="fa-solid fa-spinner animate-spin text-[10px]"></i> Menganalisis & Injeksi IPTC...</span>`
            : isDone
                ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><i class="fa-solid fa-circle-check text-[10px]"></i> ${item.epsEmbedded ? 'Selesai (JPG + EPS Embedded)' : 'Selesai & IPTC Embedded'}</span>`
                : isErr
                    ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20"><i class="fa-solid fa-circle-xmark text-[10px]"></i> Gagal</span>`
                    : `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700"><i class="fa-solid fa-clock text-[10px]"></i> Menunggu Antrean</span>`;

        const titleLen = (item.title || '').length;
        const isOptimalTitle = titleLen >= 60 && titleLen <= 90;
        const errDiag = isErr && item.errorMsg ? parseErrorDiagnostic(item.errorMsg) : null;

        card.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                
                <!-- Left Thumbnail Column -->
                <div class="md:col-span-3 flex flex-col gap-2">
                    <div class="relative group rounded-xl overflow-hidden bg-slate-950 aspect-video md:aspect-square flex items-center justify-center border border-slate-800">
                        <img src="${item.previewUrl}" alt="${escapeHtml(item.filename)}" class="w-full h-full object-contain" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' fill=\'%23334155\'><rect width=\'100\' height=\'100\'/><text x=\'50%\' y=\'50%\' fill=\'%2394a3b8\' text-anchor=\'middle\' dy=\'.3em\' font-size=\'12\'>JPG File</text></svg>'" />
                        <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                            <span class="text-[10px] font-mono bg-black/70 backdrop-blur px-2 py-0.5 rounded text-slate-300">${escapeHtml(item.fileSize)}</span>
                            ${item.assetType && item.assetType !== 'Menunggu...' ? `<span class="text-[10px] font-semibold bg-indigo-600/90 text-white px-2 py-0.5 rounded">${escapeHtml(item.assetType)}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-slate-400 truncate px-0.5">
                        <span class="truncate font-mono text-[11px]" title="${escapeHtml(item.filePath || item.filename)}">${escapeHtml(item.filename)}</span>
                    </div>
                    <div class="pt-1 flex items-center gap-1.5">
                        ${statusBadge}
                        ${!isProc ? `
                            <button onclick="processSingleAsset('${item.id}')" class="text-xs px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition" title="Proses Ulang Item Ini">
                                <i class="fa-solid fa-rotate-right"></i>
                            </button>
                            <button onclick="removeAsset('${item.id}')" class="text-xs px-2.5 py-1 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg transition" title="Hapus Item">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>

                <!-- Right Metadata Inputs Column -->
                <div class="md:col-span-9 space-y-3.5">
                    
                    ${isErr && errDiag ? `
                        <div class="bg-rose-950/90 border border-rose-600/80 rounded-xl p-4 space-y-2.5 text-xs text-rose-100 shadow-xl mb-3">
                            <div class="flex items-center justify-between gap-2 border-b border-rose-800/80 pb-2">
                                <span class="font-bold text-rose-300 text-xs flex items-center gap-1.5">
                                    <i class="fa-solid fa-triangle-exclamation text-rose-400 text-sm"></i>
                                    <span>LAPORAN DIAGNOSTIK ERROR & SOLUSI</span>
                                </span>
                                <span class="text-[10px] bg-rose-600 text-white font-mono font-bold px-2 py-0.5 rounded shadow">Action Required</span>
                            </div>
                            
                            <div class="text-xs font-semibold text-rose-200 leading-relaxed">
                                📌 <strong class="text-white">Penyebab Error:</strong> ${escapeHtml(errDiag.cause)}
                            </div>

                            <div class="bg-slate-950/80 border border-rose-900/70 rounded-lg p-3 space-y-1.5 text-[11px]">
                                <div class="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                                    <i class="fa-solid fa-screwdriver-wrench text-amber-400"></i>
                                    <span>Langkah Perbaikan Yang Bisa Anda Lakukan:</span>
                                </div>
                                <ul class="list-disc list-inside space-y-1 text-slate-200 pl-1 leading-relaxed">
                                    ${errDiag.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
                                </ul>
                            </div>

                            <div class="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                                <span class="font-mono text-[10px] text-rose-300/70 truncate max-w-[320px]" title="${escapeHtml(item.errorMsg)}">
                                    Detail Pesan Teknis: ${escapeHtml(item.errorMsg)}
                                </span>
                                <button onclick="processSingleAsset('${item.id}')" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition flex items-center gap-1.5 shadow-md">
                                    <i class="fa-solid fa-rotate-right"></i> Coba Proses Ulang Item Ini
                                </button>
                            </div>
                        </div>
                    ` : ''}

                    
                    <!-- Title Field -->
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                <span>Title (Judul Komersial: Subjek + Gaya + Konteks)</span>
                                <button onclick="copyField('${item.id}', 'title')" class="text-slate-400 hover:text-indigo-400 transition" title="Salin Title">
                                    <i class="fa-regular fa-copy text-[11px]"></i>
                                </button>
                            </label>
                            <span id="titleCount_${item.id}" class="text-[11px] font-mono ${isOptimalTitle ? 'text-emerald-400 font-semibold' : titleLen > 90 ? 'text-amber-400 font-bold' : 'text-slate-400'}">
                                ${titleLen}/60-90 Karakter
                            </span>
                        </div>
                        <input 
                            type="text" 
                            value="${escapeHtml(item.title)}" 
                            placeholder="${isProc ? 'Gemini 2.5 Flash sedang menyusun judul komersial 60-90 karakter...' : 'Contoh: Isometric Cloud Datacenter Server 3D Render for Network Infrastructure Banner'}" 
                            oninput="updateAssetTitle('${item.id}', this.value)"
                            class="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                        />
                    </div>

                    <!-- Description Field -->
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                <span>Description (Deskripsi Nilai Komersial)</span>
                                <button onclick="copyField('${item.id}', 'desc')" class="text-slate-400 hover:text-indigo-400 transition" title="Salin Description">
                                    <i class="fa-regular fa-copy text-[11px]"></i>
                                </button>
                            </label>
                            <span class="text-[11px] font-mono text-slate-400">${(item.description || '').length} Karakter</span>
                        </div>
                        <textarea 
                            rows="2" 
                            placeholder="${isProc ? 'Meringkas fungsi visual aset untuk desainer & advertiser...' : 'Deskripsi komersial otomatis...'}"
                            oninput="updateAssetDesc('${item.id}', this.value)"
                            class="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                        >${escapeHtml(item.description)}</textarea>
                    </div>

                    <!-- Keywords Section -->
                    <div>
                        <div class="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-semibold text-slate-300">Keywords (${item.keywords.length})</span>
                                <button onclick="copyKeywords('${item.id}')" class="text-xs px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1" title="Salin semua tags format CSV">
                                    <i class="fa-regular fa-copy text-[10px]"></i> Salin Semua
                                </button>
                            </div>
                            <div class="text-[11px] font-mono">
                                <span class="${item.keywords.length < state.minKeywords ? 'text-amber-400' : 'text-emerald-400'} font-semibold">
                                    ${item.keywords.length} tags
                                </span> 
                                <span class="text-slate-400"> (rekomendasi: ${state.minKeywords}-${state.maxKeywords})</span>
                            </div>
                        </div>

                        <!-- Chips Container -->
                        <div class="min-h-[64px] max-h-[140px] overflow-y-auto bg-slate-950/90 border border-slate-800/90 rounded-xl p-2.5 flex flex-wrap gap-1.5 items-start">
                            ${item.keywords.length === 0 ? `
                                <span class="text-xs text-slate-600 italic py-1 px-1">
                                    ${isProc ? 'Mengekstraksi kata kunci spesifik dan relevan tanpa trademark spam...' : 'Belum ada keywords.'}
                                </span>
                            ` : ''}

                            ${item.keywords.map((kw, kwIdx) => `
                                <span class="badge-chip inline-flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-slate-300 px-2.5 py-1 rounded-lg text-xs transition">
                                    <span class="text-[10px] text-slate-500 font-mono">#${kwIdx + 1}</span>
                                    <span>${escapeHtml(kw)}</span>
                                    <button onclick="removeKeyword('${item.id}', ${kwIdx})" class="badge-delete text-slate-400 hover:text-rose-400 transition ml-0.5" title="Hapus keyword">
                                        <i class="fa-solid fa-xmark text-[10px]"></i>
                                    </button>
                                </span>
                            `).join('')}
                        </div>

                        <!-- Quick Keyword Adder -->
                        <div class="mt-2 flex gap-2">
                            <div class="relative flex-1">
                                <input 
                                    type="text" 
                                    id="kwInput_${item.id}"
                                    placeholder="Tambah keyword (1 kata tanpa spasi, pisahkan spasi/koma)..."
                                    onkeydown="handleKeywordKeydown(event, '${item.id}')"
                                    class="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                                />
                            </div>
                            <button onclick="addManualKeyword('${item.id}')" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition">
                                <i class="fa-solid fa-plus mr-1"></i> Tambah
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        `;

        container.appendChild(card);
    });
}

function updateAssetTitle(id, val) {
    const asset = state.assets.find(a => a.id === id);
    if (asset) {
        asset.title = val;
        const counter = document.getElementById(`titleCount_${id}`);
        if (counter) {
            const isOptimal = val.length >= 60 && val.length <= 90;
            counter.textContent = `${val.length}/60-90 Karakter`;
            counter.className = `text-[11px] font-mono ${isOptimal ? 'text-emerald-400 font-semibold' : val.length > 90 ? 'text-amber-400 font-bold' : 'text-slate-400'}`;
        }
    }
}

function updateAssetDesc(id, val) {
    const asset = state.assets.find(a => a.id === id);
    if (asset) asset.description = val;
}

function removeKeyword(assetId, kwIndex) {
    const asset = state.assets.find(a => a.id === assetId);
    if (asset && asset.keywords) {
        asset.keywords.splice(kwIndex, 1);
        renderAssets();
    }
}

function addManualKeyword(assetId) {
    const input = document.getElementById(`kwInput_${assetId}`);
    if (!input) return;
    const val = input.value.trim().toLowerCase();
    if (!val) return;

    const asset = state.assets.find(a => a.id === assetId);
    if (asset) {
        const rawTokens = val.split(/[\s,;.+/_|\\-]+/);
        for (const raw of rawTokens) {
            const cleanWord = sanitizeWord(raw);
            if (cleanWord.length > 1 && !STOPWORDS.has(cleanWord) && !asset.keywords.includes(cleanWord)) {
                asset.keywords.push(cleanWord);
            }
        }
        input.value = '';
        renderAssets();
    }
}

function handleKeywordKeydown(event, assetId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addManualKeyword(assetId);
    }
}

function copyField(assetId, field) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset) return;
    if (field === 'title') copyToClipboard(asset.title, "Title disalin ke clipboard!");
    if (field === 'desc') copyToClipboard(asset.description, "Description disalin ke clipboard!");
}

function copyKeywords(assetId) {
    const asset = state.assets.find(a => a.id === assetId);
    if (!asset || !asset.keywords.length) return;
    copyToClipboard(asset.keywords.join(', '), `${asset.keywords.length} keywords disalin (format koma)!`);
}

function removeAsset(id) {
    const idx = state.assets.findIndex(a => a.id === id);
    if (idx !== -1) {
        state.assets.splice(idx, 1);
        updateStats();
        renderAssets();
        showToast('Aset Dihapus', 'Gambar dihapus dari daftar.', 'info');
    }
}

// Load Demo Sample Assets tailored to Niche Theme Category
function loadDemoSamples() {
    const themeSampleMap = {
        text_effect: [
            { name: "3d_gold_editable_text_effect_psd.jpg", type: "Text Effect" },
            { name: "neon_glowing_typography_text_style.jpg", type: "Text Effect" }
        ],
        vector_illustration: [
            { name: "flat_character_vector_illustration_set.jpg", type: "Vector Illustration" },
            { name: "autumn_landscape_vector_art.jpg", type: "Vector Illustration" }
        ],
        ui_ux: [
            { name: "fintech_mobile_app_ui_ux_kit_dashboard.jpg", type: "UI/UX Component" },
            { name: "e_commerce_web_header_ui_component.jpg", type: "UI/UX Component" }
        ],
        icon_set: [
            { name: "3d_finance_and_crypto_icon_pack_vector.jpg", type: "Icon Set" },
            { name: "minimalist_line_icons_collection_set.jpg", type: "Icon Set" }
        ],
        isometric: [
            { name: "isometric_smart_city_cloud_technology_3d.jpg", type: "Isometric 3D" },
            { name: "isometric_office_workspace_interior_vector.jpg", type: "Isometric 3D" }
        ],
        social_media: [
            { name: "cyber_monday_sale_social_media_poster.jpg", type: "Social Media Poster" },
            { name: "business_conference_flyer_banner_template.jpg", type: "Flyer Banner" }
        ],
        render_3d: [
            { name: "3d_glassmorphic_sphere_abstract_render.jpg", type: "3D Render" },
            { name: "3d_golden_trophy_podium_stage_isolated.jpg", type: "3D Render" }
        ],
        pattern: [
            { name: "seamless_tropical_floral_leaves_pattern.jpg", type: "Seamless Pattern" },
            { name: "abstract_geometric_memphis_pattern_texture.jpg", type: "Seamless Pattern" }
        ],
        character: [
            { name: "cute_robot_mascot_character_poses_vector.jpg", type: "Character Mascot" },
            { name: "superhero_brand_mascot_digital_illustration.jpg", type: "Character Mascot" }
        ],
        logo_emblem: [
            { name: "vintage_coffee_shop_badge_logo_emblem.jpg", type: "Logo Badge" },
            { name: "modern_abstract_tech_logo_identity.jpg", type: "Logo Badge" }
        ],
        background: [
            { name: "fluid_gradient_abstract_liquid_background.jpg", type: "Background Texture" },
            { name: "luxury_gold_marbled_texture_background.jpg", type: "Background Texture" }
        ]
    };

    const currentTheme = state.nicheTheme || "auto";
    const samples = themeSampleMap[currentTheme] || [
        { name: "3d_gold_editable_text_effect_psd.jpg", type: "Text Effect" },
        { name: "isometric_cloud_hosting_server_3d.jpg", type: "Isometric 3D" },
        { name: "fintech_mobile_app_ui_ux_kit_dashboard.jpg", type: "UI/UX Component" }
    ];

    samples.forEach(s => {
        const assetId = 'asset_demo_' + Math.random().toString(36).substr(2, 7);
        state.assets.push({
            id: assetId,
            filename: s.name,
            filePath: `C:\\SampleImages\\${s.name}`,
            fileSize: "45.2 KB",
            previewUrl: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' fill='%230f172a'><rect width='400' height='300'/><text x='50%' y='50%' fill='%23f59e0b' text-anchor='middle' font-size='14' font-weight='bold'>${s.type.toUpperCase()}</text></svg>`,
            status: 'queued',
            title: '',
            description: '',
            assetType: s.type,
            keywords: []
        });
    });

    updateStats();
    renderAssets();
    const themeLabel = currentTheme === 'auto' ? 'Auto-Detect' : currentTheme.replace('_', ' ').toUpperCase();
    showToast('Sampel Tema Dimuat', `${samples.length} aset sampel tema [${themeLabel}] siap diuji coba!`, 'success');
}

// Global Event Listeners Init
window.addEventListener('DOMContentLoaded', async () => {
    // DropZone & File Picker
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', triggerFilePicker);

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            Array.from(e.target.files).forEach(file => {
                const assetId = 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                state.assets.push({
                    id: assetId,
                    filename: file.name,
                    filePath: file.name,
                    fileSize: (file.size / 1024).toFixed(1) + ' KB',
                    previewUrl: URL.createObjectURL(file),
                    status: 'queued',
                    title: '',
                    description: '',
                    assetType: 'Menunggu...',
                    keywords: []
                });
            });
            updateStats();
            renderAssets();
            fileInput.value = '';
        }
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('border-indigo-500', 'bg-slate-900/90');
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-indigo-500', 'bg-slate-900/90');
        });
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            Array.from(e.dataTransfer.files).forEach(file => {
                const assetId = 'asset_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                state.assets.push({
                    id: assetId,
                    filename: file.name,
                    filePath: file.path || file.name,
                    fileSize: (file.size / 1024).toFixed(1) + ' KB',
                    previewUrl: URL.createObjectURL(file),
                    status: 'queued',
                    title: '',
                    description: '',
                    assetType: 'Menunggu...',
                    keywords: []
                });
            });
            updateStats();
            renderAssets();
            showToast('Aset Ditambahkan', `${e.dataTransfer.files.length} file ditambahkan dari Drag & Drop.`, 'info');
        }
    });

    // Control Buttons
    const btnLoadDemo = document.getElementById('btnLoadDemo');
    if (btnLoadDemo) btnLoadDemo.addEventListener('click', loadDemoSamples);
    document.getElementById('btnProcessQueue').addEventListener('click', processBatchQueue);
    document.getElementById('btnExportCSV').addEventListener('click', exportToCSV);
    document.getElementById('btnExportJSON').addEventListener('click', exportToJSON);

    document.getElementById('btnClearAll').addEventListener('click', () => {
        if (state.assets.length === 0) return;
        state.assets = [];
        updateStats();
        renderAssets();
        showToast('Dibersihkan', 'Semua aset dihapus dari daftar.', 'info');
    });

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('bg-indigo-600', 'text-white', 'active');
                b.classList.add('text-slate-400');
            });
            btn.classList.add('bg-indigo-600', 'text-white', 'active');
            btn.classList.remove('text-slate-400');

            if (btn.id === 'filterAll') state.filter = 'all';
            if (btn.id === 'filterQueued') state.filter = 'queued';
            if (btn.id === 'filterCompleted') state.filter = 'completed';

            renderAssets();
        });
    });

    // Niche Theme Selector
    const nicheThemeSelect = document.getElementById('nicheThemeSelect');
    if (nicheThemeSelect) {
        nicheThemeSelect.addEventListener('change', (e) => {
            state.nicheTheme = e.target.value;
            const selectedText = e.target.options[e.target.selectedIndex].text;
            showToast('Tema Kategori Dipilih', `Kurasi AI disesuaikan untuk: ${selectedText}`, 'info');
        });
    }

    // Preset Selector
    const platformSelect = document.getElementById('platformPreset');
    platformSelect.addEventListener('change', (e) => {
        state.preset = e.target.value;
        const config = PRESETS[state.preset] || PRESETS.universal;
        state.minKeywords = config.minKeywords;
        state.maxKeywords = config.maxKeywords;
        document.getElementById('minKeywordsInput').value = config.minKeywords;
        document.getElementById('maxKeywordsInput').value = config.maxKeywords;
        showToast('Preset Berubah', `Menggunakan konfigurasi optimal untuk ${config.name}`, 'info');
        renderAssets();
    });

    // Settings Modal & API Key Rotation
    const settingsModal = document.getElementById('settingsModal');
    const btnSettings = document.getElementById('btnSettings');
    const btnCloseSettings = document.getElementById('btnCloseSettings');
    const btnSaveSettings = document.getElementById('btnSaveSettings');
    const concurrencyRange = document.getElementById('concurrencyRange');
    const concurrencyVal = document.getElementById('concurrencyVal');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const btnUploadKeysTxt = document.getElementById('btnUploadKeysTxt');
    const keysFileInput = document.getElementById('keysFileInput');

    let isApiKeyVisible = false;

    function applyApiKeySensorState() {
        const apiKeyEyeIcon = document.getElementById('apiKeyEyeIcon');
        const apiKeyEyeText = document.getElementById('apiKeyEyeText');

        if (apiKeyInput) {
            if (isApiKeyVisible) {
                apiKeyInput.classList.remove('masked-api-key');
                apiKeyInput.classList.add('unmasked-api-key');
            } else {
                apiKeyInput.classList.remove('unmasked-api-key');
                apiKeyInput.classList.add('masked-api-key');
            }
        }

        if (apiKeyEyeIcon && apiKeyEyeText) {
            if (isApiKeyVisible) {
                apiKeyEyeIcon.className = 'fa-solid fa-eye-slash text-amber-400';
                apiKeyEyeText.textContent = 'Sembunyikan';
            } else {
                apiKeyEyeIcon.className = 'fa-solid fa-eye text-indigo-400';
                apiKeyEyeText.textContent = 'Lihat Key';
            }
        }
    }

    const btnToggleApiKeySensor = document.getElementById('btnToggleApiKeySensor');
    if (btnToggleApiKeySensor) {
        btnToggleApiKeySensor.addEventListener('click', () => {
            isApiKeyVisible = !isApiKeyVisible;
            applyApiKeySensorState();
            const lines = apiKeyInput ? apiKeyInput.value.split('\n').map(s => s.trim()).filter(Boolean) : [];
            updateKeyRotationUI(lines, false);
        });
    }

    function updateKeyRotationUI(keys = [], syncTextarea = true) {
        const keyCountBadge = document.getElementById('keyCountBadge');
        const apiKeysList = document.getElementById('apiKeysList');

        const cleanKeys = Array.isArray(keys) ? keys : (typeof keys === 'string' ? keys.split(/[\n,]+/).map(k => k.trim()).filter(Boolean) : []);
        const count = cleanKeys.length;

        if (keyCountBadge) {
            keyCountBadge.textContent = `${count} / 30 API Keys`;
            keyCountBadge.className = `text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                count > 0 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`;
        }

        if (syncTextarea && apiKeyInput) {
            apiKeyInput.value = cleanKeys.join('\n');
        }

        if (apiKeysList) {
            apiKeysList.innerHTML = '';
            cleanKeys.forEach((key, idx) => {
                let displayText = '';
                if (isApiKeyVisible) {
                    displayText = key.length > 12 ? `${key.substring(0, 6)}...${key.substring(key.length - 4)}` : key;
                } else {
                    displayText = '*'.repeat(Math.min(key.length, 20));
                }

                const chip = document.createElement('span');
                chip.className = 'inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700 shadow-sm';
                chip.innerHTML = `
                    <span class="w-1.5 h-1.5 rounded-full ${isApiKeyVisible ? 'bg-amber-400' : 'bg-indigo-400'}"></span>
                    <span>#${idx + 1}: ${escapeHtml(displayText)}</span>
                    <button type="button" class="text-slate-500 hover:text-rose-400 ml-0.5 transition" title="Hapus Key #${idx + 1}" onclick="removeSingleKey(${idx})">
                        <i class="fa-solid fa-xmark text-[10px]"></i>
                    </button>
                `;
                apiKeysList.appendChild(chip);
            });
        }
    }

    window.removeSingleKey = async (idx) => {
        if (!apiKeyInput) return;
        const currentLines = apiKeyInput.value.split('\n').map(s => s.trim()).filter(Boolean);
        if (idx >= 0 && idx < currentLines.length) {
            currentLines.splice(idx, 1);
            apiKeyInput.value = currentLines.join('\n');

            if (window.pywebview && window.pywebview.api && window.pywebview.api.save_api_keys) {
                try {
                    const res = await window.pywebview.api.save_api_keys(currentLines);
                    updateKeyRotationUI(res.keys || currentLines, true);
                    showToast('API Key Dihapus', `Key #${idx + 1} dihapus. Sisa ${res.count || currentLines.length} keys aktif.`, 'info');
                } catch (err) {
                    console.error("Gagal menghapus key:", err);
                }
            } else {
                updateKeyRotationUI(currentLines, true);
            }
        }
    };

    // Live update UI chips as user types or edits textarea without breaking multiline typing / Enter key
    apiKeyInput.addEventListener('input', () => {
        const lines = apiKeyInput.value.split('\n').map(s => s.trim()).filter(Boolean);
        updateKeyRotationUI(lines, false);
    });

    // Upload TXT File Trigger
    btnUploadKeysTxt.addEventListener('click', async () => {
        if (window.pywebview && window.pywebview.api && window.pywebview.api.select_keys_file) {
            try {
                const res = await window.pywebview.api.select_keys_file();
                if (res.status === 'success') {
                    showToast('File TXT Berhasil Dimuat', `Berhasil memuat ${res.count} API Key dari ${res.filename || 'file'}!`, 'success');
                    updateKeyRotationUI(res.keys || []);
                } else if (res.status === 'cancelled') {
                    // ignore
                } else {
                    showToast('Gagal Memuat TXT', res.message || 'Error membaca file TXT', 'error');
                }
            } catch (err) {
                showToast('Error Native Dialog', err.message, 'error');
            }
        } else {
            // Fallback to web input element
            keysFileInput.click();
        }
    });

    keysFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (evt) => {
                const content = evt.target.result;
                const lines = content.replace(/\r\n/g, '\n').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
                const keys = lines.slice(0, 30);
                apiKeyInput.value = keys.join('\n');
                updateKeyRotationUI(keys);

                if (window.pywebview && window.pywebview.api && window.pywebview.api.save_api_keys) {
                    try {
                        const res = await window.pywebview.api.save_api_keys(keys);
                        showToast('Key TXT Dimuat', res.message, 'success');
                    } catch (err) {
                        showToast('Error Config', err.message, 'error');
                    }
                } else {
                    showToast('Key TXT Dimuat', `Berhasil membaca ${keys.length} API Key dari ${file.name}!`, 'success');
                }
            };
            reader.readAsText(file);
            keysFileInput.value = '';
        }
    });

    btnSettings.addEventListener('click', async () => {
        if (window.pywebview && window.pywebview.api && window.pywebview.api.get_api_keys) {
            try {
                const keys = await window.pywebview.api.get_api_keys();
                updateKeyRotationUI(keys || []);
            } catch (err) {
                console.warn("Gagal membaca API Keys dari python:", err);
            }
        } else {
            const lines = apiKeyInput.value.split('\n').map(s => s.trim()).filter(Boolean);
            updateKeyRotationUI(lines);
        }
        settingsModal.classList.remove('hidden');
    });

    btnCloseSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    concurrencyRange.addEventListener('input', (e) => {
        concurrencyVal.textContent = e.target.value;
    });

    btnSaveSettings.addEventListener('click', async () => {
        state.concurrencyLimit = parseInt(concurrencyRange.value, 10) || 2;
        state.minKeywords = parseInt(document.getElementById('minKeywordsInput').value, 10) || 30;
        state.maxKeywords = parseInt(document.getElementById('maxKeywordsInput').value, 10) || 45;
        state.customNotes = document.getElementById('customPromptNotes').value.trim();

        const inputRaw = apiKeyInput.value.trim();
        if (window.pywebview && window.pywebview.api && window.pywebview.api.save_api_keys) {
            try {
                const res = await window.pywebview.api.save_api_keys(inputRaw);
                if (res.status === 'success') {
                    showToast('Pengaturan Disimpan', `${res.count} API Key tersimpan aktif (Auto-Rolling). Concurrency: ${state.concurrencyLimit} workers.`, 'success');
                    updateKeyRotationUI(res.keys || []);
                } else {
                    showToast('Peringatan', res.message, 'warning');
                }
            } catch (err) {
                showToast('Error Config', err.message, 'error');
            }
        } else {
            const lines = inputRaw.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 30);
            updateKeyRotationUI(lines);
            showToast('Pengaturan Disimpan', `${lines.length} API Key dikonfigurasi. Concurrency: ${state.concurrencyLimit} workers | Keywords: ${state.minKeywords}-${state.maxKeywords}`, 'success');
        }

        updateStats();
        settingsModal.classList.add('hidden');
    });

    // Expose Global Window Helpers
    window.processSingleAsset = processSingleAsset;
    window.removeAsset = removeAsset;
    window.copyField = copyField;
    window.copyKeywords = copyKeywords;
    window.removeKeyword = removeKeyword;
    window.addManualKeyword = addManualKeyword;
    window.handleKeywordKeydown = handleKeywordKeydown;
    window.updateAssetTitle = updateAssetTitle;
    window.updateAssetDesc = updateAssetDesc;

    // In-App Auto-Update System Logic
    let activeUpdatePayload = null;

    async function checkForUpdates(isManual = false) {
        if (!window.pywebview || !window.pywebview.api || !window.pywebview.api.check_for_updates) {
            if (isManual) {
                showToast('Mode Browser', 'Fitur Auto-Update hanya aktif di lingkungan PyWebView Desktop Windows.', 'warning');
            }
            return;
        }

        try {
            if (isManual) {
                showToast('Pemeriksaan Pembaruan', 'Menghubungkan ke server pembaruan...', 'info');
            }

            const res = await window.pywebview.api.check_for_updates();

            if (res && res.current_version) {
                const elVer = document.getElementById('settingsCurrentVersion');
                if (elVer) elVer.textContent = `v${res.current_version}`;
            }

            if (res && res.status === 'success' && res.has_update) {
                activeUpdatePayload = res;

                const updateBanner = document.getElementById('updateBanner');
                const updateTitle = document.getElementById('updateTitle');
                const updateVersionBadge = document.getElementById('updateVersionBadge');
                const updateReleaseNotes = document.getElementById('updateReleaseNotes');

                if (updateTitle) updateTitle.textContent = `Pembaruan v${res.latest_version} Telah Tersedia!`;
                if (updateVersionBadge) updateVersionBadge.textContent = `v${res.latest_version}`;
                if (updateReleaseNotes) updateReleaseNotes.textContent = res.release_notes || 'Pembaruan versi terbaru siap diinstal.';

                if (updateBanner) {
                    updateBanner.classList.remove('hidden');
                }

                addLog(`[AUTO-UPDATE] Pembaruan v${res.latest_version} tersedia: ${res.download_url}`, 'info');
                showToast('Pembaruan Tersedia!', `StockMeta Studio v${res.latest_version} siap diinstal.`, 'info');
            } else {
                if (isManual) {
                    const currentVer = (res && res.current_version) || '1.0.0';
                    showToast('Versi Terkini', `Aplikasi Anda sudah menggunakan versi terbaru (v${currentVer}).`, 'success');
                }
                addLog(`[AUTO-UPDATE] Aplikasi menggunakan versi terkini (v${(res && res.current_version) || '1.0.0'}).`, 'info');
            }
        } catch (err) {
            console.error("[AUTO-UPDATE ERROR]", err);
            addLog(`[AUTO-UPDATE ERROR] Gagal memeriksa pembaruan: ${err.message || err}`, 'error');
            if (isManual) {
                showToast('Gagal Cek Update', err.message || 'Tidak dapat terhubung ke server pembaruan.', 'error');
            }
        }
    }

    function initAutoUpdateUI() {
        const btnDismissUpdate = document.getElementById('btnDismissUpdate');
        const btnApplyUpdate = document.getElementById('btnApplyUpdate');
        const btnManualCheckUpdate = document.getElementById('btnManualCheckUpdate');
        const updateBanner = document.getElementById('updateBanner');
        const updateProgressOverlay = document.getElementById('updateProgressOverlay');
        const updateProgressStatus = document.getElementById('updateProgressStatus');

        if (btnDismissUpdate) {
            btnDismissUpdate.addEventListener('click', () => {
                if (updateBanner) {
                    updateBanner.classList.add('hidden');
                }
                addLog('[AUTO-UPDATE] Banner pembaruan ditutup oleh pengguna.', 'info');
            });
        }

        if (btnApplyUpdate) {
            btnApplyUpdate.addEventListener('click', async () => {
                if (!activeUpdatePayload || !activeUpdatePayload.download_url) {
                    showToast('Error Update', 'URL unduhan pembaruan tidak ditemukan.', 'error');
                    return;
                }

                if (!window.pywebview || !window.pywebview.api || !window.pywebview.api.apply_update) {
                    showToast('Mode Browser', 'Fungsi auto-update memerlukan PyWebView biner.', 'warning');
                    return;
                }

                btnApplyUpdate.disabled = true;
                btnDismissUpdate.disabled = true;
                btnApplyUpdate.classList.add('opacity-50', 'cursor-not-allowed');

                if (updateProgressOverlay) updateProgressOverlay.classList.remove('hidden');
                if (updateProgressStatus) updateProgressStatus.textContent = `Mengunduh paket biner v${activeUpdatePayload.latest_version}...`;

                addLog(`[AUTO-UPDATE] Memulai unduhan update dari: ${activeUpdatePayload.download_url}`, 'info');

                try {
                    const res = await window.pywebview.api.apply_update(activeUpdatePayload.download_url);
                    if (res && res.status === 'success') {
                        if (updateProgressStatus) {
                            updateProgressStatus.textContent = 'Pembaruan berhasil diunduh! Memulai ulang aplikasi...';
                        }
                        showToast('Update Berhasil', res.message || 'Aplikasi akan restart secara otomatis.', 'success');
                        addLog('[AUTO-UPDATE] Launcher script dieksekusi. Memulai ulang aplikasi...', 'success');
                    } else {
                        throw new Error(res.message || 'Gagal menerapkan pembaruan.');
                    }
                } catch (err) {
                    console.error("[APPLY UPDATE ERROR]", err);
                    if (updateProgressOverlay) updateProgressOverlay.classList.add('hidden');
                    btnApplyUpdate.disabled = false;
                    btnDismissUpdate.disabled = false;
                    btnApplyUpdate.classList.remove('opacity-50', 'cursor-not-allowed');
                    showToast('Gagal Update', err.message || 'Terjadi kesalahan saat mengunduh update.', 'error');
                    addLog(`[AUTO-UPDATE ERROR] ${err.message || err}`, 'error');
                }
            });
        }

        if (btnManualCheckUpdate) {
            btnManualCheckUpdate.addEventListener('click', () => {
                checkForUpdates(true);
            });
        }
    }

    initAutoUpdateUI();

    // Load initial key and check updates if PyWebView bridge ready
    window.addEventListener('pywebviewready', async () => {
        if (window.pywebview && window.pywebview.api) {
            if (window.pywebview.api.get_api_keys) {
                const keys = await window.pywebview.api.get_api_keys();
                if (keys && keys.length > 0) {
                    updateKeyRotationUI(keys);
                    showToast('Aplikasi Siap', `${keys.length} Kunci API Gemini terhubung (Auto-Rolling).`, 'success');
                } else {
                    showToast('Perhatian', 'Kunci API Gemini belum dikonfigurasi. Buka menu Pengaturan.', 'warning');
                }
            }

            // Run update check in background worker
            setTimeout(() => {
                checkForUpdates(false);
            }, 600);
        }
    });

    // Console Log Realtime Modal Controls
    const consoleLogModal = document.getElementById('consoleLogModal');
    const btnOpenConsoleLog = document.getElementById('btnOpenConsoleLog');
    const btnCloseConsoleLog = document.getElementById('btnCloseConsoleLog');
    const btnCloseConsoleLogBottom = document.getElementById('btnCloseConsoleLogBottom');
    const btnClearLog = document.getElementById('btnClearLog');
    const btnCopyLog = document.getElementById('btnCopyLog');

    const logFilterAll = document.getElementById('logFilterAll');
    const logFilterError = document.getElementById('logFilterError');
    const logFilterSuccess = document.getElementById('logFilterSuccess');

    if (btnOpenConsoleLog) {
        btnOpenConsoleLog.addEventListener('click', () => {
            if (consoleLogModal) {
                consoleLogModal.classList.remove('hidden');
                renderLogs();
            }
        });
    }

    if (btnCloseConsoleLog) {
        btnCloseConsoleLog.addEventListener('click', () => {
            if (consoleLogModal) consoleLogModal.classList.add('hidden');
        });
    }

    if (btnCloseConsoleLogBottom) {
        btnCloseConsoleLogBottom.addEventListener('click', () => {
            if (consoleLogModal) consoleLogModal.classList.add('hidden');
        });
    }

    if (btnClearLog) {
        btnClearLog.addEventListener('click', () => {
            loggerState.logs = [];
            loggerState.hasError = false;
            updateLogErrorStatus(false);
            renderLogs();
            showToast('Log Dibersihkan', 'Riwayat console log telah dikosongkan.', 'info');
        });
    }

    if (btnCopyLog) {
        btnCopyLog.addEventListener('click', () => {
            if (loggerState.logs.length === 0) {
                showToast('Log Kosong', 'Tidak ada baris log untuk disalin.', 'warning');
                return;
            }
            const rawText = loggerState.logs.map(l => `[${l.time}] [${l.type.toUpperCase()}] ${l.msg}`).join('\n');
            copyToClipboard(rawText, 'Seluruh riwayat console log berhasil disalin!');
        });
    }

    function setActiveLogFilter(activeBtn, filterName) {
        [logFilterAll, logFilterError, logFilterSuccess].forEach(btn => {
            if (btn) {
                btn.classList.remove('bg-indigo-600', 'text-white');
                btn.classList.add('bg-slate-800', 'text-slate-400');
            }
        });
        if (activeBtn) {
            activeBtn.classList.remove('bg-slate-800', 'text-slate-400');
            activeBtn.classList.add('bg-indigo-600', 'text-white');
        }
        loggerState.filter = filterName;
        renderLogs();
    }

    if (logFilterAll) logFilterAll.addEventListener('click', () => setActiveLogFilter(logFilterAll, 'all'));
    if (logFilterError) logFilterError.addEventListener('click', () => setActiveLogFilter(logFilterError, 'error'));
    if (logFilterSuccess) logFilterSuccess.addEventListener('click', () => setActiveLogFilter(logFilterSuccess, 'success'));

    // License Modal Controls
    const licenseModal = document.getElementById('licenseModal');
    const btnLicense = document.getElementById('btnLicense');
    const btnCloseLicense = document.getElementById('btnCloseLicense');
    const btnCloseLicenseBottom = document.getElementById('btnCloseLicenseBottom');

    if (btnLicense && licenseModal) {
        btnLicense.addEventListener('click', () => licenseModal.classList.remove('hidden'));
    }
    if (btnCloseLicense && licenseModal) {
        btnCloseLicense.addEventListener('click', () => licenseModal.classList.add('hidden'));
    }
    if (btnCloseLicenseBottom && licenseModal) {
        btnCloseLicenseBottom.addEventListener('click', () => licenseModal.classList.add('hidden'));
    }

    // FAQ & User Guide Modal Controls
    const faqModal = document.getElementById('faqModal');
    const btnFAQ = document.getElementById('btnFAQ');
    const btnCloseFAQ = document.getElementById('btnCloseFAQ');
    const btnCloseFAQBottom = document.getElementById('btnCloseFAQBottom');

    if (btnFAQ && faqModal) {
        btnFAQ.addEventListener('click', () => faqModal.classList.remove('hidden'));
    }
    if (btnCloseFAQ && faqModal) {
        btnCloseFAQ.addEventListener('click', () => faqModal.classList.add('hidden'));
    }
    if (btnCloseFAQBottom && faqModal) {
        btnCloseFAQBottom.addEventListener('click', () => faqModal.classList.add('hidden'));
    }

    updateStats();
});

