"""
ORCA Backend — Base Ocean Data Adapter
All provider adapters implement this interface.
"""
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, List

from app.schemas.ocean import OceanPointResponse, TimeSeriesRecord


class BaseOceanDataAdapter(ABC):
    """Abstract interface for all ocean data providers."""

    @abstractmethod
    async def health_check(self) -> dict:
        """Returns {'status': 'ok'|'degraded'|'offline', 'latency_ms': float}."""
        pass

    @abstractmethod
    async def fetch_point(
        self,
        lat: float,
        lng: float,
        timestamp: datetime,
        depth: float = 0.0,
    ) -> OceanPointResponse:
        """Fetch multi-variable observation at a single point."""
        pass

    @abstractmethod
    async def fetch_timeseries(
        self,
        lat: float,
        lng: float,
        days: int = 7,
    ) -> List[TimeSeriesRecord]:
        """Fetch recent time series for a point."""
        pass

    @abstractmethod
    async def fetch_grid_slice(
        self,
        bbox: List[float],
        variable: str,
        timestamp: datetime,
    ) -> Any:
        """Fetch a 2D grid slice over a bounding box."""
        pass
