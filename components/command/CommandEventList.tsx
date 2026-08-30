'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockOperationalEvents } from '@/mock/mockCommand';
import { OperationalEvent, OperationalSeverity } from '@/types/command';
import { AlertCircle, MapPin, Clock, Check, ChevronRight } from 'lucide-react';

export default function CommandEventList() {
  const {
    selectedOperationalEventId,
    setSelectedOperationalEventId,
    commandSeverityFilter,
    commandCategoryFilter,
    setSelectedCoordinates,
    eventWorkflowStatuses
  } = useOrcaStore();

  const filteredEvents = mockOperationalEvents.filter((ev) => {
    if (commandSeverityFilter !== 'ALL' && ev.severity !== commandSeverityFilter) {
      return false;
    }
    if (commandCategoryFilter !== 'ALL' && ev.category !== commandCategoryFilter) {
      return false;
    }
    return true;
  });

  const handleSelectEvent = (ev: OperationalEvent) => {
    setSelectedOperationalEventId(ev.id);
    setSelectedCoordinates({ lat: ev.latitude, lng: ev.longitude });
  };

  const getSeverityBadge = (sev: OperationalSeverity) => {
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

  const getWorkflowBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'text-success-orca bg-emerald-50 border-emerald-200';
      case 'INVESTIGATING':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'ACKNOWLEDGED':
        return 'text-orca-blue bg-blue-50 border-blue-200';
      case 'NEW':
      default:
        return 'text-primary-text bg-slate-100 border-slate-200 font-bold';
    }
  };

  return (
    <div className="space-y-1.5 select-none font-mono text-[9px]">
      <div className="flex items-center justify-between text-muted-orca uppercase pt-1">
        <span className="font-bold text-secondary-text">ACTIVE EVENTS QUEUE</span>
        <span>{filteredEvents.length} EVENTS</span>
      </div>

      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-0.5">
        {filteredEvents.length === 0 ? (
          <div className="p-3 text-center text-muted-orca bg-secondary-surface rounded border border-border-orca">
            NO EVENTS MATCH CURRENT FILTERS
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isSelected = selectedOperationalEventId === ev.id;
            const currentWorkflow = eventWorkflowStatuses[ev.id] || ev.workflowStatus;

            return (
              <div
                key={ev.id}
                onClick={() => handleSelectEvent(ev)}
                className={`p-2 rounded border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-orca-blue shadow-xs'
                    : 'bg-white border-border-orca hover:bg-secondary-surface'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-1 py-0.2 rounded border font-bold text-[7px] ${getSeverityBadge(ev.severity)}`}>
                    {ev.severity}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className={`px-1 py-0.2 rounded border text-[7px] ${getWorkflowBadge(currentWorkflow)}`}>
                      {currentWorkflow}
                    </span>
                    <span className="text-[7px] text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-bold">
                      DEMO
                    </span>
                  </div>
                </div>

                <div className="font-bold text-primary-text text-[10px] truncate">
                  {ev.title}
                </div>

                <div className="flex items-center justify-between text-[8px] text-muted-orca mt-1">
                  <span className="truncate max-w-[140px]">{ev.locationName}</span>
                  <span>{ev.timestamp.split(' ')[2]} {ev.timestamp.split(' ')[3]}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
