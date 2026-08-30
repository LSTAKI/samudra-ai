"""
ORCA Backend — ISRO MOSDAC Adapter (Placeholder)
Always returns data_status: "DEMO" — awaiting formal API key registration.
Per spec: never synthesize satellite telemetry without authorization.
"""
import logging
from datetime import datetime
from typing import Any, List

from app.data.adapters.base import BaseOceanDataAdapter
from app.schemas.ocean import OceanPointResponse, TimeSeriesRecord

logger = logging.getLogger(__name__)


class ISROAdapter(BaseOceanDataAdapter):
    """
    ISRO MOSDAC adapter — DEMO placeholder.
    Requires production API registration with ISRO for activation.
    Never generates synthetic satellite measurements without tagging DEMO.
    """

    async def health_check(self) -> dict:
        return {"status": "demo", "message": "ISRO MOSDAC integration requires agency API registration.", "latency_ms": 0}

    async def fetch_point(self, lat: float, lng: float, timestamp: datetime, depth: float = 0.0) -> OceanPointResponse:
        # Intentionally returns minimal demo value — never fabricates sensor data
        return OceanPointResponse(
            latitude=lat,
            longitude=lng,
            timestamp=timestamp,
            primary_source="ISRO MOSDAC (DEMO — API Registration Required)",
            confidence="LOW",
        )

    async def fetch_timeseries(self, lat: float, lng: float, days: int = 7) -> List[TimeSeriesRecord]:
        return []

    async def fetch_grid_slice(self, bbox: List[float], variable: str, timestamp: datetime) -> Any:
        return {"status": "DEMO"}
