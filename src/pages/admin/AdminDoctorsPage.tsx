import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSearchQuery, setDepartmentFilter, addDoctor, updateDoctor, deleteDoctor, toggleAvailability, DoctorMember } from '../../store/slices/doctorSlice';
import { Stethoscope, Plus, Search, Filter, Trash2, Edit2, CheckCircle2, X, List, Grid, AlertCircle } from 'lucide-react';
import { clean10DigitPhone, validate10DigitPhone, format10DigitPhone, validateEmail } from '../../utils/validation';

export const AdminDoctorsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { doctors, searchQuery, departmentFilter } = useAppSelector(state => state.doctor);

  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorMember | null>(null);

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Medical ICU');
  const [qualification, setQualification] = useState('MD, DM (Critical Care)');
  const [experience, setExperience] = useState('10 Years');
  const [shift, setShift] = useState<'Morning Shift' | 'Evening Shift' | 'Night Shift'>('Morning Shift');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const filteredDoctors = doctors.filter(d => {
    const matchesDept = departmentFilter === 'ALL' || d.department === departmentFilter;
    const matchesQuery = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         d.qualification.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const handleCreateDoctor = (e: React.FormEvent) => {
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
    if (editingDoctor) {
      dispatch(updateDoctor({
        ...editingDoctor,
        name,
        department,
        qualification,
        experience,
        shift,
        email,
        phone
      }));
      setEditingDoctor(null);
    } else {
      dispatch(addDoctor({
        name,
        department,
        qualification,
        experience,
        shift,
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@hospital.in`,
        phone: phone || '+91 98200 00000',
        availability: 'Available'
      }));
    }
    setAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDepartment('Medical ICU');
    setQualification('MD, DM (Critical Care)');
    setExperience('10 Years');
    setShift('Morning Shift');
    setEmail('');
    setEmailError(null);
    setPhone('');
    setPhoneError(null);
  };

  const handleEditClick = (d: DoctorMember) => {
    setEditingDoctor(d);
    setName(d.name);
    setDepartment(d.department);
    setQualification(d.qualification);
    setExperience(d.experience);
    setShift(d.shift);
    setEmail(d.email);
    setEmailError(null);
    setPhone(clean10DigitPhone(d.phone));
    setPhoneError(null);
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            DOCTOR MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Attending Intensivists & Consultants</h1>
          <p className="text-xs text-slate-500">Manage doctor profiles, qualifications, department allocations, shift rosters, and real-time availability status.</p>
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
              setEditingDoctor(null);
              setAddModalOpen(true);
            }}
            className="px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Doctor</span>
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
              placeholder="Search Doctor by Name, Qualification or Department..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-500 text-[11px] font-mono uppercase font-bold">Department:</span>
          {(['ALL', 'Medical ICU', 'Surgical ICU', 'Cardiac ICU', 'Neuro ICU'] as const).map(d => (
            <button
              key={d}
              onClick={() => dispatch(setDepartmentFilter(d))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                departmentFilter === d
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Content: Table or Grid */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 font-medium">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Doctor Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Qualification</th>
                <th className="p-3">Experience</th>
                <th className="p-3">Shift Roster</th>
                <th className="p-3">Availability Status</th>
                <th className="p-3">Assigned Patients</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map(d => (
                <tr key={d.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 font-bold flex items-center justify-center text-xs">
                      {d.name.charAt(4) || 'D'}
                    </div>
                    <div>
                      <div>{d.name}</div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">{d.email}</span>
                    </div>
                  </td>
                  <td className="p-3 text-teal-700 dark:text-teal-400 font-bold">{d.department}</td>
                  <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{d.qualification}</td>
                  <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{d.experience}</td>
                  <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{d.shift}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                      d.availability === 'Available'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : d.availability === 'In Surgery'
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}>
                      {d.availability}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">{d.assignedPatientsCount} Patients</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch(toggleAvailability({ doctorId: d.id, availability: d.availability === 'Available' ? 'On Round' : 'Available' }))}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer"
                      >
                        Toggle Status
                      </button>
                      <button onClick={() => handleEditClick(d)} className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer" title="Edit Doctor Profile">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => dispatch(deleteDoctor(d.id))} className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors cursor-pointer" title="Delete Doctor Profile">
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
        /* Doctor Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map(d => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:border-slate-300 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 font-bold text-base flex items-center justify-center shadow-xs">
                    {d.name.charAt(4) || 'D'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">{d.name}</h3>
                    <span className="text-xs text-teal-700 font-semibold">{d.department}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                  d.availability === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : d.availability === 'In Surgery'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {d.availability}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex justify-between"><span className="text-slate-400">Qualification:</span> <span className="text-slate-900 font-bold">{d.qualification}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Experience:</span> <span className="text-slate-700">{d.experience}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Shift Roster:</span> <span className="text-teal-700 font-bold">{d.shift}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Assigned Patients:</span> <span className="text-slate-900 font-bold">{d.assignedPatientsCount} Patients</span></div>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <button
                  onClick={() => dispatch(toggleAvailability({ doctorId: d.id, availability: d.availability === 'Available' ? 'On Round' : 'Available' }))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-mono font-bold"
                >
                  Toggle Availability
                </button>

                <div className="flex items-center gap-2">
                  <button onClick={() => handleEditClick(d)} className="p-1.5 text-slate-600 hover:text-teal-700 bg-slate-100 border border-slate-200 rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => dispatch(deleteDoctor(d.id))} className="p-1.5 text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateDoctor} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">{editingDoctor ? 'Edit Doctor Profile' : 'Add New Doctor'}</h3>
              <button type="button" onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1 font-bold">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Ananya Roy"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                >
                  <option value="Medical ICU">Medical ICU</option>
                  <option value="Surgical ICU">Surgical ICU</option>
                  <option value="Cardiac ICU">Cardiac ICU</option>
                  <option value="Neuro ICU">Neuro ICU</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Qualification *</label>
                <input
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. MD, DM (Critical Care)"
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
                  placeholder="e.g. 12 Years"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-bold">Shift Roster *</label>
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
                <label className="block text-slate-400 mb-1 font-bold">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="doctor@hospital.in"
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
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-4">
              <button type="button" onClick={() => setAddModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-teal-500 text-white rounded-xl font-bold text-xs">
                {editingDoctor ? 'Save Changes' : 'Create Doctor'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
