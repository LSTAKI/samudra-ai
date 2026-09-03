'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchCopernicusTimeseries } from '@/lib/api/copernicus';
import { Play, Pause, ChevronLeft, ChevronRight, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';

const PlotlyChart = dynamic(() => import('./PlotlyChart'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-28 bg-secondary-surface rounded border border-border-orca animate-pulse flex items-center justify-center text-xs text-muted-orca font-mono">
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

  const [sstData, setSstData] = useState<{ x: string[]; y: number[] }>({ x: [], y: [] });
  const [waveData, setWaveData] = useState<{ x: string[]; y: number[] }>({ x: [], y: [] });
  const [chlData, setChlData] = useState<{ x: string[]; y: number[] }>({ x: [], y: [] });
  const [slaData, setSlaData] = useState<{ x: string[]; y: number[] }>({ x: [], y: [] });
  const [loading, setLoading] = useState(false);

  const lat = selectedCoordinates ? selectedCoordinates.lat : 9.9312;
  const lon = selectedCoordinates ? selectedCoordinates.lng : 75.8;

  // Load real Copernicus timeseries records based on selected coordinates
  useEffect(() => {
    let mounted = true;
    const fetchAllTimeseries = async () => {
      setLoading(true);
      try {
        const [sstRes, waveRes, chlRes, slaRes] = await Promise.all([
          fetchCopernicusTimeseries('copernicus-sst', lat, lon, undefined, undefined, 5),
          fetchCopernicusTimeseries('copernicus-wave', lat, lon, undefined, undefined, 5),
          fetchCopernicusTimeseries('copernicus-chl', lat, lon, undefined, undefined, 5),
          fetchCopernicusTimeseries('copernicus-sla', lat, lon, undefined, undefined, 5),
        ]);

        if (mounted) {
          const sstRecs = (sstRes.records || []).filter((r) => r.value !== null);
          const waveRecs = (waveRes.records || []).filter((r) => r.value !== null);
          const chlRecs = (chlRes.records || []).filter((r) => r.value !== null);
          const slaRecs = (slaRes.records || []).filter((r) => r.value !== null);

          setSstData({
            x: sstRecs.map((r) => r.timestamp.slice(5, 10)),
            y: sstRecs.map((r) => r.value as number)
          });
          setWaveData({
            x: waveRecs.map((r) => r.timestamp.slice(5, 10)),
            y: waveRecs.map((r) => r.value as number)
          });
          setChlData({
            x: chlRecs.map((r) => r.timestamp.slice(5, 10)),
            y: chlRecs.map((r) => r.value as number)
          });
          setSlaData({
            x: slaRecs.map((r) => r.timestamp.slice(5, 10)),
            y: slaRecs.map((r) => r.value as number)
          });
        }
      } catch (e) {
        console.error('Error loading timeseries in TemporalAnalysis:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAllTimeseries();
    return () => {
      mounted = false;
    };
  }, [lat, lon]);

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

  return (
    <div className="bg-white border-t border-border-orca p-3 flex flex-col space-y-2.5 font-sans select-none z-20">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border-orca pb-2">
        <div className="flex items-center space-x-2.5">
          <Calendar className="w-3.5 h-3.5 text-orca-blue" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-primary-text uppercase tracking-wider font-mono">
                TEMPORAL OBSERVATION ANALYSIS
              </h3>
              {loading ? (
                <span className="text-[8px] font-mono text-orca-blue flex items-center gap-1 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded font-bold">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  SYNCING NETCDF
                </span>
              ) : (sstData.x.length > 0 || waveData.x.length > 0 || chlData.x.length > 0 || slaData.x.length > 0) ? (
                <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                  COPERNICUS OBSERVATIONS
                </span>
              ) : (
                <span className="text-[8px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-300 font-bold">
                  NO OBSERVATIONS
                </span>
              )}
            </div>
            <span className="text-[9px] text-muted-orca font-mono block mt-0.5">
              Active Coordinates: [{lat.toFixed(4)}°N, {lon.toFixed(4)}°E]
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
                className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase transition-colors font-mono cursor-pointer ${
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
              className="bg-white hover:bg-secondary-surface text-primary-text border border-border-orca p-2 rounded transition-colors disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handlePlayToggle}
              className="flex-1 flex items-center justify-center space-x-2 bg-orca-blue hover:bg-deep-ocean text-white py-1.5 rounded text-xs font-semibold font-mono transition-colors shadow-sm cursor-pointer"
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
              className="bg-white hover:bg-secondary-surface text-primary-text border border-border-orca p-2 rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Charts Grid */}
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div>
            <span className="text-[10px] text-secondary-text font-mono font-bold block mb-1">
              SEA SURFACE TEMP (OSTIA L4 · °C)
            </span>
            {loading ? (
              <div className="w-full h-28 bg-secondary-surface rounded border border-border-orca flex items-center justify-center text-[10px] text-muted-orca font-mono">
                Loading SST series...
              </div>
            ) : sstData.x.length > 0 ? (
              <PlotlyChart
                xData={sstData.x}
                yData={sstData.y}
                yName="SST"
                lineColor="#0284c7"
                yUnit="°C"
              />
            ) : (
              <div className="w-full h-28 bg-[#0f243f]/60 rounded border border-[#1b3459] p-3 flex flex-col items-center justify-center text-center space-y-1 font-mono text-[9.5px]">
                <div className="flex items-center gap-1 text-amber-400 font-bold uppercase">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>SST • UNAVAILABLE</span>
                </div>
                <span className="text-slate-300 text-[8.5px] leading-tight">
                  No observations for selected coordinate/time.
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] text-secondary-text font-mono font-bold block mb-1">
              WAVE HEIGHT (WAV_001_027 · m)
            </span>
            {loading ? (
              <div className="w-full h-28 bg-secondary-surface rounded border border-border-orca flex items-center justify-center text-[10px] text-muted-orca font-mono">
                Loading Wave series...
              </div>
            ) : waveData.x.length > 0 ? (
              <PlotlyChart
                xData={waveData.x}
                yData={waveData.y}
                yName="Wave Height"
                lineColor="#16834B"
                yUnit="m"
              />
            ) : (
              <div className="w-full h-28 bg-[#0f243f]/60 rounded border border-[#1b3459] p-3 flex flex-col items-center justify-center text-center space-y-1 font-mono text-[9.5px]">
                <div className="flex items-center gap-1 text-amber-400 font-bold uppercase">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>WAVE HEIGHT • UNAVAILABLE</span>
                </div>
                <span className="text-slate-300 text-[8.5px] leading-tight">
                  No observations for selected coordinate/time.
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] text-secondary-text font-mono font-bold block mb-1">
              CHLOROPHYLL-a (BGC L3 · mg/m³)
            </span>
            {loading ? (
              <div className="w-full h-28 bg-secondary-surface rounded border border-border-orca flex items-center justify-center text-[10px] text-muted-orca font-mono">
                Loading Chlorophyll series...
              </div>
            ) : chlData.x.length > 0 ? (
              <PlotlyChart
                xData={chlData.x}
                yData={chlData.y}
                yName="Chlorophyll"
                lineColor="#D98200"
                yUnit="mg/m³"
              />
            ) : (
              <div className="w-full h-28 bg-[#0f243f]/60 rounded border border-[#1b3459] p-3 flex flex-col items-center justify-center text-center space-y-1 font-mono text-[9.5px]">
                <div className="flex items-center gap-1 text-amber-400 font-bold uppercase">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>CHLOROPHYLL-a • UNAVAILABLE</span>
                </div>
                <span className="text-slate-300 text-[8.5px] leading-tight">
                  No observations for selected coordinate/time.
                </span>
              </div>
            )}
          </div>

          <div>
            <span className="text-[10px] text-secondary-text font-mono font-bold block mb-1">
              SEA LEVEL ANOMALY (DUACS L4 · m)
            </span>
            {loading ? (
              <div className="w-full h-28 bg-secondary-surface rounded border border-border-orca flex items-center justify-center text-[10px] text-muted-orca font-mono">
                Loading SLA series...
              </div>
            ) : slaData.x.length > 0 ? (
              <PlotlyChart
                xData={slaData.x}
                yData={slaData.y}
                yName="Sea Level Anomaly"
                lineColor="#7c3aed"
                yUnit="m"
              />
            ) : (
              <div className="w-full h-28 bg-[#0f243f]/60 rounded border border-[#1b3459] p-3 flex flex-col items-center justify-center text-center space-y-1 font-mono text-[9.5px]">
                <div className="flex items-center gap-1 text-amber-400 font-bold uppercase">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>SLA • UNAVAILABLE</span>
                </div>
                <span className="text-slate-300 text-[8.5px] leading-tight">
                  No observations for selected coordinate/time.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
