import React from 'react';
import { ClinicalStatus } from '../../types/observation';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: ClinicalStatus | 'CRITICAL' | 'HIGH' | 'ROUTINE' | 'STABLE';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getConfig = () => {
    switch (status) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          icon: AlertCircle,
          label: 'CRITICAL',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-600',
          icon: AlertTriangle,
          label: 'HIGH PRIORITY',
        };
      case 'ROUTINE':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-600',
          icon: Info,
          label: 'ROUTINE',
        };
      case 'STABLE':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-600',
          icon: CheckCircle2,
          label: 'STABLE',
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  }[size];

  return (
    <span className={`inline-flex items-center tracking-wide rounded-md border ${config.bg} ${sizeClasses}`}>
      <IconComponent className="w-3.5 h-3.5 stroke-[2.5]" />
      <span>{config.label}</span>
    </span>
  );
};
