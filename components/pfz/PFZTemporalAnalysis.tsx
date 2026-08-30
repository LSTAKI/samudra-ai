'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { Clock, Calendar, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function PFZTemporalAnalysis() {
  const {
    timelineIndex,
    setTimelineIndex,
    selectedTimestamp
  } = useOrcaStore();

  const labels = [
    { label: '-72h', index: 0 },
    { label: '-48h', index: 1 },
    { label: '-24h', index: 2 },
    { label: 'NOW', index: 3 }
  ];

  const formatDisplayTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return d.toUTCString().replace('GMT', 'UTC');
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 font-mono text-[10px] select-none bg-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-orca-blue" />
          <span className="font-bold text-primary-text uppercase">
            PFZ RETROSPECTIVE TEMPORAL ANALYSIS
          </span>
          <span className="text-[8px] text-muted-orca">
            (HISTORICAL CONVERGENCE PERSISTENCE)
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[8px] text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded font-bold">
            HISTORICAL WINDOW ONLY (NO FORECASTS)
          </span>
          <span className="text-secondary-text font-bold">
            {formatDisplayTime(selectedTimestamp)}
          </span>
        </div>
      </div>

      {/* Stepped Timeline Track */}
      <div className="flex items-center justify-between px-6 py-2 bg-secondary-surface rounded border border-border-orca">
        {labels.map((item) => {
          const isActive = timelineIndex === item.index;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setTimelineIndex(item.index)}
              className={`flex flex-col items-center space-y-1 transition-all ${
                isActive
                  ? 'text-orca-blue font-bold scale-105'
                  : 'text-secondary-text hover:text-primary-text'
              }`}
            >
              <span className="text-xs">{item.label}</span>
              <div
                className={`w-3 h-3 rounded-full border-2 transition-all ${
                  isActive
                    ? 'bg-orca-blue border-white ring-2 ring-orca-blue'
                    : 'bg-white border-border-orca hover:border-orca-blue'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Persistence Note */}
      <div className="text-[8px] text-muted-orca flex items-center justify-between">
        <span>Active raster tiles synchronize with canonical UTC timestamp.</span>
        <span>Convergence front stability: 72-hour window</span>
      </div>
    </div>
  );
}
