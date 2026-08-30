'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { OperationalSeverity, OperationalEventCategory } from '@/types/command';
import { Filter, Clock } from 'lucide-react';

export default function CommandFilters() {
  const {
    commandSeverityFilter,
    setCommandSeverityFilter,
    commandCategoryFilter,
    setCommandCategoryFilter,
    commandTimeWindow,
    setCommandTimeWindow
  } = useOrcaStore();

  const severities: ('ALL' | OperationalSeverity)[] = [
    'ALL',
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW',
    'INFO'
  ];

  const categories = [
    'ALL',
    'BOUNDARY',
    'MARITIME SAFETY',
    'ENVIRONMENTAL',
    'PFZ',
    'SATELLITE',
    'SYSTEM'
  ];

  const timeWindows = ['1H', '6H', '12H', '24H', '7D'] as const;

  return (
    <div className="space-y-2 select-none font-mono text-[9px]">
      {/* Severity Filter Chips */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-muted-orca uppercase">
          <span className="flex items-center gap-1 font-bold text-secondary-text">
            <Filter className="w-2.5 h-2.5 text-orca-blue" />
            SEVERITY
          </span>
          <span>{commandSeverityFilter}</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {severities.map((sev) => {
            const isSelected = commandSeverityFilter === sev;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => setCommandSeverityFilter(sev)}
                className={`py-1 px-1.5 rounded border text-center transition-all ${
                  isSelected
                    ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                    : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="space-y-1 pt-1 border-t border-border-orca/60">
        <span className="text-secondary-text font-bold uppercase block">CATEGORY FILTER</span>
        <select
          value={commandCategoryFilter}
          onChange={(e) => setCommandCategoryFilter(e.target.value)}
          className="w-full bg-secondary-surface border border-border-orca rounded p-1 text-primary-text font-bold text-[9px] focus:outline-none focus:border-orca-blue"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Time Window Stepper */}
      <div className="space-y-1 pt-1 border-t border-border-orca/60">
        <div className="flex items-center justify-between text-muted-orca uppercase">
          <span className="flex items-center gap-1 font-bold text-secondary-text">
            <Clock className="w-2.5 h-2.5 text-orca-blue" />
            TIME WINDOW
          </span>
          <span>{commandTimeWindow} (UTC)</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {timeWindows.map((tw) => {
            const isSelected = commandTimeWindow === tw;
            return (
              <button
                key={tw}
                type="button"
                onClick={() => setCommandTimeWindow(tw)}
                className={`py-0.5 rounded border text-center transition-all ${
                  isSelected
                    ? 'bg-orca-blue text-white border-orca-blue font-bold shadow-xs'
                    : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
                }`}
              >
                {tw}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
