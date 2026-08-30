# Project ORCA: Backend Integration & Multi-Agent Technical Specification

> **Document Classification:** Engineering Design Document & Technical Specification  
> **Target Version:** Backend v1.0 / Multi-Agent Core v1.0  
> **Repository Context:** Derived strictly from the verified Next.js 16 / TypeScript / Zustand / MapLibre frontend codebase (`SIH26-fr`).  
> **Target Runtime:** Python 3.11+ / FastAPI / Pydantic v2 / AsyncPG / Redis / Celery / LangGraph / PostGIS + TimescaleDB  

---

## PART 1 — Complete Frontend Inventory & Reality Check

An inspection of the active codebase confirms that Project ORCA contains **6 operational frontend modules**, a canonical global Zustand state store, an active Copernicus Marine WMTS raster pipeline, and specialized visualization components (MapLibre WebGL, Plotly charts).

### 1.1 Route Inventory

| Route | Module Name | Major Functional Components | Current Operational Status |
|---|---|---|---|
| `/` | Landing / Shell Portal | Service launcher, high-level summary | FRONTEND ONLY |
| `/research` | Research Console | `MapComponent`, `LayerControl`, `TimeSlider`, `CoordinateInspector`, `AIReasoningConsole`, `CopernicusLegend` | **HYBRID**: Real Copernicus OSTIA WMTS tiles + Demo Point Inspection / AI |
| `/research/ocean` | Ocean Explorer | `OceanWorkspace`, `OceanMap`, `DepthSlicer`, `DepthProfileChart`, `AcousticDuctPanel`, `SubsurfaceParameters` | **DEMO / MOCK**: 2D/3D depth slicing & CTD acoustic modeling |
| `/research/satellites` | Satellite Observatory | `SatelliteWorkspace`, `SatelliteSidebar`, `SatelliteMap`, `PlatformInspector`, `SatelliteTimeline`, `SatelliteTelemetry` | **DEMO / MOCK**: Orbital ground tracks, sensor footprints & overpass scheduler |
| `/research/pfz` | PFZ Analyzer | `PFZAnalyzer`, `PFZSidebar`, `PFZMap`, `PFZInspector`, `PFZCandidateAnalysisDrawer`, `PFZCandidateTable` | **HYBRID**: Real Copernicus Chlorophyll/SST WMTS rasters + Demo Heuristic Zones |
| `/research/analytics` | ORCA Analytics | `AnalyticsWorkspace`, `AnalyticsControlBar`, `AnalyticsTimeSeries`, `AnalyticsParameterComparison`, `AnalyticsAnomalyPanel`, `AnalyticsRegionalComparison`, `AnalyticsSourceComparison` | **HYBRID**: Real Copernicus background rasters + Demo 30D Time Series & Sensor Matrix |
| `/research/command` (and `/command`) | Command Center | `CommandCenter`, `CommandSidebar`, `CommandAlertSummary`, `CommandFilters`, `CommandEventList`, `CommandMap`, `CommandEventInspector`, `CommandTimeline`, `CommandSystemStatus` | **HYBRID**: Real Copernicus wave/SST rasters + Demo Incident Queue, Vessels, & Boundaries |
| `/command/vessels`, `/incidents`, `/sar` | Legacy Shells | Navigation cards / sub-views | FRONTEND ONLY |
| `/settings` | System Settings | Configuration options | FRONTEND ONLY |

---

### 1.2 TypeScript Types Inventory (`types/`)

1. **Core Domain (`types/index.ts`)**:
   - `OceanMapLayer`: Typed layer with `id`, `productId`, `datasetId`, `variable`, `unit`, `temporalResolution`, `spatialResolution`, `style`, `time`, `status: LayerStatus`.
   - `LayerStatus`: `'CONNECTED' | 'LOADING' | 'ERROR' | 'UNAVAILABLE' | 'DEMO'`.
   - `LayerSource`: `'COPERNICUS' | 'ISRO' | 'INCOIS' | 'NOAA' | 'ORCA'`.
   - `OceanObservation`: Canonical point observation (`lat`, `lng`, `sst`, `sstAnomaly`, `waveHeight`, `chlorophyll`, `windSpeed`, `windDirection`, `currentSpeed`, `currentDirection`, `confidence`, `source`, `timestamp`).
   - `PFZData`, `SafetyAlert`, `AIMessage`.
2. **Satellite Observatory (`types/satellite.ts`)**:
   - `SatellitePlatform`, `SensorPayload`, `SatelliteObservation`, `SatelliteTrackPoint`, `SwathFootprint`, `PlatformStatus`.
3. **PFZ Analyzer (`types/pfz.ts`)**:
   - `PFZZone`, `PFZFactor`, `PFZModelConfiguration`, `PFZThresholds`, `PFZClassification`, `PFZRegionPreset`.
4. **Analytics (`types/analytics.ts`)**:
   - `TimeSeriesPoint`, `ParameterSeries`, `AnomalyResult`, `RegionalComparisonItem`, `SourceComparisonCell`, `SourceComparisonRow`, `DataQualityMetrics`.
5. **Command Center (`types/command.ts`)**:
   - `OperationalEvent`, `OperationalEventCategory`, `OperationalSeverity`, `OperationalStatus`, `DemoVessel`, `SystemServiceStatus`.

---

### 1.3 Canonical Zustand State Inventory (`stores/useOrcaStore.ts`)

The frontend relies on single-source-of-truth state persistence:
- **Spatial Anchors**: `selectedLatitude` (9.9312), `selectedLongitude` (76.2673), `selectedCoordinates: { lat, lng }`, `selectedDepth` (0m to -2000m), `viewMode` ('2d' | '3d').
- **Temporal Anchors**: `selectedTimestamp` ('2026-08-28T00:00:00Z'), `timelineMode` ('daily' | 'monthly' | 'annual'), `timelineIndex`, `isPlaying`.
- **Parameter & Layer Selection**: `selectedParameter` ('sst' | 'chlorophyll' | 'salinity' | 'temperature' | 'depth' | 'currents'), `activeMapLayers` (Record<string, OceanMapLayer>).
- **Module Specific Selectors**:
  - Satellites: `selectedPlatformId`, `selectedSensorCategory`, `selectedProductFilter`, `satelliteLayerVisibility`.
  - PFZ: `selectedPFZZoneId`, `selectedPFZRegion`, `pfzActiveRaster`, `pfzModelWeights`, `pfzThresholds`.
  - Analytics: `analyticsRegion`, `analyticsPeriod`, `analyticsPrimaryParam`, `analyticsActiveSources`.
  - Command Center: `selectedOperationalEventId`, `commandSeverityFilter`, `commandCategoryFilter`, `commandTimeWindow`, `commandLayerVisibility`, `eventWorkflowStatuses`.

