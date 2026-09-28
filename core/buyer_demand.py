import httpx
import re

class BuyerDemandFetcher:
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        # Blacklist kata sampah dan preposisi yang tidak berguna jika berdiri sendiri
        self.stop_words = {
            "free", "download", "png", "vector", "stock", "ai", "eps", 
            "svg", "online", "hd", "transparent", "background", "clipart", "pdf", "dxf",
            "for", "with", "and", "the", "from", "into", "that", "this"
        }

    def clean_and_tokenize(self, text: str) -> list[str]:
        """Membersihkan frasa dan membuang stop words microstock"""
        cleaned_words = []
        tokens = re.findall(r'[a-zA-Z]+', text.lower())
        for word in tokens:
            if word not in self.stop_words and len(word) > 2:
                cleaned_words.append(word)
        return cleaned_words

    def fetch_suggestions(self, seed_query: str) -> list[str]:
        collected_phrases = set()

        # 1. Google Autocomplete (Pola pencarian komersial global)
        try:
            url_google = "https://suggestqueries.google.com/complete/search"
            params = {"client": "chrome", "q": seed_query}
            with httpx.Client(timeout=4.0) as client:
                res = client.get(url_google, params=params, headers=self.headers)
                if res.status_code == 200:
                    for item in res.json()[1]:
                        collected_phrases.add(item.lower().strip())
        except Exception as e:
            pass

        # 2. Bing Autocomplete (Pola pencarian komersial & enterprise)
        try:
            url_bing = "https://api.bing.com/osjson.aspx"
            params = {"query": seed_query}
            with httpx.Client(timeout=4.0) as client:
                res = client.get(url_bing, params=params, headers=self.headers)
                if res.status_code == 200:
                    for item in res.json()[1]:
                        collected_phrases.add(item.lower().strip())
        except Exception as e:
            pass

        # 3. DuckDuckGo Autocomplete
        try:
            url_ddg = "https://duckduckgo.com/ac/"
            params = {"q": seed_query}
            with httpx.Client(timeout=4.0) as client:
                res = client.get(url_ddg, params=params, headers=self.headers)
                if res.status_code == 200:
                    for item in res.json():
                        if isinstance(item, dict) and "phrase" in item:
                            collected_phrases.add(item["phrase"].lower().strip())
        except Exception as e:
            pass

        # Ekstrak kata kunci bersih (HANYA kata tunggal High-CTR, hindari 2 kata)
        final_keywords = set()
        for phrase in collected_phrases:
            tokens = self.clean_and_tokenize(phrase)
            # Simpan HANYA kata tunggal yang relevan (single word)
            for token in tokens:
                final_keywords.add(token)

        return sorted(list(final_keywords))

if __name__ == "__main__":
    # Test langsung di terminal
    fetcher = BuyerDemandFetcher()
    test_seed = "ramadan lantern"
    hasil = fetcher.fetch_suggestions(test_seed)
    print(f"Hasil saran buyer untuk '{test_seed}':")
    print(hasil)