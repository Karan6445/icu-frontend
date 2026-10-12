import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  setSelectedHospitalId,
  addDoctor,
  addNurse,
  addICUBed,
  toggleDoctorStatus,
  toggleNurseStatus,
  updateDoctorRemark,
  updateNurseRemark,
  updateICUBed,
  updateHospital
} from '../../store/slices/superAdminSlice';
import {
  Building2,
  Activity,
  UserCheck,
  Users,
  Bed,
  FileText,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Plus,
  Edit,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Printer,
  Download,
  ArrowLeft,
  MessageSquare,
  GitFork,
  Globe,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clean10DigitPhone, validate10DigitPhone, format10DigitPhone, validateEmail } from '../../utils/validation';
import { hospitalApi, HospitalHierarchyResponse } from '../../api/hospitalApi';

export const HospitalDetailsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hospitals, selectedHospitalId, doctors, nurses, icuBeds, patients, auditLogs } = useSelector(
    (state: RootState) => state.superAdmin
  );

  const [activeTab, setActiveTab] = useState<
    'overview' | 'icu' | 'doctors' | 'nurses' | 'patients' | 'reports' | 'audit' | 'hierarchy'
  >('overview');

  const [hierarchyData, setHierarchyData] = useState<HospitalHierarchyResponse | null>(null);
  const [isHierarchyLoading, setIsHierarchyLoading] = useState(false);
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);

  const hospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

  React.useEffect(() => {
    if (activeTab === 'hierarchy' && hospital?.id) {
      setIsHierarchyLoading(true);
      setHierarchyError(null);
      hospitalApi.hierarchy(hospital.id)
        .then(res => setHierarchyData(res.data))
        .catch(err => setHierarchyError(err.message || 'Failed to fetch location hierarchy.'))
        .finally(() => setIsHierarchyLoading(false));
    }
  }, [activeTab, hospital?.id]);

  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [showAddNurseModal, setShowAddNurseModal] = useState(false);
  const [showAddBedModal, setShowAddBedModal] = useState(false);

  const [remarkTarget, setRemarkTarget] = useState<{
    type: 'doctor' | 'nurse';
    id: string;
    name: string;
    currentRemark: string;
  } | null>(null);
  const [newRemarkInput, setNewRemarkInput] = useState('');

  const [viewHistoryTarget, setViewHistoryTarget] = useState<{
    name: string;
    history: any[];
  } | null>(null);

  const hospitalDoctors = doctors.filter(d => d.hospitalId === hospital.id || d.hospitalName === hospital.name);
  const hospitalNurses = nurses.filter(n => n.hospitalId === hospital.id || n.hospitalName === hospital.name);
  const hospitalBeds = icuBeds.filter(b => b.hospitalId === hospital.id || b.hospitalName === hospital.name);
  const hospitalPatients = patients.filter(p => p.hospitalId === hospital.id || p.hospitalName === hospital.name);
  const hospitalAuditLogs = auditLogs.filter(a => a.hospital === hospital.name || a.district === hospital.district);

  const [newDocForm, setNewDocForm] = useState({
    doctorId: `DOC-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    mobile: '',
    email: '',
    qualification: 'MD, DM Critical Care',
    specialization: 'Critical Care Specialist',
    department: 'Intensive Care Unit',
    experience: '8 Years',
    shift: 'Morning Shift' as const,
    remarks: 'Assigned by Command Center'
  });

  const [newNurseForm, setNewNurseForm] = useState({
    nurseId: `NUR-${Math.floor(100 + Math.random() * 900)}`,
    name: '',
    mobile: '',
    email: '',
    qualification: 'B.Sc Nursing, Critical Care Cert.',
    department: 'ICU Ward A',
    experience: '5 Years',
    shift: 'Morning Shift' as const,
    remarks: 'Assigned by Command Center'
  });
  const [docMobileError, setDocMobileError] = useState<string | null>(null);
  const [docEmailError, setDocEmailError] = useState<string | null>(null);
  const [nurseMobileError, setNurseMobileError] = useState<string | null>(null);
  const [nurseEmailError, setNurseEmailError] = useState<string | null>(null);

  const [newBedForm, setNewBedForm] = useState({
    bedNumber: `ICU-B${Math.floor(100 + Math.random() * 900)}`,
    icuType: 'Medical ICU' as const,
    status: 'Available' as const
  });

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.name) return;
    const phoneValidation = validate10DigitPhone(newDocForm.mobile, 'Mobile number', true);
    if (phoneValidation !== true) {
      setDocMobileError(phoneValidation);
      return;
    }
    setDocMobileError(null);

    const emailValidation = validateEmail(newDocForm.email, 'Email address', true);
    if (emailValidation !== true) {
      setDocEmailError(emailValidation);
      return;
    }
    setDocEmailError(null);

    dispatch(
      addDoctor({
        ...newDocForm,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        district: hospital.district,
        status: 'Active'
      })
    );
    setShowAddDoctorModal(false);
  };

  const handleCreateNurse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNurseForm.name) return;
    const phoneValidation = validate10DigitPhone(newNurseForm.mobile, 'Mobile number', true);
    if (phoneValidation !== true) {
      setNurseMobileError(phoneValidation);
      return;
    }
    setNurseMobileError(null);

    const emailValidation = validateEmail(newNurseForm.email, 'Email address', true);
    if (emailValidation !== true) {
      setNurseEmailError(emailValidation);
      return;
    }
    setNurseEmailError(null);

    dispatch(
      addNurse({
        ...newNurseForm,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        district: hospital.district,
        status: 'Active'
      })
    );
    setShowAddNurseModal(false);
  };

  const handleCreateBed = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      addICUBed({
        ...newBedForm,
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        district: hospital.district
      })
    );
    setShowAddBedModal(false);
  };

  const handleSaveRemark = () => {
    if (!remarkTarget || !newRemarkInput.trim()) return;
    if (remarkTarget.type === 'doctor') {
      dispatch(
        updateDoctorRemark({
          doctorId: remarkTarget.id,
          updatedRemark: newRemarkInput,
          updatedBy: 'Dr. Vikramaditya Sen'
        })
      );
    } else {
      dispatch(
        updateNurseRemark({
          nurseId: remarkTarget.id,
          updatedRemark: newRemarkInput,
          updatedBy: 'Dr. Vikramaditya Sen'
        })
      );
    }
    setRemarkTarget(null);
    setNewRemarkInput('');
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Hospital Switcher & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/districts')}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-[#0F766E] border border-teal-200">
                {hospital.code}
              </span>
              <span className="text-xs text-slate-500 font-bold">{hospital.district} District</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{hospital.name}</h1>
          </div>
        </div>

        {/* Hospital Dropdown Switcher */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-bold hidden sm:inline">Switch Hospital:</span>
          <select
            value={hospital.id}
            onChange={e => dispatch(setSelectedHospitalId(e.target.value))}
            className="bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-[#0F766E] font-bold focus:outline-none focus:border-[#0F766E]"
          >
            {hospitals.map(h => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 7 Tabs Header Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'overview', label: '1. Overview', icon: Building2 },
          { id: 'icu', label: '2. ICU Beds Grid', icon: Bed },
          { id: 'doctors', label: `3. Doctors (${hospitalDoctors.length})`, icon: UserCheck },
          { id: 'nurses', label: `4. Nurses (${hospitalNurses.length})`, icon: Users },
          { id: 'patients', label: `5. Patients (${hospitalPatients.length})`, icon: Activity },
          { id: 'reports', label: '6. Reports Console', icon: FileText },
          { id: 'audit', label: '7. Audit Logs', icon: ShieldCheck },
          { id: 'hierarchy', label: '8. Location Hierarchy', icon: GitFork }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#0F766E] text-white shadow-md border border-teal-700'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-teal-50 rounded-xl text-[#0F766E] border border-teal-200">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Facility Type</span>
                <span className="text-sm font-bold text-slate-900">{hospital.type}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-200">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Location & Address</span>
                <span className="text-xs font-bold text-slate-900">{hospital.address}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-cyan-50 rounded-xl text-cyan-700 border border-cyan-200">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Emergency Contact</span>
                <span className="text-xs font-bold text-slate-900">{hospital.contactNumber}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bed className="w-5 h-5 text-[#0F766E]" />
              <span>ICU Capacity & Bed Availability Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                <span className="text-xs text-slate-500 block">Total ICU Beds</span>
                <span className="text-2xl font-black text-slate-900 mt-1">{hospital.totalICUBeds}</span>
              </div>
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 text-center">
                <span className="text-xs text-emerald-700 font-bold block">Available Beds</span>
                <span className="text-2xl font-black text-emerald-700 mt-1">{hospital.availableICUBeds}</span>
              </div>
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200 text-center">
                <span className="text-xs text-rose-700 font-bold block">Occupied Beds</span>
                <span className="text-2xl font-black text-rose-700 mt-1">{hospital.occupiedICUBeds}</span>
              </div>
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-center">
                <span className="text-xs text-amber-700 font-bold block">Reserved / Maint.</span>
                <span className="text-2xl font-black text-amber-700 mt-1">
                  {hospital.reservedICUBeds + hospital.maintenanceICUBeds}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ICU BEDS GRID */}
      {activeTab === 'icu' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Available
              </span>
              <span className="flex items-center gap-1.5 text-rose-700">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Occupied
              </span>
              <span className="flex items-center gap-1.5 text-amber-700">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Reserved
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-slate-500 inline-block" /> Maintenance
              </span>
            </div>

            <button
              onClick={() => setShowAddBedModal(true)}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New ICU Bed</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {hospitalBeds.map(bed => {
              const colorMap = {
                Available: 'bg-emerald-50 border-emerald-300 text-emerald-900',
                Occupied: 'bg-rose-50 border-rose-300 text-rose-900',
                Reserved: 'bg-amber-50 border-amber-300 text-amber-900',
                Maintenance: 'bg-slate-100 border-slate-300 text-slate-700'
              };

              return (
                <div
                  key={bed.id}
                  className={`p-4 rounded-2xl border ${colorMap[bed.status]} flex flex-col justify-between space-y-3 relative group hover:scale-105 transition-all shadow-2xs`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-900">
                      {bed.bedNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase">{bed.status}</span>
                  </div>

                  <div>
                    <span className="text-[10px] block font-medium opacity-80">{bed.icuType}</span>
                    {bed.patientName && (
                      <p className="text-xs font-bold text-slate-900 truncate mt-1">
                        Pt: {bed.patientName}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] font-medium text-slate-600">
                    <span>Dr: {bed.doctorName || 'Unassigned'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: DOCTORS */}
      {activeTab === 'doctors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">Assigned Doctors List</h3>
            <button
              onClick={() => setShowAddDoctorModal(true)}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Doctor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitalDoctors.map(doc => (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E]">
                        {doc.doctorId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{doc.name}</h4>
                      <p className="text-xs text-[#0F766E] font-semibold">{doc.specialization}</p>
                    </div>
                    <button
                      onClick={() =>
                        dispatch(
                          toggleDoctorStatus({
                            doctorId: doc.id,
                            status: doc.status === 'Active' ? 'On Leave' : 'Active'
                          })
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        doc.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {doc.status}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Mobile</span>
                      <span className="text-slate-900 font-medium">{doc.mobile}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Shift</span>
                      <span className="text-slate-900 font-medium">{doc.shift}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-[#0F766E]" /> Current Command Center Remark:
                    </span>
                    <p className="text-xs text-slate-800 italic">{doc.remarks || 'No remarks added yet.'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setRemarkTarget({
                        type: 'doctor',
                        id: doc.id,
                        name: doc.name,
                        currentRemark: doc.remarks
                      });
                      setNewRemarkInput(doc.remarks);
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F766E] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Update Remark</span>
                  </button>

                  <button
                    onClick={() =>
                      setViewHistoryTarget({
                        name: doc.name,
                        history: doc.remarkHistory || []
                      })
                    }
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: NURSES */}
      {activeTab === 'nurses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900">Assigned Nurses List</h3>
            <button
              onClick={() => setShowAddNurseModal(true)}
              className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Nurse</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitalNurses.map(nurse => (
              <div
                key={nurse.id}
                className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E]">
                        {nurse.nurseId}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{nurse.name}</h4>
                      <p className="text-xs text-[#0F766E] font-semibold">{nurse.department}</p>
                    </div>
                    <button
                      onClick={() =>
                        dispatch(
                          toggleNurseStatus({
                            nurseId: nurse.id,
                            status: nurse.status === 'Active' ? 'On Leave' : 'Active'
                          })
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        nurse.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {nurse.status}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 my-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Mobile</span>
                      <span className="text-slate-900 font-medium">{nurse.mobile}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Shift</span>
                      <span className="text-slate-900 font-medium">{nurse.shift}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <MessageSquare className="w-3 h-3 text-[#0F766E]" /> Current Command Center Remark:
                    </span>
                    <p className="text-xs text-slate-800 italic">{nurse.remarks || 'No remarks added yet.'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setRemarkTarget({
                        type: 'nurse',
                        id: nurse.id,
                        name: nurse.name,
                        currentRemark: nurse.remarks
                      });
                      setNewRemarkInput(nurse.remarks);
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F766E] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Update Remark</span>
                  </button>

                  <button
                    onClick={() =>
                      setViewHistoryTarget({
                        name: nurse.name,
                        history: nurse.remarkHistory || []
                      })
                    }
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PATIENTS */}
      {activeTab === 'patients' && (
        <div className="space-y-6">
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-4 px-6">Patient ID & Name</th>
                  <th className="py-4 px-6">Age / Gender</th>
                  <th className="py-4 px-6">Bed & Ward</th>
                  <th className="py-4 px-6">Attending Doctor</th>
                  <th className="py-4 px-6">Risk Status</th>
                  <th className="py-4 px-6">Admission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {hospitalPatients.map(pat => (
                  <tr key={pat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-teal-50 text-[#0F766E] rounded">
                        {pat.patientId}
                      </span>
                      <p className="font-bold text-slate-900 mt-1 text-sm">{pat.name}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {pat.age} Yrs / {pat.gender}
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[#0F766E]">{pat.bedNumber}</span>
                      <p className="text-[10px] text-slate-500">{pat.wardType}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-800 font-medium">{pat.doctorName}</td>
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
                    <td className="py-4 px-6 text-slate-500 font-mono">{pat.admissionDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hospital Compliance & Utilization Report</h3>
              <p className="text-xs text-slate-500">Generated on demand for Command Center audit review</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-600" /> Print Report
              </button>
              <button className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer">
                <Download className="w-4 h-4" /> Export PDF/CSV
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Doctors Assigned</span>
              <span className="text-xl font-bold text-[#0F766E] mt-1">{hospitalDoctors.length}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Nurses Assigned</span>
              <span className="text-xl font-bold text-cyan-700 mt-1">{hospitalNurses.length}</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Current ICU Occupancy Rate</span>
              <span className="text-xl font-bold text-emerald-700 mt-1">
                {Math.round((hospital.occupiedICUBeds / (hospital.totalICUBeds || 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
            <span>Hospital Audit Trail (Read-Only)</span>
          </h3>

          <div className="space-y-3">
            {hospitalAuditLogs.map(log => (
              <div
                key={log.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F766E]">{log.action}</span>
                    <span className="text-slate-600">by {log.user} ({log.userRole})</span>
                  </div>
                  {log.newValue && <p className="text-slate-800 font-medium">New Value: {log.newValue}</p>}
                  {log.oldValue && <p className="text-slate-500">Previous: {log.oldValue}</p>}
                </div>
                <span className="text-slate-500 font-mono text-[10px]">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: LOCATION HIERARCHY */}
      {activeTab === 'hierarchy' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GitFork className="w-5 h-5 text-[#0F766E]" />
                <span>State & District Administrative Location Hierarchy</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                GET /api/v1/hospitals/{hospital.id}/hierarchy
              </p>
            </div>
            <button
              onClick={() => {
                if (hospital?.id) {
                  setIsHierarchyLoading(true);
                  setHierarchyError(null);
                  hospitalApi.hierarchy(hospital.id)
                    .then(res => setHierarchyData(res.data))
                    .catch(err => setHierarchyError(err.message || 'Failed to refresh hierarchy.'))
                    .finally(() => setIsHierarchyLoading(false));
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isHierarchyLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Tree</span>
            </button>
          </div>

          {isHierarchyLoading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-2">
              <RefreshCw className="w-6 h-6 text-[#0F766E] animate-spin" />
              <span className="text-xs text-slate-500 font-mono">
                Querying Command Center location tree...
              </span>
            </div>
          )}

          {hierarchyError && (
            <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{hierarchyError}</span>
            </div>
          )}

          {hierarchyData && (
            <div className="space-y-6">
              {/* Hierarchical Node Cards */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider block">
                  Topological Governance Flow
                </span>

                <div className="space-y-3">
                  {/* 1. State */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
                    <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">State Tier</span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {hierarchyData.state?.name || hospital.state || 'National Health Administration'}
                        {hierarchyData.state?.code && (
                          <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                            {hierarchyData.state.code}
                          </span>
                        )}
                      </h4>
                    </div>
                  </div>

                  {/* 2. District */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 ml-6">
                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">District Tier</span>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {hierarchyData.district?.name || hospital.district || 'Health District Zone'}
                        {hierarchyData.district?.code && (
                          <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                            {hierarchyData.district.code}
                          </span>
                        )}
                      </h4>
                    </div>
                  </div>

                  {/* 3. Facility */}
                  <div className="p-3.5 bg-teal-50/80 rounded-xl border border-teal-300 shadow-xs flex items-center justify-between gap-3 ml-12">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-4 h-4 text-teal-500 shrink-0" />
                      <div className="p-2 bg-teal-600 rounded-lg text-white">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-teal-700 uppercase font-bold">
                          Facility Node Tier
                        </span>
                        <h4 className="font-black text-slate-900 text-sm">
                          {hierarchyData.name} ({hierarchyData.code})
                        </h4>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full font-mono font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {hierarchyData.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Associated Clinical Users */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0F766E]" />
                  <span>Assigned Healthcare Professionals ({hierarchyData.users?.length || 0})</span>
                </h4>

                {hierarchyData.users && hierarchyData.users.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {hierarchyData.users.map(u => (
                      <div
                        key={u.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 hover:border-teal-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">
                            {u.first_name} {u.last_name}
                          </span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                            {u.status}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 block truncate">
                          {u.email}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 bg-slate-50 rounded-xl">
                    No individual healthcare professionals directly linked in this tier yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REMARK UPDATE MODAL */}
      {remarkTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Update Remark for {remarkTarget.name}
            </h3>
            <p className="text-xs text-slate-500">
              Remarks are preserved in historical logs. Previous remarks will never be overwritten.
            </p>

            <textarea
              rows={4}
              value={newRemarkInput}
              onChange={e => setNewRemarkInput(e.target.value)}
              placeholder="Enter new official Command Center remark..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-[#0F766E]"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRemarkTarget(null)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemark}
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save Remark & Record History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL REMARK DRAWER MODAL */}
      {viewHistoryTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Remark History Logs: {viewHistoryTarget.name}
              </h3>
              <button
                onClick={() => setViewHistoryTarget(null)}
                className="px-3 py-1 bg-slate-200 text-slate-800 rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-2">
              {viewHistoryTarget.history.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No historical remark updates logged yet.</p>
              ) : (
                viewHistoryTarget.history.map((hist: any) => (
                  <div key={hist.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span>Updated by: {hist.updatedBy}</span>
                      <span>{hist.timestamp}</span>
                    </div>
                    <p className="text-emerald-700 font-bold mt-1 font-sans">New: {hist.updatedRemark}</p>
                    <p className="text-slate-600 text-[11px]">Previous: {hist.previousRemark}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD DOCTOR MODAL */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateDoctor}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900">Add Doctor to {hospital.name}</h3>
            <input
              type="text"
              placeholder="Doctor Full Name"
              required
              value={newDocForm.name}
              onChange={e => setNewDocForm({ ...newDocForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Mobile Number *</label>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  clean10DigitPhone(newDocForm.mobile).length === 10
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-500 bg-slate-100'
                }`}>
                  {clean10DigitPhone(newDocForm.mobile).length}/10 digits
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                required
                value={newDocForm.mobile}
                onChange={e => {
                  setNewDocForm({ ...newDocForm, mobile: clean10DigitPhone(e.target.value) });
                  if (docMobileError) setDocMobileError(null);
                }}
                className={`w-full bg-slate-50 border ${
                  docMobileError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none transition-colors`}
              />
              {docMobileError && (
                <span className="text-rose-600 text-[10px] mt-1 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {docMobileError}
                </span>
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="doctor@hospital.org"
                required
                value={newDocForm.email}
                onChange={e => {
                  setNewDocForm({ ...newDocForm, email: e.target.value });
                  if (docEmailError) setDocEmailError(null);
                }}
                className={`w-full bg-slate-50 border ${
                  docEmailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none transition-colors`}
              />
              {docEmailError && (
                <span className="text-rose-600 text-[10px] mt-1 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {docEmailError}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Specialization (e.g. Critical Care, Cardiology)"
              required
              value={newDocForm.specialization}
              onChange={e => setNewDocForm({ ...newDocForm, specialization: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddDoctorModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Register Doctor
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD NURSE MODAL */}
      {showAddNurseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNurse}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900">Add Nurse to {hospital.name}</h3>
            <input
              type="text"
              placeholder="Nurse Full Name"
              required
              value={newNurseForm.name}
              onChange={e => setNewNurseForm({ ...newNurseForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700">Mobile Number *</label>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  clean10DigitPhone(newNurseForm.mobile).length === 10
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-500 bg-slate-100'
                }`}>
                  {clean10DigitPhone(newNurseForm.mobile).length}/10 digits
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile number"
                required
                value={newNurseForm.mobile}
                onChange={e => {
                  setNewNurseForm({ ...newNurseForm, mobile: clean10DigitPhone(e.target.value) });
                  if (nurseMobileError) setNurseMobileError(null);
                }}
                className={`w-full bg-slate-50 border ${
                  nurseMobileError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none transition-colors`}
              />
              {nurseMobileError && (
                <span className="text-rose-600 text-[10px] mt-1 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {nurseMobileError}
                </span>
              )}
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Email Address *</label>
              <input
                type="email"
                placeholder="nurse@hospital.org"
                required
                value={newNurseForm.email}
                onChange={e => {
                  setNewNurseForm({ ...newNurseForm, email: e.target.value });
                  if (nurseEmailError) setNurseEmailError(null);
                }}
                className={`w-full bg-slate-50 border ${
                  nurseEmailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none transition-colors`}
              />
              {nurseEmailError && (
                <span className="text-rose-600 text-[10px] mt-1 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 inline shrink-0" />
                  {nurseEmailError}
                </span>
              )}
            </div>
            <input
              type="text"
              placeholder="Department / Unit"
              required
              value={newNurseForm.department}
              onChange={e => setNewNurseForm({ ...newNurseForm, department: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddNurseModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Register Nurse
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD BED MODAL */}
      {showAddBedModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateBed}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900">Add ICU Bed to {hospital.name}</h3>
            <input
              type="text"
              placeholder="Bed Number (e.g. ICU-B105)"
              required
              value={newBedForm.bedNumber}
              onChange={e => setNewBedForm({ ...newBedForm, bedNumber: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />
            <select
              value={newBedForm.icuType}
              onChange={e => setNewBedForm({ ...newBedForm, icuType: e.target.value as any })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            >
              <option value="Medical ICU">Medical ICU</option>
              <option value="Surgical ICU">Surgical ICU</option>
              <option value="Cardiac ICU">Cardiac ICU</option>
              <option value="Neuro ICU">Neuro ICU</option>
              <option value="Pediatric ICU">Pediatric ICU</option>
              <option value="Neonatal ICU">Neonatal ICU</option>
            </select>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddBedModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Create Bed
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HospitalDetailsPage;
