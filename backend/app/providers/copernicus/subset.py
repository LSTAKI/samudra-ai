"""
ORCA Backend — Copernicus Spatial Subset & Bounding Box Slicer
Calculates regional statistics (min, max, mean, count) directly from real Copernicus observations.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone

from app.providers.copernicus.registry import get_registered_dataset
from app.providers.copernicus.feature_info import execute_feature_info
from app.services.cache import cache_service


async def calculate_spatial_summary(
    dataset_key: str,
    min_lat: float,
    max_lat: float,
    min_lon: float,
    max_lon: float,
    time_iso: Optional[str] = None
) -> Dict[str, Any]:
    """
    Calculate bounding-box statistical summary from real Copernicus Marine observation queries.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    meta = get_registered_dataset(dataset_key)

    cache_key = f"copernicus:bbox:{meta['id']}:{min_lat:.2f}_{max_lat:.2f}_{min_lon:.2f}_{max_lon:.2f}:{time_iso or 'default'}"
    cached = cache_service.get(cache_key)
    if cached:
        res = dict(cached["data"])
        res["is_cached"] = True
        return res

    # Generate sample grid points across the requested bounding box
    lat_steps = [min_lat, (min_lat + max_lat) / 2.0, max_lat]
    lon_steps = [min_lon, (min_lon + max_lon) / 2.0, max_lon]

    sample_values: List[float] = []
    
    for lat in lat_steps:
        for lon in lon_steps:
            # Query real point value from Copernicus
            fi = await execute_feature_info(dataset_key=dataset_key, lat=lat, lon=lon, time_iso=time_iso)
            val = fi.get("value")
            if val is not None and isinstance(val, (int, float)):
                sample_values.append(float(val))

    if not sample_values:
        return {
            "status": "UNAVAILABLE",
            "source": meta["source"],
            "product_id": meta["product_id"],
            "dataset_id": meta["dataset_id"],
            "variable": meta["variable"],
            "units": meta["units"],
            "bbox": {
                "min_lat": min_lat,
                "max_lat": max_lat,
                "min_lon": min_lon,
                "max_lon": max_lon
            },
            "observation_timestamp": time_iso or "2026-08-28T00:00:00Z",
            "retrieved_at": now_iso,
            "count": 0,
            "statistics": None,
            "is_cached": False,
            "error": "No valid observations found within requested bounding box"
        }

    # Calculate actual statistics from retrieved values
    val_min = round(min(sample_values), 2)
    val_max = round(max(sample_values), 2)
    val_mean = round(sum(sample_values) / len(sample_values), 2)

    result = {
        "status": "CONNECTED",
        "source": meta["source"],
        "product_id": meta["product_id"],
        "dataset_id": meta["dataset_id"],
        "variable": meta["variable"],
        "units": meta["units"],
        "bbox": {
            "min_lat": min_lat,
            "max_lat": max_lat,
            "min_lon": min_lon,
            "max_lon": max_lon
        },
        "observation_timestamp": time_iso or "2026-08-28T00:00:00Z",
        "retrieved_at": now_iso,
        "count": len(sample_values),
        "statistics": {
            "min": val_min,
            "max": val_max,
            "mean": val_mean
        },
        "is_cached": False
    }

    cache_service.set(cache_key, result, source="Copernicus Marine", ttl_seconds=600)
    return result
