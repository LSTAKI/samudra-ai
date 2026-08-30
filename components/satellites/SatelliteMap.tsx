'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockSatelliteObservations } from '@/mock/mockSatellites';
import { SatelliteObservation } from '@/types/satellite';
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Satellite,
  Layers,
  Radio
} from 'lucide-react';

export default function SatelliteMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const {
    selectedLatitude,
    selectedLongitude,
    selectedCoordinates,
    setSelectedCoordinates,
    selectedPlatformId,
    selectedSensorCategory,
    selectedProductFilter,
    selectedObservationId,
    setSelectedObservationId,
    satelliteLayerVisibility
  } = useOrcaStore();

  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<string>('5.2');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter observations based on selected platform, sensor, and product
  const filteredObservations = mockSatelliteObservations.filter((obs) => {
    if (selectedPlatformId && obs.platformId !== selectedPlatformId) return false;
    if (selectedSensorCategory !== 'ALL' && obs.sensorCategory !== selectedSensorCategory) return false;
    if (selectedProductFilter !== 'ALL' && obs.productCategory !== selectedProductFilter) return false;
    return true;
  });

  const selectedObservation = mockSatelliteObservations.find((o) => o.id === selectedObservationId) || filteredObservations[0];

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
            attribution: '© OpenStreetMap contributors | ISRO MOSDAC | ESA Copernicus'
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
      minZoom: 3,
      maxZoom: 12
    });

    mapRef.current = map;

    map.on('load', () => {
      map.resize();

      // 1. Add Footprints GeoJSON Source
      map.addSource('satellite-footprints', {
        type: 'geojson',
        data: buildFootprintsGeoJson(filteredObservations)
      });

      map.addLayer({
        id: 'footprints-fill',
        type: 'fill',
        source: 'satellite-footprints',
        paint: {
          'fill-color': [
            'match',
            ['get', 'platformId'],
            'oceansat-3', '#06B6D4',
            'sentinel-3a', '#2563EB',
            'noaa-20', '#F59E0B',
            'insat-3ds', '#8B5CF6',
            '#007BFF'
          ],
          'fill-opacity': 0.25
        }
      });

      map.addLayer({
        id: 'footprints-line',
        type: 'line',
        source: 'satellite-footprints',
        paint: {
          'line-color': [
            'match',
            ['get', 'platformId'],
            'oceansat-3', '#06B6D4',
            'sentinel-3a', '#2563EB',
            'noaa-20', '#F59E0B',
            'insat-3ds', '#8B5CF6',
            '#007BFF'
          ],
          'line-width': 1.5,
          'line-opacity': 0.85
        }
      });

      // 2. Add Ground Tracks GeoJSON Source
      map.addSource('satellite-tracks', {
        type: 'geojson',
        data: buildTracksGeoJson(filteredObservations)
      });

      map.addLayer({
        id: 'tracks-line',
        type: 'line',
        source: 'satellite-tracks',
        paint: {
          'line-color': [
            'match',
            ['get', 'platformId'],
            'oceansat-3', '#06B6D4',
            'sentinel-3a', '#2563EB',
            'noaa-20', '#F59E0B',
            'insat-3ds', '#8B5CF6',
            '#007BFF'
          ],
          'line-width': 2,
          'line-dasharray': [3, 2],
          'line-opacity': 0.75
        }
      });

      // 3. Add Observation Points GeoJSON Source
      map.addSource('satellite-points', {
        type: 'geojson',
        data: buildPointsGeoJson(filteredObservations)
      });

      map.addLayer({
        id: 'points-circle',
        type: 'circle',
        source: 'satellite-points',
        paint: {
          'circle-radius': 6,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2.5,
          'circle-stroke-color': '#0645AD'
        }
      });

      // Click on footprints or points to select observation
      map.on('click', 'footprints-fill', (e) => {
        if (e.features && e.features.length > 0) {
          const obsId = e.features[0].properties?.id;
          if (obsId) {
            setSelectedObservationId(obsId);
            const found = mockSatelliteObservations.find((o) => o.id === obsId);
            if (found) {
              setSelectedCoordinates({ lat: found.latitude, lng: found.longitude });
            }
          }
        }
      });

      map.on('click', 'points-circle', (e) => {
        if (e.features && e.features.length > 0) {
          const obsId = e.features[0].properties?.id;
          if (obsId) {
            setSelectedObservationId(obsId);
            const found = mockSatelliteObservations.find((o) => o.id === obsId);
            if (found) {
              setSelectedCoordinates({ lat: found.latitude, lng: found.longitude });
            }
          }
        }
      });

      map.on('mouseenter', 'points-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'points-circle', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('mouseenter', 'footprints-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'footprints-fill', () => {
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
      // If clicking elsewhere on the map, update selected coordinates
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

  // Update GeoJSON sources when filters change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const footprintsSource = map.getSource('satellite-footprints') as maplibregl.GeoJSONSource;
    if (footprintsSource) {
      footprintsSource.setData(buildFootprintsGeoJson(filteredObservations));
    }

    const tracksSource = map.getSource('satellite-tracks') as maplibregl.GeoJSONSource;
    if (tracksSource) {
      tracksSource.setData(buildTracksGeoJson(filteredObservations));
    }

    const pointsSource = map.getSource('satellite-points') as maplibregl.GeoJSONSource;
    if (pointsSource) {
      pointsSource.setData(buildPointsGeoJson(filteredObservations));
    }
  }, [selectedPlatformId, selectedSensorCategory, selectedProductFilter]);

  // Update visibility layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('footprints-fill')) {
      map.setLayoutProperty('footprints-fill', 'visibility', satelliteLayerVisibility.footprints ? 'visible' : 'none');
      map.setLayoutProperty('footprints-line', 'visibility', satelliteLayerVisibility.footprints ? 'visible' : 'none');
    }
    if (map.getLayer('tracks-line')) {
      map.setLayoutProperty('tracks-line', 'visibility', satelliteLayerVisibility.tracks ? 'visible' : 'none');
    }
    if (map.getLayer('points-circle')) {
      map.setLayoutProperty('points-circle', 'visibility', satelliteLayerVisibility.points ? 'visible' : 'none');
    }
  }, [satelliteLayerVisibility]);

  // Update selected marker position
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const activeObs = mockSatelliteObservations.find((o) => o.id === selectedObservationId);
    const targetCoords = activeObs
      ? { lat: activeObs.latitude, lng: activeObs.longitude }
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
      el.className = 'w-5 h-5 rounded-full border-2 border-white bg-orca-blue shadow-lg ring-4 ring-orca-blue/30 animate-pulse flex items-center justify-center';
      el.innerHTML = '<div class="w-1.5 h-1.5 bg-white rounded-full"></div>';
      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([targetCoords.lng, targetCoords.lat])
        .addTo(map);
    } else {
      markerRef.current.setLngLat([targetCoords.lng, targetCoords.lat]);
    }
  }, [selectedObservationId, selectedCoordinates]);

  // Recenter map on selected observation
  const handleRecenter = () => {
    if (!mapRef.current) return;
    const activeObs = mockSatelliteObservations.find((o) => o.id === selectedObservationId);
    if (activeObs) {
      mapRef.current.flyTo({ center: [activeObs.longitude, activeObs.latitude], zoom: 6, essential: true });
    } else {
      const lat = selectedLatitude ?? 12.0;
      const lng = selectedLongitude ?? 78.5;
      mapRef.current.flyTo({ center: [lng, lat], zoom: 6, essential: true });
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
              <Satellite className="w-3.5 h-3.5 text-orca-blue" />
              {selectedObservation ? selectedObservation.platformName : 'SATELLITE OBSERVATORY'}
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded flex items-center gap-1">
              DEMO ORBITS
            </span>
          </div>
          <div className="text-[10px] text-secondary-text font-mono mt-0.5 flex items-center justify-between gap-3">
            <span>
              {selectedObservation
                ? `${selectedObservation.sensorName} · ${selectedObservation.orbitPass}`
                : 'Indian Ocean Swaths'}
            </span>
            <span className="text-muted-orca font-semibold">
              {selectedObservation ? selectedObservation.timeOfDay : '24h Swaths'}
            </span>
          </div>
        </div>
      </div>

      {/* MapLibre Container */}
      <div ref={mapElRef} className="w-full h-full cursor-crosshair" />

      {/* Map Control Buttons (Top Right) */}
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
          title="Recenter on Satellite Observation"
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
            <span className="text-muted-orca">SELECTED NADIR:</span>
            <span className="text-[#ffdf9e]">
              {selectedCoordinates.lat}° N, {selectedCoordinates.lng}° E
            </span>
          </div>
        )}
      </div>

      {/* Map Legend Overlay (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 border border-border-orca p-2 rounded shadow-sm w-44 text-xs font-sans pointer-events-auto backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border-orca pb-1 mb-1 font-mono text-[9px]">
          <span className="font-bold text-primary-text uppercase">PLATFORM SWATHS</span>
          <span className="text-amber-600 font-bold">DEMO</span>
        </div>

        <div className="space-y-1 font-mono text-[8px]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#06B6D4]/40 border border-[#06B6D4]"></span>
            <span className="text-primary-text font-bold">Oceansat-3 (EOS-06)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#2563EB]/40 border border-[#2563EB]"></span>
            <span className="text-primary-text font-bold">Sentinel-3A</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#F59E0B]/40 border border-[#F59E0B]"></span>
            <span className="text-primary-text font-bold">NOAA-20 (JPSS-1)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#8B5CF6]/40 border border-[#8B5CF6]"></span>
            <span className="text-primary-text font-bold">INSAT-3DS Disk</span>
          </div>
          <div className="pt-1 border-t border-border-orca/60 flex items-center space-x-1.5 text-muted-orca">
            <span className="w-3 border-t-2 border-dashed border-[#0645AD]"></span>
            <span>Ground Track</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers to construct GeoJSON objects
function buildFootprintsGeoJson(observations: SatelliteObservation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: observations
      .filter((o) => o.footprintGeoJson)
      .map((o) => ({
        type: 'Feature' as const,
        properties: {
          id: o.id,
          platformId: o.platformId,
          platformName: o.platformName,
          sensorName: o.sensorName,
          productName: o.productName
        },
        geometry: o.footprintGeoJson!
      }))
  };
}

function buildTracksGeoJson(observations: SatelliteObservation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: observations
      .filter((o) => o.groundTrackGeoJson)
      .map((o) => ({
        type: 'Feature' as const,
        properties: {
          id: o.id,
          platformId: o.platformId,
          platformName: o.platformName
        },
        geometry: o.groundTrackGeoJson!
      }))
  };
}

function buildPointsGeoJson(observations: SatelliteObservation[]) {
  return {
    type: 'FeatureCollection' as const,
    features: observations.map((o) => ({
      type: 'Feature' as const,
      properties: {
        id: o.id,
        platformId: o.platformId,
        platformName: o.platformName
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [o.longitude, o.latitude]
      }
    }))
  };
}
