'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { OceanParameter } from '@/types';
import {
  Compass,
  Thermometer,
  Droplet,
  Waves,
  Activity,
  Layers,
  MapPin,
  Check,
  ChevronDown,
  Info,
  Sliders,
  Maximize2
} from 'lucide-react';

const depthLevels = [
  { label: 'SURFACE', value: 0 },
  { label: '10 m', value: 10 },
  { label: '25 m', value: 25 },
  { label: '50 m', value: 50 },
  { label: '100 m', value: 100 },
  { label: '250 m', value: 250 },
  { label: '500 m', value: 500 },
  { label: '1000 m', value: 1000 },
  { label: '2000 m', value: 2000 }
];

const presets = [
  { name: 'Kerala Coast', lat: 9.9312, lng: 76.2673, basin: 'Arabian Sea' },
  { name: 'Central Arabian Sea', lat: 14.5000, lng: 68.0000, basin: 'Deep Basin' },
  { name: 'Bay of Bengal Deep', lat: 13.5000, lng: 85.0000, basin: 'Central Gyre' },
  { name: 'Gulf of Mannar', lat: 9.0000, lng: 79.2000, basin: 'Sri Lanka Basin' },
  { name: 'Lakshadweep Sea', lat: 10.5667, lng: 72.6417, basin: 'Archipelago Shelf' }
];

