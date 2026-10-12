import React from 'react';
import { DataQualityBadge } from './DataQualityBadge';
import { X, ShieldCheck, Activity, HardDrive, Wifi, RefreshCw } from 'lucide-react';

interface DataTrustDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataTrustDrawer: React.FC<DataTrustDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const feeds = [
    { name: 'Mindray BeneVision N22 (Bedside Monitor 07)', type: 'Patient Telemetry (HR, SpO2, BP, Temp)', quality: 'LIVE' as const, latency: '2 sec', status: 'Healthy' },
    { name: 'Hamilton-G5 (Mechanical Ventilator 07)', type: 'Respiratory Telemetry (PEEP, FiO2, Volume)', quality: 'LIVE' as const, latency: '3 sec', status: 'Healthy' },
    { name: 'B. Braun Spaceplus (Smart Infusion Pumps)', type: 'Vasopressor & Sedative Infusions', quality: 'DELAYED' as const, latency: '18 sec', status: 'Buffer Retry' },
    { name: 'Roche cobas b 221 (ABG Analyzer Gateway)', type: 'Arterial Blood Gas & Electrolytes', quality: 'STALE' as const, latency: '7 min', status: 'Timeout Warning' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                    Data Trust & Stream Freshness
                  </h3>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Provenance and telemetry state of all active channels
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

            {/* Core Principle Banner */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              <strong className="text-slate-900 dark:text-white block mb-1 font-mono">Data First. Intelligence Second.</strong>
              Clinicians must never guess telemetry freshness. If network buffer delay or device disconnect occurs, status tags immediately signal potential data staleness.
            </div>

            {/* Stream List */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                Active Bedside Telemetry Streams (Bed 07)
              </span>

              {feeds.map((feed, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-clinical-sm space-y-2 font-mono text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{feed.name}</span>
                    <DataQualityBadge quality={feed.quality} size="sm" />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">{feed.type}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Latency: <strong className="text-slate-700 dark:text-slate-200">{feed.latency}</strong></span>
                    <span>Status: <strong className="text-teal-600 dark:text-teal-400">{feed.status}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400">Gateway GW-MICU-01 · 98.7% Operational</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-lg text-xs hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
