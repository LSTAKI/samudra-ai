"""
ORCA Backend — IMD Astronomy & Ephemeris Provider
Integrates official IMD /sunmoon endpoint for coastal sunrise, sunset, moonrise, and moon phase ephemeris.
"""
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone

from app.providers.imd.client import imd_client

logger = logging.getLogger("orca.imd.astronomy")


async def get_sun_moon_ephemeris(lat: float = 9.9312, lon: float = 76.2673, date_str: Optional[str] = None) -> Dict[str, Any]:
    """
    Fetch sunrise, sunset, moonrise, moonset, and lunar phase ephemeris from IMD /sunmoon.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    params = {
        "lat": str(lat),
        "lon": str(lon),
    }
    if date_str:
        params["date"] = date_str

    res = await imd_client.get("sunmoon", params=params, ttl_seconds=3600)
    if res["status"] == "CONNECTED" and res["data"]:
        return {
            "status": "CONNECTED",
            "source": "IMD (Positional Astronomy Centre, Kolkata)",
            "dataset": "Sun & Moon Ephemeris (/sunmoon)",
            "coordinates": {"lat": lat, "lon": lon},
            "retrieved_at": res["retrieved_at"],
            "data": res["data"],
            "error": None
        }

    return {
        "status": "UNAVAILABLE",
        "source": "IMD",
        "dataset": "Sun & Moon Ephemeris",
        "coordinates": {"lat": lat, "lon": lon},
        "retrieved_at": now_iso,
        "data": None,
        "error": res["error"] or "IMD Sun/Moon ephemeris service currently unavailable."
    }
