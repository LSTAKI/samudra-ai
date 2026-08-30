'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockLocations } from '@/mock/mockOcean';
import { mockPFZSectors, mockEEZBoundary, mockIMBLBoundary, mockIMBLWarningBuffer } from '@/mock/mockPFZ';
import {
  defaultSstConfig,
  defaultWaveConfig,
  defaultSeaLevelConfig,
  defaultChlorophyllConfig,
  defaultCurrentsConfig,
  buildWmtsTileUrlTemplate
} from '@/lib/map/copernicusWmts';
import { buildCopernicusLegendUrl } from '@/lib/map/copernicusLegend';
import { OceanLayerManager } from '@/lib/map/layerManager';
import { Maximize2, Minimize2, ZoomIn, ZoomOut, Compass, Info, AlertOctagon, HelpCircle } from 'lucide-react';



export default function MapComponent() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const layerManagerRef = useRef<OceanLayerManager>(new OceanLayerManager());
  
  const {
    activeMapLayers,
    selectedParameter,
    setSelectedCoordinates,
    selectedCoordinates,
    copernicusSstOpacity,
    layerOpacities,
    timelineIndex,
    timelineMode,
    selectedTimestamp,
    timelineFrameType,
    latestAvailableTime,
    fallbackTime,
    setLatestAvailableTime,
    setCopernicusTileStatus
  } = useOrcaStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(4.5);
  const [hoveredCoords, setHoveredCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [copernicusError, setCopernicusError] = useState<string | null>(null);
  const [jsonLegend, setJsonLegend] = useState<{
    variableName: string;
    unit: string;
    min: number;
    max: number;
  } | null>(null);

  const [webglSupported, setWebglSupported] = useState(true);

  // Fallback map click handlers for sandboxed environments without WebGL
  const handleFallbackMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lng = Number((60 + (x / rect.width) * 30).toFixed(4));
    const lat = Number((24 - (y / rect.height) * 20).toFixed(4));
    setSelectedCoordinates({ lat, lng });
  };

  const handleFallbackMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lng = Number((60 + (x / rect.width) * 30).toFixed(4));
    const lat = Number((24 - (y / rect.height) * 20).toFixed(4));
    setHoveredCoords({ lat, lng });
  };

  // Toggle Fullscreen helper
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Compute sstTime reactively based on store state and dynamic discovery
  const getSelectedTimestamp = (index: number, mode: 'daily' | 'monthly' | 'annual') => {
    const baseTimeStr = latestAvailableTime || fallbackTime || '2026-08-28T00:00:00Z';
    const baseDate = new Date(baseTimeStr);
    
    // Ticks: ['-72h', '-48h', '-24h', 'NOW', '+24h', '+48h']
    // Offset in days relative to 'NOW' (index 3)
    const offsets = [-3, -2, -1, 0, 1, 2];
    const offsetDays = offsets[index] !== undefined ? offsets[index] : 0;
    
    const targetDate = new Date(baseDate.getTime() + offsetDays * 24 * 60 * 60 * 1000);
    const limitDate = new Date(latestAvailableTime || fallbackTime);
    
    // Check if future or unavailable (never request future/unavailable timestamp)
    if (targetDate > limitDate) {
      return baseTimeStr;
    }
    
    return targetDate.toISOString().replace(/\.\d+Z$/, 'Z');
  };

  const sstTime = selectedTimestamp;

  // Clean scientific formatting for map header time
  const formatSstTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      const day = d.getUTCDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getUTCMonth()];
      const year = d.getUTCFullYear();
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const mins = String(d.getUTCMinutes()).padStart(2, '0');
      return `${day} ${month} ${year} · ${hours}:${mins} UTC`;
    } catch {
      return timeStr;
    }
  };

  // Header metadata based on currently active parameter
  const getHeaderInfo = () => {
    switch (selectedParameter) {
      case 'waveHeight':
        return {
          title: 'SIGNIFICANT WAVE HEIGHT',
          source: 'Global Wave · 0.083° (Hm0)',
          provider: 'COPERNICUS MARINE'
        };
      case 'seaLevel':
        return {
          title: 'SEA LEVEL ANOMALY',
          source: 'Global Sea Level · DUACS L4',
          provider: 'COPERNICUS MARINE'
        };
      case 'chlorophyll':
        return {
          title: 'CHLOROPHYLL-A CONCENTRATION',
          source: 'Global Ocean Colour · Gap-free L4',
          provider: 'COPERNICUS MARINE'
        };
      case 'currents':
        return {
          title: 'OCEAN SURFACE CURRENTS',
          source: 'Global Physics 0.083° · AVAILABLE SOON',
          provider: 'COPERNICUS MARINE'
        };
      case 'sst':
      default:
        return {
          title: 'SEA SURFACE TEMPERATURE',
          source: 'Arabian Sea · OSTIA L4',
          provider: 'COPERNICUS MARINE'
        };
    }
  };

  // Active Copernicus Legend URL
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

  const getActiveLegendUnit = () => {
    switch (selectedParameter) {
      case 'waveHeight':
        return 'm';
      case 'seaLevel':
        return 'm';
      case 'chlorophyll':
        return 'mg/m³';
      case 'currents':
        return 'm/s';
      case 'sst':
      default:
        return '°C';
    }
  };

  const headerInfo = getHeaderInfo();
  const activeLegendUrl = getActiveLegendUrl();
  const activeLegendUnit = getActiveLegendUnit();
  const isRealCopernicusLayerActive = ['sst', 'waveHeight', 'seaLevel', 'chlorophyll'].includes(selectedParameter);


  // Direct health check & dynamic metadata discovery on Copernicus service
  useEffect(() => {
    const checkCopernicusStatus = async () => {
      try {
        console.log('[Copernicus GIS] Executing health check and dynamic capabilities discovery...');
        const res = await fetch('https://wmts.marine.copernicus.eu/teroWmts?service=WMTS&version=1.0.0&request=GetCapabilities');
        if (!res.ok) {
          setCopernicusError(`HTTP Error ${res.status}: ${res.statusText || 'Service unavailable'}`);
          return;
        }
        
        const xmlText = await res.text();
        // Regex to parse <Default> time tag under the analysed_sst layer
        const sstSectionRegex = /<ows:Identifier>[^<]*analysed_sst<\/ows:Identifier>[\s\S]*?<Dimension>[\s\S]*?<Default>([^<]+)<\/Default>/;
        const match = xmlText.match(sstSectionRegex);
        if (match && match[1]) {
          const discoveredTime = match[1].trim();
          const cleanTime = discoveredTime.replace(/\.000Z$/, 'Z');
          if (cleanTime.startsWith('2026-')) {
            console.log('[Copernicus GIS] Dynamically discovered latest timestamp:', cleanTime);
            setLatestAvailableTime(cleanTime);
          } else {
            console.log('[Copernicus GIS] Discovered time', cleanTime, 'is outside current operational range; retaining verified 2026-08-28T00:00:00Z');
          }
        }
      } catch (err: any) {
        console.error('[Copernicus GIS] Health check failed:', err);
        setCopernicusError(err.message || 'CORS boundary restriction or Network connection failure.');
      }
    };

    checkCopernicusStatus();
  }, [setLatestAvailableTime]);

  // Load JSON legend dynamically from Copernicus GetLegend JSON endpoint
  useEffect(() => {
    const fetchLegendJson = async () => {
      try {
        const url = buildCopernicusLegendUrl(defaultSstConfig, 'json');
        console.log('[Copernicus GIS] Fetching JSON Legend metadata from:', url);
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.continuous) {
            setJsonLegend({
              variableName: data.continuous.variableName,
              unit: data.continuous.units,
              min: data.continuous.valueMin,
              max: data.continuous.valueMax
            });
            console.log('[Copernicus GIS] Successfully loaded JSON legend properties:', data.continuous);
          }
        }
      } catch (e) {
        console.warn('[Copernicus GIS] JSON legend fetch failed or was blocked by CORS, falling back to SVG:', e);
      }
    };

    fetchLegendJson();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapElRef.current) return;

    const hasWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    };

    if (!hasWebGL()) {
      console.warn('[Copernicus GIS] WebGL is not supported in this environment. Falling back to simulated map grid.');
      setWebglSupported(false);
      return;
    }

    // Log actual pixel dimensions before constructing the map
    const el = mapElRef.current;
    console.log('[Copernicus GIS] Map container dimensions:', el.offsetWidth, 'x', el.offsetHeight);
    if (el.offsetWidth === 0 || el.offsetHeight === 0) {
      console.error('[Copernicus GIS] Map container has zero dimensions — map will not render. Check CSS height chain.');
    }

    // Inline style object — avoids external style JSON fetch which can fail silently
    // and prevent the map.on('load') callback from firing.
    // Uses OSM raster tiles as a universally-accessible basemap.
    const inlineStyle: maplibregl.StyleSpecification = {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors'
        }
      },
      layers: [
        {
          id: 'osm-basemap',
          type: 'raster',
          source: 'osm-tiles',
          paint: { 'raster-opacity': 1 }
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapElRef.current,
      style: inlineStyle,
      center: [79.0, 10.0], // Indian Ocean / India
      zoom: 4.5,
      minZoom: 3,
      maxZoom: 12,
      attributionControl: false
    });

    mapRef.current = map;

    // Force a resize after construction to fix any 0-size calculation
    setTimeout(() => { map.resize(); }, 0);


    // Monitor for ALL MapLibre errors
    map.on('error', (e) => {
      const msg = (e as any).message || (e as any).error?.message || JSON.stringify(e);
      console.error('[Copernicus GIS] MapLibre error:', msg, e);
      if (msg.includes('wmts.marine.copernicus.eu') || msg.includes('teroWmts') || msg.includes('403') || msg.includes('401') || msg.includes('copernicus')) {
        setCopernicusError('CORS/Authentication policy boundary restriction from Copernicus Marine.');
        layerManagerRef.current.setLayerStatus('copernicus-sst', 'ERROR');
        setCopernicusTileStatus('ERROR');
      }
    });

    // Monitor for Copernicus tile source loading
    map.on('sourcedata', (e) => {
      if (e.sourceId === 'copernicus-sst-source' && e.isSourceLoaded) {
        layerManagerRef.current.setLayerStatus('copernicus-sst', 'CONNECTED');
        setCopernicusTileStatus('CONNECTED');
        setCopernicusError(null);
      }
    });




    map.on('load', () => {
      // Resize to ensure MapLibre has the correct canvas dimensions
      map.resize();
      console.log('[Copernicus GIS] Map loaded. Canvas size after resize:', map.getCanvas().width, 'x', map.getCanvas().height);

      // Find the first symbol/label layer in base style so labels render ON TOP of our raster layer
      const layers = map.getStyle().layers;
      let firstLabelId: string | undefined = undefined;
      if (layers) {
        for (const layer of layers) {
          if (layer.type === 'symbol' || layer.id.includes('label') || layer.id.includes('place') || layer.id.includes('poi')) {
            firstLabelId = layer.id;
            break;
          }
        }
      }

      // 1. Add All Real Copernicus Raster Layers via OceanLayerManager
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
        l.visible = (l.id === 'copernicus-sst' && activeMapLayers['sst'] && selectedParameter === 'sst') ||
                    (l.id === 'copernicus-wave' && activeMapLayers['waveHeight'] && selectedParameter === 'waveHeight') ||
                    (l.id === 'copernicus-sla' && activeMapLayers['seaLevel'] && selectedParameter === 'seaLevel') ||
                    (l.id === 'copernicus-chl' && activeMapLayers['chlorophyll'] && selectedParameter === 'chlorophyll');
        layerManagerRef.current.addLayer(map, l, firstLabelId);
        console.log(`[Copernicus GIS] Loaded layer ${l.id} via OceanLayerManager.`);
      });


      // 2. Add EEZ Boundary
      map.addSource('eez-boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [mockEEZBoundary.map(coord => [coord[1], coord[0]])]
          },
          properties: {}
        }
      });

      map.addLayer({
        id: 'eez-layer',
        type: 'line',
        source: 'eez-boundary',
        paint: {
          'line-color': '#0645AD',
          'line-width': 1.5,
          'line-dasharray': [4, 4]
        },
        layout: {
          visibility: activeMapLayers['eez'] ? 'visible' : 'none'
        }
      });

      // 3. Add IMBL
      map.addSource('imbl-boundary', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: mockIMBLBoundary.map(coord => [coord[1], coord[0]])
          },
          properties: {}
        }
      });

      map.addLayer({
        id: 'imbl-layer',
        type: 'line',
        source: 'imbl-boundary',
        paint: {
          'line-color': '#C62828',
          'line-width': 2
        },
        layout: {
          visibility: activeMapLayers['imbl'] ? 'visible' : 'none'
        }
      });

      // 4. Add IMBL Buffer
      map.addSource('imbl-buffer', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: mockIMBLWarningBuffer.map(coord => [coord[1], coord[0]])
          },
          properties: {}
        }
      });

      map.addLayer({
        id: 'imbl-buffer-layer',
        type: 'line',
        source: 'imbl-buffer',
        paint: {
          'line-color': '#D98200',
          'line-width': 1.5,
          'line-dasharray': [3, 2]
        },
        layout: {
          visibility: activeMapLayers['imblBuffer'] ? 'visible' : 'none'
        }
      });

      // 5. Add PFZ Polygons
      mockPFZSectors.forEach((sector, index) => {
        const sourceId = `pfz-source-${index}`;
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [sector.polygon.map(coord => [coord[1], coord[0]])]
            },
            properties: {
              sectorName: sector.sector
            }
          }
        });

        // Fill layer
        map.addLayer({
          id: `pfz-fill-layer-${index}`,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': '#16834B',
            'fill-opacity': 0.15
          },
          layout: {
            visibility: activeMapLayers['pfz'] || selectedParameter === 'chlorophyll' ? 'visible' : 'none'
          }
        });

        // Outline layer
        map.addLayer({
          id: `pfz-outline-layer-${index}`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': '#16834B',
            'line-width': 1.8
          },
          layout: {
            visibility: activeMapLayers['pfz'] || selectedParameter === 'chlorophyll' ? 'visible' : 'none'
          }
        });
      });

      // Add markers for mock observation stations
      mockLocations.forEach((loc) => {
        // Create custom dot HTML element
        const el = document.createElement('div');
        el.className = 'w-3 h-3 bg-orca-blue rounded-full border-2 border-white cursor-pointer hover:scale-125 transition-transform shadow';
        
        // Popup
        const popupHtml = `
          <div class="font-sans">
            <h4 class="text-xs font-bold text-primary-text font-mono">${loc.name}</h4>
            <div class="text-[10px] text-secondary-text mt-1 space-y-0.5">
              <div>LAT/LNG: <span class="font-mono text-primary-text font-semibold">${loc.latitude}°N, ${loc.longitude}°E</span></div>
              <div>SST: <span class="font-mono text-primary-text font-semibold">${loc.observation.sst}°C</span></div>
              <div>WAVE HEIGHT: <span class="font-mono text-primary-text font-semibold">${loc.observation.waveHeight}m</span></div>
              <div>CHLOROPHYLL: <span class="font-mono text-primary-text font-semibold">${loc.observation.chlorophyll} mg/m³</span></div>
            </div>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 10 }).setHTML(popupHtml);

        new maplibregl.Marker({ element: el })
          .setLngLat([loc.longitude, loc.latitude])
          .setPopup(popup)
          .addTo(map);
      });
    });

    // Map Events
    map.on('click', (e) => {
      const lat = Number(e.lngLat.lat.toFixed(4));
      const lng = Number(e.lngLat.lng.toFixed(4));
      setSelectedCoordinates({ lat, lng });
    });

    map.on('mousemove', (e) => {
      setHoveredCoords({
        lat: Number(e.lngLat.lat.toFixed(4)),
        lng: Number(e.lngLat.lng.toFixed(4))
      });
    });

    map.on('zoom', () => {
      setZoomLevel(Number(map.getZoom().toFixed(1)));
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update Layers Visibility based on Zustand Store state
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Manage Copernicus Layers Visibility via OceanLayerManager
    const isSstActive = Boolean(activeMapLayers['sst'] && selectedParameter === 'sst');
    const isWaveActive = Boolean(activeMapLayers['waveHeight'] && selectedParameter === 'waveHeight');
    const isSlaActive = Boolean(activeMapLayers['seaLevel'] && selectedParameter === 'seaLevel');
    const isChlActive = Boolean(activeMapLayers['chlorophyll'] && selectedParameter === 'chlorophyll');

    layerManagerRef.current.setVisibility(map, 'copernicus-sst', isSstActive);
    layerManagerRef.current.setVisibility(map, 'copernicus-wave', isWaveActive);
    layerManagerRef.current.setVisibility(map, 'copernicus-sla', isSlaActive);
    layerManagerRef.current.setVisibility(map, 'copernicus-chl', isChlActive);

    // EEZ Layer
    if (map.getLayer('eez-layer')) {
      map.setLayoutProperty('eez-layer', 'visibility', activeMapLayers['eez'] ? 'visible' : 'none');
    }

    // IMBL Layer
    if (map.getLayer('imbl-layer')) {
      map.setLayoutProperty('imbl-layer', 'visibility', activeMapLayers['imbl'] ? 'visible' : 'none');
    }

    // IMBL Buffer Layer
    if (map.getLayer('imbl-buffer-layer')) {
      map.setLayoutProperty('imbl-buffer-layer', 'visibility', activeMapLayers['imblBuffer'] ? 'visible' : 'none');
    }

    // PFZ Layers
    mockPFZSectors.forEach((_, index) => {
      const fillId = `pfz-fill-layer-${index}`;
      const outlineId = `pfz-outline-layer-${index}`;
      const isVisible = activeMapLayers['pfz'];
      
      if (map.getLayer(fillId)) {
        map.setLayoutProperty(fillId, 'visibility', isVisible ? 'visible' : 'none');
      }
      if (map.getLayer(outlineId)) {
        map.setLayoutProperty(outlineId, 'visibility', isVisible ? 'visible' : 'none');
      }
    });
  }, [activeMapLayers, selectedParameter]);

  // Update Layer Opacities dynamically via OceanLayerManager
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    Object.entries(layerOpacities).forEach(([id, opacity]) => {
      layerManagerRef.current.setOpacity(map, id, opacity);
    });
  }, [layerOpacities]);

  // Update Copernicus source tiles when selected canonical time changes reactively
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    layerManagerRef.current.updateTime(map, 'copernicus-sst', selectedTimestamp);
    layerManagerRef.current.updateTime(map, 'copernicus-wave', selectedTimestamp);
    layerManagerRef.current.updateTime(map, 'copernicus-sla', selectedTimestamp);
    layerManagerRef.current.updateTime(map, 'copernicus-chl', selectedTimestamp);
    console.log(`[Copernicus GIS] OceanLayerManager updated tile timestamps for selected time:`, selectedTimestamp);
  }, [selectedTimestamp]);

  // Build the live Copernicus legend URL
  const legendUrl = buildCopernicusLegendUrl(defaultSstConfig);

  if (!webglSupported) {
    return (
      <div
        ref={mapContainerRef}
        onClick={handleFallbackMapClick}
        onMouseMove={handleFallbackMouseMove}
        className={`relative w-full h-full bg-[#0f172a] flex flex-col overflow-hidden select-none cursor-crosshair ${
          isFullscreen ? 'fixed inset-0 z-50 h-screen w-screen' : ''
        }`}
      >
        {/* SVG Grid background */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Lat lines */}
          <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          {/* Lng lines */}
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="60%" y1="0" x2="60%" y2="100%" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* Dynamic SST color overlay */}
        {activeMapLayers['sst'] && selectedParameter === 'sst' && (
          <div 
            className="absolute inset-0 pointer-events-none mix-blend-color-dodge bg-gradient-to-tr from-blue-900/40 via-emerald-600/30 via-yellow-500/20 to-red-600/30" 
            style={{ opacity: copernicusSstOpacity }}
          />
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 space-y-3 pointer-events-none select-none">
          <HelpCircle className="w-9 h-9 text-orca-blue animate-pulse" />
          <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">WebGL Fallback Map Grid</h3>
          <p className="text-[11px] text-slate-400 font-sans max-w-sm leading-relaxed">
            Interactive coordinates inspection mapping is active. Click anywhere on the ocean grid region to query Copernicus Marine data.
          </p>
        </div>

        {/* Selected Coordinates Pin indicator */}
        {selectedCoordinates && (
          <div 
            className="absolute pointer-events-none transition-all duration-300 ease-out flex flex-col items-center"
            style={{
              left: `${((selectedCoordinates.lng - 60) / 30) * 100}%`,
              top: `${((24 - selectedCoordinates.lat) / 20) * 100}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border border-white items-center justify-center text-[10px] shadow">📍</span>
            </span>
          </div>
        )}

        {/* Overlays (duplicated here so they are visible in fallback) */}
        {/* Top Map Indicators bar */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none max-w-sm">
          <div className="bg-white border border-border-orca rounded px-3 py-1.5 shadow-sm text-xs font-sans pointer-events-auto flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-orca-blue" />
            <span className="text-secondary-text font-mono">SELECTED:</span>
            <span className="font-mono font-bold text-primary-text text-[11px] uppercase">
              {selectedParameter === 'sst'
                ? 'Sea Surface Temp'
                : selectedParameter === 'sstAnomaly'
                ? 'SST Anomaly'
                : selectedParameter === 'waveHeight'
                ? 'Wave Height'
                : selectedParameter === 'chlorophyll'
                ? 'Chlorophyll-a'
                : selectedParameter.toUpperCase()}
            </span>
          </div>

          {selectedParameter === 'sst' && activeMapLayers['sst'] && (
            <div className="bg-white border border-border-orca rounded p-2.5 shadow-sm text-[10px] pointer-events-auto font-mono text-primary-text space-y-0.5">
              <div className="flex items-center gap-1.5 text-success-orca font-bold uppercase tracking-wider text-[11px]">
                COPERNICUS MARINE
              </div>
              <div className="mt-1">
                <span className="text-muted-orca font-bold">Dataset:</span>
                <div className="text-primary-text font-bold select-all break-all">{defaultSstConfig.datasetId}</div>
              </div>
              <div className="mt-1">
                <span className="text-muted-orca font-bold">Timestamp:</span>
                <div className="text-primary-text font-bold select-all">{sstTime}</div>
              </div>
            </div>
          )}

          {(selectedParameter !== 'sst' || !activeMapLayers['sst']) && (
            <div className="bg-white/90 border border-danger-orca/50 rounded px-2.5 py-1.5 shadow-sm text-[10px] text-danger-orca font-bold font-mono tracking-wider flex items-center gap-1 self-start pointer-events-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-danger-orca inline-block animate-ping"></span>
              DEMO DATA ONLY
            </div>
          )}
        </div>

        {/* Map Control Buttons */}
        <div className="absolute right-3 top-3 z-10 flex flex-col space-y-1.5 bg-white border border-border-orca p-1.5 rounded shadow-sm">
          <button
            onClick={() => {}}
            className="p-1.5 hover:bg-surface-secondary text-primary-text rounded transition-all focus:outline-none opacity-50 cursor-not-allowed"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {}}
            className="p-1.5 hover:bg-surface-secondary text-primary-text rounded transition-all focus:outline-none opacity-50 cursor-not-allowed"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-surface-secondary text-primary-text rounded border-t border-border-orca transition-all focus:outline-none"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Coordinates status line */}
        <div className="absolute bottom-3 left-3 z-10 bg-ocean-navy text-white text-[10px] font-mono px-3 py-1.5 rounded shadow flex items-center space-x-4 border border-[#1b3459]">
          <div className="flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-muted-orca" />
            <span>CURSOR:</span>
            <span className="text-[#a4c2f4]">
              {hoveredCoords ? `${hoveredCoords.lat.toFixed(4)}° N, ${hoveredCoords.lng.toFixed(4)}° E` : '--° N, --° E'}
            </span>
          </div>
          <div>
            <span>ZOOM:</span>
            <span className="text-[#a4c2f4]">4.5 (FALLBACK)</span>
          </div>
          {selectedCoordinates && (
            <div className="border-l border-[#1b3459] pl-4 flex items-center gap-1">
              <span className="text-muted-orca">INSPECT PIN:</span>
              <span className="text-[#ffdf9e]">
                {selectedCoordinates.lat}° N, {selectedCoordinates.lng}° E
              </span>
            </div>
          )}
        </div>

        {/* Scientific Legend Overlay */}
        <div className="absolute bottom-3 right-3 z-10 bg-white border border-border-orca p-3 rounded-lg shadow-md max-w-[260px] text-xs font-sans">
          <h4 className="font-bold text-primary-text tracking-wide uppercase text-[10px] mb-1.5 flex items-center justify-between">
            <span>
              {selectedParameter === 'sst' && activeMapLayers['sst']
                ? 'COPERNICUS SST SCALE'
                : selectedParameter === 'sstAnomaly'
                ? 'SST ANOMALY SCALE'
                : selectedParameter === 'waveHeight' || selectedParameter === 'swell'
                ? 'WAVE HEIGHT (m)'
                : selectedParameter === 'chlorophyll'
                ? 'CHLOROPHYLL (mg/m³)'
                : 'UNIT SCALE'}
            </span>
          </h4>

          {selectedParameter === 'sst' && activeMapLayers['sst'] ? (
            <div className="space-y-2">
              {jsonLegend && (
                <div className="text-[9px] text-secondary-text font-mono border-b border-border-orca pb-1.5 mb-1.5 space-y-0.5 select-none">
                  <div><span className="text-muted-orca font-bold">Variable:</span> {jsonLegend.variableName}</div>
                  <div><span className="text-muted-orca font-bold">Unit:</span> {jsonLegend.unit} / °C</div>
                  <div>
                    <span className="text-muted-orca font-bold">Range:</span>{' '}
                    <span className="font-bold text-primary-text">
                      {jsonLegend.min.toFixed(1)}K ({(jsonLegend.min - 273.15).toFixed(1)}°C)
                    </span>{' '}
                    to{' '}
                    <span className="font-bold text-primary-text">
                      {jsonLegend.max.toFixed(1)}K ({(jsonLegend.max - 273.15).toFixed(1)}°C)
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center bg-secondary-surface p-2 rounded border border-border-orca/50 select-none">
                <img
                  src={activeLegendUrl}
                  alt={`${headerInfo.title} Legend`}
                  className="max-h-[220px] w-auto object-contain"
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="h-2.5 w-full rounded mb-1 bg-gradient-to-r from-blue-600 via-emerald-400 via-yellow-300 to-red-600"></div>
              <div className="flex justify-between text-[9px] text-secondary-text font-mono font-semibold">
                {selectedParameter === 'sstAnomaly' ? (
                  <>
                    <span>-2.0°C</span>
                    <span>0.0°C</span>
                    <span>+2.0°C</span>
                  </>
                ) : selectedParameter === 'waveHeight' || selectedParameter === 'swell' ? (
                  <>
                    <span>0.5m</span>
                    <span>2.0m</span>
                    <span>4.0m</span>
                    <span>6.0m</span>
                  </>
                ) : selectedParameter === 'chlorophyll' ? (
                  <>
                    <span>0.05</span>
                    <span>0.5</span>
                    <span>1.0</span>
                    <span>2.0</span>
                  </>
                ) : (
                  <>
                    <span>MIN</span>
                    <span>MID</span>
                    <span>MAX</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className={`absolute inset-0 bg-[#e8ecef] ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      {/* Dedicated Map Canvas container */}
      <div ref={mapElRef} className="absolute inset-0 w-full h-full" />

      {/* Top Map Scientific Header */}
      <div className="absolute top-3 left-3 z-10 pointer-events-auto">
        <div className="bg-white/95 border border-border-orca rounded-md px-3 py-2 shadow-sm font-sans select-none backdrop-blur-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-bold tracking-wider uppercase text-primary-text font-mono">
              {headerInfo.title}
            </span>
            <span className="text-[9px] font-mono font-bold text-success-orca flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success-orca inline-block"></span>
              {headerInfo.provider}
            </span>
          </div>
          <div className="text-[10px] text-secondary-text font-mono mt-0.5 flex items-center justify-between gap-3">
            <span>{headerInfo.source}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-orca font-semibold">{formatSstTime(selectedTimestamp)}</span>
              {timelineFrameType === 'UNAVAILABLE' && (
                <span className="text-[9px] text-amber-600 font-bold px-1 rounded bg-amber-50 border border-amber-200">
                  FORECAST N/A
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Copernicus Error Alert overlay (only when error is present) */}
      {copernicusError && selectedParameter === 'sst' && activeMapLayers['sst'] && (
        <div className="absolute top-16 right-16 z-20 max-w-xs bg-red-50 border border-danger-orca p-3 rounded-lg shadow-lg text-xs text-danger-orca font-sans pointer-events-auto animate-fade-in">
          <div className="font-bold text-danger-orca flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4 text-danger-orca shrink-0" />
            <span className="text-[11px] uppercase tracking-wider">LAYER UNAVAILABLE</span>
          </div>
          <p className="text-[10px] font-mono bg-white p-1 rounded border border-danger-orca/20 mt-1.5 break-all">
            {copernicusError}
          </p>
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
          onClick={toggleFullscreen}
          className="p-1.5 hover:bg-surface-secondary text-primary-text rounded border-t border-border-orca transition-all focus:outline-none"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Coordinates status line (Bottom of map) */}
      <div className="absolute bottom-3 left-3 z-10 bg-ocean-navy/95 text-white text-[9px] font-mono px-2.5 py-1 rounded shadow flex items-center space-x-3 border border-[#1b3459] backdrop-blur-sm">
        <div className="flex items-center gap-1">
          <Compass className="w-3 h-3 text-muted-orca" />
          <span>CURSOR:</span>
          <span className="text-[#a4c2f4]">
            {hoveredCoords ? `${hoveredCoords.lat}° N, ${hoveredCoords.lng}° E` : '--° N, --° E'}
          </span>
        </div>
        <div>
          <span>ZOOM:</span>
          <span className="text-[#a4c2f4]">{zoomLevel}</span>
        </div>
        {selectedCoordinates && (
          <div className="border-l border-[#1b3459] pl-3 flex items-center gap-1">
            <span className="text-muted-orca">INSPECT:</span>
            <span className="text-[#ffdf9e]">
              {selectedCoordinates.lat}° N, {selectedCoordinates.lng}° E
            </span>
          </div>
        )}
      </div>

      {/* Compact Scientific Legend Overlay (Bottom Right Corner) */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 border border-border-orca p-2 rounded shadow-sm w-48 text-xs font-sans pointer-events-auto backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-border-orca pb-1 mb-1 font-mono text-[9px]">
          <span className="font-bold text-primary-text uppercase truncate mr-1">
            {headerInfo.title}
          </span>
          <span className="text-muted-orca font-bold shrink-0">{activeLegendUnit}</span>
        </div>

        {isRealCopernicusLayerActive ? (
          <div className="space-y-1">
            {/* Live Copernicus legend graphic SVG */}
            <div className="flex justify-center bg-secondary-surface p-1 rounded border border-border-orca/40 select-none">
              <img
                src={activeLegendUrl}
                alt={`${headerInfo.title} Legend`}
                onError={(e) => {
                  console.warn('Failed to load Copernicus WMTS legend graphic');
                }}
                className="max-h-[110px] w-auto object-contain"
              />
            </div>
            <div className="text-[8px] font-mono text-center text-success-orca font-bold">
              ● COPERNICUS MARINE
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
    </div>
  );
}
