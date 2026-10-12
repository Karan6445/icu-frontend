import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addClinicalNote } from '../../store/slices/patientSlice';
import { FileText, Plus, CheckCircle2, Stethoscope, Clock } from 'lucide-react';

export const DoctorClinicalNotesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { patients } = useAppSelector(state => state.patient);
  const { currentUser } = useAppSelector(state => state.auth);

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || 'P-1024');
  const [noteText, setNoteText] = useState('');
  const [remarkText, setRemarkText] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPatientId && noteText) {
      dispatch(addClinicalNote({
        patientId: selectedPatientId,
        doctorName: currentUser.name,
        note: noteText,
        remark: remarkText || 'Routine Intensive Care Round'
      }));
      setNoteText('');
      setRemarkText('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            CLINICAL NOTES
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Intensivist Clinical Round Notes</h1>
          <p className="text-xs text-slate-500">Document round observations, ventilator titrations, medication orders, and clinical remarks.</p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-mono flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Clinical note saved to patient record ({selectedPatient?.name}).</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmitNote} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus className="w-5 h-5 text-[#0F766E]" />
          Add New Clinical Round Note
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
          <div>
            <label className="block text-slate-700 mb-1 font-bold">Select Patient *</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#0F766E]"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id}) - {p.unitName} {p.bedNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1 font-bold">Doctor Remark / Instruction</label>
            <input
              type="text"
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="e.g. Continue PEEP 10, Monitor ABG"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#0F766E]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-slate-700 mb-1 font-bold">Clinical Observations & Findings *</label>
            <textarea
              rows={4}
              required
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Detailed physical exam findings, hemodynamic status, respiratory response..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:outline-none focus:border-[#0F766E]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold text-xs rounded-xl shadow-sm">
            Save Clinical Note
          </button>
        </div>
      </form>

      {/* History Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
        <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3">
          Clinical Notes History for {selectedPatient?.name}
        </h3>

        {selectedPatient?.clinicalNotesHistory && selectedPatient.clinicalNotesHistory.length > 0 ? (
          <div className="space-y-3 font-mono text-xs">
            {selectedPatient.clinicalNotesHistory.map(cn => (
              <div key={cn.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between items-center text-[#0F766E] font-bold">
                  <span>{cn.doctorName}</span>
                  <span className="text-slate-500 text-[10px]">{cn.date}</span>
                </div>
                <p className="text-slate-800 font-sans text-xs">{cn.note}</p>
                <div className="text-[11px] text-amber-700 font-semibold pt-1">Remark: {cn.remark}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-500 font-mono italic">
            No previous clinical notes recorded for this patient.
          </div>
        )}
      </div>
    </div>
  );
};
