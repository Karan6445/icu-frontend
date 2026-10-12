import React, { useState } from 'react';
import { MOCK_CLINICAL_EVENTS } from '../../data/mockObservations';
import { ClinicalEvent, ChangeEvent } from '../../types/clinical';
import { EventDrawer } from '../common/EventDrawer';
import { Activity, FileText, Syringe, Wind, TestTube, Clock } from 'lucide-react';

export const ClinicalTimeline: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<ClinicalEvent | ChangeEvent | null>(null);
  const [timeScale, setTimeScale] = useState<'1h' | '4h' | '12h' | '24h'>('24h');

  // Dynamic time markers depending on selected time scale
  const getTimeMarkers = () => {
    switch (timeScale) {
      case '1h':
        return ['12:00', '12:10', '12:20', '12:30', '12:40', '12:50', '13:00'];
      case '4h':
        return ['09:00', '09:40', '10:20', '11:00', '11:40', '12:20', '13:00'];
      case '12h':
        return ['01:00', '03:00', '05:00', '07:00', '09:00', '11:00', '13:00'];
      case '24h':
      default:
        return ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
    }
  };

  const timeMarkers = getTimeMarkers();

  const categories = [
    { name: 'VITALS', icon: Activity, color: '#991B1B' },
    { name: 'VENTILATOR', icon: Wind, color: '#1E3A8A' },
    { name: 'INFUSION', icon: Syringe, color: '#D97706' },
    { name: 'LABS', icon: TestTube, color: '#166534' },
    { name: 'EVENTS', icon: FileText, color: '#64748B' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-clinical-md p-6 relative overflow-hidden transition-colors">
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6 gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1E3A8A] dark:text-white flex items-center gap-2 font-mono">
            Physiological Trend Timeline
            <span className="text-xs bg-blue-50 dark:bg-slate-800 text-[#1E3A8A] dark:text-blue-300 px-2.5 py-0.5 rounded font-normal font-sans">
              Retrospective Window: {timeScale}
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Continuous telemetry and discrete clinical interventions aligned on a synchronized retrospective time scale.
          </p>
        </div>

        {/* Retrospective Variable Time Scale Selector */}
        <div className="flex items-center gap-1 bg-[#F1F5F9] dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono font-semibold">
          <span className="text-[10px] text-slate-400 px-2 flex items-center gap-1 font-sans">
            <Clock className="w-3.5 h-3.5" /> Time Scale:
          </span>
          {(['1h', '4h', '12h', '24h'] as const).map((scale) => (
            <button
              key={scale}
              onClick={() => setTimeScale(scale)}
              className={`px-3 py-1 rounded-lg transition-all ${
                timeScale === scale
                  ? 'bg-[#1E3A8A] text-white font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {scale}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[850px] relative">
          {/* Master Horizontal Time Axis Header */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 ml-44 font-mono text-xs text-slate-500 dark:text-slate-400 font-bold text-center">
            {timeMarkers.map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>

          {/* Separate Clinical Lanes */}
          <div className="space-y-6 relative">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div key={cat.name} className="flex items-center relative group">
                  <div className="w-44 flex items-center gap-2 pr-4 text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: cat.color }}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </div>
                    <span>{cat.name}</span>
                  </div>

                  <div className="flex-1 relative h-10 bg-[#F8FAFC] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center px-4">
                    <div className="absolute inset-x-0 h-0.5 bg-slate-200 dark:bg-slate-700" />

                    {/* Plotted Interactive Event Nodes */}
                    {idx === 0 && (
                      <button
                        onClick={() => setSelectedEvent(MOCK_CLINICAL_EVENTS[0])}
                        className="absolute left-[88%] -translate-x-1/2 w-7 h-7 rounded-full bg-[#991B1B] text-white flex items-center justify-center font-bold text-xs shadow-lg hover:scale-125 transition-transform animate-pulse border-2 border-white z-10 font-mono"
                      >
                        !
                      </button>
                    )}

                    {idx === 1 && (
                      <button
                        onClick={() => setSelectedEvent(MOCK_CLINICAL_EVENTS[1])}
                        className="absolute left-[82%] -translate-x-1/2 px-3 py-1 rounded-full bg-[#1E3A8A] text-white text-[11px] font-mono shadow hover:scale-105 transition-transform flex items-center gap-1 z-10"
                      >
                        <Wind className="w-3 h-3" />
                        PEEP ↑10 / FiO2 60%
                      </button>
                    )}

                    {idx === 2 && (
                      <button
                        onClick={() => setSelectedEvent(MOCK_CLINICAL_EVENTS[3])}
                        className="absolute left-[80%] -translate-x-1/2 px-3 py-1 rounded-full bg-[#D97706] text-white text-[11px] font-mono shadow hover:scale-105 transition-transform flex items-center gap-1 z-10"
                      >
                        <Syringe className="w-3 h-3" />
                        Norepi ↑0.08
                      </button>
                    )}

                    {idx === 3 && (
                      <button
                        onClick={() => setSelectedEvent(MOCK_CLINICAL_EVENTS[2])}
                        className="absolute left-[75%] -translate-x-1/2 px-3 py-1 rounded-full bg-[#166534] text-white text-[11px] font-mono shadow hover:scale-105 transition-transform flex items-center gap-1 z-10"
                      >
                        <TestTube className="w-3 h-3" />
                        ABG: PaO2 64 (Low)
                      </button>
                    )}

                    {idx === 4 && (
                      <button
                        onClick={() => setSelectedEvent(MOCK_CLINICAL_EVENTS[5])}
                        className="absolute left-[35%] -translate-x-1/2 px-3 py-1 rounded-full bg-[#64748B] text-white text-[11px] font-mono shadow hover:scale-105 transition-transform flex items-center gap-1 z-10"
                      >
                        <FileText className="w-3 h-3" />
                        Rounds Note (Dr. Roy)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Smooth Right-Side Event Drawer */}
      <EventDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};
