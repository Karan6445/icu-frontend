import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveRole, SystemRole } from '../../store/slices/authSlice';
import { AppRole, ROLE_DEFINITIONS } from '../../config/rbacConfig';
import { Shield, ChevronDown, Check, UserCheck, Sparkles } from 'lucide-react';

const ALL_ROLES: { role: AppRole; label: string; desc: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full Directorate Access (ICU + E-Clinic)' },
  { role: 'HOSPITAL_ADMIN', label: 'Hospital Admin', desc: 'Facility Operations & Bed Allocation' },
  { role: 'ECLINIC_ADMIN', label: 'E-Clinic Admin', desc: 'Tele-Health Director & Clinic Lead' },
  { role: 'DOCTOR', label: 'Doctor / Physician', desc: 'Clinical Notes, Rx, Tele-Consult, Referrals' },
  { role: 'NURSE', label: 'Critical Care Nurse', desc: 'Bedside Vitals Capture & Patient Care' },
  { role: 'CLINIC_OPERATOR', label: 'Clinic Operator', desc: 'OPD Queue, Check-in, Triage Vitals' },
  { role: 'RECEPTIONIST', label: 'Receptionist', desc: 'Patient Registration & Token Coordinator' }
];

export const DevRoleSwitcher: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeRole } = useAppSelector(state => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  const currentRoleDef = ROLE_DEFINITIONS[activeRole as AppRole] || ROLE_DEFINITIONS.DOCTOR;

  const handleSelectRole = (r: AppRole) => {
    dispatch(setActiveRole(r as SystemRole));
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left z-50">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white border border-teal-400/40 shadow-lg flex items-center gap-2 text-xs font-mono font-bold transition-all active:scale-95 group cursor-pointer"
        title="Development Role Switcher (Test any role permissions instantly)"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider hidden sm:inline">
          DEV ROLE:
        </span>
        <span className="text-white font-extrabold truncate max-w-[130px] sm:max-w-[180px]">
          {currentRoleDef.displayName.split('(')[0].trim()}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-teal-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-slate-900/95 backdrop-blur-xl border border-teal-500/40 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-white font-sans">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-300 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SWITCH TEST OPERATOR</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">7 Presets</span>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-1 py-1.5 custom-scrollbar">
              {ALL_ROLES.map(({ role, label, desc }) => {
                const isSelected = activeRole === role || (role === 'HOSPITAL_ADMIN' && activeRole === 'ADMIN');
                const roleDef = ROLE_DEFINITIONS[role];

                return (
                  <button
                    key={role}
                    onClick={() => handleSelectRole(role)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2 cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-700/70 border-teal-400/60 shadow-md text-white'
                        : 'bg-slate-800/40 hover:bg-slate-800 border-transparent text-slate-200 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black tracking-wide">{label}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full border ${roleDef.badgeColor}`}>
                          {roleDef.allowedModules.join(' + ')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 mt-0.5 leading-snug line-clamp-2">
                        {desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-2 border-t border-slate-800 bg-slate-950/60 rounded-xl text-[10px] text-slate-400 font-mono text-center">
              Dynamically toggles modules, actions, clinical notes, and route guards.
            </div>
          </div>
        </>
      )}
    </div>
  );
};
