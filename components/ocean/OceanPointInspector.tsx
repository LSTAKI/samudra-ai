'use client';

import React, { useEffect, useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchCopernicusFeatureInfo, CopernicusFeatureInfoResponse } from '@/lib/api/copernicus';
import { getLayerById } from '@/lib/map/layerRegistry';
import {
  MapPin,
  Clock,
  Database,
  Layers,
  Activity,
  History,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Navigation
} from 'lucide-react';

interface OceanPointInspectorProps {
  onViewHistory?: () => void;
}

export default function OceanPointInspector({ onViewHistory }: OceanPointInspectorProps) {
  const { selectedCoordinates, selectedParameter, selectedTimestamp } = useOrcaStore();
  const [data, setData] = useState<CopernicusFeatureInfoResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const activeLayer = getLayerById(selectedParameter) || getLayerById('sst');
  const layerId = activeLayer ? activeLayer.id : 'copernicus-sst';

  useEffect(() => {
    let mounted = true;
    if (!selectedCoordinates) {
      setData(null);
      return;
    }

    const loadPointData = async () => {
      setLoading(true);
      try {
        const res = await fetchCopernicusFeatureInfo(
          layerId,
          selectedCoordinates.lat,
          selectedCoordinates.lng,
          selectedTimestamp || undefined
        );
        if (mounted) {
          setData(res);
        }
      } catch {
        if (mounted) {
          setData({
            status: 'UNAVAILABLE',
            source: activeLayer?.provider || 'Copernicus Marine Service',
            product_id: activeLayer?.product || 'SST_GLO_SST_L4_NRT_OBSERVATIONS_010_001',
            dataset_id: activeLayer?.dataset || 'METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2',
            variable: activeLayer?.variable || 'analysed_sst',
            latitude: selectedCoordinates.lat,
            longitude: selectedCoordinates.lng,
            sampled_latitude: selectedCoordinates.lat,
            sampled_longitude: selectedCoordinates.lng,
            sampling_method: 'EXACT_GRID_POINT',
            value: null,
            unit: activeLayer?.units || '',
            observation_timestamp: selectedTimestamp || '2026-08-28T00:00:00Z',
            retrieved_at: new Date().toISOString(),
            error: 'Point query failed'
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPointData();
    return () => {
      mounted = false;
    };
  }, [selectedCoordinates, selectedParameter, selectedTimestamp, layerId, activeLayer]);

  const reqLat = selectedCoordinates ? selectedCoordinates.lat.toFixed(4) : '9.9312';
  const reqLon = selectedCoordinates ? selectedCoordinates.lng.toFixed(4) : '76.2673';

  const sampledLat = data?.sampled_latitude !== undefined ? data.sampled_latitude.toFixed(4) : reqLat;
  const sampledLon = data?.sampled_longitude !== undefined ? data.sampled_longitude.toFixed(4) : reqLon;

  const datasetId = data?.dataset_id && data.dataset_id !== 'UNKNOWN'
    ? data.dataset_id
    : activeLayer?.dataset || 'METOFFICE-GLO-SST-L4-NRT-OBS-SST-V2';

  const variableName = data?.variable && data.variable !== 'UNKNOWN'
    ? data.variable
    : activeLayer?.variable || 'analysed_sst';

  const sourceName = data?.source && data.source !== 'UNKNOWN'
    ? data.source
    : activeLayer?.provider || 'Copernicus Marine Service';

  const unitName = data?.unit || activeLayer?.units || '';

  const hasValue = data?.value !== null && data?.value !== undefined;
  const isNearestCell = data?.sampling_method === 'NEAREST_OCEAN_CELL';

  return (
    <div className="w-full flex flex-col bg-white border border-border-orca rounded font-mono text-[10px] select-none p-3 space-y-3 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-orca pb-2">
        <div className="flex items-center space-x-1.5 text-primary-text font-bold uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-orca-blue" />
          <span>Point Inspector</span>
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <span className="flex items-center space-x-1 text-orca-blue text-[9px]">
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span>QUERYING</span>
            </span>
          ) : data?.is_cached ? (
            <span className="px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-[8px] font-bold">
              CACHED OBSERVATION
            </span>
          ) : hasValue ? (
            <span className="px-1.5 py-0.5 rounded border border-emerald-300 bg-emerald-50 text-emerald-700 text-[8px] font-bold">
              REAL OBSERVATION
            </span>
          ) : data?.status === 'NO_DATA' ? (
            <span className="px-1.5 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-700 text-[8px] font-bold">
              NO OBSERVATION (POINT)
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-100 text-slate-600 text-[8px] font-bold">
              {data?.status || 'STANDBY'}
            </span>
          )}
        </div>
      </div>

      {/* Coordinate & Sampling Attribution */}
      <div className="bg-secondary-surface p-2 rounded border border-border-orca space-y-1.5 text-[9px]">
        <div className="flex justify-between">
          <span className="text-muted-orca uppercase">Requested Location:</span>
          <span className="font-bold text-primary-text">
            {reqLat}° N, {reqLon}° E
          </span>
        </div>

        {isNearestCell && (
          <div className="flex justify-between pt-1 border-t border-border-orca/60">
            <span className="text-amber-800 uppercase flex items-center gap-1">
              <Navigation className="w-2.5 h-2.5 text-amber-700" />
              Sampled Grid Cell:
            </span>
            <span className="font-bold text-amber-900">
              {sampledLat}° N, {sampledLon}° E (Nearest Water)
            </span>
          </div>
        )}

        <div className="flex justify-between pt-1 border-t border-border-orca/60">
          <span className="text-muted-orca uppercase">Sampling Mode:</span>
          <span className={`font-bold ${isNearestCell ? 'text-amber-800' : 'text-emerald-700'}`}>
            {isNearestCell ? 'NEAREST VALID OCEAN CELL' : 'EXACT GRID POINT'}
          </span>
        </div>
      </div>

      {/* Value Display */}
      <div className="p-3 bg-slate-900 text-white rounded flex items-center justify-between">
        <div>
          <span className="text-[8px] text-slate-400 uppercase tracking-wider block">
            {activeLayer?.name || 'Observation Value'}
          </span>
          <div className="flex items-baseline space-x-1.5 pt-0.5">
            <span className="text-xl font-bold font-sans">
              {loading ? (
                '...'
              ) : hasValue ? (
                data!.value!.toFixed(2)
              ) : (
                <span className="text-sm font-mono text-amber-400">NO DATA</span>
              )}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {unitName}
            </span>
          </div>
          {!hasValue && !loading && (
            <span className="text-[8px] text-slate-400 block pt-0.5">
              Land-masked or outside model coverage
            </span>
          )}
        </div>
        <Activity className="w-6 h-6 text-orca-blue opacity-70" />
      </div>

      {/* Provenance Details */}
      <div className="space-y-1.5 text-[8.5px] border-t border-border-orca pt-2">
        <div className="flex justify-between">
          <span className="text-muted-orca">Source:</span>
          <span className="text-primary-text font-bold truncate max-w-[170px]">
            {sourceName}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-orca">Dataset ID:</span>
          <span className="text-secondary-text font-mono truncate max-w-[170px]" title={datasetId}>
            {datasetId}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-orca">Variable:</span>
          <span className="text-secondary-text font-mono">
            {variableName} ({unitName})
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-orca">Observation Time:</span>
          <span className="text-secondary-text font-bold">
            {data?.observation_timestamp || selectedTimestamp || '2026-08-28T00:00:00Z'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-orca">Retrieved At:</span>
          <span className="text-secondary-text">
            {data?.retrieved_at ? data.retrieved_at.split('T')[1].slice(0, 8) + ' UTC' : 'Live'}
          </span>
        </div>
      </div>

      {/* View History Action */}
      {onViewHistory && (
        <button
          onClick={onViewHistory}
          className="w-full py-2 bg-secondary-surface hover:bg-slate-200 text-primary-text rounded border border-border-orca font-bold text-[9px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-orca-blue" />
          <span>VIEW OBSERVATION HISTORY</span>
        </button>
      )}
    </div>
  );
}
