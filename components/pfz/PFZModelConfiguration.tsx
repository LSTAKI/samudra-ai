'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { Sliders, Cpu, Info } from 'lucide-react';

export default function PFZModelConfiguration() {
  const { pfzModelWeights, setPFZModelWeights } = useOrcaStore();

  const factors = [
    { key: 'sst', label: 'SST GRADIENT', value: pfzModelWeights.sst },
    { key: 'chlorophyll', label: 'CHLOROPHYLL CONVERGENCE', value: pfzModelWeights.chlorophyll },
    { key: 'current', label: 'CURRENT SHEAR VORTICITY', value: pfzModelWeights.current },
    { key: 'waveHeight', label: 'WAVE HEIGHT SEA STATE', value: pfzModelWeights.waveHeight },
    { key: 'bathymetry', label: 'BATHYMETRY SHELF BREAK', value: pfzModelWeights.bathymetry }
  ];

  return (
    <div className="space-y-2 select-none border-t border-border-orca pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono flex items-center gap-1">
          <Cpu className="w-3 h-3 text-orca-blue" />
          MODEL CONFIGURATION
        </h3>
        <span className="text-[8px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
          DEMO WEIGHTS
        </span>
      </div>

      <div className="space-y-2 bg-secondary-surface p-2.5 rounded border border-border-orca font-mono text-[9px]">
        {factors.map((factor) => (
          <div key={factor.key} className="space-y-1">
            <div className="flex justify-between">
              <span className="text-secondary-text font-bold">{factor.label}</span>
              <span className="text-primary-text font-bold">{factor.value}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={factor.value}
              onChange={(e) =>
                setPFZModelWeights({ [factor.key]: parseInt(e.target.value, 10) })
              }
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-ocean-navy"
            />
          </div>
        ))}

        <div className="pt-1.5 border-t border-border-orca/60 text-[8px] text-muted-orca leading-tight flex items-start gap-1">
          <Info className="w-3 h-3 text-secondary-text shrink-0 mt-0.5" />
          <span>
            Factor weights adjust candidate scoring heuristics for frontend demonstration. They are not validated for operational fisheries deployment.
          </span>
        </div>
      </div>
    </div>
  );
}
