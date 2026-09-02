'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useOrcaStore } from '@/stores/useOrcaStore';
import ScientificSidebar from '@/components/ScientificSidebar';
import OceanPointInspector from '@/components/ocean/OceanPointInspector';
import OceanTimeSeries from '@/components/ocean/OceanTimeSeries';
import TemporalAnalysis from '@/components/TemporalAnalysis';
import { X } from 'lucide-react';
import ResearchAssistant from '@/components/ResearchAssistant';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#e8ecef] flex flex-col items-center justify-center font-mono text-xs text-muted-orca">
      <span>INITIALIZING GEOSPATIAL MAP BASEMAP...</span>
    </div>
  )
});

export default function ResearchPage() {
  const {
    selectedCoordinates,
    setSelectedCoordinates,
    sidebarOpen
  } = useOrcaStore();

  const [showHistory, setShowHistory] = useState(false);

  const handleCloseInspector = () => {
    setSelectedCoordinates(null);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-full w-full relative select-none overflow-hidden bg-white">
      {/* Top Main Workspace: Sidebar + Map */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left: Scientific Data Layer Selection */}
        {sidebarOpen && <ScientificSidebar />}

        {/* Center: Interactive Map */}
        <div className="flex-1 relative flex overflow-hidden">
          <MapComponent />

          {/* Right Floating: Real Point Inspector */}
          {selectedCoordinates && (
            <div className="absolute top-3 right-3 z-20 w-80 max-w-[calc(100vw-24px)] pointer-events-auto space-y-2">
              <div className="relative">
                <OceanPointInspector onViewHistory={() => setShowHistory(!showHistory)} />
                <button
                  onClick={handleCloseInspector}
                  className="absolute top-2.5 right-2.5 text-muted-orca hover:text-primary-text p-0.5 rounded cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {showHistory && (
                <OceanTimeSeries onClose={() => setShowHistory(false)} />
              )}
            </div>
          )}
        </div>

        {/* Right: Collapsible Ask ORCA AI reasoning terminal */}
        <ResearchAssistant />
      </div>

      {/* Bottom: Temporal analysis and charts */}
      <TemporalAnalysis />
    </div>
  );
}
