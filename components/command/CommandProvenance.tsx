'use client';

import React from 'react';
import { Database, ShieldCheck, AlertTriangle } from 'lucide-react';

interface Props {
  source: string;
  product?: string;
  dataset?: string;
  variable?: string;
  timestamp: string;
  dataStatus: string;
}

export default function CommandProvenance({
  source,
  product,
  dataset,
  variable,
  timestamp,
  dataStatus
}: Props) {
  const isReal = dataStatus === 'REAL DATA';

  return (
    <div className="bg-secondary-surface border border-border-orca rounded p-2.5 space-y-1.5 font-mono text-[9px] select-none">
      <div className="flex items-center justify-between border-b border-border-orca pb-1">
        <span className="font-bold text-primary-text uppercase tracking-wider flex items-center gap-1">
          <Database className="w-3 h-3 text-orca-blue" />
          EVENT DATA PROVENANCE
        </span>
        <span
          className={`px-1 py-0.2 rounded border font-bold text-[8px] ${
            isReal
              ? 'text-success-orca bg-emerald-50 border-emerald-200'
              : 'text-amber-700 bg-amber-50 border-amber-200'
          }`}
        >
          {dataStatus}
        </span>
      </div>

      <div className="space-y-0.5 text-muted-orca">
        <div className="flex justify-between">
          <span className="text-secondary-text font-bold">SOURCE:</span>
          <span className="text-primary-text">{source}</span>
        </div>
        {product && (
          <div className="flex justify-between">
            <span className="text-secondary-text font-bold">PRODUCT:</span>
            <span>{product}</span>
          </div>
        )}
        {dataset && (
          <div className="flex justify-between">
            <span className="text-secondary-text font-bold">DATASET:</span>
            <span>{dataset}</span>
          </div>
        )}
        {variable && (
          <div className="flex justify-between">
            <span className="text-secondary-text font-bold">VARIABLE:</span>
            <span>{variable}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-secondary-text font-bold">TIMESTAMP:</span>
          <span>{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
