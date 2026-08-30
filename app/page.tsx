import Link from 'next/link';
import { Compass, ShieldAlert, Cpu, Activity, ArrowRight, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-[#07162c] text-white p-6 relative overflow-hidden font-sans select-none">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1b3459_1px,transparent_1px),linear-gradient(to_bottom,#1b3459_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Brand logo container */}
      <div className="relative z-10 max-w-4xl text-center space-y-8 flex flex-col items-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-orca-blue flex items-center justify-center border-4 border-[#1b3459] shadow-lg animate-pulse mb-2">
            <span className="w-5 h-5 bg-white rounded-full"></span>
          </div>
          <span className="text-[11px] text-orca-blue font-mono tracking-[0.25em] uppercase font-bold">
            Project ORCA • SIH26176
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white uppercase font-sans">
            Marine Ecosystem Reasoning
            <span className="block text-2xl sm:text-3xl text-muted-orca font-light mt-1 font-sans">
              with Collaborative Agents
            </span>
          </h1>
        </div>

        <p className="text-sm sm:text-base text-[#a4c2f4] max-w-2xl mx-auto leading-relaxed">
          ORCA is an oceanographic AI and maritime intelligence platform establishing real-time multi-sensor fusion, Potential Fishing Zone (PFZ) advisory, and maritime boundary warning models.
        </p>

        {/* Primary action */}
        <div className="pt-4">
          <Link
            href="/research"
            className="inline-flex items-center space-x-2 bg-orca-blue hover:bg-[#085ae6] text-white text-sm font-bold uppercase tracking-wider px-6 py-3.5 rounded-lg border border-[#2b7bf5] shadow-lg transition-all active:scale-95 group font-mono"
          >
            <span>Launch Research Console</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Highlight sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-3xl text-left">
          <div className="bg-[#0b1f3a]/80 border border-[#1b3459] p-5 rounded-lg">
            <Compass className="w-6 h-6 text-orca-blue mb-3" />
            <h3 className="text-xs font-bold font-mono text-white uppercase">Oceanographic Explorer</h3>
            <p className="text-[11px] text-muted-orca mt-1 leading-normal font-sans">
              Explore sea surface temperature profiles, chlorophyll gradients, ocean salinity and dynamic vector currents.
            </p>
          </div>

          <div className="bg-[#0b1f3a]/80 border border-[#1b3459] p-5 rounded-lg">
            <Cpu className="w-6 h-6 text-[#16834B] mb-3" />
            <h3 className="text-xs font-bold font-mono text-white uppercase">Collaborative AI Reasoning</h3>
            <p className="text-[11px] text-muted-orca mt-1 leading-normal font-sans">
              Ask ORCA questions to generate multi-sensor data consensus validations and trace historical provenance paths.
            </p>
          </div>

          <div className="bg-[#0b1f3a]/80 border border-[#1b3459] p-5 rounded-lg">
            <Shield className="w-6 h-6 text-[#D98200] mb-3" />
            <h3 className="text-xs font-bold font-mono text-white uppercase">Geospatial Boundaries</h3>
            <p className="text-[11px] text-muted-orca mt-1 leading-normal font-sans">
              Monitor Indian EEZ buffers, restricted naval waterways, Marine Protected Areas, and safety warning protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
