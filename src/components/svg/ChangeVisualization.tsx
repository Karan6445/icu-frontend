import React from 'react';
import { ChangeEvent } from '../../types/clinical';
import { DataQualityBadge } from '../common/DataQualityBadge';
import { TrendingDown, TrendingUp, Minus, AlertCircle, Clock, HardDrive } from 'lucide-react';
import { PatientTrend } from './PatientTrend';

interface ChangeVisualizationProps {
  change: ChangeEvent;
}

export const ChangeVisualization: React.FC<ChangeVisualizationProps> = ({ change }) => {
  const getDirectionDetails = () => {
    switch (change.direction) {
      case 'UP':
        return {
          icon: TrendingUp,
          color: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900'
        };
      case 'DOWN':
        return {
          icon: TrendingDown,
          color: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-900'
        };
      default:
        return {
          icon: Minus,
          color: 'text-slate-600 dark:text-slate-400',
          badge: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
        };
    }
  };

  const details = getDirectionDetails();
  const IconComp = details.icon;

  const sparklineData = change.direction === 'DOWN' 
    ? [97, 96, 96, 95, 94, 93, 91]
    : [82, 85, 88, 92, 98, 101, 104];

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-clinical-sm hover:shadow-clinical-md transition-all bg-white dark:bg-slate-900 space-y-3 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${details.badge}`}>
            {change.category}
          </span>
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-sans">{change.parameterName}</h4>
        </div>
        <DataQualityBadge quality={change.quality} size="sm" />
      </div>

      {/* Professional Diff Viewer Card: BEFORE 97% ↓ AFTER 91% */}
      <div className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="col-span-4 text-center">
          <span className="text-[9px] uppercase font-bold text-slate-400 block">BEFORE</span>
          <div className="text-2xl font-black text-slate-600 dark:text-slate-300">
            {change.beforeValue} <span className="text-xs font-sans font-normal text-slate-400">{change.unit}</span>
          </div>
        </div>

        <div className="col-span-4 flex flex-col items-center justify-center">
          <div className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-bold bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            <IconComp className="w-4 h-4" />
            <span>{change.changeDelta}</span>
          </div>
          <span className="text-[9px] text-slate-400 mt-1">{change.durationMinutes}m sustained</span>
        </div>

        <div className="col-span-4 text-center">
          <span className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400 block">AFTER</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {change.afterValue} <span className="text-xs font-sans font-normal text-slate-400">{change.unit}</span>
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="bg-slate-950 p-2 rounded-lg">
        <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1">
          <span>Baseline Shift Velocity</span>
          <span>Timestamp: {change.timestamp}</span>
        </div>
        <PatientTrend data={sparklineData} color={change.direction === 'DOWN' ? '#dc2626' : '#ea580c'} height={28} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
        <span className="truncate max-w-[220px]">Source: {change.sourceDevice}</span>
        <span>Duration: {change.durationMinutes} min</span>
      </div>
    </div>
  );
};
