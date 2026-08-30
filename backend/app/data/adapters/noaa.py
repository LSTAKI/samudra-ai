"""
ORCA Backend — NOAA CoastWatch / OceanColor Adapter (public, no auth)
Used as a fallback for SST and Chlorophyll when Copernicus is unavailable.
Queries NOAA ERDDAP public endpoints.
"""
import logging
import time
from datetime import datetime
from typing import Any, List

import httpx

from app.data.adapters.base import BaseOceanDataAdapter
from app.schemas.ocean import OceanPointResponse, TimeSeriesRecord

logger = logging.getLogger(__name__)

NOAA_ERDDAP = "https://coastwatch.pfeg.noaa.gov/erddap/griddap"


class NOAAAdapter(BaseOceanDataAdapter):
    """NOAA public ERDDAP adapter — SST and Chlorophyll only."""

    async def health_check(self) -> dict:
        t0 = time.time()
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(f"{NOAA_ERDDAP}/index.html")
                return {"status": "ok" if r.status_code < 400 else "degraded", "latency_ms": round((time.time() - t0) * 1000)}
        except Exception:
            return {"status": "offline", "latency_ms": -1}

    async def fetch_point(self, lat: float, lng: float, timestamp: datetime, depth: float = 0.0) -> OceanPointResponse:
        """Queries NOAA ERDDAP AVHRR SST for a point."""
        try:
            date_str = timestamp.strftime("%Y-%m-%dT00:00:00Z")
            url = (
                f"{NOAA_ERDDAP}/nesdisGeoPolarSSTN5NRT.json"
                f"?analysed_sst[({date_str})][(0.0)][({lat:.4f}:{lat:.4f})]"
                f"[({lng:.4f}:{lng:.4f})]"
            )
            async with httpx.AsyncClient(timeout=15) as client:
                r = await client.get(url)
                r.raise_for_status()
                data = r.json()
                rows = data.get("table", {}).get("rows", [])
                if rows:
                    sst_k = float(rows[0][-1])
                    sst_c = round(sst_k - 273.15, 2) if sst_k > 200 else sst_k
                    return OceanPointResponse(
                        latitude=lat, longitude=lng, timestamp=timestamp,
                        sst=sst_c, primary_source="NOAA AVHRR", confidence="MEDIUM"
                    )
        except Exception as e:
            logger.warning(f"NOAA ERDDAP fetch failed: {e}")
        return OceanPointResponse(
            latitude=lat, longitude=lng, timestamp=timestamp,
            primary_source="NOAA (UNAVAILABLE)", confidence="LOW"
        )

    async def fetch_timeseries(self, lat: float, lng: float, days: int = 7) -> List[TimeSeriesRecord]:
        return []

    async def fetch_grid_slice(self, bbox: List[float], variable: str, timestamp: datetime) -> Any:
        return {"status": "UNAVAILABLE"}
