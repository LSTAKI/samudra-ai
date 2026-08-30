'use client';

import React from 'react';
import {
  mockSSTTimeSeries,
  mockChlorophyllTimeSeries,
  mockWaveTimeSeries
} from '@/mock/mockAnalytics';
import { Layers, Activity, Thermometer, Waves } from 'lucide-react';

export default function AnalyticsParameterComparison() {
  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-3 font-sans select-none shadow-xs">
      <div className="flex items-center justify-between border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            MULTI-PARAMETER NORMALIZED CO-VARIATION
          </h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
          DEMO ANALYTICS
        </span>
      </div>

      {/* Normalized Comparison Chart Grid */}
      <div className="space-y-3 font-mono text-[9px]">
        {/* SST Track */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-secondary-text">
            <span className="flex items-center gap-1 font-bold text-red-600">
              <Thermometer className="w-3 h-3" />
              SEA SURFACE TEMP (OSTIA L4 · °C)
            </span>
            <span className="text-primary-text font-bold">28.95 °C</span>
          </div>
          <div className="flex items-end h-8 gap-1 bg-secondary-surface p-1 rounded border border-border-orca">
            {mockSSTTimeSeries.map((pt) => {
              const h = Math.max(15, ((pt.value - 27.5) / 1.8) * 100);
              return (
                <div
                  key={pt.date}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-red-400/80 rounded-t-xs hover:bg-red-500 transition-colors"
                  title={`${pt.date}: ${pt.value}°C`}
                />
              );
            })}
          </div>
        </div>

        {/* Chlorophyll Track */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-secondary-text">
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <Activity className="w-3 h-3" />
              CHLOROPHYLL-a (BGC L4 · mg/m³)
            </span>
            <span className="text-primary-text font-bold">0.57 mg/m³</span>
          </div>
          <div className="flex items-end h-8 gap-1 bg-secondary-surface p-1 rounded border border-border-orca">
            {mockChlorophyllTimeSeries.map((pt) => {
              const h = Math.max(15, (pt.value / 0.7) * 100);
              return (
                <div
                  key={pt.date}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-emerald-500/80 rounded-t-xs hover:bg-emerald-600 transition-colors"
                  title={`${pt.date}: ${pt.value} mg/m³`}
                />
              );
            })}
          </div>
        </div>

        {/* Waves Track */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-secondary-text">
            <span className="flex items-center gap-1 font-bold text-blue-600">
              <Waves className="w-3 h-3" />
              WAVE HEIGHT (WAV L4 · m)
            </span>
            <span className="text-primary-text font-bold">1.50 m</span>
          </div>
          <div className="flex items-end h-8 gap-1 bg-secondary-surface p-1 rounded border border-border-orca">
            {mockWaveTimeSeries.map((pt) => {
              const h = Math.max(15, (pt.value / 2.5) * 100);
              return (
                <div
                  key={pt.date}
                  style={{ height: `${h}%` }}
                  className="flex-1 bg-blue-500/80 rounded-t-xs hover:bg-blue-600 transition-colors"
                  title={`${pt.date}: ${pt.value} m`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-[8px] font-mono text-muted-orca flex items-center justify-between pt-1 border-t border-border-orca">
        <span>Timeline interval: Daily (01 Aug – 29 Aug 2026)</span>
        <span>Cross-parameter correlation index: +0.64 (Thermal front vs Chlorophyll plume)</span>
      </div>
    </div>
  );
}
