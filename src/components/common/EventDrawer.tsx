import React from 'react';
import { ClinicalEvent, ChangeEvent } from '../../types/clinical';
import { DataQualityBadge } from './DataQualityBadge';
import { X, ShieldCheck, ExternalLink, Activity, Clock, HardDrive, UserCheck } from 'lucide-react';

interface EventDrawerProps {
  event: ClinicalEvent | ChangeEvent | null;
  onClose: () => void;
}

export const EventDrawer: React.FC<EventDrawerProps> = ({ event, onClose }) => {
  if (!event) return null;

  const isChange = 'beforeValue' in event;
  const title = isChange ? event.parameterName : event.title;
  const quality = isChange ? event.quality : event.dataQuality;
  const sourceDevice = isChange ? event.sourceDevice : (event.sourceDevice || 'Bedside Monitor Gateway');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                    Event Provenance & Explainability
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Source verification and raw telemetry log
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Event Details */}
            <div className="space-y-5 text-xs font-sans">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Event Title
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{title}</h4>
              </div>

              {isChange ? (
                /* Delta change card */
                <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 font-mono">
                  <span className="text-[10px] text-slate-400 block font-bold">PARAMETER SHIFT DELTA</span>
                  <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                    {event.beforeValue} {event.unit} → {event.afterValue} {event.unit} ({event.changeDelta})
                  </div>
                  <div className="text-[11px] text-slate-500 font-sans">
                    Sustained duration: <strong>{event.durationMinutes} minutes</strong>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    Description & Clinical Context
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 mt-1 leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Timestamp & Quality Metadata */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">Source Timestamp</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{event.timestamp}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Data Quality</span>
                  <DataQualityBadge quality={quality} size="sm" />
                </div>
              </div>

              {/* Source Device */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Source Bedside Device
                </span>
                <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/60 p-3 rounded-xl border border-teal-200 dark:border-teal-900 font-mono mt-1">
                  <HardDrive className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span className="truncate">{sourceDevice}</span>
                </div>
              </div>

              {'author' in event && event.author && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                    Authorized Clinician / Author
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 mt-1 font-medium">
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>{event.author}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors"
            >
              Close Explainability Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
