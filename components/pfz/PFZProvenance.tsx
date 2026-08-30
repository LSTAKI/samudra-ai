'use client';

import React from 'react';
import { Database, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function PFZProvenance() {
  return (
    <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-2 font-mono text-[9px] select-none">
      <div className="flex items-center justify-between border-b border-border-orca pb-1">
        <span className="font-bold text-primary-text uppercase tracking-wider flex items-center gap-1">
          <Database className="w-3 h-3 text-orca-blue" />
          PFZ PROVENANCE & VALIDATION
        </span>
        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-bold">
          DEMO ENGINE
        </span>
      </div>

      <div className="space-y-1.5 text-muted-orca">
        <div className="flex items-start gap-1.5">
          <ShieldCheck className="w-3 h-3 text-success-orca shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary-text block">ENVIRONMENTAL DATA:</span>
            <span>Real verified Copernicus Marine L4 rasters (OSTIA SST, BGC Chlorophyll, WAV Wave Height).</span>
          </div>
        </div>

        <div className="flex items-start gap-1.5 pt-1 border-t border-border-orca/60">
          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary-text block">PFZ CANDIDATE ZONES:</span>
            <span>Candidate geometries & confidence scores are generated for frontend UI development (Demo Model).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
