"""
ORCA Backend — Tropical Cyclones Router
"""
from fastapi import APIRouter
from app.providers.imd.cyclone import get_active_cyclones

router = APIRouter(prefix="/cyclones", tags=["Tropical Cyclones & Hazards"])


@router.get("/active")
async def active_cyclones():
    """
    Retrieve active tropical cyclone tracks, gale wind radii, and cones of uncertainty
    from the IMD Cyclone Warning Division (New Delhi).
    """
    return await get_active_cyclones()
