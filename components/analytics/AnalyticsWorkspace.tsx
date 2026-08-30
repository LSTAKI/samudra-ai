'use client';

import React from 'react';
import AnalyticsControlBar from './AnalyticsControlBar';
import AnalyticsTimeSeries from './AnalyticsTimeSeries';
import AnalyticsParameterComparison from './AnalyticsParameterComparison';
import AnalyticsAnomalyPanel from './AnalyticsAnomalyPanel';
import AnalyticsRegionalComparison from './AnalyticsRegionalComparison';
import AnalyticsSourceComparison from './AnalyticsSourceComparison';
import AnalyticsDataQuality from './AnalyticsDataQuality';
import AnalyticsMap from './AnalyticsMap';
import AnalyticsPFZContext from './AnalyticsPFZContext';
import AnalyticsReportPreview from './AnalyticsReportPreview';
import AnalyticsProvenance from './AnalyticsProvenance';

export default function AnalyticsWorkspace() {
  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Top Controls Bar */}
      <AnalyticsControlBar />

      {/* Main Analytical Content Workspace */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 1. Primary Time Series (Hero Chart) */}
        <AnalyticsTimeSeries />

        {/* 2. Middle Row: Parameter Comparison & Anomaly Detection + Regional & Spatial Context */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <AnalyticsParameterComparison />
            <AnalyticsAnomalyPanel />
          </div>

          <div className="space-y-4">
            <AnalyticsMap />
            <AnalyticsRegionalComparison />
          </div>
        </div>

        {/* 3. Bottom Row: Cross-Source Sensor Matrix + PFZ Context & Report Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <AnalyticsSourceComparison />
            <AnalyticsDataQuality />
          </div>

          <div className="space-y-4">
            <AnalyticsPFZContext />
            <AnalyticsReportPreview />
            <AnalyticsProvenance />
          </div>
        </div>
      </div>
    </div>
  );
}