---

### 1.4 Copernicus Marine Production Configurations (`lib/map/copernicusWmts.ts`)

The frontend actively connects to real OGC WMTS endpoints (`https://wmts.marine.copernicus.eu/teroWmts`):
1. **Sea Surface Temperature (SST)**:
   - Product ID: `SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001`
   - Dataset ID: `METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2`
   - Variable: `analysed_sst` | Unit: `°C` (Kelvin in raw NetCDF, Celsius in WMTS)
   - Style: `cmap:thermal` | Resolution: `0.05° (~5 km)` | Daily Gap-Free L4.
2. **Significant Wave Height**:
   - Product ID: `GLOBAL_ANALYSISFORECAST_WAV_001_027`
   - Dataset ID: `cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411`
   - Variable: `VHM0` | Unit: `m`
   - Style: `cmap:amp` | Resolution: `0.083° (~9 km)` | 3-Hourly L4.
3. **Sea Level Anomaly (SLA)**:
   - Product ID: `SEALEVEL_GLO_PHY_L4_NRT_008_046`
   - Dataset ID: `cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.125deg_P1D_202506`
   - Variable: `sla` | Unit: `m`
   - Style: `cmap:plasma` | Resolution: `0.125° (~14 km)` | Daily L4.
4. **Chlorophyll-a Concentration**:
   - Product ID: `OCEANCOLOUR_GLO_BGC_L4_NRT_009_102`
   - Dataset ID: `cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D_202311`
   - Variable: `CHL` | Unit: `mg/m³`
   - Style: `cmap:algae` | Resolution: `4 km (~0.04°)` | Daily Gap-Free L4.
5. **Ocean Surface Currents** *(Architecture Level)*:
   - Product ID: `GLOBAL_ANALYSISFORECAST_PHY_001_024`
   - Dataset ID: `cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406`
   - Variable: `uo` (eastward), `vo` (northward) | Unit: `m/s` | Style: `cmap:balance`.

---

## PART 2 — Frontend/Backend Contract Matrix

| Frontend Component | Required Backend Data | API Endpoint | HTTP Method | Request Payload / Query Params | Expected Response Summary | Current Frontend State | Future Target Source |
|---|---|---|---|---|---|---|---|
| **Coordinate Inspector** (`/research`) | Point ocean observation with depth profile | `/api/ocean/point` | `GET` | `lat: float`, `lng: float`, `time: ISO8601`, `depth: float = 0` | `PointObservationResponse` (SST, Chl-a, Wave, SLA, Current, Wind, Quality) | MOCK fallback in `lib/api/ocean.ts` | Copernicus NetCDF Slicer + INCOIS Buoy |
| **Ocean TimeSlider History** (`/research`) | Multi-day history at point | `/api/ocean/timeseries` | `GET` | `lat: float`, `lng: float`, `days: int = 7` | Array of `TimeSeriesRecord` | MOCK in `mock/mockOcean.ts` | Copernicus OPeNDAP / Local Zarr store |
| **Water Column Slicer** (`/research/ocean`) | Vertical CTD temperature, salinity & sound velocity | `/api/ocean/profile` | `GET` | `lat: float`, `lng: float`, `max_depth: float = 2000` | Array of depth-binned `{ depth, temp, salinity, soundVelocity, density }` | MOCK in `mock/mockOcean.ts` | Copernicus Global Physics L4 (`PHY_001_024`) |
| **Acoustic Duct Panel** (`/research/ocean`) | Sonic layer depth (SLD), deep sound channel (SOFAR) axis | `/api/ocean/acoustics` | `GET` | `lat: float`, `lng: float` | `{ sldDepth, sofarAxisDepth, surfaceDuctStrength, shadowZonePz }` | MOCK in `components/ocean/AcousticDuctPanel.tsx` | Mackenzie/Del Grosso acoustic engine on CTD |
| **Satellite List & Status** (`/research/satellites`) | Platform health, orbit status & agency | `/api/satellites/platforms` | `GET` | None | Array of `SatellitePlatform` | MOCK in `mock/mockSatellites.ts` | Space-Track TLE + CEOS Agency Feeds |
| **Orbital Ground Tracks & Footprints** (`/research/satellites`) | GeoJSON 24H future/past tracks & sensor swaths | `/api/satellites/swaths` | `GET` | `platform_id: str`, `time_window: str` | `{ tracks: GeoJSON LineString, footprints: GeoJSON MultiPolygon }` | MOCK in `mock/mockSatellites.ts` | SGP4 Orbital Propagator Worker |
| **PFZ Zone Generator** (`/research/pfz`) | Candidate fishing zones with explainability factors | `/api/pfz/zones` | `GET` | `region_id: str`, `lat: float`, `lng: float`, `radius_km: float` | Array of `PFZZone` with GeoJSON polygons, scores, and factors | MOCK in `mock/mockPFZ.ts` | Numerical PFZ Engine (Front detection) |
| **PFZ Model Evaluator** (`/research/pfz`) | Dynamic score recalculation with custom weights | `/api/pfz/evaluate` | `POST` | `PFZModelConfiguration` + `PFZThresholds` | Re-weighted candidate scores & exclusion flags | FRONTEND MOCK in `PFZSidebar.tsx` | Scientific PFZ Scorer Worker |
| **Analytics Hero Time Series** (`/research/analytics`) | 30-day/90-day time series with trend statistics | `/api/analytics/timeseries` | `GET` | `param: str`, `region: str`, `window: str` | `{ points: TimeSeriesPoint[], stats: SummaryStats }` | MOCK in `mock/mockAnalytics.ts` | PostGIS / TimescaleDB continuous aggregate |
| **Anomaly Baseline Engine** (`/research/analytics`) | Climatological delta against 30-year mean | `/api/analytics/anomaly` | `GET` | `param: str`, `lat: float`, `lng: float` | `{ observed, baseline, anomalyDelta, pctDiff, classification }` | MOCK in `mock/mockAnalytics.ts` | ERA5 / Copernicus Marine Climatology |
| **Cross-Source Matrix** (`/research/analytics`) | Provider comparison grid (Copernicus, ISRO, INCOIS, NOAA) | `/api/analytics/sources` | `GET` | `lat: float`, `lng: float` | 4x4 matrix with agreement bias & confidence | MOCK in `mock/mockAnalytics.ts` | Multi-Source Normalization Engine |
| **Command Incident Feed** (`/research/command`) | Active maritime/environmental alerts | `/api/command/events` | `GET` | `severity: str`, `category: str`, `time_window: str` | Array of `OperationalEvent` | MOCK in `mock/mockCommand.ts` | Event Bus + Geofence Evaluator |
| **Command Action Dispatch** (`/research/command`) | Update operator review workflow state | `/api/command/events/{id}/status` | `PATCH` | `status: 'ACKNOWLEDGED' \| 'INVESTIGATING' \| 'RESOLVED'` | `{ success: bool, event_id: str, new_status: str, audit_id: str }` | FRONTEND ONLY in Zustand store | PostgreSQL operational events table |
| **Vessel AIS Tracks** (`/research/command`) | Demo / verified vessel tracks & heading | `/api/command/vessels` | `GET` | `bbox: [minX, minY, maxX, maxY]` | Array of `DemoVessel` with GeoJSON tracks | MOCK in `mock/mockCommand.ts` | Coastal AIS receiver / MarineTraffic feed |
| **AI Reasoning Assistant** (`/research`) | Multi-agent reasoning explanation | `/api/agents/reasoning` | `POST` | `{ query: str, coordinates?: { lat, lng }, context?: str }` | `AIMessage` with synthesized answer, sources, and agent steps | MOCK in `mock/mockAI.ts` | LangGraph Multi-Agent Orchestrator |

