'use client';

import React from 'react';
import OceanExplorerSidebar from '@/components/ocean/OceanExplorerSidebar';
import OceanView from '@/components/ocean/OceanView';
import OceanProfile from '@/components/ocean/OceanProfile';
import OceanAnalysisPanel from '@/components/ocean/OceanAnalysisPanel';

export default function OceanExplorerPage() {
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Main Full-Screen Scientific Workspace */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Left: Ocean Exploration Controls Sidebar */}
        <OceanExplorerSidebar />

        {/* Center: Main Ocean 2D/3D Viewport */}
        <div className="flex-1 relative flex flex-col h-full min-h-0 overflow-hidden">
          <OceanView />
        </div>

        {/* Right: Ocean Profile Panel */}
        <OceanProfile />
      </div>

      {/* Bottom: Depth & Temporal Profile Analysis Panel */}
      <OceanAnalysisPanel />
    </div>
  );
}
