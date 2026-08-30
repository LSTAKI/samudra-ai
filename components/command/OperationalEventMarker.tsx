'use client';

import React from 'react';
import {
  OperationalSeverity,
  OperationalEventCategory
} from '@/types/command';
import {
  AlertTriangle,
  ShieldAlert,
  Compass,
  Target,
  Radio,
  Server,
  Activity
} from 'lucide-react';

interface Props {
  category: OperationalEventCategory;
  severity: OperationalSeverity;
  isSelected?: boolean;
}

export default function OperationalEventMarker({
  category,
  severity,
  isSelected
}: Props) {
  const getSeverityColors = (sev: OperationalSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return { bg: 'bg-[#DC2626]', ring: 'ring-[#DC2626]/40', border: 'border-[#DC2626]' };
      case 'HIGH':
        return { bg: 'bg-[#D97706]', ring: 'ring-[#D97706]/40', border: 'border-[#D97706]' };
      case 'MEDIUM':
        return { bg: 'bg-[#EAB308]', ring: 'ring-[#EAB308]/40', border: 'border-[#EAB308]' };
      case 'LOW':
        return { bg: 'bg-[#2563EB]', ring: 'ring-[#2563EB]/40', border: 'border-[#2563EB]' };
      case 'INFO':
      default:
        return { bg: 'bg-[#64748B]', ring: 'ring-[#64748B]/40', border: 'border-[#64748B]' };
    }
  };

  const getCategoryIcon = (cat: OperationalEventCategory) => {
    switch (cat) {
      case 'MARITIME SAFETY':
        return <ShieldAlert className="w-2.5 h-2.5 text-white" />;
      case 'BOUNDARY':
        return <AlertTriangle className="w-2.5 h-2.5 text-white" />;
      case 'ENVIRONMENTAL':
        return <Activity className="w-2.5 h-2.5 text-white" />;
      case 'PFZ':
        return <Target className="w-2.5 h-2.5 text-white" />;
      case 'SATELLITE':
        return <Radio className="w-2.5 h-2.5 text-white" />;
      case 'SYSTEM':
      default:
        return <Server className="w-2.5 h-2.5 text-white" />;
    }
  };

  const colors = getSeverityColors(severity);

  return (
    <div
      className={`w-5 h-5 rounded-full ${colors.bg} border-2 border-white shadow-md flex items-center justify-center transition-transform ${
        isSelected ? 'scale-125 ring-4 ' + colors.ring : 'hover:scale-110'
      }`}
    >
      {getCategoryIcon(category)}
    </div>
  );
}
