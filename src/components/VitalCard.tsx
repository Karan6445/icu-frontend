import React from 'react';
import { VitalMetric } from '../types/icu';
import { Badge } from './ui/Badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface VitalCardProps {
  title: string;
  metric: VitalMetric;
  normalRange?: string;
  isCritical?: boolean;
}

export const VitalCard: React.FC<VitalCardProps> = ({
  title,
  metric,
  normalRange,
  isCritical = false
}) => {
  const isUp = metric.trend === 'UP';
  const isDown = metric.trend === 'DOWN';

  return (
    <div className={`bg-white rounded-lg p-3.5 border transition-all ${
      isCritical ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-slate-700 tracking-tight uppercase">{title}</span>
        <Badge variant={metric.quality === 'LIVE' ? 'live' : metric.quality === 'STALE' ? 'stale' : 'delayed'} pulse={metric.quality === 'LIVE'}>
          {metric.quality}
        </Badge>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-bold font-mono tracking-tight ${isCritical ? 'text-red-700' : 'text-slate-900'}`}>
            {metric.value}
          </span>
          <span className="text-xs text-slate-500 font-medium">{metric.unit}</span>
        </div>

        {metric.previousValue !== undefined && (
          <div className="flex items-center gap-0.5 text-xs text-slate-500 font-medium">
            {isUp && <TrendingUp className="w-3.5 h-3.5 text-red-600" />}
            {isDown && <TrendingDown className="w-3.5 h-3.5 text-blue-600" />}
            {!isUp && !isDown && <Minus className="w-3.5 h-3.5 text-slate-400" />}
            <span>{metric.previousValue}</span>
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span>{metric.source}</span>
        <span>{metric.timestamp}</span>
      </div>
    </div>
  );
};
