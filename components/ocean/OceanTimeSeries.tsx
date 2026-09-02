'use client';

import React, { useEffect, useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchCopernicusTimeseries, CopernicusTimeseriesResponse } from '@/lib/api/copernicus';
import { getLayerById } from '@/lib/map/layerRegistry';
import { Clock, TrendingUp, RefreshCw, Layers, Database, ShieldCheck } from 'lucide-react';

interface OceanTimeSeriesProps {
  onClose?: () => void;
}

export default function OceanTimeSeries({ onClose }: OceanTimeSeriesProps) {
  const { selectedCoordinates, selectedParameter } = useOrcaStore();
  const [timeseries, setTimeseries] = useState<CopernicusTimeseriesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const activeLayer = getLayerById(selectedParameter) || getLayerById('sst');
  const layerId = activeLayer ? activeLayer.id : 'copernicus-sst';
  const lat = selectedCoordinates ? selectedCoordinates.lat : 9.9312;
  const lon = selectedCoordinates ? selectedCoordinates.lng : 76.2673;

  useEffect(() => {
    let mounted = true;
    const loadTimeseries = async () => {
      setLoading(true);
      try {
        const res = await fetchCopernicusTimeseries(layerId, lat, lon, undefined, undefined, 5);
        if (mounted) {
          setTimeseries(res);
        }
      } catch {
        if (mounted) {
          setTimeseries(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadTimeseries();
    return () => {
      mounted = false;
    };
  }, [layerId, lat, lon]);

  const records = timeseries?.records || [];
  const validRecords = records.filter((r) => r.value !== null);
  const values = validRecords.map((r) => r.value as number);
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 1;
  const range = maxVal - minVal > 0 ? maxVal - minVal : 1;

  return (
    <div className="w-full bg-white border border-border-orca rounded font-mono text-[10px] select-none p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-orca pb-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-3.5 h-3.5 text-orca-blue" />
          <span className="font-bold text-primary-text uppercase tracking-wider">
            Observation Timeseries ({activeLayer?.name || 'SST'})
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <span className="flex items-center space-x-1 text-orca-blue text-[9px]">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span>RETRIEVING OBSERVATIONS</span>
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 text-[8px] font-bold">
              {timeseries?.count || 0} OBSERVATIONS LOADED
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-muted-orca hover:text-primary-text text-[9px] font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Dataset & Coordinate Metadata */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[8px] bg-secondary-surface p-2 rounded border border-border-orca">
        <div>
          <span className="text-muted-orca uppercase block">Target Coordinates</span>
          <span className="font-bold text-primary-text">{lat.toFixed(4)}° N, {lon.toFixed(4)}° E</span>
        </div>
        <div>
          <span className="text-muted-orca uppercase block">Copernicus Dataset</span>
          <span className="font-mono text-secondary-text truncate block">{timeseries?.dataset_id || activeLayer?.dataset || 'N/A'}</span>
        </div>
        <div>
          <span className="text-muted-orca uppercase block">Variable & Unit</span>
          <span className="font-bold text-primary-text">{timeseries?.variable || activeLayer?.variable} ({timeseries?.units || activeLayer?.units})</span>
        </div>
        <div>
          <span className="text-muted-orca uppercase block">Time Coverage</span>
          <span className="text-secondary-text truncate block">{timeseries?.time_range?.start ? `${timeseries.time_range.start.slice(0, 10)} → ${timeseries.time_range.end.slice(0, 10)}` : 'Historical Sequence'}</span>
        </div>
      </div>

      {/* Timeseries Visual Chart */}
      <div className="h-36 w-full bg-slate-950 rounded p-2 flex flex-col justify-between relative overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-orca-blue" />
            <span>Fetching Copernicus NetCDF Records...</span>
          </div>
        ) : records.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <span>No observation data available for selected coordinate</span>
          </div>
        ) : (
          <>
            {/* SVG Chart */}
            <div className="flex-1 w-full relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 90">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="50" x2="400" y2="50" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
                <line x1="0" y1="80" x2="400" y2="80" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />

                {/* Data Points and Polyline */}
                {(() => {
                  const points = records.map((r, i) => {
                    const x = (i / (records.length - 1 || 1)) * 380 + 10;
                    const val = r.value !== null ? r.value : minVal;
                    const y = 80 - ((val - minVal) / range) * 60;
                    return { x, y, val: r.value, ts: r.timestamp };
                  });

                  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
                  const areaPoints = `10,85 ${polylinePoints} 390,85`;

                  return (
                    <>
                      <polygon points={areaPoints} fill="url(#chartGrad)" />
                      <polyline
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={polylinePoints}
                      />
                      {points.map((p, idx) => (
                        <g key={idx}>
                          <circle cx={p.x} cy={p.y} r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1.5" />
                          <text
                            x={p.x}
                            y={p.y - 7}
                            textAnchor="middle"
                            fill="#f8fafc"
                            fontSize="8"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            {p.val !== null ? p.val.toFixed(2) : 'N/A'}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* X-Axis Timestamps */}
            <div className="flex justify-between text-[7.5px] text-slate-400 pt-1 border-t border-slate-800">
              {records.map((r, idx) => (
                <span key={idx} className="truncate">
                  {r.timestamp.slice(5, 10)}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Provenance Footer */}
      <div className="flex items-center justify-between text-[8px] text-muted-orca border-t border-border-orca pt-1">
        <span>Source: {timeseries?.source || 'Copernicus Marine Service'}</span>
        <span>Retrieved: {timeseries?.retrieved_at ? timeseries.retrieved_at.split('T')[1].slice(0, 8) + ' UTC' : 'N/A'}</span>
      </div>
    </div>
  );
}
