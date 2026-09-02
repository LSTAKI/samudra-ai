"""
ORCA Backend — Marine Bulletins & Safety Router
"""
from typing import Optional
from fastapi import APIRouter, Query

from app.providers.imd.marine import (
    get_port_warnings,
    get_sea_bulletins,
    get_coastal_bulletins,
    get_fishermen_warnings,
    MONITORED_PORTS
)
from app.providers.imd.warnings import get_district_warnings

router = APIRouter(prefix="/marine", tags=["Marine Bulletins & Safety"])


@router.get("/ports")
async def monitored_ports():
    """List baseline monitored major ports and harbors across India."""
    return {"status": "CONNECTED", "ports": MONITORED_PORTS}


@router.get("/port-warnings")
async def port_warnings():
    """Retrieve official IMD Port Warning bulletins and storm warning signal flags."""
    return await get_port_warnings()


@router.get("/sea-bulletins")
async def sea_bulletins(
    basin: str = Query("arabian_sea", description="Ocean basin: 'arabian_sea' or 'bay_of_bengal'")
):
    """Retrieve daily official IMD Sea Bulletins."""
    return await get_sea_bulletins(basin=basin)


@router.get("/coastal-bulletins")
async def coastal_bulletins(
    state: str = Query("kerala", description="Coastal state key (e.g. kerala, maharashtra, tamil_nadu)")
):
    """Retrieve daily official IMD Coastal Weather Bulletins."""
    return await get_coastal_bulletins(state=state)


@router.get("/fishermen-warnings")
async def fishermen_warnings(
    lat: Optional[float] = Query(None, description="Fisherman location latitude"),
    lon: Optional[float] = Query(None, description="Fisherman location longitude")
):
    """Retrieve official IMD Fishermen Sea Safety Warning bulletins."""
    return await get_fishermen_warnings(lat=lat, lon=lon)


@router.get("/district-warnings")
async def district_warnings(
    state: Optional[str] = Query("kerala", description="State name for warnings")
):
    """Retrieve official IMD district weather warnings."""
    return await get_district_warnings(state=state)
