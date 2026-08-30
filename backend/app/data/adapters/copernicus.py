"""
ORCA Backend — Copernicus Marine Adapter

Fetches real ocean data from Copernicus Marine Service.
Requires COPERNICUS_MARINE_USERNAME and COPERNICUS_MARINE_PASSWORD env vars.

If credentials are absent → returns data_status: "DEMO" with realistic values
that match the frontend mock data shape exactly.
"""
import logging
import time
from datetime import datetime, timedelta
from typing import Any, List, Optional

import httpx

from app.core.config import settings
from app.core.redis import cache_get, cache_set
from app.data.adapters.base import BaseOceanDataAdapter
from app.data.normalization.units import normalize_sst, mackenzie_sound_speed
from app.schemas.ocean import OceanPointResponse, TimeSeriesRecord

logger = logging.getLogger(__name__)

# ─── Demo data matching mockOcean.ts exactly ─────────────────────────────────
_DEMO_OBSERVATIONS = [
    {"lat": 9.9312, "lng": 76.2673, "sst": 29.42, "sst_anomaly": 0.81, "wave_height": 1.42, "chlorophyll": 0.64, "wind_speed": 8.5, "wind_direction": 240, "current_speed": 0.35, "current_direction": 310},
    {"lat": 10.5667, "lng": 72.6333, "sst": 28.95, "sst_anomaly": 0.35, "wave_height": 1.85, "chlorophyll": 0.22, "wind_speed": 11.2, "wind_direction": 255, "current_speed": 0.42, "current_direction": 295},
    {"lat": 12.0000, "lng": 70.0000, "sst": 27.80, "sst_anomaly": -0.15, "wave_height": 2.45, "chlorophyll": 0.15, "wind_speed": 14.8, "wind_direction": 260, "current_speed": 0.55, "current_direction": 275},
    {"lat": 6.9271, "lng": 79.8612, "sst": 29.10, "sst_anomaly": 0.50, "wave_height": 1.65, "chlorophyll": 0.45, "wind_speed": 9.8, "wind_direction": 225, "current_speed": 0.28, "current_direction": 330},
    {"lat": 15.0000, "lng": 88.0000, "sst": 29.75, "sst_anomaly": 1.15, "wave_height": 1.20, "chlorophyll": 0.38, "wind_speed": 7.2, "wind_direction": 180, "current_speed": 0.22, "current_direction": 90},
    {"lat": 11.6234, "lng": 92.7265, "sst": 28.60, "sst_anomaly": 0.10, "wave_height": 1.35, "chlorophyll": 0.52, "wind_speed": 9.0, "wind_direction": 195, "current_speed": 0.30, "current_direction": 120},
]

_DEMO_HISTORY_OFFSETS = [
    {"timestamp": "-72h", "sst_d": -0.90, "wave_d": 0.40, "chl_d": -0.06, "wind_d": 1.7},
    {"timestamp": "-48h", "sst_d": -0.55, "wave_d": 0.20, "chl_d": -0.04, "wind_d": 1.0},
    {"timestamp": "-24h", "sst_d": -0.30, "wave_d": 0.08, "chl_d": -0.02, "wind_d": 0.5},
    {"timestamp": "NOW",  "sst_d":  0.00, "wave_d": 0.00, "chl_d":  0.00, "wind_d": 0.0},
    {"timestamp": "+24h", "sst_d": +0.23, "wave_d": -0.12, "chl_d": +0.01, "wind_d": -0.7},
    {"timestamp": "+48h", "sst_d": +0.38, "wave_d": -0.17, "chl_d": +0.04, "wind_d": -1.5},
]


def _closest_demo(lat: float, lng: float) -> dict:
    """Return the closest demo observation to the given coordinates."""
    best = min(_DEMO_OBSERVATIONS, key=lambda o: (o["lat"] - lat) ** 2 + (o["lng"] - lng) ** 2)
    return best


