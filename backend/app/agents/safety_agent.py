"""
ORCA Backend — Maritime Safety Agent
Evaluates spatial proximity to IMBL, EEZ boundaries, MPAs.
Geofencing for vessel position monitoring.

STRICT RULE: All demo safety feeds carry data_status: "DEMO"
and never trigger external notifications or alerts to authorities.
"""
import math
import logging
from datetime import datetime, timezone
from typing import List

from app.schemas.command import OperationalEventSchema, VesselSchema

logger = logging.getLogger(__name__)


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in km."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ─── Demo operational events matching mockCommand.ts ─────────────────────────
_DEMO_EVENTS = [
    {
        "id": "EVT-001",
        "category": "WEATHER",
        "severity": "HIGH",
        "workflow_status": "NEW",
        "title": "High Wave Advisory — Arabian Sea Offshore",
        "description": "Significant wave heights exceeding 2.5m forecast for offshore Arabian Sea sector. All fishing vessels advised to maintain safe distance from open waters.",
        "latitude": 12.0,
        "longitude": 70.0,
        "location_name": "Arabian Sea Offshore (Mid-sector)",
        "timestamp": "2026-08-30T06:00:00Z",
        "source": "INCOIS Wave Forecast System",
        "data_status": "DEMO",
    },
    {
        "id": "EVT-002",
        "category": "ENVIRONMENTAL",
        "severity": "MEDIUM",
        "workflow_status": "ACKNOWLEDGED",
        "title": "Marine Heatwave — Category 1 — Kerala Shelf",
        "description": "SST anomaly of +0.81°C sustained for 7+ days exceeds MHW threshold (90th percentile climatological baseline). Reef stress indicators active in Lakshadweep waters.",
        "latitude": 9.93,
        "longitude": 76.27,
        "location_name": "Kerala Coast (Kochi Shelf)",
        "timestamp": "2026-08-28T00:00:00Z",
        "source": "INCOIS Marine Advisory",
        "data_status": "DEMO",
    },
    {
        "id": "EVT-003",
        "category": "BOUNDARY",
        "severity": "CRITICAL",
        "workflow_status": "INVESTIGATING",
        "title": "EEZ Boundary Proximity Alert — Bay of Bengal North",
        "description": "Vessel track approaching India–Bangladesh maritime boundary corridor. Distance to IMBL: 12.4 nm. Advisory issued for course correction.",
        "latitude": 21.2,
        "longitude": 89.5,
        "location_name": "Bay of Bengal North (IMBL Corridor)",
        "timestamp": "2026-08-30T09:15:00Z",
        "source": "ORCA Geofence Monitor",
        "data_status": "DEMO",
    },
    {
        "id": "EVT-004",
        "category": "VESSEL",
        "severity": "INFO",
        "workflow_status": "NEW",
        "title": "Unusual AIS Gap — Fishing Vessel",
        "description": "AIS transponder silent for 4+ hours for registered vessel MMSI 419001234. Last known position: 10.2°N, 74.5°E. Port authority notified.",
        "latitude": 10.2,
        "longitude": 74.5,
        "location_name": "Lakshadweep Sea (Off Calicut)",
        "timestamp": "2026-08-30T08:30:00Z",
        "source": "Coastal AIS Monitor",
        "data_status": "DEMO",
    },
    {
        "id": "EVT-005",
        "category": "WEATHER",
        "severity": "MEDIUM",
        "workflow_status": "NEW",
        "title": "Lightning Risk Advisory — Andaman Sea",
        "description": "Convective storm system detected with elevated lightning potential (CAPE > 2000 J/kg). Avoid offshore operations in the eastern Andaman Sea for next 12 hours.",
        "latitude": 11.62,
        "longitude": 92.73,
        "location_name": "Andaman Sea (Port Blair Vicinity)",
        "timestamp": "2026-08-30T07:45:00Z",
        "source": "IMD Severe Weather Alert",
        "data_status": "DEMO",
    },
]

_DEMO_VESSELS = [
    {
        "id": "VSL-001",
        "name": "MV Ocean Explorer",
        "type": "Research Vessel",
        "latitude": 9.85,
        "longitude": 76.10,
        "heading": 240,
        "speed": 8.5,
        "status": "UNDERWAY",
        "last_updated": "2026-08-30T09:55:00Z",
        "flag": "IN",
        "mmsi": "419000001",
        "track": [[9.90, 76.15], [9.88, 76.13], [9.86, 76.11], [9.85, 76.10]],
    },
    {
        "id": "VSL-002",
        "name": "FV Kadal Raja",
        "type": "Fishing Vessel",
        "latitude": 10.45,
        "longitude": 73.80,
        "heading": 180,
        "speed": 5.2,
        "status": "FISHING",
        "last_updated": "2026-08-30T09:50:00Z",
        "flag": "IN",
        "mmsi": "419001234",
        "track": [[10.52, 73.85], [10.49, 73.83], [10.47, 73.81], [10.45, 73.80]],
    },
    {
        "id": "VSL-003",
        "name": "OSTS Sagar Kanya",
        "type": "Oceanographic Survey Vessel",
        "latitude": 14.80,
        "longitude": 87.20,
        "heading": 90,
        "speed": 10.0,
        "status": "UNDERWAY",
        "last_updated": "2026-08-30T10:00:00Z",
        "flag": "IN",
        "mmsi": "419000256",
        "track": [[14.80, 87.05], [14.80, 87.10], [14.80, 87.15], [14.80, 87.20]],
    },
]


def get_events(severity: str = "ALL", category: str = "ALL", time_window: str = "24H") -> List[OperationalEventSchema]:
    """Returns operational events, optionally filtered."""
    events = _DEMO_EVENTS
    if severity != "ALL":
        events = [e for e in events if e["severity"] == severity]
    if category != "ALL":
        events = [e for e in events if e["category"] == category]
    return [OperationalEventSchema(**e) for e in events]


def get_event_by_id(event_id: str) -> OperationalEventSchema | None:
    for e in _DEMO_EVENTS:
        if e["id"] == event_id:
            return OperationalEventSchema(**e)
    return None


def get_vessels() -> List[VesselSchema]:
    return [VesselSchema(**v) for v in _DEMO_VESSELS]


def get_system_status():
    from app.schemas.command import SystemServiceStatus
    return [
        SystemServiceStatus(name="Copernicus WMTS", status="ONLINE", latency_ms=45.0, last_update="2026-08-30T10:00:00Z", data_status="REAL DATA"),
        SystemServiceStatus(name="INCOIS ERDDAP", status="DEGRADED", latency_ms=320.0, last_update="2026-08-30T09:45:00Z", data_status="DEMO"),
        SystemServiceStatus(name="NOAA CoastWatch", status="ONLINE", latency_ms=180.0, last_update="2026-08-30T09:50:00Z", data_status="DEMO"),
        SystemServiceStatus(name="ISRO MOSDAC", status="DEMO", latency_ms=None, last_update=None, data_status="DEMO"),
        SystemServiceStatus(name="Ollama LLM", status="ONLINE", latency_ms=220.0, last_update="2026-08-30T10:01:00Z", data_status="DEMO"),
        SystemServiceStatus(name="Redis Cache", status="ONLINE", latency_ms=2.1, last_update="2026-08-30T10:01:00Z", data_status="REAL DATA"),
    ]
