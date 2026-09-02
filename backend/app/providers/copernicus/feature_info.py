"""
ORCA Backend — Copernicus GetFeatureInfo Point Slicer
Queries exact pixel observation values for given coordinates and time via Copernicus WMTS GetFeatureInfo.
Ensures transparent attribution between requested coordinates and sampled grid cells.
"""
import math
import json
import logging
import urllib.request
import urllib.parse
import urllib.error
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from app.core.config import settings
from app.services.cache import cache_service
from app.providers.copernicus.registry import get_registered_dataset

logger = logging.getLogger("orca.copernicus.feature_info")


def latlon_to_tile(lat: float, lon: float, zoom: int = 4):
    """Convert decimal lat/lon to Web Mercator tile (x, y) and pixel offset (i, j)."""
    lat_rad = math.radians(lat)
    n = 2.0 ** zoom
    xtile = (lon + 180.0) / 360.0 * n
    ytile = (1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n
    
    tile_x = int(math.floor(xtile))
    tile_y = int(math.floor(ytile))
    
    pixel_i = int(round((xtile - tile_x) * 256.0))
    pixel_j = int(round((ytile - tile_y) * 256.0))
    
    return tile_x, tile_y, pixel_i, pixel_j


def _extract_props(features: list, meta: dict):
    if not features:
        return None, None, None, None
    feature = features[0]
    props = feature.get("properties", {})
    geom = feature.get("geometry", {})
    coords = geom.get("coordinates", [])

    val = None
    if "value" in props and isinstance(props["value"], (int, float)):
        val = props["value"]
    elif meta["variable"] in props and isinstance(props[meta["variable"]], (int, float)):
        val = props[meta["variable"]]
    else:
        for k, v in props.items():
            if k not in ["lat", "lon", "time", "latitude", "longitude", "variableId", "datasetId"] and isinstance(v, (int, float)):
                val = v
                break

    if meta["parameter"] == "sst" and val is not None and val > 200:
        val = round(val - 273.15, 2)
    elif val is not None:
        val = round(float(val), 2)

    sampled_lat = props.get("lat") or (coords[1] if len(coords) > 1 else None)
    sampled_lon = props.get("lon") or (coords[0] if len(coords) > 0 else None)
    time_val = props.get("time")

    return val, sampled_lat, sampled_lon, time_val


async def execute_feature_info(
    dataset_key: str,
    lat: float,
    lon: float,
    time_iso: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute GetFeatureInfo point query against Copernicus WMTS.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    meta = get_registered_dataset(dataset_key)
    
    cache_key = f"copernicus:fi:{meta['id']}:{lat:.4f}:{lon:.4f}:{time_iso or 'default'}"
    cached = cache_service.get(cache_key)
    if cached:
        res = dict(cached["data"])
        res["retrieved_at"] = cached["retrieved_at"]
        res["is_cached"] = True
        return res

    if not meta.get("supports_feature_info") or not meta.get("wmts_layer"):
        return {
            "status": "UNAVAILABLE",
            "source": meta["source"],
            "dataset_id": meta["dataset_id"],
            "product_id": meta["product_id"],
            "variable": meta["variable"],
            "latitude": lat,
            "longitude": lon,
            "sampled_latitude": lat,
            "sampled_longitude": lon,
            "sampling_method": "EXACT_GRID_POINT",
            "value": None,
            "unit": meta["units"],
            "spatial_resolution": meta.get("spatial_resolution", ""),
            "temporal_resolution": meta.get("temporal_resolution", ""),
            "observation_timestamp": time_iso or "2026-08-28T00:00:00Z",
            "retrieved_at": now_iso,
            "is_cached": False,
            "error": f"Layer {meta['name']} does not support point feature info query."
        }

    def do_query(target_lat: float, target_lon: float, req_time: Optional[str]):
        tile_x, tile_y, pixel_i, pixel_j = latlon_to_tile(target_lat, target_lon, zoom=4)
        params = {
            "SERVICE": "WMTS",
            "VERSION": "1.0.0",
            "REQUEST": "GetFeatureInfo",
            "LAYER": meta["wmts_layer"],
            "STYLE": "default",
            "TILEMATRIXSET": meta["matrix_set"],
            "TILEMATRIX": "4",
            "TILEROW": str(tile_y),
            "TILECOL": str(tile_x),
            "I": str(pixel_i),
            "J": str(pixel_j),
            "INFOFORMAT": "application/json"
        }
        if req_time:
            params["TIME"] = req_time

        url = f"{settings.copernicus_wmts_url}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(url, headers={"User-Agent": "ORCA-FeatureInfo-Client/1.0"})
        with urllib.request.urlopen(req, timeout=8.0) as resp:
            if resp.status == 200:
                return json.loads(resp.read().decode("utf-8"))
        return None

    payload = None
    val = None
    sampled_lat = lat
    sampled_lon = lon
    actual_time = time_iso or "2026-08-28T00:00:00Z"
    sampling_method = "EXACT_GRID_POINT"

    try:
        payload = do_query(lat, lon, time_iso)
        if payload:
            val, s_lat, s_lon, t_val = _extract_props(payload.get("features", []), meta)
            if s_lat is not None:
                sampled_lat = round(float(s_lat), 4)
            if s_lon is not None:
                sampled_lon = round(float(s_lon), 4)
            if t_val:
                actual_time = str(t_val)
    except urllib.error.HTTPError as http_err:
        if time_iso and http_err.code in (400, 404):
            try:
                payload = do_query(lat, lon, None)
                if payload:
                    val, s_lat, s_lon, t_val = _extract_props(payload.get("features", []), meta)
                    if s_lat is not None:
                        sampled_lat = round(float(s_lat), 4)
                    if s_lon is not None:
                        sampled_lon = round(float(s_lon), 4)
                    if t_val:
                        actual_time = str(t_val)
            except Exception:
                pass
    except Exception as e:
        logger.warning(f"Feature info initial query error: {e}")

    # If point is land-masked (val is None), check nearest offshore ocean grid cell (~0.2 deg)
    if val is None:
        for offset_lon in [-0.2, 0.2, -0.4, 0.4]:
            try:
                alt_payload = do_query(lat, lon + offset_lon, time_iso)
                if alt_payload:
                    alt_val, s_lat, s_lon, t_val = _extract_props(alt_payload.get("features", []), meta)
                    if alt_val is not None:
                        val = alt_val
                        payload = alt_payload
                        sampling_method = "NEAREST_OCEAN_CELL"
                        if s_lat is not None:
                            sampled_lat = round(float(s_lat), 4)
                        if s_lon is not None:
                            sampled_lon = round(float(s_lon), 4)
                        if t_val:
                            actual_time = str(t_val)
                        break
            except Exception:
                continue

    if abs(sampled_lat - lat) > 0.05 or abs(sampled_lon - lon) > 0.05:
        sampling_method = "NEAREST_OCEAN_CELL"

    obs_status = "CONNECTED" if val is not None else "NO_DATA"
    result = {
        "status": obs_status,
        "source": meta["source"],
        "product_id": meta["product_id"],
        "dataset_id": meta["dataset_id"],
        "variable": meta["variable"],
        "latitude": lat,
        "longitude": lon,
        "sampled_latitude": sampled_lat,
        "sampled_longitude": sampled_lon,
        "sampling_method": sampling_method,
        "value": val,
        "unit": meta["units"],
        "spatial_resolution": meta.get("spatial_resolution", ""),
        "temporal_resolution": meta.get("temporal_resolution", ""),
        "observation_timestamp": actual_time,
        "retrieved_at": now_iso,
        "raw_geojson": payload,
        "is_cached": False,
        "error": None if val is not None else "Point is land-masked or outside active coverage grid."
    }
    cache_service.set(cache_key, result, source="Copernicus Marine", ttl_seconds=600)
    return result
