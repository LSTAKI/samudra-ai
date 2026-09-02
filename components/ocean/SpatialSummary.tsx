'use client';

import React, { useState, useEffect } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchCopernicusSpatialSummary, CopernicusSpatialSummaryResponse } from '@/lib/api/copernicus';
import { getLayerById } from '@/lib/map/layerRegistry';
import { Square, RefreshCw, BarChart2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SpatialSummaryProps {
  onClose?: () => void;
}

export default function SpatialSummary({ onClose }: SpatialSummaryProps) {
  const { selectedParameter, selectedTimestamp } = useOrcaStore();
  const [minLat, setMinLat] = useState(9.0);
  const [maxLat, setMaxLat] = useState(11.0);
  const [minLon, setMinLon] = useState(74.0);
  const [maxLon, setMaxLon] = useState(76.5);
  
  const [summary, setSummary] = useState<CopernicusSpatialSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const activeLayer = getLayerById(selectedParameter) || getLayerById('sst');
  const datasetKey = activeLayer ? activeLayer.id : 'copernicus-sst';

  const runSpatialAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetchCopernicusSpatialSummary(
        datasetKey,
        minLat,
        maxLat,
        minLon,
        maxLon,
        selectedTimestamp || undefined
      );
      setSummary(res);
    } catch {
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSpatialAnalysis();
  }, [datasetKey, selectedTimestamp]);

  return (
    <div className="w-full bg-white border border-border-orca rounded font-mono text-[10px] select-none p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-orca pb-2">
        <div className="flex items-center space-x-1.5 text-primary-text font-bold uppercase tracking-wider">
          <Square className="w-3.5 h-3.5 text-orca-blue" />
          <span>Regional Spatial Summary ({activeLayer?.name})</span>
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <span className="flex items-center space-x-1 text-orca-blue text-[9px]">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span>COMPUTING</span>
            </span>
          ) : summary?.is_cached ? (
            <span className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[8px] font-bold">
              CACHED STATS
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 text-[8px] font-bold">
              REAL DATA STATS
            </span>
          )}
          {onClose && (
            <button onClick={onClose} className="text-muted-orca hover:text-primary-text cursor-pointer">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Bounding Box Inputs */}
      <div className="grid grid-cols-4 gap-2 bg-secondary-surface p-2 rounded border border-border-orca text-[8px]">
        <div>
          <span className="text-muted-orca block">Min Lat (°N)</span>
          <input
            type="number"
            step="0.5"
            value={minLat}
            onChange={(e) => setMinLat(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-border-orca rounded px-1.5 py-0.5 font-bold text-primary-text"
          />
        </div>
        <div>
          <span className="text-muted-orca block">Max Lat (°N)</span>
          <input
            type="number"
            step="0.5"
            value={maxLat}
            onChange={(e) => setMaxLat(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-border-orca rounded px-1.5 py-0.5 font-bold text-primary-text"
          />
        </div>
        <div>
          <span className="text-muted-orca block">Min Lon (°E)</span>
          <input
            type="number"
            step="0.5"
            value={minLon}
            onChange={(e) => setMinLon(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-border-orca rounded px-1.5 py-0.5 font-bold text-primary-text"
          />
        </div>
        <div>
          <span className="text-muted-orca block">Max Lon (°E)</span>
          <input
            type="number"
            step="0.5"
            value={maxLon}
            onChange={(e) => setMaxLon(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-border-orca rounded px-1.5 py-0.5 font-bold text-primary-text"
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={runSpatialAnalysis}
        disabled={loading}
        className="w-full py-1.5 bg-orca-blue hover:bg-sky-700 text-white rounded font-bold text-[9px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer disabled:opacity-50"
      >
        <BarChart2 className="w-3.5 h-3.5" />
        <span>RECALCULATE BOUNDING BOX STATISTICS</span>
      </button>

      {/* Summary Statistics Display */}
      {summary?.statistics ? (
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-slate-900 text-white rounded text-center">
            <span className="text-[7.5px] text-slate-400 uppercase tracking-wider block">Minimum</span>
            <span className="text-base font-bold font-sans block">{summary.statistics.min.toFixed(2)}</span>
            <span className="text-[8px] text-slate-400">{summary.units}</span>
          </div>
          <div className="p-2.5 bg-orca-blue text-white rounded text-center">
            <span className="text-[7.5px] text-sky-200 uppercase tracking-wider block">Mean</span>
            <span className="text-base font-bold font-sans block">{summary.statistics.mean.toFixed(2)}</span>
            <span className="text-[8px] text-sky-200">{summary.units}</span>
          </div>
          <div className="p-2.5 bg-slate-900 text-white rounded text-center">
            <span className="text-[7.5px] text-slate-400 uppercase tracking-wider block">Maximum</span>
            <span className="text-base font-bold font-sans block">{summary.statistics.max.toFixed(2)}</span>
            <span className="text-[8px] text-slate-400">{summary.units}</span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-secondary-surface text-center text-muted-orca rounded border border-border-orca">
          {loading ? 'Querying Copernicus observations...' : 'No statistics available for this bounding box.'}
        </div>
      )}

      {/* Provenance */}
      <div className="text-[8px] text-muted-orca border-t border-border-orca pt-1 flex justify-between">
        <span>Sampled: {summary?.count || 0} observations</span>
        <span>Dataset: {summary?.dataset_id || activeLayer?.dataset}</span>
      </div>
    </div>
  );
}
