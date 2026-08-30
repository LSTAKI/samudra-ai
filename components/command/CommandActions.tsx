'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { OperationalStatus } from '@/types/command';
import { Check, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface Props {
  eventId: string;
}

export default function CommandActions({ eventId }: Props) {
  const { eventWorkflowStatuses, setEventWorkflowStatus } = useOrcaStore();
  const currentStatus = eventWorkflowStatuses[eventId] || 'NEW';
  const [confirmedAction, setConfirmedAction] = useState<string | null>(null);

  const handleAction = (status: OperationalStatus, label: string) => {
    setEventWorkflowStatus(eventId, status);
    setConfirmedAction(label);
    setTimeout(() => setConfirmedAction(null), 2000);
  };

  return (
    <div className="space-y-2 select-none font-mono text-[9px]">
      <div className="flex items-center justify-between text-muted-orca uppercase">
        <span className="font-bold text-secondary-text">COMMAND WORKFLOW ACTIONS</span>
        {confirmedAction ? (
          <span className="text-success-orca font-bold flex items-center gap-0.5">
            <Check className="w-2.5 h-2.5" /> {confirmedAction}
          </span>
        ) : (
          <span>STATUS: {currentStatus}</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <button
          type="button"
          onClick={() => handleAction('ACKNOWLEDGED', 'ACKNOWLEDGED')}
          disabled={currentStatus === 'ACKNOWLEDGED' || currentStatus === 'RESOLVED'}
          className={`py-1.5 px-2 rounded border font-bold uppercase transition-all flex items-center justify-center space-x-1 ${
            currentStatus === 'ACKNOWLEDGED'
              ? 'bg-blue-50 text-orca-blue border-blue-200'
              : 'bg-white hover:bg-secondary-surface text-primary-text border-border-orca disabled:opacity-50'
          }`}
        >
          <Check className="w-3 h-3" />
          <span>ACKNOWLEDGE</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction('INVESTIGATING', 'INVESTIGATING')}
          disabled={currentStatus === 'INVESTIGATING' || currentStatus === 'RESOLVED'}
          className={`py-1.5 px-2 rounded border font-bold uppercase transition-all flex items-center justify-center space-x-1 ${
            currentStatus === 'INVESTIGATING'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-white hover:bg-secondary-surface text-primary-text border-border-orca disabled:opacity-50'
          }`}
        >
          <Search className="w-3 h-3" />
          <span>INVESTIGATE</span>
        </button>

        <button
          type="button"
          onClick={() => handleAction('RESOLVED', 'RESOLVED')}
          disabled={currentStatus === 'RESOLVED'}
          className={`py-1.5 px-2 rounded border font-bold uppercase transition-all flex items-center justify-center space-x-1 ${
            currentStatus === 'RESOLVED'
              ? 'bg-emerald-50 text-success-orca border-emerald-200'
              : 'bg-white hover:bg-secondary-surface text-primary-text border-border-orca disabled:opacity-50'
          }`}
        >
          <CheckCircle2 className="w-3 h-3" />
          <span>RESOLVE</span>
        </button>
      </div>

      <div className="text-[8px] text-muted-orca">
        Actions record operator review in frontend state. No dispatch sent to coastal law enforcement.
      </div>
    </div>
  );
}
