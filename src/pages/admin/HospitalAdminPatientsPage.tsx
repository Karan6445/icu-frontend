import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Building2,
  Lock,
  Bed,
  Stethoscope,
  HeartPulse,
  Calendar,
  FileText
} from 'lucide-react';

export const HospitalAdminPatientsPage: React.FC = () => {
  const { beds, icus, hospitalName, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [icuFilter, setIcuFilter] = useState('ALL');

  // Filter occupied beds to get active patient roster for ACH-01
  const activePatients = beds.filter(b => b.status === 'OCCUPIED' && b.patientId);

  const filteredPatients = activePatients.filter(p => {
    const matchesSearch =
      p.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIcu = icuFilter === 'ALL' || p.icuId === icuFilter;
    return matchesSearch && matchesIcu;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-200 dark:border-teal-800">
              Hospital Data Isolation ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Read-Only Patient Roster
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Patient Directory & Admissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Strictly scoped to active ICU admissions in {hospitalName}. Administrative view only.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs flex items-center gap-3">
          <span className="text-slate-600 dark:text-slate-400 font-bold">Active Patient Roster:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black text-base">{activePatients.length} Patients</span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, ID, bed..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400 font-mono font-bold">ICU:</span>
            <select
              value={icuFilter}
              onChange={e => setIcuFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All ICUs</option>
              {icus.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing <strong className="text-teal-600 dark:text-teal-400">{filteredPatients.length}</strong> Patients
          </span>
        </div>
      </div>

      {/* Read Only Patient Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Patient ID</th>
                <th className="p-3.5">Patient Name</th>
                <th className="p-3.5">Age / Gender</th>
                <th className="p-3.5">Assigned ICU & Bed</th>
                <th className="p-3.5">Primary Doctor</th>
                <th className="p-3.5">Primary Nurse</th>
                <th className="p-3.5">Admission Date</th>
                <th className="p-3.5">Telemetry Status</th>
                <th className="p-3.5 text-right">Access Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredPatients.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-teal-700 dark:text-teal-300">{p.patientId}</td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white text-sm">{p.patientName}</td>
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{p.patientAge}y / {p.patientGender}</td>
                  <td className="p-3.5 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">{p.bedNumber}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{p.icuName}</span>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">{p.assignedDoctor || 'Unassigned'}</td>
                  <td className="p-3.5 text-emerald-700 dark:text-emerald-300 font-semibold">{p.assignedNurse || 'Unassigned'}</td>
                  <td className="p-3.5 font-mono text-slate-600 dark:text-slate-300">{p.admissionDate || '2026-09-20'}</td>
                  <td className="p-3.5 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      p.telemetryStatus === 'ONLINE'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                    }`}>
                      ● {p.telemetryStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> READ-ONLY
                    </span>
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
