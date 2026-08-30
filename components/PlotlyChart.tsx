'use client';

import React from 'react';
import Plotly from 'plotly.js-dist-min';
// @ts-ignore
import createPlotComponent from 'react-plotly.js/factory';

const Plot = createPlotComponent(Plotly);

interface ChartProps {
  xData: string[];
  yData: number[];
  yName: string;
  lineColor: string;
  yUnit: string;
}

export default function PlotlyChart({ xData, yData, yName, lineColor, yUnit }: ChartProps) {
  return (
    <div className="w-full h-28 bg-white rounded border border-border-orca overflow-hidden">
      <Plot
        data={[
          {
            x: xData,
            y: yData,
            type: 'scatter',
            mode: 'lines+markers',
            name: yName,
            marker: { color: lineColor, size: 6 },
            line: { color: lineColor, width: 2 },
            hovertemplate: `%{x}<br>%{y} ${yUnit}<extra></extra>`
          }
        ]}
        layout={{
          autosize: true,
          margin: { l: 30, r: 10, t: 15, b: 20 },
          xaxis: {
            gridcolor: '#EEF2F6',
            tickfont: { size: 9, family: 'var(--font-ibm-plex-mono)' },
            zeroline: false
          },
          yaxis: {
            gridcolor: '#EEF2F6',
            tickfont: { size: 9, family: 'var(--font-ibm-plex-mono)' },
            zeroline: false
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          showlegend: false
        }}
        config={{ displayModeBar: false, responsive: true }}
        className="w-full h-full"
      />
    </div>
  );
}
