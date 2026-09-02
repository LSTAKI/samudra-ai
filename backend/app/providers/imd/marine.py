"""
ORCA Backend — IMD Marine Bulletins & Warnings Provider
Integrates official IMD Marine Weather endpoints:
- /portwarning (Port Warning & Signal Flags)
- /seabulletin (Daily Sea Bulletin for Arabian Sea & Bay of Bengal)
- /coastalbulletin (Coastal Weather Bulletin)
- Fishermen Warning Advisories
"""
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from app.providers.imd.client import imd_client
from app.providers.imd.types import IMDMarineBulletin

logger = logging.getLogger("orca.imd.marine")

# Canonical baseline ports monitored by IMD
MONITORED_PORTS = [
    {"code": "COCHIN", "name": "Cochin (Kochi) Port", "state": "Kerala", "lat": 9.9667, "lon": 76.2667},
    {"code": "VIZHINJAM", "name": "Vizhinjam International Seaport", "state": "Kerala", "lat": 8.3758, "lon": 76.9906},
    {"code": "MUMBAI", "name": "Mumbai Port & JNPT", "state": "Maharashtra", "lat": 18.9438, "lon": 72.8647},
    {"code": "MANGALORE", "name": "New Mangalore Port", "state": "Karnataka", "lat": 12.9300, "lon": 74.8100},
    {"code": "MORMUGAO", "name": "Mormugao Port (Goa)", "state": "Goa", "lat": 15.4167, "lon": 73.8000},
    {"code": "CHENNAI", "name": "Chennai Port", "state": "Tamil Nadu", "lat": 13.0839, "lon": 80.2922},
    {"code": "TUTICORIN", "name": "V.O. Chidambaranar Port (Tuticorin)", "state": "Tamil Nadu", "lat": 8.7530, "lon": 78.1880},
    {"code": "VIZAG", "name": "Visakhapatnam Port", "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2800},
    {"code": "PARADIP", "name": "Paradip Port", "state": "Odisha", "lat": 20.2644, "lon": 86.6714},
    {"code": "KAVARATTI", "name": "Kavaratti Port / Jetty", "state": "Lakshadweep", "lat": 10.5667, "lon": 72.6417},
]


async def get_port_warnings() -> Dict[str, Any]:
    """
    Fetch live port warnings and local cautionary signals from IMD /portwarning.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    res = await imd_client.get("portwarning", ttl_seconds=900)

    if res["status"] == "CONNECTED" and res["data"]:
        return {
            "status": "CONNECTED",
            "source": "IMD (India Meteorological Department)",
            "dataset": "Port Warnings & Cautionary Signals (/portwarning)",
            "retrieved_at": res["retrieved_at"],
            "data": res["data"],
            "error": None
        }

    return {
        "status": "UNAVAILABLE",
        "source": "IMD",
        "dataset": "Port Warnings & Cautionary Signals",
        "retrieved_at": now_iso,
        "data": None,
        "monitored_ports": MONITORED_PORTS,
        "error": res["error"] or "IMD Port Warning feed currently unavailable."
    }


async def get_sea_bulletins(basin: str = "arabian_sea") -> Dict[str, Any]:
    """
    Fetch daily Sea Bulletin for North Indian Ocean basins from IMD /seabulletin.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    params = {"basin": basin}
    res = await imd_client.get("seabulletin", params=params, ttl_seconds=1800)

    if res["status"] == "CONNECTED" and res["data"]:
        return {
            "status": "CONNECTED",
            "source": "IMD (India Meteorological Department)",
            "dataset": "Daily Sea Bulletin (/seabulletin)",
            "basin": basin,
            "retrieved_at": res["retrieved_at"],
            "data": res["data"],
            "error": None
        }

    return {
        "status": "UNAVAILABLE",
        "source": "IMD",
        "dataset": "Daily Sea Bulletin",
        "basin": basin,
        "retrieved_at": now_iso,
        "data": None,
        "error": res["error"] or f"IMD Sea Bulletin for {basin} currently unavailable."
    }


async def get_coastal_bulletins(state: str = "kerala") -> Dict[str, Any]:
    """
    Fetch Coastal Weather Bulletins from IMD /coastalbulletin.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    params = {"state": state}
    res = await imd_client.get("coastalbulletin", params=params, ttl_seconds=1800)

    if res["status"] == "CONNECTED" and res["data"]:
        return {
            "status": "CONNECTED",
            "source": "IMD (India Meteorological Department)",
            "dataset": "Coastal Weather Bulletin (/coastalbulletin)",
            "state": state,
            "retrieved_at": res["retrieved_at"],
            "data": res["data"],
            "error": None
        }

    return {
        "status": "UNAVAILABLE",
        "source": "IMD",
        "dataset": "Coastal Weather Bulletin",
        "state": state,
        "retrieved_at": now_iso,
        "data": None,
        "error": res["error"] or f"IMD Coastal Bulletin for {state} currently unavailable."
    }


async def get_fishermen_warnings(lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    """
    Fetch official Fishermen Warning advisory from IMD.
    Preserves verbatim official warning messages.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    res = await imd_client.get("fishermenwarning", ttl_seconds=900)

    if res["status"] == "CONNECTED" and res["data"]:
        return {
            "status": "CONNECTED",
            "source": "IMD (India Meteorological Department)",
            "dataset": "Fishermen Sea Safety Warning Bulletin",
            "retrieved_at": res["retrieved_at"],
            "data": res["data"],
            "error": None
        }

    return {
        "status": "UNAVAILABLE",
        "source": "IMD",
        "dataset": "Fishermen Sea Safety Warning Bulletin",
        "retrieved_at": now_iso,
        "data": None,
        "error": res["error"] or "Official IMD Fishermen Warning bulletin currently unavailable."
    }
