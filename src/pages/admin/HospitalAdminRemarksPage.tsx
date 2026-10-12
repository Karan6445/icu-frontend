import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  Lock,
  Search,
  Filter,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  FileText,
  User,
  Clock,
  AlertTriangle
} from 'lucide-react';

export const HospitalAdminRemarksPage: React.FC = () => {
  const { remarks, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [roleTab, setRoleTab] = useState<'ALL' | 'DOCTOR' | 'NURSE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRemarks = remarks.filter(rem => {
    const matchesRole = roleTab === 'ALL' || rem.authorRole === roleTab;
    const matchesSearch =
      rem.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rem.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rem.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rem.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header Lock Banner */}
      <div className="bg-gradient-to-r from-rose-50 via-white to-rose-50 dark:from-rose-950 dark:via-slate-900 dark:to-rose-950 border-2 border-rose-300 dark:border-rose-500/50 rounded-2xl p-6 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-400/40 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold rounded border border-rose-300 dark:border-rose-500/30">
                  LOCKED CLINICAL DECISIONS ({hospitalCode})
                </span>
                <span className="px-2.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                  State Governance Restriction
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                Doctor & Nurse Clinical Remarks (Read-Only Hub)
              </h1>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-500/30 font-mono text-xs text-rose-800 dark:text-rose-300 font-bold flex items-center gap-2 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Strict Read-Only Restriction Enforced</span>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-sans max-w-4xl">
          Clinical evaluations, vitals assessments, and handover notes entered by physicians and nurse leads carry an immutable locked status. Hospital Administrators possess read-only oversight permissions. No Edit or Delete actions are permitted.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
          <button
            onClick={() => setRoleTab('ALL')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              roleTab === 'ALL' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Locked Remarks ({remarks.length})
          </button>
          <button
            onClick={() => setRoleTab('DOCTOR')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              roleTab === 'DOCTOR' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Doctor Remarks ({remarks.filter(r => r.authorRole === 'DOCTOR').length})
          </button>
          <button
            onClick={() => setRoleTab('NURSE')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              roleTab === 'NURSE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Nurse Remarks ({remarks.filter(r => r.authorRole === 'NURSE').length})
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search clinical note, author, patient..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 font-sans"
          />
        </div>
      </div>

      {/* Remarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRemarks.map(rem => (
          <div
            key={rem.id}
            className="bg-white dark:bg-slate-800/90 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-6 shadow-sm space-y-4 relative overflow-hidden"
          >
            {/* Top Bar with Explicit Locked Badge */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    Patient: {rem.patientName} ({rem.patientId})
                  </span>
                  <span className="text-[10px] font-mono text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">
                    {rem.remarkType}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  Remark ID: {rem.id}
                </h3>
              </div>

              <div className="flex flex-col items-end">
                <span className="px-3 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-2 border-rose-300 dark:border-rose-500/50 rounded-full font-mono text-xs font-black tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Lock className="w-3.5 h-3.5" /> LOCKED
                </span>
                <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 mt-0.5">Read-Only Enforced</span>
              </div>
            </div>

            {/* Note Content */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed font-sans italic">
                "{rem.content}"
              </p>
            </div>

            {/* Author & Lock Reason Meta */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {rem.authorRole === 'DOCTOR' ? (
                    <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  ) : (
                    <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  )}
                  <span>Author: <strong className="text-slate-900 dark:text-white">{rem.authorName}</strong> ({rem.authorRole})</span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">{rem.timestamp}</span>
              </div>

              <div className="bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg border border-rose-200 dark:border-rose-500/30 flex items-center justify-between text-[11px] text-rose-800 dark:text-rose-300">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Lock Policy: {rem.lockReason}</span>
                </span>
                <span className="font-bold">NO EDIT / DELETE</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
