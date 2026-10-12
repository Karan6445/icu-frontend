import React from 'react';
import { DataQuality } from '../../types/observation';
import { Activity, Clock, AlertTriangle, WifiOff } from 'lucide-react';

interface DataQualityBadgeProps {
  quality: DataQuality;
  lastUpdate?: string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
}

export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({
  quality,
  lastUpdate,
  size = 'md',
  showDescription = false,
}) => {
  const getConfig = () => {
    switch (quality) {
      case 'LIVE':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          dot: 'bg-emerald-500 animate-live-pulse',
          icon: Activity,
          label: 'LIVE',
        };
      case 'DELAYED':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
          icon: Clock,
          label: 'DELAYED',
        };
      case 'STALE':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
          icon: AlertTriangle,
          label: 'STALE',
        };
      case 'DISCONNECTED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          icon: WifiOff,
          label: 'DISCONNECTED',
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }[size];

  return (
    <div
      className={`inline-flex items-center font-mono font-semibold tracking-wider rounded border ${config.bg} ${sizeClasses}`}
      title={`Data Quality: ${config.label}${lastUpdate ? ` (Updated: ${lastUpdate})` : ''}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <IconComponent className="w-3 h-3 stroke-[2.5]" />
      <span>{config.label}</span>
      {lastUpdate && <span className="opacity-75 text-[10px] font-sans">· {lastUpdate}</span>}
      {showDescription && quality !== 'LIVE' && (
        <span className="ml-1 text-[10px] italic font-sans opacity-90">(Verify Source)</span>
      )}
    </div>
  );
};
