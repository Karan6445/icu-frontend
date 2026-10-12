import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Stethoscope,
  ChevronRight,
  SlidersHorizontal,
  History
} from 'lucide-react';
import { MOCK_PATIENTS } from '../data/mockData';
import { PatientRegistryModal } from '../components/patient/PatientRegistryModal';
import { NurseOnlyRegistrationNoticeModal } from '../components/patient/NurseOnlyRegistrationNoticeModal';
import { ClinicalStatus } from '../types/icu';
import { useAppSelector } from '../store/hooks';

export const PatientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole } = useAppSelector(state => state.auth);

  const [isRegistryOpen, setIsRegistryOpen] = useState(false);
  const [isPolicyNoticeOpen, setIsPolicyNoticeOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClinicalStatus>('ALL');
  const [selectedUnit, setSelectedUnit] = useState('ALL');

  const handleRegisterClick = () => {
    if (activeRole === 'DOCTOR') {
      setIsPolicyNoticeOpen(true);
    } else {
      setIsRegistryOpen(true);
    }
  };

  // Filter patients based on search and status
  const filteredPatients = MOCK_PATIENTS.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.bedNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (patient.admittingDiagnosis && patient.admittingDiagnosis.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || patient.status === statusFilter;
    const matchesUnit = selectedUnit === 'ALL' || patient.unitName === selectedUnit;

    return matchesSearch && matchesStatus && matchesUnit;
  });

  // Count summaries
  const totalCount = MOCK_PATIENTS.length;
  const criticalCount = MOCK_PATIENTS.filter(p => p.status === 'CRITICAL').length;
  const warningCount = MOCK_PATIENTS.filter(p => p.status === 'WARNING').length;
  const stableCount = MOCK_PATIENTS.filter(p => p.status === 'STABLE').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
              ICU Patient Directory & Worklist
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time patient census, acuity classification, live vitals monitoring, and attending clinician assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/patient/timeline')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <History className="w-4 h-4 text-teal-300" />
            <span>Timeline & Remarks Hub</span>
          </button>

          <button
            onClick={handleRegisterClick}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* 4 Acuity Filter Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'ALL'
              ? 'bg-teal-600 text-white border-teal-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">All Patients</div>
          <div className="text-2xl font-black mt-1">{totalCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('CRITICAL')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'CRITICAL'
              ? 'bg-rose-600 text-white border-rose-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">Critical Acuity</div>
          <div className="text-2xl font-black mt-1">{criticalCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('WARNING')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'WARNING'
              ? 'bg-amber-600 text-white border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">Warning / Alert</div>
          <div className="text-2xl font-black mt-1">{warningCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('STABLE')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'STABLE'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
          }`}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-80">Stable</div>
          <div className="text-2xl font-black mt-1">{stableCount}</div>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name, MRN, bed number, diagnosis..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Units (MICU, SICU, CICU, NICU)</option>
            <option value="MICU-01">Medical ICU (MICU-01)</option>
            <option value="SICU-01">Surgical ICU (SICU-01)</option>
            <option value="CICU-01">Cardiac ICU (CICU-01)</option>
            <option value="NICU-01">Neuro ICU (NICU-01)</option>
          </select>
        </div>
      </div>

      {/* Patient Worklist Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
              <tr>
                <th className="py-4 px-6">Bed & Patient</th>
                <th className="py-4 px-6">MRN & Demographics</th>
                <th className="py-4 px-6">Primary Diagnosis</th>
                <th className="py-4 px-6">Attending Physician</th>
                <th className="py-4 px-6">Acuity Status</th>
                <th className="py-4 px-6">Live Vitals Snapshot</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Bed & Patient Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-teal-400 font-mono font-bold text-xs">
                        {patient.bedNumber}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {patient.name}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Unit: {patient.unitName}</span>
                      </div>
                    </div>
                  </td>

                  {/* MRN & Demographics */}
                  <td className="py-4 px-6 font-mono">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{patient.mrn}</div>
                    <div className="text-[11px] text-slate-500">{patient.age}y / {patient.gender}</div>
                  </td>

                  {/* Primary Diagnosis */}
                  <td className="py-4 px-6 max-w-xs">
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{patient.admittingDiagnosis}</div>
                  </td>

                  {/* Attending Physician */}
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{patient.assignedClinician}</div>
                    <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">RN: {patient.assignedNurse}</div>
                  </td>

                  {/* Acuity Status */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      patient.status === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : patient.status === 'WARNING'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        patient.status === 'CRITICAL' ? 'bg-rose-500 animate-ping' : patient.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      {patient.status}
                    </span>
                  </td>

                  {/* Live Vitals Snapshot */}
                  <td className="py-4 px-6 font-mono text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[9px] text-slate-400 block">HR</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{patient.vitals.hr.value}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">BP</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{patient.vitals.bpSystolic.value}/{patient.vitals.bpDiastolic.value}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">SpO2</span>
                        <span className="font-bold text-teal-600 dark:text-teal-400">{patient.vitals.spo2.value}%</span>
                      </div>
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/patient/${patient.id}/timeline`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold text-xs transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-teal-400" />
                        <span>Timeline</span>
                      </button>

                      <button
                        onClick={() => navigate(`/patient/${patient.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Hub</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Registry Modal */}
      <PatientRegistryModal
        isOpen={isRegistryOpen}
        onClose={() => setIsRegistryOpen(false)}
      />

      {/* Nurse Only Policy Restriction Notice */}
      <NurseOnlyRegistrationNoticeModal
        isOpen={isPolicyNoticeOpen}
        onClose={() => setIsPolicyNoticeOpen(false)}
      />
    </div>
  );
};

export default PatientsPage;

