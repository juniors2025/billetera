from pydantic import BaseModel
from datetime import datetime

class PromoOut(BaseModel):
    id: int
    source: str
    title: str
    url: str
    category: str
    currency: str | None = None
    amount: float | None = None
    region: str | None = None
    expires_at: datetime | None = None
    created_at: datetime

    class Config:
        from_attributes = True
