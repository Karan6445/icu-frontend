import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSearchQuery, setShiftFilter, addNurse, updateNurse, deleteNurse, assignNurseShift, NurseMember } from '../../store/slices/nurseSlice';
import { HeartPulse, Plus, Search, Filter, Trash2, Edit2, Calendar, X, List, Grid, AlertCircle } from 'lucide-react';
import { clean10DigitPhone, validate10DigitPhone, format10DigitPhone, validateEmail } from '../../utils/validation';

export const AdminNursesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { nurses, searchQuery, shiftFilter } = useAppSelector(state => state.nurse);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingNurse, setEditingNurse] = useState<NurseMember | null>(null);

  const [name, setName] = useState('');
  const [qualification, setQualification] = useState('B.Sc Nursing, Critical Care Cert');
  const [experience, setExperience] = useState('6 Years');
  const [shift, setShift] = useState<'Morning Shift' | 'Evening Shift' | 'Night Shift'>('Morning Shift');
  const [unitAssigned, setUnitAssigned] = useState('Medical ICU 01');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const filteredNurses = nurses.filter(n => {
    const matchesShift = shiftFilter === 'ALL' || n.shift === shiftFilter;
    const matchesQuery = n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         n.unitAssigned.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         n.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShift && matchesQuery;
  });

  const handleCreateNurse = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const emailValidation = validateEmail(email, 'Email address', false);
      if (emailValidation !== true) {
        setEmailError(emailValidation);
        return;
      }
    }
    setEmailError(null);

    if (phone) {
      const phoneValidation = validate10DigitPhone(phone, 'Phone number', false);
      if (phoneValidation !== true) {
        setPhoneError(phoneValidation);
        return;
      }
    }
    if (editingNurse) {
      dispatch(updateNurse({
        ...editingNurse,
        name,
        qualification,
        experience,
        shift,
        unitAssigned,
        email,
        phone
      }));
      setEditingNurse(null);
    } else {
      dispatch(addNurse({
        name,
        qualification,
        experience,
        shift,
        unitAssigned,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@hospital.in`,
        phone: phone || '+91 97100 00000',
        status: 'On Duty'
      }));
    }
    setAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setQualification('B.Sc Nursing, Critical Care Cert');
    setExperience('6 Years');
    setShift('Morning Shift');
    setUnitAssigned('Medical ICU 01');
    setEmail('');
    setEmailError(null);
    setPhone('');
    setPhoneError(null);
  };

  const handleEditClick = (n: NurseMember) => {
    setEditingNurse(n);
    setName(n.name);
    setQualification(n.qualification);
    setExperience(n.experience);
    setShift(n.shift);
    setUnitAssigned(n.unitAssigned);
    setEmail(n.email);
    setEmailError(null);
    setPhone(clean10DigitPhone(n.phone));
    setPhoneError(null);
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            NURSE MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Nursing Staff & Shift Roster</h1>
          <p className="text-xs text-slate-500">Manage registered nurse profiles, assigned ICU beds, shift allocations, and duty statuses.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
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

          <button
            onClick={() => {
              resetForm();
              setEditingNurse(null);
              setAddModalOpen(true);
            }}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Nurse</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search Nurse by Name, Qualification or Unit..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 text-[11px] font-mono uppercase font-bold">Shift Filter:</span>
          {(['ALL', 'Morning Shift', 'Evening Shift', 'Night Shift'] as const).map(s => (
            <button
              key={s}
              onClick={() => dispatch(setShiftFilter(s))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                shiftFilter === s
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content Rendering: Table or Grid */}
      {viewMode === 'table' ? (
        /* Nurses Table View */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Nurse Name & ID</th>
                <th className="p-3">Qualification</th>
                <th className="p-3">Experience</th>
                <th className="p-3">Assigned ICU Unit</th>
                <th className="p-3">Shift Assignment</th>
                <th className="p-3">Duty Status</th>
                <th className="p-3">Beds Managed</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredNurses.map(n => (
                <tr key={n.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white">
                    <div>{n.name}</div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">{n.id} · {n.email}</span>
                  </td>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{n.qualification}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{n.experience}</td>
                  <td className="p-3 font-bold text-teal-700 dark:text-teal-400">{n.unitAssigned}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700">
                      {n.shift}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                      n.status === 'On Duty'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-900 dark:text-white font-bold">{n.assignedBedsCount} Beds</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEditClick(n)} className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer" title="Edit Nurse Profile">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => dispatch(deleteNurse(n.id))} className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer" title="Delete Nurse Profile">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Nurses Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredNurses.map(n => (
            <div key={n.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{n.name}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">{n.id} · {n.qualification}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                  n.status === 'On Duty'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {n.status}
                </span>
              </div>
              <div className="text-xs space-y-1 font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>Unit: <span className="font-bold text-teal-700">{n.unitAssigned}</span></div>
                <div>Shift: <span className="font-bold text-slate-800">{n.shift}</span></div>
                <div>Beds: <span className="font-bold text-slate-900">{n.assignedBedsCount} Beds</span></div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleEditClick(n)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  Edit Nurse
                </button>
                <button
                  onClick={() => dispatch(deleteNurse(n.id))}
                  className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Nurse Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateNurse} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingNurse ? 'Edit Nurse Profile' : 'Add New Nurse'}</h3>
              <button type="button" onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1 font-bold">Nurse Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nurse Priya Sharma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Qualification *</label>
                <input
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. B.Sc Nursing"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Experience *</label>
                <input
                  type="text"
                  required
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="e.g. 6 Years"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="nurse@hospital.in"
                  className={`w-full bg-slate-950 border ${
                    emailError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-teal-400'
                  } rounded-xl p-3 text-white transition-colors focus:outline-none`}
                />
                {emailError && (
                  <span className="text-rose-400 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline shrink-0" />
                    {emailError}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-400 font-bold">Phone Number</label>
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    clean10DigitPhone(phone).length === 10
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-slate-400 bg-slate-800/60'
                  }`}>
                    {clean10DigitPhone(phone).length}/10 digits
                  </span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    const clean = clean10DigitPhone(e.target.value);
                    setPhone(clean);
                    if (phoneError) setPhoneError(null);
                  }}
                  placeholder="10-digit mobile number"
                  className={`w-full bg-slate-950 border ${
                    phoneError ? 'border-rose-500 focus:border-rose-400' : 'border-slate-800 focus:border-teal-400'
                  } rounded-xl p-3 text-white font-mono transition-colors focus:outline-none`}
                />
                {phoneError && (
                  <span className="text-rose-400 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 inline shrink-0" />
                    {phoneError}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Shift Assignment *</label>
                <select
                  value={shift}
                  onChange={(e) => setShift(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                >
                  <option value="Morning Shift">Morning Shift</option>
                  <option value="Evening Shift">Evening Shift</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Assigned ICU Unit *</label>
                <select
                  value={unitAssigned}
                  onChange={(e) => setUnitAssigned(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                >
                  <option value="Medical ICU 01">Medical ICU 01</option>
                  <option value="Surgical ICU 01">Surgical ICU 01</option>
                  <option value="Cardiac ICU 01">Cardiac ICU 01</option>
                  <option value="Neuro ICU 01">Neuro ICU 01</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-teal-500 text-white rounded-xl font-bold text-xs">
                {editingNurse ? 'Save Changes' : 'Create Nurse'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
