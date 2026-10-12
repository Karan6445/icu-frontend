import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSearchQuery, setStatusFilter, assignDoctorToPatient, PatientRecord } from '../../store/slices/patientSlice';
import { Users, Search, Filter, Stethoscope, Eye, Edit, ShieldCheck, X, CheckCircle2, List, Grid, User } from 'lucide-react';

export const AdminPatientsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients, searchQuery, statusFilter } = useAppSelector(state => state.patient);
  const { doctors } = useAppSelector(state => state.doctor);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedPatientDetail, setSelectedPatientDetail] = useState<PatientRecord | null>(null);
  const [selectedPatientForAssignDoc, setSelectedPatientForAssignDoc] = useState<PatientRecord | null>(null);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDept, setNewDept] = useState('Medical ICU');

  const filteredPatients = patients.filter(p => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.mrn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const handleAssignDoctor = () => {
    if (selectedPatientForAssignDoc && newDoctorName) {
      dispatch(assignDoctorToPatient({
        patientId: selectedPatientForAssignDoc.id,
        doctorName: newDoctorName,
        department: newDept
      }));
      setSelectedPatientForAssignDoc(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            PATIENT MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">ICU Patient Census Directory</h1>
          <p className="text-xs text-slate-500">Search, filter, view patient clinical files, and assign attending doctors.</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'table' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'grid' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Grid View</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search by Patient Name, MRN or ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 text-[11px] font-mono uppercase font-bold">Acuity Filter:</span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'STABLE'] as const).map(st => (
            <button
              key={st}
              onClick={() => dispatch(setStatusFilter(st))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering: Table or Grid */}
      {viewMode === 'table' ? (
        /* Patients Table */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Patient ID & Name</th>
                <th className="p-3">MRN Number</th>
                <th className="p-3">Unit / Bed</th>
                <th className="p-3">Acuity Status</th>
                <th className="p-3">Admitting Diagnosis</th>
                <th className="p-3">Assigned Doctor</th>
                <th className="p-3">Emergency Contact</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPatients.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    <div>{p.name} ({p.id})</div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">{p.age}Y · {p.gender} · {p.bloodGroup}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{p.mrn}</td>
                  <td className="p-3">
                    <span className="font-bold text-teal-700 dark:text-teal-400">{p.unitName}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-mono">{p.bedNumber}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                      p.status === 'CRITICAL'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                        : p.status === 'HIGH'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300 max-w-[180px] truncate">{p.admittingDiagnosis}</td>
                  <td className="p-3 text-teal-700 dark:text-teal-400 font-bold">{p.assignedClinician}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    <div>{p.emergencyContactName} ({p.relation})</div>
                    <div>{p.emergencyContactNumber}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPatientDetail(p)}
                        className="p-1.5 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                        title="View Patient Record"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPatientForAssignDoc(p);
                          setNewDoctorName(p.assignedClinician);
                        }}
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                        title="Assign Doctor"
                      >
                        <Stethoscope className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Patients Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPatients.map(p => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{p.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">{p.id} · MRN: {p.mrn}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                  p.status === 'CRITICAL'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : p.status === 'HIGH'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {p.status}
                </span>
              </div>
              <div className="text-xs space-y-1 font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>Unit: <span className="font-bold text-teal-700">{p.unitName} ({p.bedNumber})</span></div>
                <div>Diagnosis: <span className="text-slate-800">{p.admittingDiagnosis}</span></div>
                <div>Doctor: <span className="font-bold text-teal-700">{p.assignedClinician}</span></div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setSelectedPatientDetail(p)}
                  className="flex-1 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold"
                >
                  View File
                </button>
                <button
                  onClick={() => {
                    setSelectedPatientForAssignDoc(p);
                    setNewDoctorName(p.assignedClinician);
                  }}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  Assign Doctor
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Details Modal */}
      {selectedPatientDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-lg text-white">{selectedPatientDetail.name} ({selectedPatientDetail.id})</h3>
                <span className="text-xs text-teal-400 font-mono">{selectedPatientDetail.mrn} · {selectedPatientDetail.unitName} ({selectedPatientDetail.bedNumber})</span>
              </div>
              <button onClick={() => setSelectedPatientDetail(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">DIAGNOSIS</span>
                <span className="text-white font-bold">{selectedPatientDetail.admittingDiagnosis}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">MEDICAL HISTORY</span>
                <span className="text-slate-300">{selectedPatientDetail.medicalHistory || 'None'}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">ATTENDING CLINICIAN</span>
                <span className="text-teal-400 font-bold">{selectedPatientDetail.assignedClinician}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-500 block text-[10px]">EMERGENCY CONTACT</span>
                <span className="text-slate-300">{selectedPatientDetail.emergencyContactName} ({selectedPatientDetail.emergencyContactNumber})</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button onClick={() => setSelectedPatientDetail(null)} className="px-5 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Doctor Modal */}
      {selectedPatientForAssignDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Assign Doctor to {selectedPatientForAssignDoc.name}</h3>
              <button onClick={() => setSelectedPatientForAssignDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Select Doctor</label>
                <select
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={`${d.name} (${d.department})`}>
                      {d.name} - {d.department} ({d.qualification})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Department</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button onClick={() => setSelectedPatientForAssignDoc(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Cancel
              </button>
              <button onClick={handleAssignDoctor} className="px-5 py-2 bg-teal-500 text-white rounded-xl font-bold text-xs">
                Confirm Doctor Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
