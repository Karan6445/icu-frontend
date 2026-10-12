import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addNurse } from '../../store/slices/hospitalAdminSlice';
import { NurseRank, ShiftType, StaffStatus } from '../../types/hospitalAdmin';
import {
  HeartPulse,
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
  Award,
  Users,
  AlertCircle
} from 'lucide-react';
import { clean10DigitPhone, validate10DigitPhone, format10DigitPhone, validateEmail } from '../../utils/validation';

export const HospitalAdminNursesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { nurses, icus, hospitalCode } = useAppSelector(state => state.hospitalAdmin);

  const [searchQuery, setSearchQuery] = useState('');
  const [icuFilter, setIcuFilter] = useState('ALL');
  const [rankTab, setRankTab] = useState<'ALL' | 'LEADS' | 'STAFF'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [rank, setRank] = useState<NurseRank>('ICU_NURSE');
  const [qualification, setQualification] = useState('B.Sc Nursing (ICU Specialized)');
  const [assignedICUId, setAssignedICUId] = useState('ICU-MICU');
  const [shift, setShift] = useState<ShiftType>('MORNING');
  const [supervisorName, setSupervisorName] = useState('Sunita Rao');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<StaffStatus>('ON_DUTY');

  const filteredNurses = nurses.filter(nur => {
    const matchesSearch =
      nur.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nur.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nur.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIcu = icuFilter === 'ALL' || nur.assignedICUId === icuFilter;
    const matchesRank =
      rankTab === 'ALL'
        ? true
        : rankTab === 'LEADS'
        ? nur.rank === 'NURSE_LEAD'
        : nur.rank !== 'NURSE_LEAD';
    return matchesSearch && matchesIcu && matchesRank;
  });

  const handleAddNurseSubmit = (e: React.FormEvent) => {
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
      addNurse({
        name,
        employeeId,
        rank,
        qualification,
        assignedICU: assignedICUName,
        assignedICUId,
        shift,
        supervisorName: supervisorName || 'Nurse Lead',
        phone: phone || '+91 97222 00000',
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
            <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-mono font-bold rounded border border-emerald-300 dark:border-emerald-500/30">
              {hospitalCode} Nursing Registry
            </span>
            <span className="px-2.5 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold rounded border border-rose-300 dark:border-rose-500/30 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Staff Cards View-Only
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-emerald-600 dark:text-emerald-400" /> Nurse Lead & ICU Nurse Roster
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Operational shift assignments and nurse registration console. Created profiles remain read-only.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold font-mono px-4 py-2.5 rounded-xl shadow transition-all"
        >
          <UserPlus className="w-4 h-4" /> Register New Nurse
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Rank Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
          <button
            onClick={() => setRankTab('ALL')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              rankTab === 'ALL'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Nurses ({nurses.length})
          </button>
          <button
            onClick={() => setRankTab('LEADS')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              rankTab === 'LEADS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Nurse Leads ({nurses.filter(n => n.rank === 'NURSE_LEAD').length})
          </button>
          <button
            onClick={() => setRankTab('STAFF')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              rankTab === 'STAFF'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ICU Staff Nurses ({nurses.filter(n => n.rank !== 'NURSE_LEAD').length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search nurse name, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
        </div>
      </div>

      {/* Nurses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNurses.map(nur => (
          <div
            key={nur.id}
            className={`bg-white dark:bg-slate-800 border rounded-2xl p-5 shadow-sm hover:shadow-md space-y-4 relative overflow-hidden group transition-all ${
              nur.rank === 'NURSE_LEAD' ? 'border-emerald-500' : 'border-slate-200 dark:border-slate-700/80 hover:border-emerald-500'
            }`}
          >
            {nur.rank === 'NURSE_LEAD' && (
              <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-mono font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider shadow">
                ★ NURSE LEAD
              </div>
            )}

            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center text-base shrink-0 ${
                  nur.rank === 'NURSE_LEAD'
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-400/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-teal-50 dark:bg-teal-600/20 border border-teal-200 dark:border-teal-400/30 text-teal-800 dark:text-teal-300'
                }`}>
                  <HeartPulse className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {nur.employeeId}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      nur.status === 'ON_DUTY'
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {nur.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {nur.name}
                  </h3>
                </div>
              </div>
              <span className="text-[10px] font-mono text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-300 dark:border-rose-500/30 flex items-center gap-1 font-bold shrink-0 mt-5">
                <Lock className="w-3 h-3" /> View Only
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Qualification:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate">{nur.qualification}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Assigned ICU:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{nur.assignedICU}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Assigned Shift:</span>
                <span className="font-bold text-amber-700 dark:text-amber-300">{nur.shift} SHIFT</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{nur.email}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate justify-end">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{nur.phone}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">Supervisor Lead:</span>
              <span className="font-bold text-teal-700 dark:text-teal-300">{nur.supervisorName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Nurse Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/40 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Register New Nurse Record</h2>
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

            <form onSubmit={handleAddNurseSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Nurse Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NUR-EMP-6029"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Role & Rank</label>
                  <select
                    value={rank}
                    onChange={e => setRank(e.target.value as NurseRank)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="ICU_NURSE">ICU Staff Nurse</option>
                    <option value="SENIOR_NURSE">Senior ICU Nurse</option>
                    <option value="NURSE_LEAD">Nurse Lead (Supervisor)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Assigned ICU</label>
                  <select
                    value={assignedICUId}
                    onChange={e => setAssignedICUId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
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
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-mono"
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
                    placeholder="nurse@aiimspatna.org"
                    value={email}
                    onChange={e => {
                      setEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    className={`w-full bg-slate-50 dark:bg-slate-950 border ${
                      emailError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
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
                      phoneError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
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

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-mono mb-1">Supervisor Lead Name</label>
                <input
                  type="text"
                  value={supervisorName}
                  onChange={e => setSupervisorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold font-mono text-xs rounded-xl shadow-lg"
                >
                  Register Nurse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
