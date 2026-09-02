'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchPFZZones, PFZZone } from '@/lib/api/pfz';
import { pfzRegionPresets, PFZRegionPreset } from '@/lib/map/pfzPresets';
import { OceanLayerManager } from '@/lib/map/layerManager';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Target,
  Layers,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

function buildZonesGeoJson(zones: PFZZone[]) {
  return {
    type: 'FeatureCollection' as const,
    features: zones.map((zone) => {
      const radiusDeg = 0.12;
      const numPoints = 24;
      const ring: [number, number][] = [];
      for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * 2 * Math.PI;
        ring.push([
          zone.longitude + radiusDeg * Math.cos(theta),
          zone.latitude + radiusDeg * Math.sin(theta)
        ]);
      }
      return {
        type: 'Feature' as const,
        id: zone.id,
        properties: {
          id: zone.id,
          name: zone.name,
          score: zone.score,
          classification: zone.classification,
          sst: zone.sst_c,
          chlorophyll: zone.chlorophyll_mg_m3,
          waveHeight: zone.wave_height_m
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [ring]
        }
      };
    })
  };
}

function buildCentersGeoJson(zones: PFZZone[]) {
  return {
    type: 'FeatureCollection' as const,
    features: zones.map((zone) => ({
      type: 'Feature' as const,
      id: zone.id,
      properties: {
        id: zone.id,
        name: zone.name,
        score: zone.score,
        classification: zone.classification
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [zone.longitude, zone.latitude]
      }
    }))
  };
}

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

  const [zones, setZones] = useState<PFZZone[]>([]);
  const [loadingZones, setLoadingZones] = useState(false);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<string>('6.2');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeRegion =
    pfzRegionPresets.find((r) => r.id === selectedPFZRegion) || pfzRegionPresets[0];

  const activeZone =
    zones.find((z) => z.id === selectedPFZZoneId) || zones[0];

  // Fetch real PFZ zones from backend
  useEffect(() => {
    let mounted = true;
    const loadZones = async () => {
      setLoadingZones(true);
      try {
        const res = await fetchPFZZones(
          selectedLatitude || activeRegion.centerLat,
          selectedLongitude || activeRegion.centerLng,
          activeRegion.harbor
        );
        if (mounted && res.zones && res.zones.length > 0) {
          setZones(res.zones);
          if (!selectedPFZZoneId && res.zones.length > 0) {
            setSelectedPFZZoneId(res.zones[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load PFZ zones:', err);
      } finally {
        if (mounted) setLoadingZones(false);
      }
    };

    loadZones();
    return () => {
      mounted = false;
    };
  }, [selectedPFZRegion, selectedLatitude, selectedLongitude]);

  // Update map source when zones change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || zones.length === 0) return;

    const zonesSrc = map.getSource('pfz-zones') as maplibregl.GeoJSONSource;
    if (zonesSrc) {
      zonesSrc.setData(buildZonesGeoJson(zones));
    }

    const centersSrc = map.getSource('pfz-centers') as maplibregl.GeoJSONSource;
    if (centersSrc) {
      centersSrc.setData(buildCentersGeoJson(zones));
    }
  }, [zones]);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const initialLat = activeRegion ? activeRegion.centerLat : 9.8;
    const initialLng = activeRegion ? activeRegion.centerLng : 75.8;

    const map = new maplibregl.Map({
      container: mapElRef.current,
      style: {
        version: 8,
        sources: {
          'osm-basemap': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors | Copernicus Marine Service | ORCA PFZ Engine'
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

      // 1. Add background Copernicus Chlorophyll & SST layers
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
        data: buildZonesGeoJson(zones)
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
        data: buildCentersGeoJson(zones)
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

      // Click handler
      const handleZoneClick = (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
        if (e.features && e.features.length > 0) {
          const zoneId = e.features[0].properties?.id;
          if (zoneId) {
            setSelectedPFZZoneId(zoneId);
            const found = zones.find((z) => z.id === zoneId);
            if (found) {
              setSelectedCoordinates({ lat: found.latitude, lng: found.longitude });
            }
          }
        }
      };

      map.on('click', 'pfz-zones-fill', handleZoneClick);
      map.on('click', 'pfz-centers-circle', handleZoneClick);

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

  // Update raster visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    layerManagerRef.current.setVisibility(map, 'copernicus-chl', pfzActiveRaster === 'chlorophyll');
    layerManagerRef.current.setVisibility(map, 'copernicus-sst', pfzActiveRaster === 'sst');
  }, [pfzActiveRaster]);

  // Recenter when preset changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const preset = pfzRegionPresets.find((p) => p.id === selectedPFZRegion);
    if (preset) {
      map.flyTo({ center: [preset.centerLng, preset.centerLat], zoom: 6.2, essential: true });
    }
  }, [selectedPFZRegion]);

  // Marker for active zone
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
  }, [selectedPFZZoneId, selectedCoordinates, activeZone]);

  const handleRecenter = () => {
    if (!mapRef.current) return;
    if (activeZone) {
      mapRef.current.flyTo({ center: [activeZone.longitude, activeZone.latitude], zoom: 7.2, essential: true });
    }
  };

  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [76.5, 9.8], zoom: 6.0, essential: true });
  };

  return (
    <div ref={mapContainerRef} className="relative w-full h-full bg-[#e5e9ec] overflow-hidden select-none">
      {/* MapLibre DOM */}
      <div ref={mapElRef} className="w-full h-full" />

      {/* Loading Overlay */}
      {loadingZones && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur border border-border-orca px-3 py-1.5 rounded shadow-sm flex items-center gap-2 font-mono text-[10px] text-orca-blue font-bold">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>COMPUTING DETERMINISTIC GRADIENTS...</span>
        </div>
      )}

      {/* Floating Status Badge */}
      <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur border border-border-orca p-2.5 rounded shadow-sm font-mono text-[9px] space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="font-bold text-primary-text uppercase">
            {activeRegion.name.split('/')[0]}
          </span>
          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1 py-0.2 rounded">
            v1.0-deterministic
          </span>
        </div>
        <div className="text-secondary-text flex items-center gap-2">
          <span>{zones.length} Candidate Zones</span>
          <span>·</span>
          <span>Source: Copernicus L4</span>
        </div>
      </div>

      {/* Bottom Coordinates & Scale */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur border border-border-orca px-2.5 py-1 rounded shadow-xs font-mono text-[9px] text-secondary-text flex items-center space-x-3">
        <span>CURSOR: {cursorCoords ? `${cursorCoords.lat.toFixed(3)}°N, ${cursorCoords.lng.toFixed(3)}°E` : '--'}</span>
        <span>·</span>
        <span>ZOOM: {zoomLevel}</span>
      </div>

      {/* Map Controls */}
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
          onClick={handleRecenter}
          className="p-2 bg-white hover:bg-secondary-surface text-orca-blue border border-border-orca rounded shadow-xs transition-colors cursor-pointer"
          title="Focus Selected Zone"
        >
          <Target className="w-3.5 h-3.5" />
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
