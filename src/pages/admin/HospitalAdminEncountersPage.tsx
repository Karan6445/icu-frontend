import React, { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  Activity,
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';

export const HospitalAdminEncountersPage: React.FC = () => {
  const { encounters, icus, hospitalName, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [icuFilter, setIcuFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredEncounters = encounters.filter(enc => {
    const matchesSearch =
      enc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enc.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enc.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIcu = icuFilter === 'ALL' || enc.icuId === icuFilter;
    const matchesType = typeFilter === 'ALL' || enc.encounterType === typeFilter;
    return matchesSearch && matchesIcu && matchesType;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-200 dark:border-teal-800">
              Hospital Clinical Log ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold rounded border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Encounters View-Only (No Edit Buttons)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Patient Encounters Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Historical log of ICU admissions, emergency triage encounters, transfers, follow-ups, and discharges.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-700 dark:text-slate-300">
          <span>Logged Encounters: </span>
          <strong className="text-teal-700 dark:text-teal-400 text-sm">{encounters.length} Records</strong>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, encounter ID, diagnosis..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
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

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400 font-mono font-bold">Type:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Types</option>
              <option value="Admission">Admission</option>
              <option value="ICU Encounter">ICU Encounter</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Emergency">Emergency</option>
              <option value="Transfer">Transfer</option>
              <option value="Discharge">Discharge</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing <strong className="text-teal-600 dark:text-teal-400">{filteredEncounters.length}</strong> Encounters
          </span>
        </div>
      </div>

      {/* Encounters Read-Only Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Encounter ID</th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">ICU Unit & Bed</th>
                <th className="p-3.5">Attending Doctor</th>
                <th className="p-3.5">Assigned Nurse</th>
                <th className="p-3.5">Encounter Date & Type</th>
                <th className="p-3.5">Clinical Diagnosis</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Access Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredEncounters.map(enc => (
                <tr key={enc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-amber-700 dark:text-amber-300">{enc.id}</td>
                  <td className="p-3.5 font-sans">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{enc.patientName}</div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{enc.patientId} • {enc.age}y / {enc.gender}</span>
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className="font-bold text-teal-700 dark:text-teal-300">{enc.bedNumber}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{enc.icuName}</span>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">{enc.doctorName}</td>
                  <td className="p-3.5 text-emerald-700 dark:text-emerald-300 font-semibold">{enc.nurseName}</td>
                  <td className="p-3.5 font-mono">
                    <span className="font-bold text-slate-900 dark:text-white block">{enc.encounterType}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{enc.encounterDate}</span>
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={enc.diagnosis}>
                    {enc.diagnosis}
                  </td>
                  <td className="p-3.5 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      enc.status === 'ACTIVE'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                        : enc.status === 'DISCHARGED'
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600'
                        : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                    }`}>
                      {enc.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <span className="px-2 py-1 rounded bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-[10px] font-mono font-bold inline-flex items-center gap-1">
                      <Lock className="w-3 h-3" /> VIEW ONLY
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
