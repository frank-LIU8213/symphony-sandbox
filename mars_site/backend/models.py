"""Pydantic models for API data validation."""
from pydantic import BaseModel
from typing import List, Literal

class MarsFact(BaseModel):
    id: str
    title: str
    description: str
    image_url: str
    facts: List[str]

class SoundTrigger(BaseModel):
    id: str
    url: str
    event: Literal["hover", "click", "scroll", "load"]

class ApiResponse(BaseModel):
    status: Literal["ok", "error"]
    data: List[MarsFact] | List[SoundTrigger] | None = None
    message: str | None = None
