'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { analyticsRegions } from '@/mock/mockAnalytics';
import { FileText, Download, Check, Share2 } from 'lucide-react';

export default function AnalyticsReportPreview() {
  const { analyticsRegion, analyticsPrimaryParam, analyticsPeriod } = useOrcaStore();
  const [exported, setExported] = useState<string | null>(null);

  const region =
    analyticsRegions.find((r) => r.id === analyticsRegion) || analyticsRegions[0];

  const handleExport = (type: string) => {
    setExported(type);
    setTimeout(() => setExported(null), 2000);
  };

  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-3 font-sans select-none shadow-xs">
      <div className="flex items-center justify-between border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            SCIENTIFIC REPORT PREVIEW
          </h3>
        </div>
        <span className="text-[9px] font-mono text-muted-orca uppercase">
          DISPATCH READY
        </span>
      </div>

      <div className="bg-secondary-surface p-2.5 rounded border border-border-orca font-mono text-[9px] space-y-1.5">
        <div className="flex justify-between border-b border-border-orca/60 pb-1">
          <span className="font-bold text-primary-text">ORCA OCEANOGRAPHIC SYNTHESIS</span>
          <span className="text-muted-orca">REPORT #R-2026-0829</span>
        </div>
        <div className="space-y-0.5 text-secondary-text">
          <div>Target Domain: <span className="font-bold text-primary-text">{region.name} ({region.basin})</span></div>
          <div>Primary Observable: <span className="font-bold text-primary-text">{analyticsPrimaryParam.toUpperCase()}</span></div>
          <div>Analysis Window: <span className="font-bold text-primary-text">{analyticsPeriod.toUpperCase()} retrospective</span></div>
          <div>Primary Observation Feeds: <span className="text-primary-text">Copernicus Marine OSTIA / BGC L4</span></div>
        </div>
        <div className="pt-1 border-t border-border-orca/60 text-[8px] text-muted-orca">
          Observations indicate sustained thermal gradient fronts correlating with coastal chlorophyll bloom accumulation along the shelf.
        </div>
      </div>

      <div className="flex items-center space-x-2 font-mono text-[9px]">
        <button
          type="button"
          onClick={() => handleExport('report')}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-ocean-navy hover:bg-[#12315b] text-white py-1.5 px-3 rounded font-bold uppercase transition-colors"
        >
          {exported === 'report' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>{exported === 'report' ? 'GENERATED' : 'EXPORT REPORT (PDF)'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleExport('data')}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-white hover:bg-secondary-surface text-primary-text border border-border-orca py-1.5 px-3 rounded font-bold uppercase transition-colors"
        >
          {exported === 'data' ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>{exported === 'data' ? 'EXPORTED' : 'EXPORT DATA (CSV)'}</span>
        </button>
      </div>
    </div>
  );
}
