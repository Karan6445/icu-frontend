import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  Building2,
  Users,
  Stethoscope,
  HeartPulse,
  Bed,
  Activity,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Lock,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

export const HospitalAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    hospitalName,
    hospitalCode,
    director,
    doctors,
    nurses,
    icus,
    beds,
    encounters,
    remarks,
    shifts,
    activityLogs
  } = useAppSelector(state => state.hospitalAdmin);

  const totalDoctors = doctors.length;
  const nurseLeads = nurses.filter(n => n.rank === 'NURSE_LEAD').length;
  const totalNurses = nurses.length;
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
  const reservedBeds = beds.filter(b => b.status === 'RESERVED').length;
  const activeEncounters = encounters.filter(e => e.status === 'ACTIVE').length;
  const lockedRemarksCount = remarks.filter(r => r.isLocked).length;

  const occupancyRate = Math.round((occupiedBeds / (totalBeds || 1)) * 100);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans w-full max-w-full overflow-x-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 border border-teal-700 text-white rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="px-3 py-1 bg-teal-500/20 text-teal-200 border border-teal-400/40 text-[11px] sm:text-xs font-mono font-bold rounded-full uppercase tracking-wider">
                Assigned Hospital Command Center
              </span>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[11px] sm:text-xs font-mono font-bold rounded-full">
                Code: {hospitalCode}
              </span>
              <span className="px-3 py-1 bg-rose-500/20 text-rose-200 border border-rose-400/40 text-[11px] sm:text-xs font-mono font-bold rounded-full flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Read-Only Clinical Restrictions Active
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight break-words">
              {hospitalName}
            </h1>
            <p className="text-teal-100/90 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Operational oversight console for ICU capacity, bed map, staff shift management, and administrative date-range reporting.
            </p>
          </div>

          {/* Director Overview Snippet */}
          <div 
            onClick={() => navigate('/admin/director')}
            className="bg-white/10 hover:bg-white/15 backdrop-blur border border-teal-400/30 hover:border-teal-400/50 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 w-full lg:w-auto lg:min-w-[340px] max-w-full shadow-md cursor-pointer transition-all active:scale-[0.99] group shrink-0"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-teal-500/30 border border-teal-300 text-white flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
              <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-teal-200" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider block">
                Chief Medical Director
              </span>
              <h3 className="text-sm font-bold text-white leading-snug">{director.name}</h3>
              <p className="text-xs text-teal-100 leading-tight mt-0.5 font-medium break-words">
                <span className="font-mono text-[11px] text-teal-200 font-semibold">{director.employeeId}</span>
                <span className="mx-1.5 opacity-60">•</span>
                <span>{director.designation.split('&')[0].trim()}</span>
              </p>
            </div>
            <div
              className="p-1.5 sm:p-2 text-teal-200 group-hover:text-white group-hover:bg-teal-500/20 rounded-lg transition-colors shrink-0"
              title="View Director Details (Read-Only)"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Key Performance Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* Total Doctors */}
        <div
          onClick={() => navigate('/admin/doctors')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Medical Doctors</span>
            <Stethoscope className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalDoctors}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across 4 ICU Specialties</p>
        </div>

        {/* Nurse Leads & Nurses */}
        <div
          onClick={() => navigate('/admin/nurse-leads')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">ICU Nursing Staff</span>
            <HeartPulse className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalNurses} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">({nurseLeads} Leads)</span></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Operational Shift Staff</p>
        </div>

        {/* ICUs & Beds */}
        <div
          onClick={() => navigate('/admin/icu-management')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-300 mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">ICU Units</span>
            <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{icus.length} <span className="text-xs font-semibold text-teal-600 dark:text-teal-300">({totalBeds} Beds)</span></div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">MICU, SICU, CICU, NICU</p>
        </div>

        {/* Occupancy Rate */}
        <div
          onClick={() => navigate('/admin/bed-map')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Bed Occupancy</span>
            <Bed className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{occupancyRate}%</div>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 font-mono font-bold">{occupiedBeds} Occupied / {availableBeds} Available</p>
        </div>

        {/* Active Encounters */}
        <div
          onClick={() => navigate('/admin/encounters')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Active Encounters</span>
            <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{activeEncounters}</div>
          <p className="text-xs text-teal-700 dark:text-teal-300 mt-1 font-mono font-semibold">Read-Only View</p>
        </div>

        {/* Locked Remarks */}
        <div
          onClick={() => navigate('/admin/doctor-remarks')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Clinical Remarks</span>
            <Lock className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{lockedRemarksCount} <span className="text-xs font-semibold text-rose-600 dark:text-rose-300">Locked</span></div>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 font-mono font-semibold">Enforced Read-Only</p>
        </div>
      </div>

      {/* ICU Unit Breakdown & Quick Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ICU Units Capacity Overview */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Operational ICU Units ({hospitalCode})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Capacity breakdown, assigned doctors & nurse lead coverage</p>
            </div>
            <button
              onClick={() => navigate('/admin/icu-management')}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white bg-teal-50 dark:bg-teal-500/20 px-3 py-1.5 rounded-lg border border-teal-200 dark:border-teal-500/30 transition-colors"
            >
              Full ICU Details →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {icus.map(icu => {
              const icuOccupancy = Math.round((icu.occupiedBeds / icu.totalBeds) * 100);
              return (
                <div key={icu.id} className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/90 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{icu.name}</h3>
                      <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400">{icu.code} • {icu.floorLocation}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      icuOccupancy > 80
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                    }`}>
                      {icuOccupancy}% Occupied
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        icuOccupancy > 80 ? 'bg-rose-500' : icuOccupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${icuOccupancy}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Occupied</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{icu.occupiedBeds} Beds</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Available</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{icu.availableBeds} Beds</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Reserved</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{icu.reservedBeds} Beds</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Doctor Lead:</span>
                      <span className="font-semibold text-teal-700 dark:text-teal-300">{icu.doctorLeadName}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Nurse Lead:</span>
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">{icu.nurseLeadName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Command Center Action Tiles */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Operational Quick Tiles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct navigation across administrative sections</p>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/admin/reports')}
              className="w-full flex items-center justify-between p-3 bg-teal-50/70 dark:bg-gradient-to-r dark:from-teal-900/40 dark:to-slate-900 border border-teal-200 dark:border-teal-500/30 hover:border-teal-500 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-600 text-white dark:bg-teal-500/20 dark:text-teal-300 rounded-lg">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Custom Date Range Reports</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Date pickers, KPIs & CSV/PDF Export</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/admin/bed-map')}
              className="w-full flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-gradient-to-r dark:from-emerald-900/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-500 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-600 text-white dark:bg-emerald-500/20 dark:text-emerald-300 rounded-lg">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Interactive ICU Bed Map</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Status grid (Available, Occupied, Maintenance)</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/admin/shifts')}
              className="w-full flex items-center justify-between p-3 bg-amber-50/70 dark:bg-slate-900/70 border border-amber-200 dark:border-slate-700/80 hover:border-amber-400 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600 text-white dark:bg-amber-500/20 dark:text-amber-300 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Shift Roster & Schedules</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Daily, Weekly & Monthly calendar views</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 dark:text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/admin/doctor-remarks')}
              className="w-full flex items-center justify-between p-3 bg-rose-50/70 dark:bg-slate-900/70 border border-rose-200 dark:border-slate-700/80 hover:border-rose-400 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-600 text-white dark:bg-rose-500/20 dark:text-rose-300 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Locked Clinical Remarks</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Read-Only doctor & nurse evaluations</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/admin/activity-logs')}
              className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-xl text-left transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-700 text-white dark:bg-teal-500/20 dark:text-teal-300 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Activity History Logs</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Audit trail of all hospital admin actions</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Locked Remarks & Recent Admin Activity Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Remarks */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" /> Recent Locked Clinical Remarks (Read-Only)
            </h3>
            <button
              onClick={() => navigate('/admin/doctor-remarks')}
              className="text-xs text-teal-700 dark:text-teal-300 hover:underline font-mono"
            >
              View All ({remarks.length})
            </button>
          </div>

          <div className="space-y-3">
            {remarks.slice(0, 3).map(rem => (
              <div key={rem.id} className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{rem.patientName}</span>
                    <span className="text-[10px] font-mono bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {rem.patientId}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  "{rem.content}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Author: {rem.authorName} ({rem.authorRole})</span>
                  <span>{rem.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity History */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Admin Activity Log ({hospitalCode})
            </h3>
            <button
              onClick={() => navigate('/admin/activity-logs')}
              className="text-xs text-teal-700 dark:text-teal-300 hover:underline font-mono"
            >
              Full Log ({activityLogs.length})
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 4).map(log => (
              <div key={log.id} className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 flex items-start gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 rounded-lg shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-mono">{log.details}</p>
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono block mt-1">Entity: {log.entity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
