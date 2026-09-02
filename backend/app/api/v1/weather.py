"""
ORCA Backend — Weather & Astronomy API Router
"""
from typing import Optional
from fastapi import APIRouter, Query

from app.providers.imd.weather import get_current_weather, get_city_forecast
from app.providers.imd.astronomy import get_sun_moon_ephemeris

router = APIRouter(prefix="/weather", tags=["Weather & Atmosphere"])


@router.get("/current")
async def current_weather(
    station_id: Optional[str] = Query(None, description="IMD station code (e.g. 43351)"),
    lat: Optional[float] = Query(None, description="Latitude for coordinate lookup"),
    lon: Optional[float] = Query(None, description="Longitude for coordinate lookup"),
):
    """Retrieve current surface weather observation from IMD /current_wx."""
    return await get_current_weather(station_id=station_id, lat=lat, lon=lon)


@router.get("/forecast")
async def city_forecast(
    station_id: Optional[str] = Query("kochi", description="Coastal city key (e.g. kochi, mumbai, chennai)")
):
    """Retrieve 7-day coastal forecast from IMD /cityforecast."""
    return await get_city_forecast(station_id=station_id)


@router.get("/astronomy")
async def sun_moon(
    lat: float = Query(9.9312, description="Latitude"),
    lon: float = Query(76.2673, description="Longitude"),
    date: Optional[str] = Query(None, description="Date in YYYY-MM-DD format")
):
    """Retrieve sunrise, sunset, moonrise, and moon phase ephemeris from IMD /sunmoon."""
    return await get_sun_moon_ephemeris(lat=lat, lon=lon, date_str=date)
