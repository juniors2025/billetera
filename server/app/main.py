from fastapi import FastAPI
from .routers import promos
from .routers import notify

app = FastAPI(title="WebFrente API")

app.include_router(promos.router, prefix="/api", tags=["promos"])
app.include_router(notify.router, prefix="/api", tags=["notify"])

@app.get("/health")
async def health():
    return {"status": "ok"}
