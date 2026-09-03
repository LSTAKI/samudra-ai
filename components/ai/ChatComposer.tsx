'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, X, Loader2, Sparkles } from 'lucide-react';
import { LocationInput } from '@/lib/api/chat';

interface ChatComposerProps {
  onSendMessage: (text: string, location?: LocationInput | null) => void;
  isLoading: boolean;
  initialLocation?: LocationInput | null;
}

export default function ChatComposer({
  onSendMessage,
  isLoading,
  initialLocation
}: ChatComposerProps) {
  const [text, setText] = useState('');
  const [location, setLocation] = useState<LocationInput | null>(initialLocation || null);
  const [showLocPicker, setShowLocPicker] = useState(false);
  const [latInput, setLatInput] = useState(initialLocation?.latitude?.toString() || '9.9312');
  const [lngInput, setLngInput] = useState(initialLocation?.longitude?.toString() || '76.2673');
  const [locNameInput, setLocNameInput] = useState(initialLocation?.name || 'Kochi Coast');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial location
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation);
      setLatInput(initialLocation.latitude?.toString() || '9.9312');
      setLngInput(initialLocation.longitude?.toString() || '76.2673');
      setLocNameInput(initialLocation.name || 'Kochi Coast');
    }
  }, [initialLocation]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;

    onSendMessage(text.trim(), location);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleApplyLocation = () => {
    const lat = parseFloat(latInput);
    const lng = parseFloat(lngInput);
    if (!isNaN(lat) && !isNaN(lng)) {
      setLocation({
        name: locNameInput || `${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`,
        latitude: lat,
        longitude: lng
      });
      setShowLocPicker(false);
    }
  };

  const handleClearLocation = () => {
    setLocation(null);
  };

  return (
    <div className="bg-[#0a1b33] border-t border-[#1b3459] p-3 sm:p-4 space-y-2 select-none relative font-sans">
      {/* Attached Location pill / indicator */}
      {location && (
        <div className="flex items-center justify-between bg-[#0f2a4f] border border-orca-blue/40 px-3 py-1.5 rounded-md font-mono text-[11px] text-slate-200">
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 text-orca-blue shrink-0" />
            <span className="font-bold text-white">{location.name || 'Selected Location'}</span>
            {(location.latitude !== undefined && location.latitude !== null && location.longitude !== undefined && location.longitude !== null) && (
              <span className="text-muted-orca text-[10px]">
                ({location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClearLocation}
            className="text-muted-orca hover:text-white transition-colors cursor-pointer p-0.5"
            title="Remove attached location context"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Location Picker Popup */}
      {showLocPicker && (
        <div className="absolute bottom-full left-3 right-3 sm:left-4 sm:right-auto sm:w-96 mb-2 bg-ocean-navy border border-[#1b3459] p-3 rounded-lg shadow-2xl z-30 font-mono text-xs space-y-2 text-white">
          <div className="flex items-center justify-between border-b border-[#1b3459] pb-1.5 text-[10px] font-bold text-orca-blue uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> ATTACH LOCATION CONTEXT
            </span>
            <button
              onClick={() => setShowLocPicker(false)}
              className="text-muted-orca hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <div>
              <label className="text-[9px] text-muted-orca block mb-0.5">LOCATION NAME</label>
              <input
                type="text"
                value={locNameInput}
                onChange={(e) => setLocNameInput(e.target.value)}
                placeholder="e.g. Kochi Coast"
                className="w-full bg-[#051124] border border-[#1b3459] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orca-blue"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] text-muted-orca block mb-0.5">LATITUDE (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  className="w-full bg-[#051124] border border-[#1b3459] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orca-blue"
                />
              </div>
              <div>
                <label className="text-[9px] text-muted-orca block mb-0.5">LONGITUDE (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  className="w-full bg-[#051124] border border-[#1b3459] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orca-blue"
                />
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={handleApplyLocation}
                className="flex-1 bg-orca-blue hover:bg-[#085ae6] text-white py-1.5 rounded font-bold uppercase text-[10px] tracking-wider transition-colors cursor-pointer"
              >
                ATTACH LOCATION
              </button>
              <button
                type="button"
                onClick={() => setShowLocPicker(false)}
                className="px-3 bg-[#0d2547] hover:bg-[#12315b] text-muted-orca hover:text-white py-1.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Composer Input Area */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <button
          type="button"
          onClick={() => setShowLocPicker(!showLocPicker)}
          className={`p-2.5 rounded-md border transition-all cursor-pointer ${
            location
              ? 'bg-orca-blue text-white border-orca-blue'
              : 'bg-[#051124] border-[#1b3459] text-muted-orca hover:text-white hover:border-orca-blue'
          }`}
          title="Attach location context (latitude, longitude)"
        >
          <MapPin className="w-4 h-4" />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Samudra AI about marine conditions, SST, waves, hazards, or PFZ..."
            disabled={isLoading}
            className="w-full bg-[#051124] border border-[#1b3459] rounded-md px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-secondary-text focus:outline-none focus:border-orca-blue font-sans resize-none disabled:opacity-50 min-h-[42px] max-h-[160px] leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="bg-orca-blue hover:bg-[#085ae6] text-white p-2.5 rounded-md font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shadow-md shrink-0 h-[42px] w-[42px]"
          title="Send query (Enter)"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      <div className="flex items-center justify-between text-[9px] font-mono text-muted-orca px-1 pt-0.5">
        <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
        <span className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-orca-blue" />
          SAMUDRA AI MARINE INTELLIGENCE API
        </span>
      </div>
    </div>
  );
}
