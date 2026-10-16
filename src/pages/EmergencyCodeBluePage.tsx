import React, { useState, useEffect, useMemo } from 'react';
import {
  Siren,
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Plus,
  RefreshCw,
  X,
  FileText,
  UserCheck,
  Bed,
  Layers,
  ChevronRight,
  ShieldAlert,
  Info,
  Check,
  Copy,
  Flame,
  Award,
  Zap,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchEmergencyEventsThunk,
  fetchEmergencyEventByIdThunk,
  declareEmergencyThunk,
  concludeEmergencyThunk,
  openDeclareModal,
  closeDeclareModal,
  openConcludeModal,
  closeConcludeModal,
  openDetailsDrawer,
  closeDetailsDrawer,
  setStatusFilter,
  setSearchQuery,
  clearMessages,
} from '../store/slices/emergencySlice';
import {
  EmergencyEventResponse,
  EmergencyEventType,
  DEFAULT_EMERGENCY_HOSPITAL_UUID,
  DEFAULT_EMERGENCY_ICU_UUID,
  DEFAULT_EMERGENCY_BED_UUID,
  DEFAULT_EMERGENCY_PATIENT_UUID,
  DEFAULT_EMERGENCY_STAFF_UUID,
} from '../api/emergencyApi';

// Stopwatch component for ticking elapsed time of active resuscitation
const ResuscitationElapsedTimer: React.FC<{ declaredAt: string }> = ({ declaredAt }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  useEffect(() => {
    const calc = () => {
      const diffMs = Math.max(0, Date.now() - new Date(declaredAt).getTime());
      setElapsedSeconds(Math.floor(diffMs / 1000));
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [declaredAt]);

  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const hours = Math.floor(minutes / 60);

  const formatted =
    hours > 0
      ? `${hours}h ${String(minutes % 60).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      : `${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

  return (
    <span className="font-mono font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 text-xs tracking-wider animate-pulse inline-flex items-center gap-1.5">
      <Clock className="w-3.5 h-3.5 text-rose-400" />
      <span>ACTIVE: {formatted}</span>
    </span>
  );
};

export const EmergencyCodeBluePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    events,
    activeEvents,
    selectedEvent,
    eventToConclude,
    isLoading,
    isSubmitting,
    error,
    successMessage,
    isDeclareModalOpen,
    isConcludeModalOpen,
    isDetailsDrawerOpen,
    filterStatus,
    searchQuery,
    lastPollTime,
  } = useAppSelector((state) => state.emergency);

  // Fallback patient/bed data from superAdmin/hospitalAdmin
  const { patients } = useAppSelector((state) => state.superAdmin);
  const { icus, beds } = useAppSelector((state) => state.hospitalAdmin);

  // Local auto-refresh switch
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for Declare Resuscitation Modal
  const [declareIcuId, setDeclareIcuId] = useState<string>(DEFAULT_EMERGENCY_ICU_UUID);
  const [declareBedId, setDeclareBedId] = useState<string>(DEFAULT_EMERGENCY_BED_UUID);
  const [declarePatientId, setDeclarePatientId] = useState<string>(DEFAULT_EMERGENCY_PATIENT_UUID);
  const [declareEventType, setDeclareEventType] = useState<EmergencyEventType>('CODE_BLUE');
  const [declareLeaderId, setDeclareLeaderId] = useState<string>(DEFAULT_EMERGENCY_STAFF_UUID);

  // Form states for Conclude Resuscitation Modal
  const [concludeRosc, setConcludeRosc] = useState<boolean>(true);
  const [concludeDebrief, setConcludeDebrief] = useState<string>(
    'ROSC achieved after 2 cycles of CPR and 1mg Epinephrine IV. Sinus rhythm restored with palpable carotid pulse.'
  );

  // Initial Fetch & polling
  useEffect(() => {
    dispatch(fetchEmergencyEventsThunk(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      dispatch(fetchEmergencyEventsThunk(undefined));
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh, dispatch]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI Metrics Calculation
  const totalEvents = events.length;
  const activeCount = activeEvents.length;
  const concludedEvents = events.filter((e) => e.status === 'CONCLUDED');
  const roscCount = concludedEvents.filter((e) => e.rosc_achieved === true).length;
  const roscSuccessRate =
    concludedEvents.length > 0
      ? Math.round((roscCount / concludedEvents.length) * 100)
      : 100;

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Status filter
      if (filterStatus !== 'ALL' && evt.status !== filterStatus) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesId = evt.id.toLowerCase().includes(q);
        const matchesType = evt.event_type.toLowerCase().includes(q);
        const matchesPatient = evt.patient_id.toLowerCase().includes(q);
        const matchesBed = evt.bed_id.toLowerCase().includes(q);
        const matchesIcu = evt.icu_id.toLowerCase().includes(q);
        const matchesDebrief = (evt.debrief_summary || '').toLowerCase().includes(q);
        if (
          !matchesId &&
          !matchesType &&
          !matchesPatient &&
          !matchesBed &&
          !matchesIcu &&
          !matchesDebrief
        ) {
          return false;
        }
      }
      return true;
    });
  }, [events, filterStatus, searchQuery]);

  // Handle Declare Submit
  const handleDeclareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      declareEmergencyThunk({
        icu_id: declareIcuId,
        bed_id: declareBedId,
        patient_id: declarePatientId,
        event_type: declareEventType,
        resuscitation_leader_id: declareLeaderId || null,
      })
    );
  };

  // Handle Conclude Submit
  const handleConcludeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventToConclude) return;
    await dispatch(
      concludeEmergencyThunk({
        eventId: eventToConclude.id,
        payload: {
          rosc_achieved: concludeRosc,
          debrief_summary: concludeDebrief.trim() || null,
        },
      })
    );
  };

  // Helper formatting labels
  const formatEventType = (type: string) => {
    return type.replace(/_/g, ' ');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 space-y-6">
      {/* Top Banner / Alert Bar if Code Blue is Active */}
      {activeCount > 0 && (
        <div className="bg-gradient-to-r from-rose-900/90 via-red-900/80 to-rose-950/90 border border-rose-500/60 rounded-xl p-4 shadow-xl shadow-rose-950/50 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/50">
              <Siren className="w-6 h-6 text-rose-400 animate-bounce" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                  STAT EMERGENCY ACTIVE
                </span>
                <span className="text-sm font-black text-rose-200">
                  {activeCount} Bedside Resuscitation{activeCount > 1 ? 's' : ''} in Progress
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Crash cart, CPR team, and airway management mobilized. Live telemetry link engaged.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {activeEvents.map((actEvt) => (
              <button
                key={actEvt.id}
                onClick={() => dispatch(openConcludeModal(actEvt))}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-rose-900 hover:bg-rose-100 transition-colors shadow flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-700" />
                <span>Conclude #{actEvt.id.slice(-6).toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Emergency Events & Code Blue
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  CRITICAL CARE PROTOCOL
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Bedside Code Blue Activation, ROSC Outcome Governance, Multidisciplinary Debrief & Immutable Resuscitation Registry
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              autoRefresh
                ? 'bg-teal-500/10 text-teal-300 border-teal-500/30 hover:bg-teal-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title="Auto-refresh status every 6 seconds"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Polling Active' : 'Polling Paused'}</span>
            {lastPollTime && (
              <span className="text-[10px] font-mono text-slate-400 ml-1">({lastPollTime})</span>
            )}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => dispatch(fetchEmergencyEventsThunk(undefined))}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh events now"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Declare Emergency Button */}
          <button
            onClick={() => dispatch(openDeclareModal())}
            className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-950/60 border border-rose-400/40 flex items-center gap-2 transform active:scale-95"
          >
            <Zap className="w-4 h-4" />
            <span>DECLARE CODE BLUE / STAT</span>
          </button>
        </div>
      </div>

      {/* Alert / Notification Feedback */}
      {error && (
        <div className="bg-rose-950/50 border border-rose-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearMessages())}
            className="text-rose-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearMessages())}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Code Blue */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            activeCount > 0
              ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/40'
              : 'bg-slate-800/60 border-slate-700/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              ACTIVE RESUSCITATIONS
            </span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                activeCount > 0
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-slate-700/50 text-slate-400'
              }`}
            >
              <Siren className={`w-4 h-4 ${activeCount > 0 ? 'animate-bounce' : ''}`} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-black font-mono ${
                activeCount > 0 ? 'text-rose-400' : 'text-slate-200'
              }`}
            >
              {activeCount}
            </span>
            <span className="text-[11px] text-slate-400">
              {activeCount > 0 ? 'Immediate bedside arrest' : 'All ICUs clear'}
            </span>
          </div>
        </div>

        {/* Card 2: Total Events */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              TOTAL EMERGENCY EVENTS
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">{totalEvents}</span>
            <span className="text-[11px] text-slate-400">Logged in audit registry</span>
          </div>
        </div>

        {/* Card 3: ROSC Success Rate */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              ROSC OUTCOME RATE
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {roscSuccessRate}%
            </span>
            <span className="text-[11px] text-slate-400">
              {roscCount} of {concludedEvents.length} achieved spontaneous circulation
            </span>
          </div>
        </div>

        {/* Card 4: Protocol Readiness */}
        <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              RESUSCITATION TRIAGE
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-400">ACL / BLS</span>
            <span className="text-[11px] text-slate-400">Defibrillator & airway synced</span>
          </div>
        </div>
      </div>

      {/* Active Resuscitations Section (Top Priority View) */}
      {activeEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              Active Code Blue Resuscitations ({activeEvents.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-800/80 border-2 border-rose-500/60 rounded-xl p-4 shadow-xl shadow-rose-950/30 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white shadow-xs">
                        {formatEventType(evt.event_type)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        #{evt.id.slice(-8).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-xs text-slate-300 font-bold flex items-center gap-1 font-mono">
                        <Layers className="w-3.5 h-3.5 text-teal-400" />
                        ICU: {evt.icu_id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-300 font-bold flex items-center gap-1 font-mono">
                        <Bed className="w-3.5 h-3.5 text-emerald-400" />
                        Bed: {evt.bed_id.slice(-6).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <ResuscitationElapsedTimer declaredAt={evt.declared_at} />
                </div>

                <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-700/60 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Patient Identifier:</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {evt.patient_id.slice(0, 8)}...{evt.patient_id.slice(-6)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Declared By:</span>
                    <span className="font-mono text-slate-200">
                      {evt.declared_by_id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Resuscitation Lead:</span>
                    <span className="font-mono text-amber-300 font-bold">
                      {evt.resuscitation_leader_id
                        ? evt.resuscitation_leader_id.slice(-6).toUpperCase()
                        : 'Not Assigned'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-700/50">
                  <button
                    onClick={() => dispatch(openDetailsDrawer(evt))}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 transition-colors"
                  >
                    View Dossier
                  </button>
                  <button
                    onClick={() => dispatch(openConcludeModal(evt))}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Conclude & Log ROSC</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resuscitation Registry & Clinical Debrief History */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-700/60 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-800/70">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {(['ALL', 'ACTIVE', 'CONCLUDED', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => dispatch(setStatusFilter(st))}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
                }`}
              >
                {st}
                {st === 'ACTIVE' && activeCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white">
                    {activeCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              placeholder="Search by ID, Bed, Patient, Debrief..."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
            {searchQuery && (
              <button
                onClick={() => dispatch(setSearchQuery(''))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Emergency Registry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-700/60">
              <tr>
                <th className="py-3 px-4">Event & Type</th>
                <th className="py-3 px-4">Status & ROSC</th>
                <th className="py-3 px-4">ICU & Bed Location</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Timestamps</th>
                <th className="py-3 px-4">Debrief Narrative</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Siren className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                    <p className="font-medium text-slate-400">No emergency events found</p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Declare an emergency resuscitation or adjust filter criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => {
                  const isAct = evt.status === 'ACTIVE';
                  const isRosc = evt.rosc_achieved === true;
                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isAct ? 'bg-rose-950/20' : ''
                      }`}
                    >
                      {/* 1. Event & Type */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                              evt.event_type === 'CODE_BLUE'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : evt.event_type === 'CARDIAC_ARREST'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}
                          >
                            {formatEventType(evt.event_type)}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                          <span>{evt.id.slice(0, 8)}...</span>
                          <button
                            onClick={() => handleCopy(evt.id)}
                            className="text-slate-500 hover:text-slate-300"
                            title="Copy UUID"
                          >
                            {copiedId === evt.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 2. Status & ROSC */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 font-mono ${
                              isAct
                                ? 'bg-rose-500 text-white animate-pulse'
                                : evt.status === 'CONCLUDED'
                                ? 'bg-slate-700 text-slate-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {isAct && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                            {evt.status}
                          </span>
                          {evt.status === 'CONCLUDED' && (
                            <div className="text-[11px] font-bold">
                              {isRosc ? (
                                <span className="text-emerald-400 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  ROSC Achieved
                                </span>
                              ) : (
                                <span className="text-slate-400">ROSC Not Achieved</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 3. ICU & Bed Location */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-200">
                          ICU: {evt.icu_id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-[11px] text-teal-400 flex items-center gap-1 mt-0.5">
                          <Bed className="w-3 h-3" />
                          <span>Bed: {evt.bed_id.slice(-6).toUpperCase()}</span>
                        </div>
                      </td>

                      {/* 4. Patient ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <span className="text-slate-300 font-bold">
                          {evt.patient_id.slice(0, 8)}...{evt.patient_id.slice(-4)}
                        </span>
                      </td>

                      {/* 5. Timestamps */}
                      <td className="py-3.5 px-4 text-[11px] font-mono text-slate-400">
                        <div>
                          Declared:{' '}
                          <span className="text-slate-200">
                            {new Date(evt.declared_at).toLocaleTimeString()}
                          </span>
                        </div>
                        {evt.concluded_at && (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Concluded: {new Date(evt.concluded_at).toLocaleTimeString()}
                          </div>
                        )}
                      </td>

                      {/* 6. Debrief Narrative */}
                      <td className="py-3.5 px-4 max-w-xs truncate text-[11px] text-slate-300">
                        {evt.debrief_summary || (
                          <span className="text-slate-500 italic">No debrief narrative recorded</span>
                        )}
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isAct && (
                            <button
                              onClick={() => dispatch(openConcludeModal(evt))}
                              className="px-2.5 py-1 rounded text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
                            >
                              Conclude
                            </button>
                          )}
                          <button
                            onClick={() => dispatch(openDetailsDrawer(evt))}
                            className="px-2.5 py-1 rounded text-[11px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                          >
                            Dossier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. DECLARE EMERGENCY CODE BLUE MODAL                     */}
      {/* ======================================================== */}
      {isDeclareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl shadow-rose-950/60 text-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Siren className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Declare Emergency Resuscitation
                  </h3>
                  <p className="text-[11px] font-mono text-rose-400 uppercase tracking-wider">
                    CODE BLUE ACTIVATION PROTOCOL
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeDeclareModal())}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Activating will mobilize the emergency cardiac arrest response team and sound telemetry alarm triggers for the selected bed.
              </p>
            </div>

            <form onSubmit={handleDeclareSubmit} className="space-y-4">
              {/* Event Type */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Emergency Event Type *
                </label>
                <select
                  value={declareEventType}
                  onChange={(e) => setDeclareEventType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="CODE_BLUE">CODE BLUE (Cardiac / Respiratory Arrest)</option>
                  <option value="CARDIAC_ARREST">CARDIAC ARREST (VF / VT / Asystole)</option>
                  <option value="RESPIRATORY_ARREST">RESPIRATORY ARREST (Apnea / Hypoxia)</option>
                  <option value="INTUBATION_CRISIS">INTUBATION CRISIS (Difficult Airway)</option>
                  <option value="MASSIVE_HEMORRHAGE">MASSIVE HEMORRHAGE (MTP Activation)</option>
                </select>
              </div>

              {/* ICU Ward Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  ICU Unit UUID *
                </label>
                <input
                  type="text"
                  required
                  value={declareIcuId}
                  onChange={(e) => setDeclareIcuId(e.target.value)}
                  placeholder="e.g. 4d97e6e2-e4a4-41f0-95b2-428f7e80de88"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Bed Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Bed UUID *
                </label>
                <input
                  type="text"
                  required
                  value={declareBedId}
                  onChange={(e) => setDeclareBedId(e.target.value)}
                  placeholder="e.g. ee9485f5-efc6-443c-b869-03c71f0de2e2"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Patient Selection */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Patient UUID *
                </label>
                <input
                  type="text"
                  required
                  value={declarePatientId}
                  onChange={(e) => setDeclarePatientId(e.target.value)}
                  placeholder="e.g. 98c47607-b60f-4f7d-8786-fc3f34a6b3a8"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Resuscitation Leader */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-1.5">
                  Resuscitation Leader UUID (Optional)
                </label>
                <input
                  type="text"
                  value={declareLeaderId}
                  onChange={(e) => setDeclareLeaderId(e.target.value)}
                  placeholder="e.g. b503be05-e5e5-43c0-b853-4cf88a014423"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => dispatch(closeDeclareModal())}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg shadow-rose-950/50 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Siren className="w-4 h-4" />
                  <span>{isSubmitting ? 'ACTIVATING...' : 'CONFIRM & ACTIVATE CODE BLUE'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CONCLUDE RESUSCITATION & DEBRIEF MODAL                */}
      {/* ======================================================== */}
      {isConcludeModalOpen && eventToConclude && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Conclude Resuscitation & Record ROSC
                  </h3>
                  <p className="text-[11px] font-mono text-teal-400 uppercase tracking-wider">
                    EVENT #{eventToConclude.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeConcludeModal())}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Context Summary */}
            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 text-xs font-mono space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>ICU / Bed:</span>
                <span className="text-white font-bold">
                  {eventToConclude.icu_id.slice(-6).toUpperCase()} / Bed {eventToConclude.bed_id.slice(-6).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Declared At:</span>
                <span className="text-slate-200">
                  {new Date(eventToConclude.declared_at).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <form onSubmit={handleConcludeSubmit} className="space-y-4">
              {/* ROSC Outcome Toggle */}
              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                  ROSC Outcome (Return of Spontaneous Circulation) *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setConcludeRosc(true)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      concludeRosc
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-black text-white">ROSC ACHIEVED</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      Patient achieved spontaneous pulse and viable hemodynamics.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setConcludeRosc(false)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      !concludeRosc
                        ? 'bg-slate-800 border-rose-500/80 text-rose-300 shadow-md'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <X className="w-4 h-4 text-rose-400" />
                      <span className="font-black text-white">ROSC NOT ACHIEVED</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      Resuscitation ceased after ACLS protocol exhaustion.
                    </span>
                  </button>
                </div>
              </div>

              {/* Debrief Summary Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-300 uppercase">
                    Multidisciplinary Debrief Narrative
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">CLINICAL AUDIT</span>
                </div>
                <textarea
                  rows={4}
                  value={concludeDebrief}
                  onChange={(e) => setConcludeDebrief(e.target.value)}
                  placeholder="Detail CPR cycles, epinephrine / amiodarone doses, defibrillation joules, and post-ROSC targeted temperature management..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 leading-relaxed font-sans"
                />
              </div>

              {/* Quick Narrative Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] text-slate-500 font-mono">PRESETS:</span>
                <button
                  type="button"
                  onClick={() =>
                    setConcludeDebrief(
                      'ROSC achieved after 2 cycles of CPR and 1mg Epinephrine IV. Sinus rhythm restored with palpable carotid pulse.'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700"
                >
                  2 Cycles + Epi 1mg
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConcludeDebrief(
                      'VF rhythm successfully defibrillated with 200J biphasic shock. Normal sinus rhythm restored, MAP > 65 achieved with noradrenaline infusion.'
                    )
                  }
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700"
                >
                  VF Shock 200J
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => dispatch(closeConcludeModal())}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-500 text-white transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'SAVING...' : 'CONCLUDE RESUSCITATION'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. EVENT DOSSIER DETAILS DRAWER / MODAL                  */}
      {/* ======================================================== */}
      {isDetailsDrawerOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Emergency Event Dossier</h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    ID: {selectedEvent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(closeDetailsDrawer())}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Event Type</span>
                <span className="font-bold text-rose-300">
                  {formatEventType(selectedEvent.event_type)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Current Status</span>
                <span
                  className={`font-black ${
                    selectedEvent.status === 'ACTIVE' ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedEvent.status}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Hospital UUID</span>
                <span className="text-slate-300 truncate block">{selectedEvent.hospital_id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">ICU Ward UUID</span>
                <span className="text-slate-300 truncate block">{selectedEvent.icu_id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Bed UUID</span>
                <span className="text-slate-300 truncate block">{selectedEvent.bed_id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Patient UUID</span>
                <span className="text-slate-300 truncate block">{selectedEvent.patient_id}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Declared At</span>
                <span className="text-slate-200">
                  {new Date(selectedEvent.declared_at).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 block uppercase">Concluded At</span>
                <span className="text-slate-200">
                  {selectedEvent.concluded_at
                    ? new Date(selectedEvent.concluded_at).toLocaleString()
                    : 'Still Active'}
                </span>
              </div>
            </div>

            {/* ROSC Outcome */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  ROSC (Return of Spontaneous Circulation)
                </span>
                <span
                  className={`font-black font-mono text-xs ${
                    selectedEvent.rosc_achieved === true
                      ? 'text-emerald-400'
                      : selectedEvent.rosc_achieved === false
                      ? 'text-slate-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedEvent.rosc_achieved === true
                    ? 'ACHIEVED'
                    : selectedEvent.rosc_achieved === false
                    ? 'NOT ACHIEVED'
                    : 'IN PROGRESS'}
                </span>
              </div>
              <div className="text-slate-300 text-xs leading-relaxed mt-2 pt-2 border-t border-slate-800">
                <strong className="text-slate-400 block text-[10px] uppercase font-mono mb-1">
                  Debrief Narrative:
                </strong>
                {selectedEvent.debrief_summary || (
                  <span className="italic text-slate-500">No debrief narrative recorded.</span>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="flex items-center justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => dispatch(closeDetailsDrawer())}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyCodeBluePage;
