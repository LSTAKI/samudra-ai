'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockOperationalEvents } from '@/mock/mockCommand';
import { Clock, AlertTriangle, ShieldAlert, Target, Radio, Activity, Server } from 'lucide-react';

export default function CommandTimeline() {
  const {
    selectedOperationalEventId,
    setSelectedOperationalEventId,
    setSelectedCoordinates
  } = useOrcaStore();

  const hours = [
    '00:00',
    '02:00',
    '04:00',
    '06:00',
    '08:00',
    '10:00',
    '12:00',
    '14:00',
    '16:00',
    '18:00',
    '20:00',
    '22:00',
    '24:00'
  ];

  const getEventPositionPct = (timestamp: string) => {
    try {
      const parts = timestamp.split(' ');
      const timePart = parts[3] || '08:00';
      const [h, m] = timePart.split(':').map(Number);
      const totalMinutes = h * 60 + m;
      return Math.min(96, Math.max(4, (totalMinutes / 1440) * 100));
    } catch {
      return 50;
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-[#DC2626] border-[#DC2626] text-white';
      case 'HIGH':
        return 'bg-[#D97706] border-[#D97706] text-white';
      case 'MEDIUM':
        return 'bg-[#CA8A04] border-[#CA8A04] text-white';
      case 'LOW':
        return 'bg-[#2563EB] border-[#2563EB] text-white';
      case 'INFO':
      default:
        return 'bg-[#64748B] border-[#64748B] text-white';
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 font-mono text-[9px] select-none bg-white">
      <div className="flex items-center justify-between border-b border-border-orca pb-1">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-orca-blue" />
          <span className="font-bold text-primary-text uppercase">
            OPERATIONAL INCIDENT & EVENT TIMELINE (24H UTC CHRONOLOGY)
          </span>
        </div>
        <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
          DEMO FEED
        </span>
      </div>

      {/* Interactive Timeline Track */}
      <div className="relative w-full h-14 flex items-center bg-secondary-surface rounded border border-border-orca px-4 my-1">
        <div className="absolute left-4 right-4 h-0.5 bg-border-orca/80 top-1/2 -translate-y-1/2" />

        {/* Chronological Event Pins */}
        {mockOperationalEvents.map((ev) => {
          const isSelected = selectedOperationalEventId === ev.id;
          const posPct = getEventPositionPct(ev.timestamp);

          return (
            <div
              key={ev.id}
              style={{ left: `${posPct}%` }}
              onClick={() => {
                setSelectedOperationalEventId(ev.id);
                setSelectedCoordinates({ lat: ev.latitude, lng: ev.longitude });
              }}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group z-10 transition-all ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-110'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow flex items-center justify-center ${getSeverityColor(
                  ev.severity
                )} ${isSelected ? 'ring-3 ring-orange-400 animate-pulse' : ''}`}
              >
                <div className="w-1 h-1 bg-white rounded-full"></div>
              </div>

              {/* Hover Tooltip */}
              <div className="hidden group-hover:flex flex-col items-center absolute bottom-5 left-1/2 -translate-x-1/2 bg-ocean-navy text-white text-[8px] px-2 py-1 rounded shadow-lg border border-[#1b3459] whitespace-nowrap pointer-events-none z-40">
                <span className="font-bold">{ev.title}</span>
                <span className="text-muted-orca">
                  {ev.category} · {ev.timestamp.split(' ')[3]} UTC · {ev.severity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hourly Ticks Bar */}
      <div className="flex justify-between px-2 text-[8px] text-muted-orca">
        {hours.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
    </div>
  );
}
