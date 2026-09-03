import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export default function IncidentsPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-[#07162c] text-white p-6 relative font-sans text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <AlertTriangle className="w-12 h-12 text-[#D98200] animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-[#D98200] font-mono tracking-widest uppercase">
            SAMUDRA AI PHASE 2 MODULE
          </span>
          <h1 className="text-2xl font-bold uppercase">Maritime Incidents Monitor</h1>
          <p className="text-xs text-muted-orca leading-relaxed">
            This module will support logging environmental alerts (oil spills, thermal bleaching), tracking cyclonic storms, and transmitting maritime boundary warnings.
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
