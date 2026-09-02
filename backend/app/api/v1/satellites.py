"""
ORCA Backend — Satellite Observatory Router
"""
from fastapi import APIRouter

router = APIRouter(prefix="/satellites", tags=["Satellite Earth Observation"])

SATELLITE_PLATFORMS = [
    {
        "id": "insat-3ds",
        "name": "INSAT-3DS",
        "agency": "ISRO",
        "orbit_type": "GEOSTATIONARY",
        "orbital_slot": "74.0° E",
        "status": "CONNECTED",
        "payloads": ["Imager (6-channel)", "Sounder (19-channel)"],
        "observation_target": "Indian Ocean Basin SST, Cloud Imagery, Water Vapor",
        "resolution": "1.0 - 4.0 km",
        "temporal_cadence": "15-minute repeat"
    },
    {
        "id": "oceansat-3",
        "name": "Oceansat-3 (EOS-06)",
        "agency": "ISRO",
        "orbit_type": "SUN_SYNCHRONOUS",
        "altitude_km": 720,
        "status": "CONNECTED",
        "payloads": ["OCM-3 (Ocean Colour Monitor)", "SSTM-1 (Thermal)", "Ku-Band Scatterometer"],
        "observation_target": "Chlorophyll-a, Ocean Color, Surface Wind Vectors",
        "resolution": "360m / 1km",
        "temporal_cadence": "2-day global repeat"
    },
    {
        "id": "sentinel-3a",
        "name": "Sentinel-3A",
        "agency": "ESA / Copernicus",
        "orbit_type": "SUN_SYNCHRONOUS",
        "altitude_km": 815,
        "status": "CONNECTED",
        "payloads": ["SLSTR (Sea & Land Surface Temp Radiometer)", "OLCI (Ocean Land Colour)", "SRAL (Altimeter)"],
        "observation_target": "SST, Sea Surface Topography, Marine Bio-optics",
        "resolution": "300m - 1km",
        "temporal_cadence": "Daily NRT"
    },
    {
        "id": "sentinel-6",
        "name": "Sentinel-6 Michael Freilich",
        "agency": "ESA / NASA / EUMETSAT / NOAA",
        "orbit_type": "NON_SUN_SYNCHRONOUS",
        "altitude_km": 1336,
        "status": "CONNECTED",
        "payloads": ["Poseidon-4 Radar Altimeter", "AMR-C Radiometer"],
        "observation_target": "High-Precision Sea Level Anomaly & Significant Wave Height",
        "resolution": "Along-track footprint ~2 km",
        "temporal_cadence": "10-day global repeat"
    },
    {
        "id": "noaa-20",
        "name": "NOAA-20 (JPSS-1)",
        "agency": "NOAA / NESDIS",
        "orbit_type": "SUN_SYNCHRONOUS",
        "altitude_km": 824,
        "status": "CONNECTED",
        "payloads": ["VIIRS (Visible Infrared Imaging Radiometer Suite)", "ATMS", "CrIS"],
        "observation_target": "Global High-Res Sea Surface Temperature & True Color Imagery",
        "resolution": "375m / 750m",
        "temporal_cadence": "12-hour overlap"
    }
]


@router.get("/platforms")
async def get_platforms():
    """List operational satellite observation platforms with payloads and agency provenance."""
    return {"status": "CONNECTED", "platforms": SATELLITE_PLATFORMS}
