'use client';

import React from 'react';
import { PFZZone } from '@/types/pfz';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Thermometer, Activity, Waves, Anchor } from 'lucide-react';

interface Props {
  zone: PFZZone;
}

export default function PFZExplainability({ zone }: Props) {
  const sstStatus = zone.sst_gradient_c_per_km >= 0.35 ? 'FAVORABLE' : 'MODERATE';
  const chlStatus = zone.chlorophyll_mg_m3 >= 0.8 ? 'FAVORABLE' : 'MODERATE';
  const waveStatus = zone.wave_height_m <= 2.0 ? 'FAVORABLE' : 'MODERATE';

  return (
    <div className="border border-border-orca rounded p-2.5 bg-secondary-surface space-y-2 select-none">
      <div className="flex items-center justify-between font-mono text-[10px]">
        <span className="font-bold text-secondary-text uppercase tracking-wider">
          DETERMINISTIC GRADIENT EXPLAINABILITY
        </span>
        <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-300 font-bold">
          {zone.method_version || 'v1.0-deterministic'}
        </span>
      </div>

      <div className="space-y-1.5 font-mono text-[9px]">
        {/* Factor 1: Thermal Front */}
        <div className="p-1.5 bg-white rounded border border-border-orca/80 space-y-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 font-bold text-primary-text">
              <Thermometer className="w-3 h-3 text-red-500" />
              <span>SST Front Gradient</span>
            </div>
            <span className={`px-1 py-0.2 rounded border text-[8px] font-bold ${
              sstStatus === 'FAVORABLE' ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : 'text-amber-700 bg-amber-50 border-amber-300'
            }`}>
              {sstStatus} ({zone.sst_gradient_c_per_km.toFixed(2)} °C/km)
            </span>
          </div>
          <p className="text-[8px] text-muted-orca leading-tight pl-4">
            Observed SST of {zone.sst_c.toFixed(1)}°C with sharp horizontal temperature gradient.
          </p>
        </div>

        {/* Factor 2: Chlorophyll Plume */}
        <div className="p-1.5 bg-white rounded border border-border-orca/80 space-y-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 font-bold text-primary-text">
              <Activity className="w-3 h-3 text-emerald-600" />
              <span>Phytoplankton Density</span>
            </div>
            <span className={`px-1 py-0.2 rounded border text-[8px] font-bold ${
              chlStatus === 'FAVORABLE' ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : 'text-amber-700 bg-amber-50 border-amber-300'
            }`}>
              {chlStatus} ({zone.chlorophyll_mg_m3.toFixed(2)} mg/m³)
            </span>
          </div>
          <p className="text-[8px] text-muted-orca leading-tight pl-4">
            Elevated chlorophyll accumulation front indicating high forage potential.
          </p>
        </div>

        {/* Factor 3: Sea State */}
        <div className="p-1.5 bg-white rounded border border-border-orca/80 space-y-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 font-bold text-primary-text">
              <Waves className="w-3 h-3 text-blue-600" />
              <span>Sea State & Wave Safety</span>
            </div>
            <span className={`px-1 py-0.2 rounded border text-[8px] font-bold ${
              waveStatus === 'FAVORABLE' ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : 'text-amber-700 bg-amber-50 border-amber-300'
            }`}>
              {waveStatus} ({zone.wave_height_m.toFixed(1)} m)
            </span>
          </div>
          <p className="text-[8px] text-muted-orca leading-tight pl-4">
            Significant wave height within safe operational envelope for traditional craft.
          </p>
        </div>
      </div>

      {/* Rationale text */}
      {zone.rationale && (
        <div className="p-2 bg-emerald-50/50 rounded border border-emerald-200 text-[8.5px] text-emerald-900 leading-relaxed font-sans">
          <span className="font-bold font-mono uppercase block text-[8px] text-emerald-800 mb-0.5">Scientific Rationale:</span>
          {zone.rationale}
        </div>
      )}
    </div>
  );
}
