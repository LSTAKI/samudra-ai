import { CopernicusLayerConfig, getWmtsBaseUrl, getWmtsLayerPath } from './copernicusWmts';

export interface FeatureInfoResponse {
  latitude: number;
  longitude: number;
  value: number | string;
  unit: string;
  variable: string;
  timestamp: string;
  source: string;
}

/**
 * Helper to determine tile size based on the tileMatrixSet identifier suffix.
 */
export function getTileSize(tileMatrixSet: string): number {
  if (tileMatrixSet.includes('@2x')) return 512;
  if (tileMatrixSet.includes('@3x')) return 768;
  return 256;
}

/**
 * Converts geographic coordinates (lat, lng) at a given zoom level
 * to standard Web Mercator EPSG:3857 tile col/row and pixel offsets (i, j).
 */
export function latLngToTilePixel(
  lat: number,
  lng: number,
  zoom: number,
  tileMatrixSet: string = 'EPSG:3857'
): { tileX: number; tileY: number; i: number; j: number } {
  // Convert longitude to 0..1 scale
  const x = (lng + 180) / 360;
  
  // Convert latitude to 0..1 scale using mercator projection
  const latRad = (lat * Math.PI) / 180;
  const y = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2;
  
  // Number of tiles at this zoom level
  const numTiles = Math.pow(2, zoom);
  
  // Continuous tile coords
  const tileXCont = x * numTiles;
  const tileYCont = y * numTiles;
  
  // Integer tile columns/rows
  const tileX = Math.floor(tileXCont);
  const tileY = Math.floor(tileYCont);
  
  // Determine pixel size inside the tile (e.g. 512 for @2x, 256 default)
  const tileSize = getTileSize(tileMatrixSet);
  
  // Pixel coordinates inside the tile
  const i = Math.floor((tileXCont - tileX) * tileSize);
  const j = Math.floor((tileYCont - tileY) * tileSize);
  
  return { tileX, tileY, i, j };
}

/**
 * Constructs the standard OGC WMTS GetFeatureInfo URL.
 */
export const buildWmtsGetFeatureInfoUrl = (
  config: CopernicusLayerConfig,
  lat: number,
  lng: number,
  zoom: number
): string => {
  const baseUrl = getWmtsBaseUrl();
  const layerPath = getWmtsLayerPath(config);
  const { tileX, tileY, i, j } = latLngToTilePixel(lat, lng, zoom, config.tileMatrixSet);

  const params = new URLSearchParams({
    SERVICE: 'WMTS',
    VERSION: '1.0.0',
    REQUEST: 'GetFeatureInfo',
    LAYER: layerPath,
    STYLE: config.style || 'cmap:thermal',
    FORMAT: config.format,
    INFOFORMAT: 'application/json', // Can be text/xml or text/html
    TILEMATRIXSET: config.tileMatrixSet,
    TILEMATRIX: String(zoom),
    TILEROW: String(tileY),
    TILECOL: String(tileX),
    I: String(i),
    J: String(j)
  });

  let url = `${baseUrl}?${params.toString()}`;
  if (config.time) {
    url += `&TIME=${config.time}`;
  }

  return url;
};

/**
 * Executes GetFeatureInfo.
 * Attempts a direct browser request since the Copernicus server supports CORS.
 * If the request fails (due to network, blocker, or CORS policies), it throws a detailed error
 * indicating that the ORCA backend proxy must handle the request.
 */
export async function fetchCopernicusFeatureInfo(
  config: CopernicusLayerConfig,
  lat: number,
  lng: number,
  zoom: number
): Promise<FeatureInfoResponse> {
  const infoUrl = buildWmtsGetFeatureInfoUrl(config, lat, lng, zoom);
  console.log(`[Copernicus GIS] Generated GetFeatureInfo Endpoint: ${infoUrl}`);

  try {
    const res = await fetch(infoUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText || 'Unknown error'}`);
    }
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) {
      throw new Error("No feature values returned at this geographic location.");
    }

    const value = feature.properties?.[config.variable];
    if (value === undefined) {
      throw new Error(`Variable '${config.variable}' not found in feature properties.`);
    }

    let displayValue: number | string = value;
    let displayUnit = config.unit;

    // Convert Kelvin to Celsius for analysed_sst values
    if (config.variable === 'analysed_sst' && typeof value === 'number') {
      displayValue = Number((value - 273.15).toFixed(2));
      displayUnit = '°C';
    }

    return {
      latitude: feature.properties?.lat ?? lat,
      longitude: feature.properties?.lon ?? lng,
      value: displayValue,
      unit: displayUnit,
      variable: config.variable,
      timestamp: feature.properties?.time ?? config.time ?? '',
      source: 'Copernicus Marine'
    };
  } catch (err: any) {
    throw new Error(
      `GetFeatureInfo request failed. Action deferred to ORCA Backend proxy to avoid client CORS/authentication issues. Target URL: ${infoUrl}. Error details: ${err.message}`
    );
  }
}
