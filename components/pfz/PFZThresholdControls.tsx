'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { SlidersHorizontal, AlertCircle } from 'lucide-react';

export default function PFZThresholdControls() {
  const { pfzThresholds, setPFZThresholds } = useOrcaStore();

  return (
    <div className="space-y-2 select-none border-t border-border-orca pt-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3 text-orca-blue" />
          FILTER THRESHOLDS
        </h3>
        <span className="text-[8px] font-mono text-muted-orca">LIMITS</span>
      </div>

      <div className="bg-secondary-surface p-2.5 rounded border border-border-orca space-y-2 font-mono text-[9px]">
        {/* SST Range */}
        <div className="space-y-1">
          <span className="text-secondary-text font-bold block">SST RANGE (°C)</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[8px] text-muted-orca block">Min</span>
              <input
                type="number"
                step="0.5"
                value={pfzThresholds.sstMin}
                onChange={(e) => setPFZThresholds({ sstMin: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-border-orca rounded px-1.5 py-0.5 text-[9px] text-primary-text"
              />
            </div>
            <div>
              <span className="text-[8px] text-muted-orca block">Max</span>
              <input
                type="number"
                step="0.5"
                value={pfzThresholds.sstMax}
                onChange={(e) => setPFZThresholds({ sstMax: parseFloat(e.target.value) || 35 })}
                className="w-full bg-white border border-border-orca rounded px-1.5 py-0.5 text-[9px] text-primary-text"
              />
            </div>
          </div>
        </div>

        {/* Chlorophyll Range */}
        <div className="space-y-1 pt-1 border-t border-border-orca/60">
          <span className="text-secondary-text font-bold block">CHLOROPHYLL (mg/m³)</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[8px] text-muted-orca block">Min</span>
              <input
                type="number"
                step="0.05"
                value={pfzThresholds.chlMin}
                onChange={(e) => setPFZThresholds({ chlMin: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-border-orca rounded px-1.5 py-0.5 text-[9px] text-primary-text"
              />
            </div>
            <div>
              <span className="text-[8px] text-muted-orca block">Max</span>
              <input
                type="number"
                step="0.1"
                value={pfzThresholds.chlMax}
                onChange={(e) => setPFZThresholds({ chlMax: parseFloat(e.target.value) || 5 })}
                className="w-full bg-white border border-border-orca rounded px-1.5 py-0.5 text-[9px] text-primary-text"
              />
            </div>
          </div>
        </div>

        {/* Wave Height Max */}
        <div className="space-y-1 pt-1 border-t border-border-orca/60">
          <div className="flex justify-between">
            <span className="text-secondary-text font-bold">MAX WAVE HEIGHT</span>
            <span className="text-primary-text font-bold">{pfzThresholds.waveMax} m</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.2"
            value={pfzThresholds.waveMax}
            onChange={(e) => setPFZThresholds({ waveMax: parseFloat(e.target.value) })}
            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-ocean-navy"
          />
        </div>

        <div className="pt-1 text-[8px] text-muted-orca">
          <span>Thresholds define visual candidate filtering boundaries only.</span>
        </div>
      </div>
    </div>
  );
}
