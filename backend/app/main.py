
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.health import router as health_router
from app.api.predictions import router as predictions_router

app = FastAPI(
    title="CardioVision 3D API",
    version="0.1.0",
    description="Research/educational prototype. Not for clinical decisions.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(predictions_router, prefix="/api")

# Locate frontend dist directory safely
current_file = Path(__file__).resolve()
base_dir = current_file.parent.parent  # /app in container, or backend/ locally

candidate_dirs = [
    base_dir / "frontend" / "dist",
    base_dir.parent / "frontend" / "dist",
    Path("/app/frontend/dist"),
    Path("frontend/dist").resolve(),
    Path("dist").resolve(),
]

frontend_dist = next(
    (d for d in candidate_dirs if d.exists() and (d / "index.html").exists()),
    None,
)

if frontend_dist:
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/")
    async def serve_index():
        return FileResponse(frontend_dist / "index.html")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    def root():
        return {"name": "CardioVision 3D API", "docs": "/docs"}

