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

// Verified Copernicus Marine Sea Level Anomaly Layer (DUACS NRT)
export const defaultSeaLevelConfig: CopernicusLayerConfig = {
  id: 'copernicus-sla',
  name: 'Sea Level Anomaly',
  productId: 'SEALEVEL_GLO_PHY_L4_NRT_008_046',
  datasetId: 'cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.125deg_P1D_202506',
  variable: 'sla',
  unit: 'm',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'default',
  time: '2026-08-28T00:00:00.000Z',
  opacity: 0.70,
  visible: false
};

// Verified Copernicus Marine Chlorophyll-a Layer (BGC Plankton NRT L4 Gapfree)
export const defaultChlorophyllConfig: CopernicusLayerConfig = {
  id: 'copernicus-chl',
  name: 'Chlorophyll-a Concentration',
  productId: 'OCEANCOLOUR_GLO_BGC_L4_NRT_009_102',
  datasetId: 'cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D_202311',
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

  const url = `${baseUrl}?${query}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[ORCA WMTS DEBUG]', {
      id: config.id,
      product_id: config.productId,
      dataset_id: config.datasetId,
      variable: config.variable,
      layer: layerPath,
      time: config.time,
      tileMatrixSet: config.tileMatrixSet,
      style: config.style,
      url
    });
  }

  return url;
};
