import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setSearchQuery,
  setStatusFilter,
  assignDoctorToPatient,
  fetchPatientsThunk,
  fetchPatientDetailsThunk,
  registerPatientThunk,
  updatePatientDemographicsThunk,
  deletePatientThunk,
  resolvePatientQRThunk,
  regeneratePatientQRThunk,
  clearPatientError,
  clearPatientSuccessMessage,
  clearScannedPatient,
  clearSelectedPatientDetail,
  clearQrData,
  PatientRecord,
} from '../../store/slices/patientSlice';
import {
  Users,
  Search,
  Filter,
  Stethoscope,
  Eye,
  Edit,
  ShieldCheck,
  X,
  CheckCircle2,
  List,
  Grid,
  Plus,
  RefreshCw,
  QrCode,
  Trash2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldAlert,
  Calendar,
  Phone,
  User,
  HeartPulse,
  Activity,
  Bed,
  Sparkles,
} from 'lucide-react';
import { PatientGender, BloodGroup, PatientStatus } from '../../api/patientApi';

export const AdminPatientsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    patients,
    apiPatients,
    selectedPatientDetail,
    scannedPatient,
    qrData,
    loading,
    creating,
    updating,
    deleting,
    qrLoading,
    error,
    successMessage,
    searchQuery,
    statusFilter,
  } = useAppSelector((state) => state.patient);

  const { doctors } = useAppSelector((state) => state.doctor);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedToken, setCopiedToken] = useState(false);

  // Modals state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isResolveQrModalOpen, setIsResolveQrModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignDocModalOpen, setIsAssignDocModalOpen] = useState(false);

  // Active targets for modals
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null);
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newDept, setNewDept] = useState('Medical ICU');

  // Register Form State
  const [regForm, setRegForm] = useState({
    mrn: `MRN-${Math.floor(1000000 + Math.random() * 9000000)}`,
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '1985-05-12',
    gender: 'MALE' as PatientGender,
    blood_group: 'O_POSITIVE' as BloodGroup,
    national_id: '',
    primary_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: 'Spouse',
    diagnosis: 'Acute Respiratory Distress Syndrome (ARDS)',
  });

  // Edit Demographics Form State
  const [editForm, setEditForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    national_id: '',
    primary_phone: '',
    blood_group: 'O_POSITIVE' as BloodGroup,
    status: 'ACTIVE' as PatientStatus,
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  // Resolve QR state
  const [resolveTokenInput, setResolveTokenInput] = useState('');

  // Delete Reason state
  const [deleteReason, setDeleteReason] = useState('Clinical discharge / record deactivation requested by supervisor.');

  // Load patients on mount
  useEffect(() => {
    dispatch(fetchPatientsThunk());
  }, [dispatch]);

  // Handle live search / filter dispatch
  const handleRefresh = () => {
    dispatch(
      fetchPatientsThunk({
        search: searchQuery || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      })
    );
  };

  // Filtered patients based on local & store state
  const filteredPatients = patients.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.mrn.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      (p.mobileNumber && p.mobileNumber.includes(query));
    return matchesStatus && matchesQuery;
  });

  // Open Details Modal
  const handleOpenDetails = (p: PatientRecord) => {
    setActivePatient(p);
    dispatch(fetchPatientDetailsThunk(p.id));
    setIsDetailsModalOpen(true);
  };

  // Open QR Wristband Modal
  const handleOpenQrModal = (p: PatientRecord) => {
    setActivePatient(p);
    dispatch(clearQrData());
    setIsQrModalOpen(true);
  };

  // Open Edit Demographics Modal
  const handleOpenEdit = (p: PatientRecord) => {
    setActivePatient(p);
    const parts = p.name.split(' ');
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const bloodMapRev: Record<string, BloodGroup> = {
      'A+': 'A_POSITIVE',
      'A-': 'A_NEGATIVE',
      'B+': 'B_POSITIVE',
      'B-': 'B_NEGATIVE',
      'AB+': 'AB_POSITIVE',
      'AB-': 'AB_NEGATIVE',
      'O+': 'O_POSITIVE',
      'O-': 'O_NEGATIVE',
    };

    setEditForm({
      first_name: firstName,
      middle_name: '',
      last_name: lastName,
      national_id: '',
      primary_phone: p.mobileNumber || '',
      blood_group: bloodMapRev[p.bloodGroup] || 'O_POSITIVE',
      status: p.status === 'CRITICAL' ? 'ACTIVE' : 'ACTIVE',
      emergency_contact_name: p.emergencyContactName || '',
      emergency_contact_phone: p.emergencyContactNumber || '',
      emergency_contact_relation: p.relation || 'Family',
    });
    setIsEditModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (p: PatientRecord) => {
    setActivePatient(p);
    setIsDeleteModalOpen(true);
  };

  // Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.first_name.trim() || !regForm.last_name.trim()) return;

    await dispatch(
      registerPatientThunk({
        data: {
          mrn: regForm.mrn.trim(),
          first_name: regForm.first_name.trim(),
          middle_name: regForm.middle_name.trim() || null,
          last_name: regForm.last_name.trim(),
          date_of_birth: regForm.date_of_birth,
          gender: regForm.gender,
          blood_group: regForm.blood_group,
          national_id: regForm.national_id.trim() || null,
          primary_phone: regForm.primary_phone.trim() || null,
          emergency_contact_name: regForm.emergency_contact_name.trim() || null,
          emergency_contact_phone: regForm.emergency_contact_phone.trim() || null,
          emergency_contact_relation: regForm.emergency_contact_relation.trim() || null,
          allergies: [],
          chronic_conditions: regForm.diagnosis ? [{ name: regForm.diagnosis }] : [],
        },
      })
    );

    setIsRegisterModalOpen(false);
    setRegForm({
      mrn: `MRN-${Math.floor(1000000 + Math.random() * 9000000)}`,
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '1985-05-12',
      gender: 'MALE',
      blood_group: 'O_POSITIVE',
      national_id: '',
      primary_phone: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      emergency_contact_relation: 'Spouse',
      diagnosis: 'Acute Respiratory Distress Syndrome (ARDS)',
    });
  };

  // Submit Edit Demographics
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    await dispatch(
      updatePatientDemographicsThunk({
        patientId: activePatient.id,
        data: {
          first_name: editForm.first_name.trim() || null,
          middle_name: editForm.middle_name.trim() || null,
          last_name: editForm.last_name.trim() || null,
          national_id: editForm.national_id.trim() || null,
          primary_phone: editForm.primary_phone.trim() || null,
          blood_group: editForm.blood_group,
          status: editForm.status,
          emergency_contact_name: editForm.emergency_contact_name.trim() || null,
          emergency_contact_phone: editForm.emergency_contact_phone.trim() || null,
          emergency_contact_relation: editForm.emergency_contact_relation.trim() || null,
        },
      })
    );

    setIsEditModalOpen(false);
  };

  // Submit Soft Delete
  const handleDeleteConfirm = async () => {
    if (!activePatient) return;
    await dispatch(
      deletePatientThunk({
        patientId: activePatient.id,
        reason: deleteReason,
      })
    );
    setIsDeleteModalOpen(false);
  };

  // Submit QR Regenerate
  const handleRegenerateQR = async () => {
    if (!activePatient) return;
    await dispatch(regeneratePatientQRThunk(activePatient.id));
  };

  // Submit Resolve QR
  const handleResolveQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveTokenInput.trim()) return;
    await dispatch(resolvePatientQRThunk(resolveTokenInput.trim()));
  };

  // Assign Doctor
  const handleAssignDoctor = () => {
    if (activePatient && newDoctorName) {
      dispatch(
        assignDoctorToPatient({
          patientId: activePatient.id,
          doctorName: newDoctorName,
          department: newDept,
        })
      );
      setIsAssignDocModalOpen(false);
    }
  };

  // Copy to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Notifications */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearPatientSuccessMessage())}
            className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center justify-between gap-3 text-rose-800 dark:text-rose-200 text-xs font-semibold shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearPatientError())}
            className="text-rose-600 hover:text-rose-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-mono text-xs font-bold rounded-full">
              PATIENT MANAGEMENT
            </span>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono text-xs font-bold rounded-full flex items-center gap-1">
              <QrColorIcon />
              <span>QR Wristband Cryptography</span>
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            ICU Patient Census & Demographics Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Search, filter, register patients, update demographics, manage wristband cryptographic QR codes, and assign clinical staff.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Resolve QR Button */}
          <button
            onClick={() => {
              dispatch(clearScannedPatient());
              setIsResolveQrModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            title="Scan or paste wristband QR token"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Wristband QR</span>
          </button>

          {/* Sync / Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            title="Sync with Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {/* Register Patient Button */}
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Patient</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search by Patient Name, MRN, Phone or ID..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono uppercase font-bold">
            Status Filter:
          </span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'STABLE', 'ACTIVE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => dispatch(setStatusFilter(st))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900'
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
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 font-medium">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-3">Patient & ID</th>
                <th className="p-3">MRN Number</th>
                <th className="p-3">Unit / Bed</th>
                <th className="p-3">Status</th>
                <th className="p-3">Diagnosis</th>
                <th className="p-3">Attending Doctor</th>
                <th className="p-3">Emergency Contact</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No patients matching query. Click "Register New Patient" to admit one.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {(p as any).qr_token && (
                          <span className="p-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded" title="QR Wristband Assigned">
                            <QrCode className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {p.age}Y · {p.gender} · {p.bloodGroup} · ID: {p.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{p.mrn}</td>
                    <td className="p-3">
                      <span className="font-bold text-teal-700 dark:text-teal-400">{p.unitName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">{p.bedNumber}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                          p.status === 'CRITICAL'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                            : p.status === 'HIGH'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 dark:text-slate-300 max-w-[160px] truncate">
                      {p.admittingDiagnosis}
                    </td>
                    <td className="p-3 text-teal-700 dark:text-teal-400 font-bold">{p.assignedClinician}</td>
                    <td className="p-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      <div>{p.emergencyContactName} ({p.relation})</div>
                      <div>{p.emergencyContactNumber}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => handleOpenDetails(p)}
                          className="p-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-800 transition-colors cursor-pointer"
                          title="View Patient Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Wristband QR */}
                        <button
                          onClick={() => handleOpenQrModal(p)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                          title="Cryptographic Wristband QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Demographics */}
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          title="Update Demographics"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Assign Doctor */}
                        <button
                          onClick={() => {
                            setActivePatient(p);
                            setNewDoctorName(p.assignedClinician);
                            setIsAssignDocModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                          title="Assign Doctor"
                        >
                          <Stethoscope className="w-3.5 h-3.5" />
                        </button>

                        {/* Soft Delete */}
                        <button
                          onClick={() => handleOpenDelete(p)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 rounded-lg border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                          title="Soft Delete Patient"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Patients Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredPatients.map((p) => (
            <div
              key={p.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {(p as any).qr_token && (
                        <span className="p-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded">
                          <QrCode className="w-3 h-3" />
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      MRN: {p.mrn} · {p.age}Y · {p.bloodGroup}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                      p.status === 'CRITICAL'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60'
                        : p.status === 'HIGH'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="text-xs space-y-1 font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/60 mt-3">
                  <div>
                    Unit:{' '}
                    <span className="font-bold text-teal-700 dark:text-teal-400">
                      {p.unitName} ({p.bedNumber})
                    </span>
                  </div>
                  <div className="truncate">
                    Diagnosis: <span className="text-slate-800 dark:text-slate-200">{p.admittingDiagnosis}</span>
                  </div>
                  <div>
                    Doctor: <span className="font-bold text-teal-700 dark:text-teal-400">{p.assignedClinician}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => handleOpenDetails(p)}
                  className="flex-1 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Details
                </button>
                <button
                  onClick={() => handleOpenQrModal(p)}
                  className="p-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Wristband QR"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenEdit(p)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Edit Demographics"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleOpenDelete(p)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  title="Soft Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: REGISTER NEW PATIENT (POST /api/v1/patients) */}
      {/* ======================================================== */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">
                  POST /api/v1/patients
                </span>
                <h3 className="font-black text-xl text-slate-900 dark:text-white mt-0.5">
                  Register New Patient
                </h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Medical Record Number (MRN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.mrn}
                    onChange={(e) => setRegForm({ ...regForm, mrn: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    National ID / Aadhaar
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234-5678-9012"
                    value={regForm.national_id}
                    onChange={(e) => setRegForm({ ...regForm, national_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh"
                    value={regForm.first_name}
                    onChange={(e) => setRegForm({ ...regForm, first_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Verma"
                    value={regForm.last_name}
                    onChange={(e) => setRegForm({ ...regForm, last_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={regForm.date_of_birth}
                    onChange={(e) => setRegForm({ ...regForm, date_of_birth: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Gender *
                  </label>
                  <select
                    value={regForm.gender}
                    onChange={(e) => setRegForm({ ...regForm, gender: e.target.value as PatientGender })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  >
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Blood Group
                  </label>
                  <select
                    value={regForm.blood_group}
                    onChange={(e) => setRegForm({ ...regForm, blood_group: e.target.value as BloodGroup })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  >
                    <option value="A_POSITIVE">A+ (A Positive)</option>
                    <option value="A_NEGATIVE">A- (A Negative)</option>
                    <option value="B_POSITIVE">B+ (B Positive)</option>
                    <option value="B_NEGATIVE">B- (B Negative)</option>
                    <option value="AB_POSITIVE">AB+ (AB Positive)</option>
                    <option value="AB_NEGATIVE">AB- (AB Negative)</option>
                    <option value="O_POSITIVE">O+ (O Positive)</option>
                    <option value="O_NEGATIVE">O- (O Negative)</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Primary Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={regForm.primary_phone}
                    onChange={(e) => setRegForm({ ...regForm, primary_phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita Verma"
                    value={regForm.emergency_contact_name}
                    onChange={(e) => setRegForm({ ...regForm, emergency_contact_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={regForm.emergency_contact_phone}
                    onChange={(e) => setRegForm({ ...regForm, emergency_contact_phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                  Admitting Diagnosis / Condition
                </label>
                <textarea
                  rows={2}
                  value={regForm.diagnosis}
                  onChange={(e) => setRegForm({ ...regForm, diagnosis: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Register Patient</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PATIENT DETAILS (GET /api/v1/patients/{id}) */}
      {/* ======================================================== */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                  GET /api/v1/patients/{'{patient_id}'}
                </span>
                <h3 className="font-extrabold text-xl text-white mt-0.5">
                  {selectedPatientDetail
                    ? `${selectedPatientDetail.first_name} ${selectedPatientDetail.last_name}`
                    : activePatient?.name}
                </h3>
                <span className="text-xs text-teal-400 font-mono">
                  MRN: {selectedPatientDetail?.mrn || activePatient?.mrn} · Hospital ID:{' '}
                  {selectedPatientDetail?.hospital_id || 'Primary Tenant'}
                </span>
              </div>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  dispatch(clearSelectedPatientDetail());
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading && !selectedPatientDetail ? (
              <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-teal-400" />
                <span>Loading Patient Details from Backend...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Demographic Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 block text-[10px]">DOB / AGE</span>
                    <span className="text-white font-bold">
                      {selectedPatientDetail?.date_of_birth || '1985-05-12'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 block text-[10px]">GENDER</span>
                    <span className="text-white font-bold">{selectedPatientDetail?.gender || activePatient?.gender}</span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 block text-[10px]">BLOOD GROUP</span>
                    <span className="text-rose-400 font-bold">
                      {selectedPatientDetail?.blood_group || activePatient?.bloodGroup}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 block text-[10px]">PRIMARY PHONE</span>
                    <span className="text-teal-400 font-bold">
                      {selectedPatientDetail?.primary_phone || activePatient?.mobileNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 block text-[10px]">STATUS</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedPatientDetail?.status || activePatient?.status}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-500 block text-[10px]">ADMISSIONS COUNT</span>
                    <span className="text-indigo-400 font-bold">
                      {selectedPatientDetail?.admissions_count ?? 1} Recorded
                    </span>
                  </div>
                </div>

                {/* Wristband QR Banner */}
                <div className="bg-indigo-950/40 border border-indigo-800/80 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-900/60 text-indigo-300 rounded-lg">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-indigo-200 block">Bedside Cryptographic QR Wristband</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {selectedPatientDetail?.qr_token || (activePatient as any)?.qr_token
                          ? `Token: ${(selectedPatientDetail?.qr_token || (activePatient as any)?.qr_token).slice(0, 24)}...`
                          : 'No cryptographic wristband token assigned.'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (activePatient) handleOpenQrModal(activePatient);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs cursor-pointer"
                  >
                    Manage QR
                  </button>
                </div>

                {/* Emergency Contact */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                  <span className="text-slate-500 block text-[10px]">EMERGENCY CONTACT</span>
                  <div className="text-slate-200 font-bold">
                    {selectedPatientDetail?.emergency_contact_name || activePatient?.emergencyContactName || 'N/A'} (
                    {selectedPatientDetail?.emergency_contact_relation || activePatient?.relation || 'Relation'})
                  </div>
                  <div className="text-teal-400 font-mono">
                    {selectedPatientDetail?.emergency_contact_phone || activePatient?.emergencyContactNumber || 'N/A'}
                  </div>
                </div>

                {/* Created / Updated Timestamps */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                  <span>Created: {selectedPatientDetail?.created_at?.slice(0, 19).replace('T', ' ') || '2026-10-12'}</span>
                  <span>Updated: {selectedPatientDetail?.updated_at?.slice(0, 19).replace('T', ' ') || 'Live'}</span>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                {activePatient && (
                  <button
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      handleOpenEdit(activePatient);
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Demographics</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  dispatch(clearSelectedPatientDetail());
                }}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: BEDSIDE CRYPTOGRAPHIC QR WRISTBAND MODAL        */}
      {/* (POST /api/v1/patients/{id}/qr/regenerate)               */}
      {/* ======================================================== */}
      {isQrModalOpen && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  POST /api/v1/patients/{'{id}'}/qr/regenerate
                </span>
                <h3 className="font-extrabold text-lg text-white mt-0.5">Bedside Cryptographic QR Wristband</h3>
              </div>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Wristband Layout */}
            <div className="bg-gradient-to-r from-slate-950 to-indigo-950/60 p-5 rounded-2xl border border-indigo-900/60 space-y-4 shadow-inner">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-indigo-300">SMART ICU PATIENT WRISTBAND</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                  {qrData?.is_active ?? true ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* QR Token Visual Box */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-md">
                  <QrCode className="w-20 h-20 text-slate-900" />
                </div>
                <div className="space-y-1 font-mono text-xs">
                  <div className="font-extrabold text-white text-sm">{activePatient.name}</div>
                  <div className="text-slate-400">MRN: {activePatient.mrn}</div>
                  <div className="text-teal-400 font-bold">{activePatient.unitName} - {activePatient.bedNumber}</div>
                  <div className="text-[10px] text-slate-500">
                    Issued: {qrData?.issued_at ? qrData.issued_at.slice(0, 10) : 'Live Admission'}
                  </div>
                </div>
              </div>

              {/* Token String Box */}
              <div className="bg-black/50 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>CRYPTOGRAPHIC TOKEN</span>
                  <button
                    onClick={() =>
                      handleCopyText(qrData?.qr_token || (activePatient as any)?.qr_token || activePatient.mrn)
                    }
                    className="text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedToken ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-indigo-300 break-all select-all">
                  {qrData?.qr_token ||
                    (activePatient as any)?.qr_token ||
                    `WRISTBAND-SEC-${activePatient.mrn}-${activePatient.id.slice(0, 8)}`}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleRegenerateQR}
                disabled={qrLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${qrLoading ? 'animate-spin' : ''}`} />
                <span>Regenerate Cryptographic Wristband QR</span>
              </button>
              <p className="text-[10px] text-slate-400 text-center">
                Regenerating will immediately invalidate any previous physical wristband tokens.
              </p>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-5 py-2 bg-slate-800 text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: RESOLVE WRISTBAND QR TOKEN (GET /api/v1/patients/qr/{token}) */}
      {/* ======================================================== */}
      {isResolveQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-400 uppercase">
                  GET /api/v1/patients/qr/{'{token}'}
                </span>
                <h3 className="font-extrabold text-lg text-white mt-0.5">Resolve Bedside QR Wristband</h3>
              </div>
              <button
                onClick={() => setIsResolveQrModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveQR} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-xs mb-1 font-bold">
                  Enter Bedside Wristband Token *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. paste cryptographic QR token..."
                    value={resolveTokenInput}
                    onChange={(e) => setResolveTokenInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={qrLoading}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {qrLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>Resolve</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Resolved Result Display */}
            {scannedPatient && (
              <div className="bg-slate-950 p-4 rounded-xl border border-teal-800/80 space-y-3 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Patient Verified on Bedside Wristband</span>
                  </span>
                  <span className="text-[10px] font-mono bg-teal-950 text-teal-300 px-2 py-0.5 rounded border border-teal-800">
                    Active Scanner
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 text-[10px] block">PATIENT NAME</span>
                    <span className="font-bold text-white text-sm">
                      {scannedPatient.patient.first_name} {scannedPatient.patient.last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">MRN NUMBER</span>
                    <span className="text-teal-400 font-bold">{scannedPatient.patient.mrn}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">LAST SCANNED AT</span>
                    <span className="text-slate-300 text-[11px]">
                      {scannedPatient.last_scanned_at?.slice(0, 19).replace('T', ' ') || 'Just now'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">ADMISSION STATUS</span>
                    <span className="text-indigo-400 font-bold">
                      {scannedPatient.active_admission ? 'Admitted to Bed' : 'Census Active'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsResolveQrModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: EDIT DEMOGRAPHICS (PUT /api/v1/patients/{id})    */}
      {/* ======================================================== */}
      {isEditModalOpen && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl w-full space-y-6 shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-teal-600 uppercase">
                  PUT /api/v1/patients/{'{id}'}
                </span>
                <h3 className="font-black text-xl text-slate-900 dark:text-white mt-0.5">
                  Update Demographics: {activePatient.name}
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs font-medium">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    National ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234-5678-9012"
                    value={editForm.national_id}
                    onChange={(e) => setEditForm({ ...editForm, national_id: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Primary Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.primary_phone}
                    onChange={(e) => setEditForm({ ...editForm, primary_phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Blood Group
                  </label>
                  <select
                    value={editForm.blood_group}
                    onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value as BloodGroup })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  >
                    <option value="A_POSITIVE">A+ (A Positive)</option>
                    <option value="A_NEGATIVE">A- (A Negative)</option>
                    <option value="B_POSITIVE">B+ (B Positive)</option>
                    <option value="B_NEGATIVE">B- (B Negative)</option>
                    <option value="AB_POSITIVE">AB+ (AB Positive)</option>
                    <option value="AB_NEGATIVE">AB- (AB Negative)</option>
                    <option value="O_POSITIVE">O+ (O Positive)</option>
                    <option value="O_NEGATIVE">O- (O Negative)</option>
                    <option value="UNKNOWN">UNKNOWN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Patient Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as PatientStatus })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="DECEASED">DECEASED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={editForm.emergency_contact_name}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.emergency_contact_phone}
                    onChange={(e) => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 font-mono text-slate-900 dark:text-white focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {updating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 6: SOFT DELETE PATIENT (DELETE /api/v1/patients/{id})*/}
      {/* ======================================================== */}
      {isDeleteModalOpen && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900/60">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-rose-500">
                  DELETE /api/v1/patients/{'{id}'}
                </span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  Soft Delete Patient Record
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to deactivate and soft delete patient{' '}
              <strong className="text-slate-900 dark:text-white font-mono">{activePatient.name}</strong> (MRN:{' '}
              {activePatient.mrn})?
            </p>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-xs mb-1 font-bold">
                Clinical / Administrative Justification Reason:
              </label>
              <textarea
                rows={2}
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Soft Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 7: ASSIGN DOCTOR MODAL                             */}
      {/* ======================================================== */}
      {isAssignDocModalOpen && activePatient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Assign Doctor to {activePatient.name}</h3>
              <button onClick={() => setIsAssignDocModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-400 mb-1 font-bold">Select Attending Doctor</label>
                <select
                  value={newDoctorName}
                  onChange={(e) => setNewDoctorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={`${d.name} (${d.department})`}>
                      {d.name} - {d.department} ({d.qualification})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Department / Unit</label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                >
                </input>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button onClick={() => setIsAssignDocModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs cursor-pointer">
                Cancel
              </button>
              <button onClick={handleAssignDoctor} className="px-5 py-2 bg-teal-500 text-white rounded-xl font-bold text-xs cursor-pointer">
                Confirm Doctor Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const QrColorIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </svg>
);

export default AdminPatientsPage;
