"""
ORCA Backend — Copernicus Marine WMTS Provider
Handles official Copernicus Marine WMTS raster layers:
- Sea Surface Temperature (OSTIA L4 NRT)
- Significant Wave Height (WAV_001_027)
- Sea Level Anomaly (SEALEVEL_L4_NRT)
- Chlorophyll-a (BGC_L3/L4)
"""
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from app.core.config import settings
from app.services.cache import cache_service
from app.providers.copernicus.registry import COPERNICUS_DATASET_REGISTRY, get_registered_dataset
from app.providers.copernicus.feature_info import execute_feature_info

logger = logging.getLogger("orca.copernicus.wmts")


def get_available_layers() -> List[Dict[str, Any]]:
    """Return all verified Copernicus Marine layer specifications."""
    return COPERNICUS_DATASET_REGISTRY


async def query_feature_info(
    layer_id: str,
    lat: float,
    lon: float,
    time_iso: Optional[str] = None
) -> Dict[str, Any]:
    """Execute GetFeatureInfo pixel point query for Copernicus layer."""
    return await execute_feature_info(dataset_key=layer_id, lat=lat, lon=lon, time_iso=time_iso)
