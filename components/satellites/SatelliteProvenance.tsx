'use client';

import React from 'react';
import { ShieldCheck, Info, Radio, Database } from 'lucide-react';

export default function SatelliteProvenance() {
  return (
    <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-2 font-mono text-[9px] select-none">
      <div className="flex items-center justify-between border-b border-border-orca pb-1">
        <span className="font-bold text-primary-text uppercase tracking-wider flex items-center gap-1">
          <Database className="w-3 h-3 text-orca-blue" />
          DATA PROVENANCE SPEC
        </span>
        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-bold">
          DEMO TELEMETRY
        </span>
      </div>

      <div className="space-y-1.5 text-muted-orca">
        <div className="flex items-start gap-1.5">
          <Radio className="w-3 h-3 text-secondary-text shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary-text block">SATELLITE OBSERVATION:</span>
            <span>Raw orbital swaths, sensor radiance footprints, and ground tracks (Demo Mock Data).</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 pt-1 border-t border-border-orca/60">
          <ShieldCheck className="w-3 h-3 text-success-orca shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary-text block">PROCESSED OCEAN PRODUCT:</span>
            <span>Gridded Level-4 reanalysis (Copernicus Marine OSTIA SST, Wave Hm0, DUACS SLA).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
