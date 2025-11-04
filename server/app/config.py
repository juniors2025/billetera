import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_env: str = os.getenv("APP_ENV", "development")
    app_name: str = os.getenv("APP_NAME", "webfrente")
    database_url: str = os.getenv("DATABASE_URL", "postgresql+psycopg://webfrente:webfrente@db:5432/webfrente")
    redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    telegram_bot_token: str | None = os.getenv("TELEGRAM_BOT_TOKEN")
    telegram_chat_id: str | None = os.getenv("TELEGRAM_CHAT_ID")
    crawl_region: str = os.getenv("CRAWL_REGION", "americas")

settings = Settings()
