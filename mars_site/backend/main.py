"""FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI(title="Mars Interactive Site")

FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

# Include API routes
from .routes import router as mars_router
app.include_router(mars_router)

@app.get("/")
async def serve_index():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/health")
async def health_check():
    return {"status": "ok"}
