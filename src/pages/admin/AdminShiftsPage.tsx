import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSearchQuery, addShift, updateShift, deleteShift, ShiftRosterItem } from '../../store/slices/shiftSlice';
import { Calendar, Plus, Search, Filter, Edit2, Trash2, Clock, Users, X } from 'lucide-react';

export const AdminShiftsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { shifts, searchQuery } = useAppSelector(state => state.shift);
  const { doctors } = useAppSelector(state => state.doctor);
  const { nurses } = useAppSelector(state => state.nurse);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftRosterItem | null>(null);

  const [shiftName, setShiftName] = useState<'Morning Shift' | 'Evening Shift' | 'Night Shift'>('Morning Shift');
  const [timeRange, setTimeRange] = useState('07:00 AM - 03:00 PM');
  const [unit, setUnit] = useState('Medical ICU 01');
  const [assignedDoc, setAssignedDoc] = useState('Dr. Ananya Roy');
  const [assignedNurse, setAssignedNurse] = useState('Nurse Priya Sharma');

  const filteredShifts = shifts.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShift) {
      dispatch(updateShift({
        ...editingShift,
        name: shiftName,
        timeRange,
        unit,
        assignedDoctors: [assignedDoc],
        assignedNurses: [assignedNurse]
      }));
    } else {
      dispatch(addShift({
        name: shiftName,
        timeRange,
        unit,
        assignedDoctors: [assignedDoc],
        assignedNurses: [assignedNurse],
        activeStatus: 'UPCOMING'
      }));
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#10B981] selection:text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D1D5DB] shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            SHIFT MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Clinical Shift Allocation Roster</h1>
          <p className="text-xs text-slate-500">Manage Morning, Evening, and Night duty shifts, assign attending intensivists, and schedule nursing coverage.</p>
        </div>

        <button
          onClick={() => {
            setEditingShift(null);
            setModalOpen(true);
          }}
          className="px-5 py-3 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create / Assign Shift</span>
        </button>
      </div>

      {/* Default Shifts Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="bg-white border border-[#D1D5DB] p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#0F766E] uppercase">Morning Shift</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-[#10B981] rounded text-[10px] font-bold border border-emerald-200">07:00 - 15:00</span>
          </div>
          <p className="text-xs text-slate-600 font-sans">Primary intensivist rounds, morning vital handovers, and diagnostic reviews.</p>
        </div>

        <div className="bg-white border border-[#D1D5DB] p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#F59E0B] uppercase">Evening Shift</span>
            <span className="px-2 py-0.5 bg-amber-50 text-[#F59E0B] rounded text-[10px] font-bold border border-amber-200">15:00 - 23:00</span>
          </div>
          <p className="text-xs text-slate-600 font-sans">Evening consultant review, lab culture updates, and titration adjustments.</p>
        </div>

        <div className="bg-white border border-[#D1D5DB] p-5 rounded-2xl space-y-2 shadow-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-purple-700 uppercase">Night Shift</span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-bold border border-purple-200">23:00 - 07:00</span>
          </div>
          <p className="text-xs text-slate-600 font-sans">Night continuous telemetry monitoring, emergency call coverage, and early morning blood draws.</p>
        </div>
      </div>

      {/* Shifts List Table */}
      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 font-medium">
          <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200 font-bold">
            <tr>
              <th className="p-3 text-slate-900">Shift Name</th>
              <th className="p-3">Time Schedule</th>
              <th className="p-3">ICU Unit</th>
              <th className="p-3">Assigned Doctors</th>
              <th className="p-3">Assigned Nurses</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredShifts.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                <td className="p-3 font-bold text-slate-900 dark:text-white font-mono">{s.name}</td>
                <td className="p-3 font-mono text-[#0F766E] dark:text-teal-400 font-bold">{s.timeRange}</td>
                <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{s.unit}</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">{s.assignedDoctors.join(', ')}</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">{s.assignedNurses.join(', ')}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${
                    s.activeStatus === 'ACTIVE'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#10B981] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}>
                    {s.activeStatus}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingShift(s);
                        setShiftName(s.name as any);
                        setTimeRange(s.timeRange);
                        setUnit(s.unit);
                        setModalOpen(true);
                      }}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Edit Shift"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => dispatch(deleteShift(s.id))}
                      className="p-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
                      title="Delete Shift"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveShift} className="bg-white border border-[#D1D5DB] rounded-2xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="font-bold text-base text-slate-900">{editingShift ? 'Edit Shift Roster' : 'Create / Assign Shift'}</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Shift Name *</label>
                <select
                  value={shiftName}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setShiftName(val);
                    if (val === 'Morning Shift') setTimeRange('07:00 AM - 03:00 PM');
                    else if (val === 'Evening Shift') setTimeRange('03:00 PM - 11:00 PM');
                    else setTimeRange('11:00 PM - 07:00 AM');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
                >
                  <option value="Morning Shift">Morning Shift (07:00 - 15:00)</option>
                  <option value="Evening Shift">Evening Shift (15:00 - 23:00)</option>
                  <option value="Night Shift">Night Shift (23:00 - 07:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">ICU Unit *</label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
                >
                  <option value="Medical ICU 01">Medical ICU 01</option>
                  <option value="Surgical ICU 01">Surgical ICU 01</option>
                  <option value="Cardiac ICU 01">Cardiac ICU 01</option>
                  <option value="Neuro ICU 01">Neuro ICU 01</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Assign Attending Doctor *</label>
                <select
                  value={assignedDoc}
                  onChange={(e) => setAssignedDoc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Assign Nurse Lead *</label>
                <select
                  value={assignedNurse}
                  onChange={(e) => setAssignedNurse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
                >
                  {nurses.map(n => (
                    <option key={n.id} value={n.name}>{n.name} ({n.unitAssigned})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-[#0F766E] text-white rounded-xl font-bold text-xs hover:bg-[#0D655E]">
                Save Shift Roster
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
