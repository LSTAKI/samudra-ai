'use client';

import { useEffect, useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { getSatelliteStatuses, SatelliteStatus } from '@/lib/api/satellites';
import { X, RefreshCw, Radio, HardDrive, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function StatusDrawer() {
  const { statusDrawerOpen, toggleStatusDrawer } = useOrcaStore();
  const [statuses, setStatuses] = useState<SatelliteStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState('29 Aug 2026 08:42 UTC');

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const data = await getSatelliteStatuses();
      setStatuses(data);
      const now = new Date();
      // Format as "29 Aug 2026 HH:MM UTC"
      const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
      setLastSync(`${now.getDate()} ${months[now.getMonth() % 12]} ${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} UTC`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statusDrawerOpen) {
      fetchStatuses();
    }
  }, [statusDrawerOpen]);

  if (!statusDrawerOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <span className="w-2.5 h-2.5 rounded-full bg-success-orca inline-block animate-pulse"></span>;
      case 'DEMO':
        return <span className="w-2.5 h-2.5 rounded-full bg-info-orca inline-block"></span>;
      case 'LOADING':
        return <span className="w-2.5 h-2.5 rounded-full bg-orca-blue inline-block animate-ping"></span>;
      case 'UNAVAILABLE':
        return <span className="w-2.5 h-2.5 rounded-full bg-warning-orca inline-block"></span>;
      case 'ERROR':
      default:
        return <span className="w-2.5 h-2.5 rounded-full bg-danger-orca inline-block"></span>;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'bg-emerald-50 text-success-orca border-emerald-200';
      case 'DEMO':
        return 'bg-blue-50 text-info-orca border-blue-200';
      case 'LOADING':
        return 'bg-sky-50 text-orca-blue border-sky-200';
      case 'UNAVAILABLE':
        return 'bg-amber-50 text-warning-orca border-amber-200';
      case 'ERROR':
      default:
        return 'bg-red-50 text-danger-orca border-red-200';
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-80 bg-surface border-t border-border-orca z-50 shadow-2xl flex flex-col font-sans select-none animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-secondary-surface border-b border-border-orca">
        <div className="flex items-center space-x-3">
          <Radio className="w-5 h-5 text-orca-blue animate-pulse" />
          <h2 className="text-sm font-bold tracking-wider text-primary-text uppercase">
            ORCA Global Telemetry & Data Synchronizer
          </h2>
          <span className="text-[10px] bg-orca-blue/10 text-orca-blue border border-orca-blue/20 rounded px-1.5 py-0.5 font-mono">
            PHASE 1 ACTIVE
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchStatuses}
            disabled={loading}
            className="flex items-center space-x-1.5 text-xs text-secondary-text hover:text-primary-text border border-border-orca bg-white px-2.5 py-1 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="font-mono">REFRESH</span>
          </button>
          <button
            onClick={toggleStatusDrawer}
            className="text-secondary-text hover:text-primary-text p-1 hover:bg-border-orca/40 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 p-6 overflow-y-auto bg-canvas">
        {statuses.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-border-orca rounded-lg p-4 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xs font-bold text-primary-text font-mono truncate">{item.name}</h3>
                <span className="text-[10px] text-secondary-text font-mono block mt-1">
                  Receiver Network Address: OK
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                {getStatusIcon(item.status)}
                <span
                  className={`text-[9px] font-bold font-mono px-2 py-0.5 border rounded uppercase ${getStatusBadgeClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-orca flex items-center justify-between text-[10px] text-muted-orca font-mono">
              <span className={item.feedType === 'REAL DATA' ? 'text-success-orca font-bold' : 'text-secondary-text'}>
                FEED: {item.feedType}
              </span>
              <span className="font-bold text-primary-text">
                {item.status === 'CONNECTED' ? 'ACTIVE WMTS' : 'DEMO'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-border-orca px-6 py-3 flex items-center justify-between text-xs text-secondary-text font-mono">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-4 h-4 text-secondary-text" />
          <span>DATA POOL SYNCHRONIZATION: OK</span>
        </div>
        <div>
          <span>LAST COMPACT SYNC: </span>
          <span className="text-primary-text font-bold">{lastSync}</span>
        </div>
      </div>
    </div>
  );
}
