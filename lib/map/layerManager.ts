import * as maplibregl from 'maplibre-gl';
import { OceanMapLayer, LayerStatus } from '@/types';
import {
  buildWmtsTileUrlTemplate,
  defaultSstConfig,
  defaultWaveConfig,
  defaultSeaLevelConfig,
  defaultChlorophyllConfig,
  defaultCurrentsConfig,
  CopernicusLayerConfig
} from './copernicusWmts';
import { buildCopernicusLegendUrl } from './copernicusLegend';

/**
 * Canonical default layers registry for Project ORCA Phase 2A
 * Powered by verified Copernicus Marine OGC WMTS datasets.
 */
export const defaultOceanLayers: OceanMapLayer[] = [
  {
    id: 'copernicus-sst',
    name: 'Sea Surface Temperature',
    source: 'COPERNICUS',
    type: 'wmts',
    productId: defaultSstConfig.productId,
    datasetId: defaultSstConfig.datasetId,
    variable: defaultSstConfig.variable,
    unit: defaultSstConfig.unit,
    temporalResolution: 'P1D (Daily)',
    spatialResolution: '0.05° (~5 km)',
    style: defaultSstConfig.style,
    visible: true,
    opacity: 0.70,
    zIndex: 10,
    time: defaultSstConfig.time || '2026-08-28T00:00:00Z',
    status: 'CONNECTED',
    legend: {
      url: buildCopernicusLegendUrl(defaultSstConfig, 'svg'),
      unit: '°C',
      title: 'SEA SURFACE TEMPERATURE',
      format: 'svg'
    }
  },
  {
    id: 'copernicus-wave',
    name: 'Significant Wave Height',
    source: 'COPERNICUS',
    type: 'wmts',
    productId: defaultWaveConfig.productId,
    datasetId: defaultWaveConfig.datasetId,
    variable: defaultWaveConfig.variable,
    unit: defaultWaveConfig.unit,
    temporalResolution: 'PT3H (3-Hourly)',
    spatialResolution: '0.083° (~9 km)',
    style: defaultWaveConfig.style,
    visible: false,
    opacity: 0.70,
    zIndex: 11,
    time: defaultWaveConfig.time || '2026-08-28T00:00:00.000Z',
    status: 'CONNECTED',
    legend: {
      url: buildCopernicusLegendUrl(defaultWaveConfig, 'svg'),
      unit: 'm',
      title: 'SIGNIFICANT WAVE HEIGHT',
      format: 'svg'
    }
  },
  {
    id: 'copernicus-sla',
    name: 'Sea Level Anomaly',
    source: 'COPERNICUS',
    type: 'wmts',
    productId: defaultSeaLevelConfig.productId,
    datasetId: defaultSeaLevelConfig.datasetId,
    variable: defaultSeaLevelConfig.variable,
    unit: defaultSeaLevelConfig.unit,
    temporalResolution: 'P1D (Daily)',
    spatialResolution: '0.125° (~14 km)',
    style: defaultSeaLevelConfig.style,
    visible: false,
    opacity: 0.70,
    zIndex: 12,
    time: defaultSeaLevelConfig.time || '2026-08-28T00:00:00.000Z',
    status: 'CONNECTED',
    legend: {
      url: buildCopernicusLegendUrl(defaultSeaLevelConfig, 'svg'),
      unit: 'm',
      title: 'SEA LEVEL ANOMALY',
      format: 'svg'
    }
  },
  {
    id: 'copernicus-chl',
    name: 'Chlorophyll-a Concentration',
    source: 'COPERNICUS',
    type: 'wmts',
    productId: defaultChlorophyllConfig.productId,
    datasetId: defaultChlorophyllConfig.datasetId,
    variable: defaultChlorophyllConfig.variable,
    unit: defaultChlorophyllConfig.unit,
    temporalResolution: 'P1D (Daily Gap-Free)',
    spatialResolution: '4 km (~0.04°)',
    style: defaultChlorophyllConfig.style,
    visible: false,
    opacity: 0.70,
    zIndex: 13,
    time: defaultChlorophyllConfig.time || '2026-08-28T00:00:00.000Z',
    status: 'CONNECTED',
    legend: {
      url: buildCopernicusLegendUrl(defaultChlorophyllConfig, 'svg'),
      unit: 'mg/m³',
      title: 'CHLOROPHYLL-A',
      format: 'svg'
    }
  },
  {
    id: 'copernicus-currents',
    name: 'Ocean Surface Currents',
    source: 'COPERNICUS',
    type: 'wmts',
    productId: defaultCurrentsConfig.productId,
    datasetId: defaultCurrentsConfig.datasetId,
    variable: 'uo, vo',
    unit: 'm/s',
    temporalResolution: 'P1D (Daily)',
    spatialResolution: '0.083° (~9 km)',
    style: 'cmap:balance',
    visible: false,
    opacity: 0.70,
    zIndex: 14,
    time: '2026-08-28T00:00:00.000Z',
    status: 'UNAVAILABLE' // Architecture ready, vector viz disabled
  }
];

/**
 * OceanLayerManager handles adding, removing, updating visibility, opacity,
 * and time-varying tile templates for multi-source oceanographic layers without recreating the MapLibre map.
 */
export class OceanLayerManager {
  private layers: Map<string, OceanMapLayer> = new Map();

