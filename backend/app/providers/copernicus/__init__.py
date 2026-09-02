"""
ORCA Backend — Copernicus Marine Provider Package
"""
from .registry import COPERNICUS_DATASET_REGISTRY, get_registered_dataset, get_all_registered_datasets
from .catalog import get_copernicus_catalog
from .wmts import get_available_layers, query_feature_info
from .feature_info import execute_feature_info
from .subset import calculate_spatial_summary
from .timeseries import get_ocean_timeseries

__all__ = [
    "COPERNICUS_DATASET_REGISTRY",
    "get_registered_dataset",
    "get_all_registered_datasets",
    "get_copernicus_catalog",
    "get_available_layers",
    "query_feature_info",
    "execute_feature_info",
    "calculate_spatial_summary",
    "get_ocean_timeseries",
]
