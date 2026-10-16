import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  Bell, 
  Search, 
  Clock, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  ChevronDown,
  Video,
  Layers,
  Check,
  PlusCircle,
  ArrowRight,
  Activity,
  Home,
  Stethoscope
} from 'lucide-react';
import { WebSocketService } from '../../services/websocket';
import { AlertService } from '../../services/alertService';
import { useDarkMode } from '../../hooks/useDarkMode';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileDropdown } from './UserProfileDropdown';
import { DevRoleSwitcher } from '../common/DevRoleSwitcher';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUnreadCountThunk } from '../../store/slices/notificationSlice';
import { setActiveRole, SystemRole } from '../../store/slices/authSlice';
import { ALL_ICUS_18, ICUOption } from '../../data/icuData';
import { MOCK_CLINICS } from '../../data/mockEclinicData';

interface NavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isMobileDrawerOpen: boolean;
  onToggleMobileDrawer: () => void;
  onOpenSearch?: () => void;
  onOpenHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSidebarCollapsed,
  onToggleSidebar,
  isMobileDrawerOpen,
  onToggleMobileDrawer,
  onOpenSearch,
  onOpenHelp
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { activeRole, currentUser: reduxUser } = useAppSelector(state => state.auth);
  const { unreadCount } = useAppSelector(state => state.notifications);
  const { isDark, toggleDarkMode } = useDarkMode();

  const [isConnected, setIsConnected] = useState<boolean>(WebSocketService.getIsConnected());
  const [timeString, setTimeString] = useState<string>('');

  // Hospital Selector (synced with localStorage)
  const [selectedHospital, setSelectedHospital] = useState<string>(() => {
    return localStorage.getItem('selected_hospital_name') || 'PMCH Patna';
  });

  // ICU Ward Selector (synced with localStorage)
  const [selectedIcu, setSelectedIcu] = useState<string>(() => {
    return localStorage.getItem('selected_icu_id') || 'MICU-01';
  });

  // E-Clinic Node Selector (synced with localStorage)
  const [selectedClinicId, setSelectedClinicId] = useState<string>(() => {
    return localStorage.getItem('selected_eclinic_id') || MOCK_CLINICS[0].id;
  });

  const handleClinicChange = (id: string) => {
    setSelectedClinicId(id);
    localStorage.setItem('selected_eclinic_id', id);
    window.dispatchEvent(new Event('eclinic_clinic_changed'));
  };

  const isEClinicMode = location.pathname.startsWith('/eclinic');

  // Custom ICU Dropdown State
  const [isIcuDropdownOpen, setIsIcuDropdownOpen] = useState<boolean>(false);
  const [icuSearchQuery, setIcuSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const icuDropdownRef = useRef<HTMLDivElement>(null);

  const currentIcuObj = ALL_ICUS_18.find(
    i => i.id === selectedIcu || i.code === selectedIcu || i.name.toLowerCase().includes(selectedIcu.toLowerCase())
  ) || ALL_ICUS_18[0];

  const handleSelectIcu = (icu: ICUOption) => {
    setSelectedIcu(icu.id);
    setIsIcuDropdownOpen(false);
    setIcuSearchQuery('');
    localStorage.setItem('selected_icu_id', icu.id);
    localStorage.setItem('selected_icu_code', icu.code);
    localStorage.setItem('selected_icu_name', icu.name);
    window.dispatchEvent(new CustomEvent('icuChanged', { detail: icu }));
    window.dispatchEvent(new Event('storage'));

    // Automatically open the page according to that ICU:
    if (location.pathname.startsWith('/command-center')) {
      navigate(`/command-center?icu=${encodeURIComponent(icu.id)}`);
    } else if (location.pathname.startsWith('/admin/bed-map') || location.pathname.startsWith('/admin/beds')) {
      navigate(`/admin/bed-map?icu=${encodeURIComponent(icu.id)}`);
    } else if (location.pathname.startsWith('/doctor')) {
      navigate(`/doctor/bed-view?icu=${encodeURIComponent(icu.id)}`);
    } else {
      // Default / Hospital Admin / Super Admin routes:
      navigate(`/admin/hospital-icus?icu=${encodeURIComponent(icu.id)}`);
    }
  };

  // Close dropdown on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (icuDropdownRef.current && !icuDropdownRef.current.contains(event.target as Node)) {
        setIsIcuDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsIcuDropdownOpen(false);
      }
    };
    if (isIcuDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isIcuDropdownOpen]);

  useEffect(() => {
    const handleIcuUpdate = () => {
      const stored = localStorage.getItem('selected_icu_id');
      if (stored && stored !== selectedIcu) {
        setSelectedIcu(stored);
      }
    };
    window.addEventListener('storage', handleIcuUpdate);
    window.addEventListener('icuChanged', handleIcuUpdate);
    return () => {
      window.removeEventListener('storage', handleIcuUpdate);
      window.removeEventListener('icuChanged', handleIcuUpdate);
    };
  }, [selectedIcu]);

  // Notification Unread Badge Sync (Mount & Tab Focus)
  useEffect(() => {
    dispatch(fetchUnreadCountThunk());

    const handleFocus = () => {
      dispatch(fetchUnreadCountThunk());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [dispatch]);

  const filteredIcuList = ALL_ICUS_18.filter(icu => {
    const matchesSearch = 
      !icuSearchQuery.trim() ||
      icu.name.toLowerCase().includes(icuSearchQuery.toLowerCase()) ||
      icu.code.toLowerCase().includes(icuSearchQuery.toLowerCase()) ||
      icu.fullName.toLowerCase().includes(icuSearchQuery.toLowerCase()) ||
      icu.type.toLowerCase().includes(icuSearchQuery.toLowerCase()) ||
      icu.floor.toLowerCase().includes(icuSearchQuery.toLowerCase()) ||
      icu.description.toLowerCase().includes(icuSearchQuery.toLowerCase());

    const matchesCategory =
      selectedCategoryFilter === 'ALL' ||
      (selectedCategoryFilter === 'Medical' && (icu.type.includes('Medical') || icu.code.startsWith('MICU') || icu.code.startsWith('RICU'))) ||
      (selectedCategoryFilter === 'Surgical' && (icu.type.includes('Surgical') || icu.code.startsWith('SICU'))) ||
      (selectedCategoryFilter === 'Cardiac' && (icu.type.includes('Card') || icu.code.startsWith('CICU') || icu.code.startsWith('CCU'))) ||
      (selectedCategoryFilter === 'Pediatric' && (icu.type.includes('Pediatric') || icu.type.includes('Neonatal') || icu.code.startsWith('PICU') || icu.code.startsWith('NNICU'))) ||
      (selectedCategoryFilter === 'Neuro' && (icu.type.includes('Neuro') || icu.code.startsWith('NICU'))) ||
      (selectedCategoryFilter === 'Specialty' && (icu.code.startsWith('TICU') || icu.code.startsWith('BURNS') || icu.code.startsWith('TXICU') || icu.code.startsWith('OICU') || icu.code.startsWith('ECMO')));

    return matchesSearch && matchesCategory;
  });

  // Determine visibility of ICU Ward selector:
  // Visible in Hospital Admin (ADMIN / DIRECTOR), Doctor (DOCTOR), Super Admin (SUPER_ADMIN)
  // or on any admin/doctor/command-center route.
  const isIcuSelectorVisible =
    ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'DOCTOR'].includes(activeRole) ||
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/doctor') ||
    location.pathname.startsWith('/command-center');

  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  const activeAlerts = AlertService.getActiveAlerts();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', { hour12: false })
      );
    }, 1000);
    const now = new Date();
    setTimeString(now.toLocaleTimeString('en-US', { hour12: false }));
    return () => clearInterval(timer);
  }, []);

  const handleToggleConnection = () => {
    const updated = WebSocketService.toggleConnection();
    setIsConnected(updated);
  };

  const handleRoleChange = (role: SystemRole) => {
    dispatch(setActiveRole(role));
    switch (role) {
      case 'SUPER_ADMIN':
        navigate('/command-center');
        break;
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'DOCTOR':
        navigate('/doctor');
        break;
      case 'NURSE':
      case 'CHARGE_NURSE':
      case 'NURSE_LEAD':
        navigate('/nurse');
        break;
      default:
        navigate('/command-center');
    }
  };

  const handleHospitalChange = (val: string) => {
    setSelectedHospital(val);
    localStorage.setItem('selected_hospital_name', val);
  };

  const closeAllDropdowns = () => {
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
  };

  return (
    <header className="bg-[#0F766E] text-white border-b border-[#0D655E] px-2 sm:px-4 py-1.5 flex items-center justify-between shadow-sm sticky top-0 z-40 transition-colors duration-200 select-none h-14 min-h-[56px] flex-nowrap">
      {/* Brand Logo & Mobile Trigger */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 min-w-0">
        <button
          onClick={onToggleMobileDrawer}
          className="lg:hidden p-1.5 rounded-xl text-teal-100 hover:text-white hover:bg-[#0D655E] transition-colors shrink-0"
          title="Toggle Navigation Menu"
        >
          {isMobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to="/home" className="flex items-center gap-2 shrink-0 group min-w-0">
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-md bg-slate-950 p-1 border border-teal-500/40 shrink-0">
            <img
              src="/Naimify-logo-large.png"
              alt="Logo"
              className="w-full h-full object-contain transition-transform group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>

          <div className="hidden xl:block shrink-0">
            <span className="text-xs font-black tracking-wider uppercase font-sans text-white leading-none block">
              NAIMIFY <span className="text-teal-200 font-black">SMART HEALTH</span>
            </span>
            <span className="text-[10px] text-teal-100/90 block mt-0.5 font-sans font-medium">
              Smart ICU & E-Clinic Platform
            </span>
          </div>
        </Link>

        {/* ================= GLOBAL MODULE SWITCHER ================= */}
        <div className="hidden md:flex items-center bg-[#073631] p-1 rounded-xl border border-teal-500/30 gap-1 ml-1 sm:ml-2">
          <Link
            to="/home"
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              location.pathname === '/home'
                ? 'bg-teal-600 text-white shadow-xs font-black'
                : 'text-teal-200 hover:text-white hover:bg-teal-800/40'
            }`}
            title="Naimify Smart Health Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Home</span>
          </Link>

          <Link
            to="/command-center"
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isEClinicMode && location.pathname !== '/home'
                ? 'bg-[#10B981] text-white shadow-xs font-black'
                : 'text-teal-200 hover:text-white hover:bg-teal-800/40'
            }`}
            title="Inpatient Critical Care & ICU Command Center"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Smart ICU</span>
          </Link>

          <Link
            to="/eclinic"
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isEClinicMode
                ? 'bg-[#10B981] text-white shadow-xs font-black'
                : 'text-teal-200 hover:text-white hover:bg-teal-800/40'
            }`}
            title="Outpatient Telemedicine & Digital OPD"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>E-Clinic</span>
          </Link>
        </div>
      </div>

      {/* ================= EXACT TOP BAR: UNIFIED SINGLE ROW CONTROLS ================= */}
      <div className="flex items-center gap-1 sm:gap-1.5 flex-nowrap justify-end shrink-0">
        {/* DEV ROLE SWITCHER (LIVE TESTING FOR ALL 7 ROLES) */}
        <div className="shrink-0">
          <DevRoleSwitcher />
        </div>

        {/* CLINIC NODE SELECTOR (If in E-Clinic mode) OR HOSPITAL SELECTOR (If in ICU mode) */}
        {isEClinicMode ? (
          <div className="hidden sm:flex items-center gap-1.5 bg-[#0D655E] hover:bg-[#0B5650] px-2 py-1.5 h-8.5 rounded-xl border border-teal-500/30 text-xs font-semibold text-white transition-colors shrink-0">
            <Building2 className="w-3.5 h-3.5 text-teal-200 shrink-0" />
            <select
              value={selectedClinicId}
              onChange={(e) => handleClinicChange(e.target.value)}
              className="bg-transparent font-bold cursor-pointer focus:outline-none text-xs text-white max-w-[130px] lg:max-w-[170px] truncate"
              title="Active E-Clinic Node"
            >
              {MOCK_CLINICS.map(clinic => (
                <option key={clinic.id} value={clinic.id} className="bg-[#0F766E] text-white">
                  {clinic.clinicName}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1.5 bg-[#0D655E] hover:bg-[#0B5650] px-2 py-1.5 h-8.5 rounded-xl border border-teal-500/30 text-xs font-semibold text-white transition-colors shrink-0">
            <Building2 className="w-3.5 h-3.5 text-teal-200 shrink-0" />
            <select
              value={selectedHospital}
              onChange={(e) => handleHospitalChange(e.target.value)}
              className="bg-transparent font-bold cursor-pointer focus:outline-none text-xs text-white max-w-[105px] lg:max-w-[125px] truncate"
              title="Hospital Selector"
            >
              <option value="PMCH Patna" className="bg-[#0F766E] text-white">PMCH Patna</option>
              <option value="AIIMS Patna" className="bg-[#0F766E] text-white">AIIMS Patna</option>
              <option value="DMCH Darbhanga" className="bg-[#0F766E] text-white">DMCH Darbhanga</option>
              <option value="NMCH Patna" className="bg-[#0F766E] text-white">NMCH Patna</option>
            </select>
          </div>
        )}

        {/* ICU WARD SELECTOR (Accessible in Hospital Admin, Doctor, and Super Admin with 18 ICUs - Hidden in E-Clinic) */}
        {!isEClinicMode && isIcuSelectorVisible && (
          <div className="relative shrink-0" ref={icuDropdownRef}>
            <button
              type="button"
              onClick={() => setIsIcuDropdownOpen(prev => !prev)}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 h-8.5 rounded-full border text-xs font-semibold text-white transition-all cursor-pointer shadow-xs select-none ${
                isIcuDropdownOpen
                  ? 'bg-[#0B5650] border-teal-300 ring-2 ring-teal-400/30'
                  : 'bg-[#0D655E] hover:bg-[#0B5650] border-teal-500/40 hover:border-teal-400/60'
              }`}
              title={`Active ICU: ${currentIcuObj?.fullName || selectedIcu} (Click to change unit)`}
              id="navbar-icu-custom-trigger"
              aria-expanded={isIcuDropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-5 h-5 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-200">
                <Layers className="w-3 h-3 text-teal-200 shrink-0" />
              </div>
              
              <div className="flex items-center gap-1.5 max-w-[135px] xl:max-w-[170px] truncate">
                <span className="font-mono font-bold tracking-tight text-white truncate text-xs">
                  {currentIcuObj ? currentIcuObj.name : selectedIcu}
                </span>
              </div>

              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-teal-900/80 text-teal-200 border border-teal-400/30 hidden md:inline-block">
                {currentIcuObj?.totalBeds || 12}B
              </span>

              <ChevronDown className={`w-3.5 h-3.5 text-teal-200 shrink-0 transition-transform duration-200 ${isIcuDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Premium Custom Dropdown Panel */}
            {isIcuDropdownOpen && (
              <div 
                className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] max-w-[92vw] bg-[#073631] border border-teal-500/50 shadow-2xl rounded-2xl p-3 z-50 text-white backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                role="dialog"
                aria-label="ICU Unit Selector"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-teal-700/60 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-teal-500/20 text-teal-300">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold tracking-wide text-white uppercase font-sans">
                        Specialized ICU Wards
                      </h3>
                      <p className="text-[10px] text-teal-300/80 font-mono">
                        18 Active Units • Telemetry Matrix
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    LIVE
                  </span>
                </div>

                {/* Search Input Filter */}
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-teal-300/80 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Filter 18 ICUs (e.g. PICU, Neuro, Cardiac)..."
                    value={icuSearchQuery}
                    onChange={(e) => setIcuSearchQuery(e.target.value)}
                    className="w-full bg-[#052925] border border-teal-600/40 focus:border-teal-400 focus:ring-1 focus:ring-teal-400/40 rounded-xl pl-8 pr-7 py-1.5 text-xs text-white placeholder-teal-300/50 outline-none font-sans"
                    autoFocus
                  />
                  {icuSearchQuery && (
                    <button 
                      onClick={() => setIcuSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-teal-300/70 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1.5 mb-1.5 text-[10px] font-mono no-scrollbar">
                  {['ALL', 'Medical', 'Surgical', 'Cardiac', 'Pediatric', 'Neuro', 'Specialty'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategoryFilter === cat
                          ? 'bg-[#10B981] text-white font-bold'
                          : 'bg-[#052925] text-teal-200/80 hover:bg-teal-800/50 hover:text-white border border-teal-700/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Scrollable ICU Units List */}
                <div className="max-h-72 sm:max-h-80 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {filteredIcuList.length === 0 ? (
                    <div className="py-6 text-center text-xs text-teal-200/70 font-mono">
                      No ICU units found matching "{icuSearchQuery}"
                    </div>
                  ) : (
                    filteredIcuList.map(icu => {
                      const isSelected = selectedIcu === icu.id || selectedIcu === icu.code;

                      return (
                        <button
                          key={icu.id}
                          type="button"
                          onClick={() => handleSelectIcu(icu)}
                          className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2.5 group cursor-pointer border ${
                            isSelected
                              ? 'bg-[#0f6259] text-white border-teal-300/80 shadow-md ring-1 ring-teal-400/40 font-bold'
                              : 'bg-[#062c28]/90 text-teal-100 hover:bg-[#0c534b] hover:text-white border-teal-700/30 hover:border-teal-500/50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Code badge */}
                            <span className={`px-2 py-1 rounded-lg font-mono text-[11px] font-black shrink-0 border ${
                              isSelected
                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                                : 'bg-[#041f1c] text-teal-200 border-teal-600/40 group-hover:border-teal-400 group-hover:text-white'
                            }`}>
                              {icu.code}
                            </span>

                            <div className="min-w-0 truncate">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-white truncate font-sans">
                                  {icu.name.split('(')[0].trim()}
                                </span>
                                <span className="text-[10px] text-teal-300 font-mono">
                                  ({icu.type})
                                </span>
                              </div>
                              <span className="text-[10px] text-teal-200/70 block truncate font-sans">
                                {icu.fullName} • {icu.floor}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950/60 text-teal-200 border border-teal-600/40">
                              {icu.totalBeds} Beds
                            </span>
                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 bg-teal-700/60 text-teal-200 flex items-center justify-center shrink-0 transition-opacity">
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer with Quick Action Links */}
                <div className="pt-2 mt-2 border-t border-teal-700/60 flex items-center justify-between gap-2 text-xs font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setIsIcuDropdownOpen(false);
                      navigate('/admin/hospital-icus');
                    }}
                    className="text-[11px] text-teal-200 hover:text-white font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-teal-300" />
                    <span>All Units Hierarchy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsIcuDropdownOpen(false);
                      navigate('/admin/add-icu');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Add ICU</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. SERVER TIME */}
        <div 
          className="hidden xl:flex items-center gap-1.5 font-mono text-xs text-teal-100 bg-[#0D655E] px-2 py-1.5 h-8.5 rounded-xl border border-teal-500/30 shrink-0"
          title="Hospital Server Time"
        >
          <Clock className="w-3.5 h-3.5 text-teal-200 shrink-0" />
          <span>{timeString}</span>
        </div>

        {/* 3. GOOGLE MEET (TELE-ICU) */}
        <a
          href="/meet"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1.5 h-8.5 rounded-xl border border-teal-500/30 hover:bg-[#0D655E] text-teal-100 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
          title="Google Meet Tele-ICU Consultation"
          id="global-google-meet-btn"
          aria-label="Google Meet Tele-ICU"
        >
          <Video className="w-3.5 h-3.5 text-white shrink-0" />
          <span className="hidden sm:inline">Meet</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </a>

        {/* 4. CONNECTION (LIVE / OFFLINE) */}
        <button
          onClick={handleToggleConnection}
          className={`flex items-center gap-1.5 px-2 py-1.5 h-8.5 rounded-xl font-mono text-[11px] font-bold border transition-all shrink-0 ${
            isConnected
              ? 'bg-[#10B981] text-white border-[#059669]'
              : 'bg-rose-500/20 text-rose-200 border-rose-400/40 animate-pulse'
          }`}
          title={isConnected ? 'Telemetry Stream LIVE' : 'Telemetry OFFLINE'}
        >
          {isConnected ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
              <Wifi className="w-3.5 h-3.5 text-white shrink-0" />
              <span className="hidden lg:inline font-bold">LIVE</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span>OFFLINE</span>
            </>
          )}
        </button>

        {/* 5. CRITICAL ALERTS */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setIsProfileOpen(false);
              setIsNotificationOpen(prev => !prev);
            }}
            className={`px-2 py-1.5 h-8.5 rounded-xl border transition-colors flex items-center gap-1 text-xs font-bold relative shrink-0 cursor-pointer ${
              isNotificationOpen
                ? 'bg-rose-600 border-rose-700 text-white'
                : 'text-teal-100 border-teal-500/30 hover:bg-[#0D655E]'
            }`}
            title="Critical Alerts"
            aria-expanded={isNotificationOpen}
          >
            <Bell className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="hidden md:inline">Alerts</span>
            {unreadCount > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold animate-pulse shrink-0">
                {unreadCount}
              </span>
            ) : activeAlerts.length > 0 ? (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold shrink-0">
                {activeAlerts.length}
              </span>
            ) : null}
          </button>

          <NotificationDropdown
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
          />
        </div>

        {/* SEARCH TRIGGER */}
        <button
          onClick={onOpenSearch}
          className="px-2 py-1.5 h-8.5 rounded-xl border border-teal-500/30 hover:bg-[#0D655E] text-teal-100 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
          title="Search Patient | MRN | Bed | Device (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <kbd className="hidden 2xl:inline text-[9px] font-mono bg-[#0D655E] px-1 rounded border border-teal-500/30">⌘K</kbd>
        </button>

        {/* 10. DARK/LIGHT SWITCHER */}
        <button
          onClick={toggleDarkMode}
          className="w-8.5 h-8.5 flex items-center justify-center text-teal-100 hover:text-white hover:bg-[#0D655E] rounded-xl transition-colors shrink-0 cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-teal-100" />}
        </button>

        {/* 11. USER PROFILE */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setIsNotificationOpen(false);
              setIsProfileOpen(prev => !prev);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 h-8.5 rounded-xl border transition-all shadow-xs shrink-0 cursor-pointer ${
              isProfileOpen ? 'bg-[#10B981] text-white border-[#059669]' : 'bg-[#0D655E] hover:bg-[#0B5650] text-white border-teal-500/30'
            }`}
            title="User Profile Menu"
            aria-expanded={isProfileOpen}
            aria-haspopup="true"
          >
            <div className="w-5.5 h-5.5 rounded-full bg-[#10B981] border border-[#059669] text-white font-black text-[9px] flex items-center justify-center shadow-xs shrink-0">
              {reduxUser.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left min-w-0 max-w-[85px] xl:max-w-[110px]">
              <span className="text-xs font-bold block leading-none truncate text-white">{reduxUser.name}</span>
              <span className="text-[9px] text-teal-200 font-mono block leading-tight truncate font-bold">{activeRole === 'SUPER_ADMIN' ? 'COMMAND CENTER' : activeRole}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-teal-200 hidden sm:block shrink-0 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <UserProfileDropdown
            user={reduxUser}
            activeRole={activeRole}
            hospital={selectedHospital}
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onRoleChange={handleRoleChange}
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
