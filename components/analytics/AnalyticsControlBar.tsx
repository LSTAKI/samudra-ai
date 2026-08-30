'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { analyticsRegions } from '@/mock/mockAnalytics';
import {
  BarChart3,
  Calendar,
  Layers,
  Radio,
  MapPin,
  Compass,
  Check
} from 'lucide-react';

export default function AnalyticsControlBar() {
  const {
    analyticsRegion,
    setAnalyticsRegion,
    analyticsPeriod,
    setAnalyticsPeriod,
    analyticsPrimaryParam,
    setAnalyticsPrimaryParam,
    analyticsActiveSources,
    setAnalyticsActiveSources,
    selectedCoordinates,
    setSelectedCoordinates
  } = useOrcaStore();

  const handleRegionChange = (regionId: string) => {
    setAnalyticsRegion(regionId);
    const reg = analyticsRegions.find((r) => r.id === regionId);
    if (reg) {
      setSelectedCoordinates({ lat: reg.centerLat, lng: reg.centerLng });
    }
  };

  const toggleSource = (sourceId: string) => {
    if (analyticsActiveSources.includes(sourceId)) {
      if (analyticsActiveSources.length > 1) {
        setAnalyticsActiveSources(analyticsActiveSources.filter((s) => s !== sourceId));
      }
    } else {
      setAnalyticsActiveSources([...analyticsActiveSources, sourceId]);
    }
  };

  return (
    <div className="bg-white border-b border-border-orca px-4 py-2 flex flex-wrap items-center justify-between gap-3 font-sans select-none z-20 shrink-0">
      {/* Left: Region & Coordinates */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 font-mono text-[11px] font-bold text-primary-text">
          <BarChart3 className="w-4 h-4 text-orca-blue" />
          <span className="tracking-wider uppercase">ANALYTICS WORKSPACE</span>
        </div>

        {/* Region Dropdown */}
        <div className="flex items-center space-x-1.5 pl-3 border-l border-border-orca font-mono text-[10px]">
          <MapPin className="w-3 h-3 text-secondary-text" />
          <span className="text-muted-orca uppercase">REGION:</span>
          <select
            value={analyticsRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="bg-secondary-surface border border-border-orca rounded px-2 py-1 text-primary-text font-bold text-[10px] focus:outline-none focus:border-orca-blue"
          >
            {analyticsRegions.map((reg) => (
              <option key={reg.id} value={reg.id}>
                {reg.name} ({reg.basin})
              </option>
            ))}
          </select>
        </div>

        {/* Canonical Coordinates Display */}
        {selectedCoordinates && (
          <div className="hidden lg:flex items-center space-x-1 text-[9px] font-mono text-muted-orca bg-secondary-surface px-2 py-1 rounded border border-border-orca">
            <Compass className="w-2.5 h-2.5 text-orca-blue" />
            <span>
              {selectedCoordinates.lat.toFixed(2)}°N, {selectedCoordinates.lng.toFixed(2)}°E
            </span>
          </div>
        )}
      </div>

      {/* Center: Parameter Switcher & Time Period */}
      <div className="flex items-center space-x-3">
        {/* Parameter Buttons */}
        <div className="flex items-center space-x-1 font-mono text-[9px]">
          <span className="text-muted-orca uppercase pr-1">PARAMETER:</span>
          <button
            type="button"
            onClick={() => setAnalyticsPrimaryParam('sst')}
            className={`px-2 py-1 rounded border transition-all ${
              analyticsPrimaryParam === 'sst'
                ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
            }`}
          >
            SST (°C)
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsPrimaryParam('chlorophyll')}
            className={`px-2 py-1 rounded border transition-all ${
              analyticsPrimaryParam === 'chlorophyll'
                ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
            }`}
          >
            CHL-a (mg/m³)
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsPrimaryParam('waveHeight')}
            className={`px-2 py-1 rounded border transition-all ${
              analyticsPrimaryParam === 'waveHeight'
                ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
            }`}
          >
            WAVES (m)
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsPrimaryParam('seaLevel')}
            className={`px-2 py-1 rounded border transition-all ${
              analyticsPrimaryParam === 'seaLevel'
                ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
            }`}
          >
            SLA (m)
          </button>
        </div>

        {/* Period Buttons */}
        <div className="flex items-center space-x-1 font-mono text-[9px] pl-3 border-l border-border-orca">
          <Calendar className="w-3 h-3 text-secondary-text mr-0.5" />
          {(['7d', '30d', '90d'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setAnalyticsPeriod(period)}
              className={`px-1.5 py-0.5 rounded border transition-all uppercase ${
                analyticsPeriod === period
                  ? 'bg-orca-blue text-white border-orca-blue font-bold shadow-xs'
                  : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Sources & Demo Status */}
      <div className="flex items-center space-x-2 font-mono text-[9px]">
        <span className="text-muted-orca uppercase">SOURCES:</span>
        {(['copernicus', 'isro', 'incois', 'noaa'] as const).map((source) => {
          const isActive = analyticsActiveSources.includes(source);
          return (
            <button
              key={source}
              type="button"
              onClick={() => toggleSource(source)}
              className={`px-1.5 py-0.5 rounded border transition-all uppercase ${
                isActive
                  ? 'bg-secondary-surface text-primary-text border-border-orca font-bold'
                  : 'bg-white text-muted-orca/60 border-border-orca/40 line-through'
              }`}
            >
              {source}
            </button>
          );
        })}

        <span className="text-[8px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded ml-1">
          DEMO ANALYTICS
        </span>
      </div>
    </div>
  );
}
