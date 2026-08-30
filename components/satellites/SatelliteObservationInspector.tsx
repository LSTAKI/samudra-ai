'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockSatelliteObservations } from '@/mock/mockSatellites';
import { OceanParameter } from '@/types';
import {
  Satellite,
  Compass,
  Layers,
  Clock,
  Radio,
  ExternalLink,
  MapPin,
  ShieldAlert,
  ArrowRight,
  Database
} from 'lucide-react';

export default function SatelliteObservationInspector() {
  const router = useRouter();
  const {
    selectedObservationId,
    selectedCoordinates,
    setSelectedCoordinates,
    selectParameter
  } = useOrcaStore();

  const observation =
    mockSatelliteObservations.find((o) => o.id === selectedObservationId) ||
    mockSatelliteObservations[0];

  const handleOpenInResearchConsole = () => {
    // Preserve coordinate in store
    setSelectedCoordinates({ lat: observation.latitude, lng: observation.longitude });

    // Switch active ocean layer if related
    if (observation.productId === 'chl') {
      selectParameter('chlorophyll');
    } else if (observation.productId === 'sst') {
      selectParameter('sst');
    } else if (observation.productId === 'sea_level') {
      selectParameter('seaLevel');
    } else if (observation.productId === 'wind_waves') {
      selectParameter('waveHeight');
    }

    router.push('/research');
  };

  const handleExploreOcean = () => {
    setSelectedCoordinates({ lat: observation.latitude, lng: observation.longitude });
    if (observation.productId === 'chl') {
      selectParameter('chlorophyll');
    } else if (observation.productId === 'sst') {
      selectParameter('sst');
    } else if (observation.productId === 'sea_level') {
      selectParameter('seaLevel');
    } else if (observation.productId === 'wind_waves') {
      selectParameter('waveHeight');
    }
    router.push('/research/ocean');
  };

  return (
    <aside className="w-[320px] bg-white border-l border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Radio className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            OBSERVATION INSPECTOR
          </h2>
        </div>
        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
          DEMO
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {/* Platform & Pass Card */}
        <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-muted-orca font-mono uppercase tracking-wider">
              TARGET PLATFORM
            </span>
            <span className="text-[9px] font-mono font-bold text-secondary-text">
              {observation.timeOfDay}
            </span>
          </div>
          <div className="text-sm font-bold text-primary-text font-mono">
            {observation.platformName}
          </div>
          <div className="text-[10px] text-muted-orca font-mono">
            {observation.orbitPass}
          </div>
        </div>

        {/* Observation Coordinates Card */}
        <div className="bg-white border border-border-orca rounded p-2.5 space-y-1 font-mono">
          <div className="text-[9px] text-muted-orca uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3 h-3 text-orca-blue" />
            NADIR OBSERVATION CENTER
          </div>
          <div className="text-xs font-bold text-primary-text">
            {observation.latitude > 0 ? `${observation.latitude.toFixed(4)}° N` : `${Math.abs(observation.latitude).toFixed(4)}° S`}
            {' · '}
            {observation.longitude > 0 ? `${observation.longitude.toFixed(4)}° E` : `${Math.abs(observation.longitude).toFixed(4)}° W`}
          </div>
        </div>

        {/* Observation Details Table */}
        <div className="bg-white border border-border-orca rounded p-2.5 space-y-2 font-mono text-[10px]">
          <div className="flex items-center justify-between border-b border-border-orca pb-1.5">
            <span className="text-secondary-text">SENSOR INSTRUMENT:</span>
            <span className="font-bold text-primary-text">{observation.sensorName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary-text">DERIVED PRODUCT:</span>
            <span className="font-bold text-primary-text">{observation.productName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-secondary-text">SPATIAL RESOLUTION:</span>
            <span className="font-bold text-primary-text">{observation.resolution}</span>
          </div>

          {observation.cloudCoverage && (
            <div className="flex items-center justify-between">
              <span className="text-secondary-text">SCENE CLOUD COVER:</span>
              <span className="font-bold text-primary-text">{observation.cloudCoverage}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-secondary-text">DOWNLINK SOURCE:</span>
            <span className="font-bold text-primary-text truncate max-w-[150px]" title={observation.source}>
              {observation.source}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border-orca">
            <span className="text-secondary-text">TELEMETRY STATUS:</span>
            <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
              ● DEMO OBSERVATION
            </span>
          </div>
        </div>

        {/* Provenance Context */}
        <div className="border border-border-orca rounded p-2.5 bg-secondary-surface space-y-1.5">
          <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-secondary-text">
            <Database className="w-3.5 h-3.5 text-orca-blue" />
            <span>OPERATIONAL INTEGRATION SPEC</span>
          </div>
          <p className="text-[9px] text-muted-orca font-sans leading-relaxed">
            Direct ISRO MOSDAC Level-1B raw telemetry parsing is scheduled for Phase 3. Processed Level-4 reanalysis is live in the Research Console.
          </p>
        </div>

        {/* Cross-Navigation Actions */}
        <div className="space-y-2 pt-1">
          <div className="text-[9px] font-mono text-muted-orca uppercase font-bold tracking-wider">
            CROSS-MODULE CORRELATION
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
              <span>EXPLORE OCEAN DATA</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
