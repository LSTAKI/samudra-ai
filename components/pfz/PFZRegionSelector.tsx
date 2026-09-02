'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { pfzRegionPresets, PFZRegionPreset } from '@/lib/map/pfzPresets';
import { MapPin, Check } from 'lucide-react';

export default function PFZRegionSelector() {
  const {
    selectedPFZRegion,
    setSelectedPFZRegion,
    setSelectedCoordinates
  } = useOrcaStore();

  const activePreset =
    pfzRegionPresets.find((p) => p.id === selectedPFZRegion) || pfzRegionPresets[0];

  const [inputLat, setInputLat] = useState(activePreset.centerLat.toFixed(4));
  const [inputLng, setInputLng] = useState(activePreset.centerLng.toFixed(4));
  const [applied, setApplied] = useState(false);

  const handleSelectPreset = (preset: PFZRegionPreset) => {
    setSelectedPFZRegion(preset.id);
    setInputLat(preset.centerLat.toFixed(4));
    setInputLng(preset.centerLng.toFixed(4));
    setSelectedCoordinates({ lat: preset.centerLat, lng: preset.centerLng });
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(inputLat);
    const lng = parseFloat(inputLng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setSelectedCoordinates({ lat, lng });
      setApplied(true);
      setTimeout(() => setApplied(false), 1500);
    }
  };

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono flex items-center gap-1">
          <MapPin className="w-3 h-3 text-orca-blue" />
          TARGET REGION SELECTION
        </h3>
        {applied && (
          <span className="text-[9px] font-mono text-success-orca flex items-center gap-0.5 font-bold">
            <Check className="w-3 h-3" /> APPLIED
          </span>
        )}
      </div>

      {/* Preset Basin Buttons */}
      <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
        {pfzRegionPresets.map((preset) => {
          const isSelected = selectedPFZRegion === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`px-2 py-1.5 rounded border text-left flex items-center justify-between transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 border-orca-blue text-orca-blue font-bold shadow-xs'
                  : 'bg-white border-border-orca text-secondary-text hover:bg-secondary-surface hover:text-primary-text'
              }`}
            >
              <span className="truncate">{preset.name.split('/')[0].trim()}</span>
              {isSelected && <Check className="w-2.5 h-2.5 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Coordinates Form */}
      <form onSubmit={handleApply} className="bg-secondary-surface p-2 rounded border border-border-orca space-y-1.5 font-mono text-[9px]">
        <div className="grid grid-cols-2 gap-1.5">
          <div>
            <label className="text-muted-orca uppercase block text-[8px]">CENTER LAT</label>
            <input
              type="text"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              className="w-full bg-white border border-border-orca rounded px-1.5 py-1 text-primary-text font-bold"
            />
          </div>
          <div>
            <label className="text-muted-orca uppercase block text-[8px]">CENTER LON</label>
            <input
              type="text"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              className="w-full bg-white border border-border-orca rounded px-1.5 py-1 text-primary-text font-bold"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-white hover:bg-slate-200 border border-border-orca text-primary-text font-bold py-1 rounded transition-colors text-[9px] cursor-pointer"
        >
          UPDATE SECTOR COORDINATES
        </button>
      </form>
    </div>
  );
}
