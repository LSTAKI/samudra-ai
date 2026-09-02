'use client';

import React, { useEffect, useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchPFZZones, PFZZone } from '@/lib/api/pfz';
import { pfzRegionPresets } from '@/lib/map/pfzPresets';
import { ArrowUpDown, Check, Target, RefreshCw } from 'lucide-react';

export default function PFZCandidateTable() {
  const {
    selectedPFZZoneId,
    setSelectedPFZZoneId,
    setSelectedCoordinates,
    selectedPFZRegion,
    selectedLatitude,
    selectedLongitude
  } = useOrcaStore();

  const [zones, setZones] = useState<PFZZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<'score' | 'id' | 'latitude'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const activeRegion =
    pfzRegionPresets.find((r) => r.id === selectedPFZRegion) || pfzRegionPresets[0];

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchPFZZones(
          selectedLatitude || activeRegion.centerLat,
          selectedLongitude || activeRegion.centerLng,
          activeRegion.harbor
        );
        if (mounted && res.zones) {
          setZones(res.zones);
        }
      } catch (err) {
        console.error('Failed to load table zones:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [selectedPFZRegion, selectedLatitude, selectedLongitude]);

  const handleSort = (field: 'score' | 'id' | 'latitude') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedZones = [...zones].sort((a, b) => {
    let diff = 0;
    if (sortField === 'score') diff = a.score - b.score;
    else if (sortField === 'id') diff = a.id.localeCompare(b.id);
    else if (sortField === 'latitude') diff = a.latitude - b.latitude;
    return sortAsc ? diff : -diff;
  });

  const handleSelectZone = (zone: PFZZone) => {
    setSelectedPFZZoneId(zone.id);
    setSelectedCoordinates({ lat: zone.latitude, lng: zone.longitude });
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
    <div className="w-full h-full flex flex-col font-mono text-[10px] select-none overflow-hidden">
      {loading && (
        <div className="p-2 bg-blue-50 border-b border-border-orca text-orca-blue flex items-center gap-1.5 text-[9px] font-bold">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>QUERYING COPERNICUS PFZ ENGINE...</span>
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary-surface text-secondary-text border-b border-border-orca sticky top-0 z-10 text-[9px] uppercase tracking-wider">
              <th className="py-2 px-3 cursor-pointer hover:text-primary-text" onClick={() => handleSort('id')}>
                <div className="flex items-center space-x-1">
                  <span>ZONE ID</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2 px-3">CANDIDATE SECTOR</th>
              <th className="py-2 px-3 cursor-pointer hover:text-primary-text" onClick={() => handleSort('latitude')}>
                <div className="flex items-center space-x-1">
                  <span>COORDINATES</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2 px-3">SST (°C)</th>
              <th className="py-2 px-3">CHL (mg/m³)</th>
              <th className="py-2 px-3">WAVE (m)</th>
              <th className="py-2 px-3">DEPTH</th>
              <th className="py-2 px-3 cursor-pointer hover:text-primary-text" onClick={() => handleSort('score')}>
                <div className="flex items-center space-x-1">
                  <span>SCORE</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2 px-3">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-orca/60 bg-white">
            {sortedZones.length === 0 && !loading && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-muted-orca">
                  No PFZ candidate zones returned for selected sector.
                </td>
              </tr>
            )}
            {sortedZones.map((zone) => {
              const isSelected = selectedPFZZoneId === zone.id;

              return (
                <tr
                  key={zone.id}
                  onClick={() => handleSelectZone(zone)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-blue-50/50 font-semibold text-primary-text'
                      : 'hover:bg-secondary-surface/60 text-secondary-text'
                  }`}
                >
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <div className="flex items-center space-x-1.5 font-bold text-primary-text">
                      <Target className={`w-3 h-3 ${isSelected ? 'text-orca-blue' : 'text-muted-orca'}`} />
                      <span>{zone.id}</span>
                      {isSelected && <Check className="w-3 h-3 text-orca-blue" />}
                    </div>
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap text-primary-text">
                    {zone.name}
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap font-mono text-[9px]">
                    {zone.latitude.toFixed(4)}°N, {zone.longitude.toFixed(4)}°E
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap font-bold text-red-600">
                    {zone.sst_c.toFixed(1)}°C
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap font-bold text-emerald-700">
                    {zone.chlorophyll_mg_m3.toFixed(2)}
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap text-blue-700">
                    {zone.wave_height_m.toFixed(1)}m
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap text-muted-orca">
                    {zone.depth_m}m
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-primary-text">{zone.score}</span>
                    <span className="text-muted-orca">/100</span>
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <span className={`px-1.5 py-0.2 rounded border text-[8px] ${getClassificationBadge(zone.classification)}`}>
                      {zone.classification}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