---

## PART 3 — FastAPI Backend Architecture

The backend will be implemented in Python 3.11+ using **FastAPI**, structured modularly to align with the frontend contracts.

```
/api/v1
  ├── /ocean
  │     ├── GET  /point                     # Query point observation across all active variables
  │     ├── GET  /timeseries                # Retrieve retrospective time series for coordinates
  │     ├── GET  /profile                   # CTD vertical profile (temperature, salinity, sound speed)
  │     ├── GET  /acoustics                 # Sonic layer depth, SOFAR channel analysis
  │     └── GET  /layers                    # List metadata and WMTS capabilities for active layers
  ├── /satellites
  │     ├── GET  /platforms                 # List satellite platforms and sensor statuses
  │     ├── GET  /observations              # Query latest satellite overpass observations
  │     ├── GET  /swaths                    # GeoJSON orbital ground tracks and footprint geometry
  │     └── GET  /telemetry/{id}            # Sensor health, calibration mode, and spectral bands
  ├── /pfz
  │     ├── GET  /zones                     # Candidate PFZ polygons and suitability rankings
  │     ├── POST /evaluate                  # Re-score zones using operator-defined weights & thresholds
  │     ├── GET  /zones/{id}/explain        # Explainability heuristics, gradient maps & factors
  │     └── GET  /regions                   # Presets for Indian Ocean economic zones
  ├── /analytics
  │     ├── GET  /timeseries                # Historical series with min/max/mean/median/std dev
  │     ├── GET  /anomaly                   # Climatological baseline anomaly calculation
  │     ├── GET  /regional                  # Basin-by-basin comparison for parameter
  │     ├── GET  /sources                   # Multi-sensor comparison grid (Copernicus vs ISRO vs INCOIS vs NOAA)
  │     └── GET  /quality                   # QA/QC spatial completeness & cloud mask metrics
  ├── /command
  │     ├── GET  /events                    # List active operational alerts (filtered by severity/category)
  │     ├── GET  /events/{id}               # Full event briefing and metadata
  │     ├── PATCH /events/{id}/status       # Acknowledge, investigate, or resolve event
  │     ├── GET  /vessels                   # Real/demo vessel positions and history tracks
  │     └── GET  /system-status             # Ingestion gateway health & latencies
  └── /agents
        ├── POST /query                     # User natural-language scientific query to multi-agent orchestrator
        ├── GET  /tasks/{task_id}           # Poll status of asynchronous agent analysis
        └── WS   /ws/live-feed              # WebSocket for live command alerts & agent streaming steps
```

### Detailed Endpoint Specifications

#### 1. `GET /api/v1/ocean/point`
- **Auth**: Bearer API Key (Optional for read-only public parameters, required for rate-limit tiers).
- **Query Params**: `lat: float` ([-90, 90]), `lng: float` ([-180, 180]), `time: Optional[datetime]`, `depth: float = 0.0`.
- **Cache Policy**: Redis Cache with 1-hour TTL for historical/daily dates, 15-minute TTL for NRT (Near Real Time).
- **Latency Class**: Sub-100ms (cached) / ~350ms (direct slice from local Zarr/NetCDF cache).
- **WebSocket**: Not required.

#### 2. `GET /api/v1/pfz/zones`
- **Auth**: Bearer API Key.
- **Query Params**: `region_id: str`, `target_date: Optional[date]`.
- **Cache Policy**: Redis Cache with 6-hour TTL (PFZ models update once daily on new L4 satellite ingestion).
- **Latency Class**: Sub-150ms.
- **WebSocket**: Not required.

#### 3. `POST /api/v1/agents/query`
- **Auth**: Bearer API Key required.
- **Request Body**: `{ "query": str, "coordinates": Optional[Coords], "region": Optional[str] }`
- **Cache Policy**: No cache (idempotency key based on prompt hash for 10-minute duplicate prevention).
- **Latency Class**: Asynchronous streaming or 2-4 seconds completion.
- **WebSocket / SSE**: Server-Sent Events (SSE) or WebSocket streaming for multi-agent reasoning steps.

---

## PART 4 — Standard Scientific Response Envelope

All API endpoints must return a standardized response envelope to guarantee uniform frontend parsing, full scientific auditability, and data honesty.

```json
{
  "request_id": "req-89f41b2e-7c3a-4a69",
  "timestamp": "2026-08-30T09:20:00Z",
  "status": "SUCCESS",
  "data_status": "REAL DATA",
  "data": {},
  "provenance": [
    {
      "source": "COPERNICUS MARINE",
      "product_id": "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001",
      "dataset_id": "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2",
      "variable": "analysed_sst",
      "timestamp": "2026-08-28T00:00:00Z",
      "processing_level": "L4",
      "status": "VALIDATED"
    }
  ],
  "quality": {
    "spatial_coverage_pct": 98.4,
    "cloud_masking_applied": false,
    "flags": ["GAP_FREE_INTERPOLATED"],
    "latency_seconds": 0.082
  },
  "warnings": []
}
```

### Exact Pydantic Response Envelope

```python
from pydantic import BaseModel, Field
from typing import Generic, TypeVar, Optional, List, Any
from datetime import datetime
from enum import Enum

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
    request_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: ResponseStatus
    data_status: DataStatus
    data: T
    provenance: List[ProvenanceRecord] = []
    quality: Optional[QualityMetadata] = None
    warnings: List[str] = []
```

