'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import {
  Thermometer,
  Activity,
  Waves,
  Droplet,
  Compass,
  Layers,
  Check
} from 'lucide-react';

export default function PFZParameterSelector() {
  const { pfzActiveRaster, setPFZActiveRaster } = useOrcaStore();

  const parameters = [
    {
      id: 'sst',
      name: 'SEA SURFACE TEMP',
      source: 'Copernicus OSTIA L4',
      status: 'REAL DATA',
      isReal: true,
      icon: Thermometer
    },
    {
      id: 'chl',
      name: 'CHLOROPHYLL-a',
      source: 'Copernicus BGC L4',
      status: 'REAL DATA',
      isReal: true,
      icon: Activity
    },
    {
      id: 'wave',
      name: 'WAVE HEIGHT (Hm0)',
      source: 'Copernicus WAV L4',
      status: 'REAL DATA',
      isReal: true,
      icon: Waves
    },
    {
      id: 'sla',
      name: 'SEA LEVEL ANOMALY',
      source: 'Copernicus DUACS L4',
      status: 'REAL DATA',
      isReal: true,
      icon: Droplet
    },
    {
      id: 'cur',
      name: 'OCEAN CURRENTS',
      source: 'Copernicus PHY_001_024',
      status: 'AVAILABLE SOON',
      isReal: false,
      icon: Compass
    },
    {
      id: 'bathy',
      name: 'BATHYMETRY DEPTH',
      source: 'GEBCO 15-Arcsec',
      status: 'UNAVAILABLE',
      isReal: false,
      icon: Layers
    }
  ];

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono flex items-center gap-1">
          <Layers className="w-3 h-3 text-orca-blue" />
          ENVIRONMENTAL PARAMETERS
        </h3>
        <span className="text-[9px] font-mono text-muted-orca">INPUT SOURCES</span>
      </div>

      {/* Map Background Raster Selection */}
      <div className="bg-secondary-surface p-2 rounded border border-border-orca space-y-1.5 font-mono text-[9px]">
        <span className="text-secondary-text font-bold block uppercase">
          BACKGROUND MAP RASTER
        </span>
        <div className="grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => setPFZActiveRaster('chlorophyll')}
            className={`py-1 rounded border text-center transition-all ${
              pfzActiveRaster === 'chlorophyll'
                ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
            }`}
          >
            CHLOROPHYLL
          </button>
          <button
            type="button"
            onClick={() => setPFZActiveRaster('sst')}
            className={`py-1 rounded border text-center transition-all ${
              pfzActiveRaster === 'sst'
                ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
            }`}
          >
            SST RASTER
          </button>
          <button
            type="button"
            onClick={() => setPFZActiveRaster('none')}
            className={`py-1 rounded border text-center transition-all ${
              pfzActiveRaster === 'none'
                ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
            }`}
          >
            BASEMAP ONLY
          </button>
        </div>
      </div>

      {/* Parameter Cards List */}
      <div className="space-y-1">
        {parameters.map((param) => {
          const Icon = param.icon;
          return (
            <div
              key={param.id}
              className="flex items-center justify-between p-1.5 rounded border border-border-orca bg-white text-[9px] font-mono"
            >
              <div className="flex items-center space-x-1.5 truncate">
                <Icon className="w-3 h-3 text-secondary-text shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-primary-text block truncate">
                    {param.name}
                  </span>
                  <span className="text-[8px] text-muted-orca block truncate">
                    {param.source}
                  </span>
                </div>
              </div>

              <div>
                {param.isReal ? (
                  <span className="text-[8px] font-mono font-bold text-success-orca bg-success-orca/10 border border-success-orca/30 px-1 py-0.2 rounded">
                    ● REAL DATA
                  </span>
                ) : param.status === 'AVAILABLE SOON' ? (
                  <span className="text-[8px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
                    ○ SOON
                  </span>
                ) : (
                  <span className="text-[8px] font-mono font-bold text-muted-orca bg-slate-100 border border-slate-200 px-1 py-0.2 rounded">
                    ○ N/A
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
