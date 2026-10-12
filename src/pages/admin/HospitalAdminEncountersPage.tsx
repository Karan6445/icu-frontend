import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  Activity,
  Search,
  Filter,
  ShieldCheck,
  Lock,
  Building2,
  Calendar,
  FileText,
  Plus,
  Edit2,
  X,
  CheckCircle2,
  Bed,
  Stethoscope,
  HeartPulse,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

export const HospitalAdminEncountersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useRBAC();
  const { encounters, icus, hospitalName, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [icuFilter, setIcuFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal State
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [editingEncounter, setEditingEncounter] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Admission Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientId, setNewPatientId] = useState('PT-2026-901');
  const [newIcuId, setNewIcuId] = useState('ICU-MICU');
  const [newBedNumber, setNewBedNumber] = useState('MICU-04');
  const [newDoctorName, setNewDoctorName] = useState('Dr. Aakash Verma');
  const [newNurseName, setNewNurseName] = useState('Nurse Priya Nair');
  const [newDiagnosis, setNewDiagnosis] = useState('Acute Respiratory Distress / ICU Admission');
  const [newEncounterType, setNewEncounterType] = useState('Admission');

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

  const handleCreateAdmissionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName) return;

    setSuccessToast(`Admission encounter created for ${newPatientName} at ${newBedNumber} under admission:create!`);
    setIsAdmitModalOpen(false);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleUpdateStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEncounter) return;

    setSuccessToast(`Encounter status updated for ${editingEncounter.patientName} (${editingEncounter.id}) under admission:update!`);
    setEditingEncounter(null);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold rounded-lg border border-teal-200 dark:border-teal-800">
              Hospital Scope ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Admissions Lifecycle Authorized
            </span>
            <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Deletion Protected
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Patient Admissions & Encounters
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional encounter register, acute admissions management, and bed transfers for {hospitalName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-xs flex items-center gap-2.5 shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Total Cases:</span>
            <strong className="text-teal-700 dark:text-teal-400 text-sm">{encounters.length} Records</strong>
          </div>

          {hasPermission('admission:create') && (
            <button
              onClick={() => setIsAdmitModalOpen(true)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log Admission Encounter</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-900">
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
            placeholder="Search patient, encounter ID, diagnosis..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
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

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
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

      {/* Encounters Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Encounter ID</th>
                <th className="p-3.5">Patient Details</th>
                <th className="p-3.5">ICU Unit & Bed</th>
                <th className="p-3.5">Attending Doctor</th>
                <th className="p-3.5">Nurse Lead</th>
                <th className="p-3.5">Encounter Date & Type</th>
                <th className="p-3.5">Admitting Diagnosis</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
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
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
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
                    {hasPermission('admission:update') && (
                      <button
                        onClick={() => setEditingEncounter(enc)}
                        className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1 ml-auto cursor-pointer"
                        title="Update Encounter Status / Transfer"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Update Status</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: LOG ADMISSION ENCOUNTER ================= */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Create Admission Encounter
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Authorized under admission:create
                  </p>
                </div>
              </div>
              <button onClick={() => setIsAdmitModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmissionSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={e => setNewPatientName(e.target.value)}
                    placeholder="e.g. Smt. Kavita Shah"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Patient ID *</label>
                  <input
                    type="text"
                    value={newPatientId}
                    onChange={e => setNewPatientId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ICU Unit</label>
                  <select
                    value={newIcuId}
                    onChange={e => setNewIcuId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    {icus.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bed Number</label>
                  <input
                    type="text"
                    value={newBedNumber}
                    onChange={e => setNewBedNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Admitting Diagnosis</label>
                <input
                  type="text"
                  value={newDiagnosis}
                  onChange={e => setNewDiagnosis(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl cursor-pointer"
                >
                  Record Admission Encounter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPDATE ENCOUNTER STATUS ================= */}
      {editingEncounter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Update Encounter Status
                </h3>
                <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400">
                  {editingEncounter.patientName} ({editingEncounter.id})
                </span>
              </div>
              <button onClick={() => setEditingEncounter(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Encounter Status</label>
                <select
                  value={editingEncounter.status}
                  onChange={e => setEditingEncounter({ ...editingEncounter, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (In Unit)</option>
                  <option value="TRANSFERRED">TRANSFERRED (Step-Down / Other Unit)</option>
                  <option value="DISCHARGED">DISCHARGED (Routine / Recovered)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Bed</label>
                <input
                  type="text"
                  value={editingEncounter.bedNumber}
                  onChange={e => setEditingEncounter({ ...editingEncounter, bedNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEncounter(null)}
                  className="px-4 py-2 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Encounter Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminEncountersPage;
