"""
ORCA Backend — Satellites API Router
GET /api/v1/satellites/platforms       — Platform catalog
GET /api/v1/satellites/swaths          — GeoJSON ground tracks
GET /api/v1/satellites/telemetry/{id}  — Sensor health
"""
from fastapi import APIRouter, Depends

from app.agents import satellite_agent
from app.core.security import verify_api_key
from app.schemas.envelope import DataStatus, make_envelope

router = APIRouter(prefix="/satellites", tags=["Satellites"])


@router.get("/platforms")
async def get_platforms(_: None = Depends(verify_api_key)):
    """
    Returns all satellite platform definitions.
    Connects to: SatelliteSidebar component (/research/satellites page).
    """
    platforms = satellite_agent.get_platforms()
    return make_envelope(
        data=[p.model_dump() for p in platforms],
        data_status=DataStatus.DEMO,
        warnings=["Platform telemetry is DEMO. Real-time TLE data requires CelesTrak access."],
    )


@router.get("/swaths")
async def get_swaths(
    platform_id: str = "sentinel-3a",
    time_window: str = "24h",
    _: None = Depends(verify_api_key),
):
    """
    Returns GeoJSON orbital ground tracks and swath footprints.
    Connects to: SatelliteMap component (/research/satellites page).
    """
    swath = satellite_agent.get_swath(platform_id, time_window)
    return make_envelope(
        data=swath.model_dump(),
        data_status=DataStatus.DEMO,
        warnings=["Ground tracks computed from simplified circular orbit model. Use SGP4 propagator for production."],
    )


@router.get("/telemetry/{platform_id}")
async def get_telemetry(platform_id: str, _: None = Depends(verify_api_key)):
    """
    Returns platform telemetry and sensor health.
    Connects to: SatelliteTelemetry component (/research/satellites page).
    """
    telemetry = satellite_agent.get_telemetry(platform_id)
    return make_envelope(
        data=telemetry.model_dump(),
        data_status=DataStatus.DEMO,
    )
