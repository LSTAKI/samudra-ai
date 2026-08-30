'use client';

import React from 'react';
import { PFZZone } from '@/types/pfz';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface Props {
  zone: PFZZone;
}

export default function PFZExplainability({ zone }: Props) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FAVORABLE':
        return <CheckCircle2 className="w-3.5 h-3.5 text-success-orca shrink-0" />;
      case 'MODERATE':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'UNFAVORABLE':
        return <XCircle className="w-3.5 h-3.5 text-danger-orca shrink-0" />;
      case 'UNAVAILABLE':
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-muted-orca shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FAVORABLE':
        return 'text-success-orca bg-success-orca/10 border-success-orca/30';
      case 'MODERATE':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'UNFAVORABLE':
        return 'text-danger-orca bg-red-50 border-red-200';
      case 'UNAVAILABLE':
      default:
        return 'text-muted-orca bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="border border-border-orca rounded p-2.5 bg-secondary-surface space-y-2 select-none">
      <div className="flex items-center justify-between font-mono text-[10px]">
        <span className="font-bold text-secondary-text uppercase tracking-wider">
          WHY THIS ZONE? (EXPLAINABILITY)
        </span>
        <span className="text-[8px] font-mono text-muted-orca">FACTORS</span>
      </div>

      <div className="space-y-1.5 font-mono text-[9px]">
        {zone.factors.map((factor) => (
          <div
            key={factor.name}
            className="p-1.5 bg-white rounded border border-border-orca/80 space-y-0.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 font-bold text-primary-text">
                {getStatusIcon(factor.status)}
                <span>{factor.name}</span>
              </div>
              <span className={`px-1 py-0.2 rounded border text-[8px] font-bold ${getStatusBadge(factor.status)}`}>
                {factor.status}
              </span>
            </div>
            <p className="text-[8px] text-muted-orca leading-tight font-sans pl-4.5">
              {factor.description}
            </p>
          </div>
        ))}
      </div>

      <div className="text-[8px] text-muted-orca leading-snug pt-1 border-t border-border-orca/60">
        Heuristic contributing factors for candidate screening. Model validation index: 0.81 (Demo).
      </div>
    </div>
  );
}
