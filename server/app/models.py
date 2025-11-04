from sqlalchemy import String, Integer, DateTime, func, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from .db import Base

class Promo(Base):
    __tablename__ = "promos"
    __table_args__ = (
        UniqueConstraint("source", "url", name="uq_source_url"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source: Mapped[str] = mapped_column(String(64), index=True)
    title: Mapped[str] = mapped_column(String(512))
    url: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(32), index=True)
    currency: Mapped[str | None] = mapped_column(String(16), nullable=True)
    amount: Mapped[float | None] = mapped_column(nullable=True)
    region: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    expires_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
