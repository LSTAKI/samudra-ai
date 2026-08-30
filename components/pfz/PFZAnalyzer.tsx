'use client';

import React from 'react';
import PFZSidebar from './PFZSidebar';
import PFZMap from './PFZMap';
import PFZInspector from './PFZInspector';
import PFZCandidateAnalysisDrawer from './PFZCandidateAnalysisDrawer';

export default function PFZAnalyzer() {
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Main Scientific Workspace */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Left: PFZ Control Sidebar */}
        <PFZSidebar />

        {/* Center: Main PFZ Map Viewport */}
        <main className="flex-1 relative flex flex-col h-full min-h-0 overflow-hidden">
          <PFZMap />
        </main>

        {/* Right: PFZ Zone Inspector */}
        <PFZInspector />
      </div>

      {/* Bottom: Candidate Table & Retrospective Temporal Analysis */}
      <PFZCandidateAnalysisDrawer />
    </div>
  );
}
