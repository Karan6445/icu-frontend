import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  History,
  Stethoscope,
  HeartPulse,
  Lock,
  FileEdit,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  ChevronLeft,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  Activity,
  Layers,
  Database,
  ShieldCheck,
  AlertTriangle,
  Clock,
  X,
  Copy,
  Check,
  Globe,
  Tag,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addDoctorRemark, addNurseRemark, fetchPatientsThunk } from '../store/slices/patientSlice';
import {
  fetchPatientTimelineThunk,
  appendTimelineMilestoneThunk,
  fetchPatientClinicalHistoryThunk,
  fetchPatientAccessHistoryThunk,
  setActiveSubTab,
  setSelectedPatientId,
  setTimelineFilters,
  resetTimelineFilters,
  setTimelinePage,
  setAccessPage,
  setIsMilestoneModalOpen,
  setSelectedTimelineEvent,
  setSelectedAccessHistoryItem,
  PatientTimelineSubTab,
} from '../store/slices/patientTimelineSlice';
import { PatientTimelineEvent, PatientAccessHistoryItem } from '../api/patientTimelineApi';

export const PatientTimelinePage: React.FC = () => {
  const { patientId: routePatientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { patients } = useAppSelector((state) => state.patient);
  const { activeRole, currentUser } = useAppSelector((state) => state.auth);

  const {
    activeSubTab,
    selectedPatientId,
    timelineEvents,
    timelineTotal,
    timelinePage,
    timelinePageSize,
    timelineFilters,
    isTimelineLoading,
    clinicalHistory,
    isHistoryLoading,
    accessHistory,
    accessTotal,
    accessPage,
    accessPageSize,
    isAccessLoading,
    isSubmittingMilestone,
    isMilestoneModalOpen,
    selectedTimelineEvent,
    selectedAccessHistoryItem,
    error: timelineError,
    successMessage,
    lastSyncedTime,
  } = useAppSelector((state) => state.patientTimeline);

  // Selected Patient resolution
  const activePatientId = routePatientId || selectedPatientId || patients[0]?.id || '494baa9d-c2ab-4657-aef5-b7f5c57e60f6';
  const patient = patients.find((p) => p.id === activePatientId) || patients[0] || {
    id: activePatientId,
    name: 'Aarav Patel',
    mrn: 'MRN-ICU-88210',
    unitName: 'Medical ICU (MICU)',
    bedNumber: '04',
    status: 'CRITICAL',
    assignedClinician: 'Dr. Alexander Mehta',
    assignedNurse: 'Sunita Rao, RN',
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Milestone Form States (POST /api/v1/patients/{patient_id}/timeline)
  const [formEventType, setFormEventType] = useState('CLINICAL_OBSERVATION');
  const [formCategory, setFormCategory] = useState('CLINICAL');
  const [formSeverity, setFormSeverity] = useState('INFO');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAdmissionId, setFormAdmissionId] = useState('a1d63183-f727-4a4c-a8d8-a12db1454282');
  const [formMetadataKey, setFormMetadataKey] = useState('');
  const [formMetadataVal, setFormMetadataVal] = useState('');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Doctor & Nurse checkup modal states (unified remarks)
  const [showDoctorCheckupForm, setShowDoctorCheckupForm] = useState(false);
  const [showNurseCheckupForm, setShowNurseCheckupForm] = useState(false);
  const [docCategory, setDocCategory] = useState('Ventilator / Respiratory Plan');
  const [docPriority, setDocPriority] = useState('HIGH');
  const [docContent, setDocContent] = useState('');
  const [nurseCategory, setNurseCategory] = useState('Nursing Assessment & Vitals');
  const [nursePriority, setNursePriority] = useState('ROUTINE');
  const [nurseContent, setNurseContent] = useState('');

  // 1. Initial Load: Fetch Patients list from server
  useEffect(() => {
    dispatch(fetchPatientsThunk({}));
  }, [dispatch]);

  // 2. Synchronize Timeline APIs when Patient ID changes
  useEffect(() => {
    if (activePatientId) {
      dispatch(setSelectedPatientId(activePatientId));
      dispatch(
        fetchPatientTimelineThunk({
          patientId: activePatientId,
          params: { page: timelinePage, page_size: timelinePageSize },
        })
      );
      dispatch(fetchPatientClinicalHistoryThunk(activePatientId));
      dispatch(
        fetchPatientAccessHistoryThunk({
          patientId: activePatientId,
          params: { page: accessPage, page_size: accessPageSize },
        })
      );
    }
  }, [dispatch, activePatientId]);

  // 2. Fetch Timeline on filter changes
  useEffect(() => {
    if (activeSubTab === 'TIMELINE' && activePatientId) {
      const params: any = { page: timelinePage, page_size: timelinePageSize };
      if (timelineFilters.category && timelineFilters.category !== 'ALL') params.category = timelineFilters.category;
      if (timelineFilters.severity && timelineFilters.severity !== 'ALL') params.severity = timelineFilters.severity;
      if (timelineFilters.event_type && timelineFilters.event_type !== 'ALL') params.event_type = timelineFilters.event_type;
      if (timelineFilters.admission_id) params.admission_id = timelineFilters.admission_id;
      if (timelineFilters.start_time) params.start_time = timelineFilters.start_time;
      if (timelineFilters.end_time) params.end_time = timelineFilters.end_time;
      dispatch(fetchPatientTimelineThunk({ patientId: activePatientId, params }));
    }
  }, [
    dispatch,
    activeSubTab,
    activePatientId,
    timelinePage,
    timelinePageSize,
    timelineFilters.category,
    timelineFilters.severity,
    timelineFilters.event_type,
    timelineFilters.admission_id,
    timelineFilters.start_time,
    timelineFilters.end_time,
  ]);

  // 3. Fetch Access History on pagination
  useEffect(() => {
    if (activeSubTab === 'ACCESS_HISTORY' && activePatientId) {
      dispatch(
        fetchPatientAccessHistoryThunk({
          patientId: activePatientId,
          params: { page: accessPage, page_size: accessPageSize },
        })
      );
    }
  }, [dispatch, activeSubTab, activePatientId, accessPage, accessPageSize]);

  // Refresh Active Data
  const handleRefreshActive = () => {
    if (activeSubTab === 'TIMELINE') {
      dispatch(
        fetchPatientTimelineThunk({
          patientId: activePatientId,
          params: { page: timelinePage, page_size: timelinePageSize },
        })
      );
    } else if (activeSubTab === 'CLINICAL_HISTORY') {
      dispatch(fetchPatientClinicalHistoryThunk(activePatientId));
    } else if (activeSubTab === 'ACCESS_HISTORY') {
      dispatch(
        fetchPatientAccessHistoryThunk({
          patientId: activePatientId,
          params: { page: accessPage, page_size: accessPageSize },
        })
      );
    }
  };

  // Copy helper
  const handleCopy = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Submit Milestone (POST /api/v1/patients/{patient_id}/timeline)
  const handleCreateMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormValidationError('Please provide a milestone title.');
      return;
    }
    if (!formDescription.trim()) {
      setFormValidationError('Please provide a milestone description.');
      return;
    }

    setFormValidationError(null);
    const meta: Record<string, any> = {};
    if (formMetadataKey.trim() && formMetadataVal.trim()) {
      meta[formMetadataKey.trim()] = formMetadataVal.trim();
    }

    const res = await dispatch(
      appendTimelineMilestoneThunk({
        patientId: activePatientId,
        data: {
          event_type: formEventType,
          category: formCategory,
          severity: formSeverity,
          title: formTitle.trim(),
          description: formDescription.trim(),
          admission_id: formAdmissionId.trim() || undefined,
          metadata_payload: meta,
          event_time: new Date().toISOString(),
        },
      })
    );

    if (appendTimelineMilestoneThunk.fulfilled.match(res)) {
      setFormTitle('');
      setFormDescription('');
      setFormMetadataKey('');
      setFormMetadataVal('');
      dispatch(setIsMilestoneModalOpen(false));
      dispatch(fetchPatientClinicalHistoryThunk(activePatientId));
    }
  };

  // Submit Doctor Checkup Remark
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docContent.trim()) return;
    dispatch(
      addDoctorRemark({
        patientId: patient.id,
        doctorName: currentUser.name || 'Dr. Ananya Roy',
        category: docCategory,
        priority: docPriority,
        content: docContent.trim(),
      })
    );
    await dispatch(
      appendTimelineMilestoneThunk({
        patientId: activePatientId,
        data: {
          event_type: 'CLINICAL_OBSERVATION',
          category: 'CLINICAL',
          severity: docPriority === 'CRITICAL' ? 'CRITICAL' : docPriority === 'HIGH' ? 'HIGH' : 'INFO',
          title: `Physician Note: ${docCategory}`,
          description: docContent.trim(),
          event_time: new Date().toISOString(),
        },
      })
    );
    setDocContent('');
    setShowDoctorCheckupForm(false);
  };

  // Submit Nurse Checkup Remark
  const handleNurseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseContent.trim()) return;
    dispatch(
      addNurseRemark({
        patientId: patient.id,
        nurseName: currentUser.name || 'Nurse Priya Sharma',
        category: nurseCategory,
        priority: nursePriority,
        content: nurseContent.trim(),
      })
    );
    await dispatch(
      appendTimelineMilestoneThunk({
        patientId: activePatientId,
        data: {
          event_type: 'CLINICAL_OBSERVATION',
          category: 'NURSING',
          severity: nursePriority === 'CRITICAL' ? 'CRITICAL' : nursePriority === 'HIGH' ? 'HIGH' : 'INFO',
          title: `Nursing Assessment: ${nurseCategory}`,
          description: nurseContent.trim(),
          event_time: new Date().toISOString(),
        },
      })
    );
    setNurseContent('');
    setShowNurseCheckupForm(false);
  };

  // Filtered Timeline Events
  const filteredTimelineEvents = timelineEvents.filter((ev) => {
    const q = timelineFilters.search.toLowerCase().trim();
    if (!q) return true;
    return (
      ev.title.toLowerCase().includes(q) ||
      ev.description.toLowerCase().includes(q) ||
      ev.event_type.toLowerCase().includes(q) ||
      ev.category.toLowerCase().includes(q) ||
      ev.severity.toLowerCase().includes(q) ||
      (ev.actor_name && ev.actor_name.toLowerCase().includes(q))
    );
  });

  // Severity style helper
  const getSeverityBadge = (severity: string) => {
    const s = severity.toUpperCase();
    if (s === 'CRITICAL') {
      return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
    if (s === 'HIGH') {
      return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-800';
    }
    if (s === 'MEDIUM') {
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
    return 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* ================= TOP HEADER & PATIENT SELECTION ================= */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title="Back to Patients"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-teal-100 dark:bg-teal-500/20 text-[#0F766E] dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-300 dark:border-teal-500/30">
                PATIENT TIMELINE & CLINICAL HISTORY API
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                RFC 4122 UUID Verified
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Patient Clinical Timeline & Historical Foundation
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chronological milestones, foundation stats, and electronic chart access telemetry.
            </p>
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 font-mono">Patient:</label>
          <select
            value={activePatientId}
            onChange={(e) => {
              dispatch(setSelectedPatientId(e.target.value));
              navigate(`/patient/${e.target.value}/timeline`);
            }}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 font-sans shadow-xs max-w-xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.bedNumber ? `Bed ${p.bedNumber}` : 'Patient'} • {p.status})
              </option>
            ))}
          </select>

          <button
            onClick={handleRefreshActive}
            disabled={isTimelineLoading || isHistoryLoading || isAccessLoading}
            className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition text-slate-700 dark:text-slate-200"
            title="Refresh Timeline APIs"
          >
            <RefreshCw
              className={`w-4 h-4 ${isTimelineLoading || isHistoryLoading || isAccessLoading ? 'animate-spin text-teal-600' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* ================= PATIENT SUMMARY BANNER ================= */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 rounded-3xl text-white border border-teal-500/30 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-md">
            {patient.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/40 font-mono text-xs font-bold">
                Bed {patient.bedNumber}
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 font-mono text-[10px] font-bold">
                {patient.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 font-mono mt-1">
              <span>MRN: {patient.mrn}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span>UUID: {activePatientId}</span>
                <button
                  onClick={() => handleCopy(activePatientId)}
                  className="text-teal-400 hover:text-teal-300"
                  title="Copy UUID"
                >
                  {copiedId === activePatientId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              <span>•</span>
              <span>Attending: {patient.assignedClinician}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => dispatch(setIsMilestoneModalOpen(true))}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Append Clinical Milestone (POST)</span>
          </button>

          <button
            onClick={() => {
              setShowDoctorCheckupForm(true);
              setShowNurseCheckupForm(false);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-2"
          >
            <Stethoscope className="w-4 h-4 text-teal-400" />
            <span>Doctor Remark</span>
          </button>

          <button
            onClick={() => {
              setShowNurseCheckupForm(true);
              setShowDoctorCheckupForm(false);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition flex items-center gap-2"
          >
            <HeartPulse className="w-4 h-4 text-emerald-400" />
            <span>Nurse Remark</span>
          </button>
        </div>
      </div>

      {/* ================= CLINICAL FOUNDATION KPI CARDS (GET /api/v1/patients/{id}/clinical-history) ================= */}
      {clinicalHistory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Admissions</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {clinicalHistory.total_admissions}
              </span>
              <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold">Foundation</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">ICU Ward Transfers</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {clinicalHistory.total_transfers}
              </span>
              <span className="text-[11px] font-mono text-blue-700 dark:text-blue-400 font-bold">Transfer Log</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Care Team Members</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {clinicalHistory.active_care_team_count}
              </span>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">Active MDT</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Timeline Milestones</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-teal-700 dark:text-teal-400">
                {timelineTotal}
              </span>
              <span className="text-[11px] font-mono text-purple-700 dark:text-purple-400 font-bold">Chronological</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TABS NAVIGATION ================= */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => dispatch(setActiveSubTab('TIMELINE'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'TIMELINE'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>1. Chronological Timeline ({timelineTotal})</span>
        </button>

        <button
          onClick={() => dispatch(setActiveSubTab('CLINICAL_HISTORY'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'CLINICAL_HISTORY'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>2. Clinical History Foundation</span>
        </button>

        <button
          onClick={() => dispatch(setActiveSubTab('ACCESS_HISTORY'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 ${
            activeSubTab === 'ACCESS_HISTORY'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>3. Patient Access History ({accessTotal})</span>
        </button>
      </div>

      {/* ================= TAB 1: CHRONOLOGICAL TIMELINE ================= */}
      {activeSubTab === 'TIMELINE' && (
        <div className="space-y-4">
          {/* Timeline Filter Bar */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search events, descriptions, actors..."
                value={timelineFilters.search}
                onChange={(e) => dispatch(setTimelineFilters({ search: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <select
                value={timelineFilters.category}
                onChange={(e) => dispatch(setTimelineFilters({ category: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="CLINICAL">Clinical</option>
                <option value="PROCEDURE">Procedure</option>
                <option value="VENTILATOR">Ventilator</option>
                <option value="MEDICATION">Medication</option>
                <option value="LABORATORY">Laboratory</option>
                <option value="NURSING">Nursing</option>
              </select>
            </div>

            <div>
              <select
                value={timelineFilters.severity}
                onChange={(e) => dispatch(setTimelineFilters({ severity: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="INFO">Info / Normal</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(resetTimelineFilters())}
                className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Timeline Milestones Cards */}
          <div className="space-y-3">
            {filteredTimelineEvents.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-500">
                No chronological milestones found for current filter criteria.
              </div>
            ) : (
              filteredTimelineEvents.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => dispatch(setSelectedTimelineEvent(ev))}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-xs hover:border-teal-500 transition-all cursor-pointer space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadge(ev.severity)}`}>
                        {ev.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold">
                        {ev.category}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        {ev.event_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{new Date(ev.event_time).toLocaleString()}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Recorded by: {ev.actor_name || 'Clinician'} ({ev.actor_role || 'DOCTOR'})
                      </span>
                    </div>

                    {ev.metadata_payload && Object.keys(ev.metadata_payload).length > 0 && (
                      <span className="text-[11px] text-teal-700 dark:text-teal-400 font-mono font-semibold">
                        ✦ {Object.keys(ev.metadata_payload).length} Parameters Attached
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: CLINICAL HISTORY FOUNDATION ================= */}
      {activeSubTab === 'CLINICAL_HISTORY' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-600" />
                  Clinical History Summary & Foundation Metrics
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated historical records for patient {patient.name} ({activePatientId})
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl font-bold border border-teal-200 dark:border-teal-800">
                GET /api/v1/patients/{'{id}'}/clinical-history
              </span>
            </div>

            {clinicalHistory && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">PATIENT ID:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{clinicalHistory.patient_id}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">HOSPITAL ID:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{clinicalHistory.hospital_id}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-400 block mb-1">RECORDED MILESTONES:</span>
                    <span className="text-teal-700 dark:text-teal-400 font-bold">{clinicalHistory.total_timeline_events} Events</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
                    Recent Verified Clinical Milestones
                  </h4>
                  <div className="space-y-2.5">
                    {clinicalHistory.recent_events.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{ev.title}</span>
                          <span className="text-slate-500 text-[11px]">{ev.description}</span>
                        </div>
                        <span className="font-mono text-slate-400 text-[11px] shrink-0 ml-4">
                          {new Date(ev.event_time).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: PATIENT ACCESS HISTORY & FORENSIC LOG ================= */}
      {activeSubTab === 'ACCESS_HISTORY' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5">Accessed At & IP</th>
                  <th className="py-4 px-5">Clinician User UUID</th>
                  <th className="py-4 px-5">Action & Status</th>
                  <th className="py-4 px-5">Sensitivity & Reason</th>
                  <th className="py-4 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {accessHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      No electronic chart access records logged for this patient yet.
                    </td>
                  </tr>
                ) : (
                  accessHistory.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => dispatch(setSelectedAccessHistoryItem(log))}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-5">
                        <span className="font-mono text-slate-900 dark:text-white font-bold block">
                          {new Date(log.accessed_at).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">IP: {log.ip_address}</span>
                      </td>

                      <td className="py-4 px-5 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span>{log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}</span>
                          {log.user_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(log.user_id!);
                              }}
                              className="text-slate-400 hover:text-teal-600"
                            >
                              {copiedId === log.user_id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-900 dark:text-white block font-mono">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-block mt-0.5">
                          {log.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 max-w-sm">
                        <div className="flex items-center gap-2 mb-0.5">
                          {log.is_sensitive ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              RESTRICTED CHART 🔒
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              STANDARD
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-xs truncate">
                          {log.access_reason || 'Clinical observation protocol'}
                        </p>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedAccessHistoryItem(log));
                          }}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: APPEND TIMELINE MILESTONE (POST) ================= */}
      {isMilestoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Append Timeline Milestone / Observation
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    POST /api/v1/patients/{'{id}'}/timeline
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setIsMilestoneModalOpen(false))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formValidationError && (
              <div className="p-3 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formValidationError}</span>
              </div>
            )}

            <form onSubmit={handleCreateMilestoneSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Arterial line inserted in left radial artery"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Type *
                  </label>
                  <select
                    value={formEventType}
                    onChange={(e) => setFormEventType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="CLINICAL_OBSERVATION">Clinical Observation</option>
                    <option value="PROCEDURE_PERFORMED">Procedure Performed</option>
                    <option value="MEDICATION_ADMINISTERED">Medication Administered</option>
                    <option value="VENTILATOR_ADJUSTMENT">Ventilator Adjustment</option>
                    <option value="LAB_RESULT_RECEIVED">Lab Result Received</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="CLINICAL">Clinical</option>
                    <option value="PROCEDURE">Procedure</option>
                    <option value="VENTILATOR">Ventilator</option>
                    <option value="MEDICATION">Medication</option>
                    <option value="LABORATORY">Laboratory</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Severity *
                  </label>
                  <select
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="INFO">Info / Normal</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description & Clinical Observations *
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder="e.g. Procedure tolerated well. Transducer zeroed and calibrated."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Optional Metadata Key
                  </label>
                  <input
                    type="text"
                    value={formMetadataKey}
                    onChange={(e) => setFormMetadataKey(e.target.value)}
                    placeholder="e.g. transducer_zero"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Metadata Value
                  </label>
                  <input
                    type="text"
                    value={formMetadataVal}
                    onChange={(e) => setFormMetadataVal(e.target.value)}
                    placeholder="e.g. calibrated"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch(setIsMilestoneModalOpen(false))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMilestone}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingMilestone ? 'Recording...' : 'Append Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSPECT MILESTONE DETAILS ================= */}
      {selectedTimelineEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadge(selectedTimelineEvent.severity)}`}>
                  {selectedTimelineEvent.severity}
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedTimelineEvent.title}
                </h3>
              </div>
              <button
                onClick={() => dispatch(setSelectedTimelineEvent(null))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                {selectedTimelineEvent.description}
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block">CATEGORY:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTimelineEvent.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">EVENT TYPE:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTimelineEvent.event_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ACTOR:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedTimelineEvent.actor_name || 'Clinician'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">TIMESTAMP:</span>
                  <span className="text-slate-900 dark:text-white">{new Date(selectedTimelineEvent.event_time).toLocaleString()}</span>
                </div>
              </div>

              {selectedTimelineEvent.metadata_payload && Object.keys(selectedTimelineEvent.metadata_payload).length > 0 && (
                <div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Attached Metadata:</span>
                  <pre className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-[11px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedTimelineEvent.metadata_payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => dispatch(setSelectedTimelineEvent(null))}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: INSPECT ACCESS HISTORY ITEM ================= */}
      {selectedAccessHistoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-teal-600" />
                Chart Access Trace
              </h3>
              <button
                onClick={() => dispatch(setSelectedAccessHistoryItem(null))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 font-mono text-[11px]">
                <div><span className="text-slate-400">ACTION:</span> <span className="font-bold">{selectedAccessHistoryItem.action}</span></div>
                <div><span className="text-slate-400">USER UUID:</span> <span>{selectedAccessHistoryItem.user_id || 'System'}</span></div>
                <div><span className="text-slate-400">IP ADDRESS:</span> <span>{selectedAccessHistoryItem.ip_address}</span></div>
                <div><span className="text-slate-400">TIMESTAMP:</span> <span>{new Date(selectedAccessHistoryItem.accessed_at).toLocaleString()}</span></div>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-200 dark:border-teal-800">
                <span className="font-bold text-teal-900 dark:text-teal-200 block mb-0.5">Access Justification:</span>
                <p className="text-slate-700 dark:text-slate-300">{selectedAccessHistoryItem.access_reason || 'Verified patient care protocol.'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => dispatch(setSelectedAccessHistoryItem(null))}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 rounded-xl font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= MODAL: DOCTOR REMARK ================= */}
      {showDoctorCheckupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Add Physician Remark & Milestone
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Append to Patient Chart & Timeline API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDoctorCheckupForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDoctorSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clinical Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Ventilator / Respiratory Plan">Ventilator / Respiratory Plan</option>
                    <option value="Hemodynamics & Vasopressors">Hemodynamics & Vasopressors</option>
                    <option value="Infectious Disease & Antibiotics">Infectious Disease & Antibiotics</option>
                    <option value="Sedation & Neurological">Sedation & Neurological</option>
                    <option value="General Multi-Disciplinary Round">General MDT Round</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority / Severity
                  </label>
                  <select
                    value={docPriority}
                    onChange={(e) => setDocPriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="INFO">Routine / Info</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Physician Directives & Assessment *
                </label>
                <textarea
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  rows={4}
                  placeholder="Record clinical assessment, medication changes, ventilator adjustments..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowDoctorCheckupForm(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMilestone}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingMilestone ? 'Recording...' : 'Submit Physician Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NURSE REMARK ================= */}
      {showNurseCheckupForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <HeartPulse className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Add Nursing Remark & Milestone
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Append to Patient Chart & Timeline API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowNurseCheckupForm(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNurseSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nursing Category
                  </label>
                  <select
                    value={nurseCategory}
                    onChange={(e) => setNurseCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="Nursing Assessment & Vitals">Nursing Assessment & Vitals</option>
                    <option value="Medication Administration">Medication Administration</option>
                    <option value="Line & Catheter Care">Line & Catheter Care</option>
                    <option value="Patient Turn & Skin Integrity">Patient Turn & Skin Integrity</option>
                    <option value="Endotracheal Suctioning">Endotracheal Suctioning</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Priority / Severity
                  </label>
                  <select
                    value={nursePriority}
                    onChange={(e) => setNursePriority(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="ROUTINE">Routine / Info</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nursing Assessment Details *
                </label>
                <textarea
                  value={nurseContent}
                  onChange={(e) => setNurseContent(e.target.value)}
                  rows={4}
                  placeholder="Record nursing interventions, skin condition, fluid balances, tube patency..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowNurseCheckupForm(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMilestone}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingMilestone ? 'Recording...' : 'Submit Nursing Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientTimelinePage;
