"""
ORCA Backend — Copernicus Central Dataset Registry
Defines verified Copernicus Marine products, dataset IDs, variables, units, resolutions, and access capabilities.
"""
from typing import Dict, Any, List

COPERNICUS_DATASET_REGISTRY: List[Dict[str, Any]] = [
    {
        "id": "copernicus-sst",
        "parameter": "sst",
        "name": "Sea Surface Temperature (OSTIA)",
        "product_id": "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001",
        "dataset_id": "METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2",
        "variable": "analysed_sst",
        "units": "°C",
        "spatial_resolution": "0.05° (~5 km)",
        "temporal_resolution": "Daily (Near Real Time)",
        "temporal_cadence": "daily",
        "min_depth": 0.0,
        "max_depth": 0.0,
        "supports_time": True,
        "supports_depth": False,
        "supports_feature_info": True,
        "supports_wmts": True,
        "supports_subset": True,
        "wmts_layer": "SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001/METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2/analysed_sst",
        "matrix_set": "EPSG:3857",
        "palette": "turbo",
        "source": "Copernicus Marine Service / UK Met Office",
        "status": "CONNECTED"
    },
    {
        "id": "copernicus-wave",
        "parameter": "waveHeight",
        "name": "Significant Wave Height (Spectral Hm0)",
        "product_id": "GLOBAL_ANALYSISFORECAST_WAV_001_027",
        "dataset_id": "cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411",
        "variable": "VHM0",
        "units": "m",
        "spatial_resolution": "0.083° (~9 km)",
        "temporal_resolution": "3-Hourly Forecast",
        "temporal_cadence": "3-hourly",
        "min_depth": 0.0,
        "max_depth": 0.0,
        "supports_time": True,
        "supports_depth": False,
        "supports_feature_info": True,
        "supports_wmts": True,
        "supports_subset": True,
        "wmts_layer": "GLOBAL_ANALYSISFORECAST_WAV_001_027/cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411/VHM0",
        "matrix_set": "EPSG:3857",
        "palette": "magma",
        "source": "Copernicus Marine Service / Météo-France",
        "status": "CONNECTED"
    },
    {
        "id": "copernicus-chl",
        "parameter": "chlorophyll",
        "name": "Chlorophyll-a Plume Concentration",
        "product_id": "OCEANCOLOUR_GLO_BGC_L3_MY_009_107",
        "dataset_id": "c3s_obs-oc_glo_bgc-plankton_my_l3-multi-4km_P1D_202303",
        "variable": "CHL",
        "units": "mg/m³",
        "spatial_resolution": "4 km (~0.04°)",
        "temporal_resolution": "Daily Multi-Sensor L3/L4",
        "temporal_cadence": "daily",
        "min_depth": 0.0,
        "max_depth": 0.0,
        "supports_time": True,
        "supports_depth": False,
        "supports_feature_info": True,
        "supports_wmts": True,
        "supports_subset": True,
        "wmts_layer": "OCEANCOLOUR_GLO_BGC_L3_MY_009_107/c3s_obs-oc_glo_bgc-plankton_my_l3-multi-4km_P1D_202303/CHL",
        "matrix_set": "EPSG:3857",
        "palette": "algae",
        "source": "Copernicus Marine Service / ACRI-ST",
        "status": "CONNECTED"
    },
    {
        "id": "copernicus-sla",
        "parameter": "seaLevel",
        "name": "Sea Level Anomaly (DUACS Two-Sat)",
        "product_id": "SEALEVEL_GLO_PHY_CLIMATE_L4_MY_008_057",
        "dataset_id": "c3s_obs-sl_glo_phy-ssh_my_twosat-l4-duacs-0.25deg_P1D_202411",
        "variable": "sla",
        "units": "m",
        "spatial_resolution": "0.25° (~28 km)",
        "temporal_resolution": "Daily Altimetry Gridded",
        "temporal_cadence": "daily",
        "min_depth": 0.0,
        "max_depth": 0.0,
        "supports_time": True,
        "supports_depth": False,
        "supports_feature_info": True,
        "supports_wmts": True,
        "supports_subset": True,
        "wmts_layer": "SEALEVEL_GLO_PHY_CLIMATE_L4_MY_008_057/c3s_obs-sl_glo_phy-ssh_my_twosat-l4-duacs-0.25deg_P1D_202411/sla",
        "matrix_set": "EPSG:3857",
        "palette": "balance",
        "source": "Copernicus Marine Service / CLS",
        "status": "CONNECTED"
    },
    {
        "id": "copernicus-currents",
        "parameter": "currents",
        "name": "Ocean Surface Currents (Vector u/v)",
        "product_id": "GLOBAL_ANALYSISFORECAST_PHY_001_024",
        "dataset_id": "cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406",
        "variable": "uo, vo",
        "units": "m/s",
        "spatial_resolution": "0.083° (~9 km)",
        "temporal_resolution": "Daily Analysis",
        "temporal_cadence": "daily",
        "min_depth": 0.5,
        "max_depth": 5500.0,
        "supports_time": True,
        "supports_depth": True,
        "supports_feature_info": False,
        "supports_wmts": False,
        "supports_subset": True,
        "wmts_layer": "",
        "matrix_set": "EPSG:3857",
        "palette": "speed",
        "source": "Copernicus Marine Service / Mercator Ocean",
        "status": "UNAVAILABLE"
    }
]


def get_registered_dataset(dataset_id: str) -> Dict[str, Any]:
    for ds in COPERNICUS_DATASET_REGISTRY:
        if ds["id"] == dataset_id or ds["parameter"] == dataset_id or ds["dataset_id"] == dataset_id:
            return ds
    return COPERNICUS_DATASET_REGISTRY[0]


def get_all_registered_datasets() -> List[Dict[str, Any]]:
    return COPERNICUS_DATASET_REGISTRY
