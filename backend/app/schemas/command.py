"""
ORCA Backend — Command Center Schemas
Aligned with command.ts TypeScript interfaces and mockCommand.ts shapes.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class OperationalEventSchema(BaseModel):
    id: str
    category: str  # WEATHER | VESSEL | BOUNDARY | ENVIRONMENTAL | SYSTEM
    severity: str  # CRITICAL | HIGH | MEDIUM | LOW | INFO
    status: str = "DEMO"
    workflow_status: str  # NEW | ACKNOWLEDGED | INVESTIGATING | RESOLVED
    title: str
    description: str
    latitude: float
    longitude: float
    location_name: str
    timestamp: str
    source: str
    data_status: str
    metadata: Optional[Dict[str, Any]] = None


class VesselSchema(BaseModel):
    id: str
    name: str
    type: str
    latitude: float
    longitude: float
    heading: float  # degrees
    speed: float  # knots
    status: str
    last_updated: str
    flag: Optional[str] = None
    mmsi: Optional[str] = None
    track: Optional[List[List[float]]] = None  # [[lat, lng], ...]


class SystemServiceStatus(BaseModel):
    name: str
    status: str  # ONLINE | DEGRADED | OFFLINE
    latency_ms: Optional[float] = None
    last_update: Optional[str] = None
    data_status: str = "DEMO"


class EventStatusUpdateRequest(BaseModel):
    status: str  # ACKNOWLEDGED | INVESTIGATING | RESOLVED
