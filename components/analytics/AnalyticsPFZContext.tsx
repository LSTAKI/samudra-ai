'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchPFZZones, PFZZone } from '@/lib/api/pfz';
import { Target, ArrowRight, Layers, RefreshCw } from 'lucide-react';

export default function AnalyticsPFZContext() {
  const router = useRouter();
  const { selectedPFZZoneId, setSelectedCoordinates, selectParameter } = useOrcaStore();
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

  const handleOpenPFZ = () => {
    if (zone) {
      setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    }
    router.push('/research/pfz');
  };

  const handleOpenResearch = () => {
    if (zone) {
      setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
    }
    selectParameter('chlorophyll');
    router.push('/research');
  };

  return (
    <div className="bg-white border border-border-orca rounded p-3.5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-border-orca pb-2">
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            PFZ DETERMINISTIC CONTEXT
          </h3>
        </div>
        <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">
          v1.0-deterministic
        </span>
      </div>

      {loading ? (
        <div className="p-4 bg-secondary-surface rounded text-center text-muted-orca flex items-center justify-center space-x-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-orca-blue" />
          <span>Computing candidate zones...</span>
        </div>
      ) : zone ? (
        <div className="bg-secondary-surface p-2.5 rounded border border-border-orca space-y-1.5 text-[9px]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-primary-text">{zone.id} · {zone.name}</span>
            <span className="text-emerald-700 font-bold">{zone.classification} ({zone.score}/100)</span>
          </div>
          <div className="text-secondary-text">
            Nadir: {zone.latitude.toFixed(4)}°N, {zone.longitude.toFixed(4)}°E · Distance: {zone.distance_km} km ({zone.bearing_deg}°)
          </div>
          <div className="flex items-center justify-between text-[8px] text-muted-orca pt-1 border-t border-border-orca/60">
            <span>SST: {zone.sst_c}°C</span>
            <span>Chl-a: {zone.chlorophyll_mg_m3} mg/m³</span>
            <span>Waves: {zone.wave_height_m}m</span>
          </div>
        </div>
      ) : (
        <div className="p-3 text-center text-muted-orca">No candidate zones generated</div>
      )}

      {/* Cross-module action links */}
      <div className="grid grid-cols-2 gap-2 text-[9px]">
        <button
          onClick={handleOpenPFZ}
          className="p-2 bg-secondary-surface hover:bg-slate-200 border border-border-orca rounded font-bold text-primary-text flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Open in PFZ Map</span>
          <ArrowRight className="w-3 h-3 text-orca-blue" />
        </button>

        <button
          onClick={handleOpenResearch}
          className="p-2 bg-secondary-surface hover:bg-slate-200 border border-border-orca rounded font-bold text-primary-text flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Open in Research Console</span>
          <Layers className="w-3 h-3 text-orca-blue" />
        </button>
      </div>
    </div>
  );
}
