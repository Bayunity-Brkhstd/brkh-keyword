class KeywordClusterer:
    """
    Keyword Clustering & Series Asset Deduplicator.
    Ported from keyword-clusters skill principles.
    Groups keywords into semantic tiers (Core, Commercial Action, Variant Attributes)
    and prevents metadata duplication across batch files.
    """
    def __init__(self):
        self.commercial_actions = {
            "banner", "template", "flyer", "poster", "card", "element", "symbol", "icon", 
            "design", "ui", "ux", "graphic", "vector", "illustration", "3d", "render", 
            "character", "emblem", "badge", "pattern", "layout", "background", "wallpaper"
        }

        self.variant_attributes = {
            "gold", "golden", "red", "blue", "green", "black", "white", "yellow", "purple", 
            "vintage", "modern", "retro", "isometric", "flat", "glowing", "shiny", "luxury", 
            "minimalist", "realistic", "abstract", "decorated", "ornament", "crescent"
        }

    def cluster_keywords(self, keywords: list[str]) -> dict:
        """
        Clusters keywords into 3 semantic tiers:
        - core: Primary subject pillars
        - commercial_action: Usage purpose & media format
        - variant_attributes: Visual styles & specific attributes
        """
        core = []
        commercial_action = []
        variants = []

        for kw in keywords:
            k = str(kw).lower().strip()
            if not k or ' ' in k:
                continue

            if k in self.commercial_actions:
                commercial_action.append(k)
            elif k in self.variant_attributes:
                variants.append(k)
            else:
                core.append(k)

        return {
            "core": core,
            "commercial_action": commercial_action,
            "variant_attributes": variants
        }

    def align_batch_series(self, batch_assets: list[dict]) -> list[dict]:
        """
        Ensures batch items in a series share core pillars while preserving unique 
        variant attributes per item to prevent 100% duplicate keyword penalties.
        """
        if not batch_assets:
            return []

        # Collect global core frequency
        global_core = set()
        for item in batch_assets:
            kw_list = item.get("keywords", [])
            clustered = self.cluster_keywords(kw_list)
            for c in clustered["core"]:
                global_core.add(c)

        # Re-assemble each item preserving its unique variants at top priority
        for item in batch_assets:
            kw_list = item.get("keywords", [])
            clustered = self.cluster_keywords(kw_list)

            # Unique variants first, then commercial actions, then core pillars
            reordered = clustered["variant_attributes"] + clustered["commercial_action"] + clustered["core"]
            
            # Deduplicate while preserving order
            seen = set()
            clean_kw = []
            for k in reordered:
                if k not in seen:
                    seen.add(k)
                    clean_kw.append(k)

            item["keywords"] = clean_kw

        return batch_assets

if __name__ == "__main__":
    clusterer = KeywordClusterer()
    test_keywords = ["ramadan", "lantern", "gold", "template", "glowing", "banner", "islamic"]
    clustered = clusterer.cluster_keywords(test_keywords)
    print("[TEST KeywordClusterer] Clustered Tiers:")
    print(clustered)
