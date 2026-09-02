'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { askOrcaAI } from '@/lib/api/ai';
import { Terminal, Send, HelpCircle, Loader2, Layers, Compass, Database, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Consensus, Provenance } from '@/types';

const suggestedQueries = [
  'Why is SST elevated near Kerala?',
  'Compare wave conditions over the last 72 hours.',
  'Where are the strongest chlorophyll fronts?',
  'Compare ISRO and NOAA observations.',
  'Is there a marine heatwave?'
];

function InlineConsensusCard({ consensus }: { consensus: Consensus }) {
  return (
    <div className="bg-white border border-border-orca rounded p-3 flex flex-col space-y-2 font-sans select-none text-primary-text">
      <div className="flex items-center justify-between border-b border-border-orca pb-1.5 font-mono text-[9px]">
        <div className="flex items-center space-x-1.5 font-bold">
          <Layers className="w-3.5 h-3.5 text-orca-blue" />
          <span>MULTI-SENSOR CONSENSUS (QA/QC)</span>
        </div>
        <span className="font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-300">
          {consensus.confidence}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 font-mono text-[9px]">
        {consensus.values.map((v, i) => (
          <div key={i} className="bg-secondary-surface border border-border-orca/80 p-1.5 rounded text-center">
            <span className="text-[8px] text-muted-orca uppercase block truncate">
              {v.sensor}
            </span>
            <span className="text-[10px] font-bold text-primary-text block mt-0.5">
              {v.value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-border-orca text-[9px] font-mono">
        <span className="text-secondary-text">CONSENSUS VALUE:</span>
        <span className="font-bold text-orca-blue bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          {consensus.consensusValue}
        </span>
      </div>
    </div>
  );
}

function InlineProvenanceCard({ provenance }: { provenance: Provenance }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border border-border-orca rounded flex flex-col select-none text-primary-text text-[9px] font-mono">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 hover:bg-secondary-surface text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-1.5">
          <Database className="w-3 h-3 text-orca-blue" />
          <span className="font-bold truncate max-w-[180px]">
            {provenance.source} • {provenance.dataset}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
            {provenance.confidence}
          </span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-2 border-t border-border-orca bg-secondary-surface/40 space-y-1 text-[8.5px] text-secondary-text">
          <div><span className="font-bold text-primary-text">Coordinates:</span> {provenance.coordinates}</div>
          <div><span className="font-bold text-primary-text">Timestamp:</span> {provenance.timestamp}</div>
          <div><span className="font-bold text-primary-text">Processing:</span> {provenance.processing}</div>
          <div><span className="font-bold text-primary-text">Validation:</span> {provenance.validation}</div>
        </div>
      )}
    </div>
  );
}

export default function ResearchAssistant() {
  const {
    aiMessages,
    addAIMessage,
    clearMessages,
    assistantOpen,
    toggleAssistant,
    selectedLatitude,
    selectedLongitude
  } = useOrcaStore();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiMessages, loading]);

  const handleSubmit = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setQuery('');

    try {
      const coords = (selectedLatitude !== null && selectedLongitude !== null)
        ? { lat: selectedLatitude, lng: selectedLongitude }
        : undefined;
      const response = await askOrcaAI(text, coords);
      addAIMessage(response);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'text-emerald-400';
      case 'MEDIUM':
        return 'text-amber-400';
      case 'LOW':
      default:
        return 'text-blue-400';
    }
  };

  if (!assistantOpen) {
    return (
      <button
        onClick={toggleAssistant}
        className="fixed right-0 top-[calc(64px+16px)] z-40 bg-ocean-navy text-white p-2 border-y border-l border-[#1b3459] rounded-l-md hover:bg-orca-blue transition-colors focus:outline-none font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
        title="Open Ask ORCA Panel"
      >
        <Terminal className="w-4 h-4" />
        <span className="hidden lg:inline uppercase tracking-widest text-[10px]">ASK ORCA</span>
      </button>
    );
  }

  return (
    <div className="w-[320px] lg:w-[340px] bg-ocean-navy border-l border-[#1b3459] text-[#e1e9f5] h-full flex flex-col font-sans select-none z-30 relative transition-all duration-200">
      {/* Panel Header */}
      <div className="h-14 border-b border-[#1b3459] px-4 flex items-center justify-between bg-[#0a1b33]">
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-4 h-4 text-orca-blue" />
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              ASK ORCA
            </h2>
            <span className="text-[9px] text-muted-orca font-mono block">
              Ocean Intelligence Gateway
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {aiMessages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-muted-orca hover:text-white p-1 hover:bg-[#12315b] rounded text-[10px] font-mono border border-[#1b3459] transition-all cursor-pointer"
              title="Clear Terminal Logs"
            >
              CLEAR
            </button>
          )}
          <button
            onClick={toggleAssistant}
            className="text-muted-orca hover:text-white p-1 hover:bg-[#12315b] rounded transition-colors text-[10px] font-mono cursor-pointer"
            title="Minimize Assistant"
          >
            MINIMIZE
          </button>
        </div>
      </div>

      {/* Terminal logs list */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 font-mono text-xs scroll-smooth bg-[#081528]"
      >
        {aiMessages.length === 0 && !loading && (
          <div className="h-full flex flex-col justify-center items-center text-center px-4 space-y-4">
            <HelpCircle className="w-8 h-8 text-[#526273]" />
            <div className="space-y-1">
              <h3 className="font-bold text-white uppercase text-xs">Scientific Query Terminal</h3>
              <p className="text-[10px] text-secondary-text leading-relaxed max-w-[280px]">
                Submit questions about SST anomalies, chlorophyll convergence fronts, or Copernicus satellite ingestion feeds.
              </p>
            </div>

            {/* Presets suggestions */}
            <div className="w-full text-left space-y-1.5 pt-3 border-t border-[#1b3459]/40">
              <span className="text-[9px] text-muted-orca uppercase tracking-wider block">
                SUGGESTED ANALYTICAL QUERIES
              </span>
              <div className="flex flex-col space-y-1">
                {suggestedQueries.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSubmit(q)}
                    className="w-full text-left bg-[#0a1c35] hover:bg-[#112d53] text-[#a4c2f4] p-2 rounded border border-[#173863] text-[10px] truncate leading-snug transition-colors cursor-pointer"
                  >
                    &gt; {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {aiMessages.map((msg) => (
          <div key={msg.id} className="border-b border-[#1b3459]/30 pb-6 space-y-4">
            {/* Question Command line */}
            <div className="flex items-start space-x-2 text-orca-blue font-bold">
              <span>$</span>
              <span>orca-query --eval &quot;{msg.question}&quot;</span>
            </div>

            {/* Analysis text */}
            <div className="space-y-1">
              <span className="text-[9px] text-[#86a5d4] uppercase tracking-wider font-bold block">
                [ANALYSIS REPORT]
              </span>
              <p className="text-secondary-text leading-relaxed font-sans">{msg.analysis}</p>
            </div>

            {/* Scientific Consensus card */}
            {msg.consensus && (
              <InlineConsensusCard consensus={msg.consensus} />
            )}

            {/* Scientific Confidence metrics */}
            <div className="flex items-center justify-between py-1 px-2.5 bg-[#0a1e3b] border border-[#1b3459] rounded">
              <span className="text-[9px] text-muted-orca">REASONING CONFIDENCE VALUE:</span>
              <span className={`font-bold uppercase ${getConfidenceColor(msg.confidence)}`}>
                {msg.confidence}
              </span>
            </div>

            {/* Data Provenance cards */}
            {msg.provenance && msg.provenance.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] text-[#86a5d4] uppercase tracking-wider font-bold block">
                  [DATA PROVENANCE TRACK]
                </span>
                <div className="space-y-1">
                  {msg.provenance.map((prov, pidx) => (
                    <InlineProvenanceCard key={pidx} provenance={prov} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading log indicator */}
        {loading && (
          <div className="flex items-center space-x-2 text-orca-blue font-mono font-bold animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>orca-agent querying operational gateway...</span>
          </div>
        )}
      </div>

      {/* Input container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.target as HTMLFormElement;
          const input = target.elements.namedItem('prompt') as HTMLInputElement;
          handleSubmit(input.value);
        }}
        className="p-3 bg-[#0a1b33] border-t border-[#1b3459] flex items-center space-x-2"
      >
        <input
          name="prompt"
          type="text"
          placeholder="Ask a scientific ocean question..."
          disabled={loading}
          className="flex-1 bg-[#051124] border border-[#1b3459] rounded px-3 py-2 text-xs font-mono text-white placeholder-secondary-text focus:outline-none focus:border-orca-blue disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orca-blue hover:bg-[#085ae6] text-white p-2 rounded transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
