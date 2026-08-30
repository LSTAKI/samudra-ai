'use client';

import { useOrcaStore } from '@/stores/useOrcaStore';
import { OceanParameter } from '@/types';
import {
  Thermometer,
  Waves,
  Compass,
  Wind,
  Droplet,
  CloudLightning,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Globe,
  Database
} from 'lucide-react';

export default function ScientificSidebar() {
  const {
    activeMapLayers,
    toggleLayer,
    selectedParameter,
    selectParameter,
    sidebarOpen,
    toggleSidebar,
    copernicusSstOpacity,
    setCopernicusSstOpacity,
    copernicusTileStatus,
    layerOpacities,
    setLayerOpacity
  } = useOrcaStore();

  const parameterList = [
    {
      id: 'sst' as OceanParameter,
      name: 'SEA SURFACE TEMPERATURE',
      source: 'COPERNICUS MARINE',
      legend: '°C Scale',
      icon: Thermometer,
      layerId: 'copernicus-sst',
      copernicusInfo: {
        dataset: 'OSTIA L4 NRT',
        status: copernicusTileStatus
      }
    },
    {
      id: 'waveHeight' as OceanParameter,
      name: 'WAVE HEIGHT',
      source: 'COPERNICUS MARINE',
      legend: 'm Scale',
      icon: Waves,
      layerId: 'copernicus-wave',
      copernicusInfo: {
        dataset: 'WAV_001_027 (VHM0)',
        status: 'CONNECTED' as const
      }
    },
    {
      id: 'currents' as OceanParameter,
      name: 'OCEAN CURRENTS',
      source: 'COPERNICUS MARINE',
      legend: 'Vector',
      icon: Compass,
      layerId: 'copernicus-currents',
      copernicusInfo: {
        dataset: 'PHY_001_024 (uo/vo)',
        status: 'AVAILABLE SOON' as const
      }
    },
    {
      id: 'seaLevel' as OceanParameter,
      name: 'SEA LEVEL ANOMALY',
      source: 'COPERNICUS MARINE',
      legend: 'm Scale',
      icon: Droplet,
      layerId: 'copernicus-sla',
      copernicusInfo: {
        dataset: 'SEALEVEL_L4_NRT (sla)',
        status: 'CONNECTED' as const
      }
    },
    {
      id: 'chlorophyll' as OceanParameter,
      name: 'CHLOROPHYLL-a',
      source: 'COPERNICUS MARINE',
      legend: 'mg/m³ Scale',
      icon: Activity,
      layerId: 'copernicus-chl',
      copernicusInfo: {
        dataset: 'BGC_L4_NRT (CHL)',
        status: 'CONNECTED' as const
      }
    },
    {
      id: 'sstAnomaly' as OceanParameter,
      name: 'SST Anomaly',
      source: 'Copernicus Model',
      legend: '-2..+2°C',
      icon: Thermometer
    },
    {
      id: 'swell' as OceanParameter,
      name: 'Swell Waves',
      source: 'INCOIS Buoy (Demo)',
      legend: '0..4m',
      icon: Waves
    },
    {
      id: 'wind' as OceanParameter,
      name: 'Wind Field',
      source: 'Scatsat-1 (Demo)',
      legend: '0..25m/s',
      icon: Wind
    },
    {
      id: 'salinity' as OceanParameter,
      name: 'Sea Salinity',
      source: 'Aquarius (Demo)',
      legend: '30..36psu',
      icon: Droplet
    },
    {
      id: 'heatwave' as OceanParameter,
      name: 'Marine Heatwave',
      source: 'MHW Alert (Demo)',
      legend: 'Binary',
      icon: Thermometer
    },
    {
      id: 'cyclone' as OceanParameter,
      name: 'Cyclone Activity',
      source: 'IMD Track (Demo)',
      legend: 'Category',
      icon: CloudLightning
    }
  ];

  const boundaryList = [
    { id: 'eez', name: 'Indian EEZ Boundary', source: 'UNCLOS', color: 'border-blue-400' },
    { id: 'imbl', name: 'IMBL Boundary', source: 'Treaty Grid', color: 'border-red-400' },
    { id: 'imblBuffer', name: 'IMBL Warning Buffer', source: 'Coast Guard', color: 'border-amber-400' },
    { id: 'mpa', name: 'Marine Protected Areas', source: 'WCMC', color: 'border-emerald-400' },
    { id: 'bathymetry', name: '3D Bathymetry contours', source: 'GEBCO', color: 'border-slate-400' },
    { id: 'restricted', name: 'Restricted Zones', source: 'Naval Hydr.', color: 'border-rose-600' }
  ];

  const sourceList = [
    { id: 'copernicus', name: 'COPERNICUS MARINE', type: 'WMTS L4 Multi-Source', statusText: 'CONNECTED', isReal: true, note: 'REAL DATA' },
    { id: 'mosdac', name: 'ISRO MOSDAC', type: 'Satellite Payload', statusText: 'DEMO', isReal: false, note: 'MOCK FEED' },
    { id: 'incois', name: 'INCOIS', type: 'Ocean Buoy / Moorings', statusText: 'DEMO', isReal: false, note: 'MOCK FEED' },
    { id: 'noaa', name: 'NOAA', type: 'Global Reanalysis', statusText: 'DEMO', isReal: false, note: 'MOCK FEED' }
  ];

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-0 top-[calc(64px+16px)] z-40 bg-ocean-navy text-white p-2 border-y border-r border-[#1b3459] rounded-r-md hover:bg-orca-blue transition-colors focus:outline-none"
        title="Expand Layers Panel"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="w-[300px] bg-white border-r border-border-orca h-full flex flex-col font-sans select-none z-30 relative transition-all duration-200">
      {/* Sidebar Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider">
            Scientific Control Panel
          </h2>
        </div>
        <button
          onClick={toggleSidebar}
          className="text-secondary-text hover:text-primary-text p-1 hover:bg-border-orca/40 rounded transition-colors"
          title="Collapse Sidebar"
          type="button"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Accordion Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Ocean Parameters */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase">
            OCEAN PARAMETERS
          </h3>
          <div className="space-y-1.5">
            {parameterList.map((param) => {
              const Icon = param.icon;
              const isToggled = activeMapLayers[param.id];
              const isSelectedParam = selectedParameter === param.id;
              const isCopernicusParam = Boolean(param.copernicusInfo);
              const layerId = param.layerId || 'copernicus-sst';
              const currentOpacity = layerOpacities[layerId] ?? 0.70;

              return (
                <div
                  key={param.id}
                  onClick={() => selectParameter(param.id)}
                  className={`group relative p-2.5 rounded-lg border flex flex-col cursor-pointer transition-all ${
                    isSelectedParam
                      ? 'border-orca-blue bg-blue-50/20'
                      : 'border-border-orca hover:border-[#1b3459]/40 bg-surface'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayer(param.id);
                        }}
                        className="p-1 rounded text-secondary-text hover:bg-border-orca/40 focus:outline-none"
                        type="button"
                      >
                        {isToggled ? (
                          <Eye className="w-3.5 h-3.5 text-orca-blue" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5 text-muted-orca" />
                        )}
                      </button>
                      <Icon className={`w-4 h-4 shrink-0 ${isToggled ? 'text-orca-blue' : 'text-muted-orca'}`} />
                      <div className="truncate leading-tight">
                        <span className={`text-xs font-semibold block truncate ${isSelectedParam ? 'text-orca-blue' : 'text-primary-text'}`}>
                          {param.name}
                        </span>
                        <span className="text-[9px] text-muted-orca font-mono block">
                          {param.source}
                        </span>
                        {param.copernicusInfo && (
                          <div className="text-[8px] font-mono text-secondary-text mt-0.5 space-y-0.5 select-none">
                            <div>Dataset: <span className="font-bold text-primary-text">{param.copernicusInfo.dataset}</span></div>
                            <div className="flex items-center gap-0.5">
                              Status:{' '}
                              {param.copernicusInfo.status === 'CONNECTED' ? (
                                <span className="text-success-orca font-bold">● CONNECTED</span>
                              ) : param.copernicusInfo.status === 'AVAILABLE SOON' ? (
                                <span className="text-amber-600 font-bold">○ AVAILABLE SOON</span>
                              ) : param.copernicusInfo.status === 'LOADING' ? (
                                <span className="text-orca-blue font-bold">● LOADING</span>
                              ) : (
                                <span className="text-muted-orca font-bold">○ UNAVAILABLE</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Legend Tag */}
                    <span className="text-[9px] text-secondary-text bg-secondary-surface border border-border-orca font-mono rounded px-1 py-0.5">
                      {param.legend}
                    </span>
                  </div>

                  {/* Copernicus Layer Custom Controls */}
                  {isSelectedParam && isCopernicusParam && (
                    <div
                      className="w-full mt-2 pt-2 border-t border-border-orca space-y-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between text-[9px] text-secondary-text font-mono">
                        <span>VISIBILITY:</span>
                        <button
                          onClick={() => toggleLayer(param.id)}
                          disabled={param.id === 'currents'}
                          className={`px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                            param.id === 'currents'
                              ? 'bg-muted-orca/10 text-muted-orca border border-muted-orca/30 cursor-not-allowed'
                              : isToggled
                              ? 'bg-success-orca/10 text-success-orca border border-success-orca/30'
                              : 'bg-muted-orca/10 text-muted-orca border border-muted-orca/30'
                          }`}
                          type="button"
                        >
                          {param.id === 'currents' ? 'DISABLED' : isToggled ? 'VISIBLE' : 'HIDDEN'}
                        </button>
                      </div>
                      <div className="flex justify-between text-[9px] text-secondary-text font-mono">
                        <span>OPACITY:</span>
                        <span>{Math.round(currentOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        disabled={param.id === 'currents'}
                        value={currentOpacity}
                        onChange={(e) => setLayerOpacity(layerId, Number(e.target.value))}
                        className="w-full h-1 bg-border-orca rounded-lg appearance-none cursor-pointer accent-orca-blue disabled:opacity-40"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>


        {/* Boundaries */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase">
            BOUNDARIES & ZONES
          </h3>
          <div className="space-y-1.5">
            {boundaryList.map((boundary) => {
              const isToggled = activeMapLayers[boundary.id];

              return (
                <div
                  key={boundary.id}
                  onClick={() => toggleLayer(boundary.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    isToggled
                      ? 'border-orca-blue/60 bg-[#0645ad]/5'
                      : 'border-border-orca hover:border-secondary-text/40 bg-surface'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Shield className={`w-4 h-4 shrink-0 ${isToggled ? 'text-orca-blue' : 'text-muted-orca'}`} />
                    <div className="truncate leading-tight">
                      <span className={`text-xs font-semibold block truncate ${isToggled ? 'text-primary-text' : 'text-secondary-text'}`}>
                        {boundary.name}
                      </span>
                      <span className="text-[9px] text-muted-orca font-mono block">
                        {boundary.source}
                      </span>
                    </div>
                  </div>

                  <span className={`w-3.5 h-1.5 rounded border-b-2 ${boundary.color}`}></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Sources */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono">
              DATA SOURCES
            </h3>
            <span className="text-[9px] text-muted-orca font-mono">1 REAL · 3 DEMO</span>
          </div>
          <div className="space-y-1.5">
            {sourceList.map((source) => {
              const isToggled = activeMapLayers[source.id];

              return (
                <div
                  key={source.id}
                  onClick={() => toggleLayer(source.id)}
                  className={`p-2 rounded border flex items-center justify-between cursor-pointer transition-all ${
                    isToggled
                      ? 'border-orca-blue/60 bg-[#0645ad]/5'
                      : 'border-border-orca hover:border-secondary-text/40 bg-surface'
                  }`}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <Database className={`w-3.5 h-3.5 shrink-0 ${isToggled ? 'text-orca-blue' : 'text-muted-orca'}`} />
                    <div className="truncate leading-tight">
                      <span className="text-xs font-semibold text-primary-text block truncate">
                        {source.name}
                      </span>
                      <div className="text-[9px] text-muted-orca font-mono flex items-center gap-1.5 mt-0.5">
                        <span>{source.type}</span>
                        <span>·</span>
                        <span className={source.isReal ? 'text-success-orca font-bold' : 'text-secondary-text'}>
                          {source.note}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                      source.isReal 
                        ? 'bg-emerald-50 text-success-orca border-emerald-200' 
                        : 'bg-slate-50 text-secondary-text border-slate-200'
                    }`}>
                      {source.statusText}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${isToggled ? (source.isReal ? 'bg-success-orca' : 'bg-orca-blue') : 'bg-muted-orca'}`}></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
