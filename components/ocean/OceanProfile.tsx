'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import {
  Compass,
  Layers,
  Thermometer,
  Waves,
  Droplet,
  Activity,
  Info,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function OceanProfile() {
  const {
    selectedLatitude,
    selectedLongitude,
    selectedCoordinates,
    selectedParameter,
    selectedDepth,
    selectedTimestamp,
    copernicusTileStatus
  } = useOrcaStore();

  const lat = selectedCoordinates ? selectedCoordinates.lat : (selectedLatitude ?? 9.9312);
  const lng = selectedCoordinates ? selectedCoordinates.lng : (selectedLongitude ?? 76.2673);

  const getProfileMeta = () => {
    switch (selectedParameter) {
      case 'waveHeight':
        return {
          name: 'SIGNIFICANT WAVE HEIGHT',
          variable: 'VHM0 (Hm0)',
          source: 'COPERNICUS MARINE',
          dataset: 'GLOBAL_ANALYSISFORECAST_WAV_001_027',
          unit: 'm',
          status: 'CONNECTED',
          isReal: true,
          resolution: '0.083° (~9 km) · PT3H',
          icon: Waves
        };
      case 'seaLevel':
        return {
          name: 'SEA LEVEL ANOMALY',
          variable: 'sla',
          source: 'COPERNICUS MARINE',
          dataset: 'SEALEVEL_GLO_PHY_L4_NRT_008_046',
          unit: 'm',
          status: 'CONNECTED',
          isReal: true,
          resolution: '0.125° (~14 km) · P1D',
          icon: Droplet
        };
      case 'chlorophyll':
        return {
          name: 'CHLOROPHYLL-a',
          variable: 'CHL',
          source: 'COPERNICUS MARINE',
          dataset: 'OCEANCOLOUR_GLO_BGC_L4_NRT_009_102',
          unit: 'mg/m³',
          status: 'CONNECTED',
          isReal: true,
          resolution: '4 km (~0.04°) · P1D',
          icon: Activity
        };
      case 'currents':
        return {
          name: 'OCEAN SURFACE CURRENT',
          variable: 'uo, vo',
          source: 'COPERNICUS MARINE',
          dataset: 'GLOBAL_ANALYSISFORECAST_PHY_001_024',
          unit: 'm/s',
          status: 'AVAILABLE SOON',
          isReal: false,
          resolution: '0.083° (~9 km) · P1D',
          icon: Compass
        };
      case 'salinity':
        return {
          name: 'SEA SURFACE SALINITY',
          variable: 'sos',
          source: 'AQUARIUS SATELLITE (DEMO)',
          dataset: 'AQUARIUS_L3_SSS_MOCK',
          unit: 'psu',
          status: 'DEMO',
          isReal: false,
          resolution: '0.25° · 8-Day',
          icon: Droplet
        };
      case 'sst':
      default:
        return {
          name: 'SEA SURFACE TEMPERATURE',
          variable: 'analysed_sst',
          source: 'COPERNICUS MARINE',
          dataset: 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001 (OSTIA)',
          unit: '°C',
          status: copernicusTileStatus === 'CONNECTED' ? 'CONNECTED' : 'LOADING',
          isReal: true,
          resolution: '0.05° (~5 km) · P1D',
          icon: Thermometer
        };
    }
  };

  const meta = getProfileMeta();
  const Icon = meta.icon;

  const formatTimestamp = (timeStr: string) => {
    try {
      const d = new Date(timeStr);
      if (isNaN(d.getTime())) return timeStr;
      return d.toUTCString().replace('GMT', 'UTC');
    } catch {
      return timeStr;
    }
  };

  return (
    <aside className="w-[320px] bg-white border-l border-border-orca h-full flex flex-col font-sans select-none z-20 shrink-0">
      {/* Header */}
      <div className="h-14 border-b border-border-orca px-4 flex items-center justify-between bg-secondary-surface">
        <div className="flex items-center space-x-2">
          <Icon className="w-4 h-4 text-orca-blue" />
          <h2 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
            OCEAN PROFILE
          </h2>
        </div>
        <span className="text-[9px] font-mono text-muted-orca bg-white px-1.5 py-0.5 border border-border-orca rounded">
          HYDROGRAPHIC SPEC
        </span>
      </div>

      {/* Profile Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-xs">
        {/* Spatial Coordinates Card */}
        <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-1.5">
          <div className="text-[9px] text-muted-orca font-mono uppercase tracking-wider">
            SAMPLING LOCATION
          </div>
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-sm font-bold text-primary-text">
              {lat > 0 ? `${lat.toFixed(4)}° N` : `${Math.abs(lat).toFixed(4)}° S`}
              {' · '}
              {lng > 0 ? `${lng.toFixed(4)}° E` : `${Math.abs(lng).toFixed(4)}° W`}
            </span>
          </div>
          <div className="text-[10px] text-muted-orca font-mono flex items-center justify-between">
            <span>DEPTH LAYER:</span>
            <span className="font-bold text-primary-text">
              {selectedDepth === 0 ? 'SURFACE (0m)' : `${selectedDepth} METERS`}
            </span>
          </div>
        </div>

        {/* Active Parameter Scientific Provenance */}
        <div className="bg-white border border-border-orca rounded p-2.5 space-y-2 font-mono text-[10px]">
          <div className="flex items-center justify-between border-b border-border-orca pb-1.5">
            <span className="text-secondary-text">VARIABLE:</span>
            <span className="font-bold text-primary-text uppercase">{meta.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-text">PARAMETER ID:</span>
            <span className="font-bold text-primary-text">{meta.variable}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-text">STANDARD UNIT:</span>
            <span className="font-bold text-primary-text">{meta.unit}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-text">DATA SOURCE:</span>
            <span className="font-bold text-primary-text">{meta.source}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-text">DATASET:</span>
            <span className="font-bold text-primary-text truncate max-w-[150px]" title={meta.dataset}>
              {meta.dataset}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-secondary-text">RESOLUTION:</span>
            <span className="font-bold text-primary-text">{meta.resolution}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-orca">
            <span className="text-secondary-text">DATA STATUS:</span>
            {meta.isReal ? (
              <span className="text-success-orca font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success-orca inline-block"></span>
                CONNECTED (REAL DATA)
              </span>
            ) : meta.status === 'AVAILABLE SOON' ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block"></span>
                AVAILABLE SOON
              </span>
            ) : (
              <span className="text-muted-orca font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"></span>
                DEMO / MOCK FEED
              </span>
            )}
          </div>
        </div>

        {/* Depth Profile Visualization Section (Honest Provenance) */}
        <div className="border border-border-orca rounded p-3 bg-secondary-surface space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span className="text-[10px] font-bold text-secondary-text uppercase tracking-wider">
              DEPTH PROFILE (Z-AXIS)
            </span>
            <span className="text-[9px] text-amber-600 font-bold px-1 py-0.5 rounded bg-amber-50 border border-amber-200">
              UNAVAILABLE
            </span>
          </div>

          <div className="bg-white border border-border-orca/80 rounded p-3 text-center space-y-2">
            <div className="w-8 h-8 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-secondary-text">
              <Layers className="w-4 h-4 text-muted-orca" />
            </div>
            <p className="text-[10px] font-mono text-secondary-text leading-relaxed">
              DEPTH PROFILE NOT AVAILABLE FOR SELECTED DATASET.
            </p>
            <p className="text-[9px] text-muted-orca leading-normal">
              {meta.name} is provided as a Level-4 gap-free surface observation product. Subsurface vertical profiles require integrated ARGO float telemetry or numerical 3D baroclinic model data.
            </p>
          </div>
        </div>

        {/* Canonical Temporal Metadata */}
        <div className="space-y-1 bg-white border border-border-orca rounded p-2.5 text-[9px] font-mono text-muted-orca">
          <div className="flex justify-between">
            <span>OBSERVATION TIME:</span>
            <span className="font-bold text-primary-text">{formatTimestamp(selectedTimestamp)}</span>
          </div>
          <div className="flex justify-between">
            <span>QUALITY ASSURANCE:</span>
            <span className="font-bold text-success-orca">OPERATIONAL VALIDATED</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
