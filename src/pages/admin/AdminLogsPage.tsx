import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSearchQuery, setCategoryFilter, setStatusFilter, clearLogs, LogCategory } from '../../store/slices/logSlice';
import { Search, Filter, ShieldCheck, Activity, Trash2, Clock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export const AdminLogsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { logs, searchQuery, categoryFilter, statusFilter } = useAppSelector(state => state.log);

  const filteredLogs = logs.filter(l => {
    const matchesCat = categoryFilter === 'ALL' || l.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter;
    const matchesQuery = l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         l.module.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#10B981] selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D1D5DB] shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            LOG MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Audit Trails & Activity Logs</h1>
          <p className="text-xs text-slate-500">Track user activity logs, authentication security events, and action logs across the hospital platform.</p>
        </div>

        <button
          onClick={() => dispatch(clearLogs())}
          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>Clear Logs</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#D1D5DB] flex flex-wrap items-center justify-between gap-4 text-xs font-medium shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search by User, Action, Module or IP address..."
              className="w-full bg-slate-50 border border-[#D1D5DB] rounded-xl pl-10 pr-4 py-2.5 text-slate-900 font-medium focus:border-[#0F766E] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-slate-500 text-[11px] font-mono uppercase font-bold">Category:</span>
          {(['ALL', 'User Activity', 'Login Log', 'Action Log'] as const).map(c => (
            <button
              key={c}
              onClick={() => dispatch(setCategoryFilter(c))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                categoryFilter === c
                  ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-xs'
                  : 'bg-slate-100 border-[#D1D5DB] text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 font-medium">
          <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200 font-bold">
            <tr>
              <th className="p-3 text-slate-900">Timestamp</th>
              <th className="p-3">Category</th>
              <th className="p-3">User & Role</th>
              <th className="p-3">Action Performed</th>
              <th className="p-3">Module</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Status</th>
              <th className="p-3">Audit Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredLogs.map(l => (
              <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                <td className="p-3 font-mono text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">{l.timestamp}</td>
                <td className="p-3 font-bold text-[#0F766E] dark:text-teal-400">{l.category}</td>
                <td className="p-3 font-bold text-slate-900 dark:text-white">
                  <div>{l.userName}</div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{l.userRole}</span>
                </td>
                <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{l.action}</td>
                <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{l.module}</td>
                <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{l.ipAddress}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    l.status === 'SUCCESS'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : l.status === 'WARNING'
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-[#F59E0B] dark:text-amber-400 border-amber-200 dark:border-amber-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="p-3 text-slate-500 dark:text-slate-400 max-w-[220px] truncate">{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
