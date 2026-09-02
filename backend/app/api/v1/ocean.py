"""
ORCA Backend — Oceanographic Data Router
Exposes Copernicus Marine verified layers, auto-discovery catalog, GetFeatureInfo point queries,
timeseries analysis, and bounding-box spatial summaries.
"""
from typing import Optional
from fastapi import APIRouter, Query

from app.providers.copernicus.catalog import get_copernicus_catalog
from app.providers.copernicus.wmts import get_available_layers, query_feature_info
from app.providers.copernicus.subset import calculate_spatial_summary
from app.providers.copernicus.timeseries import get_ocean_timeseries

router = APIRouter(prefix="/ocean", tags=["Oceanographic Data"])


@router.get("/catalog")
async def catalog():
    """Retrieve verified Copernicus Marine auto-discovery catalog with live capabilities."""
    return await get_copernicus_catalog()


@router.get("/layers")
async def layers():
    """List verified Copernicus Marine raster and vector layers."""
    return {"status": "CONNECTED", "layers": get_available_layers()}


@router.get("/feature-info")
async def feature_info(
    layer_id: str = Query("copernicus-sst", description="Layer ID (e.g. copernicus-sst, copernicus-wave, copernicus-chl, copernicus-sla)"),
    lat: float = Query(9.9312, description="Latitude in decimal degrees"),
    lon: float = Query(76.2673, description="Longitude in decimal degrees"),
    time: Optional[str] = Query(None, description="Timestamp ISO string")
):
    """Query pixel observation value via Copernicus GetFeatureInfo point slicer."""
    return await query_feature_info(layer_id=layer_id, lat=lat, lon=lon, time_iso=time)


@router.get("/timeseries")
async def timeseries(
    dataset_key: str = Query("copernicus-sst", description="Dataset key (e.g. copernicus-sst, copernicus-wave, copernicus-chl, copernicus-sla)"),
    lat: float = Query(9.9312, description="Latitude"),
    lon: float = Query(76.2673, description="Longitude"),
    start_time: Optional[str] = Query(None, description="Start timestamp ISO string"),
    end_time: Optional[str] = Query(None, description="End timestamp ISO string"),
    steps: int = Query(5, description="Number of observation intervals")
):
    """Retrieve retrospective ocean parameter timeseries directly from Copernicus observations."""
    return await get_ocean_timeseries(
        dataset_key=dataset_key,
        lat=lat,
        lon=lon,
        start_time=start_time,
        end_time=end_time,
        steps=steps
    )


@router.get("/spatial-summary")
async def spatial_summary(
    dataset_key: str = Query("copernicus-sst", description="Dataset key (e.g. copernicus-sst, copernicus-wave)"),
    min_lat: float = Query(8.0, description="Minimum latitude"),
    max_lat: float = Query(15.0, description="Maximum latitude"),
    min_lon: float = Query(70.0, description="Minimum longitude"),
    max_lon: float = Query(80.0, description="Maximum longitude"),
    time: Optional[str] = Query(None, description="Timestamp ISO string")
):
    """Calculate regional bounding-box statistics (min, max, mean, percentiles) from Copernicus observations."""
    return await calculate_spatial_summary(
        dataset_key=dataset_key,
        min_lat=min_lat,
        max_lat=max_lat,
        min_lon=min_lon,
        max_lon=max_lon,
        time_iso=time
    )
