'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function OceanTemporalControl() {
  const {
    timelineIndex,
    setTimelineIndex,
    selectedTimestamp,
    timelineFrameType
  } = useOrcaStore();

  const handlePrev = () => {
    if (timelineIndex > 0) {
      setTimelineIndex(timelineIndex - 1);
    }
  };

  const handleNext = () => {
    if (timelineIndex < 5) {
      setTimelineIndex(timelineIndex + 1);
    }
  };

  const formatDisplayTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      const day = d.getUTCDate();
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = months[d.getUTCMonth()];
      const year = d.getUTCFullYear();
      const hours = String(d.getUTCHours()).padStart(2, '0');
      const mins = String(d.getUTCMinutes()).padStart(2, '0');
      return `${day} ${month} ${year} · ${hours}:${mins} UTC`;
    } catch {
      return timeStr;
    }
  };

  const labels = ['-72h', '-48h', '-24h', 'NOW', '+24h', '+48h'];

  return (
    <div className="flex items-center space-x-2 bg-white/95 border border-border-orca rounded-md px-2 py-1 shadow-sm backdrop-blur-sm select-none font-mono text-xs">
      <div className="flex items-center space-x-1 pr-2 border-r border-border-orca text-muted-orca">
        <Clock className="w-3.5 h-3.5 text-orca-blue" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-text">
          TIME
        </span>
      </div>

      <button
        type="button"
        onClick={handlePrev}
        disabled={timelineIndex <= 0}
        className="p-1 rounded text-secondary-text hover:text-primary-text hover:bg-secondary-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Previous frame (-24h)"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div className="flex items-center space-x-2 px-1 text-[11px] font-bold text-primary-text">
        <span>{formatDisplayTime(selectedTimestamp)}</span>
        {timelineFrameType === 'UNAVAILABLE' ? (
          <span className="text-[9px] text-amber-700 font-bold px-1 rounded bg-amber-50 border border-amber-200">
            FORECAST N/A
          </span>
        ) : (
          <span className="text-[9px] text-success-orca font-bold px-1 rounded bg-success-orca/10 border border-success-orca/30">
            OBSERVATION
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        disabled={timelineIndex >= 5}
        className="p-1 rounded text-secondary-text hover:text-primary-text hover:bg-secondary-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        title="Next frame (+24h)"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      <span className="text-[9px] text-muted-orca pl-1 border-l border-border-orca">
        [{labels[timelineIndex]}]
      </span>
    </div>
  );
}
