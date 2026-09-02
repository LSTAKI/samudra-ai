'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useOrcaStore } from '@/stores/useOrcaStore';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Satellite,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function SatelliteMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  const {
    selectedLatitude,
    selectedLongitude,
    selectedCoordinates,
    setSelectedCoordinates,
    selectedPlatformId
  } = useOrcaStore();

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<string>('5.2');

  // Initialize MapLibre
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const initialLat = selectedLatitude ?? 12.0;
    const initialLng = selectedLongitude ?? 78.5;

    const map = new maplibregl.Map({
      container: mapElRef.current,
      style: {
        version: 8,
        sources: {
          'osm-basemap': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | ISRO / Copernicus Earth Observation'
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
      zoom: 5.2,
      minZoom: 2,
      maxZoom: 10
    });

    mapRef.current = map;

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

  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [78.5, 12.0], zoom: 5.2, essential: true });
  };

  return (
    <div ref={mapContainerRef} className="relative w-full h-full bg-[#e5e9ec] overflow-hidden select-none">
      {/* MapLibre Canvas */}
      <div ref={mapElRef} className="w-full h-full" />

      {/* Honest Status Overlay */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur border border-border-orca p-3 rounded shadow-sm font-mono text-[9px] space-y-1.5 max-w-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-primary-text font-bold uppercase">
            <Satellite className="w-3.5 h-3.5 text-orca-blue" />
            <span>Earth Observation Tracking</span>
          </div>
          <span className="text-[8px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded">
            RAW FEEDS UNAVAILABLE
          </span>
        </div>
        <p className="text-secondary-text text-[8.5px] leading-relaxed">
          Direct Level-1/Level-2 satellite telemetry feeds from MOSDAC / ISRO are currently unavailable. Verified mission payload metadata and orbital specifications are available in the Platform Catalog.
        </p>
      </div>

      {/* Bottom Coordinates & Scale */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur border border-border-orca px-2.5 py-1 rounded shadow-xs font-mono text-[9px] text-secondary-text flex items-center space-x-3">
        <span>CURSOR: {cursorCoords ? `${cursorCoords.lat.toFixed(3)}°N, ${cursorCoords.lng.toFixed(3)}°E` : '--'}</span>
        <span>·</span>
        <span>ZOOM: {zoomLevel}</span>
      </div>

      {/* Controls */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col space-y-1">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2 bg-white hover:bg-secondary-surface text-primary-text border border-border-orca rounded shadow-xs transition-colors cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2 bg-white hover:bg-secondary-surface text-primary-text border border-border-orca rounded shadow-xs transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-white hover:bg-secondary-surface text-primary-text border border-border-orca rounded shadow-xs transition-colors cursor-pointer"
          title="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
