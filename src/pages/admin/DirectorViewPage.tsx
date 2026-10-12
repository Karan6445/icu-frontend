import React from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  Stethoscope,
  ShieldCheck,
  Mail,
  Phone,
  Award,
  Calendar,
  Building2,
  Lock,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export const DirectorViewPage: React.FC = () => {
  const { director, hospitalName, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Prominent Read-Only Lock Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-rose-900 border-2 border-rose-500 rounded-2xl p-5 shadow-xl text-white flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-200 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-400/40">
                VIEW ONLY RESOURCE
              </span>
              <span className="text-xs font-mono text-rose-100">Hospital Admin Restricted</span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-0.5">
              Director details cannot be edited, modified, or transferred by Hospital Admin.
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-white bg-slate-950/80 px-4 py-2 rounded-xl border border-rose-500/30">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Governance Policy: Strictly Read-Only</span>
        </div>
      </div>

      {/* Main Director Profile Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-8 shadow-sm space-y-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 dark:border-slate-700 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-teal-700 text-white flex items-center justify-center text-3xl font-black shadow-lg border-2 border-teal-500">
              DR
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs font-mono font-bold bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-400/30 px-3 py-0.5 rounded-full">
                  Employee ID: {director.employeeId}
                </span>
                <span className="text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/30 px-3 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {director.status}
                </span>
              </div>

              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{director.name}</h1>
              <p className="text-teal-700 dark:text-teal-300 text-sm font-semibold">{director.designation}</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">{director.department}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl font-mono text-xs space-y-1.5 min-w-[240px]">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Assigned Hospital</span>
            <div className="text-slate-900 dark:text-white font-bold text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> {director.hospitalName}
            </div>
            <span className="text-teal-700 dark:text-teal-400 font-bold block">Hospital Code: {director.hospitalId}</span>
          </div>
        </div>

        {/* Detailed Grid Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 text-xs font-mono font-bold uppercase">
              <Award className="w-4 h-4" /> Medical Qualifications
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-sm">{director.qualification}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Specialized in Critical Care & ICU Governance</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 text-xs font-mono font-bold uppercase">
              <Calendar className="w-4 h-4" /> Clinical Experience
            </div>
            <p className="text-slate-900 dark:text-white font-bold text-sm">{director.experienceYears} Years Experience</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Assigned since: {director.assignedDate}</p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 p-5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 text-xs font-mono font-bold uppercase">
              <UserCheck className="w-4 h-4" /> Contact Information
            </div>
            <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300 font-mono">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{director.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{director.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Biography Section */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70 p-6 rounded-xl space-y-2">
          <h3 className="text-sm font-mono font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider">
            Clinical Leadership & Governance Overview
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
            {director.bio}
          </p>
        </div>

        {/* Governance Notice Banner */}
        <div className="bg-rose-50 dark:bg-slate-950 p-4 rounded-xl border border-rose-300 dark:border-rose-500/30 flex items-center justify-between text-xs font-mono text-slate-700 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Notice: Read-Only restriction enforced by state platform policy. No edit/delete operations available.</span>
          </div>
          <span className="text-rose-700 dark:text-rose-400 font-bold uppercase">STATUS: READ-ONLY</span>
        </div>
      </div>
    </div>
  );
};
