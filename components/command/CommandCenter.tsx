'use client';

import React from 'react';
import CommandSidebar from './CommandSidebar';
import CommandMap from './CommandMap';
import CommandEventInspector from './CommandEventInspector';
import CommandBottomDrawer from './CommandBottomDrawer';

export default function CommandCenter() {
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Main Operational Workspace */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        {/* Left: Operational Alert Watch & Filters */}
        <CommandSidebar />

        {/* Center: Hero Operational Map */}
        <main className="flex-1 relative flex flex-col h-full min-h-0 overflow-hidden">
          <CommandMap />
        </main>

        {/* Right: Operational Event Inspector & Workflows */}
        <CommandEventInspector />
      </div>

      {/* Bottom: Event Timeline & Gateway Status */}
      <CommandBottomDrawer />
    </div>
  );
}
