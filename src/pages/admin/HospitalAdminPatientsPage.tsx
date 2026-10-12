import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
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
  FileText,
  Plus,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';

export const HospitalAdminPatientsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { hasPermission } = useRBAC();
  const { beds, icus, hospitalName, hospitalCode, doctors, nurses } = useAppSelector(state => state.hospitalAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [icuFilter, setIcuFilter] = useState('ALL');

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New Patient Form State
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('52');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newPatientPhone, setNewPatientPhone] = useState('+91 98765 01234');
  const [newPatientEmergencyContact, setNewPatientEmergencyContact] = useState('+91 98765 09876');
  const [newPatientIcuId, setNewPatientIcuId] = useState('ICU-MICU');
  const [newPatientBedNumber, setNewPatientBedNumber] = useState('MICU-05');
  const [newPatientDoctor, setNewPatientDoctor] = useState('Dr. Aakash Verma');
  const [newPatientNurse, setNewPatientNurse] = useState('Nurse Priya Nair');

  // Filter occupied beds to get active patient roster for assigned hospital
  const activePatients = beds.filter(b => b.status === 'OCCUPIED' && b.patientId);

  const filteredPatients = activePatients.filter(p => {
    const matchesSearch =
      p.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bedNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIcu = icuFilter === 'ALL' || p.icuId === icuFilter;
    return matchesSearch && matchesIcu;
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName) return;

    setSuccessToast(`Patient ${newPatientName} registered and admitted to ${newPatientBedNumber} successfully!`);
    setIsRegisterModalOpen(false);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const handleUpdateDemographicsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    setSuccessToast(`Demographics updated for ${editingPatient.patientName} (${editingPatient.patientId})`);
    setEditingPatient(null);
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
              <ShieldCheck className="w-3.5 h-3.5" /> Demographics Write & Admissions Authorized
            </span>
            <span className="px-2.5 py-0.5 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-mono font-bold rounded-lg border border-rose-200 dark:border-rose-800 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Record Deletion Protected
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Patient Directory & Census
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional master patient directory, emergency bed allocation intake, and protected demographic governance for {hospitalName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-xs flex items-center gap-3 shadow-xs">
            <span className="text-slate-500 dark:text-slate-400 font-bold">Active Census:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black text-base">{activePatients.length} Patients</span>
          </div>

          {hasPermission('patient:create') && (
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register & Admit Patient</span>
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

      {/* Search & Filter Controls */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient name, ID, bed..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400 font-mono font-bold">ICU:</span>
            <select
              value={icuFilter}
              onChange={e => setIcuFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Units</option>
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

      {/* Patient Census Table */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">Patient ID</th>
                <th className="p-3.5">Patient Name</th>
                <th className="p-3.5">Age / Gender</th>
                <th className="p-3.5">Assigned ICU & Bed</th>
                <th className="p-3.5">Attending Doctor</th>
                <th className="p-3.5">Nurse Lead</th>
                <th className="p-3.5">Admission Date</th>
                <th className="p-3.5">Telemetry Status</th>
                <th className="p-3.5 text-right">Actions</th>
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
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                      p.telemetryStatus === 'ONLINE'
                        ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                    }`}>
                      ● {p.telemetryStatus}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {hasPermission('patient:demographics:write') && (
                        <button
                          onClick={() => setEditingPatient(p)}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Edit Patient Demographics"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Demographics</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: REGISTER & ADMIT PATIENT ================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Register & Admit Patient (ICU Intake)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Authorized under patient:create & admission:create
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={e => setNewPatientName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Patel"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Age / Gender *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      value={newPatientAge}
                      onChange={e => setNewPatientAge(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                    <select
                      value={newPatientGender}
                      onChange={e => setNewPatientGender(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={newPatientPhone}
                    onChange={e => setNewPatientPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Emergency Next-of-Kin</label>
                  <input
                    type="text"
                    value={newPatientEmergencyContact}
                    onChange={e => setNewPatientEmergencyContact(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Target ICU Unit</label>
                  <select
                    value={newPatientIcuId}
                    onChange={e => setNewPatientIcuId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    {icus.map(i => (
                      <option key={i.id} value={i.id}>{i.name} ({i.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Bed Assignment</label>
                  <input
                    type="text"
                    value={newPatientBedNumber}
                    onChange={e => setNewPatientBedNumber(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  Confirm Admission & Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DEMOGRAPHICS ================= */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Update Patient Demographics</span>
                </h3>
                <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400">
                  {editingPatient.patientName} ({editingPatient.patientId})
                </span>
              </div>
              <button onClick={() => setEditingPatient(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateDemographicsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Legal Name</label>
                <input
                  type="text"
                  value={editingPatient.patientName}
                  onChange={e => setEditingPatient({ ...editingPatient, patientName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Age</label>
                  <input
                    type="number"
                    value={editingPatient.patientAge}
                    onChange={e => setEditingPatient({ ...editingPatient, patientAge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Gender</label>
                  <select
                    value={editingPatient.patientGender}
                    onChange={e => setEditingPatient({ ...editingPatient, patientGender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Bed</label>
                <input
                  type="text"
                  value={editingPatient.bedNumber}
                  onChange={e => setEditingPatient({ ...editingPatient, bedNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPatient(null)}
                  className="px-4 py-2 text-slate-500 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl cursor-pointer"
                >
                  Save Demographics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminPatientsPage;
