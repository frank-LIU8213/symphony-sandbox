"""API route handlers."""
import json
from pathlib import Path
from fastapi import APIRouter
from .models import MarsFact, SoundTrigger, ApiResponse

router = APIRouter(prefix="/api/mars", tags=["mars"])

DATA_FILE = Path(__file__).parent.parent / "frontend" / "data" / "mars_data.json"


def _load_data() -> dict:
    if DATA_FILE.exists():
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"facts": [], "sounds": []}


@router.get("/data", response_model=ApiResponse)
async def get_mars_data() -> ApiResponse:
    data = _load_data()
    facts = [MarsFact(**f) for f in data.get("facts", [])]
    return ApiResponse(status="ok", data=facts, message="Mars facts loaded")


@router.get("/sounds", response_model=ApiResponse)
async def get_sounds() -> ApiResponse:
    data = _load_data()
    sounds = [SoundTrigger(**s) for s in data.get("sounds", [])]
    return ApiResponse(status="ok", data=sounds, message="Sound triggers loaded")
