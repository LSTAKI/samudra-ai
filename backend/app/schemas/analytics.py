"""
ORCA Backend — Analytics Schemas
Aligned with analytics.ts TypeScript interfaces and mockAnalytics.ts shapes.
"""
from typing import List, Optional

from pydantic import BaseModel


class TimeSeriesPointSchema(BaseModel):
    date: str  # ISO date string
    value: float
    climatological_mean: Optional[float] = None
    uncertainty: Optional[float] = None


class SummaryStatsSchema(BaseModel):
    min: float
    max: float
    mean: float
    median: float
    std_dev: float
    trend_delta: float  # change over the window period


class AnalyticsTimeSeriesResponse(BaseModel):
    parameter: str
    region: str
    window: str
    points: List[TimeSeriesPointSchema]
    stats: SummaryStatsSchema


class AnomalyResponse(BaseModel):
    parameter: str
    latitude: float
    longitude: float
    observed: float
    baseline: float  # 30-year climatological mean
    anomaly_delta: float
    pct_diff: float
    classification: str  # EXTREME_HIGH | HIGH | ABOVE_NORMAL | NORMAL | BELOW_NORMAL | LOW


class SourceComparisonCell(BaseModel):
    value: Optional[float]
    unit: str
    confidence: str
    data_status: str


class SourceComparisonRow(BaseModel):
    parameter: str
    copernicus: SourceComparisonCell
    isro: SourceComparisonCell
    incois: SourceComparisonCell
    noaa: SourceComparisonCell
    agreement_bias: float
    consensus_status: str  # HIGH | MODERATE | INSUFFICIENT_SOURCES
