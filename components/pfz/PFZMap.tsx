'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockPFZZones, pfzRegionPresets } from '@/mock/mockPFZ';
import { OceanLayerManager } from '@/lib/map/layerManager';
import { PFZZone } from '@/types/pfz';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Target,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function PFZMap() {
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
    selectedPFZZoneId,
    setSelectedPFZZoneId,
    selectedPFZRegion,
    pfzActiveRaster,
    selectedTimestamp
  } = useOrcaStore();

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<string>('5.8');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeZone =
    mockPFZZones.find((z) => z.id === selectedPFZZoneId) || mockPFZZones[0];
  const activeRegion =
    pfzRegionPresets.find((r) => r.id === selectedPFZRegion) || pfzRegionPresets[0];

  // Initialize MapLibre
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const initialLat = activeZone ? activeZone.latitude : 9.8;
    const initialLng = activeZone ? activeZone.longitude : 75.8;

    const map = new maplibregl.Map({
      container: mapElRef.current,
      style: {
        version: 8,
        sources: {
          'osm-basemap': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | Copernicus Marine Service | ORCA PFZ'
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
      zoom: 6.2,
      minZoom: 3,
      maxZoom: 12
    });

    mapRef.current = map;

    map.on('load', () => {
      map.resize();

      // 1. Add background Copernicus Chlorophyll & SST layers via OceanLayerManager
      const chlLayer = layerManagerRef.current.getLayer('copernicus-chl');
      if (chlLayer) {
        chlLayer.time = selectedTimestamp;
        chlLayer.opacity = 0.55;
        chlLayer.visible = pfzActiveRaster === 'chlorophyll';
        layerManagerRef.current.addLayer(map, chlLayer);
      }

      const sstLayer = layerManagerRef.current.getLayer('copernicus-sst');
      if (sstLayer) {
        sstLayer.time = selectedTimestamp;
        sstLayer.opacity = 0.55;
        sstLayer.visible = pfzActiveRaster === 'sst';
        layerManagerRef.current.addLayer(map, sstLayer);
      }

      // 2. Add PFZ Candidate Zones GeoJSON Source
      map.addSource('pfz-zones', {
        type: 'geojson',
        data: buildZonesGeoJson(mockPFZZones)
      });

      // Fill Layer
      map.addLayer({
        id: 'pfz-zones-fill',
        type: 'fill',
        source: 'pfz-zones',
        paint: {
          'fill-color': [
            'match',
            ['get', 'classification'],
            'HIGH', '#16834B',
            'MODERATE', '#D97706',
            'LOW', '#64748B',
            '#0645AD'
          ],
          'fill-opacity': 0.35
        }
      });

      // Outline Layer
      map.addLayer({
        id: 'pfz-zones-outline',
        type: 'line',
        source: 'pfz-zones',
        paint: {
          'line-color': [
            'match',
            ['get', 'classification'],
            'HIGH', '#16834B',
            'MODERATE', '#D97706',
            'LOW', '#64748B',
            '#0645AD'
          ],
          'line-width': 2.5
        }
      });

      // Center Points Layer
      map.addSource('pfz-centers', {
        type: 'geojson',
        data: buildCentersGeoJson(mockPFZZones)
      });

      map.addLayer({
        id: 'pfz-centers-circle',
        type: 'circle',
        source: 'pfz-centers',
        paint: {
          'circle-radius': 7,
          'circle-color': [
            'match',
            ['get', 'classification'],
            'HIGH', '#16834B',
            'MODERATE', '#D97706',
            'LOW', '#64748B',
            '#0645AD'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Click to select PFZ zone
      map.on('click', 'pfz-zones-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const zoneId = e.features[0].properties?.id;
          if (zoneId) {
            setSelectedPFZZoneId(zoneId);
            const found = mockPFZZones.find((z) => z.id === zoneId);
            if (found) {
              setSelectedCoordinates({ lat: found.latitude, lng: found.longitude });
            }
          }
        }
      });

      map.on('click', 'pfz-centers-circle', (e) => {
        if (e.features && e.features.length > 0) {
          const zoneId = e.features[0].properties?.id;
          if (zoneId) {
            setSelectedPFZZoneId(zoneId);
            const found = mockPFZZones.find((z) => z.id === zoneId);
            if (found) {
              setSelectedCoordinates({ lat: found.latitude, lng: found.longitude });
            }
          }
        }
      });

      map.on('mouseenter', 'pfz-zones-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'pfz-zones-fill', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'pfz-centers-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'pfz-centers-circle', () => {
        map.getCanvas().style.cursor = '';
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

  // Update raster visibility when pfzActiveRaster changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    layerManagerRef.current.setVisibility(map, 'copernicus-chl', pfzActiveRaster === 'chlorophyll');
    layerManagerRef.current.setVisibility(map, 'copernicus-sst', pfzActiveRaster === 'sst');
  }, [pfzActiveRaster]);

  // Recenter when selectedPFZRegion changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const preset = pfzRegionPresets.find((p) => p.id === selectedPFZRegion);
    if (preset) {
      map.flyTo({ center: [preset.centerLng, preset.centerLat], zoom: preset.zoom, essential: true });
    }
  }, [selectedPFZRegion]);

  // Update marker position for active zone
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const targetCoords = activeZone
      ? { lat: activeZone.latitude, lng: activeZone.longitude }
      : selectedCoordinates;

    if (!targetCoords) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      return;
    }

    if (!markerRef.current) {
      const el = document.createElement('div');
      el.className = 'w-5 h-5 rounded-full border-2 border-white bg-[#16834B] shadow-lg ring-4 ring-[#16834B]/30 animate-pulse flex items-center justify-center';
      el.innerHTML = '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([targetCoords.lng, targetCoords.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([targetCoords.lng, targetCoords.lat]);
    }
  }, [selectedPFZZoneId, selectedCoordinates]);

  // Recenter map on active zone
  const handleRecenter = () => {
    if (!mapRef.current) return;
    if (activeZone) {
      mapRef.current.flyTo({ center: [activeZone.longitude, activeZone.latitude], zoom: 7.2, essential: true });
    }
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

  return (
    <div
      ref={mapContainerRef}
      className="flex-1 relative flex flex-col h-full w-full bg-[#0a1b33] overflow-hidden select-none"
    >
      {/* Top Left Scientific Info Card */}
      <div className="absolute top-3 left-3 z-10 pointer-events-auto">
        <div className="bg-white/95 border border-border-orca rounded-md px-3 py-2 shadow-sm font-sans select-none backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-primary-text font-mono flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-orca-blue" />
              {activeZone ? activeZone.name : 'POTENTIAL FISHING ZONE ANALYZER'}
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded">
              DEMO PFZ CANDIDATE
            </span>
          </div>
          <div className="text-[10px] text-secondary-text font-mono mt-0.5 flex items-center justify-between gap-3">
            <span>
              {activeZone ? `${activeZone.sector} · Score ${activeZone.score}/100` : activeRegion.name}
            </span>
            <span className="text-muted-orca font-semibold">
              RASTER: {pfzActiveRaster.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* MapLibre Container */}
      <div ref={mapElRef} className="w-full h-full cursor-crosshair" />

      {/* Map Controls */}
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
          title="Recenter on PFZ Zone"
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

      {/* PFZ Candidate Legend Overlay (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 border border-border-orca p-2 rounded shadow-sm w-44 text-xs font-sans pointer-events-auto backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border-orca pb-1 mb-1 font-mono text-[9px]">
          <span className="font-bold text-primary-text uppercase">PFZ CANDIDATES</span>
          <span className="text-amber-600 font-bold">DEMO</span>
        </div>

        <div className="space-y-1 font-mono text-[8px]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#16834B]/40 border border-[#16834B]"></span>
            <span className="text-primary-text font-bold">HIGH CANDIDATE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#D97706]/40 border border-[#D97706]"></span>
            <span className="text-primary-text font-bold">MODERATE CANDIDATE</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#64748B]/40 border border-[#64748B]"></span>
            <span className="text-primary-text font-bold">LOW CANDIDATE</span>
          </div>
          <div className="pt-1 border-t border-border-orca/60 text-[8px] text-muted-orca flex items-center justify-between">
            <span>RASTER:</span>
            <span className="text-primary-text font-bold">
              {pfzActiveRaster === 'chlorophyll' ? 'Copernicus Chl-a' : pfzActiveRaster === 'sst' ? 'Copernicus SST' : 'Basemap Only'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers
function buildZonesGeoJson(zones: PFZZone[]) {
  return {
    type: 'FeatureCollection' as const,
    features: zones.map((z) => ({
      type: 'Feature' as const,
      properties: {
        id: z.id,
        name: z.name,
        classification: z.classification,
        score: z.score
      },
      geometry: z.geometry
    }))
  };
}

function buildCentersGeoJson(zones: PFZZone[]) {
  return {
    type: 'FeatureCollection' as const,
    features: zones.map((z) => ({
      type: 'Feature' as const,
      properties: {
        id: z.id,
        classification: z.classification,
        score: z.score
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [z.longitude, z.latitude]
      }
    }))
  };
}
