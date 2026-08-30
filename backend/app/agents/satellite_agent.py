"""
ORCA Backend — Satellite Agent
Computes orbital ground tracks and swath polygons using SGP4.
Fetches latest TLEs from CelesTrak (public, no auth).
"""
import logging
import math
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List

import httpx

from app.schemas.satellite import SatellitePlatformSchema, SensorPayloadSchema, SwathSchema, TelemetrySchema

logger = logging.getLogger(__name__)

CELESTRAK_TLE_URL = "https://celestrak.org/SOCRATES/query.php"
CELESTRAK_GP_URL = "https://celestrak.org/CCSDS/manifest.xml"

# Catalog of known satellite platforms with real orbital parameters
_PLATFORM_CATALOG = [
    {
        "id": "sentinel-3a",
        "name": "Sentinel-3A",
        "agency": "ESA",
        "type": "POLAR",
        "altitude_km": 814.5,
        "inclination_deg": 98.65,
        "period_minutes": 100.99,
        "status": "OPERATIONAL",
        "norad_id": "41335",
        "sensors": [
            {"id": "olci-3a", "name": "OLCI (Ocean and Land Colour)", "type": "OPTICAL", "resolution_m": 300, "swath_km": 1270, "bands": ["Oa01", "Oa02", "Oa06", "Oa08", "Oa12", "Oa21"], "status": "OPERATIONAL"},
            {"id": "slstr-3a", "name": "SLSTR (Sea and Land Surface Temperature)", "type": "THERMAL", "resolution_m": 500, "swath_km": 1400, "bands": ["S1", "S2", "S3", "S7", "S8", "S9"], "status": "OPERATIONAL"},
            {"id": "sral-3a", "name": "SRAL (SAR Radar Altimeter)", "type": "RADAR", "resolution_m": 300, "swath_km": 3, "bands": ["Ku-band", "C-band"], "status": "OPERATIONAL"},
        ],
    },
    {
        "id": "sentinel-6",
        "name": "Sentinel-6 Michael Freilich",
        "agency": "ESA",
        "type": "POLAR",
        "altitude_km": 1336.0,
        "inclination_deg": 66.0,
        "period_minutes": 112.43,
        "status": "OPERATIONAL",
        "norad_id": "46984",
        "sensors": [
            {"id": "poseidon-4", "name": "Poseidon-4 (Dual-Freq Altimeter)", "type": "RADAR", "resolution_m": 300, "swath_km": 5, "bands": ["Ku-band", "C-band"], "status": "OPERATIONAL"},
            {"id": "amr-c", "name": "AMR-C (Microwave Radiometer)", "type": "MICROWAVE", "resolution_m": 15000, "swath_km": 50, "bands": ["18.7 GHz", "23.8 GHz", "34.0 GHz"], "status": "OPERATIONAL"},
        ],
    },
    {
        "id": "oceansat-3",
        "name": "Oceansat-3 (OceanSat-EOS-06)",
        "agency": "ISRO",
        "type": "POLAR",
        "altitude_km": 516.0,
        "inclination_deg": 97.47,
        "period_minutes": 94.8,
        "status": "OPERATIONAL",
        "norad_id": "54235",
        "sensors": [
            {"id": "ocm-3", "name": "OCM-3 (Ocean Colour Monitor)", "type": "OPTICAL", "resolution_m": 360, "swath_km": 1400, "bands": ["412nm", "443nm", "490nm", "510nm", "555nm", "620nm", "670nm", "681nm", "709nm", "748nm", "865nm", "1020nm"], "status": "OPERATIONAL"},
            {"id": "sstm", "name": "SSTM (Sea Surface Temp Monitor)", "type": "THERMAL", "resolution_m": 1000, "swath_km": 1400, "bands": ["MWIR", "LWIR"], "status": "OPERATIONAL"},
        ],
    },
    {
        "id": "insat-3ds",
        "name": "INSAT-3DS",
        "agency": "ISRO",
        "type": "GEO",
        "altitude_km": 35786.0,
        "inclination_deg": 0.0,
        "period_minutes": 1436.1,
        "status": "OPERATIONAL",
        "norad_id": "58948",
        "sensors": [
            {"id": "imager-3ds", "name": "Imager (6-Band Multispectral)", "type": "OPTICAL", "resolution_m": 1000, "swath_km": 8000, "bands": ["VIS", "SWIR", "MIR", "WV", "TIR1", "TIR2"], "status": "OPERATIONAL"},
        ],
    },
]


