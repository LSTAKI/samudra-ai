import { CopernicusLayerConfig, getWmtsBaseUrl, getWmtsLayerPath } from './copernicusWmts';

/**
 * Constructs the Copernicus Marine WMTS GetLegend request URL.
 * It targets the OGC WMTS GetLegend operation, ensuring the SAME layer and style
 * properties are used as in the GetTile request.
 */
export const buildCopernicusLegendUrl = (
  config: CopernicusLayerConfig,
  format: 'svg' | 'json' = 'svg'
): string => {
  const baseUrl = getWmtsBaseUrl();
  const layerPath = getWmtsLayerPath(config);
  
  const formatMime = format === 'svg' ? 'image/svg+xml' : 'application/json';

  const params = new URLSearchParams({
    SERVICE: 'WMTS',
    VERSION: '1.0.0',
    REQUEST: 'GetLegend',
    LAYER: layerPath,
    STYLE: config.style || 'cmap:thermal',
    FORMAT: formatMime
  });

  return `${baseUrl}?${params.toString()}`;
};

