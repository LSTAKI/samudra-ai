'use client';

import React from 'react';
import {
  Bot,
  User,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Compass,
  Layers,
  Clock,
  CheckCircle2,
  HelpCircle,
  FileText
} from 'lucide-react';
import { ChatResponseData, ChatSource, ChatEvidence, ChatHazard } from '@/lib/api/chat';

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
  onSelectPrompt?: (prompt: string) => void;
}

export default function ChatMessageItem({ message, onSelectPrompt }: ChatMessageItemProps) {
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
      <div className="flex justify-end my-4 select-text">
        <div className="max-w-[85%] sm:max-w-[70%] bg-orca-blue text-white rounded-lg p-3.5 shadow-md border border-[#2b7bf5]/40 space-y-1 font-sans">
          <div className="flex items-center justify-between gap-4 text-[10px] font-mono text-blue-100/80 border-b border-blue-400/30 pb-1">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" /> USER QUERY
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
  const evidence = data?.evidence || [];
  const hazards = data?.hazards || [];
  const dataQuality = data?.data_quality;

  return (
    <div className="flex justify-start my-4 select-text">
      <div className="w-full max-w-[95%] sm:max-w-[85%] bg-ocean-navy border border-[#1b3459] text-[#e1e9f5] rounded-lg p-4 shadow-lg space-y-4 font-sans">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#1b3459] pb-2 text-[10px] font-mono">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded bg-orca-blue/20 border border-orca-blue/50 flex items-center justify-center text-orca-blue">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-white uppercase tracking-wider">SAMUDRA AI ASSISTANT</span>
            {data?.conversation_id && (
              <span className="text-muted-orca bg-[#07162c] px-1.5 py-0.5 rounded border border-[#1b3459]">
                ID: {data.conversation_id}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2 text-muted-orca">
            {answer?.status && (
              <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                answer.status === 'low' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                answer.status === 'moderate' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                'bg-rose-950 text-rose-400 border border-rose-800'
              }`}>
                RISK: {answer.status}
              </span>
            )}
            <span>{message.timestamp}</span>
          </div>
        </div>

        {/* Loading state */}
        {message.isLoading && !message.error && !answer?.summary && (
          <div className="flex items-center space-x-2.5 text-orca-blue font-mono text-xs py-3 animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-orca-blue border-t-transparent rounded-full animate-spin"></div>
            <span>Querying Samudra AI Marine Intelligence...</span>
          </div>
        )}

        {/* Error message */}
        {message.error && (
          <div className="bg-rose-950/60 border border-rose-800/80 rounded p-3 text-rose-200 text-xs font-mono space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-rose-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>SAMUDRA AI SERVICE FAILURE</span>
            </div>
            <p className="text-[11px] leading-relaxed">{message.error}</p>
          </div>
        )}

        {/* Answer Summary */}
        {answer?.summary && (
          <div className="space-y-1.5">
            <span className="text-[9.5px] font-mono text-orca-blue font-bold uppercase tracking-wider block">
              [EXECUTIVE SUMMARY]
            </span>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans font-normal">
              {answer.summary}
            </p>
          </div>
        )}

        {/* Simple text fallback if no structured answer */}
        {!answer?.summary && message.text && !message.isLoading && (
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
            {message.text}
          </p>
        )}

        {/* Observations list */}
        {answer?.observations && answer.observations.length > 0 && (
          <div className="space-y-2 bg-[#061830] p-3 rounded border border-[#1b3459]">
            <span className="text-[9.5px] font-mono text-[#a4c2f4] font-bold uppercase tracking-wider block flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-orca-blue" />
              VERIFIED OCEAN OBSERVATIONS
            </span>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {answer.observations.map((obs, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-orca-blue font-mono font-bold mt-0.5">•</span>
                  <span className="leading-normal">{obs}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations list */}
        {answer?.recommendations && answer.recommendations.length > 0 && (
          <div className="space-y-2 bg-[#061830] p-3 rounded border border-[#1b3459]">
            <span className="text-[9.5px] font-mono text-emerald-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              DECISION SUPPORT RECOMMENDATIONS
            </span>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {answer.recommendations.map((rec, idx) => (
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
          <div className="space-y-2 bg-amber-950/30 border border-amber-800/50 p-3 rounded text-amber-200">
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

        {/* Data Quality & Missing Parameters info */}
        {dataQuality && (
          <div className="flex items-center justify-between p-2 bg-[#040e1c] border border-[#1b3459] rounded font-mono text-[9.5px] text-muted-orca">
            <div className="flex items-center space-x-2">
              <Layers className="w-3 h-3 text-orca-blue" />
              <span>DATA COMPLETENESS:</span>
              <span className="font-bold text-white">{dataQuality.completeness_percent ?? '--'}%</span>
              <span>({dataQuality.available ?? 0} available / {dataQuality.requested ?? 0} requested)</span>
            </div>
            {dataQuality.source_count !== undefined && (
              <span>SOURCES: {dataQuality.source_count}</span>
            )}
          </div>
        )}

        {/* Provenance & Sources Tag Trace */}
        {sources.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[#1b3459]/60 font-mono text-[9.5px]">
            <span className="text-muted-orca uppercase tracking-wider block">
              OFFICIAL PROVIDER PROVENANCE:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sources.map((src, sidx) => (
                <div
                  key={sidx}
                  className="bg-[#071933] border border-[#1b3459] px-2 py-1 rounded text-slate-300 flex items-center space-x-1.5"
                >
                  <span className="font-bold text-orca-blue">{src.name || src.title || 'Provider'}</span>
                  {src.type && <span className="text-muted-orca text-[8.5px]">({src.type})</span>}
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-orca hover:text-white transition-colors"
                      title="Open source URL"
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