---

## PART 5 — Scientific Data Normalization Model

To prevent heterogeneous JSON schemas from leaking into analytics and multi-agent systems, the backend enforces a canonical internal oceanographic schema:

```
Provider Raw Payload (Copernicus NetCDF, ISRO HDF5, INCOIS JSON, NOAA OPeNDAP)
                                    ↓
                         [Provider Adapter Layer]
                                    ↓
                 Canonical Observation Representation
```

### Canonical Data Models

```python
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class ScientificUnit(str, Enum):
    CELSIUS = "°C"
    KELVIN = "K"
    METERS = "m"
    METERS_PER_SEC = "m/s"
    MILLIGRAM_PER_M3 = "mg/m³"
    PRACTICAL_SALINITY = "PSU"
    PASCALS = "Pa"
    DEGREES = "degrees"

class NormalizedPointObservation(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=90.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    depth: float = Field(default=0.0, description="Depth below surface in meters")
    timestamp: datetime
    variable: str = Field(..., description="Canonical name: sst, chlorophyll, wave_height, sla, uo, vo")
    value: float
    unit: ScientificUnit
    uncertainty: Optional[float] = None
    source_agency: str = Field(..., description="COPERNICUS, ISRO, INCOIS, NOAA")
    dataset_identifier: str
    data_status: str = Field(default="REAL DATA")

class OceanObservationBundle(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime
    sst: Optional[float] = None              # °C
    sst_anomaly: Optional[float] = None      # °C
    wave_height: Optional[float] = None      # m
    chlorophyll: Optional[float] = None      # mg/m³
    wind_speed: Optional[float] = None       # m/s
    wind_direction: Optional[float] = None   # deg
    current_speed: Optional[float] = None    # m/s
    current_direction: Optional[float] = None# deg
    salinity: Optional[float] = None         # PSU
    sound_velocity: Optional[float] = None   # m/s
    primary_source: str
    confidence: str                          # HIGH, MEDIUM, LOW
```

---

## PART 6 — Data Connectors & Provider Adapters

Each external provider implements a uniform abstract interface:

```python
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime

class BaseOceanDataAdapter(ABC):
    @abstractmethod
    async def health_check(self) -> dict:
        pass

    @abstractmethod
    async def fetch_point(
        self, lat: float, lng: float, variable: str, timestamp: datetime
    ) -> NormalizedPointObservation:
        pass

    @abstractmethod
    async def fetch_timeseries(
        self, lat: float, lng: float, variable: str, start: datetime, end: datetime
    ) -> List[NormalizedPointObservation]:
        pass

    @abstractmethod
    async def fetch_grid_slice(
        self, bbox: List[float], variable: str, timestamp: datetime
    ) -> Any:
        pass
```

### Connector Specifications

| Provider | Protocol / Ingestion Mechanism | Authentication | Failure / Fallback Strategy | Verified in Frontend? |
|---|---|---|---|---|
| **Copernicus Marine** | OGC WMTS (Tiles) + CopMarine Python API / OPeNDAP (NetCDF point slice) | Service Account Token (`COPERNICUS_MARINE_USERNAME` / `PASSWORD`) | 3x Exponential backoff (1s, 2s, 4s). If unavailable, return cached Zarr grid or fallback to climatological baseline with `flags: ["OFFLINE_CACHE"]`. | **VERIFIED**: WMTS tiles actively render in browser. NetCDF point extraction requires backend implementation. |
| **ISRO MOSDAC** | HTTPS REST / GeoServer WMS + OpenDAP TDS | MOSDAC Access Token (HMAC SHA-256 API Key) | Circuit breaker: trip after 5 failures in 30s. Fallback to `LayerStatus.DEMO` or `UNAVAILABLE`. Never fake satellite telemetry. | **ARCHITECTURE ONLY**: Displayed as DEMO feed in frontend tables. Backend team must obtain production API keys. |
| **INCOIS OOS** | Erddap REST API / Sensor Observation Service (SOS) | Public / IP whitelisting | Cache last known buoy telemetry (up to 24h). Mark values older than 6h with `STALE_OBSERVATION` flag. | **ARCHITECTURE ONLY**: Displayed as DEMO feed. In-situ buoy extraction is feasible via INCOIS ERDDAP. |
| **NOAA CoastWatch** | ERDDAP REST / OPeNDAP | Open access / Public ERDDAP endpoints | Fallback to NOAA ERDDAP mirrors. Return `status: UNAVAILABLE` if timeout exceeds 5s. | **ARCHITECTURE ONLY**: Displayed as DEMO feed. |

---

## PART 7 — Copernicus Product Matrix

The backend must maintain synchronized raster and numerical datasets for the exact Copernicus products configured in the frontend:

```
+----------------------------------------------------------------------------------------------------+
| Copernicus Marine Verified Products                                                                |
+----------------------------------------------------------------------------------------------------+
| 1. Sea Surface Temperature                                                                         |
|    - Product ID: SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001                                          |
|    - Dataset ID: METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2                                               |
|    - Variable: analysed_sst                                                                        |
|    - Unit: °C (Kelvin - 273.15) | Res: 0.05° (~5 km) | Daily L4                                     |
|    - Backend Task: Daily sync to local Zarr store via 'copernicusmarine subset'                    |
+----------------------------------------------------------------------------------------------------+
| 2. Significant Wave Height                                                                         |
|    - Product ID: GLOBAL_ANALYSISFORECAST_WAV_001_027                                               |
|    - Dataset ID: cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411                                    |
|    - Variable: VHM0                                                                                |
|    - Unit: m | Res: 0.083° (~9 km) | 3-Hourly Forecast & Analysis                                  |
|    - Backend Task: Ingest 3-hourly forecast frames for wave hazard advisory engine                 |
+----------------------------------------------------------------------------------------------------+
| 3. Sea Level Anomaly                                                                               |
|    - Product ID: SEALEVEL_GLO_PHY_L4_NRT_008_046                                                   |
|    - Dataset ID: cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.125deg_P1D_202506                 |
|    - Variable: sla                                                                                 |
|    - Unit: m | Res: 0.125° (~14 km) | Daily Multi-Mission Altimeter                                 |
|    - Backend Task: Point slice for cyclonic/anticyclonic eddy core detection                        |
+----------------------------------------------------------------------------------------------------+
| 4. Chlorophyll-a Concentration                                                                     |
|    - Product ID: OCEANCOLOUR_GLO_BGC_L4_NRT_009_102                                                |
|    - Dataset ID: cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D_202311                |
|    - Variable: CHL                                                                                 |
|    - Unit: mg/m³ | Res: 4 km (~0.04°) | Daily Cloud-Gap-Free Multi-Sensor                           |
|    - Backend Task: Compute spatial gradients (dCHL/dx, dCHL/dy) for PFZ front detection            |
+----------------------------------------------------------------------------------------------------+
| 5. Ocean Surface Currents (Architecture Stage)                                                     |
|    - Product ID: GLOBAL_ANALYSISFORECAST_PHY_001_024                                               |
|    - Dataset ID: cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406                                 |
|    - Variable: uo, vo                                                                              |
|    - Unit: m/s | Res: 0.083° (~9 km) | Daily Physics Model                                         |
|    - Backend Task: Ingest velocity vectors for acoustic drift & PFZ jet boundary evaluation        |
+----------------------------------------------------------------------------------------------------+
```

