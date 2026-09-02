'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { OceanLayerManager } from '@/lib/map/layerManager';
import {
  defaultSstConfig,
  defaultWaveConfig,
  defaultSeaLevelConfig,
  defaultChlorophyllConfig
} from '@/lib/map/copernicusWmts';
import { buildCopernicusLegendUrl } from '@/lib/map/copernicusLegend';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Layers,
  Box,
  Globe2,
  AlertCircle
} from 'lucide-react';

export default function OceanView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const layerManagerRef = useRef<OceanLayerManager>(new OceanLayerManager());

  const {
    selectedLatitude,
    selectedLongitude,
    selectedCoordinates,
    setSelectedCoordinates,
    selectedParameter,
    selectedDepth,
    viewMode,
    setViewMode,
    selectedTimestamp,
    layerOpacities
  } = useOrcaStore();

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<string>('5.5');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const initialLat = selectedLatitude ?? 9.9312;
    const initialLng = selectedLongitude ?? 76.2673;

    const map = new maplibregl.Map({
      container: mapElRef.current,
      style: {
        version: 8,
        sources: {
          'osm-basemap': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | Copernicus Marine Service'
          }
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-basemap',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      center: [initialLng, initialLat],
      zoom: 5.5,
      minZoom: 3,
      maxZoom: 12
    });

    mapRef.current = map;

    map.on('load', () => {
      map.resize();

      // Add Copernicus raster layers via OceanLayerManager
      const targetLayers = [
        layerManagerRef.current.getLayer('copernicus-sst'),
        layerManagerRef.current.getLayer('copernicus-wave'),
        layerManagerRef.current.getLayer('copernicus-sla'),
        layerManagerRef.current.getLayer('copernicus-chl')
      ];

      targetLayers.forEach((l) => {
        if (!l) return;
        l.time = selectedTimestamp;
        l.opacity = layerOpacities[l.id] ?? 0.70;
        l.visible = (l.id === 'copernicus-sst' && selectedParameter === 'sst') ||
                    (l.id === 'copernicus-wave' && selectedParameter === 'waveHeight') ||
                    (l.id === 'copernicus-sla' && selectedParameter === 'seaLevel') ||
                    (l.id === 'copernicus-chl' && selectedParameter === 'chlorophyll');
        layerManagerRef.current.addLayer(map, l);
      });
    });

    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.lngLat.lat.toFixed(4)),
        lng: Number(e.lngLat.lng.toFixed(4))
      });
    });

    map.on('zoom', () => {
      setZoomLevel(map.getZoom().toFixed(1));
    });

    map.on('click', (e) => {
      setSelectedCoordinates({
        lat: Number(e.lngLat.lat.toFixed(4)),
        lng: Number(e.lngLat.lng.toFixed(4))
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update layer visibility when selectedParameter changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    layerManagerRef.current.setVisibility(map, 'copernicus-sst', selectedParameter === 'sst');
    layerManagerRef.current.setVisibility(map, 'copernicus-wave', selectedParameter === 'waveHeight');
    layerManagerRef.current.setVisibility(map, 'copernicus-sla', selectedParameter === 'seaLevel');
    layerManagerRef.current.setVisibility(map, 'copernicus-chl', selectedParameter === 'chlorophyll');
  }, [selectedParameter]);

  // Update timestamps when selectedTimestamp changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    layerManagerRef.current.updateTime(map, 'copernicus-sst', selectedTimestamp);
    layerManagerRef.current.updateTime(map, 'copernicus-wave', selectedTimestamp);
    layerManagerRef.current.updateTime(map, 'copernicus-sla', selectedTimestamp);
    layerManagerRef.current.updateTime(map, 'copernicus-chl', selectedTimestamp);
  }, [selectedTimestamp]);

  // Update marker position
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedCoordinates) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 rounded-full border-2 border-white bg-orca-blue shadow-lg animate-pulse';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([selectedCoordinates.lng, selectedCoordinates.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([selectedCoordinates.lng, selectedCoordinates.lat]);
    }
  }, [selectedCoordinates]);

  // Recenter map when external coordinate applied
  const handleRecenter = () => {
    if (!mapRef.current) return;
    const lat = selectedLatitude ?? 9.9312;
    const lng = selectedLongitude ?? 76.2673;
    mapRef.current.flyTo({ center: [lng, lat], zoom: 6, essential: true });
  };

  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [78.5, 12.0], zoom: 5.2, essential: true });
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Header and legend dynamic getters
  const getHeaderInfo = () => {
    switch (selectedParameter) {
      case 'waveHeight':
        return { title: 'SIGNIFICANT WAVE HEIGHT', source: 'GLOBAL WAV 0.083° (Hm0)', unit: 'm' };
      case 'seaLevel':
        return { title: 'SEA LEVEL ANOMALY', source: 'SEALEVEL DUACS L4', unit: 'm' };
      case 'chlorophyll':
        return { title: 'CHLOROPHYLL-a CONCENTRATION', source: 'GLOBAL BGC L4 GAP-FREE', unit: 'mg/m³' };
      case 'currents':
        return { title: 'OCEAN SURFACE CURRENTS', source: 'GLOBAL PHY 0.083° (AVAILABLE SOON)', unit: 'm/s' };
      case 'salinity':
        return { title: 'SEA SURFACE SALINITY', source: 'AQUARIUS SATELLITE (DEMO)', unit: 'psu' };
      case 'sst':
      default:
        return { title: 'SEA SURFACE TEMPERATURE', source: 'OSTIA L4 NRT', unit: '°C' };
    }
  };

  const getActiveLegendUrl = () => {
    switch (selectedParameter) {
      case 'waveHeight':
        return buildCopernicusLegendUrl({ ...defaultWaveConfig, time: selectedTimestamp }, 'svg');
      case 'seaLevel':
        return buildCopernicusLegendUrl({ ...defaultSeaLevelConfig, time: selectedTimestamp }, 'svg');
      case 'chlorophyll':
        return buildCopernicusLegendUrl({ ...defaultChlorophyllConfig, time: selectedTimestamp }, 'svg');
      case 'sst':
      default:
        return buildCopernicusLegendUrl({ ...defaultSstConfig, time: selectedTimestamp }, 'svg');
    }
  };

  const headerInfo = getHeaderInfo();
  const activeLegendUrl = getActiveLegendUrl();
  const isRealLayer = ['sst', 'waveHeight', 'seaLevel', 'chlorophyll'].includes(selectedParameter);

  return (
    <div
      ref={mapContainerRef}
      className="flex-1 relative flex flex-col h-full w-full bg-[#0a1b33] overflow-hidden select-none"
    >
      {/* 2D / 3D Mode Toggle Header Bar */}
      <div className="absolute top-3 right-14 z-20 flex items-center bg-white/95 border border-border-orca rounded-md p-0.5 shadow-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setViewMode('2d')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
            viewMode === '2d'
              ? 'bg-ocean-navy text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text hover:bg-surface-secondary'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>2D MAP</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('3d')}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono font-bold transition-all ${
            viewMode === '3d'
              ? 'bg-ocean-navy text-white shadow-xs'
              : 'text-secondary-text hover:text-primary-text hover:bg-surface-secondary'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D OCEAN</span>
        </button>
      </div>

      {/* Top Left Scientific Info Card */}
      <div className="absolute top-3 left-3 z-10 pointer-events-auto">
        <div className="bg-white/95 border border-border-orca rounded-md px-3 py-2 shadow-sm font-sans select-none backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-primary-text font-mono">
              {headerInfo.title}
            </span>
            <span className="text-[9px] font-mono font-bold text-success-orca flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-orca inline-block"></span>
              COPERNICUS MARINE
            </span>
          </div>
          <div className="text-[10px] text-secondary-text font-mono mt-0.5 flex items-center justify-between gap-3">
            <span>{headerInfo.source}</span>
            <span className="text-muted-orca font-semibold">
              DEPTH: {selectedDepth === 0 ? 'SURFACE' : `${selectedDepth}m`}
            </span>
          </div>
        </div>
      </div>

      {/* View Mode: 2D Map vs 3D Ocean Model */}
      {viewMode === '2d' ? (
        <div ref={mapElRef} className="w-full h-full cursor-crosshair" />
      ) : (
        /* Controlled 3D Ocean Model Preview (Extensible Deck.gl Bathymetry Shell) */
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#07162c] text-white p-6 relative overflow-hidden font-sans">
          {/* Wireframe Isometric Depth Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#0645AD_1px,transparent_1px)] [background-size:24px_24px]" />
          
          <div className="max-w-md z-10 space-y-4 text-center bg-ocean-navy/80 border border-border-orca/40 p-6 rounded-lg backdrop-blur-md">
            <div className="flex justify-center">
              <Box className="w-10 h-10 text-orca-blue animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-orca-blue font-mono tracking-widest uppercase">
                VOLUMETRIC VISUALIZATION
              </span>
              <h3 className="text-base font-bold uppercase font-mono tracking-wider">
                3D OCEAN BATHYMETRIC MODEL
              </h3>
              <p className="text-xs text-muted-orca leading-relaxed">
                Volumetric bathymetry mesh and depth-resolved current vector streamlines are being prepared. Surface parameter layer ({headerInfo.title}) is active in 2D Map viewport.
              </p>
            </div>

            <div className="bg-[#040e1c] border border-[#1b3459] rounded p-3 font-mono text-[10px] text-left space-y-1">
              <div className="flex justify-between">
                <span className="text-secondary-text">STATUS:</span>
                <span className="text-amber-500 font-bold">● PREPARING DATASET</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">ENGINE:</span>
                <span className="text-primary-text">Deck.gl TerrainLayer + GEBCO Bathymetry</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-text">TARGET DEPTH:</span>
                <span className="text-primary-text">{selectedDepth === 0 ? '0m (Surface)' : `${selectedDepth}m`}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('2d')}
              className="bg-orca-blue hover:bg-blue-600 text-white px-4 py-1.5 rounded text-xs font-mono font-bold tracking-wider uppercase transition-colors"
            >
              SWITCH TO 2D MAP VIEW
            </button>
          </div>
        </div>
      )}

      {/* Map Control Buttons */}
      <div className="absolute right-3 top-3 z-10 flex flex-col space-y-1 bg-white/95 border border-border-orca p-1 rounded shadow-sm backdrop-blur-sm">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-1.5 hover:bg-surface-secondary text-primary-text rounded transition-all focus:outline-none"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-1.5 hover:bg-surface-secondary text-primary-text rounded transition-all focus:outline-none"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleRecenter}
          className="p-1.5 hover:bg-surface-secondary text-primary-text rounded transition-all focus:outline-none"
          title="Recenter on Selection"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 hover:bg-surface-secondary text-primary-text rounded transition-all focus:outline-none"
          title="Reset Indian Ocean View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-surface-secondary text-primary-text rounded border-t border-border-orca transition-all focus:outline-none"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Coordinates Status Bar (Bottom of Map) */}
      <div className="absolute bottom-3 left-3 z-10 bg-ocean-navy/95 text-white text-[9px] font-mono px-2.5 py-1 rounded shadow flex items-center space-x-3 border border-[#1b3459] backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-muted-orca" />
          <span>CURSOR:</span>
          <span className="text-[#a4c2f4]">
            {cursorCoords ? `${cursorCoords.lat}° N, ${cursorCoords.lng}° E` : '--° N, --° E'}
          </span>
        </div>
        <div>
          <span>ZOOM:</span>
          <span className="text-[#a4c2f4]">{zoomLevel}</span>
        </div>
        {selectedCoordinates && (
          <div className="border-l border-[#1b3459] pl-3 flex items-center gap-1">
            <span className="text-muted-orca">SELECTED:</span>
            <span className="text-[#ffdf9e]">
              {selectedCoordinates.lat}° N, {selectedCoordinates.lng}° E
            </span>
          </div>
        )}
      </div>

      {/* Compact Scientific Legend Overlay (Bottom Right Corner) */}
      {viewMode === '2d' && (
        <div className="absolute bottom-3 right-3 z-10 bg-white/95 border border-border-orca p-2 rounded shadow-sm w-44 text-xs font-sans pointer-events-auto backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border-orca pb-1 mb-1 font-mono text-[9px]">
            <span className="font-bold text-primary-text uppercase truncate mr-1">
              {headerInfo.title}
            </span>
            <span className="text-muted-orca font-bold shrink-0">{headerInfo.unit}</span>
          </div>

          {isRealLayer ? (
            <div className="space-y-1">
              <div className="flex justify-center bg-secondary-surface p-1 rounded border border-border-orca/40 select-none">
                <img
                  src={activeLegendUrl}
                  alt={`${headerInfo.title} Scale Legend`}
                  onError={(e) => {
                    console.warn('Failed to load Copernicus WMTS legend graphic');
                  }}
                  className="max-h-[90px] w-auto object-contain"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="h-2 w-full rounded mb-1 bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-300 to-red-600"></div>
              <div className="flex justify-between text-[8px] text-secondary-text font-mono font-semibold">
                <span>MIN</span>
                <span>MID</span>
                <span>MAX</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
