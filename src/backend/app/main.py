import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from .routes import task_routes, event_routes, meeting_routes, user_routes
from .database import engine, Base

load_dotenv()

# Crea las tablas si no existen
Base.metadata.create_all(bind=engine)

# Configurar Rate Limiter global
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="ChronoHub API",
    description="API de gestión de productividad personal — tareas, eventos y reuniones.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── Rate Limiting ──────────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ───────────────────────────────────────────────────────────────────────
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://127.0.0.1:5500,http://localhost:5500")
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
# "null" es el Origin que envían los navegadores cuando el HTML se abre desde file://
if "null" not in allowed_origins:
    allowed_origins.append("null")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["Content-Disposition"],
)

# ── Static Files (Avatars) ─────────────────────────────────────────────────────
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(task_routes.router, prefix="/api/v1", tags=["Tareas"])
app.include_router(event_routes.router, prefix="/api/v1", tags=["Eventos"])
app.include_router(meeting_routes.router, prefix="/api/v1", tags=["Reuniones"])
app.include_router(user_routes.router, prefix="/api/v1", tags=["Usuarios & Auth"])

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")