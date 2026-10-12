import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_PATIENTS, MOCK_BEDS } from '../../data/mockPatients';
import { Patient, Bed } from '../../types/patient';
import { DataQualityBadge } from '../../components/common/DataQualityBadge';
import { HeartbeatWaveform } from '../../components/svg/HeartbeatWaveform';
import { ICUFloorPlan } from '../../components/svg/ICUFloorPlan';
import { 
  Grid, 
  Map, 
  Search, 
  UserCheck, 
  AlertCircle, 
  Activity, 
  Wifi, 
  WifiOff,
  Wind, 
  ChevronRight, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Video,
  Camera,
  Layers,
  Thermometer,
  Clock,
  UserPlus,
  Eye,
  Sliders,
  Check,
  X
} from 'lucide-react';
import { AuthService } from '../../services/authService';

export type Screen03Filter = 'ALL' | 'CRITICAL' | 'VENTILATED' | 'ISOLATION' | 'SPECIALTY' | 'EMPTY';

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  const [activeIcu, setActiveIcu] = useState(() => localStorage.getItem('selected_icu_id') || 'MICU-01');
  const [activeHospital, setActiveHospital] = useState(() => localStorage.getItem('selected_hospital_name') || 'PMCH Patna');
  const [viewMode, setViewMode] = useState<'GRID' | 'FLOORPLAN'>('GRID');

  // Sync active ICU when navigated with ?icu= or on global icuChanged event
  useEffect(() => {
    const syncIcu = () => {
      const params = new URLSearchParams(window.location.search);
      const queryIcu = params.get('icu') || localStorage.getItem('selected_icu_id');
      if (queryIcu) {
        setActiveIcu(queryIcu);
      }
    };
    syncIcu();
    window.addEventListener('icuChanged', syncIcu);
    window.addEventListener('storage', syncIcu);
    return () => {
      window.removeEventListener('icuChanged', syncIcu);
      window.removeEventListener('storage', syncIcu);
    };
  }, []);
  
  // Developer Guide SPEC Filters: Critical; ventilated; isolation; specialty; empty (+ ALL)
  const [activeFilter, setActiveFilter] = useState<Screen03Filter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected Patient Drawer & Camera Stream Preview Modal
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeCameraBed, setActiveCameraBed] = useState<string | null>(null);

  // Derive all 24 beds with live status
  const bedsWithState = MOCK_BEDS.map((bed, index) => {
    const patient = MOCK_PATIENTS.find(p => p.bedNumber === bed.number);
    
    // Add specific simulated properties for clinical testing
    const isVentilated = !!patient?.ventilator;
    const isCritical = patient?.status === 'CRITICAL' || patient?.reviewPriority === 'CRITICAL';
    const isIsolation = index % 5 === 2; // e.g. BED-03, BED-08 are contact isolation
    const isSpecialty = index === 6 || index === 8; // e.g. ECMO / CRRT
    const isStale = index === 3; // simulated stale telemetry
    const isDisconnected = index === 5; // simulated disconnected telemetry

    return {
      bed,
      patient,
      isVentilated,
      isCritical,
      isIsolation,
      isSpecialty,
      isStale,
      isDisconnected,
      alertCount: isCritical ? 2 : patient?.status === 'HIGH' ? 1 : 0
    };
  });

  // Filter application
  const filteredBeds = bedsWithState.filter(item => {
    if (activeFilter === 'CRITICAL' && (!item.patient || !item.isCritical)) return false;
    if (activeFilter === 'VENTILATED' && (!item.patient || !item.isVentilated)) return false;
    if (activeFilter === 'ISOLATION' && (!item.patient || !item.isIsolation)) return false;
    if (activeFilter === 'SPECIALTY' && (!item.patient || !item.isSpecialty)) return false;
    if (activeFilter === 'EMPTY' && item.patient) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const bedMatch = item.bed.number.toLowerCase().includes(q);
      const patientMatch = item.patient && (
        item.patient.name.toLowerCase().includes(q) ||
        item.patient.mrn.toLowerCase().includes(q) ||
        item.patient.admittingDiagnosis.toLowerCase().includes(q)
      );
      return bedMatch || patientMatch;
    }

    return true;
  });

  // Metrics
  const totalBeds = bedsWithState.length;
  const occupiedBeds = bedsWithState.filter(b => b.patient).length;
  const criticalCount = bedsWithState.filter(b => b.isCritical).length;
  const occupancyPercent = Math.round((occupiedBeds / totalBeds) * 100);

  const handleBedClick = (patient: Patient | undefined) => {
    if (patient) {
      setSelectedPatient(patient);
      // update global context in storage
      localStorage.setItem('selected_patient_id', patient.id);
    }
  };

  return (
    <div className="space-y-5 pb-12 select-none">
      {/* ================= 1. HEADER (ICU; occupancy; critical alerts; search) ================= */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-800 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-widest">
              SCREEN 03
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {activeHospital}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>{activeIcu} Command Center</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Central telemetry dispatch, multi-parameter bed grid & high-acuity surveillance.
          </p>
        </div>

        {/* Occupancy & Critical Alerts Telemetry Indicators */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          {/* Occupancy Meter */}
          <div className="bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 min-w-[150px] shadow-xs">
            <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold mb-1">
              <span>OCCUPANCY</span>
              <span className="text-teal-700 dark:text-teal-400 font-bold">{occupancyPercent}%</span>
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {occupiedBeds} / {totalBeds} Beds
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div 
                className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>

          {/* Critical Alerts Count */}
          <div className="bg-rose-50 dark:bg-rose-950/40 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-800/80 min-w-[130px] shadow-xs">
            <span className="text-[10px] text-rose-700 dark:text-rose-400 block font-bold">CRITICAL ALERTS</span>
            <div className="text-base font-black text-rose-700 dark:text-rose-300 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>{criticalCount} ACTIVE</span>
            </div>
            <span className="text-[9px] text-rose-600/80 dark:text-rose-400/80 block mt-1">Requires immediate triage</span>
          </div>

          {/* Search Box in Header */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search BedID, Patient, MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-600 text-slate-900 dark:text-white w-52 sm:w-64 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* ================= 2. FILTERS (Critical; ventilated; isolation; specialty; empty) ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs font-mono font-bold bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 shrink-0">FILTER:</span>
          {(['ALL', 'CRITICAL', 'VENTILATED', 'ISOLATION', 'SPECIALTY', 'EMPTY'] as Screen03Filter[]).map((f) => {
            const count = 
              f === 'ALL' ? totalBeds :
              f === 'CRITICAL' ? criticalCount :
              f === 'VENTILATED' ? bedsWithState.filter(b => b.isVentilated).length :
              f === 'ISOLATION' ? bedsWithState.filter(b => b.isIsolation).length :
              f === 'SPECIALTY' ? bedsWithState.filter(b => b.isSpecialty).length :
              bedsWithState.filter(b => !b.patient).length;

            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                  activeFilter === f
                    ? 'bg-teal-700 text-white font-black shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{f}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === f ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle: Grid vs Floor Plan */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-white p-1 rounded-xl font-mono text-xs shadow-xs">
          <button
            onClick={() => setViewMode('GRID')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'GRID' ? 'bg-teal-700 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Bed Grid</span>
          </button>
          <button
            onClick={() => setViewMode('FLOORPLAN')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'FLOORPLAN' ? 'bg-teal-700 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Floor Plan</span>
          </button>
        </div>
      </div>

      {/* ================= 3. BED GRID / FLOORPLAN ================= */}
      {viewMode === 'FLOORPLAN' ? (
        <ICUFloorPlan />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {filteredBeds.map(({ bed, patient, isVentilated, isCritical, isIsolation, isSpecialty, isStale, isDisconnected, alertCount }) => {
            // ================= EMPTY BED STATE =================
            if (!patient) {
              return (
                <div
                  key={bed.id}
                  className="bg-white/90 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between items-center text-center min-h-[260px] group hover:border-teal-600 transition-all duration-200 shadow-xs hover:shadow-md"
                >
                  <div className="w-full flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
                    <span className="font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                      {bed.number}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-slate-500 font-bold uppercase">AVAILABLE</span>
                  </div>

                  <div className="my-4 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-slate-800/80 border border-teal-200 dark:border-slate-700 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-2 group-hover:scale-105 transition-transform">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-300">Bed Unoccupied</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Sanitized & Telemetry Ready</span>
                  </div>

                  <button
                    onClick={() => navigate('/patients')}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-700 hover:text-white text-slate-700 dark:text-slate-300 font-mono text-xs font-bold transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    + Admit / Assign Patient
                  </button>
                </div>
              );
            }

            // ================= OCCUPIED BED POD: BedID; patient; HR; BP; SpO2; RR; ventilator; alert; camera =================
            return (
              <div
                key={bed.id}
                onClick={() => handleBedClick(patient)}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative group text-slate-800 dark:text-slate-100 ${
                  isCritical
                    ? 'border-rose-300 hover:border-rose-500 dark:border-rose-700/80'
                    : 'border-slate-200 hover:border-teal-500 dark:border-slate-800'
                }`}
              >
                {/* Header: BedID, Status Badges, Camera Trigger */}
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {bed.number}
                      </span>

                      {/* Stale / Disconnected / Live Badges */}
                      {isDisconnected ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40 text-[9px] font-black flex items-center gap-1">
                          <WifiOff className="w-2.5 h-2.5" /> DISCONNECTED
                        </span>
                      ) : isStale ? (
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 text-[9px] font-black flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> STALE (2m)
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 text-[9px] font-black flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Camera Stream Preview Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCameraBed(bed.number);
                        }}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-teal-700 text-teal-700 hover:text-white dark:bg-slate-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700 transition-colors"
                        title="Open Live PTZ Camera Stream"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>

                      {/* Isolation Badge */}
                      {isIsolation && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/40 text-[9px] font-black">
                          ISOLATION
                        </span>
                      )}

                      {/* Alert State Badge */}
                      {alertCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[9px] animate-pulse shadow-xs">
                          {alertCount} ALARM
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="mb-2">
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors truncate">
                        {patient.name}
                      </h3>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        {patient.age}y/{patient.gender}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                      {patient.mrn} · {patient.admittingDiagnosis}
                    </p>
                  </div>

                  {/* Structured Key Vitals: HR, BP, SpO2, RR */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 font-mono mb-2 shadow-2xs">
                    <div className="grid grid-cols-4 gap-1 text-center">
                      <div>
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-bold">HR</span>
                        <span className="text-base font-black text-rose-600 dark:text-rose-400">{patient.vitals.hr}</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 block">bpm</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-bold">BP</span>
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 block leading-tight mt-0.5">
                          {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                        </span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 block">({patient.vitals.map})</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-bold">SpO2</span>
                        <span className="text-base font-black text-sky-600 dark:text-sky-400">{patient.vitals.spo2}%</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 block">pulse</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 dark:text-slate-400 block font-bold">RR</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{patient.vitals.rr}</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 block">/min</span>
                      </div>
                    </div>

                    {/* Tiny ECG wave */}
                    <div className="mt-1.5 pt-1 border-t border-slate-200 dark:border-slate-900">
                      <HeartbeatWaveform
                        color={isCritical ? '#e11d48' : '#059669'}
                        height={20}
                        bpm={patient.vitals.hr}
                      />
                    </div>
                  </div>

                  {/* Ventilator Status */}
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-100 dark:border-slate-800 text-[10px] font-mono flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Wind className={`w-3.5 h-3.5 ${isVentilated ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span className="text-slate-500 dark:text-slate-400 font-bold">VENT:</span>
                      <span className="text-slate-800 dark:text-white font-bold">
                        {patient.ventilator ? `${patient.ventilator.mode} (PEEP ${patient.ventilator.peep} · FiO2 ${patient.ventilator.fio2}%)` : 'Room Air / Non-Invasive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Quick Drawer / Full View */}
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="text-slate-400 dark:text-slate-500">Click for Quick Drawer</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/patient/${patient.id}`);
                    }}
                    className="text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Full Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= 4. SELECTED PATIENT SUMMARY DRAWER ================= */}
      {selectedPatient && (
        <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col text-slate-800 dark:text-slate-200 animate-in slide-in-from-right duration-200">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
              <h2 className="font-black text-sm text-slate-900 dark:text-white uppercase font-sans">Bed {selectedPatient.bedNumber} Summary</h2>
            </div>
            <button
              onClick={() => setSelectedPatient(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedPatient.name}</h3>
              <p className="font-mono text-slate-500 dark:text-slate-400 text-xs">{selectedPatient.id} · {selectedPatient.mrn} · {selectedPatient.age}y/{selectedPatient.gender}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">PRIMARY DIAGNOSIS</span>
                <span className="font-semibold text-slate-800 dark:text-white">{selectedPatient.admittingDiagnosis}</span>
              </div>
            </div>

            {/* Vitals Summary */}
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 font-mono shadow-xs">
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold block uppercase">Live Telemetry Snapshot</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px]">HEART RATE</span>
                  <span className="text-lg font-black text-rose-600 dark:text-rose-400">{selectedPatient.vitals.hr} bpm</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px]">BLOOD PRESSURE</span>
                  <span className="text-base font-black text-purple-700 dark:text-purple-300">{selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px]">SpO2 OXYGEN</span>
                  <span className="text-lg font-black text-sky-600 dark:text-sky-400">{selectedPatient.vitals.spo2}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[9px]">RESP RATE</span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{selectedPatient.vitals.rr} /min</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                const id = selectedPatient.id;
                setSelectedPatient(null);
                navigate(`/patient/${id}`);
              }}
              className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <span>Launch Full Patient Workspace</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ================= 5. LIVE PTZ CAMERA MODAL (Screen 22 Preview) ================= */}
      {activeCameraBed && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-teal-500/50 rounded-2xl max-w-lg w-full p-5 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">Live Camera: {activeCameraBed}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40 font-bold">
                  ● 1080p 30fps
                </span>
              </div>
              <button
                onClick={() => setActiveCameraBed(null)}
                className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Canvas Simulation */}
            <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
              <div className="absolute inset-0 bg-radial-at-c from-slate-900/60 to-slate-950 pointer-events-none" />
              <div className="text-center font-mono space-y-1">
                <Video className="w-10 h-10 text-teal-400/60 mx-auto animate-pulse" />
                <span className="text-xs text-slate-400 block font-bold">STREAM ENCRYPTED (TLS 1.3)</span>
                <span className="text-[10px] text-slate-500 block">Axis Q6135-LE PTZ Camera · IP 10.42.1.84</span>
              </div>

              {/* PTZ Overlay Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-xs border border-slate-700 text-xs font-mono">
                <span className="text-teal-300 font-bold">PTZ PRESET: PATIENT FACE</span>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">Zoom +</button>
                  <button className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">Zoom -</button>
                  <button className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold">Privacy Blind</button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
              <span>Short-lived Token: exp in 14m</span>
              <button
                onClick={() => {
                  setActiveCameraBed(null);
                  navigate('/virtual-icu');
                }}
                className="text-teal-700 dark:text-teal-400 hover:underline font-bold"
              >
                Open Virtual ICU Console →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandCenterPage;
