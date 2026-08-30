'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockOperationalEvents } from '@/mock/mockCommand';
import CommandProvenance from './CommandProvenance';
import CommandActions from './CommandActions';
import {
  ShieldAlert,
  MapPin,
  Clock,
  ArrowRight,
  Target,
  Compass,
  Radio,
  Layers
} from 'lucide-react';

export default function CommandEventInspector() {
  const router = useRouter();
  const {
    selectedOperationalEventId,
    setSelectedCoordinates,
    selectParameter,
    eventWorkflowStatuses
  } = useOrcaStore();

  const event =
    mockOperationalEvents.find((e) => e.id === selectedOperationalEventId) ||
    mockOperationalEvents[0];

  const currentWorkflow = eventWorkflowStatuses[event.id] || event.workflowStatus;

  const handleCrossNavigate = (route: string, param?: any) => {
    setSelectedCoordinates({ lat: event.latitude, lng: event.longitude });
    if (param) selectParameter(param);
    router.push(route);
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-[#DC2626] bg-red-50 border-red-200';
      case 'HIGH':
        return 'text-[#D97706] bg-amber-50 border-amber-200';
      case 'MEDIUM':
        return 'text-[#CA8A04] bg-yellow-50 border-yellow-200';
      case 'LOW':
        return 'text-[#2563EB] bg-blue-50 border-blue-200';
      case 'INFO':
      default:
        return 'text-[#64748B] bg-slate-100 border-slate-200';
    }
  };

  return (
    <aside className="w-[320px] bg-white border-l border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            EVENT INSPECTOR
          </h2>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
          DEMO EVENT
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs font-mono">
        {/* Event Header Card */}
        <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="font-bold text-primary-text">{event.id}</span>
            <div className="flex items-center space-x-1">
              <span className={`px-1.5 py-0.2 rounded border font-bold text-[8px] ${getSeverityBadge(event.severity)}`}>
                {event.severity}
              </span>
              <span className="px-1.5 py-0.2 rounded border text-[8px] bg-white text-secondary-text font-bold">
                {currentWorkflow}
              </span>
            </div>
          </div>
          <div className="font-bold text-primary-text text-xs leading-tight">
            {event.title}
          </div>
          <div className="text-[9px] text-muted-orca">
            Category: <span className="text-secondary-text font-bold">{event.category}</span>
          </div>
        </div>

        {/* Location & Time */}
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div className="bg-white border border-border-orca rounded p-2 space-y-0.5">
            <span className="text-[8px] text-muted-orca uppercase block">COORDINATES</span>
            <span className="font-bold text-primary-text block">
              {event.latitude.toFixed(4)}° N
            </span>
            <span className="font-bold text-primary-text block">
              {event.longitude.toFixed(4)}° E
            </span>
          </div>

          <div className="bg-white border border-border-orca rounded p-2 space-y-0.5">
            <span className="text-[8px] text-muted-orca uppercase block">TIMESTAMP</span>
            <span className="font-bold text-primary-text block">
              {event.timestamp.split(' ')[0]} {event.timestamp.split(' ')[1]} {event.timestamp.split(' ')[2]}
            </span>
            <span className="text-secondary-text block">
              {event.timestamp.split(' ')[3]}
            </span>
          </div>
        </div>

        {/* Briefing Description */}
        <div className="bg-white border border-border-orca rounded p-2.5 space-y-1">
          <span className="text-[8px] text-muted-orca uppercase font-bold block">
            INCIDENT BRIEFING
          </span>
          <p className="text-[9px] text-secondary-text leading-relaxed font-sans">
            {event.description}
          </p>

          {event.metadata && (
            <div className="pt-1.5 border-t border-border-orca/60 text-[8px] space-y-0.5 text-muted-orca">
              {event.metadata.vesselName && (
                <div>Vessel: <span className="font-bold text-primary-text">{event.metadata.vesselName}</span> ({event.metadata.vesselCallsign})</div>
              )}
              {event.metadata.distanceKm && (
                <div>Buffer Proximity: <span className="font-bold text-danger-orca">{event.metadata.distanceKm} km</span></div>
              )}
              {event.metadata.anomalyMetric && (
                <div>Anomaly Metric: <span className="font-bold text-primary-text">{event.metadata.anomalyMetric}</span></div>
              )}
            </div>
          )}
        </div>

        {/* Workflow Actions */}
        <CommandActions eventId={event.id} />

        {/* Data Provenance Card */}
        <CommandProvenance
          source={event.source}
          product={event.product}
          dataset={event.dataset}
          variable={event.variable}
          timestamp={event.timestamp}
          dataStatus={event.dataStatus}
        />

        {/* Contextual Cross-Module Navigation Actions */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[8px] text-muted-orca uppercase font-bold tracking-wider block">
            OPERATIONAL INVESTIGATION ACTIONS
          </span>

          {event.category === 'PFZ' && (
            <button
              type="button"
              onClick={() => handleCrossNavigate('/research/pfz')}
              className="w-full flex items-center justify-between bg-ocean-navy hover:bg-[#12315b] text-white p-2 rounded text-[9px] font-bold uppercase transition-colors"
            >
              <div className="flex items-center space-x-1.5">
                <Target className="w-3 h-3 text-orca-blue" />
                <span>OPEN PFZ ANALYZER</span>
              </div>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {event.category === 'SATELLITE' && (
            <button
              type="button"
              onClick={() => handleCrossNavigate('/research/satellites')}
              className="w-full flex items-center justify-between bg-ocean-navy hover:bg-[#12315b] text-white p-2 rounded text-[9px] font-bold uppercase transition-colors"
            >
              <div className="flex items-center space-x-1.5">
                <Radio className="w-3 h-3 text-orca-blue" />
                <span>OPEN SATELLITES OBSERVATORY</span>
              </div>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {event.category === 'ENVIRONMENTAL' && (
            <button
              type="button"
              onClick={() => handleCrossNavigate('/research/ocean')}
              className="w-full flex items-center justify-between bg-ocean-navy hover:bg-[#12315b] text-white p-2 rounded text-[9px] font-bold uppercase transition-colors"
            >
              <div className="flex items-center space-x-1.5">
                <Compass className="w-3 h-3 text-orca-blue" />
                <span>EXPLORE OCEAN CONDITIONS</span>
              </div>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <button
            type="button"
            onClick={() => handleCrossNavigate('/research')}
            className="w-full flex items-center justify-between bg-white hover:bg-secondary-surface text-primary-text border border-border-orca p-2 rounded text-[9px] font-bold uppercase transition-colors"
          >
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3 h-3 text-orca-blue" />
              <span>INVESTIGATE IN RESEARCH CONSOLE</span>
            </div>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
