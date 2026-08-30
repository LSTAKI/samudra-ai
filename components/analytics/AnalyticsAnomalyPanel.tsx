'use client';

import React from 'react';
import { mockAnomalyResults } from '@/mock/mockAnalytics';
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

export default function AnalyticsAnomalyPanel() {
  const getBadgeClass = (classification: string) => {
    switch (classification) {
      case 'WARMING ANOMALY':
        return 'text-danger-orca bg-red-50 border-red-200';
      case 'BLOOM ENHANCED':
        return 'text-success-orca bg-emerald-50 border-emerald-200';
      case 'COOLING ANOMALY':
        return 'text-orca-blue bg-blue-50 border-blue-200';
      case 'NORMAL':
      default:
        return 'text-secondary-text bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-3 font-sans select-none shadow-xs">
      <div className="flex items-center justify-between border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            ANOMALY DETECTION & CLIMATOLOGICAL BASELINE
          </h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
          DEMO ANALYTICS
        </span>
      </div>

      <div className="space-y-2 font-mono text-[9px]">
        {mockAnomalyResults.map((item) => {
          const isPositive = item.anomaly >= 0;

          return (
            <div
              key={item.parameter}
              className="p-2 bg-secondary-surface rounded border border-border-orca flex flex-wrap items-center justify-between gap-2"
            >
              <div className="space-y-0.5">
                <span className="font-bold text-primary-text block">{item.parameter}</span>
                <span className={`px-1.5 py-0.2 rounded border text-[8px] font-bold ${getBadgeClass(item.classification)}`}>
                  {item.classification}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-right">
                <div>
                  <span className="text-[8px] text-muted-orca uppercase block">OBSERVED</span>
                  <span className="font-bold text-primary-text">
                    {item.currentValue} {item.unit}
                  </span>
                </div>

                <div>
                  <span className="text-[8px] text-muted-orca uppercase block">30D BASELINE</span>
                  <span className="text-secondary-text">
                    {item.baselineValue} {item.unit}
                  </span>
                </div>

                <div className="min-w-16">
                  <span className="text-[8px] text-muted-orca uppercase block">ANOMALY DELTA</span>
                  <span className={`font-bold ${isPositive ? 'text-danger-orca' : 'text-orca-blue'}`}>
                    {isPositive ? `+${item.anomaly}` : item.anomaly} {item.unit}
                    <span className="text-[8px] font-normal block">
                      ({isPositive ? `+${item.anomalyPercent}%` : `${item.anomalyPercent}%`})
                    </span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[8px] font-mono text-muted-orca pt-1 border-t border-border-orca">
        Baselines calculated against Copernicus OSTIA / BGC 20-year August reanalysis climatology.
      </div>
    </div>
  );
}
