'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useOrcaStore } from '@/stores/useOrcaStore';
import ScientificSidebar from '@/components/ScientificSidebar';
import ResearchAssistant from '@/components/ResearchAssistant';
import TemporalAnalysis from '@/components/TemporalAnalysis';
import SafetyAlert from '@/components/SafetyAlert';
import { mockSafetyAlerts } from '@/mock/mockPFZ';
import { Info, Compass, ShieldAlert, X, Thermometer, Waves, Activity, AlertTriangle } from 'lucide-react';
import { fetchCopernicusFeatureInfo } from '@/lib/map/copernicusFeatureInfo';
import { defaultSstConfig } from '@/lib/map/copernicusWmts';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#e8ecef] flex flex-col items-center justify-center font-mono text-xs text-muted-orca">
      <span>INITIALIZING GEOSPATIAL MAP basemap...</span>
    </div>
  )
});

export default function ResearchPage() {
  const {
    selectedCoordinates,
    selectedMapData,
    setSelectedCoordinates,
    sidebarOpen,
    assistantOpen,
    timelineIndex,
    timelineMode,
    selectedTimestamp,
    latestAvailableTime,
    fallbackTime,
    selectedParameter
  } = useOrcaStore();

  const [copernicusInfo, setCopernicusInfo] = useState<any>(null);
  const [copernicusInfoLoading, setCopernicusInfoLoading] = useState(false);
  const [copernicusInfoError, setCopernicusInfoError] = useState<string | null>(null);

  const handleCloseInspector = () => {
    setSelectedCoordinates(null);
  };

  const explainSafetyAlert = (alert: any) => {
    alert(`Alert explanation request: Trawler alert in Sector [${alert.coordinates.join(', ')}]`);
  };

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
    
    if (targetDate > limitDate) {
      return baseTimeStr;
    }
    
    return targetDate.toISOString().replace(/\.\d+Z$/, 'Z');
  };

  const sstTime = selectedTimestamp;

  const formatTimestamp = (timeStr: string) => {
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

  // Trigger Copernicus live coordinates inspection query
  useEffect(() => {
    if (!selectedCoordinates) {
      setCopernicusInfo(null);
      setCopernicusInfoError(null);
      return;
    }

    const inspectCoordinates = async () => {
      setCopernicusInfoLoading(true);
      setCopernicusInfoError(null);
      setCopernicusInfo(null);
      try {
        console.log(`[Copernicus GIS] Inspecting coordinate: ${selectedCoordinates.lat}, ${selectedCoordinates.lng} at time: ${sstTime}`);
        const data = await fetchCopernicusFeatureInfo(
          {
            ...defaultSstConfig,
            time: sstTime
          },
          selectedCoordinates.lat,
          selectedCoordinates.lng,
          6 // Inspection zoom level
        );
        setCopernicusInfo(data);
      } catch (err: any) {
        console.warn('[Copernicus GIS] Direct feature info query failed/deferred:', err.message);
        setCopernicusInfoError(err.message || 'Error executing GetFeatureInfo');
      } finally {
        setCopernicusInfoLoading(false);
      }
    };

    inspectCoordinates();
  }, [selectedCoordinates, sstTime]);

  const getSelectedLayerInspectorInfo = () => {
    switch (selectedParameter) {
      case 'waveHeight':
        return {
          name: 'SIGNIFICANT WAVE HEIGHT',
          source: 'Copernicus Marine',
          dataset: 'GLOBAL_ANALYSISFORECAST_WAV_001_027',
          variable: 'VHM0',
          unit: 'm',
          dataStatus: 'REAL RASTER',
          resolution: '0.083° (~9 km) · PT3H',
          isRealRaster: true
        };
      case 'seaLevel':
        return {
          name: 'SEA LEVEL ANOMALY',
          source: 'Copernicus Marine',
          dataset: 'SEALEVEL_GLO_PHY_L4_NRT_008_046',
          variable: 'sla',
          unit: 'm',
          dataStatus: 'REAL RASTER',
          resolution: '0.125° (~14 km) · P1D',
          isRealRaster: true
        };
      case 'chlorophyll':
        return {
          name: 'CHLOROPHYLL-a',
          source: 'Copernicus Marine',
          dataset: 'OCEANCOLOUR_GLO_BGC_L4_NRT_009_102',
          variable: 'CHL',
          unit: 'mg/m³',
          dataStatus: 'REAL RASTER',
          resolution: '4 km (~0.04°) · P1D',
          isRealRaster: true
        };
      case 'currents':
        return {
          name: 'OCEAN SURFACE CURRENTS',
          source: 'Copernicus Marine',
          dataset: 'GLOBAL_ANALYSISFORECAST_PHY_001_024',
          variable: 'uo, vo',
          unit: 'm/s',
          dataStatus: 'AVAILABLE SOON',
          resolution: '0.083° (~9 km) · P1D',
          isRealRaster: false
        };
      case 'sst':
      default:
        return {
          name: 'SEA SURFACE TEMPERATURE',
          source: 'Copernicus Marine',
          dataset: 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001 (OSTIA)',
          variable: 'analysed_sst',
          unit: '°C',
          dataStatus: 'REAL RASTER',
          resolution: '0.05° (~5 km) · P1D',
          isRealRaster: true
        };
    }
  };

  const layerInfo = getSelectedLayerInspectorInfo();

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="flex-1 flex overflow-hidden relative">
        <ScientificSidebar />

        <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden" style={{ height: '100%' }}>
          <div className="flex-1 relative min-h-0">
            <MapComponent />
          </div>

          {selectedCoordinates && selectedMapData && (
            <div className="absolute top-16 left-3 z-20 w-76 bg-white/95 border border-border-orca rounded-lg shadow-md font-sans overflow-hidden animate-fade-in backdrop-blur-sm">
              <div className="bg-[#0b1f3a] text-white px-3 py-2 flex justify-between items-center select-none">
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5 text-orca-blue animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
                    COORDINATE INSPECTOR
                  </span>
                </div>
                <button
                  onClick={handleCloseInspector}
                  className="text-muted-orca hover:text-white p-0.5 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 space-y-2.5 select-none text-xs">
                <div>
                  <span className="text-[9px] text-muted-orca font-mono uppercase tracking-wider block">
                    LOCATION
                  </span>
                  <span className="font-bold font-mono text-primary-text text-[11px]">
                    {selectedCoordinates.lat > 0 ? `${selectedCoordinates.lat.toFixed(4)}° N` : `${Math.abs(selectedCoordinates.lat).toFixed(4)}° S`}
                    {' · '}
                    {selectedCoordinates.lng > 0 ? `${selectedCoordinates.lng.toFixed(4)}° E` : `${Math.abs(selectedCoordinates.lng).toFixed(4)}° W`}
                  </span>
                </div>

                <div className="bg-secondary-surface border border-border-orca rounded p-2 font-mono text-[10px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">PARAMETER:</span>
                    <span className="font-bold text-primary-text">{layerInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">SOURCE:</span>
                    <span className="font-bold text-primary-text">{layerInfo.source}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">DATASET:</span>
                    <span className="font-bold text-primary-text truncate max-w-[130px]" title={layerInfo.dataset}>{layerInfo.dataset}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">VARIABLE:</span>
                    <span className="font-bold text-primary-text">{layerInfo.variable} ({layerInfo.unit})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">DATA STATUS:</span>
                    <span className={`font-bold flex items-center gap-1 ${layerInfo.isRealRaster ? 'text-success-orca' : 'text-amber-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${layerInfo.isRealRaster ? 'bg-success-orca' : 'bg-amber-600'}`}></span>
                      {layerInfo.dataStatus}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">POINT QUERY:</span>
                    <span className="font-bold text-amber-600">
                      BACKEND REQUIRED
                    </span>
                  </div>
                </div>

                <div className="space-y-1 text-[10px] font-mono text-muted-orca">
                  <div className="flex justify-between items-center">
                    <span>TIMESTAMP</span>
                    <span className="font-bold text-primary-text">{formatTimestamp(selectedTimestamp)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>RESOLUTION</span>
                    <span className="font-bold text-primary-text">{layerInfo.resolution}</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-border-orca pt-2 font-mono text-[11px]">
                  <div className="text-[9px] font-bold text-muted-orca uppercase tracking-wider mb-0.5">
                    DEMO ANALYTICS (SIMULATED)
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">SST (Simulated):</span>
                    <span className="font-bold text-primary-text">{selectedMapData.sst.toFixed(2)} °C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">SST Anomaly (Simulated):</span>
                    <span className={`font-bold ${selectedMapData.sstAnomaly >= 0 ? 'text-[#C62828]' : 'text-[#0645AD]'}`}>
                      {selectedMapData.sstAnomaly >= 0 ? `+${selectedMapData.sstAnomaly.toFixed(2)}` : selectedMapData.sstAnomaly.toFixed(2)} °C
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">Wave Height (Simulated):</span>
                    <span className="font-bold text-primary-text">{selectedMapData.waveHeight.toFixed(2)} m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary-text">Chlorophyll (Simulated):</span>
                    <span className="font-bold text-primary-text">{selectedMapData.chlorophyll.toFixed(2)} mg/m³</span>
                  </div>
                </div>

                <div className="text-[8px] font-mono text-center text-muted-orca border-t border-border-orca/50 pt-1.5 select-none">
                  REAL COPERNICUS RASTER · POINT QUERY VIA BACKEND ONLY
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-3 right-16 z-20 max-w-xs pointer-events-auto hidden md:block">
            {mockSafetyAlerts.slice(0, 1).map((alert) => (
              <SafetyAlert key={alert.id} alert={alert} onExplain={explainSafetyAlert} />
            ))}
          </div>
        </div>

        {/* Right: Collapsible Ask ORCA AI reasoning terminal */}
        <ResearchAssistant />
      </div>

      {/* Bottom: Temporal analysis and Plotly charts */}
      <TemporalAnalysis />
    </div>
  );
}
