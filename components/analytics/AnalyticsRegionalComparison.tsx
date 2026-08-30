'use client';

import React from 'react';
import { mockRegionalComparisons } from '@/mock/mockAnalytics';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { Globe2, MapPin } from 'lucide-react';

export default function AnalyticsRegionalComparison() {
  const { analyticsPrimaryParam } = useOrcaStore();

  let unit = '°C';
  let paramLabel = 'SST';
  let maxScale = 32;

  if (analyticsPrimaryParam === 'chlorophyll') {
    unit = 'mg/m³';
    paramLabel = 'Chlorophyll';
    maxScale = 1.0;
  } else if (analyticsPrimaryParam === 'waveHeight') {
    unit = 'm';
    paramLabel = 'Wave Height';
    maxScale = 3.5;
  } else if (analyticsPrimaryParam === 'seaLevel') {
    unit = 'm';
    paramLabel = 'SLA';
    maxScale = 0.15;
  }

  // Parameter-specific data mapping
  const regionalData = mockRegionalComparisons.map((reg) => {
    let val = reg.currentValue;
    let diff = reg.difference;

    if (analyticsPrimaryParam === 'chlorophyll') {
      const chlMap: Record<string, { val: number; diff: number }> = {
        as: { val: 0.38, diff: 0.04 },
        kc: { val: 0.65, diff: 0.18 },
        bob: { val: 0.44, diff: 0.06 },
        tn: { val: 0.52, diff: 0.11 },
        lk: { val: 0.41, diff: 0.05 },
        sl: { val: 0.48, diff: 0.09 }
      };
      val = chlMap[reg.id]?.val ?? 0.45;
      diff = chlMap[reg.id]?.diff ?? 0.05;
    } else if (analyticsPrimaryParam === 'waveHeight') {
      const waveMap: Record<string, { val: number; diff: number }> = {
        as: { val: 2.1, diff: 0.3 },
        kc: { val: 1.4, diff: -0.4 },
        bob: { val: 1.9, diff: 0.1 },
        tn: { val: 1.6, diff: -0.2 },
        lk: { val: 1.7, diff: -0.1 },
        sl: { val: 1.3, diff: -0.5 }
      };
      val = waveMap[reg.id]?.val ?? 1.6;
      diff = waveMap[reg.id]?.diff ?? 0.1;
    } else if (analyticsPrimaryParam === 'seaLevel') {
      const slaMap: Record<string, { val: number; diff: number }> = {
        as: { val: 0.05, diff: 0.03 },
        kc: { val: 0.03, diff: 0.01 },
        bob: { val: 0.07, diff: 0.05 },
        tn: { val: 0.04, diff: 0.02 },
        lk: { val: 0.06, diff: 0.04 },
        sl: { val: 0.05, diff: 0.03 }
      };
      val = slaMap[reg.id]?.val ?? 0.04;
      diff = slaMap[reg.id]?.diff ?? 0.02;
    }

    return { ...reg, displayVal: val, displayDiff: diff };
  });

  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-3 font-sans select-none shadow-xs">
      <div className="flex items-center justify-between border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            REGIONAL BASIN COMPARISON — {paramLabel}
          </h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
          DEMO ANALYTICS
        </span>
      </div>

      <div className="space-y-2 font-mono text-[9px]">
        {regionalData.map((reg) => {
          const isPositive = reg.displayDiff >= 0;

          return (
            <div
              key={reg.id}
              className="p-2 bg-secondary-surface rounded border border-border-orca space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 font-bold text-primary-text">
                  <MapPin className="w-3 h-3 text-secondary-text" />
                  <span>{reg.region}</span>
                  <span className="text-[8px] text-muted-orca font-normal">({reg.basin})</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-primary-text">
                    {reg.displayVal} {unit}
                  </span>
                  <span
                    className={`font-bold px-1 rounded border text-[8px] ${
                      isPositive
                        ? 'text-danger-orca bg-red-50 border-red-200'
                        : 'text-orca-blue bg-blue-50 border-blue-200'
                    }`}
                  >
                    {isPositive ? `+${reg.displayDiff}` : reg.displayDiff} {unit}
                  </span>
                </div>
              </div>

              {/* Visual Ratio Bar */}
              <div className="w-full bg-slate-200 h-1 rounded overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (reg.displayVal / maxScale) * 100)}%` }}
                  className="bg-ocean-navy h-full rounded"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[8px] font-mono text-muted-orca pt-1 border-t border-border-orca">
        North Indian Ocean regional thermal heterogeneity comparison across eastern and western shelves.
      </div>
    </div>
  );
}
