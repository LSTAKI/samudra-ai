"""
ORCA Backend — Satellite Schemas
Aligned with satellite.ts TypeScript interfaces and mockSatellites.ts shapes.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class SensorPayloadSchema(BaseModel):
    id: str
    name: str
    type: str
    resolution_m: float
    swath_km: float
    bands: List[str]
    status: str  # OPERATIONAL | DEGRADED | OFFLINE


class SatellitePlatformSchema(BaseModel):
    id: str
    name: str
    agency: str  # ISRO | ESA | NOAA | NASA | CNES
    type: str  # POLAR | GEO
    altitude_km: float
    inclination_deg: float
    period_minutes: float
    status: str  # OPERATIONAL | STANDBY | DEGRADED
    sensors: List[SensorPayloadSchema]
    tle_epoch: Optional[str] = None
    data_status: str = "DEMO"


class SwathSchema(BaseModel):
    platform_id: str
    time_window: str
    tracks: Dict[str, Any]  # GeoJSON LineString or MultiLineString
    footprints: Dict[str, Any]  # GeoJSON MultiPolygon


class TelemetrySchema(BaseModel):
    platform_id: str
    timestamp: str
    battery_pct: float
    solar_power_w: float
    downlink_rate_mbps: float
    attitude_mode: str
    calibration_status: str
    data_status: str = "DEMO"
