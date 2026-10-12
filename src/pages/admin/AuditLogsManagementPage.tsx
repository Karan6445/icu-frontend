import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  ShieldCheck,
  Search,
  Filter,
  Lock,
  User,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText
} from 'lucide-react';

export const AuditLogsManagementPage: React.FC = () => {
  const { auditLogs, districts } = useSelector((state: RootState) => state.superAdmin);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [moduleFilter, setModuleFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (roleFilter !== 'ALL' && log.userRole !== roleFilter) return false;
    if (moduleFilter !== 'ALL' && log.module !== moduleFilter) return false;
    if (districtFilter !== 'ALL' && log.district !== districtFilter) return false;
    if (searchTerm) {
      const match =
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.newValue && log.newValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.oldValue && log.oldValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
        log.ipAddress.includes(searchTerm);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[#0F766E]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F766E]">
              Immutable System Audit Logs
            </h1>
            <p className="text-xs text-slate-500 font-medium">Security compliance, action history, and administrative access records</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-700">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Tamper-Proof & Read-Only</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, hospital, action..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All User Roles</option>
            <option value="SUPER_ADMIN">COMMAND CENTER</option>
            <option value="HOSPITAL_DIRECTOR">HOSPITAL_DIRECTOR</option>
            <option value="DOCTOR">DOCTOR</option>
            <option value="NURSE">NURSE</option>
          </select>
        </div>

        <div>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Modules</option>
            <option value="Hospital Management">Hospital Management</option>
            <option value="Doctor Management">Doctor Management</option>
            <option value="Nurse Management">Nurse Management</option>
            <option value="ICU Management">ICU Management</option>
            <option value="Patient Management">Patient Management</option>
          </select>
        </div>

        <div>
          <select
            value={districtFilter}
            onChange={e => setDistrictFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Districts (38)</option>
            {districts.map(d => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-4 px-6">Timestamp & IP</th>
              <th className="py-4 px-6">User & Role</th>
              <th className="py-4 px-6">Action & Module</th>
              <th className="py-4 px-6">Hospital & District</th>
              <th className="py-4 px-6">Audit Details</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="font-mono text-slate-800 font-bold block">{log.timestamp}</span>
                  <span className="text-[10px] text-slate-500 font-mono">IP: {log.ipAddress}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-slate-900 block">{log.user}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E] inline-block mt-0.5">
                    {log.userRole === 'SUPER_ADMIN' ? 'COMMAND CENTER' : log.userRole}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-[#0F766E] block">{log.action}</span>
                  <span className="text-slate-500 text-[11px]">{log.module}</span>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-slate-900 block">{log.hospital}</span>
                  <span className="text-slate-500 text-[11px]">{log.district} District</span>
                </td>
                <td className="py-4 px-6 max-w-xs space-y-1">
                  {log.newValue && (
                    <p className="text-slate-800 font-medium text-[11px]">
                      <span className="text-emerald-700 font-bold">New:</span> {log.newValue}
                    </p>
                  )}
                  {log.oldValue && (
                    <p className="text-slate-500 text-[10px] italic">
                      <span className="text-slate-400">Old:</span> {log.oldValue}
                    </p>
                  )}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] border ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : log.status === 'WARNING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogsManagementPage;
