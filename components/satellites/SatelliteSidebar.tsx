'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import SatellitePlatformSelector from './SatellitePlatformSelector';
import SatelliteSensorSelector from './SatelliteSensorSelector';
import SatelliteProductSelector from './SatelliteProductSelector';
import SatelliteProvenance from './SatelliteProvenance';
import {
  Satellite,
  Search,
  Sliders,
  Layers,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';

export default function SatelliteSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const {
    satelliteLayerVisibility,
    setSatelliteLayerVisibility
  } = useOrcaStore();

  return (
    <aside className="w-[320px] bg-white border-r border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Satellite className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            SATELLITE OBSERVATORY
          </h2>
        </div>
        <span className="text-[9px] font-mono text-muted-orca bg-white px-1.5 py-0.5 border border-border-orca rounded font-bold">
          ORBITAL CONSOLE
        </span>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-border-orca bg-white">
        <div className="relative">
          <input
            type="text"
            placeholder="Search satellite, sensor, product, lat/lon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary-surface border border-border-orca rounded py-1.5 pl-8 pr-3 text-xs text-primary-text placeholder-muted-orca focus:outline-none focus:border-orca-blue font-mono transition-all"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-orca" />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Platforms */}
        <SatellitePlatformSelector searchQuery={searchQuery} />

        {/* Sensors Category Filter */}
        <SatelliteSensorSelector />

        {/* Products Filter */}
        <SatelliteProductSelector />

        {/* Map Layer Display Toggles */}
        <div className="space-y-2 border-t border-border-orca pt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono flex items-center gap-1">
              <Layers className="w-3 h-3 text-orca-blue" />
              MAP VISIBILITY LAYERS
            </h3>
            <span className="text-[9px] font-mono text-muted-orca">OVERLAYS</span>
          </div>

          <div className="space-y-1.5 font-mono text-[10px]">
            <div className="flex items-center justify-between p-1.5 rounded border border-border-orca bg-secondary-surface">
              <span className="text-primary-text">ORBITAL GROUND TRACKS</span>
              <button
                type="button"
                onClick={() =>
                  setSatelliteLayerVisibility(
                    'tracks',
                    !satelliteLayerVisibility.tracks
                  )
                }
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  satelliteLayerVisibility.tracks
                    ? 'bg-ocean-navy text-white'
                    : 'bg-white text-muted-orca border border-border-orca'
                }`}
              >
                {satelliteLayerVisibility.tracks ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{satelliteLayerVisibility.tracks ? 'SHOWN' : 'HIDDEN'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded border border-border-orca bg-secondary-surface">
              <span className="text-primary-text">OBSERVATION FOOTPRINTS / SWATHS</span>
              <button
                type="button"
                onClick={() =>
                  setSatelliteLayerVisibility(
                    'footprints',
                    !satelliteLayerVisibility.footprints
                  )
                }
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  satelliteLayerVisibility.footprints
                    ? 'bg-ocean-navy text-white'
                    : 'bg-white text-muted-orca border border-border-orca'
                }`}
              >
                {satelliteLayerVisibility.footprints ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{satelliteLayerVisibility.footprints ? 'SHOWN' : 'HIDDEN'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded border border-border-orca bg-secondary-surface">
              <span className="text-primary-text">OBSERVATION NADIR POINTS</span>
              <button
                type="button"
                onClick={() =>
                  setSatelliteLayerVisibility(
                    'points',
                    !satelliteLayerVisibility.points
                  )
                }
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[9px] font-bold transition-all ${
                  satelliteLayerVisibility.points
                    ? 'bg-ocean-navy text-white'
                    : 'bg-white text-muted-orca border border-border-orca'
                }`}
              >
                {satelliteLayerVisibility.points ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{satelliteLayerVisibility.points ? 'SHOWN' : 'HIDDEN'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Provenance Card */}
        <SatelliteProvenance />
      </div>
    </aside>
  );
}
