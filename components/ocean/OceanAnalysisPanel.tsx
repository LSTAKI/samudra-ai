'use client';

import React, { useState } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import OceanTemporalControl from './OceanTemporalControl';
import OceanTimeSeries from './OceanTimeSeries';
import SpatialSummary from './SpatialSummary';
import OceanPointInspector from './OceanPointInspector';
import {
  TrendingUp,
  Square,
  MapPin,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

type AnalysisTab = 'timeseries' | 'spatial' | 'point';

export default function OceanAnalysisPanel() {
  const {
    selectedLatitude,
    selectedLongitude,
    selectedCoordinates,
    selectedParameter
  } = useOrcaStore();

  const [activeTab, setActiveTab] = useState<AnalysisTab>('timeseries');
  const [collapsed, setCollapsed] = useState(false);

  const lat = selectedCoordinates ? selectedCoordinates.lat : (selectedLatitude ?? 9.9312);
  const lng = selectedCoordinates ? selectedCoordinates.lng : (selectedLongitude ?? 76.2673);

  const tabs: { id: AnalysisTab; label: string; icon: any }[] = [
    { id: 'timeseries', label: 'HISTORICAL TIMESERIES', icon: TrendingUp },
    { id: 'spatial', label: 'SPATIAL SUMMARY', icon: Square },
    { id: 'point', label: 'POINT DETAILS', icon: MapPin }
  ];

  return (
    <div className="bg-white border-t border-border-orca select-none font-sans z-20 shrink-0 transition-all">
      {/* Bar Header */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-border-orca bg-secondary-surface">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 font-mono">
            <span className="text-[11px] font-bold text-primary-text uppercase tracking-wider">
              COPERNICUS NUMERICAL ANALYSIS
            </span>
            <span className="text-[9px] text-muted-orca font-normal">
              [{lat.toFixed(4)}°N, {lng.toFixed(4)}°E]
            </span>
          </div>

          {/* Analysis Category Tabs */}
          <div className="flex items-center space-x-1 pl-4 border-l border-border-orca">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (collapsed) setCollapsed(false);
                  }}
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                      : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Header Side: Temporal Control + Collapse */}
        <div className="flex items-center space-x-3">
          <OceanTemporalControl />

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 text-secondary-text hover:text-primary-text hover:bg-white rounded transition-colors cursor-pointer"
            title={collapsed ? 'Expand Analysis Drawer' : 'Collapse Analysis Drawer'}
          >
            {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      {!collapsed && (
        <div className="p-3 bg-slate-50 max-h-72 overflow-y-auto font-mono">
          {activeTab === 'timeseries' && <OceanTimeSeries />}
          {activeTab === 'spatial' && <SpatialSummary />}
          {activeTab === 'point' && <OceanPointInspector />}
        </div>
      )}
    </div>
  );
}