---

## PART 8 & 9 — Multi-Agent Architecture & Ocean Data Agent

### 8.1 Multi-Agent System Topology
ORCA utilizes a **Decoupled Specialist Agent Graph** orchestrated by LangGraph and FastAPI:

```
                            [ USER QUERY / API TRIGGER ]
                                         │
                                         ▼
                            ┌─────────────────────────┐
                            │    ORCA ORCHESTRATOR    │
                            │ (Planning, Delegation,  │
                            │  Synthesis, Guardrails) │
                            └────────────┬────────────┘
                                         │
       ┌──────────────────┬──────────────┼──────────────┬──────────────────┐
       ▼                  ▼              ▼              ▼                  ▼
┌──────────────┐   ┌──────────────┐┌──────────────┐┌──────────────┐ ┌──────────────┐
│  OCEAN DATA  │   │  SATELLITE   ││ PFZ ANALYSIS ││ENVIRONMENTAL │ │MARITIME SAFE │
│    AGENT     │   │    AGENT     ││    AGENT     ││  ANALYTICS   │ │    AGENT     │
└──────┬───────┘   └──────┬───────┘└──────┬───────┘└──────┬───────┘ └──────┬───────┘
       │                  │              │              │                  │
       └──────────────────┴──────────────┼──────────────┴──────────────────┘
                                         ▼
                           ┌───────────────────────────┐
                           │    DATA QUALITY AGENT     │
                           └─────────────┬─────────────┘
                                         ▼
                           ┌───────────────────────────┐
                           │   MULTI-SOURCE CONSENSUS  │
                           └─────────────┬─────────────┘
                                         ▼
                           ┌───────────────────────────┐
                           │     PROVENANCE AGENT      │
                           └─────────────┬─────────────┘
                                         ▼
                            [ SYNTHESIZED JSON ENVELOPE ]
```

### 9.1 Ocean Data Agent
- **Purpose**: Slices, normalizes, and packages point and grid measurements from verified data sources.
- **Inputs**: Coordinates (`lat, lng`), depth (`m`), timestamp (`UTC`), variable identifier.
- **Tools**:
  - `copernicus_opendap_slicer`: Reads local NetCDF/Zarr cubes for SST, Chlorophyll, Waves, SLA, and currents.
  - `incois_erddap_client`: Queries moored buoys (RAMA / OOS) within 50 km radius.
  - `unit_converter`: Strictly converts all inputs to standard SI/Oceanographic units.
- **Strict Guardrail**: Under NO circumstance does this agent extrapolate, hallucinate missing variables, or make operational recommendations.

---

## PART 10, 11, 12 — Specialized Agents: Satellite, PFZ, and Analytics

### 10.1 Satellite Agent
- **Purpose**: Tracks platform ephemeris, sensor status, spectral configurations, and overpass swaths.
- **Inputs**: Region boundary, platform ID (e.g., `sentinel-3a`, `oceansat-3`), time range.
- **Tools**:
  - `sgp4_orbit_propagator`: Calculates exact nadir track and swath polygon from two-line element (TLE) sets.
  - `sensor_metadata_catalog`: Resolves spatial resolution, revisitation cadence, and active bands.
- **Distinction**: Explicitly distinguishes between raw satellite swath geometry and processed gridded L4 products.

### 11.1 PFZ Analysis Agent
- **Purpose**: Evaluates candidate Potential Fishing Zones using deterministic oceanographic algorithms.
- **Deterministic Pipeline**:
  ```
  1. Fetch SST & Chlorophyll gridded layers for target basin.
  2. Compute Sobel gradient magnitude: ∇SST (thermal fronts) and ∇CHL (productivity fronts).
  3. Identify convergence zones where high ∇SST intersects with ∇CHL plumes (0.25 - 2.5 mg/m³).
  4. Exclude zones with wave heights exceeding waveMax (2.5m) or bathymetry < 20m.
  5. Generate candidate polygon geometries and assign composite score:
     Score = (w_sst * S_sst) + (w_chl * S_chl) + (w_current * S_current) - Penalties.
  ```
- **Role of LLM**: The LLM **never** determines the zones or calculates numbers. The LLM acts solely as an **explainability interpreter**, converting the deterministic factor scores into natural-language scientific briefings.

### 12.1 Environmental Analytics Agent
- **Purpose**: Computes temporal trends, statistical moments, and climatological departures.
- **Outputs**:
  - `min`, `max`, `sample_mean`, `median`, `std_dev`, `trend_delta`.
  - Anomaly detection against 30-year climatological baselines.
  - Regional cross-basin co-variation metrics.
- **Strict Rule**: Executed entirely via NumPy/SciPy/Pandas. The LLM summarizes findings using generated numerical tables.

---

## PART 13, 14, 15, 16 — Quality, Consensus, Provenance & Safety Agents

### 13.1 Data Quality Agent
- Evaluates spatial coverage percentage, temporal gap anomalies, and sensor saturation.
- Flags data as `VALIDATED`, `PROVISIONAL`, `CLOUD_CONTAMINATED`, or `EXTRAPOLATED`.

### 14.1 Consensus Agent
- Compares readings across Copernicus, ISRO, INCOIS, and NOAA for the same space-time coordinate.
- Calculates inter-sensor bias: $\Delta = |X_{copernicus} - X_{isro}|$ and standard deviation spread.
- **Strict Grounding Rule**: If only one sensor provides data (e.g. only Copernicus is connected), the consensus status is marked strictly as:
  `consensus_status: "INSUFFICIENT_SOURCES"`. It never fabricates consensus agreement.

