import React from 'react';
import { X, ShieldAlert, HeartPulse, Stethoscope, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setActiveRole } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

interface NurseOnlyRegistrationNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NurseOnlyRegistrationNoticeModal: React.FC<NurseOnlyRegistrationNoticeModalProps> = ({
  isOpen,
  onClose
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSwitchToNurse = () => {
    dispatch(setActiveRole('NURSE'));
    onClose();
    navigate('/nurse/add-patient');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-amber-300 dark:border-amber-700 shadow-2xl overflow-hidden font-sans space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white border border-white/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Patient Registration Policy</h2>
              <p className="text-xs text-amber-100 font-mono">Hospital Protocol Enforcement</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-amber-100 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
            <strong className="font-bold text-sm block">⚠️ Patient Registration Restricted to Nurses</strong>
            <p className="leading-relaxed">
              Per standard clinical hospital protocol (<span className="font-semibold font-mono">Patient Intake Policy #ICU-REG-04</span>), <strong>Patient Registration</strong> and triage intake can only be submitted by <strong>Nurses</strong> or <strong>Nurse Leads</strong>.
            </p>
            <p className="leading-relaxed text-slate-600 dark:text-slate-300 pt-1">
              Doctors conduct clinical checkups, diagnosis, and enter locked Doctor Remarks after registration.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">How would you like to proceed?</span>
            </div>
            <div className="space-y-2">
              <button
                onClick={handleSwitchToNurse}
                className="w-full py-2.5 px-4 bg-[#0F766E] hover:bg-[#0D655E] active:bg-[#0A524D] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-emerald-300" />
                  <span>Switch Role to Nurse & Open Registration</span>
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all text-center cursor-pointer"
              >
                Return to Patient Directory
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
