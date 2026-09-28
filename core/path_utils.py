import os

def normalize_path(path: str) -> str:
    """
    Normalizes file path for cross-platform and cross-PC compatibility:
    1. Removes surrounding quotes and whitespace.
    2. Converts relative paths to absolute paths.
    3. Normalizes slash direction (os.path.normpath).
    4. Handles Windows long paths (>240 chars) with '\\\\?\\' prefix if on Windows.
    """
    if not path:
        return ""

    # Clean whitespace and trailing quotes
    clean_path = str(path).strip().strip('"').strip("'")
    if not clean_path:
        return ""

    try:
        abs_path = os.path.abspath(clean_path)
        norm_path = os.path.normpath(abs_path)
    except Exception:
        norm_path = clean_path

    # Windows long path handling (> 240 characters)
    if os.name == 'nt':
        if len(norm_path) >= 240 and not norm_path.startswith('\\\\?\\') and not norm_path.startswith('\\\\'):
            norm_path = '\\\\?\\' + norm_path

    return norm_path
