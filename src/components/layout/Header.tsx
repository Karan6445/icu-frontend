import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  Search, 
  Shield, 
  Clock, 
  UserCheck,
  Sun,
  Moon,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { WebSocketService } from '../../services/websocket';
import { useDarkMode } from '../../hooks/useDarkMode';
import { DataTrustDrawer } from '../common/DataTrustDrawer';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setActiveRole, SystemRole } from '../../store/slices/authSlice';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { activeRole, currentUser } = useAppSelector(state => state.auth);

  const { isDark, toggleDarkMode } = useDarkMode();
  const [isConnected, setIsConnected] = useState<boolean>(WebSocketService.getIsConnected());
  const [timeString, setTimeString] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('MICU-01');
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [isDataTrustOpen, setIsDataTrustOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeString(new Date().toTimeString().split(' ')[0]);
    }, 1000);
    setTimeString(new Date().toTimeString().split(' ')[0]);
    return () => clearInterval(timer);
  }, []);

  const handleToggleConnection = () => {
    const updated = WebSocketService.toggleConnection();
    setIsConnected(updated);
  };

  const handleRoleChange = (role: SystemRole) => {
    dispatch(setActiveRole(role));
    setShowRoleDropdown(false);
    if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'DIRECTOR') {
      navigate('/admin');
    } else if (role === 'DOCTOR') {
      navigate('/doctor');
    } else {
      navigate('/nurse');
    }
  };

  const roles: { role: SystemRole; label: string; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Command Center', desc: 'Hospitals, Directors, Edit Locked Remarks, Audits' },
    { role: 'DIRECTOR', label: 'Medical Director', desc: 'Hospital Medical Officer & Staff Director' },
    { role: 'ADMIN', label: 'ICU Admin', desc: 'Beds, Shifts & System Admin' },
    { role: 'NURSE_LEAD', label: 'Nurse Lead', desc: 'Head Nurse & Patient Intake Lead' },
    { role: 'DOCTOR', label: 'Doctor', desc: 'Doctor Checkups & Locked Remarks' },
    { role: 'NURSE', label: 'Nurse', desc: 'Patient Registration & Nurse Remarks' }
  ];

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex items-center justify-between shadow-xs relative z-30 transition-colors">
        {/* Left Unit Selector & Search */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <Building2 className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                navigate('/admin');
              }}
              className="bg-transparent font-bold cursor-pointer focus:outline-none dark:bg-slate-800"
            >
              <option value="MICU-01">AIIMS Patna ICU (MICU-01)</option>
              <option value="SICU-01">Surgical ICU (SICU-01)</option>
              <option value="CICU-01">Metro Cardiac ICU (CICU-01)</option>
              <option value="NICU-01">Neuro ICU (NICU-01)</option>
            </select>
            <span className="text-[10px] text-slate-500 font-mono hidden lg:inline">24 beds · 18 occupied</span>
          </div>

          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bed, patient, MRN..."
              className="pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs w-52 focus:outline-none focus:border-[#0F766E] dark:text-white"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setIsDataTrustOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 font-mono font-bold hover:bg-emerald-100 transition-all cursor-pointer"
            title="Click to open Data Trust & Stream Freshness Drawer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>● LIVE STREAM</span>
          </button>

          <button
            onClick={handleToggleConnection}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all border ${
              isConnected
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
            }`}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5 text-emerald-500" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500" />}
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <div className="hidden lg:flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeString}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 bg-[#0F766E] hover:bg-[#0D655E] text-white px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
            >
              {activeRole === 'SUPER_ADMIN' ? (
                <Crown className="w-4 h-4 text-amber-300 animate-bounce" />
              ) : (
                <UserCheck className="w-4 h-4 text-teal-200" />
              )}
              <span>{activeRole.replace('_', ' ')}</span>
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Select Active Role Context</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block mt-0.5">{currentUser.name}</span>
                </div>
                <div className="space-y-1">
                  {roles.map((r) => (
                    <button
                      key={r.role}
                      onClick={() => handleRoleChange(r.role)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-start justify-between ${
                        activeRole === r.role
                          ? 'bg-[#0F766E] text-white font-bold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold">
                          {r.role === 'SUPER_ADMIN' && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                          <span>{r.label}</span>
                        </div>
                        <span className={`text-[10px] block font-mono font-normal mt-0.5 ${activeRole === r.role ? 'text-teal-100' : 'text-slate-400'}`}>
                          {r.desc}
                        </span>
                      </div>
                      {activeRole === r.role && <Shield className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <DataTrustDrawer isOpen={isDataTrustOpen} onClose={() => setIsDataTrustOpen(false)} />
    </>
  );
};

