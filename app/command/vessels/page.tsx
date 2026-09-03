import Link from 'next/link';
import { Anchor, ArrowLeft } from 'lucide-react';

export default function VesselsPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-[#07162c] text-white p-6 relative font-sans text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <Anchor className="w-12 h-12 text-[#1677C8] animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-[#1677C8] font-mono tracking-widest uppercase">
            SAMUDRA AI PHASE 2 MODULE
          </span>
          <h1 className="text-2xl font-bold uppercase">Vessel Tracking & AIS monitoring</h1>
          <p className="text-xs text-muted-orca leading-relaxed">
            This module will support real-time transponder logging, restricted naval perimeter violations, and deep-learning vessel route classifications.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/command"
            className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-border-orca/30 rounded px-4 py-2 text-xs font-mono transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Command Console</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
