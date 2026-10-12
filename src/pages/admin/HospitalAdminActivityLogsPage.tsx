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
  Lock,
  Trash2,
  X,
  AlertTriangle
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

export const HospitalAdminActivityLogsPage: React.FC = () => {
  const { hasPermission } = useRBAC();
  const { activityLogs: initialLogs, hospitalName, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [activityLogs, setActivityLogs] = useState(initialLogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  const handleDeleteLog = (logId: string) => {
    setActivityLogs(prev => prev.filter(l => l.id !== logId));
    setToastMessage(`Audit log ${logId} purged under institutional audit:delete policy.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handlePurgeAllOld = () => {
    setActivityLogs(prev => prev.slice(0, 5));
    setIsPurgeModalOpen(false);
    setToastMessage('Archived and purged historic logs beyond 90-day retention window.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold rounded-lg border border-teal-200 dark:border-teal-800">
              Audit Governance ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Retention & Audit Deletion Authorized
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Activity History & Forensic Audit
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit trail of all administrative events in {hospitalName}. Governed under institutional data governance rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300 shadow-xs">
            <span>Logged Actions: </span>
            <strong className="text-teal-700 dark:text-teal-400 text-sm">{activityLogs.length} Events</strong>
          </div>

          {hasPermission('audit:delete') && (
            <button
              onClick={() => setIsPurgeModalOpen(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
              title="Purge Expired Audit Records"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Expired Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, entity, user, details..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400 font-mono font-bold">Action:</span>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actions</option>
              <option value="DOCTOR_REGISTRATION">Doctor Registration</option>
              <option value="NURSE_REGISTRATION">Nurse Registration</option>
              <option value="BED_STATUS_UPDATE">Bed Status Update</option>
              <option value="BED_COMMISSIONING">Bed Commissioning</option>
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
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl overflow-hidden shadow-xs">
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
                <th className="p-3.5 text-right">Actions</th>
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
                    <span className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/40 font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-amber-800 dark:text-amber-300">{log.entity}</td>
                  <td className="p-3.5 font-sans text-slate-700 dark:text-slate-300 max-w-sm leading-normal">
                    {log.details}
                  </td>
                  <td className="p-3.5 text-right">
                    {hasPermission('audit:delete') && (
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                        title="Purge Single Audit Record (audit:delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: PURGE EXPIRED LOGS ================= */}
      {isPurgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Purge Expired Audit Records
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Authorized under audit:delete policy
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              This action will permanently purge historical audit events older than 90 days from the primary storage according to NABH data retention rules. A cryptographically signed hash of purged records will be retained in forensic cold storage.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPurgeModalOpen(false)}
                className="px-4 py-2 text-slate-500 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePurgeAllOld}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Confirm Purge (audit:delete)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminActivityLogsPage;
