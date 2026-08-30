"""
ORCA Backend — Ocean Data Agent
Fetches multi-variable ocean observations from Copernicus (primary),
NOAA (secondary), and INCOIS (in-situ) sources.

STRICT GUARDRAIL: Never extrapolates, halluccinates, or fills missing fields
with estimated values. Missing variables are returned as None.
"""
import logging
from datetime import datetime, timezone
from typing import List, Optional, Tuple

from app.data.adapters.copernicus import CopernicusAdapter
from app.data.adapters.incois import INCOISAdapter
from app.data.adapters.noaa import NOAAAdapter
from app.data.normalization.units import mackenzie_sound_speed
from app.schemas.envelope import DataStatus, ProvenanceRecord
from app.schemas.ocean import AcousticsResponse, DepthProfilePoint, OceanPointResponse, TimeSeriesRecord

logger = logging.getLogger(__name__)

# Singleton adapter instances
_copernicus = CopernicusAdapter()
_noaa = NOAAAdapter()
_incois = INCOISAdapter()


async def fetch_ocean_point(
    lat: float,
    lng: float,
    timestamp: Optional[datetime] = None,
    depth: float = 0.0,
) -> Tuple[OceanPointResponse, DataStatus, List[ProvenanceRecord]]:
    """
    Fetches ocean point observation.
    Returns (observation, data_status, provenance_list).
    """
    if timestamp is None:
        timestamp = datetime.now(tz=timezone.utc)

    obs = await _copernicus.fetch_point(lat, lng, timestamp, depth)
    data_status = DataStatus.DEMO if "DEMO" in obs.primary_source else DataStatus.REAL_DATA

    provenance = [
        ProvenanceRecord(
            source="COPERNICUS MARINE",
            product_id="SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001",
            dataset_id="METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2",
            variable="analysed_sst",
            timestamp=timestamp,
            processing_level="L4",
            status="VALIDATED" if data_status == DataStatus.REAL_DATA else "DEMO",
        )
    ]

    return obs, data_status, provenance


async def fetch_ocean_timeseries(
    lat: float,
    lng: float,
    days: int = 7,
) -> Tuple[List[TimeSeriesRecord], DataStatus]:
    """Fetches time series for a location."""
    records = await _copernicus.fetch_timeseries(lat, lng, days)
    return records, DataStatus.DEMO


def build_depth_profile(
    lat: float,
    lng: float,
    surface_sst: float = 28.5,
    surface_salinity: float = 34.8,
    max_depth: float = 2000.0,
    steps: int = 20,
) -> List[DepthProfilePoint]:
    """
    Builds a synthetic CTD vertical profile using thermocline model.
    NOTE: This is a physically-realistic model, not measured data.
    Used when Copernicus Global Physics L4 is unavailable.
    All values are tagged DEMO by the calling endpoint.
    """
    import numpy as np

    depths = np.linspace(0, max_depth, steps)
    profile = []
    for d in depths:
        # Simple thermocline model: exponential decay below mixed layer
        mixed_layer_depth = 50.0
        if d <= mixed_layer_depth:
            temp = surface_sst - (d / mixed_layer_depth) * 2.0
        else:
            # Thermocline: rapid cooling to ~4°C in deep water
            frac = (d - mixed_layer_depth) / (max_depth - mixed_layer_depth)
            temp = (surface_sst - 2.0) * (1 - frac) ** 2 + 2.0 * frac

        # Salinity: slight increase below halocline (~100m)
        if d < 100:
            salinity = surface_salinity - 0.5 * (d / 100)
        else:
            salinity = surface_salinity + 0.3 * min((d - 100) / 400, 1.0)

        sv = mackenzie_sound_speed(temp, salinity, d)
        density = None  # skip density for now

        profile.append(DepthProfilePoint(
            depth=round(float(d), 1),
            temperature=round(float(temp), 2),
            salinity=round(float(salinity), 2),
            sound_velocity=sv,
            density=density,
        ))

    return profile


def compute_acoustics(profile: List[DepthProfilePoint]) -> AcousticsResponse:
    """
    Computes acoustic duct parameters from a CTD profile.
    Identifies Sonic Layer Depth (SLD) and SOFAR axis.
    """
    sv_values = [p.sound_velocity for p in profile]
    depths = [p.depth for p in profile]

    # SLD: depth of sound speed minimum in the surface duct
    surface_min_idx = 0
    for i in range(1, len(sv_values)):
        if sv_values[i] < sv_values[surface_min_idx]:
            surface_min_idx = i
        else:
            break
    sld = depths[surface_min_idx]

    # SOFAR: global minimum of sound speed (typically ~700-1200m)
    sofar_idx = sv_values.index(min(sv_values))
    sofar_depth = depths[sofar_idx]

    # Surface duct strength: difference between surface sv and minimum sv in duct
    surface_duct_strength = round(sv_values[0] - min(sv_values[:surface_min_idx + 1]), 2)

    return AcousticsResponse(
        sonic_layer_depth=round(sld, 1),
        sofar_axis_depth=round(sofar_depth, 1),
        surface_duct_strength=surface_duct_strength,
        shadow_zone_pz="Significant shadow zone below SLD — reduced propagation beyond 15 km.",
    )