### 15.1 Provenance Agent
- Appends cryptographic/UUID audit trail to every data record.
- Identifies exact source agency, dataset ID, processing level (L1/L2/L3/L4), pipeline step, and model version.

### 16.1 Maritime Safety Agent
- Evaluates spatial proximity to the International Maritime Boundary Line (IMBL), EEZ boundaries, marine protected areas (MPAs), and severe sea states ($H_{m0} > 2.5m$).
- Uses authoritative PostGIS geometries.
- For all demo feeds, assigns `data_status: "DEMO"` and never transmits alerts to external naval or coast guard authorities.

---

## PART 17, 18, 19 — Multi-Agent Orchestration & Task Model

### 17.1 Central Orchestration Pipeline
```python
async def orchestrate_scientific_query(query: str, coords: Optional[Coordinates]) -> ScientificResponse:
    # 1. Plan execution graph based on intent
    plan = await orchestrator.create_plan(query, coords)
    
    # 2. Parallel data retrieval
    ocean_data, sat_data = await asyncio.gather(
        ocean_agent.fetch(plan.coords, plan.timestamp),
        satellite_agent.fetch(plan.region)
    )
    
    # 3. Deterministic model execution (PFZ / Analytics)
    if plan.requires_pfz:
        pfz_results = await pfz_agent.evaluate(ocean_data)
    
    # 4. Data Quality & Consensus validation
    quality = await quality_agent.verify(ocean_data)
    consensus = await consensus_agent.evaluate([ocean_data])
    
    # 5. Provenance compilation
    provenance = provenance_agent.compile_records([ocean_data, pfz_results])
    
    # 6. LLM synthesis with strict evidence grounding
    explanation = await orchestrator.synthesize(
        query=query,
        evidence={"ocean": ocean_data, "pfz": pfz_results, "quality": quality},
        guardrails={"forbid_extrapolation": True}
    )
    
    return ScientificResponse(explanation=explanation, provenance=provenance)
```

### 18.1 Communication Protocol Matrix
- **Synchronous HTTP (FastAPI)**: Point queries, metadata lookups, map layer configs, simple time series (latency < 200ms).
- **Asynchronous Task Queue (Celery / Redis)**: Full-basin PFZ candidate extraction, multi-year historical anomaly calculation, satellite overpass orbit propagation (latency 2s - 30s).
- **WebSocket (`/api/v1/command/ws`)**: Real-time operational incident feed, live vessel transponder simulator, agent execution step streaming.

### 19.1 Agent Task Model
```python
class TaskStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

class AgentTask(BaseModel):
    task_id: str
    parent_request_id: str
    agent_name: str
    status: TaskStatus
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    inputs: Dict[str, Any]
    outputs: Optional[Dict[str, Any]] = None
    errors: Optional[List[str]] = None
    provenance: List[ProvenanceRecord] = []
```

---

## PART 20, 21, 22, 23 — Infrastructure, Database, Cache & Workers

### 22.1 Database Architecture (PostgreSQL + PostGIS + TimescaleDB)

```sql
-- 1. Operational Events Table
CREATE TABLE operational_events (
    id VARCHAR(64) PRIMARY KEY,
    category VARCHAR(32) NOT NULL,
    severity VARCHAR(16) NOT NULL,
    workflow_status VARCHAR(24) NOT NULL DEFAULT 'NEW',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location GEOMETRY(Point, 4326) NOT NULL,
    location_name VARCHAR(128),
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(64) NOT NULL,
    data_status VARCHAR(16) NOT NULL DEFAULT 'DEMO',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Time-Series Hypertable for Continuous Observations
CREATE TABLE ocean_observations (
    time TIMESTAMPTZ NOT NULL,
    location GEOMETRY(Point, 4326) NOT NULL,
    depth NUMERIC(6, 2) DEFAULT 0.0,
    variable VARCHAR(32) NOT NULL,
    value NUMERIC(10, 4) NOT NULL,
    unit VARCHAR(16) NOT NULL,
    source_agency VARCHAR(32) NOT NULL,
    quality_flag VARCHAR(24) NOT NULL
);
SELECT create_hypertable('ocean_observations', 'time');
CREATE INDEX idx_ocean_obs_spatial ON ocean_observations USING GIST (location, time);

-- 3. Maritime Boundaries (IMBL, EEZ, MPA)
CREATE TABLE maritime_boundaries (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    boundary_type VARCHAR(32) NOT NULL,
    geom GEOMETRY(MultiLineString, 4326) NOT NULL,
    buffer_zone GEOMETRY(Polygon, 4326)
);
```

### 23.1 Multi-Tier Caching Policy
1. **WMTS Raster Tiles**: Reverse proxy caching via NGINX or Cloudflare CDN (Edge Cache TTL: 24 hours for daily L4 products).
2. **Point & Profile Queries**: Redis Key-Value cache (Key: `hash(lat, lng, variable, timestamp)`, TTL: 1 hour).
3. **Climatological Baselines**: In-memory LRU cache / Redis permanent store (Monthly baselines update annually).

---

## PART 24, 25, 26 — Observability, Security & Error Handling

### 24.1 Degradation & Error Handling Matrix
- **Copernicus Down**: Return latest cached point from local Zarr store with warning `flags: ["CACHED_STORE"]` and status `LayerStatus.LOADING` or `CONNECTED`.
- **ISRO/INCOIS/NOAA Feeds Offline**: Mark cells as `UNAVAILABLE` or `DEMO`. Never generate synthetic values without tagging `data_status: "DEMO"`.
- **Future Timestamp Requested**: Reject with HTTP 422: `"Future timestamps are only valid for forecast variables (e.g., WAV L4)"`.

### 25.1 Security Architecture
- Provider credentials (`COPERNICUS_USERNAME`, `COPERNICUS_PASSWORD`, `MOSDAC_TOKEN`) are strictly kept inside backend server environment variables (`.env`).
- Frontend Next.js client **never** receives raw provider secrets.
- CORS restricted strictly to authorized frontend origins (e.g. `http://localhost:3000` or production domain).

---

## PART 27 — Frontend Integration Matrix (Master Contract)

