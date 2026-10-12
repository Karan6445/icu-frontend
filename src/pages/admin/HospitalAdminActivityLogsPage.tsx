import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  Clock,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  CheckCircle2,
  UserCheck,
  FileText,
  Lock
} from 'lucide-react';

export const HospitalAdminActivityLogsPage: React.FC = () => {
  const { activityLogs, hospitalName, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-200 dark:border-teal-800">
              Immutable Activity Audit Log ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold rounded border border-emerald-200 dark:border-emerald-800">
              Auto-Logging System Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Hospital Admin Activity History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of all administrative operations (Staff registration, shift updates, bed status changes, report generation).
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300">
          <span>Logged Actions: </span>
          <strong className="text-teal-700 dark:text-teal-400 text-sm">{activityLogs.length} Events</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, entity, user, details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400 font-mono font-bold">Action Type:</span>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="DOCTOR_REGISTRATION">Doctor Registration</option>
              <option value="NURSE_REGISTRATION">Nurse Registration</option>
              <option value="BED_STATUS_UPDATE">Bed Status Update</option>
              <option value="SHIFT_SCHEDULE_UPDATE">Shift Update</option>
              <option value="REPORT_GENERATION">Report Generation</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing <strong className="text-teal-600 dark:text-teal-400">{filteredLogs.length}</strong> Audit Logs
          </span>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Log ID</th>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User & Role</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">Action Details</th>
                <th className="p-3.5 text-right">Hospital Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors font-mono">
                  <td className="p-3.5 font-bold text-teal-700 dark:text-teal-300">{log.id}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                  <td className="p-3.5 font-sans">
                    <span className="font-bold text-slate-900 dark:text-white block">{log.user}</span>
                    <span className="text-[10px] font-mono text-teal-600 dark:text-teal-400">{log.role}</span>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/40 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-amber-800 dark:text-amber-300">{log.entity}</td>
                  <td className="p-3.5 font-sans text-slate-700 dark:text-slate-300 max-w-sm leading-normal">
                    {log.details}
                  </td>
                  <td className="p-3.5 text-right font-bold text-slate-500 dark:text-slate-400">
                    {log.hospitalId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
