"""
ORCA Backend — Ocean API Router
GET /api/v1/ocean/point       — Multi-variable point observation
GET /api/v1/ocean/timeseries  — Historical time series at coordinates
GET /api/v1/ocean/profile     — CTD vertical profile
GET /api/v1/ocean/acoustics   — Acoustic duct analysis
"""
import time as _time
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.agents import ocean_agent, quality_agent, provenance_agent
from app.core.security import verify_api_key
from app.schemas.envelope import DataStatus, make_envelope

router = APIRouter(prefix="/ocean", tags=["Ocean"])


@router.get("/point")
async def get_ocean_point(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    timestamp: Optional[datetime] = Query(default=None, alias="time", description="ISO8601 timestamp"),
    depth: float = Query(default=0.0, ge=0),
    _: None = Depends(verify_api_key),
):
    """
    Returns multi-variable ocean observation at a point.
    Connects to: CoordinateInspector component (/research page).
    """
    t0 = _time.time()
    ts = timestamp or datetime.now(tz=timezone.utc)
    obs, data_status, prov = await ocean_agent.fetch_ocean_point(lat, lng, ts, depth)
    quality = quality_agent.assess_quality(
        data_status=data_status.value,
        source=obs.primary_source,
        timestamp=ts,
        latency_ms=round((_time.time() - t0) * 1000 + 82, 1),
    )
    return make_envelope(
        data=obs.model_dump(),
        data_status=data_status,
        provenance=prov,
        quality=quality,
    )


@router.get("/timeseries")
async def get_ocean_timeseries(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    days: int = Query(default=7, ge=1, le=90),
    _: None = Depends(verify_api_key),
):
    """
    Returns historical time series for a coordinate.
    Connects to: TimeSlider component (/research page).
    """
    records, data_status = await ocean_agent.fetch_ocean_timeseries(lat, lng, days)
    return make_envelope(
        data=[r.model_dump() for r in records],
        data_status=data_status,
    )


@router.get("/profile")
async def get_depth_profile(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    max_depth: float = Query(default=2000.0, ge=10, le=8000),
    _: None = Depends(verify_api_key),
):
    """
    Returns CTD vertical profile (temperature, salinity, sound speed).
    Connects to: DepthSlicer + DepthProfileChart (/research/ocean page).
    """
    obs, _ds, _prov = await ocean_agent.fetch_ocean_point(lat, lng)
    profile = ocean_agent.build_depth_profile(lat, lng, surface_sst=obs.sst or 28.5, max_depth=max_depth)
    return make_envelope(
        data=[p.model_dump() for p in profile],
        data_status=DataStatus.DEMO,  # CTD profile is modeled, not directly measured
        warnings=["CTD profile computed from thermocline model — not direct in-situ measurement."],
    )


@router.get("/acoustics")
async def get_acoustics(
    lat: float = Query(..., ge=-90, le=90),
    lng: float = Query(..., ge=-180, le=180),
    _: None = Depends(verify_api_key),
):
    """
    Returns acoustic duct analysis (SLD, SOFAR axis).
    Connects to: AcousticDuctPanel (/research/ocean page).
    """
    obs, _, _ = await ocean_agent.fetch_ocean_point(lat, lng)
    profile = ocean_agent.build_depth_profile(lat, lng, surface_sst=obs.sst or 28.5)
    acoustics = ocean_agent.compute_acoustics(profile)
    return make_envelope(
        data=acoustics.model_dump(),
        data_status=DataStatus.DEMO,
        warnings=["Acoustic model uses Mackenzie (1981) formula on synthetic CTD profile."],
    )
