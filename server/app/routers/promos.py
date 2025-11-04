from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db, Base, engine
from ..models import Promo
from ..schemas import PromoOut
from celery_app.app import fetch_all_promos

router = APIRouter()

# Ensure tables exist (simple MVP approach)
Base.metadata.create_all(bind=engine)

@router.get("/promos", response_model=list[PromoOut])
def list_promos(limit: int = 50, db: Session = Depends(get_db)):
    return db.query(Promo).order_by(Promo.created_at.desc()).limit(limit).all()

@router.post("/promos/fetch-now")
def fetch_now():
    """Trigger a synchronous fetch of promotions and return the number of new items."""
    count = fetch_all_promos()
    # When called as a regular function, Celery task returns directly the count
    # If later we switch to async, we can adapt to .delay()
    return {"new_promos": count}
