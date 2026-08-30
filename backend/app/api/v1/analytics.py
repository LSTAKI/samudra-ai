"""
ORCA Backend — Analytics API Router
GET /api/v1/analytics/timeseries  — Historical time series with stats
GET /api/v1/analytics/anomaly     — Climatological anomaly
GET /api/v1/analytics/regional    — Basin-level comparison
GET /api/v1/analytics/sources     — Multi-sensor source comparison grid
GET /api/v1/analytics/quality     — Data quality metrics
"""
from fastapi import APIRouter, Depends, Query
from typing import Optional

from app.agents import analytics_agent
from app.core.security import verify_api_key
from app.schemas.envelope import DataStatus, make_envelope

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/timeseries")
async def get_timeseries(
    param: str = Query(default="sst", description="sst | chlorophyll | wave_height | sla | wind_speed"),
    region: str = Query(default="kerala-coast"),
    window: str = Query(default="30d", description="7d | 30d | 90d | 365d"),
    _: None = Depends(verify_api_key),
):
    """
    Returns historical time series with statistical summary.
    Connects to: AnalyticsTimeSeries component (/research/analytics page).
    """
    result = analytics_agent.compute_timeseries(param, region, window)
    return make_envelope(
        data=result.model_dump(),
        data_status=DataStatus.DEMO,
        warnings=["Time series generated from deterministic model. Production queries TimescaleDB."],
    )


@router.get("/anomaly")
async def get_anomaly(
    param: str = Query(default="sst"),
    lat: float = Query(default=9.9312),
    lng: float = Query(default=76.2673),
    observed: Optional[float] = Query(default=None, description="Observed value; if omitted uses demo SST"),
    _: None = Depends(verify_api_key),
):
    """
    Returns climatological anomaly comparison.
    Connects to: AnalyticsAnomalyPanel component (/research/analytics page).
    """
    if observed is None:
        observed = 29.42 if param == "sst" else 0.64  # Demo defaults
    result = analytics_agent.compute_anomaly(param, lat, lng, observed)
    return make_envelope(data=result.model_dump(), data_status=DataStatus.DEMO)


@router.get("/sources")
async def get_source_comparison(
    lat: float = Query(default=9.9312),
    lng: float = Query(default=76.2673),
    _: None = Depends(verify_api_key),
):
    """
    Returns multi-sensor comparison grid (Copernicus vs ISRO vs INCOIS vs NOAA).
    Connects to: AnalyticsSourceComparison component (/research/analytics page).
    """
    rows = analytics_agent.compute_source_comparison(lat, lng)
    return make_envelope(
        data=[r.model_dump() for r in rows],
        data_status=DataStatus.DEMO,
        warnings=["ISRO and INCOIS values are DEMO pending agency API registration."],
    )


@router.get("/regional")
async def get_regional_comparison(
    param: str = Query(default="sst"),
    _: None = Depends(verify_api_key),
):
    """Returns basin-by-basin comparison for a parameter."""
    regions = ["kerala-coast", "lakshadweep", "arabian-sea", "bay-of-bengal", "andaman-sea"]
    data = []
    for r in regions:
        series = analytics_agent.compute_timeseries(param, r, "30d")
        data.append({"region": r, "stats": series.stats.model_dump()})
    return make_envelope(data=data, data_status=DataStatus.DEMO)


@router.get("/quality")
async def get_data_quality(
    lat: float = Query(default=9.9312),
    lng: float = Query(default=76.2673),
    _: None = Depends(verify_api_key),
):
    """Returns QA/QC spatial completeness and cloud mask metrics."""
    from app.agents.quality_agent import assess_quality
    from datetime import datetime, timezone
    quality = assess_quality("REAL DATA", "COPERNICUS MARINE", datetime.now(tz=timezone.utc))
    return make_envelope(data=quality.model_dump(), data_status=DataStatus.REAL_DATA)
