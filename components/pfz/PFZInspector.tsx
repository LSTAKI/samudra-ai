'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchPFZZones, PFZZone } from '@/lib/api/pfz';
import PFZExplainability from './PFZExplainability';
import {
  Target,
  Compass,
  Layers,
  ArrowRight,
  ShieldCheck,
  Radio,
  MapPin,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

export default function PFZInspector() {
  const router = useRouter();
  const {
    selectedPFZZoneId,
    setSelectedCoordinates,
    selectParameter
  } = useOrcaStore();

  const [zones, setZones] = useState<PFZZone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadZones = async () => {
      setLoading(true);
      try {
        const res = await fetchPFZZones(9.9312, 76.2673, 'Kochi');
        if (mounted && res.zones) {
          setZones(res.zones);
        }
      } catch {
        // Fallback
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadZones();
    return () => {
      mounted = false;
    };
  }, []);

  const zone = zones.find((z) => z.id === selectedPFZZoneId) || zones[0];

  const handleOpenInResearchConsole = () => {
    if (zone) {
      setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    }
    selectParameter('chlorophyll');
    router.push('/research');
  };

  const handleExploreOcean = () => {
    if (zone) {
      setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    }
    selectParameter('chlorophyll');
    router.push('/research/ocean');
  };

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case 'HIGH':
        return 'text-emerald-700 bg-emerald-50 border-emerald-300 font-bold';
      case 'MODERATE':
        return 'text-amber-700 bg-amber-50 border-amber-300 font-bold';
      case 'LOW':
      default:
        return 'text-slate-600 bg-slate-100 border-slate-300 font-bold';
    }
  };

  return (
    <aside className="w-[320px] bg-white border-l border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            PFZ CANDIDATE ZONE
          </h2>
        </div>
        <span className="text-[8px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">
          v1.0-deterministic
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {loading ? (
          <div className="p-6 text-center text-muted-orca font-mono flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-orca-blue" />
            <span>Computing candidate zones...</span>
          </div>
        ) : zone ? (
          <>
            {/* Zone Identification Card */}
            <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span className="text-[11px] font-bold text-primary-text">{zone.id}</span>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${getClassificationBadge(zone.classification)}`}>
                  {zone.classification} SUITABILITY
                </span>
              </div>
              <div className="text-xs font-bold text-secondary-text font-mono">
                {zone.name}
              </div>
              <div className="text-[9px] text-muted-orca font-mono">
                Harbor Reference: {zone.harbor} · Distance: {zone.distance_km} km ({zone.bearing_deg}°)
              </div>
            </div>

            {/* Location & Score Card */}
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
              <div className="bg-white border border-border-orca rounded p-2 space-y-0.5">
                <span className="text-[8px] text-muted-orca uppercase block">CENTER NADIR</span>
                <span className="font-bold text-primary-text block">
                  {zone.latitude.toFixed(4)}°N, {zone.longitude.toFixed(4)}°E
                </span>
                <span className="text-[8px] text-muted-orca">
                  Depth: ~{zone.depth_m}m
                </span>
              </div>

              <div className="bg-white border border-border-orca rounded p-2 space-y-0.5">
                <span className="text-[8px] text-muted-orca uppercase block">SUITABILITY SCORE</span>
                <div className="text-base font-bold text-primary-text">
                  {zone.score} <span className="text-[10px] text-muted-orca font-normal">/ 100</span>
                </div>
                <span className="text-[7.5px] text-emerald-700 font-bold block">
                  DERIVED FROM GRADIENTS
                </span>
              </div>
            </div>

            {/* Environmental Parameter Values */}
            <div className="bg-white border border-border-orca rounded p-2.5 space-y-2 font-mono text-[10px]">
              <div className="flex items-center justify-between border-b border-border-orca pb-1">
                <span className="font-bold text-secondary-text uppercase">ENVIRONMENTAL READINGS</span>
                <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-300 font-bold">
                  COPERNICUS INPUTS
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-secondary-text">SEA SURFACE TEMP:</span>
                <span className="font-bold text-primary-text">{zone.sst_c} °C</span>
              </div>

              <div className="flex justify-between">
                <span className="text-secondary-text">SST GRADIENT:</span>
                <span className="font-bold text-primary-text">{zone.sst_gradient_c_per_km} °C/km</span>
              </div>

              <div className="flex justify-between">
                <span className="text-secondary-text">CHLOROPHYLL-a:</span>
                <span className="font-bold text-primary-text">{zone.chlorophyll_mg_m3} mg/m³</span>
              </div>

              <div className="flex justify-between">
                <span className="text-secondary-text">WAVE HEIGHT (Hm0):</span>
                <span className="font-bold text-primary-text">{zone.wave_height_m} m</span>
              </div>
            </div>

            {/* Explainability Breakdown */}
            <PFZExplainability zone={zone} />

            {/* Scientific Disclaimer */}
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[8px] font-mono text-blue-900 leading-normal space-y-1">
              <span className="font-bold block">ENVIRONMENTAL CANDIDATE ZONE:</span>
              <p>
                Candidate areas reflect thermal fronts and chlorophyll-a nutrient convergence. This is an operational environmental tool, not a guarantee of fish catch or fish detection.
              </p>
            </div>

            {/* Cross-Module Quick Actions */}
            <div className="space-y-2 pt-1 font-mono">
              <button
                type="button"
                onClick={handleOpenInResearchConsole}
                className="w-full h-8 px-3 rounded bg-white hover:bg-slate-100 text-primary-text text-[10px] font-bold border border-border-orca flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <Layers className="w-3 h-3 text-orca-blue" />
                  <span>INSPECT IN RESEARCH CONSOLE</span>
                </div>
                <ArrowRight className="w-3 h-3 text-secondary-text" />
              </button>

              <button
                type="button"
                onClick={handleExploreOcean}
                className="w-full h-8 px-3 rounded bg-white hover:bg-slate-100 text-primary-text text-[10px] font-bold border border-border-orca flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-1.5">
                  <Compass className="w-3 h-3 text-orca-blue" />
                  <span>EXPLORE IN OCEAN 3D VIEW</span>
                </div>
                <ArrowRight className="w-3 h-3 text-secondary-text" />
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 text-center text-muted-orca">No candidate zone selected.</div>
        )}
      </div>
    </aside>
  );
}
