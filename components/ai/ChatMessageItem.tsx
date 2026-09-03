'use client';

import React, { useState } from 'react';
import {
  Bot,
  User,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Compass,
  Layers,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { ChatResponseData, ChatSource, ChatHazard } from '@/lib/api/chat';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  timestamp: string;
  text?: string;
  data?: ChatResponseData;
  error?: string;
  isLoading?: boolean;
}

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
}

interface MetricTile {
  label: string;
  value: string;
}

/**
 * Safely extracts explicit numerical marine metrics from observation text for fast visual scanning.
 * ALL raw observation sentences returned by the backend are ALWAYS preserved in full in the bullet list.
 */
function extractObservationMetrics(observations: string[]): MetricTile[] {
  const metrics: MetricTile[] = [];
  const seenLabels = new Set<string>();

  observations.forEach((obs) => {
    // 1. Sea Surface Temperature
    const sstMatch = obs.match(/(?:Sea surface temperature is|recorded at)\s+([\d.]+\s*°?C)/i);
    if (sstMatch && !seenLabels.has('SST')) {
      metrics.push({ label: 'SEA SURFACE TEMP', value: sstMatch[1] });
      seenLabels.add('SST');
    }

    // 2. Wave Height
    const waveHeightMatch = obs.match(/Wave height is ([\d.]+\s*m)/i);
    if (waveHeightMatch && !seenLabels.has('WAVE_HEIGHT')) {
      metrics.push({ label: 'WAVE HEIGHT', value: waveHeightMatch[1] });
      seenLabels.add('WAVE_HEIGHT');
    }

    // 3. Wave Period
    const wavePeriodMatch = obs.match(/period of ([\d.]+\s*s)/i);
    if (wavePeriodMatch && !seenLabels.has('WAVE_PERIOD')) {
      metrics.push({ label: 'WAVE PERIOD', value: wavePeriodMatch[1] });
      seenLabels.add('WAVE_PERIOD');
    }

    // 4. Wave Direction
    const waveDirMatch = obs.match(/from ([\d.]+\s*°)(?!\s*C)/i);
    if (waveDirMatch && !seenLabels.has('WAVE_DIR')) {
      metrics.push({ label: 'WAVE DIRECTION', value: waveDirMatch[1] });
      seenLabels.add('WAVE_DIR');
    }

    // 5. Ocean Current Speed
    const currentSpeedMatch = obs.match(/Ocean current speed is ([\d.]+\s*km\/h|[\d.]+\s*m\/s)/i);
    if (currentSpeedMatch && !seenLabels.has('CURRENT_SPEED')) {
      metrics.push({ label: 'CURRENT SPEED', value: currentSpeedMatch[1] });
      seenLabels.add('CURRENT_SPEED');
    }

    // 6. Ocean Current Direction
    const currentHeadingMatch = obs.match(/heading ([\d.]+\s*°)/i);
    if (currentHeadingMatch && !seenLabels.has('CURRENT_DIR')) {
      metrics.push({ label: 'CURRENT DIRECTION', value: currentHeadingMatch[1] });
      seenLabels.add('CURRENT_DIR');
    }

    // 7. Wind Speed
    const windSpeedMatch = obs.match(/wind speed is ([\d.]+\s*km\/h|[\d.]+\s*knots)/i);
    if (windSpeedMatch && !seenLabels.has('WIND_SPEED')) {
      metrics.push({ label: 'WIND SPEED', value: windSpeedMatch[1] });
      seenLabels.add('WIND_SPEED');
    }

    // 8. Chlorophyll
    const chlMatch = obs.match(/Chlorophyll(?:\s*concentration)?\s*is\s*([\d.]+\s*mg\/m³)/i);
    if (chlMatch && !seenLabels.has('CHL')) {
      metrics.push({ label: 'CHLOROPHYLL', value: chlMatch[1] });
      seenLabels.add('CHL');
    }

    // 9. Sea Level Anomaly
    const slaMatch = obs.match(/Sea level(?:\s*anomaly)?\s*is\s*([\d.]+\s*m)/i);
    if (slaMatch && !seenLabels.has('SLA')) {
      metrics.push({ label: 'SEA LEVEL ANOMALY', value: slaMatch[1] });
      seenLabels.add('SLA');
    }
  });

  return metrics;
}

