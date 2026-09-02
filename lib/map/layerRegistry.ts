/**
 * Centralized Oceanographic Layer Registry for Project ORCA
 * Capability-driven layer definitions synchronized with verified Copernicus Marine services.
 */

export interface OceanLayerDefinition {
  id: string;
  parameter: 'sst' | 'waveHeight' | 'seaLevel' | 'chlorophyll' | 'currents' | 'salinity' | 'bathymetry';
  name: string;
  provider: string;
  product: string;
  dataset: string;
  variable: string;
  type: 'wmts' | 'vector' | 'geojson' | 'elevation';
  units: string;
  temporal_resolution: string;
  spatial_resolution: string;
  supports_time: boolean;
  supports_depth: boolean;
  supports_feature_info: boolean;
  supports_subset: boolean;
  palette: string;
  wmts_layer: string;
  matrix_set: string;
  default_opacity: number;
  status: 'CONNECTED' | 'LOADING' | 'DEGRADED' | 'ERROR' | 'UNAVAILABLE';
}

export const LAYER_REGISTRY: OceanLayerDefinition[] = [
  {
    id: 'copernicus-sst',
    parameter: 'sst',
    name: 'Sea Surface Temperature (OSTIA)',
    provider: 'Copernicus Marine Service / UK Met Office',
    product: 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001',
    dataset: 'METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2',
    variable: 'analysed_sst',
    type: 'wmts',
    units: '°C',
    temporal_resolution: 'Daily (Near Real Time)',
    spatial_resolution: '0.05° (~5 km)',
    supports_time: true,
    supports_depth: false,
    supports_feature_info: true,
    supports_subset: true,
    palette: 'turbo',
    wmts_layer: 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001/METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2/analysed_sst',
    matrix_set: 'EPSG:3857',
    default_opacity: 0.85,
    status: 'CONNECTED'
  },
  {
    id: 'copernicus-wave',
    parameter: 'waveHeight',
    name: 'Significant Wave Height',
    provider: 'Copernicus Marine Service / Météo-France',
    product: 'GLOBAL_ANALYSISFORECAST_WAV_001_027',
    dataset: 'cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411',
    variable: 'VHM0',
    type: 'wmts',
    units: 'm',
    temporal_resolution: '3-Hourly Forecast',
    spatial_resolution: '0.083° (~9 km)',
    supports_time: true,
    supports_depth: false,
    supports_feature_info: true,
    supports_subset: true,
    palette: 'magma',
    wmts_layer: 'GLOBAL_ANALYSISFORECAST_WAV_001_027/cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411/VHM0',
    matrix_set: 'EPSG:3857',
    default_opacity: 0.80,
    status: 'CONNECTED'
  },
  {
    id: 'copernicus-chl',
    parameter: 'chlorophyll',
    name: 'Chlorophyll-a Plume Concentration',
    provider: 'Copernicus Marine Service / ACRI-ST',
    product: 'OCEANCOLOUR_GLO_BGC_L3_MY_009_107',
    dataset: 'c3s_obs-oc_glo_bgc-plankton_my_l3-multi-4km_P1D_202303',
    variable: 'CHL',
    type: 'wmts',
    units: 'mg/m³',
    temporal_resolution: 'Daily Multi-Sensor L3/L4',
    spatial_resolution: '4 km (~0.04°)',
    supports_time: true,
    supports_depth: false,
    supports_feature_info: true,
    supports_subset: true,
    palette: 'algae',
    wmts_layer: 'OCEANCOLOUR_GLO_BGC_L3_MY_009_107/c3s_obs-oc_glo_bgc-plankton_my_l3-multi-4km_P1D_202303/CHL',
    matrix_set: 'EPSG:3857',
    default_opacity: 0.80,
    status: 'CONNECTED'
  },
  {
    id: 'copernicus-sla',
    parameter: 'seaLevel',
    name: 'Sea Level Anomaly (DUACS Two-Sat)',
    provider: 'Copernicus Marine Service / CLS',
    product: 'SEALEVEL_GLO_PHY_CLIMATE_L4_MY_008_057',
    dataset: 'c3s_obs-sl_glo_phy-ssh_my_twosat-l4-duacs-0.25deg_P1D_202411',
    variable: 'sla',
    type: 'wmts',
    units: 'm',
    temporal_resolution: 'Daily Altimetry Gridded',
    spatial_resolution: '0.25° (~28 km)',
    supports_time: true,
    supports_depth: false,
    supports_feature_info: true,
    supports_subset: true,
    palette: 'balance',
    wmts_layer: 'SEALEVEL_GLO_PHY_CLIMATE_L4_MY_008_057/c3s_obs-sl_glo_phy-ssh_my_twosat-l4-duacs-0.25deg_P1D_202411/sla',
    matrix_set: 'EPSG:3857',
    default_opacity: 0.75,
    status: 'CONNECTED'
  },
  {
    id: 'copernicus-currents',
    parameter: 'currents',
    name: 'Surface Ocean Currents (Vector)',
    provider: 'Copernicus Marine Service / Mercator Ocean',
    product: 'GLOBAL_ANALYSISFORECAST_PHY_001_024',
    dataset: 'cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406',
    variable: 'uo, vo',
    type: 'vector',
    units: 'm/s',
    temporal_resolution: 'Daily Analysis',
    spatial_resolution: '0.083° (~9 km)',
    supports_time: true,
    supports_depth: true,
    supports_feature_info: false,
    supports_subset: true,
    palette: 'speed',
    wmts_layer: '',
    matrix_set: 'EPSG:3857',
    default_opacity: 0.75,
    status: 'UNAVAILABLE'
  }
];

export function getLayerById(id: string): OceanLayerDefinition | undefined {
  return LAYER_REGISTRY.find((l) => l.id === id || l.parameter === id);
}
