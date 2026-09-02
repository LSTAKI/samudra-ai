"""
ORCA Backend — Potential Fishing Zone (PFZ) Router
"""
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Query

from app.services.pfz_engine import compute_deterministic_pfz

router = APIRouter(prefix="/pfz", tags=["Potential Fishing Zones"])


class PFZAnalysisRequest(BaseModel):
    latitude: float
    longitude: float
    harbor: Optional[str] = None
    min_confidence: Optional[float] = 0.65


@router.get("/zones")
async def get_zones(
    lat: Optional[float] = Query(None, description="User or vessel latitude"),
    lon: Optional[float] = Query(None, description="User or vessel longitude"),
    harbor: Optional[str] = Query(None, description="Departure harbor preset")
):
    """Retrieve verified PFZ candidate zones calculated via deterministic thermal/chlorophyll gradient analysis."""
    return compute_deterministic_pfz(user_lat=lat, user_lon=lon, harbor=harbor)


@router.post("/analyze")
async def analyze_pfz(req: PFZAnalysisRequest):
    """Execute on-demand PFZ candidate evaluation for coordinates."""
    return compute_deterministic_pfz(user_lat=req.latitude, user_lon=req.longitude, harbor=req.harbor)
