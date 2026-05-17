"""API route handlers."""
from fastapi import APIRouter
from .models import MarsFact, SoundTrigger, ApiResponse
from typing import List

router = APIRouter(prefix="/api/mars", tags=["mars"])

@router.get("/data", response_model=ApiResponse)
async def get_mars_data() -> ApiResponse:
    return ApiResponse(status="ok", data=[], message="Data endpoint ready")

@router.get("/sounds", response_model=ApiResponse)
async def get_sounds() -> ApiResponse:
    return ApiResponse(status="ok", data=[], message="Sounds endpoint ready")
