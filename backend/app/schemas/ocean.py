"""
ORCA Backend — Ocean Schemas
Aligned with OceanObservation TypeScript interface (types/index.ts) and mockOcean.ts shapes.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class OceanPointResponse(BaseModel):
    """Returned by GET /api/v1/ocean/point — matches OceanObservation TS type."""
    latitude: float
    longitude: float
    timestamp: datetime
    depth: float = 0.0

    # Core ocean variables
    sst: Optional[float] = Field(None, description="Sea Surface Temp in °C")
    sst_anomaly: Optional[float] = Field(None, description="Departure from 30Y mean in °C")
    wave_height: Optional[float] = Field(None, description="Significant wave height Hm0 in m")
    chlorophyll: Optional[float] = Field(None, description="Chlorophyll-a in mg/m³")
    wind_speed: Optional[float] = Field(None, description="Wind speed in m/s")
    wind_direction: Optional[float] = Field(None, description="Wind direction in degrees")
    current_speed: Optional[float] = Field(None, description="Surface current speed in m/s")
    current_direction: Optional[float] = Field(None, description="Surface current direction in degrees")
    salinity: Optional[float] = Field(None, description="Practical Salinity Units (PSU)")
    sound_velocity: Optional[float] = Field(None, description="Acoustic sound speed in m/s")
    sea_level_anomaly: Optional[float] = Field(None, description="SLA in m")

    # Metadata
    primary_source: str = "COPERNICUS"
    confidence: str = "HIGH"  # HIGH | MEDIUM | LOW


class TimeSeriesRecord(BaseModel):
    """One record in a time series response — matches mockOcean.ts TimeSeriesRecord."""
    timestamp: str  # ISO string or relative label like '-72h'
    sst: float
    wave_height: float
    chlorophyll: float
    wind_speed: float
    sst_anomaly: Optional[float] = None


class OceanTimeSeriesResponse(BaseModel):
    latitude: float
    longitude: float
    records: List[TimeSeriesRecord]
    parameter_units: dict = Field(
        default={
            "sst": "°C",
            "wave_height": "m",
            "chlorophyll": "mg/m³",
            "wind_speed": "m/s",
        }
    )


class DepthProfilePoint(BaseModel):
    """One depth-binned CTD record. Returned by GET /api/v1/ocean/profile."""
    depth: float  # metres below surface
    temperature: float  # °C
    salinity: float  # PSU
    sound_velocity: float  # m/s (Mackenzie formula)
    density: Optional[float] = None  # kg/m³


class AcousticsResponse(BaseModel):
    """Returned by GET /api/v1/ocean/acoustics."""
    sonic_layer_depth: float  # m
    sofar_axis_depth: float  # m
    surface_duct_strength: float  # dB re 1 µPa
    shadow_zone_pz: Optional[str] = None  # descriptive label
