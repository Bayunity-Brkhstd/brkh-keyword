import re

# Comprehensive list of Indonesian words and non-English filler terms to strictly exclude
INDONESIAN_WORDS = {
    "gambar", "desain", "vektor", "hiasan", "kertas", "latar", "belakang", "tulisan", 
    "teks", "warna", "merah", "biru", "kuning", "hijau", "hitam", "putih", "emas", 
    "perak", "sekolah", "anak", "wanita", "pria", "laki", "perempuan", "makanan", 
    "minuman", "rumah", "pohon", "bunga", "daun", "alam", "pemandangan", "langit", 
    "bintang", "bulan", "matahari", "awan", "air", "api", "tanah", "kota", "gedung", 
    "jalan", "mobil", "motor", "bisnis", "uang", "belanja", "diskon", "promo", "murah",
    "lebaran", "puasa", "idul", "fitri", "adha", "mudik", "thr", "ketupat", "masjid", 
    "ucapan", "selamat", "tahun", "baru", "ulang", "pernikahan", "undangan", "bingkai", 
    "spanduk", "stiker", "pola", "motif", "koleksi", "kumpulan", "elemen", "bentuk", 
    "ikon", "simbol", "grafis", "ilustrasi", "seni", "lukisan", "sketsa", "gaya", 
    "keren", "cantik", "indah", "mewah", "sederhana", "abstrak", "isometrik", 
    "karakter", "maskot", "kartun", "objek", "bendera", "merahputih", "indonesia", 
    "garuda", "pancasila", "kemerdekaan", "agustus", "pahlawan", "peta", "nusantara",
    "batik", "wayang", "angklung", "gamelan", "monas", "bali", "ondel", "tumpeng",
    "rendang", "sate", "nasi", "goreng", "kerupuk", "sambal", "kopi", "teh",
    "baju", "celana", "topi", "sepatu", "tas", "kacamata", "jam", "dompet",
    "keluarga", "ayah", "ibu", "kakak", "adik", "nenek", "kakek", "teman", "sahabat",
    "kerja", "kantor", "kuliah", "mahasiswa", "guru", "dosen", "siswa",
    "buku", "pena", "pensil", "meja", "kursi", "pintu", "jendela", "atap", "dinding",
    "kucing", "anjing", "burung", "ikan", "kuda", "sapi", "kambing", "gajah", "singa",
    "macan", "harimau", "ular", "buaya", "monyet", "kera", "kelinci", "tikus",
    "makan", "minum", "tidur", "duduk", "berdiri", "terbang", "berenang",
    "senang", "sedih", "marah", "takut", "terkejut", "bingung", "lelah", "capek",
    "sehat", "sakit", "kuat", "lemah", "cepat", "lambat", "tinggi", "rendah",
    "besar", "kecil", "panjang", "pendek", "tebal", "tipis", "berat", "ringan",
    "panas", "dingin", "hangat", "sejuk", "bersih", "kotor", "wangi", "bau",
    "lama", "tua", "muda", "bagus", "jelek", "rusak", "baik", "buruk",
    "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh",
    "pertama", "kedua", "ketiga", "hari", "minggu", "pagi", "siang",
    "sore", "malam", "sekarang", "besok", "kemarin", "nanti", "dulu", "lagi",
    "dan", "yang", "untuk", "dengan", "pada", "dari", "ke", "di", "ini", "itu",
    "atau", "juga", "bisa", "akan", "telah", "sudah", "bukan", "tidak", "ada"
}

def is_english_keyword(word: str, custom_banned: set = None) -> bool:
    """
    Strictly verifies if a keyword string is valid English and not Indonesian/non-English.
    Also checks against custom banned keyword list.
    Returns True if valid English keyword, False otherwise.
    """
    if not word:
        return False
        
    clean = str(word).lower().strip()
    if len(clean) < 2:
        return False

    # Must contain only valid ASCII characters (letters, numbers, hyphens, spaces)
    if not re.match(r'^[a-z0-9\s-]+$', clean):
        return False

    # Split compound phrases or hyphenated words
    tokens = re.split(r'[\s-]+', clean)
    for token in tokens:
        if token in INDONESIAN_WORDS:
            return False

    # Custom banned list check
    if custom_banned:
        if clean in custom_banned:
            return False
        for token in tokens:
            if token in custom_banned:
                return False

    return True

def filter_english_keywords(keywords: list, custom_banned_list: list = None) -> list:
    """
    Filters a list of keywords to retain ONLY valid English keywords.
    Optionally filters out custom banned keywords.
    Deduplicates while preserving order.
    """
    seen = set()
    valid_english = []
    
    banned_set = set()
    if custom_banned_list:
        for b in custom_banned_list:
            b_clean = str(b).lower().strip()
            if b_clean:
                banned_set.add(b_clean)
                for tok in re.split(r'[\s,;-]+', b_clean):
                    if tok:
                        banned_set.add(tok)

    for kw in keywords:
        clean = str(kw).lower().strip()
        if clean not in seen and is_english_keyword(clean, custom_banned=banned_set):
            seen.add(clean)
            valid_english.append(clean)

    return valid_english
