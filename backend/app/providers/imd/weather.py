"""
ORCA Backend — IMD Weather & City Forecast Provider
Integrates /current_wx and /cityforecast endpoints with fallback to Open-Meteo marine observations.
"""
import logging
import json
import urllib.request
import urllib.parse
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from app.providers.imd.client import imd_client
from app.providers.imd.types import IMDCurrentWeather
from app.core.config import settings

logger = logging.getLogger("orca.imd.weather")

COASTAL_STATIONS = {
    "kochi": {"id": "43351", "name": "Kochi (Cochin)", "lat": 9.9312, "lon": 76.2673, "state": "Kerala"},
    "mumbai": {"id": "43003", "name": "Mumbai (Colaba)", "lat": 18.9067, "lon": 72.8147, "state": "Maharashtra"},
    "chennai": {"id": "43279", "name": "Chennai (Minambakkam)", "lat": 13.0827, "lon": 80.2707, "state": "Tamil Nadu"},
    "vizag": {"id": "43149", "name": "Visakhapatnam", "lat": 17.6868, "lon": 83.2185, "state": "Andhra Pradesh"},
    "goa": {"id": "43192", "name": "Panaji (Goa)", "lat": 15.4909, "lon": 73.8278, "state": "Goa"},
    "mangalore": {"id": "43285", "name": "Mangaluru (Panambur)", "lat": 12.9141, "lon": 74.8560, "state": "Karnataka"},
    "port_blair": {"id": "43333", "name": "Port Blair", "lat": 11.6234, "lon": 92.7265, "state": "Andaman & Nicobar"},
    "kavaratti": {"id": "43361", "name": "Kavaratti", "lat": 10.5667, "lon": 72.6417, "state": "Lakshadweep"},
}


async def get_current_weather(station_id: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    """
    Fetch current weather from IMD /current_wx or fallback to Open-Meteo for coordinate lookup.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()

    # 1. Query official IMD /current_wx
    params = {}
    if station_id:
        params["station_id"] = station_id
    elif lat and lon:
        params["lat"] = str(lat)
        params["lon"] = str(lon)

    res = await imd_client.get("current_wx", params=params, ttl_seconds=600)
    if res["status"] == "CONNECTED" and res["data"]:
        data = res["data"]
        return {
            "status": "CONNECTED",
            "source": "IMD (India Meteorological Department)",
            "dataset": "Current Weather Observation (/current_wx)",
            "observation_time": data.get("observation_time", now_iso),
            "retrieved_at": res["retrieved_at"],
            "data": data,
            "error": None
        }

    # 2. Fallback to Open-Meteo for marine coordinate observations if IMD key is unset
    target_lat = lat if lat is not None else 9.9312
    target_lon = lon if lon is not None else 76.2673

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={target_lat}&longitude={target_lon}&"
            f"current=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation&"
            f"wind_speed_unit=kmh"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "ORCA-Marine-Platform/1.0"})
        with urllib.request.urlopen(req, timeout=6.0) as resp:
            if resp.status == 200:
                body = json.loads(resp.read().decode("utf-8"))
                om_data = body.get("current", {})
                return {
                    "status": "CONNECTED",
                    "source": "Open-Meteo Marine / IMD Fallback",
                    "dataset": "Global Forecast System Surface Observation",
                    "observation_time": om_data.get("time", now_iso),
                    "retrieved_at": now_iso,
                    "data": {
                        "station_name": f"Coordinate [{target_lat:.3f}°N, {target_lon:.3f}°E]",
                        "latitude": target_lat,
                        "longitude": target_lon,
                        "temperature_c": om_data.get("temperature_2m"),
                        "humidity_percent": om_data.get("relative_humidity_2m"),
                        "pressure_hpa": om_data.get("surface_pressure"),
                        "wind_speed_kmh": om_data.get("wind_speed_10m"),
                        "wind_direction_deg": om_data.get("wind_direction_10m"),
                        "rainfall_24h_mm": om_data.get("precipitation", 0.0),
                    },
                    "error": None
                }
    except Exception as err:
        logger.warning(f"Open-Meteo fallback failed: {err}")

    return {
        "status": "UNAVAILABLE",
        "source": "IMD",
        "dataset": "Current Weather Observation",
        "observation_time": None,
        "retrieved_at": now_iso,
        "data": None,
        "error": res["error"] or "Unable to retrieve current weather observation."
    }


async def get_city_forecast(station_id: Optional[str] = "kochi") -> Dict[str, Any]:
    """
    Fetch 7-day city forecast from IMD /cityforecast endpoint.
    """
    station_meta = COASTAL_STATIONS.get(station_id, COASTAL_STATIONS["kochi"])
    res = await imd_client.get("cityforecast", params={"station_id": station_meta["id"]}, ttl_seconds=1800)
    
    if res["status"] == "CONNECTED" and res["data"]:
        return {
            "status": "CONNECTED",
            "source": "IMD (India Meteorological Department)",
            "dataset": "7-Day Coastal City Forecast (/cityforecast)",
            "station": station_meta,
            "data": res["data"],
            "retrieved_at": res["retrieved_at"],
            "error": None
        }

    return {
        "status": "UNAVAILABLE",
        "source": "IMD",
        "dataset": "7-Day Coastal City Forecast",
        "station": station_meta,
        "data": None,
        "retrieved_at": datetime.now(tz=timezone.utc).isoformat(),
        "error": res["error"] or "IMD City Forecast feed unavailable."
    }
