"""
ORCA Backend — PFZ Schemas
Aligned with PFZZone TypeScript type (types/pfz.ts) and mockPFZ.ts shape.
"""
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PFZFactorSchema(BaseModel):
    name: str
    weight: float = Field(..., ge=0.0, le=1.0)
    status: str  # POSITIVE | NEUTRAL | NEGATIVE
    evidence: str


class PFZZoneSchema(BaseModel):
    id: str
    name: str
    sector: str
    score: int = Field(..., ge=0, le=100)
    confidence: str  # HIGH | MEDIUM | LOW
    center_nadir: List[float] = Field(..., description="[lat, lng]")
    geometry: Dict[str, Any] = Field(..., description="GeoJSON Polygon")
    primary_factor: str
    sst_reading: float
    sst_gradient: str
    chl_reading: float
    chl_gradient: str
    depth_m: int
    status: str = "DEMO"
    factors: List[PFZFactorSchema]


class PFZRegionPreset(BaseModel):
    id: str
    name: str
    center: List[float]  # [lat, lng]
    radius_km: float
    description: str


class PFZEvaluateRequest(BaseModel):
    region_id: str
    weights: Dict[str, float] = Field(
        default={"sst": 0.4, "chl": 0.4, "current": 0.2},
        description="Factor weights summing to 1.0",
    )
    thresholds: Dict[str, float] = Field(
        default={"wave_max": 2.5, "depth_min": 20.0, "chl_min": 0.25},
    )
