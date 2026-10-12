import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { UserCheck, Stethoscope, ShieldCheck, Mail, Phone, Building2 } from 'lucide-react';

export const DoctorProfilePage: React.FC = () => {
  const { currentUser } = useAppSelector(state => state.auth);

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-teal-500 selection:text-white max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            DOCTOR PROFILE
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">{currentUser.name}</h1>
          <p className="text-xs text-slate-500">{currentUser.specialty || 'Critical Care Lead'} · Staff ID: {currentUser.staffId}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm font-mono text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] font-bold">DEPARTMENT</span>
            <span className="text-slate-900 font-bold block">{currentUser.department}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] font-bold">EMAIL ADDRESS</span>
            <span className="text-[#0F766E] font-bold block">{currentUser.email}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] font-bold">AUTHORIZED ICU UNITS</span>
            <span className="text-emerald-700 font-bold block">{currentUser.authorizedUnits.join(', ')}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[10px] font-bold">HOSPITAL AFFILIATION</span>
            <span className="text-slate-900 font-bold block">{currentUser.hospital}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
