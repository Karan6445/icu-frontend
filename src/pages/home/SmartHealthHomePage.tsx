import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  Radio,
  Video,
  Clock,
  HeartPulse,
  Lock,
  ChevronRight,
  Sparkles,
  Zap,
  BedDouble,
  CalendarCheck
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { DevRoleSwitcher } from '../../components/common/DevRoleSwitcher';
import { getStoredAppointments } from '../../data/mockEclinicData';

export const SmartHealthHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { role, currentUser, permissions, canAccessModule } = useRBAC();

  const isIcuAllowed = canAccessModule('ICU');
  const isEClinicAllowed = canAccessModule('E_CLINIC');

  const appointments = getStoredAppointments();
  const eclinicWaitingCount = appointments.filter(a => a.status === 'READY_FOR_DOCTOR' || a.status === 'WAITING').length;
  const eclinicTotalCount = appointments.length;

  return (
    <div className="space-y-6 pb-12 select-none animate-in fade-in duration-200">
      {/* ================= HERO HEADER BANNER ================= */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-800/60 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40 text-[11px] font-mono font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>NAIMIFY ENTERPRISE HEALTH MATRIX</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[11px] font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>STATEWIDE GRID ACTIVE</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Naimify Smart Health Platform
            </h1>

            <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
              Unified critical care telemetry and digital outpatient telemedicine portal. Select a module below to launch your authorized clinical workspace.
            </p>
          </div>

          {/* Quick Operator Status Card */}
          <div className="bg-slate-950/70 backdrop-blur-md border border-teal-500/30 rounded-2xl p-4 min-w-[280px] shadow-lg flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono text-teal-200 mb-2">
              <span>ACTIVE CLINICAL OPERATOR</span>
              <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold border border-teal-400/30">
                {role}
              </span>
            </div>
            <div className="font-extrabold text-white text-sm truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-teal-300/80 truncate mt-0.5">
              {currentUser.specialty || currentUser.department}
            </div>
            <div className="mt-3 pt-2.5 border-t border-teal-900/60 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">WORKSPACE CLEARANCE:</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {permissions.allowedModules.join(' & ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PRIMARY SIBLING MODULES ================= */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Primary Platform Modules</span>
              <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400">
                (Choose Clinical Domain)
              </span>
            </h2>
          </div>
          <span className="text-xs font-mono text-teal-700 dark:text-teal-400 font-bold">
            Role: {role}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ================= MODULE 1: SMART ICU ================= */}
          <div
            className={`group relative rounded-3xl border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xl ${
              isIcuAllowed
                ? 'bg-gradient-to-br from-white via-teal-50/20 to-slate-50 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-900 border-teal-600/30 dark:border-teal-700/50 hover:shadow-2xl hover:border-teal-500 hover:-translate-y-1 cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
            }`}
            onClick={() => {
              if (isIcuAllowed) navigate('/command-center');
            }}
          >
            {/* Top Accent Icon & Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600/10 dark:bg-teal-500/20 border border-teal-500/40 text-teal-700 dark:text-teal-300 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-2xl">🏥</span>
              </div>

              <div className="flex items-center gap-2">
                {isIcuAllowed ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>24 LIVE BEDS</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>ICU Role Required</span>
                  </span>
                )}
              </div>
            </div>

            {/* Content Details */}
            <div className="my-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                <span>Inpatient Critical Care Telemetry</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                Smart ICU Management
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Continuous multipara telemetry, physiological ECG waveform grids, organ dysfunction scoring (SOFA/APACHE II/NEWS2), standardized SBAR shift handovers, and hospital ward node controls.
              </p>

              {/* Feature Pills */}
              <div className="pt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ⚡ 24-Bed Grid & Waveforms
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  📋 SBAR Shift Handover
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  📹 PTZ Camera Feeds
                </span>
              </div>
            </div>

            {/* Launch Action Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <Building2 className="w-3.5 h-3.5" />
                <span>AIIMS / PMCH Network</span>
              </div>

              {isIcuAllowed ? (
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs flex items-center gap-2 shadow-md group-hover:translate-x-1 transition-all"
                >
                  <span>Open ICU</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Restricted</span>
                </span>
              )}
            </div>
          </div>

          {/* ================= MODULE 2: E-CLINIC ================= */}
          <div
            className={`group relative rounded-3xl border transition-all duration-300 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-xl ${
              isEClinicAllowed
                ? 'bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/20 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900 border-emerald-600/30 dark:border-emerald-700/50 hover:shadow-2xl hover:border-emerald-500 hover:-translate-y-1 cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
            }`}
            onClick={() => {
              if (isEClinicAllowed) navigate('/eclinic');
            }}
          >
            {/* Top Accent Icon & Badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-2xl">🩺</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{eclinicWaitingCount} IN QUEUE</span>
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="my-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                <span>Outpatient Digital Care & Telemedicine</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                E-Clinic Digital OPD
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                Full-cycle outpatient telemedicine with rapid patient intake, token queue management, digital vitals capture, doctor video consultation, SOAP clinical notes, e-prescriptions, and hospital referrals.
              </p>

              {/* Feature Pills */}
              <div className="pt-3 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  🎟️ Token Queue & Triage
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  📹 Tele-Consultation Console
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  💊 E-Prescription & Formulary
                </span>
              </div>
            </div>

            {/* Launch Action Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{eclinicTotalCount} Today Appointments</span>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md group-hover:translate-x-1 transition-all"
              >
                <span>Open E-Clinic</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= QUICK OPERATIONAL SUMMARY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>CLINIC / FACILITY</span>
            <Building2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-base font-extrabold text-slate-900 dark:text-white mt-1 truncate">
            Patna Central Hub
          </div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-mono mt-0.5">
            Node: ECL-PAT-01 • Online
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>QUEUED FOR CONSULTATION</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {eclinicWaitingCount} Patients
          </div>
          <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono mt-0.5">
            Average Wait: 18 mins
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>ICU CRITICAL SURVEILLANCE</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            4 High Acuity
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            SOFA &gt; 8 Alert Active
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-mono">
            <span>DOCTORS ON TELE-ROSTER</span>
            <Stethoscope className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            3 Online
          </div>
          <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">
            Video Bridge Ready
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartHealthHomePage;