| Frontend Page | Frontend Component | Current Mock Used | Target Backend Endpoint | Request Format | Target Agent | Primary Data Source |
|---|---|---|---|---|---|---|
| `/research` | `CoordinateInspector` | `mockOcean.ts:getClosestObservation()` | `GET /api/v1/ocean/point` | `?lat=9.93&lng=76.26&time=...` | Ocean Data Agent | Copernicus NetCDF / Zarr Slicer |
| `/research` | `TimeSlider` | `mockOcean.ts:history` | `GET /api/v1/ocean/timeseries` | `?lat=9.93&lng=76.26&days=7` | Ocean Data Agent | Copernicus L4 Daily Store |
| `/research` | `AIReasoningConsole` | `mockAI.ts:getAIResponse()` | `POST /api/v1/agents/query` | `{ query, coordinates }` | Multi-Agent Orchestrator | Full Multi-Agent Graph |
| `/research/ocean` | `DepthSlicer` & `DepthProfileChart` | `mockOcean.ts:depthProfile` | `GET /api/v1/ocean/profile` | `?lat=9.93&lng=76.26&max_depth=2000` | Ocean Data Agent | Copernicus Global Physics L4 |
| `/research/ocean` | `AcousticDuctPanel` | `mockOcean.ts:acousticProfile` | `GET /api/v1/ocean/acoustics` | `?lat=9.93&lng=76.26` | Ocean Data Agent | CTD Acoustic Duct Model |
| `/research/satellites` | `SatelliteSidebar` | `mockSatellites.ts:mockSatellites` | `GET /api/v1/satellites/platforms` | None | Satellite Agent | Space-Track TLE & CEOS Catalog |
| `/research/satellites` | `SatelliteMap` | `mockSatellites.ts:mockGroundTracks` | `GET /api/v1/satellites/swaths` | `?platform=sentinel-3a` | Satellite Agent | SGP4 Orbit Propagator Worker |
| `/research/pfz` | `PFZCandidateTable` | `mockPFZ.ts:mockPFZZones` | `GET /api/v1/pfz/zones` | `?region=kerala-coast` | PFZ Analysis Agent | Numerical Front Detection Engine |
| `/research/pfz` | `PFZModelConfiguration` | Frontend Zustand state | `POST /api/v1/pfz/evaluate` | `{ weights, thresholds }` | PFZ Analysis Agent | Deterministic Re-weighter |
| `/research/analytics` | `AnalyticsTimeSeries` | `mockAnalytics.ts:mockSSTTimeSeries` | `GET /api/v1/analytics/timeseries` | `?param=sst&region=as&window=30d` | Analytics Agent | PostGIS / TimescaleDB Aggregate |
| `/research/analytics` | `AnalyticsAnomalyPanel` | `mockAnalytics.ts:mockSSTAnomaly` | `GET /api/v1/analytics/anomaly` | `?param=sst&lat=9.93&lng=76.26` | Analytics Agent | Climatological Mean Engine |
| `/research/analytics` | `AnalyticsSourceComparison` | `mockAnalytics.ts:mockSourceComparison` | `GET /api/v1/analytics/sources` | `?lat=9.93&lng=76.26` | Consensus Agent | Normalization & Consensus Engine |
| `/research/command` | `CommandEventList` | `mockCommand.ts:mockOperationalEvents` | `GET /api/v1/command/events` | `?severity=ALL&window=24H` | Maritime Safety Agent | PostGIS Events Store |
| `/research/command` | `CommandActions` | Frontend Zustand state | `PATCH /api/v1/command/events/{id}/status` | `{ status: "ACKNOWLEDGED" }` | Maritime Safety Agent | PostgreSQL Events Table |

---

## PART 28 — Phased Migration Plan

```
PHASE 1: Backend Foundation (FastAPI skeleton, PostgreSQL/PostGIS, Redis, CORS, standard envelope)
   ↓
PHASE 2: Copernicus Pipeline (Automated Daily NetCDF sync, point slicer, local Zarr stores)
   ↓
PHASE 3: Ocean & Depth Services (Connect /research Coordinate Inspector & /research/ocean CTD profiles)
   ↓
PHASE 4: Satellite Ephemeris Engine (SGP4 orbital ground track propagator for /research/satellites)
   ↓
PHASE 5: Analytics & Anomaly Engine (TimescaleDB aggregations for /research/analytics)
   ↓
PHASE 6: Numerical PFZ Engine (∇SST and ∇CHL convergence detector for /research/pfz)
   ↓
PHASE 7: Multi-Source Normalization & Consensus (INCOIS, ISRO, NOAA integration with bias metrics)
   ↓
PHASE 8: Command Center Feeds & Geofences (IMBL/EEZ spatial crossing triggers)
   ↓
PHASE 9: Multi-Agent Orchestration (LangGraph graph, guardrails, reasoning synthesis)
   ↓
PHASE 10: Production Hardening (Docker Swarm / K8s deployment, CI/CD, load testing)
```

---

## PART 29 — Exact Backend File Tree

```
backend/
├── Dockerfile
├── requirements.txt
├── alembic.ini
├── pyproject.toml
├── app/
│   ├── main.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── redis.py
│   │   └── database.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── router.py
│   │   │   ├── ocean.py
│   │   │   ├── satellites.py
│   │   │   ├── pfz.py
│   │   │   ├── analytics.py
│   │   │   ├── command.py
│   │   │   └── agents.py
│   ├── schemas/
│   │   ├── envelope.py
│   │   ├── ocean.py
│   │   ├── satellite.py
│   │   ├── pfz.py
│   │   ├── analytics.py
│   │   ├── command.py
│   │   └── agents.py
│   ├── models/
│   │   ├── event.py
│   │   ├── observation.py
│   │   └── boundary.py
│   ├── data/
│   │   ├── adapters/
│   │   │   ├── base.py
│   │   │   ├── copernicus.py
│   │   │   ├── isro.py
│   │   │   ├── incois.py
│   │   │   └── noaa.py
│   │   ├── normalization/
│   │   │   └── units.py
│   │   └── ingestion/
│   │       ├── copernicus_sync.py
│   │       └── orbit_sync.py
│   ├── agents/
│   │   ├── orchestrator.py
│   │   ├── ocean_agent.py
│   │   ├── satellite_agent.py
│   │   ├── pfz_agent.py
│   │   ├── analytics_agent.py
│   │   ├── quality_agent.py
│   │   ├── consensus_agent.py
│   │   ├── provenance_agent.py
│   │   └── safety_agent.py
│   └── workers/
│       ├── celery_app.py
│       ├── tasks_pfz.py
│       └── tasks_satellite.py
└── tests/
    ├── test_copernicus_adapter.py
    ├── test_pfz_algorithm.py
    ├── test_api_contracts.py
    └── test_multi_agent_guardrails.py
```

---

## PART 30 — Complete Pydantic Schemas

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

