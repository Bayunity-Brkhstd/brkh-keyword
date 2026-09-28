import httpx
import re

class KeywordSERP:
    """
    Lightweight SERP Research & Trend Signals Module.
    Ported from keyword-serp and keyword-signals skill principles.
    Fetches public related searches and People Also Ask questions without headless browsers.
    """
    def __init__(self):
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

    def fetch_related_searches(self, seed_query: str) -> list[str]:
        """
        Fetches public related search terms from Google/Bing search HTML.
        """
        related_terms = set()
        if not seed_query:
            return []

        # Google Search Scraping for Related Queries
        try:
            url = "https://www.google.com/search"
            params = {"q": seed_query, "hl": "en"}
            with httpx.Client(timeout=3.5, follow_redirects=True) as client:
                res = client.get(url, params=params, headers=self.headers)
                if res.status_code == 200:
                    matches = re.findall(r'href="/search\?q=([^"&]+)', res.text)
                    for m in matches:
                        clean = m.replace('+', ' ').replace('%20', ' ').strip().lower()
                        if clean and len(clean) > 2 and clean != seed_query.lower():
                            # Extract individual single-word terms
                            for token in re.findall(r'[a-zA-Z]+', clean):
                                if len(token) > 2:
                                    related_terms.add(token)
        except Exception:
            pass

        return list(related_terms)

    def fetch_paa_questions(self, seed_query: str) -> list[str]:
        """
        Extracts People Also Ask (PAA) question phrases.
        """
        questions = []
        if not seed_query:
            return []

        try:
            url = "https://www.google.com/search"
            params = {"q": seed_query, "hl": "en"}
            with httpx.Client(timeout=3.5, follow_redirects=True) as client:
                res = client.get(url, params=params, headers=self.headers)
                if res.status_code == 200:
                    # Match question patterns like "What is...", "How to...", "Why do..."
                    matches = re.findall(r'(What|How|Why|Where|When) [^?<\"]+\?', res.text, re.IGNORECASE)
                    for q in matches[:5]:
                        if isinstance(q, str) and len(q) > 5:
                            questions.append(q.strip())
        except Exception:
            pass

        return questions

    def get_serp_signals(self, seed_query: str) -> dict:
        """
        Aggregates SERP insights and market signals for a given query.
        """
        related = self.fetch_related_searches(seed_query)
        paa = self.fetch_paa_questions(seed_query)

        return {
            "query": seed_query,
            "related_keywords": related,
            "paa_questions": paa,
            "signal_count": len(related) + len(paa)
        }

if __name__ == "__main__":
    serp = KeywordSERP()
    test_seed = "ramadan lantern"
    res = serp.get_serp_signals(test_seed)
    print(f"[TEST KeywordSERP] Signals for '{test_seed}':")
    print(res)
