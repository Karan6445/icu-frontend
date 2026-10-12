import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  History,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  User,
  Building2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const HospitalAdminTimelinePage: React.FC = () => {
  const { timelineEvents, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [selectedPatientId, setSelectedPatientId] = useState<string>('P-1024');
  const [searchQuery, setSearchQuery] = useState('');

  // Timeline stage sequence representation
  const timelineStages = [
    'Registered',
    'Admitted',
    'Bed Assigned',
    'Doctor Assigned',
    'Nurse Assigned',
    'Encounters',
    'Remarks',
    'Follow-up',
    'Discharge'
  ];

  const filteredEvents = timelineEvents.filter(ev => {
    const matchesPatient = ev.patientId === selectedPatientId || selectedPatientId === 'ALL';
    const matchesSearch =
      ev.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.user.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPatient && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-200 dark:border-teal-800">
              Patient Clinical Journey ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only Patient Audit Visualizer
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <History className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Patient Clinical Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sequential audit history from Registration to Admission, Bed/Doctor/Nurse assignment, Encounters, Remarks, Follow-up & Discharge.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-mono">
          <span className="text-slate-600 dark:text-slate-400 font-bold">Select Patient:</span>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="bg-white dark:bg-slate-800 text-slate-900 dark:text-teal-300 font-bold border border-slate-300 dark:border-slate-700 rounded px-2 py-1 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Patients</option>
            <option value="P-1024">P-1024 (Ramesh Sundaram)</option>
            <option value="P-1025">P-1025 (Savita Devi)</option>
            <option value="P-1033">P-1033 (Harish Chandra)</option>
            <option value="P-1041">P-1041 (Deepak Merchant)</option>
          </select>
        </div>
      </div>

      {/* Visual Lifecycle Stepper Pipeline */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Clinical Progression Workflow Pipeline
        </h3>

        <div className="overflow-x-auto pb-2">
          <div className="flex items-center gap-2 min-w-[900px]">
            {timelineStages.map((stage, idx) => {
              const stageEvent = timelineEvents.find(
                e => e.patientId === selectedPatientId && e.event === stage
              );
              const isDone = !!stageEvent && stageEvent.status === 'COMPLETED';
              const isInProgress = !!stageEvent && stageEvent.status === 'IN_PROGRESS';

              return (
                <React.Fragment key={stage}>
                  <div
                    className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                      isDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500/50 text-emerald-800 dark:text-emerald-300'
                        : isInProgress
                        ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 dark:border-amber-500/50 text-amber-800 dark:text-amber-300 animate-pulse'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider block">
                      Stage {idx + 1}
                    </div>
                    <span className="text-xs font-extrabold block mt-0.5">{stage}</span>
                    <span className="text-[9px] font-mono block mt-1">
                      {isDone ? 'COMPLETED' : isInProgress ? 'IN PROGRESS' : 'PENDING'}
                    </span>
                  </div>
                  {idx < timelineStages.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Timeline Events Feed */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Detailed Audit Timeline Trail (Patient ID: {selectedPatientId})
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing {filteredEvents.length} Recorded Milestone Events
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-teal-500/30">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="relative group">
              {/* Timeline Marker Bullet */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-teal-500 text-teal-600 dark:text-teal-300 flex items-center justify-center text-[10px] shadow-xs">
                ✓
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-4 space-y-2 hover:border-teal-500/40 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{ev.event}</span>
                    <span className="text-[10px] font-mono bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                      {ev.id}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{ev.timestamp}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                  {ev.details}
                </p>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Triggered By: <strong className="text-teal-700 dark:text-teal-300">{ev.user}</strong> ({ev.role})</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    ev.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                  }`}>
                    {ev.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
