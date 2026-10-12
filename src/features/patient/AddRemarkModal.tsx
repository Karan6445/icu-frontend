import React, { useState } from 'react';
import { X, CheckCircle2, MessageSquarePlus, Stethoscope } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addClinicalNote } from '../../store/slices/patientSlice';

interface AddRemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  bedNumber: string;
  onRemarkAdded?: (remarkData: { category: string; priority: string; doctorName: string; details: string }) => void;
}

export const AddRemarkModal: React.FC<AddRemarkModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  bedNumber,
  onRemarkAdded
}) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);

  const [remarkCategory, setRemarkCategory] = useState('Ventilator / Respiratory Plan');
  const [urgencyPriority, setUrgencyPriority] = useState('HIGH (Priority Round Directive)');
  const [recordingDoctor, setRecordingDoctor] = useState(currentUser?.name || 'Dr. Ananya Roy');
  const [remarkDetails, setRemarkDetails] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkDetails.trim()) return;

    // Dispatch to Redux store
    dispatch(addClinicalNote({
      patientId: patientId,
      doctorName: recordingDoctor,
      note: remarkDetails,
      remark: `[${urgencyPriority.split(' ')[0]}] ${remarkCategory}`
    }));

    if (onRemarkAdded) {
      onRemarkAdded({
        category: remarkCategory,
        priority: urgencyPriority,
        doctorName: recordingDoctor,
        details: remarkDetails
      });
    }

    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setRemarkDetails('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-sans tracking-tight">
            Add Clinical Patient Remark
          </h2>
          <div className="text-xs font-semibold text-[#0F766E] dark:text-teal-400 mt-1 font-sans">
            Patient: <span className="font-bold">{patientName} ({patientId})</span> &nbsp;·&nbsp; Bed <span className="font-bold">{bedNumber}</span>
          </div>
        </div>

        {/* Success Alert */}
        {isSuccess && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Clinical remark successfully added to patient record.</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            {/* Field 1: Remark Category */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Remark Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={remarkCategory}
                onChange={(e) => setRemarkCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-sans text-xs focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all"
              >
                <option value="Ventilator / Respiratory Plan">Ventilator / Respiratory Plan</option>
                <option value="Hemodynamic / Vasopressor Plan">Hemodynamic / Vasopressor Plan</option>
                <option value="Medication / Antibiotic Order">Medication / Antibiotic Order</option>
                <option value="Sedation & Analgesia Target">Sedation & Analgesia Target</option>
                <option value="General Directive / Round Note">General Directive / Round Note</option>
                <option value="Diagnostic / Lab Follow-up">Diagnostic / Lab Follow-up</option>
                <option value="Nutrition & Fluid Management">Nutrition & Fluid Management</option>
              </select>
            </div>

            {/* Field 2: Urgency / Priority */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Urgency / Priority <span className="text-rose-500">*</span>
              </label>
              <select
                value={urgencyPriority}
                onChange={(e) => setUrgencyPriority(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-sans text-xs focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all"
              >
                <option value="HIGH (Priority Round Directive)">HIGH (Priority Round Directive)</option>
                <option value="ROUTINE (Standard Directive)">ROUTINE (Standard Directive)</option>
                <option value="CRITICAL (Immediate Attention Required)">CRITICAL (Immediate Attention Required)</option>
                <option value="INFO (Observation Only)">INFO (Observation Only)</option>
              </select>
            </div>
          </div>

          {/* Field 3: Recording Doctor Name */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
              Recording Doctor Name
            </label>
            <input
              type="text"
              value={recordingDoctor}
              onChange={(e) => setRecordingDoctor(e.target.value)}
              placeholder="e.g. Dr. Ananya Roy"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-sans text-xs focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all"
            />
          </div>

          {/* Field 4: Doctor Remark / Directive Details */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
              Doctor Remark / Directive Details <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={remarkDetails}
              onChange={(e) => setRemarkDetails(e.target.value)}
              placeholder="Enter specific therapeutic instructions, ventilator parameter goals, inotrope targets, or clinical round notes..."
              className="w-full bg-white dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white font-sans text-xs focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSuccess}
              className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0D655E] active:bg-[#0A524D] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Save Patient Remark</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
