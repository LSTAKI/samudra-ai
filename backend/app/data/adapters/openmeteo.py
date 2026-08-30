"""
ORCA Backend — Open-Meteo Marine API Adapter
Public, no authentication required. Returns real wave + wind data.
API: https://open-meteo.com/en/docs/marine-weather-api
"""
import logging
import time as _time
from datetime import datetime, timezone
from typing import Any, List, Optional

import httpx

from app.data.normalization.units import mackenzie_sound_speed

logger = logging.getLogger(__name__)

OPEN_METEO_MARINE = "https://marine-api.open-meteo.com/v1/marine"
OPEN_METEO_WEATHER = "https://api.open-meteo.com/v1/forecast"


async def fetch_marine_point(lat: float, lng: float) -> dict:
    """
    Fetches REAL current marine + atmospheric data from Open-Meteo.
    Returns wave height, wave direction, wind speed, wind direction.
    All data is real — no simulation.
    """
    params = {
        "latitude": lat,
        "longitude": lng,
        "current": [
            "wave_height",
            "wave_direction",
            "wave_period",
            "wind_wave_height",
            "swell_wave_height",
        ],
        "hourly": "wave_height",
        "forecast_days": 3,
        "timezone": "UTC",
    }

    wind_params = {
        "latitude": lat,
        "longitude": lng,
        "current": [
            "wind_speed_10m",
            "wind_direction_10m",
            "temperature_2m",
        ],
        "timezone": "UTC",
        "forecast_days": 1,
    }

    result = {}
    t0 = _time.time()

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            marine_resp = await client.get(OPEN_METEO_MARINE, params=params)
            marine_resp.raise_for_status()
            marine_data = marine_resp.json()
            curr = marine_data.get("current", {})
            result["wave_height"] = curr.get("wave_height")
            result["wave_direction"] = curr.get("wave_direction")
            result["wave_period"] = curr.get("wave_period")
            result["swell_wave_height"] = curr.get("swell_wave_height")
            logger.info(f"Open-Meteo marine: {result} ({round((_time.time()-t0)*1000)}ms)")
        except Exception as e:
            logger.warning(f"Open-Meteo marine failed: {e}")

        try:
            weather_resp = await client.get(OPEN_METEO_WEATHER, params=wind_params)
            weather_resp.raise_for_status()
            weather_data = weather_resp.json()
            wcurr = weather_data.get("current", {})
            result["wind_speed"] = wcurr.get("wind_speed_10m")
            result["wind_direction"] = wcurr.get("wind_direction_10m")
            result["air_temperature"] = wcurr.get("temperature_2m")
        except Exception as e:
            logger.warning(f"Open-Meteo weather failed: {e}")

    return result


async def fetch_marine_timeseries(lat: float, lng: float, days: int = 7) -> List[dict]:
    """
    Fetches historical daily wave + wind time series.
    Returns list of {timestamp, wave_height, wind_speed} dicts.
    """
    from datetime import timedelta, date as ddate
    today = ddate.today()
    start_date = today - timedelta(days=days - 1)

    params = {
        "latitude": lat,
        "longitude": lng,
        "daily": ["wave_height_max", "wave_direction_dominant"],
        "start_date": start_date.isoformat(),
        "end_date": today.isoformat(),
        "timezone": "UTC",
    }
    wind_params = {
        "latitude": lat,
        "longitude": lng,
        "daily": ["wind_speed_10m_max", "wind_direction_10m_dominant"],
        "start_date": start_date.isoformat(),
        "end_date": today.isoformat(),
        "timezone": "UTC",
    }

    records = []
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r1 = await client.get(OPEN_METEO_MARINE, params=params)
            r1.raise_for_status()
            marine_data = r1.json()

            r2 = await client.get(OPEN_METEO_WEATHER, params=wind_params)
            r2.raise_for_status()
            weather_data = r2.json()

            dates = marine_data.get("daily", {}).get("time", [])
            wave_heights = marine_data.get("daily", {}).get("wave_height_max", [])
            wind_speeds = weather_data.get("daily", {}).get("wind_speed_10m_max", [])

            for i, d in enumerate(dates):
                wh = wave_heights[i] if i < len(wave_heights) else None
                ws = wind_speeds[i] if i < len(wind_speeds) else None
                records.append({
                    "timestamp": d,
                    "wave_height": round(wh, 2) if wh is not None else None,
                    "wind_speed": round(ws * 0.2778, 2) if ws is not None else None,  # km/h -> m/s
                })
        except Exception as e:
            logger.warning(f"Open-Meteo timeseries failed: {e}")

    return records
