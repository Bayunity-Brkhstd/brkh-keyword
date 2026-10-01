import os
import urllib.parse
import logging

def normalize_path(path: str) -> str:
    """
    Normalizes file path for cross-platform, cross-PC, and Windows Network/NAS (UNC) compatibility:
    1. Removes surrounding quotes, leading/trailing whitespace, zero-width spaces, and BOMs.
    2. Strips 'file://' or 'file:' protocols and decodes URL percent-encoding (%20, etc.).
    3. Handles UNC network paths (\\\\SERVER\\share or //SERVER/share).
    4. Converts relative paths to absolute paths.
    5. Normalizes slash direction for Windows (os.path.normpath).
    6. Handles Windows long paths (>240 chars) correctly:
       - Local / Mapped drive paths: '\\\\?\\C:\\path...'
       - Network UNC paths: '\\\\?\\UNC\\SERVER\\share\\path...'
    """
    if not path:
        return ""

    # Ensure string and strip whitespace, quotes, zero-width spaces, BOM
    clean_path = str(path).strip().strip('"').strip("'").strip('\u200b').strip('\ufeff')
    if not clean_path:
        return ""

    # Strip 'file://' or 'file:' prefix if present (common when paths come from browser / webview / drag-and-drop)
    if clean_path.startswith("file:"):
        clean_path = urllib.parse.unquote(clean_path)
        if clean_path.startswith("file://///"):
            clean_path = "//" + clean_path[10:]
        elif clean_path.startswith("file://"):
            sub = clean_path[7:]
            if len(sub) >= 3 and sub[0] == '/' and sub[2] == ':':
                clean_path = sub[1:]
            else:
                clean_path = "//" + sub
        elif clean_path.startswith("file:/"):
            sub = clean_path[6:]
            if len(sub) >= 3 and sub[0] == '/' and sub[2] == ':':
                clean_path = sub[1:]
            else:
                clean_path = sub

    # URL decode any remaining %xx encoded characters if not already decoded
    if '%' in clean_path:
        clean_path = urllib.parse.unquote(clean_path)

    # Check if path is a UNC network path (starts with \\ or //)
    is_unc = clean_path.startswith("\\\\") or clean_path.startswith("//")

    # Standardize forward slashes to backslashes on Windows
    if os.name == 'nt':
        clean_path = clean_path.replace('/', '\\')
        if is_unc and not clean_path.startswith("\\\\"):
            clean_path = "\\\\" + clean_path.lstrip("\\")

    try:
        if is_unc and os.name == 'nt':
            norm_path = os.path.normpath(clean_path)
            if not norm_path.startswith("\\\\"):
                norm_path = "\\\\" + norm_path.lstrip("\\")
        else:
            abs_path = os.path.abspath(clean_path)
            norm_path = os.path.normpath(abs_path)
    except Exception:
        norm_path = clean_path

    # Windows long path handling (> 240 characters)
    if os.name == 'nt':
        if not norm_path.startswith('\\\\?\\'):
            if len(norm_path) >= 240:
                if norm_path.startswith('\\\\'):
                    # UNC path extended length format: \\?\UNC\SERVER\share\path
                    norm_path = '\\\\?\\UNC\\' + norm_path[2:]
                else:
                    # Drive letter path extended length format: \\?\C:\path
                    norm_path = '\\\\?\\' + norm_path

    return norm_path

