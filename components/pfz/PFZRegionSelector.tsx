'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { pfzRegionPresets } from '@/mock/mockPFZ';
import { MapPin, Check, Compass, Sliders } from 'lucide-react';

export default function PFZRegionSelector() {
  const {
    selectedPFZRegion,
    setSelectedPFZRegion,
    selectedLatitude,
    selectedLongitude,
    setSelectedCoordinates
  } = useOrcaStore();

  const activePreset =
    pfzRegionPresets.find((p) => p.id === selectedPFZRegion) || pfzRegionPresets[0];

  const [inputLat, setInputLat] = useState(activePreset.centerLat.toFixed(4));
  const [inputLng, setInputLng] = useState(activePreset.centerLng.toFixed(4));
  const [radiusKm, setRadiusKm] = useState(String(activePreset.defaultRadiusKm));
  const [applied, setApplied] = useState(false);

  const handleSelectPreset = (preset: typeof pfzRegionPresets[0]) => {
    setSelectedPFZRegion(preset.id);
    setInputLat(preset.centerLat.toFixed(4));
    setInputLng(preset.centerLng.toFixed(4));
    setRadiusKm(String(preset.defaultRadiusKm));
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
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`p-1.5 rounded border text-left transition-all ${
                isSelected
                  ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                  : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
              }`}
            >
              <span className="block truncate">{preset.name}</span>
              <span className="text-[8px] opacity-75 font-normal block truncate">
                {preset.basin}
              </span>
            </button>
          );
        })}
      </div>

      {/* Manual Coordinates & Radius Form */}
      <form
        onSubmit={handleApply}
        className="bg-secondary-surface p-2.5 rounded border border-border-orca space-y-2"
      >
        <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
          <div>
            <label className="text-[8px] text-muted-orca uppercase block mb-0.5">Lat (°N)</label>
            <input
              type="number"
              step="0.0001"
              value={inputLat}
              onChange={(e) => setInputLat(e.target.value)}
              className="w-full bg-white border border-border-orca rounded px-1.5 py-1 text-[10px] text-primary-text font-mono focus:outline-none focus:border-orca-blue"
            />
          </div>
          <div>
            <label className="text-[8px] text-muted-orca uppercase block mb-0.5">Lng (°E)</label>
            <input
              type="number"
              step="0.0001"
              value={inputLng}
              onChange={(e) => setInputLng(e.target.value)}
              className="w-full bg-white border border-border-orca rounded px-1.5 py-1 text-[10px] text-primary-text font-mono focus:outline-none focus:border-orca-blue"
            />
          </div>
          <div>
            <label className="text-[8px] text-muted-orca uppercase block mb-0.5">Radius (km)</label>
            <input
              type="number"
              value={radiusKm}
              onChange={(e) => setRadiusKm(e.target.value)}
              className="w-full bg-white border border-border-orca rounded px-1.5 py-1 text-[10px] text-primary-text font-mono focus:outline-none focus:border-orca-blue"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-ocean-navy hover:bg-[#12315b] text-white py-1 rounded text-[9px] font-mono font-bold tracking-wider uppercase transition-colors"
        >
          APPLY REGION
        </button>
      </form>
    </div>
  );
}
