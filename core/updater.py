import os
import sys
import re
import tempfile
import subprocess
import threading
import httpx
from packaging import version as pkg_version

CURRENT_VERSION = "1.0.0"
DEFAULT_UPDATE_URL = "https://raw.githubusercontent.com/Bayunity-Brkhstd/brkh-keyword/main/version.json"


def parse_version_tuple(v_str: str) -> tuple:
    """Fallback semver parser if packaging.version parsing fails."""
    clean = re.sub(r'[^0-9.]', '', str(v_str).lstrip('v'))
    parts = [int(p) for p in clean.split('.') if p.isdigit()]
    while len(parts) < 3:
        parts.append(0)
    return tuple(parts[:3])


def is_newer_version(remote_ver: str, current_ver: str = CURRENT_VERSION) -> bool:
    """Compare remote version against current version."""
    try:
        return pkg_version.parse(remote_ver) > pkg_version.parse(current_ver)
    except Exception:
        return parse_version_tuple(remote_ver) > parse_version_tuple(current_ver)


def check_for_updates(update_url: str = DEFAULT_UPDATE_URL) -> dict:
    """
    Check remote endpoint for update metadata.
    Uses httpx with a strict 5-second timeout to avoid blocking main app startup.
    """
    try:
        headers = {
            "User-Agent": "StockMetaStudio-Updater/1.0",
            "Accept": "application/json"
        }
        with httpx.Client(timeout=5.0, follow_redirects=True, headers=headers) as client:
            resp = client.get(update_url)
            resp.raise_for_status()
            data = resp.json()

        # Handle standard version.json format or GitHub Releases API format
        if isinstance(data, dict):
            latest_version = data.get("version") or data.get("latest_version") or data.get("tag_name", "")
            latest_version = str(latest_version).lstrip('v').strip()
            
            download_url = data.get("download_url", "")
            release_notes = data.get("release_notes") or data.get("body") or "Pembaruan versi terbaru telah tersedia."

            # If GitHub API release structure without direct download_url
            if not download_url and "assets" in data and isinstance(data["assets"], list):
                for asset in data["assets"]:
                    asset_name = asset.get("name", "").lower()
                    if asset_name.endswith(".exe") or asset_name.endswith(".zip"):
                        download_url = asset.get("browser_download_url", "")
                        break
                if not download_url and data["assets"]:
                    download_url = data["assets"][0].get("browser_download_url", "")

            has_update = is_newer_version(latest_version, CURRENT_VERSION) if latest_version else False

            return {
                "status": "success",
                "has_update": has_update,
                "current_version": CURRENT_VERSION,
                "latest_version": latest_version or CURRENT_VERSION,
                "download_url": download_url,
                "release_notes": release_notes
            }
        else:
            return {
                "status": "error",
                "has_update": False,
                "current_version": CURRENT_VERSION,
                "latest_version": CURRENT_VERSION,
                "download_url": "",
                "release_notes": "",
                "message": "Format respon endpoint tidak valid."
            }

    except Exception as e:
        print(f"[UPDATER WARNING] Gagal memeriksa pembaruan: {e}")
        return {
            "status": "error",
            "has_update": False,
            "current_version": CURRENT_VERSION,
            "latest_version": CURRENT_VERSION,
            "download_url": "",
            "release_notes": "",
            "message": str(e)
        }


def apply_update(download_url: str) -> dict:
    """
    Download the update file and execute Windows detached launcher script to bypass file locking.
    """
    if not download_url:
        return {
            "status": "error",
            "message": "URL unduhan pembaruan tidak ditemukan."
        }

    try:
        temp_dir = tempfile.gettempdir()
        file_ext = ".exe" if ".exe" in download_url.lower() else ".tmp"
        downloaded_file = os.path.join(temp_dir, f"stockmeta_update_{os.getpid()}{file_ext}")

        # Download update binary with httpx
        headers = {"User-Agent": "StockMetaStudio-Updater/1.0"}
        with httpx.Client(timeout=60.0, follow_redirects=True, headers=headers) as client:
            with client.stream("GET", download_url) as resp:
                resp.raise_for_status()
                with open(downloaded_file, "wb") as f:
                    for chunk in resp.iter_bytes(chunk_size=8192):
                        f.write(chunk)

        is_frozen = getattr(sys, 'frozen', False)
        if is_frozen:
            target_file = os.path.abspath(sys.executable)
        else:
            target_file = os.path.abspath(sys.argv[0])

        batch_file = os.path.join(temp_dir, f"update_runner_{os.getpid()}.bat")
        
        # Create detached update runner batch script
        batch_content = f"""@echo off
title StockMeta Studio Auto-Updater
echo Menunggu aplikasi utama berhenti...
timeout /t 2 /nobreak > nul

echo Memperbarui file executable...
copy /y "{downloaded_file}" "{target_file}"

if exist "{downloaded_file}" del /f /q "{downloaded_file}"

echo Memulai ulang aplikasi StockMeta Studio...
start "" "{target_file}"

(goto 2 2>nul & del "%~f0")
"""
        with open(batch_file, "w", encoding="utf-8") as f:
            f.write(batch_content)

        # Launch batch file detached
        if sys.platform == "win32":
            creationflags = subprocess.DETACHED_PROCESS | subprocess.CREATE_NEW_PROCESS_GROUP
            subprocess.Popen(["cmd.exe", "/c", batch_file], creationflags=creationflags, close_fds=True)
        else:
            subprocess.Popen(["bash", batch_file])

        # Schedule python process exit after 1 second to allow PyWebView to return response to JS
        def delayed_exit():
            sys.exit(0)

        timer = threading.Timer(1.0, delayed_exit)
        timer.daemon = True
        timer.start()

        return {
            "status": "success",
            "message": "Pembaruan berhasil diunduh. Aplikasi akan restart secara otomatis..."
        }

    except Exception as e:
        print(f"[UPDATER ERROR] Gagal menerapkan pembaruan: {e}")
        return {
            "status": "error",
            "message": f"Gagal menerapkan pembaruan: {str(e)}"
        }
