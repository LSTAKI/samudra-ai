'use client';

import React, { useEffect, useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { fetchPFZZones, PFZZone } from '@/lib/api/pfz';
import { pfzRegionPresets } from '@/lib/map/pfzPresets';
import PFZCandidateTable from './PFZCandidateTable';
import PFZTemporalAnalysis from './PFZTemporalAnalysis';
import PFZEnvironmentalCharts from './PFZEnvironmentalCharts';
import {
  Table,
  Clock,
  BarChart3,
  ChevronUp,
  ChevronDown,
  Target
} from 'lucide-react';

type PFZTab = 'table' | 'temporal' | 'charts';

export default function PFZCandidateAnalysisDrawer() {
  const { selectedPFZRegion, selectedLatitude, selectedLongitude } = useOrcaStore();
  const [activeTab, setActiveTab] = useState<PFZTab>('table');
  const [collapsed, setCollapsed] = useState(false);
  const [zones, setZones] = useState<PFZZone[]>([]);

  const region =
    pfzRegionPresets.find((r) => r.id === selectedPFZRegion) || pfzRegionPresets[0];

  useEffect(() => {
    let mounted = true;
    fetchPFZZones(
      selectedLatitude || region.centerLat,
      selectedLongitude || region.centerLng,
      region.harbor
    ).then((res) => {
      if (mounted && res.zones) {
        setZones(res.zones);
      }
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, [selectedPFZRegion, selectedLatitude, selectedLongitude]);

  const highCount = zones.filter((z) => z.classification === 'HIGH').length;
  const modCount = zones.filter((z) => z.classification === 'MODERATE').length;
  const lowCount = zones.filter((z) => z.classification === 'LOW').length;

  return (
    <div className="bg-white border-t border-border-orca select-none font-sans z-20 shrink-0 transition-all">
      {/* Bar Header */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-border-orca bg-secondary-surface">
        <div className="flex items-center space-x-3">
          {/* Region Summary Badge */}
          <div className="flex items-center space-x-2 font-mono text-[10px]">
            <Target className="w-3.5 h-3.5 text-orca-blue" />
            <span className="font-bold text-primary-text uppercase">
              {region.name}
            </span>
            <span className="text-muted-orca">·</span>
            <span className="text-secondary-text">
              {zones.length} CANDIDATES (High: {highCount}, Mod: {modCount}, Low: {lowCount})
            </span>
          </div>

          {/* Analysis Tabs */}
          <div className="flex items-center space-x-1 pl-4 border-l border-border-orca">
            <button
              type="button"
              onClick={() => {
                setActiveTab('table');
                if (collapsed) setCollapsed(false);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'table' && !collapsed
                  ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                  : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
              }`}
            >
              <Table className="w-3 h-3" />
              <span>CANDIDATES TABLE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('temporal');
                if (collapsed) setCollapsed(false);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'temporal' && !collapsed
                  ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                  : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>TEMPORAL TRENDS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('charts');
                if (collapsed) setCollapsed(false);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                activeTab === 'charts' && !collapsed
                  ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                  : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>ENVIRONMENTAL PROFILES</span>
            </button>
          </div>
        </div>

        {/* Collapse Drawer Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-white rounded border border-border-orca text-secondary-text hover:text-primary-text transition-colors cursor-pointer"
          title={collapsed ? 'Expand Drawer' : 'Collapse Drawer'}
        >
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Drawer Body */}
      {!collapsed && (
        <div className="h-64 p-3 bg-white overflow-hidden">
          {activeTab === 'table' && <PFZCandidateTable />}
          {activeTab === 'temporal' && <PFZTemporalAnalysis />}
          {activeTab === 'charts' && <PFZEnvironmentalCharts />}
        </div>
      )}
    </div>
  );
}
