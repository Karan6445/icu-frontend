import React, { useState, useEffect } from 'react';
import { PatientRegistrationWizard } from '../../components/patient/PatientRegistrationWizard';
import { NurseOnlyRegistrationNoticeModal } from '../../components/patient/NurseOnlyRegistrationNoticeModal';
import { useNavigate, Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { Users, ShieldCheck } from 'lucide-react';

export const NurseAddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole } = useAppSelector(state => state.auth);
  const [showPolicyNotice, setShowPolicyNotice] = useState(false);

  useEffect(() => {
    if (activeRole === 'DOCTOR') {
      setShowPolicyNotice(true);
    }
  }, [activeRole]);

  return (
    <div className="space-y-6 pb-16 font-sans selection:bg-teal-500 selection:text-white">
      {/* Header Bar in Light Theme */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-4xl mx-auto">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
              NURSING COCKPIT · ADMISSION INTAKE
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[11px] font-bold rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Nurse Authorized</span>
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mt-2">New Patient Registration</h1>
          <p className="text-xs text-slate-500">
            Admit a new critical care patient, assign primary intensivist & ICU bed unit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/nurse/patients"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Assigned Patients</span>
          </Link>
        </div>
      </div>

      <NurseOnlyRegistrationNoticeModal
        isOpen={showPolicyNotice}
        onClose={() => {
          setShowPolicyNotice(false);
          navigate('/patients');
        }}
      />
      <PatientRegistrationWizard onComplete={() => navigate('/nurse/patients')} />
    </div>
  );
};

export default NurseAddPatientPage;
