import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addDoctor } from '../../store/slices/hospitalAdminSlice';
import { ShiftType, StaffStatus } from '../../types/hospitalAdmin';
import {
  Stethoscope,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  Mail,
  Phone,
  Building2,
  Lock,
  Calendar,
  X,
  CheckCircle2,
  Users,
  AlertCircle
} from 'lucide-react';
import { clean10DigitPhone, validate10DigitPhone, format10DigitPhone, validateEmail } from '../../utils/validation';

export const HospitalAdminDoctorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { doctors, icus, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [icuFilter, setIcuFilter] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State for Adding Doctor
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [specialization, setSpecialization] = useState('Pulmonology & Critical Care');
  const [qualification, setQualification] = useState('MD, DM (Critical Care)');
  const [assignedICUId, setAssignedICUId] = useState('ICU-MICU');
  const [shift, setShift] = useState<ShiftType>('MORNING');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<StaffStatus>('ACTIVE');

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIcu = icuFilter === 'ALL' || doc.assignedICUId === icuFilter;
    const matchesShift = shiftFilter === 'ALL' || doc.shift === shiftFilter;
    return matchesSearch && matchesIcu && matchesShift;
  });

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !employeeId) return;

    const emailValidation = validateEmail(email, 'Email address', true);
    if (emailValidation !== true) {
      setEmailError(emailValidation);
      return;
    }
    setEmailError(null);

    const phoneValidation = validate10DigitPhone(phone, 'Phone number', true);
    if (phoneValidation !== true) {
      setPhoneError(phoneValidation);
      return;
    }
    setPhoneError(null);

    const selectedIcuObj = icus.find(i => i.id === assignedICUId);
    const assignedICUName = selectedIcuObj ? selectedIcuObj.name : 'Medical ICU (MICU)';

    dispatch(
      addDoctor({
        name,
        employeeId,
        specialization,
        qualification,
        assignedICU: assignedICUName,
        assignedICUId,
        shift,
        phone: phone || '+91 98111 00000',
        email,
        status
      })
    );

    setName('');
    setEmployeeId('');
    setPhone('');
    setEmail('');
    setEmailError(null);
    setPhoneError(null);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-300 dark:border-teal-500/30">
              {hospitalCode} Medical Staff
            </span>
            <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold rounded border border-rose-300 dark:border-rose-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Profiles View-Only After Creation
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Doctor Roster Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register new ICU doctors. Created profiles remain read-only to preserve clinical oversight boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/hospital-staff"
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-750 hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border border-teal-500/30 text-xs font-bold font-mono px-3.5 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Users className="w-4 h-4 text-teal-600" /> All Staff API
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold font-mono px-4 py-2.5 rounded-xl shadow transition-all"
          >
            <UserPlus className="w-4 h-4" /> Register New Doctor
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search doctors, specialization, ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-500 dark:text-slate-400 font-mono">ICU:</span>
            <select
              value={icuFilter}
              onChange={e => setIcuFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All ICUs</option>
              {icus.map(i => (
                <option key={i.id} value={i.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{i.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-500 dark:text-slate-400 font-mono">Shift:</span>
            <select
              value={shiftFilter}
              onChange={e => setShiftFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Shifts</option>
              <option value="MORNING" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Morning</option>
              <option value="EVENING" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Evening</option>
              <option value="NIGHT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Night</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Showing <strong className="text-teal-700 dark:text-teal-400">{filteredDoctors.length}</strong> Doctors
          </span>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-5 shadow-sm hover:shadow-md space-y-4 relative overflow-hidden group transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-600/20 border border-teal-200 dark:border-teal-400/30 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center text-base shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {doc.employeeId}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      doc.status === 'ON_DUTY'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                        : doc.status === 'ACTIVE'
                        ? 'bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-500/40'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                    {doc.name}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-500/30 flex items-center gap-1 font-bold shrink-0">
                <Lock className="w-3 h-3" /> View Only
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Specialization:</span>
                <span className="font-semibold text-teal-700 dark:text-teal-300">{doc.specialization}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Assigned Unit:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{doc.assignedICU}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Assigned Shift:</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">{doc.shift} SHIFT</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{doc.email}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate justify-end">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{doc.phone}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Active Patients:
              </span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">{doc.workload}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Doctor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-teal-500/40 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register New Doctor Record</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Assigned strictly to Hospital {hospitalCode}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-DOC-115"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Specialization</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Assigned ICU</label>
                  <select
                    value={assignedICUId}
                    onChange={e => setAssignedICUId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    {icus.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Assigned Shift</label>
                  <select
                    value={shift}
                    onChange={e => setShift(e.target.value as ShiftType)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="MORNING">MORNING SHIFT</option>
                    <option value="EVENING">EVENING SHIFT</option>
                    <option value="NIGHT">NIGHT SHIFT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@aiimspatna.org"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                      emailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-teal-500'
                    } rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none transition-colors`}
                  />
                  {emailError && (
                    <span className="text-rose-500 text-[10px] mt-1 flex items-center gap-1 font-mono font-bold">
                      <AlertCircle className="w-3 h-3 inline shrink-0" />
                      {emailError}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold">Phone Number *</label>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      clean10DigitPhone(phone).length === 10
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                        : 'text-slate-500 bg-slate-100'
                    }`}>
                      {clean10DigitPhone(phone).length}/10 digits
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={e => {
                      setPhone(clean10DigitPhone(e.target.value));
                      if (phoneError) setPhoneError(null);
                    }}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                      phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-teal-500'
                    } rounded-lg p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none transition-colors`}
                  />
                  {phoneError && (
                    <span className="text-rose-600 text-[10px] mt-1 flex items-center gap-1 font-bold">
                      <AlertCircle className="w-3 h-3 inline shrink-0" />
                      {phoneError}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold font-mono text-xs rounded-xl shadow-lg"
                >
                  Register Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
