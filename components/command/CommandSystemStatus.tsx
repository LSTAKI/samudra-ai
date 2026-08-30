'use client';

import React from 'react';
import { mockSystemServices } from '@/mock/mockCommand';
import { Server, CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';

export default function CommandSystemStatus() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'text-success-orca bg-emerald-50 border-emerald-200';
      case 'DEMO':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'UNAVAILABLE':
      default:
        return 'text-muted-orca bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 font-mono text-[9px] select-none bg-white">
      <div className="flex items-center justify-between border-b border-border-orca pb-1">
        <div className="flex items-center space-x-2">
          <Server className="w-3.5 h-3.5 text-orca-blue" />
          <span className="font-bold text-primary-text uppercase">
            ORCA SYSTEM STATUS & DATA INGESTION GATEWAYS
          </span>
        </div>
        <span className="text-[8px] text-muted-orca">
          HEALTH CHECK: ALL CORE GATEWAYS OPERATIONAL
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
        {mockSystemServices.slice(0, 4).map((srv) => (
          <div
            key={srv.serviceId}
            className="p-2 bg-secondary-surface rounded border border-border-orca space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary-text truncate">{srv.name}</span>
              <span className={`px-1 py-0.2 rounded border text-[7px] font-bold ${getStatusBadge(srv.status)}`}>
                {srv.status}
              </span>
            </div>
            <p className="text-[8px] text-muted-orca leading-tight truncate">
              {srv.description}
            </p>
            {srv.latencyMs && (
              <span className="text-[7px] text-secondary-text block">
                Latency: {srv.latencyMs}ms
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="text-[8px] text-muted-orca pt-1 border-t border-border-orca flex items-center justify-between">
        <span>Vessel AIS feed: Integration scheduled for Phase 3 coast radar transponders.</span>
        <span>Gateway heartbeat: 10s ping cycle</span>
      </div>
    </div>
  );
}
