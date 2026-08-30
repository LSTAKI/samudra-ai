'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { getOceanTimeSeries } from '@/lib/api/ocean';
import { TimeSeriesRecord } from '@/mock/mockOcean';
import { Play, Pause, ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';

const PlotlyChart = dynamic(() => import('./PlotlyChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-32 bg-secondary-surface rounded border border-border-orca animate-pulse flex items-center justify-center text-xs text-muted-orca font-mono">
      LOADING CHART CORE...
    </div>
  )
});

const timelineTicks = ['-72h', '-48h', '-24h', 'NOW', '+24h', '+48h'];

export default function TemporalAnalysis() {
  const {
    selectedCoordinates,
    timelineMode,
    timelineIndex,
    timelineFrameType,
    isPlaying,
    setTimelineMode,
    setTimelineIndex,
    setIsPlaying
  } = useOrcaStore();

  const [historyData, setHistoryData] = useState<TimeSeriesRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Load history records based on selected coordinates
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedCoordinates) return;
      setLoading(true);
      try {
        const data = await getOceanTimeSeries(selectedCoordinates.lat, selectedCoordinates.lng);
        setHistoryData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedCoordinates]);

  // Timeline playback timer
  useEffect(() => {
    let intervalId: any = null;
    if (isPlaying) {
      intervalId = setInterval(() => {
        setTimelineIndex((timelineIndex + 1) % timelineTicks.length);
      }, 2000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPlaying, timelineIndex, setTimelineIndex]);

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const activeTimeLabel = timelineTicks[timelineIndex];

  // Map history variables into separate coordinate lists for Plotly
  const xCoords = historyData.map((rec) => rec.timestamp);
  const sstCoords = historyData.map((rec) => rec.sst);
  const waveCoords = historyData.map((rec) => rec.waveHeight);
  const chlorophyllCoords = historyData.map((rec) => rec.chlorophyll);
  const windCoords = historyData.map((rec) => rec.windSpeed);

  return (
    <div className="bg-white border-t border-border-orca p-3 flex flex-col space-y-2.5 font-sans select-none z-20">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border-orca pb-2">
        <div className="flex items-center space-x-2.5">
          <Calendar className="w-3.5 h-3.5 text-orca-blue" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
                TEMPORAL ANALYSIS
              </h3>
              <span className="text-[9px] font-mono text-muted-orca bg-secondary-surface px-1.5 py-0.5 rounded border border-border-orca">
                DEMO ANALYTICS
              </span>
            </div>
            <span className="text-[9px] text-muted-orca font-mono block mt-0.5">
              Active Coordinates:{' '}
              {selectedCoordinates
                ? `${selectedCoordinates.lat}°N, ${selectedCoordinates.lng}°E`
                : 'No inspection coordinates selected'}
            </span>
          </div>
        </div>

        {/* Timeline step control mode switches */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-secondary-surface p-0.5 rounded border border-border-orca">
            {(['daily', 'monthly', 'annual'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setTimelineMode(mode)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase transition-colors font-mono ${
                  timelineMode === mode
                    ? 'bg-white text-orca-blue shadow-sm border border-border-orca/40'
                    : 'text-secondary-text hover:text-primary-text'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-muted-orca font-mono">
            PLAYBACK: <span className={isPlaying ? 'text-success-orca font-bold' : 'text-secondary-text'}>{isPlaying ? 'ACTIVE' : 'PAUSED'}</span>
          </div>
        </div>
      </div>

      {/* Split grid: Left timeline slider, Right Plotly charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Side: Draggable Slider */}
        <div className="lg:col-span-3 bg-secondary-surface/40 border border-border-orca rounded p-3 space-y-2.5 h-full flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] text-secondary-text font-mono uppercase tracking-wider block">
              TEMPORAL SLIDER
            </span>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-primary-text font-mono bg-white px-2 py-0.5 border border-border-orca rounded shadow-sm">
                  SLICE: {activeTimeLabel}
                </span>
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  timelineFrameType === 'OBSERVATION'
                    ? 'bg-emerald-50 text-success-orca border-emerald-200'
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {timelineFrameType}
                </span>
              </div>
              <span className="text-muted-orca text-[10px] font-mono">
                {timelineMode === 'daily' ? '24h Interval' : timelineMode === 'monthly' ? 'Month Step' : '1 Year Step'}
              </span>
            </div>
          </div>

          {/* Draggable Slider and controls */}
          <div className="space-y-3 pt-2">
            <input
              type="range"
              min="0"
              max={timelineTicks.length - 1}
              value={timelineIndex}
              onChange={(e) => setTimelineIndex(Number(e.target.value))}
              className="w-full h-1.5 bg-[#d9e1ea] rounded-lg appearance-none cursor-pointer accent-orca-blue"
            />

            {/* Slider Ticks Labeling */}
            <div className="flex justify-between text-[9px] text-secondary-text font-mono px-1">
              {timelineTicks.map((tick, idx) => (
                <span
                  key={idx}
                  onClick={() => setTimelineIndex(idx)}
                  className={`cursor-pointer transition-colors ${
                    timelineIndex === idx ? 'text-orca-blue font-bold' : 'hover:text-primary-text'
                  }`}
                >
                  {tick}
                </span>
              ))}
            </div>
          </div>

          {/* Playback action buttons */}
          <div className="flex items-center space-x-2 pt-2">
            <button
              onClick={() => setTimelineIndex(Math.max(0, timelineIndex - 1))}
              disabled={timelineIndex === 0}
              className="bg-white hover:bg-secondary-surface text-primary-text border border-border-orca p-2 rounded transition-colors disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handlePlayToggle}
              className="flex-1 flex items-center justify-center space-x-2 bg-orca-blue hover:bg-deep-ocean text-white py-1.5 rounded text-xs font-semibold font-mono transition-colors shadow-sm"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-white" />
                  <span>PAUSE PLAYBACK</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>PLAY SEQUENCE</span>
                </>
              )}
            </button>
            <button
              onClick={() => setTimelineIndex((timelineIndex + 1) % timelineTicks.length)}
              className="bg-white hover:bg-secondary-surface text-primary-text border border-border-orca p-2 rounded transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Charts Grid */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] text-secondary-text font-mono font-bold block mb-1">
              SEA SURFACE TEMP (°C)
            </span>
            <PlotlyChart
              xData={xCoords}
              yData={sstCoords}
              yName="SST"
              lineColor="#0645AD"
              yUnit="°C"
            />
          </div>

          <div>
            <span className="text-[10px] text-secondary-text font-mono font-bold block mb-1">
              WAVE HEIGHT (m)
            </span>
            <PlotlyChart
              xData={xCoords}
              yData={waveCoords}
              yName="Wave Height"
              lineColor="#16834B"
              yUnit="m"
            />
          </div>

          <div>
            <span className="text-[10px] text-secondary-text font-mono font-bold block mb-1">
              CHLOROPHYLL-a (mg/m³)
            </span>
            <PlotlyChart
              xData={xCoords}
              yData={chlorophyllCoords}
              yName="Chlorophyll"
              lineColor="#D98200"
              yUnit="mg/m³"
            />
          </div>

          <div>
            <span className="text-[10px] text-secondary-text font-mono font-bold block mb-1">
              WIND SPEED (m/s)
            </span>
            <PlotlyChart
              xData={xCoords}
              yData={windCoords}
              yName="Wind Speed"
              lineColor="#C62828"
              yUnit="m/s"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
