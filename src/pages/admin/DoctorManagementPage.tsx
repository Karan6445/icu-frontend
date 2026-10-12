import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  addDoctor,
  toggleDoctorStatus,
  updateDoctorRemark
} from '../../store/slices/superAdminSlice';
import { SuperAdminDoctorRecord } from '../../types/superAdmin';
import {
  UserCheck,
  Search,
  Filter,
  Plus,
  Edit,
  History,
  Building2,
  MapPin,
  Phone,
  Mail,
  Award,
  Clock,
  MessageSquare,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { clean10DigitPhone, validate10DigitPhone, format10DigitPhone, validateEmail } from '../../utils/validation';

export const DoctorManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const { doctors, districts, hospitals } = useSelector((state: RootState) => state.superAdmin);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [remarkTarget, setRemarkTarget] = useState<{
    id: string;
    name: string;
    currentRemark: string;
  } | null>(null);
  const [newRemarkInput, setNewRemarkInput] = useState('');
  const [viewHistoryTarget, setViewHistoryTarget] = useState<{
    name: string;
    history: any[];
  } | null>(null);

  // Add doctor form state
  const [newDocForm, setNewDocForm] = useState({
    doctorId: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    mobile: '',
    email: '',
    qualification: 'MD, DM Critical Care',
    specialization: 'Critical Care Specialist',
    department: 'Intensive Care Unit',
    hospitalId: hospitals[0]?.id || '',
    experience: '8 Years',
    shift: 'Morning Shift' as const,
    remarks: 'Initial onboarding by Command Center'
  });
  const [docMobileError, setDocMobileError] = useState<string | null>(null);
  const [docEmailError, setDocEmailError] = useState<string | null>(null);

  const filteredDoctors = doctors.filter(doc => {
    if (districtFilter !== 'ALL' && doc.district !== districtFilter) return false;
    if (hospitalFilter !== 'ALL' && doc.hospitalId !== hospitalFilter) return false;
    if (statusFilter !== 'ALL' && doc.status !== statusFilter) return false;
    if (searchTerm) {
      const match =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.doctorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
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

    const targetHosp = hospitals.find(h => h.id === newDocForm.hospitalId) || hospitals[0];
    dispatch(
      addDoctor({
        ...newDocForm,
        hospitalName: targetHosp.name,
        district: targetHosp.district,
        status: 'Active'
      })
    );
    setShowAddDoctorModal(false);
  };

  const handleSaveRemark = () => {
    if (!remarkTarget || !newRemarkInput.trim()) return;
    dispatch(
      updateDoctorRemark({
        doctorId: remarkTarget.id,
        updatedRemark: newRemarkInput,
        updatedBy: 'Dr. Vikramaditya Sen'
      })
    );
    setRemarkTarget(null);
    setNewRemarkInput('');
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen text-slate-900 rounded-3xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-[#0F766E]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F766E]">
              Doctor Network Registry
            </h1>
            <p className="text-xs text-slate-500 font-medium">Add, edit, assign, and update official doctor records across districts</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddDoctorModal(true)}
          className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Doctor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctor by name, ID, specialty..."
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
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            className="bg-white border border-slate-200 hover:border-teal-500 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E]">
                    {doc.doctorId}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{doc.name}</h3>
                  <p className="text-xs text-[#0F766E] font-bold">{doc.specialization}</p>
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

              <div className="space-y-1.5 mt-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span className="font-bold text-slate-900">{doc.hospitalName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{doc.district} District</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{doc.mobile}</span>
                </div>
              </div>

              {/* Current Remark Box */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#0F766E]" /> Command Center Remark:
                </span>
                <p className="text-xs text-slate-800 italic">{doc.remarks || 'No remarks added yet.'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setRemarkTarget({
                    id: doc.id,
                    name: doc.name,
                    currentRemark: doc.remarks
                  });
                  setNewRemarkInput(doc.remarks);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F766E] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
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
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* UPDATE REMARK MODAL */}
      {remarkTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              Update Official Remark for {remarkTarget.name}
            </h3>
            <p className="text-xs text-slate-500">
              All previous remarks are preserved in the immutable audit history.
            </p>

            <textarea
              rows={4}
              value={newRemarkInput}
              onChange={e => setNewRemarkInput(e.target.value)}
              placeholder="Enter official Command Center remark..."
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
                Save & Preserve History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL REMARKS DRAWER */}
      {viewHistoryTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Remark Log History: {viewHistoryTarget.name}
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
                    <p className="text-emerald-700 font-bold mt-1">New: {hist.updatedRemark}</p>
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
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900">Register New Doctor</h3>

            <div>
              <label className="text-xs text-slate-600 font-bold block mb-1">Target Hospital</label>
              <select
                value={newDocForm.hospitalId}
                onChange={e => setNewDocForm({ ...newDocForm, hospitalId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.district})
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder="Doctor Full Name (e.g. Dr. Ramesh Kumar)"
              required
              value={newDocForm.name}
              onChange={e => setNewDocForm({ ...newDocForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            </div>

            <input
              type="text"
              placeholder="Specialization (e.g. Pulmonology, Critical Care)"
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
                Register & Save Doctor
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default DoctorManagementPage;
