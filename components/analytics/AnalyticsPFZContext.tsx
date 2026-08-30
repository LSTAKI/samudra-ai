'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockPFZZones } from '@/mock/mockPFZ';
import { Target, ArrowRight, Layers, Compass } from 'lucide-react';

export default function AnalyticsPFZContext() {
  const router = useRouter();
  const { selectedPFZZoneId, setSelectedCoordinates, selectParameter } = useOrcaStore();

  const zone =
    mockPFZZones.find((z) => z.id === selectedPFZZoneId) || mockPFZZones[0];

  const handleOpenPFZ = () => {
    setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    router.push('/research/pfz');
  };

  const handleOpenResearch = () => {
    setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    selectParameter('chlorophyll');
    router.push('/research');
  };

  const handleOpenOcean = () => {
    setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    selectParameter('chlorophyll');
    router.push('/research/ocean');
  };

  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-3 font-sans select-none shadow-xs">
      <div className="flex items-center justify-between border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            PFZ CONTEXT & CROSS-MODULE ACTIONS
          </h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
          DEMO CANDIDATE
        </span>
      </div>

      <div className="bg-secondary-surface p-2.5 rounded border border-border-orca space-y-1.5 font-mono text-[9px]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary-text">{zone.id} · {zone.name}</span>
          <span className="text-success-orca font-bold">{zone.classification} ({zone.score}/100)</span>
        </div>
        <div className="text-secondary-text">
          Sector: {zone.sector} · Nadir: {zone.latitude.toFixed(2)}°N, {zone.longitude.toFixed(2)}°E
        </div>
        <div className="flex items-center justify-between text-[8px] text-muted-orca pt-1 border-t border-border-orca/60">
          <span>SST: {zone.metrics.sst}°C</span>
          <span>Chl-a: {zone.metrics.chlorophyll} mg/m³</span>
          <span>Waves: {zone.metrics.waveHeight}m</span>
        </div>
      </div>

      {/* Cross-Module Navigation Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[9px]">
        <button
          type="button"
          onClick={handleOpenPFZ}
          className="flex items-center justify-between bg-ocean-navy hover:bg-[#12315b] text-white p-2 rounded font-bold uppercase transition-colors"
        >
          <span className="truncate">OPEN PFZ ANALYZER</span>
          <ArrowRight className="w-3 h-3 ml-1 shrink-0" />
        </button>

        <button
          type="button"
          onClick={handleOpenResearch}
          className="flex items-center justify-between bg-white hover:bg-secondary-surface text-primary-text border border-border-orca p-2 rounded font-bold uppercase transition-colors"
        >
          <span className="truncate">RESEARCH CONSOLE</span>
          <Layers className="w-3 h-3 ml-1 shrink-0 text-orca-blue" />
        </button>

        <button
          type="button"
          onClick={handleOpenOcean}
          className="flex items-center justify-between bg-white hover:bg-secondary-surface text-primary-text border border-border-orca p-2 rounded font-bold uppercase transition-colors"
        >
          <span className="truncate">EXPLORE CONDITIONS</span>
          <Compass className="w-3 h-3 ml-1 shrink-0 text-orca-blue" />
        </button>
      </div>
    </div>
  );
}
