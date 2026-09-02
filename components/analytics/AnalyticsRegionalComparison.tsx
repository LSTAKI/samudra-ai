'use client';

import React, { useEffect, useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchCopernicusSpatialSummary, CopernicusSpatialSummaryResponse } from '@/lib/api/copernicus';
import { Globe2, MapPin, RefreshCw } from 'lucide-react';

export default function AnalyticsRegionalComparison() {
  const { analyticsPrimaryParam } = useOrcaStore();
  const [arabianSea, setArabianSea] = useState<CopernicusSpatialSummaryResponse | null>(null);
  const [bayOfBengal, setBayOfBengal] = useState<CopernicusSpatialSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const layerKey = analyticsPrimaryParam === 'chlorophyll'
    ? 'copernicus-chl'
    : analyticsPrimaryParam === 'waveHeight'
    ? 'copernicus-wave'
    : analyticsPrimaryParam === 'seaLevel'
    ? 'copernicus-sla'
    : 'copernicus-sst';

  useEffect(() => {
    let mounted = true;
    const loadBasinStats = async () => {
      setLoading(true);
      try {
        const [asRes, bobRes] = await Promise.all([
          // Arabian Sea BBOX: 8-16°N, 68-76°E
          fetchCopernicusSpatialSummary(layerKey, 8.0, 16.0, 68.0, 76.0),
          // Bay of Bengal BBOX: 8-16°N, 80-88°E
          fetchCopernicusSpatialSummary(layerKey, 8.0, 16.0, 80.0, 88.0)
        ]);

        if (mounted) {
          setArabianSea(asRes);
          setBayOfBengal(bobRes);
        }
      } catch {
        if (mounted) {
          setArabianSea(null);
          setBayOfBengal(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadBasinStats();
    return () => {
      mounted = false;
    };
  }, [layerKey]);

  return (
    <div className="bg-white border border-border-orca rounded p-3.5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-border-orca pb-2">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            REGIONAL BASIN COMPARISON
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <span className="flex items-center space-x-1 text-orca-blue text-[8px]">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span>COMPUTING BBOX STATS</span>
            </span>
          ) : (
            <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded">
              REAL COPERNICUS BBOX SAMPLING
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9px]">
        {/* Arabian Sea Card */}
        <div className="p-3 bg-secondary-surface rounded border border-border-orca space-y-2">
          <div className="flex items-center justify-between border-b border-border-orca pb-1.5">
            <span className="font-bold text-primary-text flex items-center gap-1">
              <MapPin className="w-3 h-3 text-orca-blue" />
              ARABIAN SEA BASIN
            </span>
            <span className="text-[8px] text-muted-orca">8-16°N, 68-76°E</span>
          </div>

          {arabianSea?.statistics ? (
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 bg-white rounded border border-border-orca">
                <span className="text-[7.5px] text-muted-orca block">MIN</span>
                <span className="font-bold text-primary-text">{arabianSea.statistics.min.toFixed(2)}</span>
                <span className="text-[7px] text-muted-orca">{arabianSea.units}</span>
              </div>
              <div className="p-1.5 bg-sky-50 rounded border border-sky-200">
                <span className="text-[7.5px] text-orca-blue font-bold block">MEAN</span>
                <span className="font-bold text-orca-blue text-sm">{arabianSea.statistics.mean.toFixed(2)}</span>
                <span className="text-[7px] text-orca-blue">{arabianSea.units}</span>
              </div>
              <div className="p-1.5 bg-white rounded border border-border-orca">
                <span className="text-[7.5px] text-muted-orca block">MAX</span>
                <span className="font-bold text-primary-text">{arabianSea.statistics.max.toFixed(2)}</span>
                <span className="text-[7px] text-muted-orca">{arabianSea.units}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-muted-orca text-[8px]">
              {loading ? 'Sampling ocean grid...' : 'No regional observations'}
            </div>
          )}

          <div className="text-[7.5px] text-muted-orca flex justify-between pt-1 border-t border-border-orca/60">
            <span>Sampled Grid Points: {arabianSea?.count || 0}</span>
            <span>Dataset: {arabianSea?.dataset_id || 'Copernicus'}</span>
          </div>
        </div>

        {/* Bay of Bengal Card */}
        <div className="p-3 bg-secondary-surface rounded border border-border-orca space-y-2">
          <div className="flex items-center justify-between border-b border-border-orca pb-1.5">
            <span className="font-bold text-primary-text flex items-center gap-1">
              <MapPin className="w-3 h-3 text-teal-600" />
              BAY OF BENGAL BASIN
            </span>
            <span className="text-[8px] text-muted-orca">8-16°N, 80-88°E</span>
          </div>

          {bayOfBengal?.statistics ? (
            <div className="grid grid-cols-3 gap-1.5 text-center">
              <div className="p-1.5 bg-white rounded border border-border-orca">
                <span className="text-[7.5px] text-muted-orca block">MIN</span>
                <span className="font-bold text-primary-text">{bayOfBengal.statistics.min.toFixed(2)}</span>
                <span className="text-[7px] text-muted-orca">{bayOfBengal.units}</span>
              </div>
              <div className="p-1.5 bg-teal-50 rounded border border-teal-200">
                <span className="text-[7.5px] text-teal-700 font-bold block">MEAN</span>
                <span className="font-bold text-teal-700 text-sm">{bayOfBengal.statistics.mean.toFixed(2)}</span>
                <span className="text-[7px] text-teal-700">{bayOfBengal.units}</span>
              </div>
              <div className="p-1.5 bg-white rounded border border-border-orca">
                <span className="text-[7.5px] text-muted-orca block">MAX</span>
                <span className="font-bold text-primary-text">{bayOfBengal.statistics.max.toFixed(2)}</span>
                <span className="text-[7px] text-muted-orca">{bayOfBengal.units}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center text-muted-orca text-[8px]">
              {loading ? 'Sampling ocean grid...' : 'No regional observations'}
            </div>
          )}

          <div className="text-[7.5px] text-muted-orca flex justify-between pt-1 border-t border-border-orca/60">
            <span>Sampled Grid Points: {bayOfBengal?.count || 0}</span>
            <span>Dataset: {bayOfBengal?.dataset_id || 'Copernicus'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
