'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchCopernicusTimeseries, CopernicusTimeseriesResponse } from '@/lib/api/copernicus';
import { getLayerById } from '@/lib/map/layerRegistry';
import { TrendingUp, Activity, BarChart2, Info, RefreshCw } from 'lucide-react';

const PlotlyChart = dynamic(() => import('@/components/PlotlyChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-44 bg-secondary-surface rounded border border-border-orca animate-pulse flex items-center justify-center text-xs text-muted-orca font-mono">
      INITIALIZING ANALYTICAL CHART CORE...
    </div>
  )
});

export default function AnalyticsTimeSeries() {
  const { analyticsPrimaryParam, selectedCoordinates } = useOrcaStore();
  const [data, setData] = useState<CopernicusTimeseriesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const activeLayer = getLayerById(analyticsPrimaryParam) || getLayerById('sst');
  const layerId = activeLayer ? activeLayer.id : 'copernicus-sst';
  const lat = selectedCoordinates ? selectedCoordinates.lat : 9.9312;
  const lon = selectedCoordinates ? selectedCoordinates.lng : 76.2673;

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await fetchCopernicusTimeseries(layerId, lat, lon, undefined, undefined, 7);
        if (mounted) {
          setData(res);
        }
      } catch {
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [layerId, lat, lon]);

  const records = data?.records || [];
  const validRecords = records.filter((r) => r.value !== null);
  const xTimestamps = validRecords.map((r) => r.timestamp.slice(5, 10));
  const yValues = validRecords.map((r) => r.value as number);

  const minVal = yValues.length > 0 ? Math.min(...yValues) : 0;
  const maxVal = yValues.length > 0 ? Math.max(...yValues) : 0;
  const meanVal = yValues.length > 0 ? yValues.reduce((a, b) => a + b, 0) / yValues.length : 0;

  return (
    <div className="bg-white border border-border-orca rounded p-3 font-mono text-xs select-none space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-orca pb-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-orca-blue" />
          <span className="font-bold text-primary-text uppercase tracking-wider text-[11px]">
            {activeLayer?.name || 'Sea Surface Temperature'} — Observation Timeseries
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
              {data?.count || 0} COPERNICUS OBSERVATIONS
            </span>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[9px] bg-secondary-surface p-2 rounded border border-border-orca">
        <div>
          <span className="text-muted-orca uppercase block">Dataset ID</span>
          <span className="font-mono text-primary-text font-bold truncate block">
            {data?.dataset_id || activeLayer?.dataset}
          </span>
        </div>
        <div>
          <span className="text-muted-orca uppercase block">Sample Min</span>
          <span className="font-bold text-primary-text">
            {minVal.toFixed(2)} {data?.units || activeLayer?.units}
          </span>
        </div>
        <div>
          <span className="text-muted-orca uppercase block">Sample Mean</span>
          <span className="font-bold text-primary-text">
            {meanVal.toFixed(2)} {data?.units || activeLayer?.units}
          </span>
        </div>
        <div>
          <span className="text-muted-orca uppercase block">Sample Max</span>
          <span className="font-bold text-primary-text">
            {maxVal.toFixed(2)} {data?.units || activeLayer?.units}
          </span>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-44 w-full">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-muted-orca space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-orca-blue" />
            <span>Loading Copernicus NetCDF Series...</span>
          </div>
        ) : validRecords.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-muted-orca">
            <span>No timeseries records found for selected coordinate.</span>
          </div>
        ) : (
          <PlotlyChart
            xData={xTimestamps}
            yData={yValues}
            yName={activeLayer?.name || 'SST'}
            lineColor="#0284c7"
            yUnit={data?.units || activeLayer?.units || '°C'}
          />
        )}
      </div>

      {/* Provenance */}
      <div className="text-[8px] text-muted-orca border-t border-border-orca pt-1 flex justify-between">
        <span>Location: {lat.toFixed(4)}° N, {lon.toFixed(4)}° E</span>
        <span>Source: {data?.source || 'Copernicus Marine Service'}</span>
      </div>
    </div>
  );
}
