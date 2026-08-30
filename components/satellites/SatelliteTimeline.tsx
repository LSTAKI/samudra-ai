'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockSatelliteObservations } from '@/mock/mockSatellites';
import { ChevronLeft, ChevronRight, Clock, Calendar, Satellite, Radio } from 'lucide-react';

export default function SatelliteTimeline() {
  const {
    selectedObservationId,
    setSelectedObservationId,
    setSelectedCoordinates
  } = useOrcaStore();

  const [dateIndex, setDateIndex] = useState(2); // 29 Aug 2026
  const dates = ['27 AUG 2026', '28 AUG 2026', '29 AUG 2026', '30 AUG 2026', '31 AUG 2026'];

  // Convert time "HH:MM UTC" to percentage (0 - 100%)
  const getPositionPercent = (timeStr: string) => {
    const parts = timeStr.replace(' UTC', '').split(':');
    const hours = parseInt(parts[0], 10);
    const mins = parseInt(parts[1], 10);
    const totalMinutes = hours * 60 + mins;
    return (totalMinutes / (24 * 60)) * 100;
  };

  const handleSelectObservation = (obs: typeof mockSatelliteObservations[0]) => {
    setSelectedObservationId(obs.id);
    setSelectedCoordinates({ lat: obs.latitude, lng: obs.longitude });
  };

  return (
    <div className="bg-white border-t border-border-orca select-none font-sans z-20 shrink-0 h-28 flex flex-col justify-between p-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between font-mono text-xs">
        <div className="flex items-center space-x-2">
          <Clock className="w-3.5 h-3.5 text-orca-blue" />
          <span className="text-[11px] font-bold text-primary-text uppercase tracking-wider">
            ACQUISITION TIMELINE
          </span>
          <span className="text-[9px] text-muted-orca">
            (24-HOUR ORBITAL OVERPASSES)
          </span>
        </div>

        {/* Date Stepper */}
        <div className="flex items-center space-x-2 bg-secondary-surface border border-border-orca px-2 py-0.5 rounded">
          <button
            type="button"
            onClick={() => dateIndex > 0 && setDateIndex(dateIndex - 1)}
            disabled={dateIndex <= 0}
            className="text-secondary-text hover:text-primary-text disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center space-x-1.5 text-[10px] font-bold text-primary-text">
            <Calendar className="w-3 h-3 text-orca-blue" />
            <span>{dates[dateIndex]}</span>
          </div>
          <button
            type="button"
            onClick={() => dateIndex < dates.length - 1 && setDateIndex(dateIndex + 1)}
            disabled={dateIndex >= dates.length - 1}
            className="text-secondary-text hover:text-primary-text disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[8px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1 rounded font-bold">
            DEMO OBSERVATIONS
          </span>
        </div>
      </div>

      {/* Interactive Timeline Track */}
      <div className="relative w-full h-11 flex items-center px-4">
        {/* Track Line */}
        <div className="w-full h-1.5 bg-secondary-surface border border-border-orca rounded-full relative">
          {/* Observation Markers */}
          {mockSatelliteObservations.map((obs) => {
            const isSelected = selectedObservationId === obs.id;
            const percent = getPositionPercent(obs.timeOfDay);

            return (
              <div
                key={obs.id}
                onClick={() => handleSelectObservation(obs)}
                style={{ left: `${percent}%` }}
                className="absolute -top-3 -translate-x-1/2 cursor-pointer group z-10"
              >
                {/* Tooltip on Hover */}
                <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-ocean-navy text-white text-[9px] font-mono py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap z-30">
                  <span className="font-bold">{obs.platformName}</span>
                  <span className="text-muted-orca">{obs.sensorName} · {obs.timeOfDay}</span>
                  <div className="w-1.5 h-1.5 bg-ocean-navy rotate-45 -mb-1 mt-0.5"></div>
                </div>

                {/* Event Marker Pin */}
                <div
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-orca-blue text-white border-white ring-4 ring-orca-blue/30 scale-110 shadow-md'
                      : 'bg-white text-secondary-text border-border-orca hover:border-orca-blue hover:scale-105 shadow-xs'
                  }`}
                >
                  <Satellite className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Hourly Labels */}
      <div className="flex items-center justify-between text-[9px] font-mono text-muted-orca px-4 border-t border-border-orca/40 pt-1">
        <span>00:00 UTC</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00 UTC</span>
        <span>16:00</span>
        <span>20:00</span>
        <span>24:00 UTC</span>
      </div>
    </div>
  );
}
