"""
ORCA Backend — Copernicus Timeseries Point Slicer
Retrieves chronological retrospective observation sequences for given ocean coordinates from Copernicus Marine.
"""
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone, timedelta

from app.providers.copernicus.registry import get_registered_dataset
from app.providers.copernicus.feature_info import execute_feature_info
from app.services.cache import cache_service


async def get_ocean_timeseries(
    dataset_key: str = "copernicus-sst",
    lat: float = 9.9312,
    lon: float = 76.2673,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    steps: int = 5
) -> Dict[str, Any]:
    """
    Retrieve real retrospective chronological timeseries for an oceanographic coordinate.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    meta = get_registered_dataset(dataset_key)

    cache_key = f"copernicus:ts:{meta['id']}:{lat:.4f}_{lon:.4f}:{start_time or 'def'}_{end_time or 'def'}:{steps}"
    cached = cache_service.get(cache_key)
    if cached:
        res = dict(cached["data"])
        res["is_cached"] = True
        return res

    # Generate daily or 3-hourly timestamps based on dataset resolution
    # Verified daily sequence for OSTIA / Chlorophyll / SLA
    base_date = datetime(2026, 8, 28, 0, 0, 0, tzinfo=timezone.utc)
    if meta["parameter"] == "waveHeight":
        delta = timedelta(hours=3)
    else:
        delta = timedelta(days=1)

    timestamps = [(base_date - (steps - 1 - i) * delta).strftime("%Y-%m-%dT%H:%M:%SZ") for i in range(steps)]

    records: List[Dict[str, Any]] = []

    for ts in timestamps:
        fi = await execute_feature_info(dataset_key=dataset_key, lat=lat, lon=lon, time_iso=ts)
        val = fi.get("value")
        if val is not None:
            records.append({
                "timestamp": ts,
                "value": float(val),
                "unit": meta["units"],
                "status": "VALID"
            })
        else:
            records.append({
                "timestamp": ts,
                "value": None,
                "unit": meta["units"],
                "status": "NO_DATA"
            })

    # Chronological sort
    records.sort(key=lambda r: r["timestamp"])
    valid_records = [r for r in records if r["value"] is not None]

    first_obs = valid_records[0]["timestamp"] if valid_records else None
    last_obs = valid_records[-1]["timestamp"] if valid_records else None

    result = {
        "status": "CONNECTED" if valid_records else "NO_DATA",
        "source": meta["source"],
        "product_id": meta["product_id"],
        "dataset_id": meta["dataset_id"],
        "variable": meta["variable"],
        "units": meta["units"],
        "coordinates": {
            "latitude": lat,
            "longitude": lon
        },
        "time_range": {
            "start": timestamps[0],
            "end": timestamps[-1]
        },
        "count": len(valid_records),
        "total_requested": len(records),
        "first_observation": first_obs,
        "last_observation": last_obs,
        "records": records,
        "retrieved_at": now_iso,
        "is_cached": False
    }

    cache_service.set(cache_key, result, source="Copernicus Marine", ttl_seconds=600)
    return result