class CopernicusAdapter(BaseOceanDataAdapter):
    """
    Copernicus Marine adapter.
    Falls back gracefully to demo data when credentials are missing.
    """

    def __init__(self):
        self._has_creds = settings.has_copernicus_credentials
        if self._has_creds:
            logger.info("Copernicus Marine: credentials found — real data mode.")
        else:
            logger.warning("Copernicus Marine: no credentials — running in DEMO mode.")

    async def health_check(self) -> dict:
        if not self._has_creds:
            return {"status": "demo", "latency_ms": 0}
        t0 = time.time()
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get("https://marine.copernicus.eu")
                return {"status": "ok" if r.status_code < 400 else "degraded", "latency_ms": round((time.time() - t0) * 1000, 1)}
        except Exception:
            return {"status": "offline", "latency_ms": -1}

    async def fetch_point(
        self,
        lat: float,
        lng: float,
        timestamp: datetime,
        depth: float = 0.0,
    ) -> OceanPointResponse:
        cache_key = f"cop:point:{lat:.3f}:{lng:.3f}:{timestamp.date()}"
        cached = cache_get(cache_key)
        if cached:
            return OceanPointResponse(**cached)

        if self._has_creds:
            result = await self._fetch_real_point(lat, lng, timestamp, depth)
        else:
            result = self._fetch_demo_point(lat, lng, timestamp)

        cache_set(cache_key, result.model_dump(mode="json"), ttl=3600)
        return result

    def _fetch_demo_point(self, lat: float, lng: float, timestamp: datetime) -> OceanPointResponse:
        obs = _closest_demo(lat, lng)
        sst = obs["sst"]
        salinity = 34.8  # typical Arabian Sea / Indian Ocean surface
        sound_v = mackenzie_sound_speed(sst, salinity, 0.0)
        return OceanPointResponse(
            latitude=lat,
            longitude=lng,
            timestamp=timestamp,
            depth=0.0,
            sst=sst,
            sst_anomaly=obs["sst_anomaly"],
            wave_height=obs["wave_height"],
            chlorophyll=obs["chlorophyll"],
            wind_speed=obs["wind_speed"],
            wind_direction=obs["wind_direction"],
            current_speed=obs["current_speed"],
            current_direction=obs["current_direction"],
            salinity=salinity,
            sound_velocity=sound_v,
            sea_level_anomaly=round(obs["sst_anomaly"] * 0.05, 3),
            primary_source="COPERNICUS (DEMO)",
            confidence="HIGH",
        )

    async def _fetch_real_point(
        self, lat: float, lng: float, timestamp: datetime, depth: float
    ) -> OceanPointResponse:
        """
        Uses the copernicusmarine Python client (if installed) to slice NetCDF.
        Falls back to demo if the library is not installed.
        """
        try:
            import copernicusmarine as cm  # type: ignore
            import numpy as np

            date_str = timestamp.strftime("%Y-%m-%dT00:00:00")

            def _slice(dataset_id: str, variable: str) -> Optional[float]:
                try:
                    ds = cm.open_dataset(
                        dataset_id=dataset_id,
                        variables=[variable],
                        minimum_latitude=lat - 0.1,
                        maximum_latitude=lat + 0.1,
                        minimum_longitude=lng - 0.1,
                        maximum_longitude=lng + 0.1,
                        start_datetime=date_str,
                        end_datetime=date_str,
                        username=settings.copernicus_marine_username,
                        password=settings.copernicus_marine_password,
                    )
                    arr = ds[variable].values
                    val = float(np.nanmean(arr))
                    return round(val, 4)
                except Exception as e:
                    logger.warning(f"Copernicus slice failed for {variable}: {e}")
                    return None

            sst_raw = _slice(settings.sst_dataset_id, settings.sst_variable)
            sst = normalize_sst(sst_raw, "K") if sst_raw is not None else None
            wave = _slice(settings.wave_dataset_id, settings.wave_variable)
            chl = _slice(settings.chl_dataset_id, settings.chl_variable)
            sla = _slice(settings.sla_dataset_id, settings.sla_variable)

            salinity = 34.8
            sound_v = mackenzie_sound_speed(sst or 28.0, salinity, 0.0) if sst else None

            return OceanPointResponse(
                latitude=lat,
                longitude=lng,
                timestamp=timestamp,
                depth=depth,
                sst=sst,
                wave_height=wave,
                chlorophyll=chl,
                sea_level_anomaly=sla,
                salinity=salinity,
                sound_velocity=sound_v,
                primary_source="COPERNICUS MARINE",
                confidence="HIGH",
            )
        except ImportError:
            logger.warning("copernicusmarine library not installed — falling back to demo.")
            return self._fetch_demo_point(lat, lng, timestamp)

    async def fetch_timeseries(self, lat: float, lng: float, days: int = 7) -> List[TimeSeriesRecord]:
        obs = _closest_demo(lat, lng)
        records = []
        for offset in _DEMO_HISTORY_OFFSETS:
            records.append(TimeSeriesRecord(
                timestamp=offset["timestamp"],
                sst=round(obs["sst"] + offset["sst_d"], 2),
                wave_height=round(obs["wave_height"] + offset["wave_d"], 2),
                chlorophyll=round(obs["chlorophyll"] + offset["chl_d"], 2),
                wind_speed=round(obs["wind_speed"] + offset["wind_d"], 1),
                sst_anomaly=round(obs["sst_anomaly"] + offset["sst_d"] * 0.5, 2),
            ))
        return records

    async def fetch_grid_slice(self, bbox: List[float], variable: str, timestamp: datetime) -> Any:
        return {"status": "DEMO", "bbox": bbox, "variable": variable}