# --- Ocean Schemas ---
class OceanPointResponse(BaseModel):
    latitude: float
    longitude: float
    timestamp: datetime
    depth: float = 0.0
    sst: Optional[float] = Field(None, description="Sea Surface Temp in °C")
    sst_anomaly: Optional[float] = Field(None, description="Departure from 30Y mean in °C")
    wave_height: Optional[float] = Field(None, description="Hm0 in meters")
    chlorophyll: Optional[float] = Field(None, description="Chlorophyll-a in mg/m³")
    salinity: Optional[float] = Field(None, description="Practical Salinity Units")
    sound_velocity: Optional[float] = Field(None, description="Acoustic sound speed in m/s")
    confidence: str = "HIGH"

# --- PFZ Schemas ---
class PFZFactorSchema(BaseModel):
    name: str
    weight: float
    status: str
    evidence: str

class PFZZoneSchema(BaseModel):
    id: str
    name: str
    sector: str
    score: int = Field(..., ge=0, le=100)
    confidence: str
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

# --- Analytics Schemas ---
class TimeSeriesPointSchema(BaseModel):
    date: str
    value: float
    climatologicalMean: Optional[float] = None
    uncertainty: Optional[float] = None

class SummaryStatsSchema(BaseModel):
    min: float
    max: float
    mean: float
    median: float
    std_dev: float
    trend_delta: float

# --- Command Center Schemas ---
class OperationalEventSchema(BaseModel):
    id: str
    category: str
    severity: str
    status: str = "DEMO"
    workflow_status: str
    title: str
    description: str
    latitude: float
    longitude: float
    location_name: str
    timestamp: str
    source: str
    data_status: str
    metadata: Optional[Dict[str, Any]] = None
```

---

## PART 31 & 32 — API Examples & Multi-Agent Execution Flow

### 31.1 Point Observation Example
**Request:**
`GET /api/v1/ocean/point?lat=9.6000&lng=76.0000&time=2026-08-28T00:00:00Z`

**Response:**
```json
{
  "request_id": "req-9102-a1",
  "status": "SUCCESS",
  "data_status": "REAL DATA",
  "data": {
    "latitude": 9.6000,
    "longitude": 76.0000,
    "timestamp": "2026-08-28T00:00:00Z",
    "depth": 0.0,
    "sst": 28.95,
    "sst_anomaly": 0.42,
    "wave_height": 1.45,
    "chlorophyll": 0.58,
    "salinity": 34.8,
    "sound_velocity": 1542.1,
    "confidence": "HIGH"
  },
  "provenance": [
    {
      "source": "COPERNICUS MARINE",
      "product_id": "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001",
      "dataset_id": "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2",
      "variable": "analysed_sst",
      "timestamp": "2026-08-28T00:00:00Z",
      "processing_level": "L4",
      "status": "VALIDATED"
    }
  ]
}
```

### 32.1 End-to-End Multi-Agent Reasoning Flow
**User Prompt**: *"Why is ZONE-001 along the Kochi shelf break identified as a Potential Fishing Zone?"*

```
1. Frontend Client
   → POST /api/v1/agents/query
     Payload: { "query": "Why is ZONE-001 along the Kochi shelf break identified as a PFZ?", "coordinates": { "lat": 9.60, "lng": 76.00 } }

2. Orchestrator
   → Decomposes query into required sub-tasks:
     [1] Fetch PFZ Zone features (PFZ Agent)
     [2] Extract verified ocean parameters at coordinates (Ocean Data Agent)
     [3] Check spatial gradients and temporal anomaly (Analytics Agent)
     [4] Check sensor health and coverage flags (Quality Agent)
     [5] Inter-calibrate available sensors (Consensus Agent)
     [6] Attach data lineage (Provenance Agent)

3. Sub-Agent Execution
   - PFZ Agent: Returns ZONE-001 score = 84/100, thermal front gradient = 0.65°C / 10 km.
   - Ocean Data Agent: Slices Copernicus SST (28.6°C) and Chlorophyll (0.58 mg/m³).
   - Analytics Agent: Confirms chlorophyll concentration exceeds seasonal median by +0.18 mg/m³.
   - Quality Agent: Confirms gap-free L4 OSTIA product, spatial coverage = 100%.
   - Consensus Agent: Compares Copernicus with INCOIS buoy RAMA-02 (ΔSST = 0.15°C, high agreement).
   - Provenance Agent: Links METOFFICE-GLO-SST-L4 and OCEANCOLOUR_GLO_BGC_L4.

4. Orchestrator Synthesis
   - Injects structured findings into prompt context.
   - LLM generates grounded scientific explanation:
     "ZONE-001 (Kochi-South Shelf Front) was identified due to a strong thermal gradient (0.65°C / 10 km) co-located with a phytoplankton accumulation plume (0.58 mg/m³ Chlorophyll-a). Copernicus OSTIA SST (28.6°C) is verified with in-situ buoy observations within 0.15°C agreement."

5. Final Envelope returned to Frontend AI Console with full audit trail.
```

---

## PART 33, 34, 35 — Scientific Safety Rules, Testing & Deliverable Summary

### 33.1 Non-Negotiable Scientific Safety Rules
1. **Zero Hallucination of Measurements**: The LLM is strictly prohibited from estimating, modifying, or creating numerical ocean measurements.
2. **Deterministic Modeling**: PFZ boundaries, scores, acoustic duct depths, and anomaly statistics **must** be produced by deterministic Python routines (NumPy, GDAL, SciPy), never by language model generation.
3. **Consensus Honesty**: If only one data provider is available, consensus **must** report `INSUFFICIENT_SOURCES`.
4. **Demo Isolation**: Simulated feeds (e.g. demo AIS tracks, demo safety buffers) must carry `data_status: "DEMO"` at all times and cannot trigger external notifications.

### 34.1 Testing & Verification Strategy
- **Contract Tests**: Verify that Pydantic models serialize into exact JSON keys expected by TypeScript interfaces (`types/*.ts`).
- **Geospatial Integrity Tests**: Validate that NetCDF pixel-to-coordinate transforms align with MapLibre EPSG:3857 tile projections without spatial displacement.
- **Unit Normalization Tests**: Ensure automatic Kelvin $\to$ Celsius, m/s $\to$ knots, and Pa $\to$ hPa conversions operate accurately across all provider adapters.

---

### Known Backend Unknowns & Research Directives for Backend Team
1. **ISRO MOSDAC Production API**: Formal protocols for automated INSAT-3DS and Oceansat-3 raster ingestion require agency API registration.
2. **Local Zarr Slicing Performance**: Benchmark point-slicing latencies on multi-gigabyte NetCDF files vs. pre-tiled Zarr stores.
3. **Real-time Coastal AIS**: Integration with coastal radar transponder networks requires legal licensing and operational access.
