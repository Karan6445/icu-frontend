import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateShiftSchedule } from '../../store/slices/hospitalAdminSlice';
import { ShiftStatus, ShiftType } from '../../types/hospitalAdmin';
import {
  Calendar,
  Clock,
  UserCheck,
  Building2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const HospitalAdminShiftsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { shifts, icus, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [selectedDate, setSelectedDate] = useState('2026-09-22');
  const [icuFilter, setIcuFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredShifts = shifts.filter(sh => {
    const matchesIcu = icuFilter === 'ALL' || sh.icuId === icuFilter;
    const matchesRole = roleFilter === 'ALL' || sh.role === roleFilter;
    return matchesIcu && matchesRole;
  });

  const onDutyCount = filteredShifts.filter(s => s.status === 'ON DUTY').length;
  const assignedCount = filteredShifts.filter(s => s.status === 'ASSIGNED').length;
  const leaveCount = filteredShifts.filter(s => s.status === 'LEAVE').length;

  const handleStatusChange = (shiftId: string, newStatus: ShiftStatus) => {
    dispatch(updateShiftSchedule({ shiftId, status: newStatus }));
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold rounded border border-amber-300 dark:border-amber-500/30">
              Operational Staff Schedules ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold rounded border border-emerald-300 dark:border-emerald-500/30">
              {onDutyCount} Staff Currently On Duty
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-600 dark:text-amber-400" /> Shift Roster & Calendar Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational shift management across Daily, Weekly, and Monthly views with real-time shift status controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hospital-staff"
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-bold font-mono px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <Users className="w-3.5 h-3.5 text-amber-600" /> Staff API by Shift
          </Link>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('DAILY')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'DAILY' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewMode('WEEKLY')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'WEEKLY' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Weekly Roster
          </button>
          <button
            onClick={() => setViewMode('MONTHLY')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'MONTHLY' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Monthly Calendar
          </button>
        </div>
      </div>
    </div>

      {/* Coverage KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">On Duty Staff</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{onDutyCount}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Active Shift Operational</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500/40" />
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Assigned Next Shift</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{assignedCount}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Scheduled Evening/Night</span>
          </div>
          <Clock className="w-8 h-8 text-amber-500/40" />
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Staff On Leave</span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{leaveCount}</div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Approved Absences</span>
          </div>
          <AlertCircle className="w-8 h-8 text-rose-500/40" />
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Target Coverage</span>
            <div className="text-2xl font-black text-teal-700 dark:text-teal-300">100%</div>
            <span className="text-xs text-slate-500 dark:text-slate-400">All 4 ICUs Covered</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-teal-500/40" />
        </div>
      </div>

      {/* Roster Controls & Filter */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
          />
          <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
            Selected Date: {selectedDate}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Building2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-slate-500 dark:text-slate-400 font-mono">ICU:</span>
            <select
              value={icuFilter}
              onChange={e => setIcuFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All ICUs</option>
              {icus.map(i => (
                <option key={i.id} value={i.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{i.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-slate-500 dark:text-slate-400 font-mono">Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Roles</option>
              <option value="DOCTOR" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Doctors</option>
              <option value="NURSE_LEAD" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Nurse Leads</option>
              <option value="NURSE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Nurses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shifts View rendering based on mode */}
      {viewMode === 'DAILY' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Daily Shift Roster ({selectedDate})
            </h3>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Showing {filteredShifts.length} Shift Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Shift ID</th>
                  <th className="p-3.5">Staff Name & Role</th>
                  <th className="p-3.5">Assigned ICU</th>
                  <th className="p-3.5">Shift Window</th>
                  <th className="p-3.5">Timing</th>
                  <th className="p-3.5">Current Status</th>
                  <th className="p-3.5 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredShifts.map(sh => (
                  <tr key={sh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-amber-700 dark:text-amber-300">{sh.id}</td>
                    <td className="p-3.5 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white">{sh.staffName}</div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{sh.role} • {sh.staffId}</span>
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">{sh.icuName}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-slate-700 text-amber-800 dark:text-amber-300 font-mono font-bold text-[11px]">
                        {sh.shiftType} SHIFT
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{sh.startTime} - {sh.endTime}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                        sh.status === 'ON DUTY'
                          ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                          : sh.status === 'ASSIGNED'
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                          : sh.status === 'LEAVE'
                          ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                      }`}>
                        ● {sh.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <select
                        value={sh.status}
                        onChange={e => handleStatusChange(sh.id, e.target.value as ShiftStatus)}
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white rounded p-1.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="AVAILABLE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">AVAILABLE</option>
                        <option value="ASSIGNED" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ASSIGNED</option>
                        <option value="ON DUTY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">ON DUTY</option>
                        <option value="OFF DUTY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">OFF DUTY</option>
                        <option value="LEAVE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">LEAVE</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewMode === 'WEEKLY' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Weekly Roster Coverage Grid (21 Sept - 27 Sept 2026)</h3>
            <span className="text-xs font-mono text-amber-700 dark:text-amber-300 font-bold">Operational Shifts Active</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono">
            {['Mon 21', 'Tue 22 (Today)', 'Wed 23', 'Thu 24', 'Fri 25', 'Sat 26', 'Sun 27'].map((day, idx) => (
              <div key={day} className={`p-3 rounded-xl border ${idx === 1 ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500 text-amber-900 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                <span className="font-bold block">{day}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">3 Shifts Scheduled</span>
                <div className="mt-2 space-y-1">
                  <span className="block text-[9px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 p-1 rounded font-bold">12 On Duty</span>
                  <span className="block text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 p-1 rounded">2 Leave</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'MONTHLY' && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Shift Calendar (September 2026)</h3>
            <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">Total Shifts Logged: {shifts.length * 30}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-xs font-mono text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="p-2 font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 rounded">{d}</div>
            ))}
            {Array.from({ length: 30 }).map((_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === 22;
              return (
                <div
                  key={dayNum}
                  className={`p-3 min-h-[70px] rounded-lg border text-left flex flex-col justify-between ${
                    isToday ? 'bg-amber-50 dark:bg-amber-500/20 border-amber-400 dark:border-amber-500 text-amber-900 dark:text-amber-300' : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="font-bold text-xs">{dayNum}</span>
                  <div className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                    4 ICUs Covered
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
