'use client';

import React from 'react';
import { mockOperationalEvents } from '@/mock/mockCommand';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';

export default function CommandAlertSummary() {
  const criticalCount = mockOperationalEvents.filter((e) => e.severity === 'CRITICAL').length;
  const highCount = mockOperationalEvents.filter((e) => e.severity === 'HIGH').length;
  const mediumCount = mockOperationalEvents.filter((e) => e.severity === 'MEDIUM').length;
  const lowCount = mockOperationalEvents.filter((e) => e.severity === 'LOW').length;
  const infoCount = mockOperationalEvents.filter((e) => e.severity === 'INFO').length;

  return (
    <div className="bg-secondary-surface p-2.5 rounded border border-border-orca space-y-2 select-none font-mono text-[9px]">
      <div className="flex items-center justify-between border-b border-border-orca pb-1">
        <span className="font-bold text-primary-text uppercase tracking-wider flex items-center gap-1">
          <ShieldAlert className="w-3 h-3 text-orca-blue" />
          ACTIVE EVENTS SUMMARY
        </span>
        <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-bold">
          DEMO EVENT FEED
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1 text-center">
        <div className="bg-white p-1 rounded border border-border-orca">
          <span className="text-[7px] text-muted-orca uppercase block">CRITICAL</span>
          <span className="font-bold text-[#DC2626] text-xs">{criticalCount}</span>
        </div>
        <div className="bg-white p-1 rounded border border-border-orca">
          <span className="text-[7px] text-muted-orca uppercase block">HIGH</span>
          <span className="font-bold text-[#D97706] text-xs">{highCount}</span>
        </div>
        <div className="bg-white p-1 rounded border border-border-orca">
          <span className="text-[7px] text-muted-orca uppercase block">MEDIUM</span>
          <span className="font-bold text-[#CA8A04] text-xs">{mediumCount}</span>
        </div>
        <div className="bg-white p-1 rounded border border-border-orca">
          <span className="text-[7px] text-muted-orca uppercase block">LOW</span>
          <span className="font-bold text-[#2563EB] text-xs">{lowCount}</span>
        </div>
        <div className="bg-white p-1 rounded border border-border-orca">
          <span className="text-[7px] text-muted-orca uppercase block">INFO</span>
          <span className="font-bold text-[#64748B] text-xs">{infoCount}</span>
        </div>
      </div>
    </div>
  );
}
