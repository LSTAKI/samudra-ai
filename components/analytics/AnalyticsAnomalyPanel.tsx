'use client';

import React from 'react';
import { AlertTriangle, Info, Database } from 'lucide-react';

export default function AnalyticsAnomalyPanel() {
  return (
    <div className="bg-white border border-border-orca rounded p-3.5 space-y-3 font-mono select-none">
      <div className="flex items-center justify-between border-b border-border-orca pb-2">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-xs font-bold text-primary-text tracking-wider uppercase">
            CLIMATOLOGICAL BASELINE & ANOMALY
          </h3>
        </div>
        <span className="text-[8px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded">
          CLIMATOLOGY UNAVAILABLE
        </span>
      </div>

      <div className="p-3 bg-secondary-surface rounded border border-border-orca space-y-2 text-[9px]">
        <div className="flex items-start space-x-2">
          <Database className="w-4 h-4 text-muted-orca shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-primary-text block uppercase">
              Historical Climatological Baseline Required
            </span>
            <p className="text-secondary-text leading-relaxed">
              Long-term (30-year) climatological reanalysis baseline dataset is not mounted in the current operational pipeline. To prevent misleading or synthetic anomaly reporting, calculated deviations against multi-decadal norms are withheld.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-border-orca/60 text-[8px] text-muted-orca flex justify-between">
          <span>Active Product: Level-4 Daily NRT Observations</span>
          <span>Status: Verified Scientific Integrity</span>
        </div>
      </div>
    </div>
  );
}
