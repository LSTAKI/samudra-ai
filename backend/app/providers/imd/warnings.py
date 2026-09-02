"""
ORCA Backend — IMD District & Subdivision Warnings Provider
Integrates official IMD warning endpoints:
- /districtwarning
- /subdivisionwarning
- /districtnowcast
"""
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timezone

from app.providers.imd.client import imd_client

logger = logging.getLogger("orca.imd.warnings")


async def get_district_warnings(district_id: Optional[str] = None, state: Optional[str] = "kerala") -> Dict[str, Any]:
    """
    Fetch official district-level meteorological warnings from IMD /districtwarning.
    """
    now_iso = datetime.now(tz=timezone.utc).isoformat()
    params = {}
    if district_id:
        params["district_id"] = district_id
    elif state:
        params["state"] = state

    res = await imd_client.get("districtwarning", params=params, ttl_seconds=900)
    if res["status"] == "CONNECTED" and res["data"]:
        return {
            "status": "CONNECTED",
            "source": "IMD (National Weather Forecasting Centre)",
            "dataset": "District Weather Warning Bulletin (/districtwarning)",
            "state": state,
            "retrieved_at": res["retrieved_at"],
            "data": res["data"],
            "error": None
        }

    return {
        "status": "UNAVAILABLE",
        "source": "IMD",
        "dataset": "District Weather Warning Bulletin",
        "state": state,
        "retrieved_at": now_iso,
        "data": None,
        "error": res["error"] or f"IMD District Warnings for {state} currently unavailable."
    }
