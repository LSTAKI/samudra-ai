"""
Test Suite: IMD Provider & Endpoints
"""
import pytest
from app.providers.imd.weather import get_current_weather, get_city_forecast
from app.providers.imd.marine import get_port_warnings, get_sea_bulletins, get_fishermen_warnings
from app.providers.imd.cyclone import get_active_cyclones
from app.providers.imd.astronomy import get_sun_moon_ephemeris


@pytest.mark.asyncio
async def test_get_current_weather():
    res = await get_current_weather(lat=9.9312, lon=76.2673)
    assert res is not None
    assert "status" in res
    assert res["status"] in ["CONNECTED", "UNAVAILABLE"]
    if res["status"] == "CONNECTED":
        assert "temperature_c" in res["data"] or "temperature" in res["data"]


@pytest.mark.asyncio
async def test_get_port_warnings():
    res = await get_port_warnings()
    assert res is not None
    assert "status" in res
    assert res["source"] == "IMD" or "IMD" in res["source"]


@pytest.mark.asyncio
async def test_get_active_cyclones():
    res = await get_active_cyclones()
    assert res is not None
    assert "status" in res
    assert "data" in res
    assert "active_cyclones_count" in res


@pytest.mark.asyncio
async def test_get_sun_moon_ephemeris():
    res = await get_sun_moon_ephemeris(lat=9.9312, lon=76.2673)
    assert res is not None
    assert "status" in res
    assert "coordinates" in res
