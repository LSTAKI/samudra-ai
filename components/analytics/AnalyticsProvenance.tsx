'use client';

import React from 'react';
import { Database, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function AnalyticsProvenance() {
  return (
    <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-2 font-mono text-[9px] select-none">
      <div className="flex items-center justify-between border-b border-border-orca pb-1">
        <span className="font-bold text-primary-text uppercase tracking-wider flex items-center gap-1">
          <Database className="w-3 h-3 text-orca-blue" />
          ANALYTICAL DATA PROVENANCE
        </span>
        <span className="text-success-orca bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-bold">
          VALIDATED FEEDS
        </span>
      </div>

      <div className="space-y-1 text-muted-orca">
        <div className="flex justify-between">
          <span className="font-bold text-secondary-text">COPERNICUS SST:</span>
          <span>OSTIA L4 NRT (analysed_sst · 0.05° · °C) · REAL DATA</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-secondary-text">COPERNICUS CHL-a:</span>
          <span>OCEANCOLOUR BGC L4 (CHL · 4km · mg/m³) · REAL DATA</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold text-secondary-text">COPERNICUS WAVES:</span>
          <span>GLOBAL WAV L4 NRT (VHM0 · 0.083° · m) · REAL DATA</span>
        </div>
        <div className="flex justify-between border-t border-border-orca/60 pt-1 text-amber-700">
          <span className="font-bold">EXTERNAL SENSORS:</span>
          <span>ISRO / INCOIS / NOAA point feeds are currently modeled as DEMO FEEDS</span>
        </div>
      </div>
    </div>
  );
}
