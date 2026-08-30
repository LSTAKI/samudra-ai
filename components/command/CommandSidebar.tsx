'use client';

import React from 'react';
import CommandAlertSummary from './CommandAlertSummary';
import CommandFilters from './CommandFilters';
import CommandEventList from './CommandEventList';
import { Shield, Radio } from 'lucide-react';

export default function CommandSidebar() {
  return (
    <aside className="w-[320px] bg-white border-r border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            COMMAND WATCH
          </h2>
        </div>
        <span className="text-[9px] font-mono text-muted-orca bg-white px-1.5 py-0.5 border border-border-orca rounded font-bold">
          OPERATIONAL FEED
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Alert Counts Summary */}
        <CommandAlertSummary />

        {/* Severity & Category Filters */}
        <CommandFilters />

        {/* Active Events Queue */}
        <CommandEventList />
      </div>
    </aside>
  );
}
