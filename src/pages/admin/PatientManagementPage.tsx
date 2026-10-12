import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updatePatientStatus } from '../../store/slices/superAdminSlice';
import { SuperAdminPatientRecord } from '../../types/superAdmin';
import {
  Activity,
  Search,
  Filter,
  User,
  Building2,
  MapPin,
  Clock,
  Bed,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const PatientManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const { patients, districts, hospitals } = useSelector((state: RootState) => state.superAdmin);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [wardFilter, setWardFilter] = useState('ALL');

  const [selectedPatient, setSelectedPatient] = useState<SuperAdminPatientRecord | null>(null);

  const filteredPatients = patients.filter(p => {
    if (districtFilter !== 'ALL' && p.district !== districtFilter) return false;
    if (hospitalFilter !== 'ALL' && p.hospitalId !== hospitalFilter) return false;
    if (statusFilter !== 'ALL' && p.patientStatus !== statusFilter) return false;
    if (wardFilter !== 'ALL' && p.wardType !== wardFilter) return false;
    if (searchTerm) {
      const match =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const criticalCount = patients.filter(p => p.patientStatus === 'CRITICAL').length;
  const warningCount = patients.filter(p => p.patientStatus === 'WARNING').length;
  const stableCount = patients.filter(p => p.patientStatus === 'STABLE').length;

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F766E]">
              Cross-District Patient Worklist
            </h1>
            <p className="text-xs text-slate-500 font-medium">Supervision of high-acuity ICU and critical care patient caseloads</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-rose-800 font-bold text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>{criticalCount} Critical ICU Patients</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block font-semibold">Total Registered Patients</span>
          <span className="text-2xl font-black text-slate-900 mt-1">{patients.length}</span>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 shadow-xs">
          <span className="text-xs text-rose-700 block font-bold">Critical Risk</span>
          <span className="text-2xl font-black text-rose-700 mt-1">{criticalCount}</span>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 shadow-xs">
          <span className="text-xs text-amber-700 block font-bold">Warning / Monitor</span>
          <span className="text-2xl font-black text-amber-700 mt-1">{warningCount}</span>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 shadow-xs">
          <span className="text-xs text-emerald-700 block font-bold">Stable Condition</span>
          <span className="text-2xl font-black text-emerald-700 mt-1">{stableCount}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search patient, ID, doctor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          />
        </div>

        <div>
          <select
            value={districtFilter}
            onChange={e => {
              setDistrictFilter(e.target.value);
              setHospitalFilter('ALL');
            }}
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

        <div>
          <select
            value={hospitalFilter}
            onChange={e => setHospitalFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Hospitals</option>
            {hospitals
              .filter(h => districtFilter === 'ALL' || h.district === districtFilter)
              .map(h => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Acuity Levels</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="WARNING">WARNING</option>
            <option value="STABLE">STABLE</option>
            <option value="RECOVERING">RECOVERING</option>
            <option value="DISCHARGED">DISCHARGED</option>
          </select>
        </div>

        <div>
          <select
            value={wardFilter}
            onChange={e => setWardFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
          >
            <option value="ALL">All Wards</option>
            <option value="ICU">ICU</option>
            <option value="HDURI Unit">HDURI Unit</option>
            <option value="General Ward">General Ward</option>
            <option value="Private Suite">Private Suite</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-4 px-6">Patient Info</th>
              <th className="py-4 px-6">Hospital & District</th>
              <th className="py-4 px-6">Bed & Ward</th>
              <th className="py-4 px-6">Care Team</th>
              <th className="py-4 px-6">Acuity Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredPatients.map(pat => (
              <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-4 px-6">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-[#0F766E] rounded">
                    {pat.patientId}
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-1">{pat.name}</p>
                  <p className="text-slate-500 text-[11px]">{pat.age} Yrs • {pat.gender}</p>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-slate-900">{pat.hospitalName}</span>
                  <p className="text-slate-500 text-[11px]">{pat.district} District</p>
                </td>
                <td className="py-4 px-6">
                  <span className="font-bold text-[#0F766E]">{pat.bedNumber}</span>
                  <p className="text-slate-500 text-[11px]">{pat.wardType}</p>
                </td>
                <td className="py-4 px-6 text-slate-800 font-medium">
                  <p className="font-bold">Dr: {pat.doctorName}</p>
                  <p className="text-slate-500 text-[11px]">Nurse: {pat.nurseName}</p>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full font-extrabold text-[10px] border ${
                      pat.patientStatus === 'CRITICAL'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : pat.patientStatus === 'WARNING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {pat.patientStatus}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => setSelectedPatient(pat)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0F766E] rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    Manage Patient
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PATIENT DETAIL & STATUS UPDATE MODAL */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-bold text-[#0F766E] px-2 py-0.5 bg-teal-50 rounded">
                  {selectedPatient.patientId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedPatient.name}</h3>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="px-3 py-1 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Hospital</span>
                <span className="font-bold text-slate-900">{selectedPatient.hospitalName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Bed Number</span>
                <span className="font-bold text-[#0F766E]">{selectedPatient.bedNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Attending Doctor</span>
                <span className="font-bold text-slate-900">{selectedPatient.doctorName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Assigned Nurse</span>
                <span className="font-bold text-slate-900">{selectedPatient.nurseName}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Update Patient Risk Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['CRITICAL', 'WARNING', 'STABLE', 'RECOVERING', 'DISCHARGED'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      dispatch(updatePatientStatus({ patientId: selectedPatient.id, status: st }));
                      setSelectedPatient(null);
                    }}
                    className={`py-2 px-2 rounded-xl text-[11px] font-bold border text-center transition-all cursor-pointer ${
                      selectedPatient.patientStatus === st
                        ? 'bg-[#0F766E] text-white border-teal-700'
                        : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagementPage;
