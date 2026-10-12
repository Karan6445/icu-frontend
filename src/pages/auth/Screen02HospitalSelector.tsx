import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Layers,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Activity,
  Cpu,
  HeartPulse,
  LogOut,
  RefreshCw,
  Search,
  Sliders,
  AlertCircle,
  FileCode,
  XCircle
} from 'lucide-react';
import { SecurityApiService } from '../../services/securityApiService';
import {
  HospitalFacility,
  ICUFacility,
  ICUConfiguration,
  SecurityUser,
  Permission
} from '../../types/authSecurity';
import { useDarkMode } from '../../hooks/useDarkMode';

export const Screen02HospitalSelector: React.FC = () => {
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<SecurityUser | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [hospitals, setHospitals] = useState<HospitalFacility[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<HospitalFacility | null>(null);
  const [icus, setIcus] = useState<ICUFacility[]>([]);
  const [openingIcuId, setOpeningIcuId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState<ICUConfiguration | null>(null);

  // ------------------------------------------------------------------
  // Screen Logic: Load Authorized Facilities & ICUs on Mount
  // API: GET /api/me/context, GET /api/hospitals, GET /api/hospitals/{id}/icus
  // ------------------------------------------------------------------
  useEffect(() => {
    loadFacilityContext();
  }, []);

  const loadFacilityContext = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Load context & permissions
      const context = await SecurityApiService.getMeContext();
      setCurrentUser(context.user);
      setPermissions(context.permissions);

      // 2. Validate HOSPITAL_READ permission
      if (!context.permissions.includes('HOSPITAL_READ')) {
        throw new Error('Access Denied: You do not hold HOSPITAL_READ privileges.');
      }

      // 3. Load authorized hospitals (GET /api/hospitals)
      const facilities = await SecurityApiService.getHospitals();
      setHospitals(facilities);

      if (facilities.length > 0) {
        setSelectedHospital(facilities[0]);
        // 4. Load authorized ICUs for the default hospital (GET /api/hospitals/{id}/icus)
        const icuList = await SecurityApiService.getHospitalIcus(facilities[0].id);
        setIcus(icuList);
      }
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to load authorized hospital facilities.');
    }
  };

  const handleSelectHospital = async (hospital: HospitalFacility) => {
    setSelectedHospital(hospital);
    setErrorMessage(null);
    setConfigSuccess(null);
    try {
      // API: GET /api/hospitals/{id}/icus
      const icuList = await SecurityApiService.getHospitalIcus(hospital.id);
      setIcus(icuList);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading ICUs for hospital.');
    }
  };

  // ------------------------------------------------------------------
  // Action: Open ICU
  // Screen Logic: Load published configuration (GET /api/icus/{id}/configuration)
  // Validation & Error States: Deny if unauthorized; throw error if no active configuration
  // Permissions & Audit: Requires ICU_READ
  // ------------------------------------------------------------------
  const handleOpenICU = async (icu: ICUFacility) => {
    setOpeningIcuId(icu.id);
    setErrorMessage(null);
    setConfigSuccess(null);

    try {
      // 1. Verify ICU_READ permission
      if (!permissions.includes('ICU_READ')) {
        throw new Error('403 Forbidden: You do not possess ICU_READ clearance for this node.');
      }

      // 2. API Call: GET /api/icus/{id}/configuration
      const config = await SecurityApiService.getIcuConfiguration(icu.id);

      setConfigSuccess(config);

      // Store selected ICU in localStorage/session
      localStorage.setItem('selected_icu_id', icu.id);
      localStorage.setItem('selected_icu_name', icu.name);
      localStorage.setItem('selected_hospital_id', selectedHospital?.id || 'HOSP-01');
      localStorage.setItem('selected_hospital_name', selectedHospital?.name || 'PMCH');

      // Navigate into the Command Center / Bed Map with the published configuration
      setTimeout(() => {
        navigate('/command-center');
      }, 700);
    } catch (err: any) {
      setOpeningIcuId(null);
      setErrorMessage(err.message || 'Unable to open ICU configuration.');
    }
  };

  const handleLogout = () => {
    SecurityApiService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between selection:bg-teal-700 selection:text-white transition-colors duration-200">
      {/* ================= TOP APPLICATION HEADER ================= */}
      <header className="w-full bg-[#0F766E] text-white border-b border-[#0D655E] px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden p-1 flex items-center justify-center bg-slate-950 border border-teal-500/40 shadow-xs">
            <img
              src="/Naimify-logo-large.png"
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-wider uppercase font-sans text-white leading-none">
              NAIMIFY <span className="text-teal-200 font-black">FACILITY DISPATCH</span>
            </h1>
            <span className="text-[11px] text-teal-100 font-sans block mt-0.5">
              Screen 02 — Hospital & ICU Unit Selector
            </span>
          </div>
        </div>

        {/* User Context & Logout */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 bg-[#0D655E] px-3 py-1.5 rounded-xl border border-teal-500/30 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">{currentUser.name}</span>
              <span className="text-[10px] font-mono text-teal-200 bg-teal-800/80 px-1.5 py-0.5 rounded font-bold">
                {currentUser.role}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs shadow-xs transition-colors"
            title="Sign out of clinical session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* ================= MAIN CONTAINER ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Banner Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Select Intensive Care Facility
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                ACTIVE CONFIGURATION ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select an authorized hospital and target ICU unit to inspect real-time bed occupancy, critical alerts, and deploy telemetry configuration.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadFacilityContext}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Refresh Facility Feeds"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Validation & Error States Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3 shadow-xs animate-in fade-in duration-150">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-black text-sm block">Configuration & Authorization Error</span>
              <p>{errorMessage}</p>
              <span className="text-[11px] opacity-80 block font-mono">
                Permissions checked: HOSPITAL_READ ({permissions.includes('HOSPITAL_READ') ? 'Granted' : 'Missing'}), ICU_READ ({permissions.includes('ICU_READ') ? 'Granted' : 'Missing'})
              </span>
            </div>
          </div>
        )}

        {/* Success Config Load Banner */}
        {configSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs animate-in fade-in duration-150">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-black text-sm block">
                  Configuration Loaded: {configSuccess.version} ({configSuccess.status})
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400">
                  Layout: {configSuccess.totalBeds} Beds ({configSuccess.rows}x{configSuccess.cols} Matrix) • Feeds: {configSuccess.telemetryFeeds.join(', ')}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
              Redirecting to Command Center...
            </span>
          </div>
        )}

        {/* ================= SECTION 1: HOSPITAL SELECTOR ================= */}
        <section aria-label="Hospital Facility Selection" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Authorized Hospitals ({hospitals.length})</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Requires HOSPITAL_READ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {hospitals.map((hospital) => {
              const isSelected = selectedHospital?.id === hospital.id;
              return (
                <div
                  key={hospital.id}
                  onClick={() => handleSelectHospital(hospital)}
                  className={`p-5 rounded-3xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-500 shadow-md ring-2 ring-teal-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-slate-200 dark:border-slate-700">
                      {hospital.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full font-mono text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      {hospital.status}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">
                    {hospital.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {hospital.city}, {hospital.state}
                  </span>

                  {/* Metrics Bar: ICU Count & Alert Count */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-center">
                      <span className="text-[10px] text-slate-400 uppercase block font-sans">Configured ICUs</span>
                      <span className="font-black text-sm text-slate-800 dark:text-slate-200">
                        {hospital.icuCount} Units
                      </span>
                    </div>

                    <div className="p-2 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-center border border-rose-200 dark:border-rose-900/30">
                      <span className="text-[10px] text-rose-500 uppercase block font-sans">Active Alerts</span>
                      <span className="font-black text-sm text-rose-600 dark:text-rose-400">
                        {hospital.alertCount} Alarms
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================= SECTION 2: ICU GRID & ACTION: OPEN ICU ================= */}
        <section aria-label="ICU Unit Selection" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>
                ICUs in {selectedHospital?.name || 'Selected Hospital'} ({icus.length})
              </span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">Requires ICU_READ</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {icus.map((icu) => {
              const occupancyPercent = Math.round((icu.occupiedBeds / icu.totalBeds) * 100);
              const isOpening = openingIcuId === icu.id;
              const isConfigDraft = icu.configStatus === 'DRAFT';

              return (
                <div
                  key={icu.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 transition-all hover:border-teal-500/40"
                >
                  {/* Top Bar of Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-base text-slate-900 dark:text-white">
                          {icu.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-black bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                          {icu.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {icu.description}
                      </span>
                    </div>

                    {/* Config Status Pill */}
                    {icu.configStatus === 'PUBLISHED' ? (
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full font-mono text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        DRAFT CONFIG
                      </span>
                    )}
                  </div>

                  {/* Bed Occupancy Meter */}
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-500 dark:text-slate-400 font-sans">Bed Occupancy:</span>
                      <span className="font-black text-slate-900 dark:text-white">
                        {icu.occupiedBeds} / {icu.totalBeds} Beds ({occupancyPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          occupancyPercent >= 90
                            ? 'bg-rose-500'
                            : occupancyPercent >= 75
                            ? 'bg-amber-500'
                            : 'bg-teal-500'
                        }`}
                        style={{ width: `${occupancyPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Critical Alerts & Staffing Details */}
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono text-center">
                    <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-[10px] text-slate-400 block font-sans">Active Alarms</span>
                      <span className={`font-black text-sm ${icu.alertCount > 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                        {icu.alertCount} Critical
                      </span>
                    </div>

                    <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-[10px] text-slate-400 block font-sans">Nurses On-Duty</span>
                      <span className="font-black text-sm text-slate-800 dark:text-slate-200">
                        {icu.nurseOnDutyCount} Staff
                      </span>
                    </div>

                    <div className="p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-[10px] text-slate-400 block font-sans">Connected IoT</span>
                      <span className="font-black text-sm text-teal-600 dark:text-teal-400">
                        {icu.activeDevicesCount} Devices
                      </span>
                    </div>
                  </div>

                  {/* ACTION: Open ICU Button */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleOpenICU(icu)}
                      disabled={isOpening}
                      className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 ${
                        isConfigDraft
                          ? 'bg-slate-800 hover:bg-slate-700 text-white'
                          : 'bg-teal-600 hover:bg-teal-700 text-white'
                      }`}
                    >
                      {isOpening ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying Published Configuration...</span>
                        </>
                      ) : (
                        <>
                          <span>Open ICU Command Center</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                    {isConfigDraft && (
                      <span className="text-[10px] text-amber-500 text-center block mt-1 font-mono">
                        (Simulates Error: Draft config without published approval)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between select-none">
        <span className="font-mono text-[11px]">
          Session Token: Active • Audit Logged: AUTH_SUCCESS
        </span>
        <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
          State ICU Gateway v2.4
        </span>
      </footer>
    </div>
  );
};

export default Screen02HospitalSelector;
