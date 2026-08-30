'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockPFZZones } from '@/mock/mockPFZ';
import { PFZZone } from '@/types/pfz';
import { ArrowUpDown, Check, Target } from 'lucide-react';

export default function PFZCandidateTable() {
  const {
    selectedPFZZoneId,
    setSelectedPFZZoneId,
    setSelectedCoordinates
  } = useOrcaStore();

  const [sortField, setSortField] = useState<'score' | 'id' | 'latitude'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: 'score' | 'id' | 'latitude') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedZones = [...mockPFZZones].sort((a, b) => {
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
        return 'text-success-orca bg-success-orca/10 border-success-orca/30 font-bold';
      case 'MODERATE':
        return 'text-amber-700 bg-amber-50 border-amber-200 font-bold';
      case 'LOW':
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200 font-bold';
    }
  };

  return (
    <div className="w-full h-full flex flex-col font-mono text-[10px] select-none overflow-hidden">
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
              <th className="py-2 px-3">SECTOR / BASIN</th>
              <th className="py-2 px-3 cursor-pointer hover:text-primary-text" onClick={() => handleSort('latitude')}>
                <div className="flex items-center space-x-1">
                  <span>COORDINATES</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2 px-3 cursor-pointer hover:text-primary-text" onClick={() => handleSort('score')}>
                <div className="flex items-center space-x-1">
                  <span>SCORE</span>
                  <ArrowUpDown className="w-2.5 h-2.5" />
                </div>
              </th>
              <th className="py-2 px-3">CONFIDENCE</th>
              <th className="py-2 px-3">PRIMARY FACTOR</th>
              <th className="py-2 px-3">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-orca/60 bg-white">
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
                    {zone.sector}
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap font-mono text-[9px]">
                    {zone.latitude.toFixed(2)}°N, {zone.longitude.toFixed(2)}°E
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <span className="font-bold text-primary-text">{zone.score}</span>
                    <span className="text-muted-orca">/100</span>
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <span className={`px-1.5 py-0.2 rounded border text-[8px] ${getClassificationBadge(zone.classification)}`}>
                      {zone.classification} ({zone.confidence})
                    </span>
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap text-[9px] text-primary-text">
                    {zone.primaryFactor}
                  </td>
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded">
                      DEMO
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
