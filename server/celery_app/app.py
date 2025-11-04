from celery import Celery
from loguru import logger
from app.config import settings
from app.db import SessionLocal
from app.models import Promo
from connectors.crypto_okx import fetch_promotions as fetch_okx
from services.telegram import notify_new_promos

celery_app = Celery(
    "webfrente",
    broker=settings.redis_url,
    backend=settings.redis_url,
)
 
# Configure periodic schedule (Celery Beat)
from datetime import timedelta
celery_app.conf.beat_schedule = {
    "fetch-promos-every-10-min": {
        "task": "celery_app.app.fetch_all_promos",
        "schedule": timedelta(minutes=10),
    }
}

@celery_app.task
def fetch_all_promos():
    """Fetch from multiple connectors and store new entries."""
    db = SessionLocal()
    new_promos = []
    try:
        for connector in [fetch_okx]:
            try:
                items = connector(region=settings.crawl_region)
                for it in items:
                    exists = (
                        db.query(Promo)
                        .filter(Promo.source == it["source"], Promo.url == it["url"])
                        .first()
                    )
                    if exists:
                        continue
                    p = Promo(
                        source=it["source"],
                        title=it["title"],
                        url=it["url"],
                        category=it.get("category", "cripto"),
                        currency=it.get("currency"),
                        amount=it.get("amount"),
                        region=it.get("region"),
                        expires_at=it.get("expires_at"),
                    )
                    db.add(p)
                    db.commit()
                    db.refresh(p)
                    new_promos.append(p)
            except Exception as e:
                logger.exception(f"Connector failed: {connector.__name__}: {e}")
        if new_promos:
            try:
                notify_new_promos(new_promos)
            except Exception as e:
                logger.exception(f"Notify failed: {e}")
    finally:
        db.close()
    return len(new_promos)
