import React from 'react';
import { TimelineItem } from '../types/icu';
import { StatusBadge } from './StatusBadge';
import { Activity, Stethoscope, Syringe, FileText, AlertCircle, Clock } from 'lucide-react';

interface TimelineEventProps {
  event: TimelineItem;
  onSelect?: (event: TimelineItem) => void;
}

export const TimelineEvent: React.FC<TimelineEventProps> = ({ event, onSelect }) => {
  const getIcon = () => {
    switch (event.type) {
      case 'VITALS':
        return <Activity className="w-4 h-4 text-blue-700" />;
      case 'VENTILATOR':
        return <Stethoscope className="w-4 h-4 text-cyan-700" />;
      case 'INFUSION':
        return <Syringe className="w-4 h-4 text-purple-700" />;
      case 'NOTES':
        return <FileText className="w-4 h-4 text-emerald-700" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-700" />;
    }
  };

  return (
    <div
      onClick={() => onSelect && onSelect(event)}
      className="bg-white rounded-lg border border-slate-200 p-3.5 hover:border-blue-300 transition-all cursor-pointer shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-slate-100 border border-slate-200 shrink-0">
            {getIcon()}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900">{event.title}</h4>
            {event.author && (
              <span className="text-[11px] text-slate-500 font-medium">
                By: {event.author} ({event.authorRole || 'Staff'})
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-medium text-slate-600 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {event.timestamp}
          </span>
          <StatusBadge status={event.quality} type="quality" />
        </div>
      </div>

      <p className="text-xs text-slate-700 mt-2 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
        {event.description}
      </p>

      <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <span>Source: {event.source}</span>
        <span>Rx: {event.receivedTimestamp}</span>
      </div>
    </div>
  );
};
