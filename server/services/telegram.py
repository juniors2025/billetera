from loguru import logger
from app.config import settings
import httpx

API_BASE = "https://api.telegram.org/bot"

def send_message(text: str):
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.warning("Telegram not configured; skipping send.")
        return
    url = f"{API_BASE}{settings.telegram_bot_token}/sendMessage"
    payload = {"chat_id": settings.telegram_chat_id, "text": text, "disable_web_page_preview": True}
    try:
        with httpx.Client(timeout=10) as client:
            r = client.post(url, json=payload)
            r.raise_for_status()
    except Exception as e:
        logger.exception(f"Telegram send failed: {e}")


def notify_new_promos(promos):
    if not promos:
        return
    lines = ["Nuevas promociones encontradas:"]
    for p in promos[:10]:
        lines.append(f"- {p.source} | {p.title}\n{p.url}")
    if len(promos) > 10:
        lines.append(f"… y {len(promos) - 10} más")
    send_message("\n".join(lines))
