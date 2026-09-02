export interface CopernicusLayerConfig {
  id: string;
  name: string;
  productId: string;
  datasetId: string;
  variable: string;
  unit: string;
  tileMatrixSet: string;
  format: string;
  style?: string;
  time?: string;
  elevation?: number;
  opacity: number;
  visible: boolean;
}

// Verified Copernicus Marine SST Layer (OSTIA Product)
export const defaultSstConfig: CopernicusLayerConfig = {
  id: 'copernicus-sst',
  name: 'Sea Surface Temperature (OSTIA)',
  productId: 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001',
  datasetId: 'METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2',
  variable: 'analysed_sst',
  unit: '°C',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'default',
  time: process.env.NEXT_PUBLIC_COPERNICUS_SST_TIME || '2026-08-28T00:00:00Z',
  opacity: 0.75,
  visible: true
};

// Verified Copernicus Marine Wave Height Layer (GLOBAL_ANALYSISFORECAST_WAV_001_027)
export const defaultWaveConfig: CopernicusLayerConfig = {
  id: 'copernicus-wave',
  name: 'Significant Wave Height',
  productId: 'GLOBAL_ANALYSISFORECAST_WAV_001_027',
  datasetId: 'cmems_mod_glo_wav_anfc_0.083deg_PT3H-i_202411',
  variable: 'VHM0',
  unit: 'm',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'default',
  time: '2026-08-28T00:00:00.000Z',
  opacity: 0.75,
  visible: false
};

// Verified Copernicus Marine Sea Level Anomaly Layer (DUACS Two-Sat)
export const defaultSeaLevelConfig: CopernicusLayerConfig = {
  id: 'copernicus-sla',
  name: 'Sea Level Anomaly',
  productId: 'SEALEVEL_GLO_PHY_CLIMATE_L4_MY_008_057',
  datasetId: 'c3s_obs-sl_glo_phy-ssh_my_twosat-l4-duacs-0.25deg_P1D_202411',
  variable: 'sla',
  unit: 'm',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'default',
  time: '2026-08-28T00:00:00.000Z',
  opacity: 0.70,
  visible: false
};

// Verified Copernicus Marine Chlorophyll-a Layer (BGC Plankton)
export const defaultChlorophyllConfig: CopernicusLayerConfig = {
  id: 'copernicus-chl',
  name: 'Chlorophyll-a Concentration',
  productId: 'OCEANCOLOUR_GLO_BGC_L3_MY_009_107',
  datasetId: 'c3s_obs-oc_glo_bgc-plankton_my_l3-multi-4km_P1D_202303',
  variable: 'CHL',
  unit: 'mg/m³',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'default',
  time: '2026-08-28T00:00:00.000Z',
  opacity: 0.75,
  visible: false
};

// Architecture configuration for Ocean Currents (GLOBAL_ANALYSISFORECAST_PHY_001_024)
export const defaultCurrentsConfig: CopernicusLayerConfig = {
  id: 'copernicus-currents',
  name: 'Ocean Surface Currents',
  productId: 'GLOBAL_ANALYSISFORECAST_PHY_001_024',
  datasetId: 'cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406',
  variable: 'uo',
  unit: 'm/s',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'default',
  time: '2026-08-28T00:00:00.000Z',
  opacity: 0.70,
  visible: false
};

// Base service URL
export const getWmtsBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_COPERNICUS_WMTS_URL || 'https://wmts.marine.copernicus.eu/teroWmts';
};

// Return standard layer path: <PRODUCT_ID>/<DATASET_ID>/<VARIABLE_ID>
export const getWmtsLayerPath = (config: CopernicusLayerConfig): string => {
  return `${config.productId}/${config.datasetId}/${config.variable}`;
};

// Build MapLibre-compatible URL template containing {x}, {y}, {z} placeholders
export const buildWmtsTileUrlTemplate = (config: CopernicusLayerConfig): string => {
  const baseUrl = getWmtsBaseUrl();
  const layerPath = getWmtsLayerPath(config);
  
  const params = new URLSearchParams({
    SERVICE: 'WMTS',
    VERSION: '1.0.0',
    REQUEST: 'GetTile',
    LAYER: layerPath,
    STYLE: config.style || 'default',
    FORMAT: config.format,
    TILEMATRIXSET: config.tileMatrixSet
  });

  if (config.time) {
    params.append('TIME', config.time);
  }

  const query = params.toString()
    .replace('%7Bx%7D', '{x}')
    .replace('%7By%7D', '{y}')
    .replace('%7Bz%7D', '{z}');

  return `${baseUrl}?${query}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;
};
