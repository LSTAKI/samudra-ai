'use client';

import React from 'react';
import SatelliteSidebar from './SatelliteSidebar';
import SatelliteMap from './SatelliteMap';
import SatelliteObservationInspector from './SatelliteObservationInspector';
import SatelliteTimeline from './SatelliteTimeline';

export default function SatelliteObservatory() {
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Main Scientific Observation Workspace */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Left: Satellite Control Sidebar */}
        <SatelliteSidebar />

        {/* Center: Satellite Map (Footprints, Tracks, Nadir Points) */}
        <main className="flex-1 relative flex flex-col h-full min-h-0 overflow-hidden">
          <SatelliteMap />
        </main>

        {/* Right: Observation Inspector */}
        <SatelliteObservationInspector />
      </div>

      {/* Bottom: Acquisition Timeline & Event Track */}
      <SatelliteTimeline />
    </div>
  );
}
