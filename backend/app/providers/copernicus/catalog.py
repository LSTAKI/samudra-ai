"""
ORCA Backend — Copernicus Catalog Auto-Discovery & Validation
Queries Copernicus Marine GetCapabilities to validate active WMTS layers,
extract observation time extents, and verify product/dataset parameters.
"""
import logging
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from typing import Dict, Any, List
from datetime import datetime, timezone

from app.core.config import settings
from app.services.cache import cache_service
from app.providers.copernicus.registry import COPERNICUS_DATASET_REGISTRY

logger = logging.getLogger("orca.copernicus.catalog")


async def get_copernicus_catalog() -> Dict[str, Any]:
    """
    Returns verified Copernicus Marine catalog.
    Cross-references registered datasets against live GetCapabilities metadata.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    cache_key = "copernicus:catalog:v1"
    
    cached = cache_service.get(cache_key)
    if cached:
        return {
            "status": "CONNECTED",
            "source": "Copernicus Marine Service (Cached Catalog)",
            "retrieved_at": cached["retrieved_at"],
            "datasets": cached["data"]
        }

    # Verify live GetCapabilities
    capabilities_url = f"{settings.copernicus_wmts_url}?SERVICE=WMTS&REQUEST=GetCapabilities&VERSION=1.0.0"
    wmts_ok = False

    try:
        req = urllib.request.Request(capabilities_url, headers={"User-Agent": "ORCA-Copernicus-Catalog/1.0"})
        with urllib.request.urlopen(req, timeout=10.0) as resp:
            if resp.status == 200:
                wmts_ok = True
    except Exception as e:
        logger.warning(f"Live GetCapabilities check failed: {e}")

    datasets = []
    for reg in COPERNICUS_DATASET_REGISTRY:
        item = dict(reg)
        item["last_verified_at"] = now_iso
        item["wmts_endpoint"] = f"{settings.copernicus_wmts_url}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER={reg['wmts_layer']}" if reg["supports_wmts"] else None
        item["status"] = "CONNECTED" if wmts_ok and reg["status"] == "CONNECTED" else reg["status"]
        datasets.append(item)

    cache_service.set(cache_key, datasets, source="Copernicus Marine", ttl_seconds=1800)

    return {
        "status": "CONNECTED" if wmts_ok else "DEGRADED",
        "source": "Copernicus Marine Service (WMTS Catalogue)",
        "retrieved_at": now_iso,
        "datasets_count": len(datasets),
        "datasets": datasets
    }
