'use client';

import { useState } from 'react';
import { Provenance } from '../types';
import { ChevronDown, ChevronUp, Database, ShieldCheck, Cpu } from 'lucide-react';

interface ProvenanceCardProps {
  provenance: Provenance;
}

export default function ProvenanceCard({ provenance }: ProvenanceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getConfidenceBadgeColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-success-orca bg-emerald-50 border-emerald-200';
      case 'MEDIUM':
        return 'text-warning-orca bg-amber-50 border-amber-200';
      case 'LOW':
      default:
        return 'text-danger-orca bg-red-50 border-red-200';
    }
  };

  return (
    <div className="bg-surface border border-border-orca rounded-md flex flex-col transition-all overflow-hidden">
      {/* Header (Always visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-surface hover:bg-surface-secondary text-left focus:outline-none transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <Database className="w-3.5 h-3.5 text-orca-blue" />
          <div>
            <span className="text-[10px] text-muted-orca font-mono block uppercase tracking-wider">
              PROVENANCE RECORD
            </span>
            <span className="text-xs font-bold text-primary-text font-mono">
              {provenance.source} • {provenance.dataset}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 border rounded ${getConfidenceBadgeColor(provenance.confidence)}`}>
            {provenance.confidence} CONFIDENCE
          </span>
          {isOpen ? (
            <ChevronUp className="w-3.5 h-3.5 text-secondary-text" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-secondary-text" />
          )}
        </div>
      </button>

      {/* Details (Collapsible) */}
      {isOpen && (
        <div className="px-3 pb-3 border-t border-border-orca bg-surface-secondary/30 grid grid-cols-2 gap-3 pt-3">
          <div className="flex flex-col">
            <span className="text-[9px] text-secondary-text font-mono uppercase">COORDINATES</span>
            <span className="text-xs text-primary-text font-mono font-medium">{provenance.coordinates}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-secondary-text font-mono uppercase">OBSERVATION TIME</span>
            <span className="text-xs text-primary-text font-mono font-medium">{provenance.timestamp}</span>
          </div>

          <div className="flex flex-col col-span-2 border-t border-border-orca/50 pt-2">
            <span className="text-[9px] text-secondary-text font-mono uppercase flex items-center gap-1">
              <Cpu className="w-2.5 h-2.5" />
              PROCESSING PIPELINE
            </span>
            <span className="text-xs text-primary-text font-mono mt-0.5">{provenance.processing}</span>
          </div>

          <div className="flex flex-col col-span-2 border-t border-border-orca/50 pt-2">
            <span className="text-[9px] text-secondary-text font-mono uppercase flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              VALIDATION SCHEMA
            </span>
            <span className="text-xs text-primary-text font-mono mt-0.5">{provenance.validation}</span>
          </div>
        </div>
      )}
    </div>
  );
}
