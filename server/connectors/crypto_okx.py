from datetime import datetime
import httpx
from loguru import logger

PROMO_URL = "https://www.okx.com/announcements"

def fetch_promotions(region: str = "americas") -> list[dict]:
    """
    Minimal MVP: try to fetch OKX announcements page and extract a few promo-like links heuristically.
    If parsing fails or blocked, return an empty list or a safe example.
    """
    items: list[dict] = []
    try:
        with httpx.Client(timeout=10, headers={"User-Agent": "Mozilla/5.0"}) as client:
            r = client.get(PROMO_URL, params={"tags": "promotion"})
            if r.status_code == 200:
                # Very naive heuristic: look for '/announcements/' links and titles containing common keywords
                html = r.text
                for line in html.splitlines():
                    if "/announcements/" in line and ("Promo" in line or "bonus" in line.lower() or "Reward" in line):
                        # crude extraction
                        try:
                            href_start = line.find("href=\"")
                            if href_start == -1:
                                continue
                            href_end = line.find("\"", href_start + 6)
                            url = line[href_start + 6:href_end]
                            if url.startswith("/"):
                                url = "https://www.okx.com" + url
                            # title
                            title_start = line.find(">", href_end) + 1
                            title_end = line.find("<", title_start)
                            title = line[title_start:title_end].strip() or "Promoción OKX"
                            items.append({
                                "source": "okx",
                                "title": title,
                                "url": url,
                                "category": "cripto",
                                "currency": None,
                                "amount": None,
                                "region": region,
                                "expires_at": None,
                            })
                            if len(items) >= 5:
                                break
                        except Exception:
                            continue
            else:
                logger.warning(f"OKX announcements status {r.status_code}")
    except Exception as e:
        logger.warning(f"OKX fetch failed: {e}")
    # Fallback example if nothing found
    if not items:
        items.append({
            "source": "okx",
            "title": "Ejemplo - Recompensas de promoción",
            "url": PROMO_URL,
            "category": "cripto",
            "currency": None,
            "amount": None,
            "region": region,
            "expires_at": None,
        })
    return items
