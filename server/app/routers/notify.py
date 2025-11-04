from fastapi import APIRouter
from pydantic import BaseModel
from services.telegram import send_message

router = APIRouter()

class NotifyIn(BaseModel):
    text: str = "Prueba de notificaciones desde WebFrente"

@router.post("/notify/test")
async def notify_test(body: NotifyIn):
    send_message(body.text)
    return {"ok": True}
