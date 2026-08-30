'use client';

import { Consensus } from '../types';
import { Layers, Activity, CheckSquare } from 'lucide-react';

interface ConsensusCardProps {
  consensus: Consensus;
}

export default function ConsensusCard({ consensus }: ConsensusCardProps) {
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
    <div className="bg-surface border border-border-orca rounded-md p-4 flex flex-col space-y-3 font-sans select-none">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border-orca pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-orca-blue" />
          <span className="text-xs font-bold text-primary-text tracking-wider uppercase">
            Multi-Sensor Consensus (QA/QC)
          </span>
        </div>
        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 border rounded ${getConfidenceBadgeColor(consensus.confidence)}`}>
          {consensus.confidence}
        </span>
      </div>

      {/* Sensor stream values */}
      <div className="grid grid-cols-3 gap-2">
        {consensus.values.map((v, i) => (
          <div key={i} className="bg-surface-secondary border border-border-orca/60 p-2 rounded text-center">
            <span className="text-[9px] text-secondary-text font-mono uppercase tracking-wider block">
              {v.sensor}
            </span>
            <span className="text-xs font-bold text-primary-text font-mono mt-0.5 inline-block">
              {v.value}
            </span>
          </div>
        ))}
      </div>

      {/* Consensus Metrics */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border-orca/50 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-secondary-text font-mono">CONSENSUS</span>
          <span className="font-bold text-primary-text font-mono bg-orca-blue/10 text-orca-blue px-2 py-0.5 rounded border border-orca-blue/20">
            {consensus.consensusValue}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-secondary-text font-mono">BIAS DELTA</span>
          <span className="font-mono text-danger-orca bg-red-50 px-1.5 py-0.5 border border-red-100 rounded">
            ±{consensus.difference}
          </span>
        </div>
      </div>
    </div>
  );
}
