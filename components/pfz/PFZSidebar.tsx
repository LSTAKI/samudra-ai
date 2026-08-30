'use client';

import React from 'react';
import PFZRegionSelector from './PFZRegionSelector';
import PFZParameterSelector from './PFZParameterSelector';
import PFZModelConfiguration from './PFZModelConfiguration';
import PFZThresholdControls from './PFZThresholdControls';
import PFZProvenance from './PFZProvenance';
import { Target } from 'lucide-react';

export default function PFZSidebar() {
  return (
    <aside className="w-[320px] bg-white border-r border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            PFZ ANALYZER
          </h2>
        </div>
        <span className="text-[9px] font-mono text-muted-orca bg-white px-1.5 py-0.5 border border-border-orca rounded font-bold">
          DECISION SUPPORT
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Region Presets & Coordinates */}
        <PFZRegionSelector />

        {/* Environmental Parameter Layers & Raster Toggle */}
        <PFZParameterSelector />

        {/* Model Factors Weighting */}
        <PFZModelConfiguration />

        {/* Environmental Thresholds */}
        <PFZThresholdControls />

        {/* Data Provenance Card */}
        <PFZProvenance />
      </div>
    </aside>
  );
}
