'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import OceanTemporalControl from './OceanTemporalControl';
import {
  Thermometer,
  Droplet,
  Compass,
  Layers,
  ChevronUp,
  ChevronDown,
  Info,
  TrendingUp
} from 'lucide-react';

type AnalysisTab = 'temperature' | 'salinity' | 'current' | 'depth';

export default function OceanAnalysisPanel() {
  const {
    selectedLatitude,
    selectedLongitude,
    selectedCoordinates,
    selectedParameter,
    selectedDepth,
    selectedTimestamp,
    selectedMapData
  } = useOrcaStore();

  const [activeTab, setActiveTab] = useState<AnalysisTab>('temperature');
  const [collapsed, setCollapsed] = useState(false);

  const lat = selectedCoordinates ? selectedCoordinates.lat : (selectedLatitude ?? 9.9312);
  const lng = selectedCoordinates ? selectedCoordinates.lng : (selectedLongitude ?? 76.2673);

  const tabs: { id: AnalysisTab; label: string; icon: any }[] = [
    { id: 'temperature', label: 'TEMPERATURE', icon: Thermometer },
    { id: 'salinity', label: 'SALINITY', icon: Droplet },
    { id: 'current', label: 'CURRENT', icon: Compass },
    { id: 'depth', label: 'DEPTH PROFILE', icon: Layers }
  ];

  return (
    <div className="bg-white border-t border-border-orca select-none font-sans z-20 shrink-0 transition-all">
      {/* Bar Header */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-border-orca bg-secondary-surface">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="text-[11px] font-bold text-primary-text uppercase tracking-wider">
              OCEAN PROFILE ANALYSIS
            </span>
            <span className="text-[9px] text-muted-orca font-normal">
              [{lat.toFixed(4)}°N, {lng.toFixed(4)}°E]
            </span>
          </div>

          {/* Analysis Category Tabs */}
          <div className="flex items-center space-x-1 pl-4 border-l border-border-orca">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (collapsed) setCollapsed(false);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                      : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Header Side: Temporal Control + Collapse */}
        <div className="flex items-center space-x-3">
          <OceanTemporalControl />

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-secondary-text hover:text-primary-text hover:bg-white rounded transition-colors"
            title={collapsed ? 'Expand Analysis Drawer' : 'Collapse Analysis Drawer'}
          >
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      {!collapsed && (
        <div className="p-3 h-36 bg-white flex items-center justify-between overflow-x-auto text-xs font-mono">
          {activeTab === 'temperature' && (
            <div className="w-full flex items-center justify-between gap-6">
              {/* Metric Card */}
              <div className="bg-secondary-surface border border-border-orca rounded p-3 min-w-[200px] space-y-1">
                <span className="text-[9px] text-muted-orca uppercase block">Surface Temperature</span>
                <div className="text-xl font-bold text-primary-text">
                  28.4 °C <span className="text-xs font-normal text-muted-orca">(301.55 K)</span>
                </div>
                <div className="text-[9px] text-success-orca flex items-center gap-1 font-bold">
                  <span>● OSTIA L4 VERIFIED RASTER</span>
                </div>
              </div>

              {/* Multi-depth Slice Status */}
              <div className="flex-1 bg-white border border-border-orca rounded p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-text font-bold">VERTICAL TEMPERATURE GRADIENT</span>
                  <span className="text-[9px] text-amber-700 bg-amber-50 px-1 py-0.5 border border-amber-200 rounded font-bold">
                    SURFACE DATASET
                  </span>
                </div>
                <p className="text-[10px] text-muted-orca leading-relaxed">
                  Active Copernicus OSTIA product provides high-resolution foundation SST (0m depth). Subsurface thermocline modeling at {selectedDepth}m requires integration with CMEMS global reanalysis (GLORYS12V1).
                </p>
              </div>

              {/* Data Provenance Badge */}
              <div className="bg-secondary-surface border border-border-orca rounded p-3 min-w-[200px] space-y-1">
                <span className="text-[9px] text-muted-orca uppercase block">Metadata Reference</span>
                <div className="text-[10px] text-primary-text font-bold truncate">
                  METOFFICE-GLO-SST-L4-NRT
                </div>
                <div className="text-[9px] text-muted-orca">
                  Spatial: 0.05° · Temporal: P1D
                </div>
              </div>
            </div>
          )}

          {activeTab === 'salinity' && (
            <div className="w-full flex items-center justify-between gap-6">
              <div className="bg-secondary-surface border border-border-orca rounded p-3 min-w-[200px] space-y-1">
                <span className="text-[9px] text-muted-orca uppercase block">Sea Surface Salinity</span>
                <div className="text-xl font-bold text-primary-text">
                  34.8 psu
                </div>
                <div className="text-[9px] text-muted-orca font-bold">
                  ○ DEMO SIMULATED VALUE
                </div>
              </div>

              <div className="flex-1 bg-white border border-border-orca rounded p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-text font-bold">SALINITY HYDROGRAPHIC PROFILE</span>
                  <span className="text-[9px] text-slate-600 bg-slate-100 px-1 py-0.5 border border-slate-200 rounded font-bold">
                    DEMO FEED
                  </span>
                </div>
                <p className="text-[10px] text-muted-orca leading-relaxed">
                  Real Aquarius / SMAP surface salinity endpoints and ARGO halocline profiles are scheduled for Phase 3 ingestion.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'current' && (
            <div className="w-full flex items-center justify-between gap-6">
              <div className="bg-secondary-surface border border-border-orca rounded p-3 min-w-[200px] space-y-1">
                <span className="text-[9px] text-muted-orca uppercase block">Zonal / Meridional Velocity</span>
                <div className="text-xl font-bold text-primary-text">
                  uo: 0.32 m/s · vo: -0.18 m/s
                </div>
                <div className="text-[9px] text-amber-600 font-bold">
                  ○ ARCHITECTURE READY (AVAILABLE SOON)
                </div>
              </div>

              <div className="flex-1 bg-white border border-border-orca rounded p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-text font-bold">CURRENT VELOCITY SPECIFICATION</span>
                  <span className="text-[9px] text-amber-600 bg-amber-50 px-1 py-0.5 border border-amber-200 rounded font-bold">
                    PHY_001_024
                  </span>
                </div>
                <p className="text-[10px] text-muted-orca leading-relaxed">
                  Copernicus Marine physical model parameters (uo: eastward sea water velocity, vo: northward sea water velocity) are configured in layer architecture. Vector streaming visualization will be enabled in Phase 3.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'depth' && (
            <div className="w-full flex items-center justify-between gap-6">
              <div className="bg-secondary-surface border border-border-orca rounded p-3 min-w-[200px] space-y-1">
                <span className="text-[9px] text-muted-orca uppercase block">Current Depth Target</span>
                <div className="text-xl font-bold text-primary-text">
                  {selectedDepth === 0 ? 'SURFACE (0 m)' : `${selectedDepth} METERS`}
                </div>
                <div className="text-[9px] text-amber-700 font-bold">
                  {selectedDepth === 0 ? '● SURFACE OBS READY' : '○ 3D MODEL REQUIRED'}
                </div>
              </div>

              <div className="flex-1 bg-white border border-border-orca rounded p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-secondary-text font-bold">3D VOLUMETRIC HYDROGRAPHIC ANALYSIS</span>
                  <span className="text-[9px] text-amber-700 bg-amber-50 px-1 py-0.5 border border-amber-200 rounded font-bold">
                    DATASET NOT AVAILABLE AT DEPTH
                  </span>
                </div>
                <p className="text-[10px] text-muted-orca leading-relaxed">
                  Active Copernicus Marine WMTS products operate on 2D surface projection (EPSG:3857). Subsurface depth profiling requires baroclinic 3D array assimilation.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
