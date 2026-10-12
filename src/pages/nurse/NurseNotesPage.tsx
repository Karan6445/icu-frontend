import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addNursingNote } from '../../store/slices/patientSlice';
import { FileText, Plus, CheckCircle2 } from 'lucide-react';

export const NurseNotesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = useAppSelector(state => state.patient);
  const { currentUser } = useAppSelector(state => state.auth);

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || 'P-1024');
  const [noteText, setNoteText] = useState('');
  const [shiftName, setShiftName] = useState('Morning Shift');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPatientId && noteText) {
      dispatch(addNursingNote({
        patientId: selectedPatientId,
        nurseName: currentUser.name,
        note: noteText,
        shift: shiftName
      }));
      setNoteText('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-bold rounded-full">
            NURSING NOTES
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Bedside Nursing Handover Notes</h1>
          <p className="text-xs text-slate-500">Record shift nursing assessments, suctioning procedures, IV fluid titrations, and handover notes.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-mono flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Nursing note added to patient shift log ({selectedPatient?.name}).</span>
        </div>
      )}

      <form onSubmit={handleSubmitNote} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus className="w-5 h-5 text-teal-700" />
          Add Nursing Shift Note
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
          <div>
            <label className="block text-slate-600 mb-1 font-bold">Select Patient *</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-teal-500 outline-none"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) - {p.unitName} {p.bedNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 mb-1 font-bold">Active Shift *</label>
            <select
              value={shiftName}
              onChange={(e) => setShiftName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-teal-500 outline-none"
            >
              <option value="Morning Shift">Morning Shift (07:00 - 15:00)</option>
              <option value="Evening Shift">Evening Shift (15:00 - 23:00)</option>
              <option value="Night Shift">Night Shift (23:00 - 07:00)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-600 mb-1 font-bold">Nursing Care Note & Intervention *</label>
            <textarea
              rows={4}
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Record suctioning details, position changes, tube feedings, fluid balances..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 focus:border-teal-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow">
            Save Nursing Note
          </button>
        </div>
      </form>
    </div>
  );
};
