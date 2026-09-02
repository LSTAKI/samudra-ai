'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import OceanPointInspector from './OceanPointInspector';
import {
  Compass,
  Layers,
  Thermometer,
  Waves,
  Droplet,
  Activity,
  Info,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function OceanProfile() {
  const {
    selectedLatitude,
    selectedLongitude,
    selectedCoordinates,
    selectedParameter,
    selectedDepth,
    selectedTimestamp
  } = useOrcaStore();

  const lat = selectedCoordinates ? selectedCoordinates.lat : (selectedLatitude ?? 9.9312);
  const lng = selectedCoordinates ? selectedCoordinates.lng : (selectedLongitude ?? 76.2673);

  return (
    <aside className="w-80 border-l border-border-orca bg-secondary-surface flex flex-col h-full select-none overflow-y-auto z-20 shrink-0">
      {/* Header */}
      <div className="h-11 px-4 border-b border-border-orca flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center space-x-2">
          <Compass className="w-3.5 h-3.5 text-orca-blue" />
          <span className="text-[11px] font-bold text-primary-text uppercase tracking-wider font-mono">
            OCEAN DATA INSPECTOR
          </span>
        </div>
        <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-300 rounded font-bold">
          COPERNICUS
        </span>
      </div>

      <div className="p-3 space-y-3 flex-1">
        {/* Real Point Inspector */}
        <OceanPointInspector />

        {/* Depth Profile Section */}
        <div className="border border-border-orca rounded p-3 bg-white space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">
              DEPTH PROFILE (Z-AXIS)
            </span>
            <span className="text-[8px] text-amber-700 font-bold px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200">
              SURFACE DATASET
            </span>
          </div>

          <div className="bg-secondary-surface border border-border-orca/80 rounded p-2.5 text-center space-y-1.5">
            <div className="w-7 h-7 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-secondary-text">
              <Layers className="w-3.5 h-3.5 text-muted-orca" />
            </div>
            <p className="text-[9px] font-mono text-secondary-text leading-relaxed">
              SURFACE LEVEL OBSERVATION (0m DEPTH)
            </p>
            <p className="text-[8px] text-muted-orca leading-normal">
              Active Copernicus product provides L4 gap-free surface observations. Subsurface 3D profiles require physical in-situ ARGO profiling or 3D hydrodynamic models.
            </p>
          </div>
        </div>

        {/* Canonical Temporal Metadata */}
        <div className="space-y-1 bg-white border border-border-orca rounded p-2.5 text-[8.5px] font-mono text-muted-orca">
          <div className="flex justify-between">
            <span>GRID RESOLUTION:</span>
            <span className="font-bold text-primary-text">0.05° (~5 km)</span>
          </div>
          <div className="flex justify-between">
            <span>VALIDATION:</span>
            <span className="font-bold text-emerald-700">OPERATIONAL QUALITY ASSURED</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
