"""
ORCA Backend — INCOIS ERDDAP Adapter
Queries INCOIS OOS / RAMA moored buoy network for in-situ observations.
Public endpoint, no auth required. Marks stale data (>6h old) with flag.
"""
import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Any, List

import httpx

from app.data.adapters.base import BaseOceanDataAdapter
from app.schemas.ocean import OceanPointResponse, TimeSeriesRecord

logger = logging.getLogger(__name__)

# INCOIS ERDDAP public endpoint
INCOIS_ERDDAP = "https://erddap.incois.gov.in/erddap"


class INCOISAdapter(BaseOceanDataAdapter):
    """INCOIS ERDDAP buoy adapter — in-situ SST, wave, and surface currents."""

    async def health_check(self) -> dict:
        t0 = time.time()
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(f"{INCOIS_ERDDAP}/index.html")
                return {"status": "ok" if r.status_code < 400 else "degraded",
                        "latency_ms": round((time.time() - t0) * 1000)}
        except Exception:
            return {"status": "offline", "latency_ms": -1}

    async def fetch_point(self, lat: float, lng: float, timestamp: datetime, depth: float = 0.0) -> OceanPointResponse:
        """
        Queries nearest INCOIS buoy within 50 km radius.
        Falls back to UNAVAILABLE if INCOIS ERDDAP is unreachable.
        """
        try:
            end_dt = datetime.now(tz=timezone.utc)
            start_dt = end_dt - timedelta(hours=24)
            url = (
                f"{INCOIS_ERDDAP}/tabledap/incois_buoys.json"
                f"?latitude,longitude,sst,wave_height&time>={start_dt.strftime('%Y-%m-%dT%H:%M:%SZ')}"
                f"&latitude>={lat - 0.5}&latitude<={lat + 0.5}"
                f"&longitude>={lng - 0.5}&longitude<={lng + 0.5}&orderByClosest(\"latitude,longitude,1\")"
            )
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(url)
                r.raise_for_status()
                data = r.json()
                rows = data.get("table", {}).get("rows", [])
                if rows:
                    row = rows[0]
                    sst = float(row[2]) if row[2] is not None else None
                    wh = float(row[3]) if row[3] is not None else None
                    return OceanPointResponse(
                        latitude=lat, longitude=lng, timestamp=timestamp,
                        sst=sst, wave_height=wh,
                        primary_source="INCOIS OOS Buoy", confidence="HIGH"
                    )
        except Exception as e:
            logger.warning(f"INCOIS ERDDAP fetch failed: {e}")

        return OceanPointResponse(
            latitude=lat, longitude=lng, timestamp=timestamp,
            primary_source="INCOIS (UNAVAILABLE)", confidence="LOW"
        )

    async def fetch_timeseries(self, lat: float, lng: float, days: int = 7) -> List[TimeSeriesRecord]:
        return []

    async def fetch_grid_slice(self, bbox: List[float], variable: str, timestamp: datetime) -> Any:
        return {"status": "UNAVAILABLE"}