export default function ChatMessageItem({ message, onRetry }: ChatMessageItemProps) {
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  const isUser = message.sender === 'user';
  const isSystem = message.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <div className="bg-[#0f2847] border border-[#1b3459] text-[#a4c2f4] text-[11px] font-mono px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xs">
          <Clock className="w-3 h-3 text-orca-blue" />
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="flex justify-end my-3 select-text">
        <div className="max-w-[90%] sm:max-w-xl bg-orca-blue text-white rounded-lg p-3 sm:p-3.5 shadow-md border border-[#2b7bf5]/40 space-y-1 font-sans">
          <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-blue-100/80 border-b border-blue-400/30 pb-1">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> USER
            </span>
            <span>{message.timestamp}</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }

  // Assistant Response
  const data = message.data;
  const answer = data?.answer;
  const sources = data?.sources || [];
  const hazards = data?.hazards || [];
  const dataQuality = data?.data_quality;

  const observations = answer?.observations || [];
  const recommendations = answer?.recommendations || [];
  const metrics = extractObservationMetrics(observations);

  return (
    <div className="flex justify-start my-4 select-text">
      <div className="w-full max-w-[95%] sm:max-w-3xl bg-ocean-navy border border-[#1b3459] text-[#e1e9f5] rounded-lg p-4 sm:p-5 shadow-xl space-y-4 font-sans">
        {/* Assistant Header Bar */}
        <div className="flex items-center justify-between border-b border-[#1b3459] pb-2.5 text-[10px] font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-orca-blue/20 border border-orca-blue/50 flex items-center justify-center text-orca-blue shadow-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white uppercase tracking-wider text-[11px]">
              SAMUDRA AI ASSISTANT
            </span>
          </div>

          <div className="flex items-center space-x-2 text-muted-orca">
            {answer?.status && (
              <span
                className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                  answer.status === 'low'
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                    : answer.status === 'moderate'
                    ? 'bg-amber-950/80 text-amber-400 border border-amber-800'
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                }`}
              >
                STATUS: {answer.status.toUpperCase()}
              </span>
            )}
            <span>{message.timestamp}</span>
          </div>
        </div>

        {/* Loading state */}
        {message.isLoading && !message.error && !answer?.summary && (
          <div className="flex items-center space-x-3 text-orca-blue font-mono text-xs py-4">
            <div className="w-4 h-4 border-2 border-orca-blue border-t-transparent rounded-full animate-spin"></div>
            <span className="animate-pulse">SAMUDRA AI IS ANALYZING... Retrieving marine intelligence...</span>
          </div>
        )}

        {/* Error message */}
        {message.error && (
          <div className="bg-rose-950/60 border border-rose-800/80 rounded-md p-3.5 text-rose-200 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>SAMUDRA AI SERVICE FAILURE</span>
              </div>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-white font-bold text-[10px] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>RETRY QUERY</span>
                </button>
              )}
            </div>
            <p className="text-[11px] leading-relaxed text-rose-200/90">{message.error}</p>
          </div>
        )}

        {/* Executive Summary */}
        {answer?.summary && (
          <div className="space-y-1.5 bg-[#081b36] p-3.5 rounded-md border border-[#1c3f6e]">
            <span className="text-[10px] font-mono text-orca-blue font-bold uppercase tracking-wider block">
              EXECUTIVE SUMMARY
            </span>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans font-normal">
              {answer.summary}
            </p>
          </div>
        )}

        {/* Text Fallback if no structured answer summary */}
        {!answer?.summary && message.text && !message.isLoading && !message.error && (
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
            {message.text}
          </p>
        )}

        {/* Parsed Metric Cards (Rendered ONLY if explicit values match backend text) */}
        {metrics.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9.5px] font-mono text-muted-orca font-bold uppercase tracking-wider block">
              SAMPLED OCEAN PARAMETERS
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              {metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-[#051326] border border-[#1b3459] p-2.5 rounded text-center space-y-0.5 shadow-xs"
                >
                  <span className="text-[8.5px] text-muted-orca uppercase block truncate">{m.label}</span>
                  <span className="text-sm font-bold text-white block">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observations List (100% of Raw Sentences Preserved) */}
        {observations.length > 0 && (
          <div className="space-y-2 bg-[#051326] p-3 rounded-md border border-[#1b3459]">
            <span className="text-[9.5px] font-mono text-[#a4c2f4] font-bold uppercase tracking-wider block flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-orca-blue" />
              VERIFIED OCEAN OBSERVATIONS
            </span>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {observations.map((obs, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-orca-blue font-mono font-bold mt-0.5">•</span>
                  <span className="leading-normal">{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations List */}
        {recommendations.length > 0 && (
          <div className="space-y-2 bg-[#05182e] p-3 rounded-md border border-[#1b3459]">
            <span className="text-[9.5px] font-mono text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              DECISION SUPPORT RECOMMENDATIONS
            </span>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-mono font-bold mt-0.5">&gt;</span>
                  <span className="leading-normal">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Active Hazards Alert */}
        {hazards.length > 0 && (
          <div className="space-y-2 bg-amber-950/30 border border-amber-800/50 p-3 rounded-md text-amber-200">
            <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider block flex items-center gap-1.5 text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              ACTIVE MARIME HAZARD ALERTS ({hazards.length})
            </span>
            <div className="space-y-2 font-mono text-[10.5px]">
              {hazards.map((h, hidx) => (
                <div key={hidx} className="bg-[#0a1b33] border border-amber-800/40 p-2 rounded space-y-1">
                  <div className="flex items-center justify-between text-amber-300 font-bold uppercase">
                    <span>{h.name?.replace('_', ' ')}</span>
                    <span className="text-[9px] bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-700">
                      {h.severity}
                    </span>
                  </div>
                  {h.source && (
                    <div className="text-[9.5px] text-amber-400/80">Source: {h.source}</div>
                  )}
                  {h.details && (
                    <p className="text-[9.5px] text-slate-300 leading-relaxed font-sans line-clamp-3">
                      {h.details}
                    </p>
                  )}
                  {h.source_url && (
                    <a
                      href={h.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[9px] text-orca-blue hover:underline pt-0.5"
                    >
                      Official Advisory Link <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Quality Row (Exact API Values Rendered) */}
        {dataQuality && (
          <div className="flex items-center justify-between px-3 py-2 bg-[#040e1c] border border-[#1b3459] rounded-md font-mono text-[9.5px] text-muted-orca">
            <div className="flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-orca-blue shrink-0" />
              <span className="font-bold text-white uppercase">DATA QUALITY:</span>
              <span className="text-slate-200">
                {dataQuality.completeness_percent !== undefined ? `${dataQuality.completeness_percent}% completeness` : ''} · {dataQuality.available ?? 0} available / {dataQuality.requested ?? 0} requested
              </span>
            </div>
            {dataQuality.source_count !== undefined && (
              <span className="font-bold text-slate-300">{dataQuality.source_count} sources</span>
            )}
          </div>
        )}

        {/* Provenance & Sources Section */}
        {sources.length > 0 && (
          <div className="border-t border-[#1b3459]/60 pt-2 space-y-1.5 font-mono text-[9.5px]">
            <div className="flex items-center justify-between">
              <span className="text-muted-orca uppercase tracking-wider font-bold">
                SOURCES ({sources.length})
              </span>
              <button
                type="button"
                onClick={() => setSourcesExpanded(!sourcesExpanded)}
                className="flex items-center space-x-1 text-orca-blue hover:text-white transition-colors cursor-pointer"
              >
                <span>{sourcesExpanded ? 'Collapse' : 'Expand Details'}</span>
                {sourcesExpanded ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </div>

            {/* Compact tags view */}
            <div className="flex flex-wrap gap-1.5">
              {sources.map((src, sidx) => (
                <div
                  key={sidx}
                  className="bg-[#051326] border border-[#1b3459] px-2 py-0.5 rounded text-slate-300 flex items-center space-x-1.5"
                >
                  <span className="font-bold text-orca-blue">{src.name || src.title || 'Provider'}</span>
                  {sourcesExpanded && src.type && (
                    <span className="text-muted-orca text-[8.5px]">({src.type})</span>
                  )}
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-orca hover:text-white transition-colors p-0.5"
                      title={`Open ${src.name || 'source'} link`}
                      aria-label={`Open external link for ${src.name || 'source'}`}
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
