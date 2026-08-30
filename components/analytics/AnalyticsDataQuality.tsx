'use client';

import React from 'react';
import { mockDataQuality } from '@/mock/mockAnalytics';
import { CheckCircle2, ShieldCheck, Clock, Layers } from 'lucide-react';

export default function AnalyticsDataQuality() {
  return (
    <div className="bg-white border border-border-orca rounded-sm p-3.5 space-y-3 font-sans select-none shadow-xs">
      <div className="flex items-center justify-between border-b border-border-orca pb-2 font-mono">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-orca-blue" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            DATA QUALITY & ASSURANCE (QA/QC)
          </h3>
        </div>
        <span className="text-[9px] font-mono font-bold text-success-orca bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded">
          VALIDATED SPECS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[9px]">
        <div className="bg-secondary-surface p-2 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">SPATIAL COVERAGE</span>
          <span className="font-bold text-primary-text text-sm">
            {mockDataQuality.spatialCoveragePct}%
          </span>
          <span className="text-[8px] text-success-orca block">Indian Ocean Domain</span>
        </div>

        <div className="bg-secondary-surface p-2 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">TEMPORAL COMPLETENESS</span>
          <span className="font-bold text-primary-text text-sm">
            {mockDataQuality.temporalCompletenessPct}%
          </span>
          <span className="text-[8px] text-success-orca block">30-day continuous archive</span>
        </div>

        <div className="bg-secondary-surface p-2 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">CLOUD MASKED VOIDS</span>
          <span className="font-bold text-primary-text text-sm">
            {mockDataQuality.cloudMaskedPct}%
          </span>
          <span className="text-[8px] text-muted-orca block">Optimal interpolation fill</span>
        </div>

        <div className="bg-secondary-surface p-2 rounded border border-border-orca">
          <span className="text-[8px] text-muted-orca uppercase block">PRODUCT LATENCY</span>
          <span className="font-bold text-primary-text text-sm">
            ~{mockDataQuality.latencyHours} hrs
          </span>
          <span className="text-[8px] text-secondary-text block">Near-Real-Time (NRT)</span>
        </div>
      </div>

      <div className="p-2 bg-secondary-surface rounded border border-border-orca font-mono text-[8px] text-muted-orca flex items-center justify-between">
        <span>Processing Level: {mockDataQuality.processingLevel}</span>
        <span>Validation protocol: EUMETSAT / Copernicus Marine Product Quality Standard</span>
      </div>
    </div>
  );
}
