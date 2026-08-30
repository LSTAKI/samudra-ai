'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockPFZZones } from '@/mock/mockPFZ';
import PFZExplainability from './PFZExplainability';
import {
  Target,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
  MapPin,
  TrendingUp
} from 'lucide-react';

export default function PFZInspector() {
  const router = useRouter();
  const {
    selectedPFZZoneId,
    setSelectedCoordinates,
    selectParameter,
    setSelectedDepth
  } = useOrcaStore();

  const zone =
    mockPFZZones.find((z) => z.id === selectedPFZZoneId) || mockPFZZones[0];

  const handleOpenInResearchConsole = () => {
    setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    selectParameter('chlorophyll');
    router.push('/research');
  };

  const handleExploreOcean = () => {
    setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    if (zone.metrics.depthMeters) {
      setSelectedDepth(zone.metrics.depthMeters);
    }
    selectParameter('chlorophyll');
    router.push('/research/ocean');
  };

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case 'HIGH':
        return 'text-success-orca bg-success-orca/10 border-success-orca/30';
      case 'MODERATE':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'LOW':
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  return (
    <aside className="w-[320px] bg-white border-l border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            PFZ ANALYSIS
          </h2>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
          DEMO CANDIDATE
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {/* Zone Identification Card */}
        <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-1">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[11px] font-bold text-primary-text">{zone.id}</span>
            <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border ${getClassificationBadge(zone.classification)}`}>
              {zone.classification} CANDIDATE
            </span>
          </div>
          <div className="text-xs font-bold text-secondary-text font-mono">
            {zone.name}
          </div>
          <div className="text-[9px] text-muted-orca font-mono">
            {zone.sector}
          </div>
        </div>

        {/* Location & Score Card */}
        <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
          <div className="bg-white border border-border-orca rounded p-2 space-y-0.5">
            <span className="text-[8px] text-muted-orca uppercase block">CENTER NADIR</span>
            <span className="font-bold text-primary-text block">
              {zone.latitude.toFixed(2)}°N, {zone.longitude.toFixed(2)}°E
            </span>
            <span className="text-[8px] text-muted-orca">
              Depth: ~{zone.metrics.depthMeters ? `${zone.metrics.depthMeters}m` : 'N/A'}
            </span>
          </div>

          <div className="bg-white border border-border-orca rounded p-2 space-y-0.5">
            <span className="text-[8px] text-muted-orca uppercase block">SUITABILITY SCORE</span>
            <div className="text-base font-bold text-primary-text">
              {zone.score} <span className="text-[10px] text-muted-orca font-normal">/ 100</span>
            </div>
            <span className="text-[8px] text-amber-700 font-bold">
              DEMO CONFIDENCE: {zone.confidence}
            </span>
          </div>
        </div>

        {/* Environmental Parameter Values (DEMO ANALYTICS) */}
        <div className="bg-white border border-border-orca rounded p-2.5 space-y-2 font-mono text-[10px]">
          <div className="flex items-center justify-between border-b border-border-orca pb-1">
            <span className="font-bold text-secondary-text uppercase">ENVIRONMENTAL READINGS</span>
            <span className="text-[8px] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 font-bold">
              DEMO ANALYTICS
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary-text">SEA SURFACE TEMP:</span>
            <span className="font-bold text-primary-text">
              {zone.metrics.sst} °C{' '}
              {zone.metrics.sstAnomaly && (
                <span className="text-success-orca text-[8px] font-normal">
                  ({zone.metrics.sstAnomaly > 0 ? `+${zone.metrics.sstAnomaly}` : zone.metrics.sstAnomaly}°C)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary-text">CHLOROPHYLL-a:</span>
            <span className="font-bold text-primary-text">{zone.metrics.chlorophyll} mg/m³</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary-text">WAVE HEIGHT (Hm0):</span>
            <span className="font-bold text-primary-text">{zone.metrics.waveHeight} m</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary-text">OCEAN CURRENT:</span>
            <span className="font-bold text-amber-600">{zone.metrics.currentVelocity}</span>
          </div>
        </div>

        {/* Explainability: Contributing Factors */}
        <PFZExplainability zone={zone} />

        {/* Model Dependency Status */}
        <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-1 font-mono text-[9px]">
          <span className="font-bold text-secondary-text uppercase block">
            MODEL DATA SOURCES
          </span>
          <div className="space-y-0.5">
            <div className="flex justify-between">
              <span className="text-muted-orca">Copernicus SST (OSTIA):</span>
              <span className="text-success-orca font-bold">● CONNECTED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-orca">Copernicus Chlorophyll:</span>
              <span className="text-success-orca font-bold">● CONNECTED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-orca">Copernicus Wave Height:</span>
              <span className="text-success-orca font-bold">● CONNECTED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-orca">Ocean Surface Currents:</span>
              <span className="text-amber-600 font-bold">○ UNAVAILABLE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-orca">GEBCO Bathymetric Shelf:</span>
              <span className="text-muted-orca font-bold">○ UNAVAILABLE</span>
            </div>
          </div>
        </div>

        {/* Cross-Module Navigation Actions */}
        <div className="space-y-2 pt-1">
          <div className="text-[9px] font-mono text-muted-orca uppercase font-bold tracking-wider">
            CROSS-MODULE WORKSPACE
          </div>

          <button
            type="button"
            onClick={handleOpenInResearchConsole}
            className="w-full flex items-center justify-between bg-ocean-navy hover:bg-[#12315b] text-white p-2 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-colors"
          >
            <div className="flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-orca-blue" />
              <span>OPEN IN RESEARCH CONSOLE</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleExploreOcean}
            className="w-full flex items-center justify-between bg-white hover:bg-secondary-surface text-primary-text border border-border-orca p-2 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition-colors"
          >
            <div className="flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-orca-blue" />
              <span>EXPLORE OCEAN CONDITIONS</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
