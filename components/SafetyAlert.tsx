'use client';

import { useState } from 'react';
import { SafetyAlert as SafetyAlertType } from '../types';
import { ShieldAlert, MapPin, MessageSquare, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useOrcaStore } from '@/stores/useOrcaStore';

interface SafetyAlertProps {
  alert: SafetyAlertType;
  onExplain?: (alert: SafetyAlertType) => void;
}

export default function SafetyAlert({ alert, onExplain }: SafetyAlertProps) {
  const { setSelectedCoordinates } = useOrcaStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const getRiskStyles = (risk: string) => {
    switch (risk) {
      case 'HIGH':
        return {
          border: 'border-danger-orca bg-red-50/40',
          badge: 'bg-red-100 text-danger-orca border-red-200',
          text: 'text-danger-orca',
          icon: 'text-danger-orca animate-pulse'
        };
      case 'MEDIUM':
        return {
          border: 'border-warning-orca bg-amber-50/40',
          badge: 'bg-amber-100 text-warning-orca border-amber-200',
          text: 'text-warning-orca',
          icon: 'text-warning-orca'
        };
      case 'LOW':
      default:
        return {
          border: 'border-info-orca bg-blue-50/40',
          badge: 'bg-blue-100 text-info-orca border-blue-200',
          text: 'text-info-orca',
          icon: 'text-info-orca'
        };
    }
  };

  const styles = getRiskStyles(alert.risk);

  // Compact Collapsed State (Default)
  if (!isExpanded) {
    return (
      <div className={`border rounded-lg p-2.5 flex items-center justify-between gap-3 font-sans shadow-sm backdrop-blur-sm bg-white/95 ${styles.border}`}>
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className={`w-4 h-4 shrink-0 ${styles.icon}`} />
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-primary-text uppercase tracking-wider font-mono">
                MARITIME SAFETY
              </span>
              <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 border rounded uppercase ${styles.badge}`}>
                {alert.risk} RISK
              </span>
              <span className="text-[8px] font-mono text-muted-orca bg-slate-100 px-1 py-0.5 rounded border border-border-orca">
                DEMO SAFETY EVENT
              </span>
            </div>
            <p className="text-[10px] text-secondary-text font-mono truncate mt-0.5">
              {alert.title} · {alert.distance}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 font-mono text-[10px]">
          <button
            onClick={() => setSelectedCoordinates({ lat: alert.coordinates[0], lng: alert.coordinates[1] })}
            className="px-2 py-1 bg-white hover:bg-surface-secondary border border-border-orca text-primary-text rounded font-semibold transition-colors"
          >
            VIEW
          </button>
          <button
            onClick={() => setIsExpanded(true)}
            className="px-2 py-1 bg-orca-blue hover:bg-deep-ocean text-white rounded font-semibold transition-colors flex items-center gap-0.5"
          >
            <span>EXPAND</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Full Expanded State
  return (
    <div className={`border rounded-lg p-3.5 flex flex-col space-y-3 font-sans transition-all bg-white shadow-md ${styles.border}`}>
      {/* Alert Header */}
      <div className="flex items-center justify-between border-b border-border-orca/50 pb-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className={`w-4 h-4 ${styles.icon}`} />
          <span className="text-xs font-bold text-primary-text uppercase tracking-wider">
            MARITIME SAFETY ALERT
          </span>
          <span className="text-[9px] font-mono text-muted-orca bg-slate-100 px-1.5 py-0.5 rounded border border-border-orca">
            DEMO SAFETY EVENT
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded uppercase ${styles.badge}`}>
            {alert.risk} RISK
          </span>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-secondary-text hover:text-primary-text p-0.5 rounded transition-colors"
            title="Collapse Alert"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Description */}
      <div>
        <h4 className="text-xs font-bold text-primary-text uppercase font-mono">{alert.title}</h4>
        <p className="text-xs text-secondary-text mt-1 leading-relaxed">{alert.message}</p>
      </div>

      {/* Details Row */}
      <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-orca font-mono pt-1">
        <div className="flex flex-col">
          <span>PROXIMITY / SECTOR DISTANCE</span>
          <span className="text-primary-text font-bold mt-0.5">{alert.distance}</span>
        </div>
        <div className="flex flex-col">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            ALERT TRIGGERED
          </span>
          <span className="text-primary-text font-bold mt-0.5">{alert.timestamp}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-2 border-t border-border-orca/40">
        <button
          onClick={() => setSelectedCoordinates({ lat: alert.coordinates[0], lng: alert.coordinates[1] })}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-white hover:bg-surface-secondary border border-border-orca text-primary-text py-1.5 rounded text-xs font-medium transition-colors font-mono"
        >
          <MapPin className="w-3.5 h-3.5 text-secondary-text" />
          <span>VIEW ON MAP</span>
        </button>
        <button
          onClick={() => onExplain && onExplain(alert)}
          className="flex-1 flex items-center justify-center space-x-1.5 bg-white hover:bg-surface-secondary border border-border-orca text-primary-text py-1.5 rounded text-xs font-medium transition-colors font-mono"
        >
          <MessageSquare className="w-3.5 h-3.5 text-secondary-text" />
          <span>EXPLAIN ALERT</span>
        </button>
        <button
          onClick={() => setIsExpanded(false)}
          className="px-2 py-1.5 text-xs text-secondary-text hover:text-primary-text border border-border-orca rounded transition-colors font-mono"
        >
          COLLAPSE
        </button>
      </div>
    </div>
  );
}
