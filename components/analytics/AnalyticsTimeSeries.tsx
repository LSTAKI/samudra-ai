'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useOrcaStore } from '@/stores/useOrcaStore';
import {
  mockSSTTimeSeries,
  mockChlorophyllTimeSeries,
  mockWaveTimeSeries,
  mockSLATimeSeries
} from '@/mock/mockAnalytics';
import { TrendingUp, Activity, BarChart2, Info } from 'lucide-react';

const PlotlyChart = dynamic(() => import('@/components/PlotlyChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-44 bg-secondary-surface rounded border border-border-orca animate-pulse flex items-center justify-center text-xs text-muted-orca font-mono">
      INITIALIZING ANALYTICAL CHART CORE...
    </div>
  )
});

export default function AnalyticsTimeSeries() {
  const { analyticsPrimaryParam, analyticsPeriod } = useOrcaStore();

  let activeSeries = mockSSTTimeSeries;
  let paramTitle = 'SEA SURFACE TEMPERATURE (SST)';
  let paramUnit = '°C';
  let lineColor = '#D9381E'; // reddish coral for SST
  let baseline = 28.5;

  if (analyticsPrimaryParam === 'chlorophyll') {
    activeSeries = mockChlorophyllTimeSeries;
    paramTitle = 'CHLOROPHYLL-a CONCENTRATION';
    paramUnit = 'mg/m³';
    lineColor = '#16834B'; // emerald
    baseline = 0.42;
  } else if (analyticsPrimaryParam === 'waveHeight') {
    activeSeries = mockWaveTimeSeries;
    paramTitle = 'SIGNIFICANT WAVE HEIGHT (Hm0)';
    paramUnit = 'm';
    lineColor = '#0645AD'; // ocean blue
    baseline = 1.85;
  } else if (analyticsPrimaryParam === 'seaLevel') {
    activeSeries = mockSLATimeSeries;
    paramTitle = 'SEA LEVEL ANOMALY (SLA)';
    paramUnit = 'm';
    lineColor = '#6B21A8'; // purple
    baseline = 0.02;
  }

  // Filter series based on period
  let displayedSeries = activeSeries;
  if (analyticsPeriod === '7d') {
    displayedSeries = activeSeries.slice(-4);
  }

  const values = displayedSeries.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const meanVal = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
  const medianVal = Number([...values].sort((a, b) => a - b)[Math.floor(values.length / 2)].toFixed(2));
  const variance = values.reduce((sum, v) => sum + Math.pow(v - meanVal, 2), 0) / values.length;
  const stdDev = Number(Math.sqrt(variance).toFixed(2));
  const trendSlope = Number((values[values.length - 1] - values[0]).toFixed(2));

  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-3 font-sans select-none shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            PRIMARY TEMPORAL TREND — {paramTitle}
          </h3>
        </div>

        <div className="flex items-center space-x-2 text-[9px]">
          <span className="text-muted-orca">WINDOW: {analyticsPeriod.toUpperCase()}</span>
          <span className="text-muted-orca">·</span>
          <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-bold">
            DEMO ANALYTICS
          </span>
        </div>
      </div>

      {/* Chart Viewport */}
      <div className="w-full h-44">
        <PlotlyChart
          xData={displayedSeries.map((d) => d.date)}
          yData={displayedSeries.map((d) => d.value)}
          yName={paramTitle}
          lineColor={lineColor}
          yUnit={paramUnit}
        />
      </div>

      {/* Summary Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 font-mono text-[9px]">
        <div className="bg-secondary-surface p-1.5 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">MINIMUM</span>
          <span className="font-bold text-primary-text">{minVal} {paramUnit}</span>
        </div>
        <div className="bg-secondary-surface p-1.5 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">MAXIMUM</span>
          <span className="font-bold text-primary-text">{maxVal} {paramUnit}</span>
        </div>
        <div className="bg-secondary-surface p-1.5 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">SAMPLE MEAN</span>
          <span className="font-bold text-primary-text">{meanVal} {paramUnit}</span>
        </div>
        <div className="bg-secondary-surface p-1.5 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">MEDIAN</span>
          <span className="font-bold text-primary-text">{medianVal} {paramUnit}</span>
        </div>
        <div className="bg-secondary-surface p-1.5 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">STD DEVIATION</span>
          <span className="font-bold text-primary-text">±{stdDev} {paramUnit}</span>
        </div>
        <div className="bg-secondary-surface p-1.5 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">TREND DELTA</span>
          <span className={`font-bold ${trendSlope >= 0 ? 'text-danger-orca' : 'text-orca-blue'}`}>
            {trendSlope >= 0 ? `+${trendSlope}` : trendSlope} {paramUnit}
          </span>
        </div>
      </div>
    </div>
  );
}
