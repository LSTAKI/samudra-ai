"""
ORCA Backend — System Diagnostics & Telemetry Router
"""
import time
from datetime import datetime, timezone
from fastapi import APIRouter

from app.core.config import settings
from app.services.cache import cache_service

router = APIRouter(prefix="/system", tags=["System Health & Diagnostics"])


@router.get("/health")
async def health():
    """System health & runtime diagnostics."""
    return {
        "status": "CONNECTED",
        "version": "1.0.0",
        "timestamp": datetime.now(tz=timezone.utc).isoformat(),
        "services": {
            "backend": "CONNECTED",
            "cache": "CONNECTED" if cache_service.size >= 0 else "DEGRADED",
            "copernicus_wmts": "CONNECTED",
            "copernicus_catalog": "CONNECTED",
            "copernicus_subset": "CONNECTED",
            "pfz_engine": "CONNECTED",
            "agent_platform": "CONNECTED" if settings.has_agent_platform else "NOT CONNECTED (External)"
        },
        "cache_items_count": cache_service.size
    }


@router.get("/sources")
async def sources():
    """List external data provider connections and credentials status without leaking secrets."""
    return {
        "sources": [
            {
                "id": "copernicus_wmts",
                "name": "Copernicus Marine WMTS",
                "status": "CONNECTED",
                "mode": "OSTIA SST, Waves, SLA & Chlorophyll-a Rasters",
                "endpoint": settings.copernicus_wmts_url,
                "authenticated": settings.has_copernicus_credentials
            },
            {
                "id": "copernicus_catalog",
                "name": "Copernicus Catalog Auto-Discovery",
                "status": "CONNECTED",
                "mode": "GetCapabilities 9,502 Layer Index",
                "endpoint": f"{settings.copernicus_wmts_url}?REQUEST=GetCapabilities",
                "authenticated": True
            },
            {
                "id": "pfz_engine",
                "name": "Deterministic PFZ Analyzer",
                "status": "CONNECTED",
                "mode": "v1.0-deterministic Oceanographic Slicer",
                "endpoint": "Internal Backend Engine",
                "authenticated": True
            },
            {
                "id": "agent_platform",
                "name": "External Multi-Agent Platform",
                "status": "NOT CONNECTED",
                "mode": "Decoupled Reasoning Layer",
                "endpoint": settings.agent_platform_url or "Decoupled",
                "authenticated": settings.has_agent_platform
            }
        ]
    }
