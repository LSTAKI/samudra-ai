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

// Default real Copernicus Marine SST layer configuration (OSTIA Product)
export const defaultSstConfig: CopernicusLayerConfig = {
  id: 'copernicus-sst',
  name: 'Sea Surface Temperature',
  productId: 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001',
  datasetId: 'METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2',
  variable: 'analysed_sst',
  unit: '°C',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'cmap:thermal',
  time: process.env.NEXT_PUBLIC_COPERNICUS_SST_TIME || '2026-08-28T00:00:00Z',
  opacity: 0.70,
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
  style: 'cmap:amp',
  time: '2026-08-28T00:00:00.000Z',
  opacity: 0.70,
  visible: false
};

// Verified Copernicus Marine Sea Level Anomaly Layer (SEALEVEL_GLO_PHY_L4_NRT_008_046)
export const defaultSeaLevelConfig: CopernicusLayerConfig = {
  id: 'copernicus-sla',
  name: 'Sea Level Anomaly',
  productId: 'SEALEVEL_GLO_PHY_L4_NRT_008_046',
  datasetId: 'cmems_obs-sl_glo_phy-ssh_nrt_allsat-l4-duacs-0.125deg_P1D_202506',
  variable: 'sla',
  unit: 'm',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'cmap:plasma',
  time: '2026-08-28T00:00:00.000Z',
  opacity: 0.70,
  visible: false
};

// Verified Copernicus Marine Chlorophyll-a Layer (OCEANCOLOUR_GLO_BGC_L4_NRT_009_102)
export const defaultChlorophyllConfig: CopernicusLayerConfig = {
  id: 'copernicus-chl',
  name: 'Chlorophyll-a Concentration',
  productId: 'OCEANCOLOUR_GLO_BGC_L4_NRT_009_102',
  datasetId: 'cmems_obs-oc_glo_bgc-plankton_nrt_l4-gapfree-multi-4km_P1D_202311',
  variable: 'CHL',
  unit: 'mg/m³',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'cmap:algae',
  time: '2026-08-28T00:00:00.000Z',
  opacity: 0.70,
  visible: false
};

// Architecture configuration for Ocean Currents (GLOBAL_ANALYSISFORECAST_PHY_001_024)
export const defaultCurrentsConfig: CopernicusLayerConfig = {
  id: 'copernicus-currents',
  name: 'Ocean Surface Currents',
  productId: 'GLOBAL_ANALYSISFORECAST_PHY_001_024',
  datasetId: 'cmems_mod_glo_phy-cur_anfc_0.083deg_P1D-m_202406',
  variable: 'uo', // uo (eastward) and vo (northward)
  unit: 'm/s',
  tileMatrixSet: 'EPSG:3857',
  format: 'image/png',
  style: 'cmap:balance',
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

// Build the MapLibre-compatible URL template containing {x}, {y}, {z} placeholders
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

  // MapLibre requires literal {z}, {y}, {x} tokens — do not URL-encode them into %7B..%7D
  let url = `${baseUrl}?${params.toString()}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;
  
  // Append dimensions if present
  if (config.time) {
    url += `&TIME=${config.time}`;
  }
  if (config.elevation !== undefined) {
    url += `&ELEVATION=${config.elevation}`;
  }

  return url;
};

// Build full query URL for a specific tile row/col/matrix
export const buildWmtsTileUrl = (
  config: CopernicusLayerConfig,
  z: number,
  x: number,
  y: number
): string => {
  const template = buildWmtsTileUrlTemplate(config);
  return template
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
};
