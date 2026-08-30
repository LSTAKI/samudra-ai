'use client';

import React from 'react';
import { DemoVessel } from '@/types/command';
import { Navigation2 } from 'lucide-react';

interface Props {
  vessel: DemoVessel;
}

export default function VesselMarker({ vessel }: Props) {
  return (
    <div className="flex flex-col items-center group cursor-pointer select-none">
      <div
        style={{ transform: `rotate(${vessel.heading}deg)` }}
        className="w-4 h-4 rounded-full bg-ocean-navy border border-white shadow-xs flex items-center justify-center text-white"
      >
        <Navigation2 className="w-2.5 h-2.5 fill-white text-white" />
      </div>
      <div className="hidden group-hover:flex flex-col items-center mt-1 bg-ocean-navy/95 text-white font-mono text-[8px] px-1.5 py-0.5 rounded border border-[#1b3459] shadow whitespace-nowrap z-30 pointer-events-none">
        <span className="font-bold">{vessel.name}</span>
        <span className="text-muted-orca">
          {vessel.speedKnots} kn · {vessel.heading}° · DEMO
        </span>
      </div>
    </div>
  );
}
