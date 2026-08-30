'use client';

import React from 'react';
import { mockPFZZones } from '@/mock/mockPFZ';
import { Thermometer, Activity, Waves } from 'lucide-react';

export default function PFZEnvironmentalCharts() {
  return (
    <div className="w-full h-full flex flex-col justify-between p-3 font-mono text-[9px] select-none bg-white">
      <div className="flex items-center justify-between border-b border-border-orca pb-1">
        <span className="font-bold text-secondary-text uppercase tracking-wider">
          CROSS-ZONE ENVIRONMENTAL COMPARISON
        </span>
        <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
          DEMO ANALYTICS
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 flex-1 pt-2">
        {/* SST Chart Card */}
        <div className="bg-secondary-surface p-2 rounded border border-border-orca space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary-text flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-red-500" />
              SST (°C)
            </span>
            <span className="text-[8px] text-muted-orca">Range: 27-30°C</span>
          </div>

          <div className="flex items-end justify-between h-12 gap-1.5 px-1">
            {mockPFZZones.map((z) => {
              const heightPct = Math.max(20, ((z.metrics.sst - 26) / 4) * 100);
              return (
                <div key={z.id} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[7px] font-bold text-primary-text">{z.metrics.sst}</span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-red-400/80 rounded-t-xs"
                    title={`${z.id}: ${z.metrics.sst}°C`}
                  />
                  <span className="text-[7px] text-muted-orca">{z.id.replace('ZONE-', 'Z')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chlorophyll Chart Card */}
        <div className="bg-secondary-surface p-2 rounded border border-border-orca space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary-text flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-600" />
              CHLOROPHYLL (mg/m³)
            </span>
            <span className="text-[8px] text-muted-orca">Bloom index</span>
          </div>

          <div className="flex items-end justify-between h-12 gap-1.5 px-1">
            {mockPFZZones.map((z) => {
              const heightPct = Math.max(15, (z.metrics.chlorophyll / 0.8) * 100);
              return (
                <div key={z.id} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[7px] font-bold text-primary-text">{z.metrics.chlorophyll}</span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-emerald-500/80 rounded-t-xs"
                    title={`${z.id}: ${z.metrics.chlorophyll} mg/m³`}
                  />
                  <span className="text-[7px] text-muted-orca">{z.id.replace('ZONE-', 'Z')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wave Height Chart Card */}
        <div className="bg-secondary-surface p-2 rounded border border-border-orca space-y-1.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary-text flex items-center gap-1">
              <Waves className="w-3 h-3 text-blue-500" />
              WAVE HEIGHT (m)
            </span>
            <span className="text-[8px] text-muted-orca">Operational limit &lt; 2.5m</span>
          </div>

          <div className="flex items-end justify-between h-12 gap-1.5 px-1">
            {mockPFZZones.map((z) => {
              const heightPct = Math.max(20, (z.metrics.waveHeight / 3.0) * 100);
              return (
                <div key={z.id} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[7px] font-bold text-primary-text">{z.metrics.waveHeight}</span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-blue-500/80 rounded-t-xs"
                    title={`${z.id}: ${z.metrics.waveHeight}m`}
                  />
                  <span className="text-[7px] text-muted-orca">{z.id.replace('ZONE-', 'Z')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
