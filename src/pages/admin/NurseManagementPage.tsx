import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import {
  addNurse,
  toggleNurseStatus,
  updateNurseRemark
} from '../../store/slices/superAdminSlice';
import { SuperAdminNurseRecord } from '../../types/superAdmin';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  History,
  Building2,
  MapPin,
  Phone,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { clean10DigitPhone, validate10DigitPhone, format10DigitPhone, validateEmail } from '../../utils/validation';

export const NurseManagementPage: React.FC = () => {
  const dispatch = useDispatch();
  const { nurses, districts, hospitals } = useSelector((state: RootState) => state.superAdmin);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [hospitalFilter, setHospitalFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddNurseModal, setShowAddNurseModal] = useState(false);
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

  // Form state
  const [newNurseForm, setNewNurseForm] = useState({
    nurseId: `NUR-${Math.floor(2000 + Math.random() * 8000)}`,
    name: '',
    mobile: '',
    email: '',
    qualification: 'B.Sc Nursing, Critical Care Cert.',
    department: 'Intensive Care Unit',
    hospitalId: hospitals[0]?.id || '',
    experience: '5 Years',
    shift: 'Morning Shift' as const,
    remarks: 'Initial onboarding by Command Center'
  });
  const [nurseMobileError, setNurseMobileError] = useState<string | null>(null);
  const [nurseEmailError, setNurseEmailError] = useState<string | null>(null);

  const filteredNurses = nurses.filter(nurse => {
    if (districtFilter !== 'ALL' && nurse.district !== districtFilter) return false;
    if (hospitalFilter !== 'ALL' && nurse.hospitalId !== hospitalFilter) return false;
    if (statusFilter !== 'ALL' && nurse.status !== statusFilter) return false;
    if (searchTerm) {
      const match =
        nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nurse.nurseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nurse.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nurse.hospitalName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  const handleCreateNurse = (e: React.FormEvent) => {
    e.preventDefault();
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

    const targetHosp = hospitals.find(h => h.id === newNurseForm.hospitalId) || hospitals[0];
    dispatch(
      addNurse({
        ...newNurseForm,
        hospitalName: targetHosp.name,
        district: targetHosp.district,
        status: 'Active'
      })
    );
    setShowAddNurseModal(false);
  };

  const handleSaveRemark = () => {
    if (!remarkTarget || !newRemarkInput.trim()) return;
    dispatch(
      updateNurseRemark({
        nurseId: remarkTarget.id,
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
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#0F766E]">
              Nursing Staff Registry
            </h1>
            <p className="text-xs text-slate-500 font-medium">Add, edit, assign, and update nursing personnel across districts</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddNurseModal(true)}
          className="px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Nurse</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search nurse by name, ID, ward..."
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

      {/* Nurse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNurses.map(nurse => (
          <div
            key={nurse.id}
            className="bg-white border border-slate-200 hover:border-teal-500 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-[#0F766E]">
                    {nurse.nurseId}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">{nurse.name}</h3>
                  <p className="text-xs text-[#0F766E] font-bold">{nurse.department}</p>
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

              <div className="space-y-1.5 mt-3 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span className="font-bold text-slate-900">{nurse.hospitalName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{nurse.district} District</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  <span>{nurse.mobile}</span>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-[#0F766E]" /> Command Center Remark:
                </span>
                <p className="text-xs text-slate-800 italic">{nurse.remarks || 'No remarks added yet.'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setRemarkTarget({
                    id: nurse.id,
                    name: nurse.name,
                    currentRemark: nurse.remarks
                  });
                  setNewRemarkInput(nurse.remarks);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-[#0F766E] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
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
              All previous remarks are preserved in historical audit records.
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
                Nurse Remark History Logs: {viewHistoryTarget.name}
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

      {/* ADD NURSE MODAL */}
      {showAddNurseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNurse}
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-slate-900">Register New Nurse</h3>

            <div>
              <label className="text-xs text-slate-600 font-bold block mb-1">Target Hospital</label>
              <select
                value={newNurseForm.hospitalId}
                onChange={e => setNewNurseForm({ ...newNurseForm, hospitalId: e.target.value })}
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
              placeholder="Nurse Full Name"
              required
              value={newNurseForm.name}
              onChange={e => setNewNurseForm({ ...newNurseForm, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Department / Unit *</label>
                <input
                  type="text"
                  placeholder="Department / Unit"
                  required
                  value={newNurseForm.department}
                  onChange={e => setNewNurseForm({ ...newNurseForm, department: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0F766E]"
                />
              </div>
            </div>

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
    </div>
  );
};

export default NurseManagementPage;
