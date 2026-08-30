'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { analyticsRegions } from '@/mock/mockAnalytics';
import { OceanLayerManager } from '@/lib/map/layerManager';
import { MapPin, Compass, ZoomIn, ZoomOut, RotateCcw, Target } from 'lucide-react';

export default function AnalyticsMap() {
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const layerManagerRef = useRef<OceanLayerManager>(new OceanLayerManager());

  const {
    analyticsRegion,
    analyticsPrimaryParam,
    selectedCoordinates,
    setSelectedCoordinates,
    selectedTimestamp
  } = useOrcaStore();

  const [zoomLevel, setZoomLevel] = useState<string>('5.2');

  const activeRegion =
    analyticsRegions.find((r) => r.id === analyticsRegion) || analyticsRegions[0];

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapElRef.current,
      style: {
        version: 8,
        sources: {
          'osm-basemap': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | Copernicus Marine'
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
      center: [activeRegion.centerLng, activeRegion.centerLat],
      zoom: activeRegion.zoom,
      minZoom: 3,
      maxZoom: 11
    });

    mapRef.current = map;

    map.on('load', () => {
      map.resize();

      // Add Copernicus SST layer
      const sstLayer = layerManagerRef.current.getLayer('copernicus-sst');
      if (sstLayer) {
        sstLayer.time = selectedTimestamp;
        sstLayer.opacity = 0.55;
        sstLayer.visible = analyticsPrimaryParam === 'sst';
        layerManagerRef.current.addLayer(map, sstLayer);
      }

      // Add Copernicus Chlorophyll layer
      const chlLayer = layerManagerRef.current.getLayer('copernicus-chl');
      if (chlLayer) {
        chlLayer.time = selectedTimestamp;
        chlLayer.opacity = 0.55;
        chlLayer.visible = analyticsPrimaryParam === 'chlorophyll';
        layerManagerRef.current.addLayer(map, chlLayer);
      }
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

  // Update raster layer visibility when analyticsPrimaryParam changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    layerManagerRef.current.setVisibility(map, 'copernicus-sst', analyticsPrimaryParam === 'sst');
    layerManagerRef.current.setVisibility(map, 'copernicus-chl', analyticsPrimaryParam === 'chlorophyll');
  }, [analyticsPrimaryParam]);

  // Recenter when analyticsRegion changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.flyTo({
      center: [activeRegion.centerLng, activeRegion.centerLat],
      zoom: activeRegion.zoom,
      essential: true
    });
  }, [analyticsRegion]);

  // Update marker position
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const coords = selectedCoordinates || { lat: activeRegion.centerLat, lng: activeRegion.centerLng };

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'w-4 h-4 rounded-full border-2 border-white bg-orca-blue shadow-md ring-4 ring-orca-blue/30 flex items-center justify-center';
      el.innerHTML = '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([coords.lng, coords.lat]);
    }
  }, [selectedCoordinates, analyticsRegion]);

  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-2 font-sans select-none shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            SPATIAL SAMPLING VIEWPORT
          </h3>
        </div>
        <span className="text-[9px] font-mono text-muted-orca uppercase">
          {activeRegion.name}
        </span>
      </div>

      <div className="relative flex-1 min-h-[220px] rounded border border-border-orca overflow-hidden">
        <div ref={mapElRef} className="w-full h-full cursor-crosshair" />

        {/* Map Controls */}
        <div className="absolute right-2 top-2 z-10 flex flex-col space-y-1 bg-white/90 border border-border-orca p-0.5 rounded shadow-xs">
          <button
            onClick={() => mapRef.current?.zoomIn()}
            className="p-1 hover:bg-secondary-surface text-primary-text rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => mapRef.current?.zoomOut()}
            className="p-1 hover:bg-secondary-surface text-primary-text rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <button
            onClick={() =>
              mapRef.current?.flyTo({
                center: [activeRegion.centerLng, activeRegion.centerLat],
                zoom: activeRegion.zoom
              })
            }
            className="p-1 hover:bg-secondary-surface text-primary-text rounded"
            title="Recenter"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Bottom Coordinates Bar */}
        <div className="absolute bottom-2 left-2 z-10 bg-ocean-navy/90 text-white font-mono text-[8px] px-2 py-0.5 rounded flex items-center space-x-2 border border-[#1b3459]">
          <span>ZOOM: {zoomLevel}</span>
          <span>·</span>
          <span>
            COORD:{' '}
            {selectedCoordinates
              ? `${selectedCoordinates.lat.toFixed(2)}°N, ${selectedCoordinates.lng.toFixed(2)}°E`
              : `${activeRegion.centerLat.toFixed(2)}°N, ${activeRegion.centerLng.toFixed(2)}°E`}
          </span>
        </div>
      </div>
    </div>
  );
}
