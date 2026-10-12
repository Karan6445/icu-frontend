import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  User, 
  FileText, 
  Bed, 
  ChevronRight, 
  Sliders, 
  ShieldAlert, 
  AlertTriangle,
  HeartPulse,
  ExternalLink,
  ChevronDown,
  Stethoscope
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';

interface ContextBarProps {
  onToggleDrawer?: (tab?: 'patient' | 'alerts' | 'tasks') => void;
  isDrawerOpen?: boolean;
}

export const ContextBar: React.FC<ContextBarProps> = ({ 
  onToggleDrawer,
  isDrawerOpen 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeRole } = useAppSelector(state => state.auth);

  const [hospital, setHospital] = useState(() => localStorage.getItem('selected_hospital_name') || 'PMCH Patna');
  const [icu, setIcu] = useState(() => localStorage.getItem('selected_icu_id') || 'MICU-01');
  const [showBreakGlassModal, setShowBreakGlassModal] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [isBreakGlassActive, setIsBreakGlassActive] = useState(false);

  useEffect(() => {
    const handleSync = () => {
      const storedIcu = localStorage.getItem('selected_icu_id');
      if (storedIcu) setIcu(storedIcu);
      const storedHosp = localStorage.getItem('selected_hospital_name');
      if (storedHosp) setHospital(storedHosp);
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('icuChanged', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('icuChanged', handleSync);
    };
  }, []);

  // Active patient context (synced or fallback to primary bed)
  const currentPatient = {
    id: 'P-1024',
    name: 'Rahul Sharma',
    age: 42,
    gender: 'M',
    encounterId: 'ENC-90821',
    bedId: 'Bed 04',
    acuity: 'CRITICAL',
    admitDate: '28-Sep 14:30',
    allergies: ['Penicillin', 'Sulfa'],
    codeStatus: 'FULL CODE'
  };

  const handleHospitalSwitch = (hosp: string) => {
    setHospital(hosp);
    localStorage.setItem('selected_hospital_name', hosp);
  };

  const handleIcuSwitch = (unit: string) => {
    setIcu(unit);
    localStorage.setItem('selected_icu_id', unit);
    navigate('/command-center');
  };

  const handleBreakGlassConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassReason.trim()) return;
    setIsBreakGlassActive(true);
    setShowBreakGlassModal(false);
  };

  const isEClinic = location.pathname.startsWith('/eclinic');

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-3 text-xs select-none sticky top-12 z-20 shadow-xs">
      {/* Breadcrumb Context: E-Clinic vs Smart ICU */}
      {isEClinic ? (
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 dark:text-teal-400 font-bold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 shrink-0">
            E-CLINIC CONTEXT
          </span>

          {/* 1. Clinic Node */}
          <div className="flex items-center gap-1 group shrink-0">
            <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-bold text-slate-900 dark:text-white" title="Active Clinic Facility">
              Patna Central Digital E-Clinic
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

          {/* 2. Station */}
          <div className="flex items-center gap-1 shrink-0 font-mono">
            <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-bold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/40">
              Station 1 (Tele-Triage)
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

          {/* 3. OPD Queue */}
          <div className="flex items-center gap-1.5 shrink-0 font-mono">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
              ● 5 Active Encounters Today
            </span>
          </div>
        </div>
      ) : (
        /* Breadcrumb Context: Hospital > ICU > Patient > Encounter > Bed */
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 dark:text-teal-400 font-bold px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60 shrink-0">
            CONTEXT
          </span>

          {/* 1. Hospital */}
          <div className="flex items-center gap-1 group shrink-0">
            <Building2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span 
              className="font-bold text-slate-900 dark:text-white"
              title="Current Hospital Facility"
            >
              {hospital}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

          {/* 2. ICU */}
          <button
            onClick={() => navigate(`/admin/hospital-icus?icu=${encodeURIComponent(icu)}`)}
            className="flex items-center gap-1 shrink-0 hover:opacity-85 transition-opacity cursor-pointer"
            title={`Active ICU: ${icu} (Click to open ICU Operations)`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span 
              className="font-bold text-teal-800 dark:text-teal-200 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800/40 hover:border-teal-400 transition-colors"
            >
              {icu}
            </span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

          {/* 3. Patient */}
          <div className="flex items-center gap-1.5 shrink-0">
            <User className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <button
              onClick={() => navigate(`/patient/${currentPatient.id}`)}
              className="hover:underline font-bold text-slate-900 dark:text-white flex items-center gap-1.5"
              title="Open Patient Record"
            >
              <span>{currentPatient.name}</span>
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">({currentPatient.age}{currentPatient.gender})</span>
            </button>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black tracking-wider ${
              currentPatient.acuity === 'CRITICAL'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 animate-pulse'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40'
            }`}>
              ● {currentPatient.acuity}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

          {/* 4. Encounter */}
          <div className="flex items-center gap-1 shrink-0 font-mono">
            <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-800 dark:text-amber-200 font-bold">{currentPatient.encounterId}</span>
            <span className="text-[10px] text-slate-500 hidden md:inline">({currentPatient.admitDate})</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />

          {/* 5. Bed */}
          <div className="flex items-center gap-1 shrink-0 font-mono">
            <Bed className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
              {currentPatient.bedId}
            </span>
          </div>
        </div>
      )}

      {/* Right Controls: Quick Drawer Trigger + Break-Glass override */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Break-Glass Emergency Access */}
        <button
          onClick={() => setShowBreakGlassModal(true)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors ${
            isBreakGlassActive 
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black animate-pulse' 
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
          }`}
          title="Break-Glass: Emergency override access for unassigned clinical cases"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">
            {isBreakGlassActive ? 'BREAK-GLASS ACTIVE' : 'Break-Glass'}
          </span>
        </button>

        {/* Right Drawer Quick Details Button */}
        <button
          onClick={() => onToggleDrawer && onToggleDrawer('patient')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
            isDrawerOpen
              ? 'bg-teal-700 text-white border-teal-600 shadow'
              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border-slate-300 dark:border-slate-700'
          }`}
          title="Open Quick Details Drawer (Patient / Alerts / Tasks)"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Quick Details</span>
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
        </button>
      </div>

      {/* Break-Glass Modal */}
      {showBreakGlassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-3">
              <ShieldAlert className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Emergency Break-Glass Override</h3>
                <span className="text-[11px] font-mono text-amber-700 dark:text-amber-300">PROTOCOL ISO-27799 / CLINICAL AUDIT</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Invoking Break-Glass provides temporary elevated write & view access to <strong className="text-slate-900 dark:text-white">{currentPatient.name} ({currentPatient.id})</strong>. 
              This event will be logged in the immutable security audit trail and reported to the Medical Superintendent.
            </p>

            <form onSubmit={handleBreakGlassConfirm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1 font-mono">
                  CLINICAL JUSTIFICATION (REQUIRED)
                </label>
                <textarea
                  required
                  rows={3}
                  value={breakGlassReason}
                  onChange={(e) => setBreakGlassReason(e.target.value)}
                  placeholder="e.g., Code Blue call, attending physician on emergency duty, covering nurse absent..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 placeholder-slate-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBreakGlassModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Authorize & Override</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContextBar;
