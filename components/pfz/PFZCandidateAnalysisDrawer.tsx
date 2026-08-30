'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { mockPFZZones, pfzRegionPresets } from '@/mock/mockPFZ';
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
  const { selectedPFZRegion, selectedTimestamp } = useOrcaStore();
  const [activeTab, setActiveTab] = useState<PFZTab>('table');
  const [collapsed, setCollapsed] = useState(false);

  const region =
    pfzRegionPresets.find((r) => r.id === selectedPFZRegion) || pfzRegionPresets[0];

  const highCount = mockPFZZones.filter((z) => z.classification === 'HIGH').length;
  const modCount = mockPFZZones.filter((z) => z.classification === 'MODERATE').length;
  const lowCount = mockPFZZones.filter((z) => z.classification === 'LOW').length;

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
              {mockPFZZones.length} CANDIDATES (High: {highCount}, Mod: {modCount}, Low: {lowCount})
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
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
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
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                activeTab === 'temporal' && !collapsed
                  ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                  : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>TEMPORAL ANALYSIS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('charts');
                if (collapsed) setCollapsed(false);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                activeTab === 'charts' && !collapsed
                  ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                  : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>ENVIRONMENTAL COMPARISON</span>
            </button>
          </div>
        </div>

        {/* Right Header: Collapse Toggle */}
        <div className="flex items-center space-x-3">
          <span className="text-[9px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold">
            DEMO ANALYSIS
          </span>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-secondary-text hover:text-primary-text hover:bg-white rounded transition-colors"
            title={collapsed ? 'Expand Drawer' : 'Collapse Drawer'}
          >
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      {!collapsed && (
        <div className="h-44 bg-white flex items-center justify-between overflow-hidden">
          {activeTab === 'table' && <PFZCandidateTable />}
          {activeTab === 'temporal' && <PFZTemporalAnalysis />}
          {activeTab === 'charts' && <PFZEnvironmentalCharts />}
        </div>
      )}
    </div>
  );
}
