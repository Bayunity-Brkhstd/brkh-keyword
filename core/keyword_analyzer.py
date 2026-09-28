import re

class KeywordAnalyzer:
    """
    Commercial Intent & Adobe Stock 10-First Priority Scorer.
    Ported from keyword-analysis skill principles.
    Filters passive visual words and ranks high-value commercial keywords first.
    """
    def __init__(self):
        # Passive / low-commercial visual description words to demote to tail
        self.passive_words = {
            "white", "nobody", "isolated", "background", "looking", "horizontal", "vertical", 
            "closeup", "close-up", "shot", "view", "full", "length", "front", "side", "rear", 
            "space", "copy", "copyspace", "copy-space", "studio", "indoor", "outdoor", "clear", 
            "blank", "surface", "texture", "color", "colour", "image", "photo", "picture", 
            "object", "single", "top", "bottom", "space"
        }

        # High-value commercial utility terms (boost commercial intent score)
        self.commercial_boosters = {
            "template", "banner", "poster", "flyer", "card", "element", "symbol", "icon", 
            "design", "business", "sale", "discount", "marketing", "branding", "ui", "ux", 
            "graphic", "vector", "3d", "render", "character", "celebration", "festive", 
            "holiday", "event", "luxury", "gold", "premium", "emblem", "badge", "pattern"
        }

    def score_keyword(self, keyword: str, context_title: str = "") -> float:
        """
        Calculates Commercial / Buyer Intent Score (0.0 to 100.0) for a keyword.
        """
        kw_clean = str(keyword).lower().strip()
        if not kw_clean or len(kw_clean) <= 2:
            return 0.0

        score = 50.0  # Base score for valid single-word keywords

        # Penalty for passive / filler words
        if kw_clean in self.passive_words:
            score -= 35.0

        # Boost for high-value commercial utility terms
        if kw_clean in self.commercial_boosters:
            score += 35.0

        # Boost if keyword appears directly in title (high relevance to core asset)
        if context_title and kw_clean in context_title.lower():
            score += 15.0

        return max(0.0, min(100.0, score))

    def score_and_rank(self, keywords: list[str], title: str = "") -> list[str]:
        """
        Scores keywords and ranks them so that top 10 positions contain high commercial intent
        and core subject keywords, moving passive words to the end.
        Strictly returns deduplicated single-word keywords.
        """
        seen = set()
        clean_list = []

        for kw in keywords:
            k = str(kw).lower().strip()
            # Enforce single word without spaces
            if k and ' ' not in k and len(k) > 2 and k not in seen:
                seen.add(k)
                clean_list.append(k)

        # Calculate scores
        scored = [(k, self.score_keyword(k, context_title=title)) for k in clean_list]

        # Sort descending by commercial score
        scored.sort(key=lambda item: item[1], reverse=True)

        return [item[0] for item in scored]

if __name__ == "__main__":
    analyzer = KeywordAnalyzer()
    sample_keywords = ["ramadan", "lantern", "background", "white", "banner", "isolated", "gold", "template", "vector", "3d"]
    ranked = analyzer.score_and_rank(sample_keywords, title="Gold Ramadan Lantern 3D Banner")
    print("[TEST KeywordAnalyzer] Scored & Ranked Keywords:")
    print(ranked)
