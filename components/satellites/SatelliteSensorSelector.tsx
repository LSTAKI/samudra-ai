'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { SensorCategory } from '@/types/satellite';
import { Radio, Eye, Waves, Compass, Activity, CloudRain } from 'lucide-react';

export default function SatelliteSensorSelector() {
  const { selectedSensorCategory, setSelectedSensorCategory } = useOrcaStore();

  const categories: { id: SensorCategory; label: string; icon: any }[] = [
    { id: 'ALL', label: 'ALL SENSORS', icon: Radio },
    { id: 'VISIBLE_INFRARED', label: 'VIS / INFRARED', icon: Eye },
    { id: 'OCEAN_COLOUR', label: 'OCEAN COLOUR', icon: Activity },
    { id: 'MICROWAVE', label: 'MICROWAVE SCAT', icon: Waves },
    { id: 'ALTIMETRY', label: 'RADAR ALTIMETRY', icon: Compass },
    { id: 'METEOROLOGICAL', label: 'METEOROLOGICAL', icon: CloudRain }
  ];

  return (
    <div className="space-y-1.5 select-none">
      <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono">
        SENSOR CATEGORIES
      </h3>
      <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedSensorCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedSensorCategory(cat.id)}
              className={`flex items-center space-x-1.5 p-1.5 rounded border text-left transition-all ${
                isSelected
                  ? 'bg-ocean-navy text-white border-ocean-navy font-bold shadow-xs'
                  : 'bg-white text-secondary-text border-border-orca hover:bg-secondary-surface'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="truncate">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
