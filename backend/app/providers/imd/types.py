"""
ORCA Backend — IMD Data Types & Schemas
Official schemas representing Indian Meteorological Department datasets.
"""
from typing import Optional, List, Dict, Any

try:
    from pydantic import BaseModel, Field
except ImportError:
    class BaseModel:
        def __init__(self, **kwargs):
            for k, v in kwargs.items():
                setattr(self, k, v)
        def model_dump(self):
            return self.__dict__
    def Field(default=None, **kwargs):
        return default


class IMDCurrentWeather(BaseModel):
    station_id: str
    station_name: str
    latitude: float
    longitude: float
    observation_date: str
    observation_time_utc: str
    temperature_c: Optional[float] = None
    humidity_percent: Optional[float] = None
    pressure_hpa: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    wind_direction_deg: Optional[float] = None
    wind_direction_desc: Optional[str] = None
    weather_desc: Optional[str] = None
    rainfall_24h_mm: Optional[float] = None
    cloud_cover_okta: Optional[float] = None
    source: str = "IMD"
    retrieved_at: str


class IMDMarineBulletin(BaseModel):
    id: str
    bulletin_type: str  # 'port_warning' | 'sea_bulletin' | 'coastal_bulletin' | 'fishermen_warning'
    port_or_area: str
    issued_by: str
    date_of_issue: str
    valid_from: Optional[str] = None
    validity_hours: Optional[int] = None
    synoptic_situation: Optional[str] = None
    weather_forecast: Optional[str] = None
    visibility_desc: Optional[str] = None
    sea_condition: Optional[str] = None
    port_signal: Optional[str] = None
    warning_message: str
    original_text: str
    retrieved_at: str
    source: str = "IMD"


class IMDCycloneTrackPoint(BaseModel):
    timestamp: str
    latitude: float
    longitude: float
    intensity_knots: float
    central_pressure_hpa: Optional[float] = None
    category: str
    point_type: str  # 'OBSERVED' | 'FORECAST'


class IMDCyclone(BaseModel):
    id: str
    name: str
    basin: str  # 'Arabian Sea' | 'Bay of Bengal' | 'North Indian Ocean'
    intensity_category: str
    current_lat: float
    current_lon: float
    current_speed_knots: float
    central_pressure_hpa: Optional[float] = None
    observed_track: List[IMDCycloneTrackPoint] = []
    forecast_track: List[IMDCycloneTrackPoint] = []
    wind_radii_polygons: Dict[str, Any] = {}
    cone_of_uncertainty: Dict[str, Any] = {}
    issued_at: str
    source: str = "IMD Cyclone Warning Division"
    retrieved_at: str


class IMDSunMoon(BaseModel):
    latitude: float
    longitude: float
    date: str
    sunrise: Optional[str] = None
    sunset: Optional[str] = None
    moonrise: Optional[str] = None
    moonset: Optional[str] = None
    moon_phase: Optional[str] = None
    illumination_percent: Optional[float] = None
    source: str = "IMD"
    retrieved_at: str
