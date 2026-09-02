'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { FileText, Download, Check } from 'lucide-react';

export default function AnalyticsReportPreview() {
  const { analyticsPrimaryParam, analyticsPeriod, selectedCoordinates } = useOrcaStore();
  const [exported, setExported] = useState<string | null>(null);

  const lat = selectedCoordinates ? selectedCoordinates.lat.toFixed(3) : '9.931';
  const lon = selectedCoordinates ? selectedCoordinates.lng.toFixed(3) : '75.800';

  const handleExport = (type: string) => {
    setExported(type);
    setTimeout(() => setExported(null), 2000);
  };

  return (
    <div className="bg-white border border-border-orca rounded p-3.5 space-y-3 font-mono select-none shadow-xs">
      <div className="flex items-center justify-between border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            SCIENTIFIC REPORT PREVIEW
          </h3>
        </div>
        <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
          DISPATCH READY
        </span>
      </div>

      <div className="bg-secondary-surface p-2.5 rounded border border-border-orca font-mono text-[9px] space-y-1.5">
        <div className="flex justify-between border-b border-border-orca/60 pb-1">
          <span className="font-bold text-primary-text">ORCA OCEANOGRAPHIC SYNTHESIS</span>
          <span className="text-muted-orca">REPORT #R-2026-0829</span>
        </div>
        <div className="space-y-0.5 text-secondary-text">
          <div>Target Coordinates: <span className="font-bold text-primary-text">{lat}°N, {lon}°E</span></div>
          <div>Primary Observable: <span className="font-bold text-primary-text">{analyticsPrimaryParam.toUpperCase()}</span></div>
          <div>Observation Window: <span className="font-bold text-primary-text">{analyticsPeriod.toUpperCase()} sequence</span></div>
          <div>Primary Data Source: <span className="text-primary-text">Copernicus Marine L4 Observations</span></div>
        </div>
        <div className="pt-1 border-t border-border-orca/60 text-[8px] text-muted-orca">
          Summary generated from verified Level-4 NetCDF timeseries observations and deterministic spatial gradient slicing.
        </div>
      </div>

      <div className="flex items-center space-x-2 font-mono text-[9px]">
        <button
          type="button"
          onClick={() => handleExport('report')}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-orca-blue hover:bg-deep-ocean text-white py-1.5 px-3 rounded font-bold uppercase transition-colors cursor-pointer"
        >
          {exported === 'report' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>{exported === 'report' ? 'GENERATED' : 'EXPORT REPORT (PDF)'}</span>
        </button>
      </div>
    </div>
  );
}
