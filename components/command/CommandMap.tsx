'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockOperationalEvents, mockDemoVessels } from '@/mock/mockCommand';
import { mockPFZZones, mockIMBLBoundary, mockIMBLWarningBuffer, mockEEZBoundary } from '@/mock/mockPFZ';
import { OceanLayerManager } from '@/lib/map/layerManager';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Maximize2,
  Minimize2,
  Shield,
  Layers,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CommandMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const eventMarkersRef = useRef<maplibregl.Marker[]>([]);
  const vesselMarkersRef = useRef<maplibregl.Marker[]>([]);
  const layerManagerRef = useRef<OceanLayerManager>(new OceanLayerManager());

  const {
    selectedOperationalEventId,
    setSelectedOperationalEventId,
    selectedCoordinates,
    setSelectedCoordinates,
    commandLayerVisibility,
    setCommandLayerVisibility,
    selectedTimestamp
  } = useOrcaStore();

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<string>('5.5');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeEvent =
    mockOperationalEvents.find((e) => e.id === selectedOperationalEventId) ||
    mockOperationalEvents[0];

  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const initialLat = activeEvent ? activeEvent.latitude : 9.8;
    const initialLng = activeEvent ? activeEvent.longitude : 76.5;

    const map = new maplibregl.Map({
      container: mapElRef.current,
      style: {
        version: 8,
        sources: {
          'osm-basemap': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | Copernicus Marine | ORCA Command'
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
      zoom: 5.8,
      minZoom: 3,
      maxZoom: 12
    });

    mapRef.current = map;

    map.on('load', () => {
      map.resize();

      // 1. Add background Copernicus Waves or SST
      const waveLayer = layerManagerRef.current.getLayer('copernicus-wave');
      if (waveLayer) {
        waveLayer.time = selectedTimestamp;
        waveLayer.opacity = 0.4;
        waveLayer.visible = true;
        layerManagerRef.current.addLayer(map, waveLayer);
      }

      // 2. Add IMBL & EEZ Boundaries
      map.addSource('command-boundaries', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: { name: 'IMBL Boundary', type: 'imbl' },
              geometry: {
                type: 'LineString',
                coordinates: mockIMBLBoundary.map((c) => [c[1], c[0]])
              }
            },
            {
              type: 'Feature',
              properties: { name: 'IMBL Warning Buffer', type: 'buffer' },
              geometry: {
                type: 'LineString',
                coordinates: mockIMBLWarningBuffer.map((c) => [c[1], c[0]])
              }
            },
            {
              type: 'Feature',
              properties: { name: 'Indian EEZ Approximation', type: 'eez' },
              geometry: {
                type: 'LineString',
                coordinates: mockEEZBoundary.map((c) => [c[1], c[0]])
              }
            }
          ]
        }
      });

      map.addLayer({
        id: 'command-boundaries-line',
        type: 'line',
        source: 'command-boundaries',
        paint: {
          'line-color': [
            'match',
            ['get', 'type'],
            'imbl', '#DC2626',
            'buffer', '#D97706',
            'eez', '#2563EB',
            '#64748B'
          ],
          'line-width': 2,
          'line-dasharray': [3, 2]
        }
      });

      // 3. Add PFZ Candidate Polygons
      map.addSource('command-pfz', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: mockPFZZones.map((z) => ({
            type: 'Feature',
            properties: { id: z.id, name: z.name },
            geometry: z.geometry
          }))
        }
      });

      map.addLayer({
        id: 'command-pfz-fill',
        type: 'fill',
        source: 'command-pfz',
        paint: {
          'fill-color': '#16834B',
          'fill-opacity': 0.2
        }
      });

      map.addLayer({
        id: 'command-pfz-line',
        type: 'line',
        source: 'command-pfz',
        paint: {
          'line-color': '#16834B',
          'line-width': 1.5
        }
      });

      // 4. Add Demo Vessel Tracks
      map.addSource('vessel-tracks', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: mockDemoVessels.map((v) => ({
            type: 'Feature',
            properties: { id: v.id, name: v.name },
            geometry: {
              type: 'LineString',
              coordinates: v.track
            }
          }))
        }
      });

      map.addLayer({
        id: 'vessel-tracks-line',
        type: 'line',
        source: 'vessel-tracks',
        paint: {
          'line-color': '#0645AD',
          'line-width': 2,
          'line-opacity': 0.7
        }
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

  // Update Event Markers on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clean old markers
    eventMarkersRef.current.forEach((m) => m.remove());
    eventMarkersRef.current = [];

    if (!commandLayerVisibility.events) return;

    mockOperationalEvents.forEach((ev) => {
      const isSelected = selectedOperationalEventId === ev.id;
      const el = document.createElement('div');
      el.className = `cursor-pointer transition-transform ${isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'}`;

      let sevColor = '#64748B';
      if (ev.severity === 'CRITICAL') sevColor = '#DC2626';
      else if (ev.severity === 'HIGH') sevColor = '#D97706';
      else if (ev.severity === 'MEDIUM') sevColor = '#EAB308';
      else if (ev.severity === 'LOW') sevColor = '#2563EB';

      el.innerHTML = `
        <div style="background-color: ${sevColor};" class="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white ${
        isSelected ? 'ring-4 ring-orange-500/50 animate-pulse' : ''
      }">
          <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
      `;

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedOperationalEventId(ev.id);
        setSelectedCoordinates({ lat: ev.latitude, lng: ev.longitude });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([ev.longitude, ev.latitude])
        .addTo(map);

      eventMarkersRef.current.push(marker);
    });
  }, [selectedOperationalEventId, commandLayerVisibility.events]);

  // Update Vessel Markers on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    vesselMarkersRef.current.forEach((m) => m.remove());
    vesselMarkersRef.current = [];

    if (!commandLayerVisibility.vessels) return;

    mockDemoVessels.forEach((v) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group flex flex-col items-center z-10';
      el.innerHTML = `
        <div style="transform: rotate(${v.heading}deg);" class="w-4 h-4 rounded-full bg-[#071d3d] border border-white shadow-xs flex items-center justify-center text-white">
          <svg class="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([v.longitude, v.latitude])
        .addTo(map);

      vesselMarkersRef.current.push(marker);
    });
  }, [commandLayerVisibility.vessels]);

  // Update layer visibility in MapLibre
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('command-boundaries-line')) {
      map.setLayoutProperty(
        'command-boundaries-line',
        'visibility',
        commandLayerVisibility.boundaries ? 'visible' : 'none'
      );
    }

    if (map.getLayer('command-pfz-fill')) {
      map.setLayoutProperty(
        'command-pfz-fill',
        'visibility',
        commandLayerVisibility.pfz ? 'visible' : 'none'
      );
      map.setLayoutProperty(
        'command-pfz-line',
        'visibility',
        commandLayerVisibility.pfz ? 'visible' : 'none'
      );
    }

    if (map.getLayer('vessel-tracks-line')) {
      map.setLayoutProperty(
        'vessel-tracks-line',
        'visibility',
        commandLayerVisibility.vessels ? 'visible' : 'none'
      );
    }
  }, [commandLayerVisibility]);

  // Recenter on active event
  const handleRecenter = () => {
    if (!mapRef.current) return;
    if (activeEvent) {
      mapRef.current.flyTo({
        center: [activeEvent.longitude, activeEvent.latitude],
        zoom: 7.0,
        essential: true
      });
    }
  };

  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [78.5, 12.0], zoom: 5.5, essential: true });
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
      {/* Top Left Active Incident Card */}
      <div className="absolute top-3 left-3 z-10 pointer-events-auto">
        <div className="bg-white/95 border border-border-orca rounded-md px-3 py-2 shadow-sm font-sans select-none backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-primary-text font-mono flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-orca-blue" />
              {activeEvent ? activeEvent.title : 'MARITIME COMMAND OPERATIONAL VIEW'}
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded">
              DEMO OPERATIONAL VIEW
            </span>
          </div>
          <div className="text-[10px] text-secondary-text font-mono mt-0.5 flex items-center justify-between gap-3">
            <span>
              {activeEvent ? `${activeEvent.locationName} · ${activeEvent.timestamp}` : 'North Indian Ocean Theater'}
            </span>
            <span className="text-muted-orca font-semibold">
              SEVERITY: {activeEvent?.severity}
            </span>
          </div>
        </div>
      </div>

      {/* MapLibre Canvas Container */}
      <div ref={mapElRef} className="w-full h-full cursor-crosshair" />

      {/* Map Controls */}
      <div className="absolute right-3 top-3 z-10 flex flex-col space-y-1 bg-white/95 border border-border-orca p-1 rounded shadow-sm backdrop-blur-sm">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="p-1.5 hover:bg-secondary-surface text-primary-text rounded transition-all focus:outline-none"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="p-1.5 hover:bg-secondary-surface text-primary-text rounded transition-all focus:outline-none"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleRecenter}
          className="p-1.5 hover:bg-secondary-surface text-primary-text rounded transition-all focus:outline-none"
          title="Recenter on Selected Event"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 hover:bg-secondary-surface text-primary-text rounded transition-all focus:outline-none"
          title="Reset Theater View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-secondary-surface text-primary-text rounded border-t border-border-orca transition-all focus:outline-none"
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

      {/* Operational Layers Legend & Toggles (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 border border-border-orca p-2 rounded shadow-sm w-48 text-xs font-sans pointer-events-auto backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border-orca pb-1 mb-1 font-mono text-[9px]">
          <span className="font-bold text-primary-text uppercase">OPERATIONAL LAYERS</span>
          <span className="text-amber-600 font-bold">DEMO</span>
        </div>

        <div className="space-y-1 font-mono text-[8px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626] border border-white"></span>
              <span className="text-primary-text font-bold">EVENTS / ALERTS</span>
            </div>
            <button
              type="button"
              onClick={() => setCommandLayerVisibility('events', !commandLayerVisibility.events)}
              className="text-muted-orca hover:text-primary-text"
            >
              {commandLayerVisibility.events ? <Eye className="w-3 h-3 text-orca-blue" /> : <EyeOff className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#071d3d] border border-white"></span>
              <span className="text-primary-text font-bold">DEMO VESSELS</span>
            </div>
            <button
              type="button"
              onClick={() => setCommandLayerVisibility('vessels', !commandLayerVisibility.vessels)}
              className="text-muted-orca hover:text-primary-text"
            >
              {commandLayerVisibility.vessels ? <Eye className="w-3 h-3 text-orca-blue" /> : <EyeOff className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-1 border-b-2 border-dashed border-[#DC2626]"></span>
              <span className="text-primary-text font-bold">IMBL / BOUNDARY</span>
            </div>
            <button
              type="button"
              onClick={() => setCommandLayerVisibility('boundaries', !commandLayerVisibility.boundaries)}
              className="text-muted-orca hover:text-primary-text"
            >
              {commandLayerVisibility.boundaries ? <Eye className="w-3 h-3 text-orca-blue" /> : <EyeOff className="w-3 h-3" />}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#16834B]/30 border border-[#16834B]"></span>
              <span className="text-primary-text font-bold">PFZ CANDIDATES</span>
            </div>
            <button
              type="button"
              onClick={() => setCommandLayerVisibility('pfz', !commandLayerVisibility.pfz)}
              className="text-muted-orca hover:text-primary-text"
            >
              {commandLayerVisibility.pfz ? <Eye className="w-3 h-3 text-orca-blue" /> : <EyeOff className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