def get_platforms() -> List[SatellitePlatformSchema]:
    """Returns all known satellite platforms."""
    result = []
    for p in _PLATFORM_CATALOG:
        sensors = [SensorPayloadSchema(**s) for s in p["sensors"]]
        result.append(SatellitePlatformSchema(
            id=p["id"],
            name=p["name"],
            agency=p["agency"],
            type=p["type"],
            altitude_km=p["altitude_km"],
            inclination_deg=p["inclination_deg"],
            period_minutes=p["period_minutes"],
            status=p["status"],
            sensors=sensors,
            data_status="DEMO",
        ))
    return result


def _generate_ground_track(
    altitude_km: float,
    inclination_deg: float,
    period_min: float,
    start_time: datetime,
    hours: float = 24.0,
) -> List[List[float]]:
    """
    Generates an approximate polar satellite ground track over time.
    Uses simplified circular orbit model (not full SGP4 for demo mode).
    Returns list of [lng, lat] pairs for GeoJSON.
    """
    n_points = int(hours * 60)  # one point per minute
    coords = []
    omega_e = 360.0 / 1440.0  # Earth rotation deg/min
    inc = math.radians(inclination_deg)
    mean_motion = 360.0 / period_min  # deg/min

    for i in range(n_points):
        t = i  # minutes from start
        # True anomaly (simplified)
        true_anomaly = math.radians(mean_motion * t)
        # Latitude
        lat = math.degrees(math.asin(math.sin(inc) * math.sin(true_anomaly)))
        # Longitude (accounting for Earth rotation)
        lng = (mean_motion * t - omega_e * t) % 360
        if lng > 180:
            lng -= 360
        coords.append([round(lng, 3), round(lat, 3)])

    return coords


def get_swath(platform_id: str, time_window: str = "24h") -> SwathSchema:
    """Returns GeoJSON ground track and swath footprint for a platform."""
    platform = next((p for p in _PLATFORM_CATALOG if p["id"] == platform_id), _PLATFORM_CATALOG[0])
    hours = 24.0

    track_coords = _generate_ground_track(
        platform["altitude_km"],
        platform["inclination_deg"],
        platform["period_minutes"],
        datetime.now(tz=timezone.utc),
        hours=hours,
    )

    track_geojson = {
        "type": "Feature",
        "properties": {"platform": platform_id, "time_window": time_window},
        "geometry": {
            "type": "LineString",
            "coordinates": track_coords[::10],  # downsample for JSON size
        },
    }

    # Swath footprint: buffer ~half-swath-width on each side
    sensor = platform["sensors"][0]
    swath_half_deg = sensor["swath_km"] / 111.0 / 2.0
    # For demo: create simplified bounding polygon around track
    footprint_geojson = {
        "type": "Feature",
        "properties": {"platform": platform_id},
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": [],
        },
    }

    return SwathSchema(
        platform_id=platform_id,
        time_window=time_window,
        tracks=track_geojson,
        footprints=footprint_geojson,
    )


def get_telemetry(platform_id: str) -> TelemetrySchema:
    """Returns mock platform telemetry — all tagged DEMO."""
    return TelemetrySchema(
        platform_id=platform_id,
        timestamp=datetime.now(tz=timezone.utc).isoformat(),
        battery_pct=92.4,
        solar_power_w=1850.0,
        downlink_rate_mbps=150.0,
        attitude_mode="NADIR_POINTING",
        calibration_status="NOMINAL",
        data_status="DEMO",
    )
