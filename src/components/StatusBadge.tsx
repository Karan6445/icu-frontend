import React from 'react';
import { DataQuality, ClinicalStatus } from '../types/icu';

interface StatusBadgeProps {
  status: DataQuality | ClinicalStatus | string;
  type?: 'quality' | 'clinical';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'quality' }) => {
  if (type === 'quality') {
    switch (status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            LIVE
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600"></span>
            DELAYED
          </span>
        );
      case 'STALE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-300">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-600"></span>
            STALE
          </span>
        );
      case 'DISCONNECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-800 border border-red-300">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600"></span>
            DISCONNECTED
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">{status}</span>;
    }
  }

  // Clinical Status
  switch (status) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-900 border border-red-300">
          ● CRITICAL
        </span>
      );
    case 'WARNING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
          ▲ WARNING
        </span>
      );
    case 'STABLE':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-900 border border-emerald-300">
          ✓ STABLE
        </span>
      );
    default:
      return <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700">{status}</span>;
  }
};
