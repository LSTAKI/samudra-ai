"""
ORCA Backend — Standard Scientific Response Envelope
Matches the JSON contract defined in ORCA_BACKEND_INTEGRATION_AND_MULTI_AGENT_SPEC.md Part 4.
All API endpoints return ScientificResponseEnvelope[T].
"""
import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field


class ResponseStatus(str, Enum):
    SUCCESS = "SUCCESS"
    PARTIAL = "PARTIAL"
    ERROR = "ERROR"


class DataStatus(str, Enum):
    REAL_DATA = "REAL DATA"
    DEMO = "DEMO"
    UNAVAILABLE = "UNAVAILABLE"


class ProvenanceRecord(BaseModel):
    source: str
    product_id: Optional[str] = None
    dataset_id: Optional[str] = None
    variable: Optional[str] = None
    timestamp: datetime
    processing_level: str = Field(..., description="L1, L2, L3, or L4")
    status: str = Field(..., description="VALIDATED, DEMO, or ESTIMATED")


class QualityMetadata(BaseModel):
    spatial_coverage_pct: float = Field(..., ge=0.0, le=100.0)
    cloud_masking_applied: bool = False
    flags: List[str] = []
    latency_seconds: float


T = TypeVar("T")


class ScientificResponseEnvelope(BaseModel, Generic[T]):
    request_id: str = Field(default_factory=lambda: f"req-{uuid.uuid4().hex[:12]}")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: ResponseStatus = ResponseStatus.SUCCESS
    data_status: DataStatus = DataStatus.REAL_DATA
    data: T
    provenance: List[ProvenanceRecord] = []
    quality: Optional[QualityMetadata] = None
    warnings: List[str] = []


def make_envelope(
    data: Any,
    data_status: DataStatus = DataStatus.REAL_DATA,
    provenance: Optional[List[ProvenanceRecord]] = None,
    quality: Optional[QualityMetadata] = None,
    warnings: Optional[List[str]] = None,
    status: ResponseStatus = ResponseStatus.SUCCESS,
) -> dict:
    """Helper to build a serialised response envelope dict."""
    env = ScientificResponseEnvelope(
        data=data,
        data_status=data_status,
        provenance=provenance or [],
        quality=quality,
        warnings=warnings or [],
        status=status,
    )
    return env.model_dump(mode="json")
