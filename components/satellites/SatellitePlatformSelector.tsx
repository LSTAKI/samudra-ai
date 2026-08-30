'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockSatellitePlatforms } from '@/mock/mockSatellites';
import { SatellitePlatform } from '@/types/satellite';
import { Radio, Layers, Satellite, ExternalLink, Check } from 'lucide-react';

interface Props {
  searchQuery: string;
}

export default function SatellitePlatformSelector({ searchQuery }: Props) {
  const { selectedPlatformId, setSelectedPlatformId } = useOrcaStore();

  const filteredPlatforms = mockSatellitePlatforms.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.agency.toLowerCase().includes(q) ||
      p.sensors.some((s) => s.name.toLowerCase().includes(q)) ||
      p.verifiedProducts.some((prod) => prod.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono flex items-center gap-1">
          <Satellite className="w-3 h-3 text-orca-blue" />
          OBSERVATION PLATFORMS
        </h3>
        <span className="text-[9px] font-mono text-muted-orca">
          {filteredPlatforms.length} PLATFORMS
        </span>
      </div>

      <div className="space-y-2">
        {filteredPlatforms.map((platform) => {
          const isSelected = selectedPlatformId === platform.id;

          return (
            <div
              key={platform.id}
              onClick={() => setSelectedPlatformId(isSelected ? null : platform.id)}
              className={`p-2.5 rounded border transition-all cursor-pointer ${
                isSelected
                  ? 'border-orca-blue bg-blue-50/30 ring-1 ring-orca-blue/20'
                  : 'border-border-orca bg-white hover:border-[#1b3459]/40 hover:bg-secondary-surface/40'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold text-primary-text font-mono">
                      {platform.name}
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-orca-blue" />}
                  </div>
                  <div className="text-[9px] text-muted-orca font-mono mt-0.5 flex items-center gap-2">
                    <span className="font-semibold text-secondary-text">{platform.agency}</span>
                    <span>·</span>
                    <span>{platform.altitudeKm.toLocaleString()} km</span>
                  </div>
                </div>

                <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  {platform.status}
                </span>
              </div>

              {/* Mission Summary */}
              <p className="text-[9px] text-muted-orca font-sans line-clamp-2 mt-1.5 leading-snug">
                {platform.mission}
              </p>

              {/* Verified Sensors Badge List */}
              <div className="mt-2 pt-2 border-t border-border-orca/60 flex flex-wrap gap-1">
                {platform.sensors.map((sensor) => (
                  <span
                    key={sensor.id}
                    className="text-[8px] font-mono bg-secondary-surface text-secondary-text px-1.5 py-0.5 rounded border border-border-orca/80 truncate max-w-[140px]"
                    title={`${sensor.name}: ${sensor.description}`}
                  >
                    {sensor.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}

        {filteredPlatforms.length === 0 && (
          <div className="text-center py-4 text-xs text-muted-orca font-mono bg-secondary-surface rounded border border-border-orca">
            NO PLATFORMS MATCH SEARCH
          </div>
        )}
      </div>
    </div>
  );
}
