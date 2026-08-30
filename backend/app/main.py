"""
ORCA Backend — FastAPI Application Entry Point

Project ORCA: Marine Intelligence Platform Backend v1.0
Implements the API contract defined in ORCA_BACKEND_INTEGRATION_AND_MULTI_AGENT_SPEC.md

Run with:
    uvicorn app.main:app --reload --port 8000
"""
import logging
import time
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import router as v1_router
from app.core.config import settings

# ─── Logging Setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("orca")

# ─── FastAPI App ──────────────────────────────────────────────────────────────
app = FastAPI(
    title="Project ORCA — Marine Intelligence Platform",
    description=(
        "Multi-agent backend for the ORCA marine science platform. "
        "Provides oceanographic data, PFZ analysis, satellite tracking, "
        "analytics, and AI reasoning endpoints. "
        "All endpoints follow the ScientificResponseEnvelope standard."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ─── CORS — Allow frontend origin ────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# ─── Request Latency Logging ──────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    t0 = time.time()
    response = await call_next(request)
    elapsed = round((time.time() - t0) * 1000, 1)
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({elapsed}ms)")
    response.headers["X-Response-Time-Ms"] = str(elapsed)
    return response

# ─── Global Exception Handler ─────────────────────────────────────────────────
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "request_id": f"err-{int(time.time())}",
            "timestamp": datetime.now(tz=timezone.utc).isoformat(),
            "status": "ERROR",
            "data_status": "UNAVAILABLE",
            "data": None,
            "warnings": [str(exc)],
        },
    )

# ─── Mount API Routes ─────────────────────────────────────────────────────────
app.include_router(v1_router, prefix="/api")

# ─── Health Endpoint ──────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health():
    """
    Health check endpoint.
    Returns current configuration status without exposing credentials.
    """
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        "config": {
            "copernicus_mode": "REAL DATA" if settings.has_copernicus_credentials else "DEMO",
            "llm_model": settings.llm_model,
            "ollama_url": settings.ollama_api_url,
            "frontend_origin": settings.frontend_origin,
        },
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "name": "Project ORCA — Marine Intelligence Platform Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "api": "/api/v1",
    }


# ─── Startup / Shutdown ───────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("=" * 60)
    logger.info("  ORCA Backend starting up")
    logger.info(f"  Copernicus: {'REAL DATA' if settings.has_copernicus_credentials else 'DEMO MODE'}")
    logger.info(f"  LLM Model:  {settings.llm_model} @ {settings.ollama_api_url}")
    logger.info(f"  Frontend:   {settings.frontend_origin}")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown():
    logger.info("ORCA Backend shutting down.")
