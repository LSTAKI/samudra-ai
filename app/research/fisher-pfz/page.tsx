'use client';

import React, { useEffect, useState } from 'react';
import { fetchPFZZones, PFZZone } from '@/lib/api/pfz';
import {
  Compass,
  Navigation,
  Thermometer,
  Waves,
  Activity,
  AlertTriangle,
  RefreshCw,
  MapPin,
  ShieldAlert,
  Info
} from 'lucide-react';

export default function FisherPFZPage() {
  const [harbor, setHarbor] = useState('Kochi');
  const [zones, setZones] = useState<PFZZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<PFZZone | null>(null);
  const [loading, setLoading] = useState(true);

  const harbors = ['Kochi', 'Mangalore', 'Goa', 'Vizhinjam', 'Tuticorin'];

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchPFZZones(9.9312, 76.2673, harbor);
        if (mounted && res.zones) {
          setZones(res.zones);
          setSelectedZone(res.zones[0] || null);
        }
      } catch {
        if (mounted) {
          setZones([]);
          setSelectedZone(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [harbor]);

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-y-auto bg-slate-50 font-mono text-xs select-none p-3 sm:p-5 space-y-4">
      {/* Top Banner / Disclaimer */}
      <div className="bg-amber-50 border border-amber-300 rounded p-3 text-amber-900 flex items-start space-x-2.5">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-800 uppercase block text-[11px]">
            DECISION SUPPORT & MARINERS NOTICE
          </span>
          <p className="text-[10px] leading-relaxed">
            Potential Fishing Zones (PFZs) are environmental candidate regions derived mathematically from thermal gradients and chlorophyll fronts. This is a scientific guidance tool, NOT certified navigation and NOT a guarantee of fish catch. Observe local weather and official marine advisories.
          </p>
        </div>
      </div>

      {/* Harbor Selector Bar */}
      <div className="bg-white border border-border-orca rounded p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <Navigation className="w-4 h-4 text-orca-blue" />
          <span className="font-bold text-primary-text uppercase">Departure Harbor:</span>
          <select
            value={harbor}
            onChange={(e) => setHarbor(e.target.value)}
            className="bg-secondary-surface border border-border-orca rounded px-2.5 py-1 font-bold text-primary-text cursor-pointer"
          >
            {harbors.map((h) => (
              <option key={h} value={h}>
                {h} Harbor
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2 text-[10px]">
          {loading ? (
            <span className="flex items-center space-x-1 text-orca-blue">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>COMPUTING ZONES</span>
            </span>
          ) : (
            <span className="text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded font-bold">
              {zones.length} CANDIDATE ZONES AVAILABLE
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Zone List & Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 1/3: Candidate Zone List */}
        <div className="bg-white border border-border-orca rounded p-3 space-y-2.5">
          <div className="flex items-center justify-between border-b border-border-orca pb-2">
            <span className="font-bold text-primary-text uppercase">Candidate Zones</span>
            <span className="text-[9px] text-muted-orca">v1.0-deterministic</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-orca flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-orca-blue" />
                <span>Loading environmental zones...</span>
              </div>
            ) : zones.length === 0 ? (
              <div className="p-4 text-center text-muted-orca">No candidate zones found.</div>
            ) : (
              zones.map((z) => {
                const isSelected = selectedZone?.id === z.id;
                return (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZone(z)}
                    className={`w-full text-left p-2.5 rounded border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 border-orca-blue shadow-xs'
                        : 'bg-secondary-surface border-border-orca hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary-text text-[11px]">{z.name}</span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                          z.classification === 'HIGH'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {z.score}/100
                      </span>
                    </div>

                    <div className="text-[9px] text-secondary-text pt-1 flex justify-between">
                      <span>Distance: {z.distance_km} km</span>
                      <span>Bearing: {z.bearing_deg}° (Est.)</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2/3: Selected Zone Environmental Details */}
        <div className="lg:col-span-2 space-y-4">
          {selectedZone ? (
            <div className="bg-white border border-border-orca rounded p-4 space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border-orca pb-3 gap-2">
                <div>
                  <span className="text-[9px] text-muted-orca uppercase block">Selected Zone</span>
                  <h3 className="text-base font-bold text-primary-text">{selectedZone.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-bold text-[10px]">
                    SUITABILITY: {selectedZone.score}/100
                  </span>
                </div>
              </div>

              {/* Navigation Guidance Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] bg-secondary-surface p-3 rounded border border-border-orca">
                <div>
                  <span className="text-muted-orca uppercase block">Coordinates</span>
                  <span className="font-bold text-primary-text block">
                    {selectedZone.latitude.toFixed(4)}°N
                  </span>
                  <span className="font-bold text-primary-text block">
                    {selectedZone.longitude.toFixed(4)}°E
                  </span>
                </div>
                <div>
                  <span className="text-muted-orca uppercase block">Distance</span>
                  <span className="text-base font-bold text-orca-blue block">
                    {selectedZone.distance_km} km
                  </span>
                  <span className="text-[8px] text-muted-orca">From {harbor}</span>
                </div>
                <div>
                  <span className="text-muted-orca uppercase block">Calculated Bearing</span>
                  <span className="text-base font-bold text-primary-text block">
                    {selectedZone.bearing_deg}°
                  </span>
                  <span className="text-[8px] text-muted-orca">Haversine Heading</span>
                </div>
                <div>
                  <span className="text-muted-orca uppercase block">Estimated Transit</span>
                  <span className="text-base font-bold text-primary-text block">
                    ~{Math.round((selectedZone.distance_km / 18) * 60)} min
                  </span>
                  <span className="text-[8px] text-muted-orca">At 10 knots</span>
                </div>
              </div>

              {/* Environmental Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded space-y-1">
                  <div className="flex items-center space-x-1 text-red-700">
                    <Thermometer className="w-4 h-4" />
                    <span className="font-bold uppercase text-[10px]">Sea Surface Temp</span>
                  </div>
                  <div className="text-xl font-bold text-red-900 font-sans">
                    {selectedZone.sst_c} °C
                  </div>
                  <span className="text-[8px] text-red-700 block">
                    Gradient: {selectedZone.sst_gradient_c_per_km} °C/km (Front)
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded space-y-1">
                  <div className="flex items-center space-x-1 text-emerald-700">
                    <Activity className="w-4 h-4" />
                    <span className="font-bold uppercase text-[10px]">Chlorophyll-a</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-900 font-sans">
                    {selectedZone.chlorophyll_mg_m3} mg/m³
                  </div>
                  <span className="text-[8px] text-emerald-700 block">
                    High Nutrient Plume
                  </span>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded space-y-1">
                  <div className="flex items-center space-x-1 text-blue-700">
                    <Waves className="w-4 h-4" />
                    <span className="font-bold uppercase text-[10px]">Sea State (Wave)</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900 font-sans">
                    {selectedZone.wave_height_m} m
                  </div>
                  <span className="text-[8px] text-blue-700 block">
                    Spectral Wave Model
                  </span>
                </div>
              </div>

              {/* Scientific Rationale */}
              <div className="p-3 bg-secondary-surface rounded border border-border-orca space-y-1">
                <span className="font-bold text-primary-text uppercase text-[9px] block">
                  Scientific Front Rationale
                </span>
                <p className="text-secondary-text leading-relaxed text-[10px]">
                  {selectedZone.rationale}
                </p>
              </div>

              {/* Provenance */}
              <div className="text-[8px] text-muted-orca border-t border-border-orca pt-2 flex flex-col sm:flex-row justify-between gap-1">
                <span>Method: {selectedZone.method_version || 'v1.0-deterministic'}</span>
                <span>Sources: Copernicus Marine OSTIA L4 + BGC L3</span>
                <span>Generated: {selectedZone.computed_at ? selectedZone.computed_at.slice(0, 16) + ' UTC' : 'Live'}</span>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border-orca rounded p-8 text-center text-muted-orca">
              Select a candidate zone to view environmental conditions and calculated bearing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