export default function OceanExplorerSidebar() {
  const {
    selectedLatitude,
    selectedLongitude,
    setSelectedCoordinates,
    selectedParameter,
    selectParameter,
    selectedDepth,
    setSelectedDepth,
    layerOpacities,
    setLayerOpacity
  } = useOrcaStore();

  const [inputLat, setInputLat] = useState(selectedLatitude ? selectedLatitude.toFixed(4) : '9.9312');
  const [inputLng, setInputLng] = useState(selectedLongitude ? selectedLongitude.toFixed(4) : '76.2673');
  const [applySuccess, setApplySuccess] = useState(false);

  const handleApplyLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setSelectedCoordinates({ lat, lng });
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 1500);
    }
  };

  const handleSelectPreset = (preset: typeof presets[0]) => {
    setInputLat(preset.lat.toFixed(4));
    setInputLng(preset.lng.toFixed(4));
    setSelectedCoordinates({ lat: preset.lat, lng: preset.lng });
  };

  const parameters: {
    id: OceanParameter;
    name: string;
    source: string;
    dataset: string;
    icon: any;
    status: 'CONNECTED' | 'AVAILABLE SOON' | 'DEMO';
    isReal: boolean;
  }[] = [
    {
      id: 'sst',
      name: 'SEA TEMPERATURE',
      source: 'COPERNICUS MARINE',
      dataset: 'OSTIA L4 NRT',
      icon: Thermometer,
      status: 'CONNECTED',
      isReal: true
    },
    {
      id: 'salinity',
      name: 'SALINITY',
      source: 'AQUARIUS SATELLITE',
      dataset: 'L3 MOCK FEED',
      icon: Droplet,
      status: 'DEMO',
      isReal: false
    },
    {
      id: 'currents',
      name: 'OCEAN CURRENT',
      source: 'COPERNICUS MARINE',
      dataset: 'PHY_001_024 (uo/vo)',
      icon: Compass,
      status: 'AVAILABLE SOON',
      isReal: false
    },
    {
      id: 'waveHeight',
      name: 'WAVE HEIGHT',
      source: 'COPERNICUS MARINE',
      dataset: 'WAV_001_027 (Hm0)',
      icon: Waves,
      status: 'CONNECTED',
      isReal: true
    },
    {
      id: 'seaLevel',
      name: 'SEA LEVEL',
      source: 'COPERNICUS MARINE',
      dataset: 'SEALEVEL_L4_NRT (sla)',
      icon: Droplet,
      status: 'CONNECTED',
      isReal: true
    },
    {
      id: 'chlorophyll',
      name: 'CHLOROPHYLL-a',
      source: 'COPERNICUS MARINE',
      dataset: 'BGC_L4_NRT (CHL)',
      icon: Activity,
      status: 'CONNECTED',
      isReal: true
    }
  ];

  return (
    <aside className="w-[310px] bg-white border-r border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            Exploration Controls
          </h2>
        </div>
        <span className="text-[9px] font-mono text-muted-orca bg-white px-1.5 py-0.5 border border-border-orca rounded">
          DEEP EXPLORER
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Geographic Coordinate Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orca-blue" />
              COORDINATE SELECTION
            </h3>
            {applySuccess && (
              <span className="text-[9px] font-mono text-success-orca flex items-center gap-0.5">
                <Check className="w-3 h-3" /> APPLIED
              </span>
            )}
          </div>

          <form onSubmit={handleApplyLocation} className="space-y-2 bg-secondary-surface p-2.5 rounded border border-border-orca">
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div>
                <label className="text-[9px] text-muted-orca uppercase block mb-0.5">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="-90"
                  max="90"
                  value={inputLat}
                  onChange={(e) => setInputLat(e.target.value)}
                  className="w-full bg-white border border-border-orca rounded px-2 py-1 text-xs text-primary-text font-mono focus:outline-none focus:border-orca-blue"
                  placeholder="e.g. 9.9312"
                />
              </div>
              <div>
                <label className="text-[9px] text-muted-orca uppercase block mb-0.5">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="-180"
                  max="180"
                  value={inputLng}
                  onChange={(e) => setInputLng(e.target.value)}
                  className="w-full bg-white border border-border-orca rounded px-2 py-1 text-xs text-primary-text font-mono focus:outline-none focus:border-orca-blue"
                  placeholder="e.g. 76.2673"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-ocean-navy hover:bg-[#12315b] text-white py-1 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1"
            >
              APPLY LOCATION
            </button>
          </form>

          {/* Location Presets */}
          <div className="space-y-1">
            <span className="text-[9px] text-muted-orca font-mono uppercase block">Named Regions</span>
            <div className="grid grid-cols-1 gap-1">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-left px-2 py-1 rounded border border-border-orca/60 bg-white hover:bg-secondary-surface text-[10px] font-mono flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold text-primary-text">{preset.name}</span>
                  <span className="text-muted-orca text-[9px]">{preset.basin}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ocean Parameters */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono">
            OCEAN PARAMETERS
          </h3>
          <div className="space-y-1.5">
            {parameters.map((param) => {
              const Icon = param.icon;
              const isSelected = selectedParameter === param.id;

              return (
                <button
                  key={param.id}
                  type="button"
                  onClick={() => selectParameter(param.id)}
                  className={`w-full text-left p-2 rounded border flex flex-col transition-all ${
                    isSelected
                      ? 'border-orca-blue bg-blue-50/30'
                      : 'border-border-orca bg-white hover:border-[#1b3459]/40'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-orca-blue' : 'text-secondary-text'}`} />
                      <div>
                        <span className={`text-[11px] font-bold block ${isSelected ? 'text-orca-blue' : 'text-primary-text'}`}>
                          {param.name}
                        </span>
                        <span className="text-[9px] text-muted-orca font-mono block">
                          {param.source}
                        </span>
                      </div>
                    </div>
                    <div>
                      {param.status === 'CONNECTED' ? (
                        <span className="text-[8px] font-mono text-success-orca font-bold bg-success-orca/10 border border-success-orca/30 px-1 py-0.5 rounded">
                          ● REAL DATA
                        </span>
                      ) : param.status === 'AVAILABLE SOON' ? (
                        <span className="text-[8px] font-mono text-amber-600 font-bold bg-amber-50 border border-amber-200 px-1 py-0.5 rounded">
                          ○ SOON
                        </span>
                      ) : (
                        <span className="text-[8px] font-mono text-muted-orca font-bold bg-slate-100 border border-slate-200 px-1 py-0.5 rounded">
                          ○ DEMO
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-full mt-2 pt-1.5 border-t border-border-orca flex items-center justify-between text-[9px] font-mono text-muted-orca">
                      <span>DATASET: {param.dataset}</span>
                      <span className="text-orca-blue font-bold">ACTIVE</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Depth Control (Scientific Vertical / Segmented Depth Selector) */}
        <div className="space-y-2 border-t border-border-orca pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono">
              DEPTH LEVEL
            </h3>
            <span className="text-[10px] font-mono font-bold text-primary-text bg-secondary-surface px-1.5 py-0.5 rounded border border-border-orca">
              {selectedDepth === 0 ? 'SURFACE' : `${selectedDepth} m`}
            </span>
          </div>

          {/* Depth Segmented Grid */}
          <div className="grid grid-cols-3 gap-1 font-mono text-[10px]">
            {depthLevels.map((lvl) => {
              const isCurrent = selectedDepth === lvl.value;
              return (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => setSelectedDepth(lvl.value)}
                  className={`py-1 px-1 rounded text-center border transition-all ${
                    isCurrent
                      ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                      : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>

          {/* Depth dataset honesty warning if non-surface depth is chosen for 2D surface raster */}
          {selectedDepth > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2 text-[9px] font-mono text-amber-800 space-y-1">
              <div className="flex items-center gap-1 font-bold">
                <Info className="w-3 h-3 text-amber-600 shrink-0" />
                <span>SURFACE DATASET NOTICE</span>
              </div>
              <p className="leading-tight text-amber-700">
                Current Copernicus datasets ({selectedParameter.toUpperCase()}) are single-level surface observations. Subsurface ({selectedDepth}m) volumetric modeling requires 3D physics assimilation.
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
