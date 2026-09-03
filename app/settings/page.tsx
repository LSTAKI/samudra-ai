import Link from 'next/link';
import { Settings, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-[#07162c] text-white p-6 relative font-sans text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <Settings className="w-12 h-12 text-[#526273] animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] text-[#526273] font-mono tracking-widest uppercase">
            SAMUDRA AI SETTINGS CONFIGURATION
          </span>
          <h1 className="text-2xl font-bold uppercase">SYSTEM PREFERENCES</h1>
          <p className="text-xs text-muted-orca leading-relaxed">
            This module will control API connections to INCOIS/ISRO endpoints, user access keys, map style server caches, and local coordinate coordinate formats (DMS vs. Decimal).
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/research"
            className="inline-flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border border-border-orca/30 rounded px-4 py-2 text-xs font-mono transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Research Console</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