  constructor(initialLayers: OceanMapLayer[] = defaultOceanLayers) {
    initialLayers.forEach((l) => this.layers.set(l.id, { ...l }));
  }

  public getLayer(layerId: string): OceanMapLayer | undefined {
    return this.layers.get(layerId);
  }

  public getAllLayers(): OceanMapLayer[] {
    return Array.from(this.layers.values());
  }

  public getLayersBySource(source: OceanMapLayer['source']): OceanMapLayer[] {
    return Array.from(this.layers.values()).filter((l) => l.source === source);
  }

  /**
   * Builds the Copernicus WMTS configuration object for any layer.
   */
  private getCopernicusConfig(layerConfig: OceanMapLayer): CopernicusLayerConfig {
    return {
      id: layerConfig.id,
      name: layerConfig.name,
      productId: layerConfig.productId || defaultSstConfig.productId,
      datasetId: layerConfig.datasetId || defaultSstConfig.datasetId,
      variable: layerConfig.variable,
      unit: layerConfig.unit,
      tileMatrixSet: 'EPSG:3857',
      format: 'image/png',
      style: layerConfig.style || 'default',
      time: layerConfig.time || defaultSstConfig.time,
      opacity: layerConfig.opacity,
      visible: layerConfig.visible
    };
  }

  /**
   * Adds an ocean layer to the map instance if not already present.
   * If beforeId is provided (e.g. the first symbol/label layer), the raster
   * is inserted below labels so place names and coastlines stay visible on top.
   */
  public addLayer(
    map: maplibregl.Map,
    layerConfig: OceanMapLayer,
    beforeId?: string
  ): void {
    this.layers.set(layerConfig.id, { ...layerConfig });

    if (!map || !map.isStyleLoaded()) return;

    const sourceId = `${layerConfig.id}-source`;
    const mapLayerId = `${layerConfig.id}-layer`;

    // 1. Copernicus WMTS Raster implementation
    if (layerConfig.source === 'COPERNICUS' && (layerConfig.type === 'wmts' || layerConfig.type === 'raster')) {
      // Do not add visualization if layer is architecture only
      if (layerConfig.status === 'UNAVAILABLE') {
        return;
      }

      const copernicusConfig = this.getCopernicusConfig(layerConfig);
      const tileUrl = buildWmtsTileUrlTemplate(copernicusConfig);

      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256
        });
      }

      if (!map.getLayer(mapLayerId)) {
        map.addLayer(
          {
            id: mapLayerId,
            type: 'raster',
            source: sourceId,
            paint: {
              'raster-opacity': layerConfig.opacity
            },
            layout: {
              visibility: layerConfig.visible ? 'visible' : 'none'
            }
          },
          beforeId
        );
      }
    }
  }

  /**
   * Removes a layer and its source from the map instance cleanly.
   */
  public removeLayer(map: maplibregl.Map, layerId: string): void {
    const mapLayerId = `${layerId}-layer`;
    const sourceId = `${layerId}-source`;

    if (map && map.isStyleLoaded()) {
      if (map.getLayer(mapLayerId)) {
        map.removeLayer(mapLayerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    }
    this.layers.delete(layerId);
  }

  /**
   * Updates visibility of an existing layer without reloading tiles.
   */
  public setVisibility(map: maplibregl.Map, layerId: string, visible: boolean): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.visible = visible;
    }
    const mapLayerId = `${layerId}-layer`;
    if (map && map.isStyleLoaded() && map.getLayer(mapLayerId)) {
      map.setLayoutProperty(mapLayerId, 'visibility', visible ? 'visible' : 'none');
    }
  }

  /**
   * Updates opacity of an existing raster layer dynamically.
   */
  public setOpacity(map: maplibregl.Map, layerId: string, opacity: number): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.opacity = opacity;
    }
    const mapLayerId = `${layerId}-layer`;
    if (map && map.isStyleLoaded() && map.getLayer(mapLayerId)) {
      map.setPaintProperty(mapLayerId, 'raster-opacity', opacity);
    }
  }

  /**
   * Reactively updates the timestamp of a time-varying tile layer.
   * Uses setTiles to update the tile URL in-place without destroying the map.
   */
  public updateTime(map: maplibregl.Map, layerId: string, time: string): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.time = time;
    }

    if (layer?.source === 'COPERNICUS' && layer.status !== 'UNAVAILABLE') {
      const sourceId = `${layerId}-source`;
      if (map && map.isStyleLoaded()) {
        const source = map.getSource(sourceId) as any;
        if (source && typeof source.setTiles === 'function') {
          const copernicusConfig = this.getCopernicusConfig(layer);
          copernicusConfig.time = time;
          const tileUrl = buildWmtsTileUrlTemplate(copernicusConfig);
          source.setTiles([tileUrl]);
        }
      }
    }
  }

  /**
   * Gets current status of a layer (CONNECTED, LOADING, ERROR, UNAVAILABLE, DEMO).
   */
  public getLayerStatus(layerId: string): LayerStatus {
    const layer = this.layers.get(layerId);
    return layer ? layer.status : 'UNAVAILABLE';
  }

  /**
   * Updates status of a layer in the registry.
   */
  public setLayerStatus(layerId: string, status: LayerStatus): void {
    const layer = this.layers.get(layerId);
    if (layer) {
      layer.status = status;
    }
  }
}
