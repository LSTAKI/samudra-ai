'use client';

import React from 'react';
import { mockSourceComparisonRows } from '@/mock/mockAnalytics';
import { Network, ShieldCheck, AlertCircle, Info, GitCompare } from 'lucide-react';

export default function AnalyticsSourceComparison() {
  const sources = [
    { id: 'copernicus' as const, name: 'COPERNICUS MARINE', type: 'REAL DATA' },
    { id: 'isro' as const, name: 'ISRO MOSDAC', type: 'DEMO / PHASE 3' },
    { id: 'incois' as const, name: 'INCOIS OOS', type: 'DEMO / PHASE 3' },
    { id: 'noaa' as const, name: 'NOAA COASTWATCH', type: 'DEMO / PHASE 3' }
  ];

  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-3 font-sans select-none shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            CROSS-SOURCE SENSOR COMPARISON (COPERNICUS · ISRO · INCOIS · NOAA)
          </h3>
        </div>

        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
          MULTI-SOURCE ARCHITECTURE
        </span>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-[9px] border-collapse">
          <thead>
            <tr className="bg-secondary-surface text-secondary-text border-b border-border-orca">
              <th className="py-2 px-2.5 uppercase tracking-wider">PARAMETER / PRODUCT</th>
              {sources.map((s) => (
                <th key={s.id} className="py-2 px-2.5 uppercase tracking-wider">
                  <div className="flex flex-col">
                    <span className="font-bold text-primary-text">{s.name}</span>
                    <span className="text-[8px] text-muted-orca font-normal">{s.type}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-orca/60">
            {mockSourceComparisonRows.map((row) => (
              <tr key={row.parameterId} className="hover:bg-secondary-surface/40 transition-colors">
                <td className="py-2 px-2.5 font-bold text-primary-text whitespace-nowrap">
                  {row.parameterName}
                  <span className="text-muted-orca font-normal block text-[8px]">
                    Standard Unit: {row.unit}
                  </span>
                </td>

                {sources.map((s) => {
                  const cell = row.cells[s.id];
                  if (!cell || cell.value === null) {
                    return (
                      <td key={s.id} className="py-2 px-2.5 whitespace-nowrap text-muted-orca">
                        <span className="px-1 py-0.2 rounded border border-slate-200 bg-slate-50 text-[8px]">
                          ○ UNAVAILABLE
                        </span>
                      </td>
                    );
                  }

                  const isReal = cell.feedType === 'REAL DATA';

                  return (
                    <td key={s.id} className="py-2 px-2.5 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-1">
                          <span className="font-bold text-primary-text">
                            {cell.value} {cell.unit}
                          </span>
                          <span
                            className={`px-1 py-0.2 rounded border text-[7px] font-bold ${
                              isReal
                                ? 'text-success-orca bg-emerald-50 border-emerald-200'
                                : 'text-amber-700 bg-amber-50 border-amber-200'
                            }`}
                          >
                            {cell.feedType}
                          </span>
                        </div>
                        <span className="text-[8px] text-muted-orca block truncate max-w-36">
                          {cell.datasetName}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Source Agreement & Consensus Strip */}
      <div className="p-2.5 bg-secondary-surface rounded border border-border-orca font-mono text-[9px] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <GitCompare className="w-3.5 h-3.5 text-orca-blue" />
          <span className="font-bold text-primary-text uppercase">MULTI-SOURCE CONSENSUS:</span>
          <span className="text-muted-orca bg-white px-1.5 py-0.5 rounded border border-border-orca font-bold">
            NOT CALCULATED
          </span>
        </div>

        <div className="text-[8px] text-muted-orca max-w-md">
          Consensus metrics (Bayesian model averaging, sensor bias correction, inter-calibrated spread) are scheduled for Phase 3 live backend ingestion.
        </div>
      </div>
    </div>
  );
}
