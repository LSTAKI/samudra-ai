'use client';

import React from 'react';
import { useOrcaStore } from '@/stores/useOrcaStore';
import { SatelliteProductCategory } from '@/types/satellite';
import { Thermometer, Activity, Droplets, Waves, Wind, Layers } from 'lucide-react';

export default function SatelliteProductSelector() {
  const { selectedProductFilter, setSelectedProductFilter } = useOrcaStore();

  const products: {
    id: SatelliteProductCategory;
    label: string;
    icon: any;
    relatedL4: string;
  }[] = [
    { id: 'ALL', label: 'ALL PRODUCTS', icon: Layers, relatedL4: 'All Products' },
    { id: 'SST', label: 'SEA SURFACE TEMP', icon: Thermometer, relatedL4: 'Copernicus OSTIA L4' },
    { id: 'CHLOROPHYLL', label: 'CHLOROPHYLL-a', icon: Activity, relatedL4: 'Copernicus BGC L4' },
    { id: 'SEA_LEVEL', label: 'SEA LEVEL / SLA', icon: Droplets, relatedL4: 'Copernicus DUACS L4' },
    { id: 'WIND_WAVES', label: 'WIND & WAVES', icon: Waves, relatedL4: 'Copernicus WAV L4' }
  ];

  return (
    <div className="space-y-1.5 select-none">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold text-secondary-text tracking-wider uppercase font-mono">
          TARGET PRODUCTS
        </h3>
        <span className="text-[9px] font-mono text-muted-orca">FILTER</span>
      </div>

      <div className="space-y-1">
        {products.map((prod) => {
          const Icon = prod.icon;
          const isSelected = selectedProductFilter === prod.id;

          return (
            <button
              key={prod.id}
              type="button"
              onClick={() => setSelectedProductFilter(prod.id)}
              className={`w-full flex items-center justify-between p-1.5 rounded border text-left font-mono text-[9px] transition-all ${
                isSelected
                  ? 'border-orca-blue bg-blue-50/30 font-bold text-orca-blue shadow-xs'
                  : 'border-border-orca bg-white hover:bg-secondary-surface text-secondary-text'
              }`}
            >
              <div className="flex items-center space-x-1.5">
                <Icon className={`w-3 h-3 ${isSelected ? 'text-orca-blue' : 'text-secondary-text'}`} />
                <span>{prod.label}</span>
              </div>
              <span className="text-[8px] text-muted-orca font-normal">
                {prod.id !== 'ALL' ? `L4: ${prod.relatedL4}` : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
