'use client';

import React, { useState } from 'react';
import CommandTimeline from './CommandTimeline';
import CommandSystemStatus from './CommandSystemStatus';
import { Clock, Server, ChevronUp, ChevronDown, Shield } from 'lucide-react';

type DrawerTab = 'timeline' | 'system';

export default function CommandBottomDrawer() {
  const [activeTab, setActiveTab] = useState<DrawerTab>('timeline');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-white border-t border-border-orca select-none font-sans z-20 shrink-0 transition-all">
      {/* Header */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-border-orca bg-secondary-surface">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 font-mono text-[10px]">
            <Shield className="w-3.5 h-3.5 text-orca-blue" />
            <span className="font-bold text-primary-text uppercase">
              OPERATIONAL TIME & SYSTEMS
            </span>
          </div>

          <div className="flex items-center space-x-1 pl-4 border-l border-border-orca">
            <button
              type="button"
              onClick={() => {
                setActiveTab('timeline');
                if (collapsed) setCollapsed(false);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                activeTab === 'timeline' && !collapsed
                  ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                  : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>EVENT TIMELINE</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('system');
                if (collapsed) setCollapsed(false);
              }}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition-all ${
                activeTab === 'system' && !collapsed
                  ? 'bg-white border border-border-orca text-orca-blue font-bold shadow-xs'
                  : 'text-secondary-text hover:text-primary-text hover:bg-white/60'
              }`}
            >
              <Server className="w-3 h-3" />
              <span>SYSTEM STATUS</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 text-secondary-text hover:text-primary-text hover:bg-white rounded transition-colors"
          title={collapsed ? 'Expand Drawer' : 'Collapse Drawer'}
        >
          {collapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="h-36 bg-white overflow-hidden">
          {activeTab === 'timeline' && <CommandTimeline />}
          {activeTab === 'system' && <CommandSystemStatus />}
        </div>
      )}
    </div>
  );
}
