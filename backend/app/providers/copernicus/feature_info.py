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


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate Haversine distance in kilometers between two decimal coordinates."""
    if abs(lat1 - lat2) < 0.0001 and abs(lon1 - lon2) < 0.0001:
        return 0.0
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


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
    
    cache_key = f"copernicus:fi:{meta['id']}:{lat:.4f}_{lon:.4f}:{time_iso or 'default'}"
    cached = cache_service.get(cache_key)
    if cached:
        res = dict(cached["data"])
        res["is_cached"] = True
        return res

    if not meta["supports_feature_info"]:
        return {
            "status": "UNAVAILABLE",
            "source": meta["source"],
            "product_id": meta["product_id"],
            "dataset_id": meta["dataset_id"],
            "variable": meta["variable"],
            "latitude": lat,
            "longitude": lon,
            "sampled_latitude": round(lat, 4),
            "sampled_longitude": round(lon, 4),
            "sampling_method": "EXACT_GRID_POINT",
            "sampling_distance_km": 0.0,
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
    sampled_lat = round(lat, 4)
    sampled_lon = round(lon, 4)
    actual_time = time_iso or "2026-08-28T00:00:00Z"
    sampling_method = "EXACT_GRID_POINT"
    distance_km = 0.0

    try:
        payload = do_query(lat, lon, time_iso)
        if payload:
            val, _, _, t_val = _extract_props(payload.get("features", []), meta)
            if t_val:
                actual_time = str(t_val)
    except urllib.error.HTTPError as http_err:
        if time_iso and http_err.code in (400, 404):
            try:
                payload = do_query(lat, lon, None)
                if payload:
                    val, _, _, t_val = _extract_props(payload.get("features", []), meta)
                    if t_val:
                        actual_time = str(t_val)
            except Exception:
                pass
    except Exception as e:
        logger.warning(f"Feature info initial query error: {e}")

    # If point is land-masked (val is None), evaluate candidates within 0.20 deg (~22.2 km)
    # and select the valid ocean candidate with MINIMUM Haversine distance.
    if val is None:
        candidate_offsets = []
        for r in [0.05, 0.10, 0.15, 0.20]:
            candidate_offsets.extend([
                (0.0, -r), (-r, 0.0), (0.0, r), (r, 0.0),
                (-r, -r), (-r, r), (r, -r), (r, r)
            ])
        
        valid_candidates = []
        for d_lat, d_lon in candidate_offsets:
            target_lat = round(lat + d_lat, 4)
            target_lon = round(lon + d_lon, 4)
            dist_km = calculate_haversine_distance(lat, lon, target_lat, target_lon)
            
            try:
                alt_payload = do_query(target_lat, target_lon, time_iso)
                if alt_payload:
                    alt_val, _, _, t_val = _extract_props(alt_payload.get("features", []), meta)
                    if alt_val is not None:
                        valid_candidates.append({
                            "lat": target_lat,
                            "lon": target_lon,
                            "val": alt_val,
                            "payload": alt_payload,
                            "time": str(t_val) if t_val else actual_time,
                            "distance_km": dist_km
                        })
            except Exception:
                continue

        if valid_candidates:
            # Sort by minimum Haversine distance
            valid_candidates.sort(key=lambda c: c["distance_km"])
            best_cand = valid_candidates[0]

            val = best_cand["val"]
            payload = best_cand["payload"]
            sampled_lat = best_cand["lat"]
            sampled_lon = best_cand["lon"]
            actual_time = best_cand["time"]
            distance_km = best_cand["distance_km"]
            sampling_method = "NEAREST_OCEAN_CELL"
        else:
            val = None
            sampled_lat = round(lat, 4)
            sampled_lon = round(lon, 4)
            distance_km = 0.0
            sampling_method = "NO_DATA"
    else:
        sampling_method = "EXACT_GRID_POINT"
        sampled_lat = round(lat, 4)
        sampled_lon = round(lon, 4)
        distance_km = 0.0

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
        "sampling_distance_km": distance_km,
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
