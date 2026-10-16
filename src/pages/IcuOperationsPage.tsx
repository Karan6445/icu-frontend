import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  HeartPulse,
  ClipboardCheck,
  RotateCw,
  Plus,
  Search,
  Clock,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  RefreshCw,
  Activity,
  Layers,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X,
  Copy,
  Check,
  Edit3,
  Calendar,
  Bed,
  Users,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchDoctorRoundsThunk,
  createDoctorRoundThunk,
  updateDoctorRoundThunk,
  fetchNursingActionsThunk,
  createNursingActionThunk,
  fetchNurseHandoversThunk,
  createNurseHandoverThunk,
  acknowledgeNurseHandoverThunk,
  fetchMyPendingNurseHandoversThunk,
  fetchShiftHandoversThunk,
  createShiftHandoverThunk,
  acknowledgeShiftHandoverThunk,
  fetchMyPendingShiftHandoversThunk,
  setActiveSubTab,
  setSelectedAdmissionId,
  setSelectedPatientId,
  setSelectedIcuId,
  setSelectedDoctorRound,
  setSelectedNursingAction,
  setSelectedNurseHandover,
  setSelectedShiftHandover,
  setIsRecordRoundModalOpen,
  setIsUpdateRoundModalOpen,
  setIsRecordNursingActionModalOpen,
  setIsSubmitNurseHandoverModalOpen,
  setIsAcknowledgeNurseHandoverModalOpen,
  setIsSubmitShiftHandoverModalOpen,
  setIsAcknowledgeShiftHandoverModalOpen,
  clearOperationAlerts,
  OperationsSubTab,
} from '../store/slices/operationsSlice';
import {
  DoctorRoundResponse,
  NursingActionResponse,
  NurseHandoverResponse,
  ShiftHandoverResponse,
  DoctorRoundType,
  NursingActionType,
  NursingActionStatus,
  ShiftHandoverType,
  DEFAULT_ADMISSION_UUID,
  DEFAULT_OPERATIONS_PATIENT_UUID as DEFAULT_PATIENT_UUID,
  DEFAULT_ICU_UUID,
  DEFAULT_DOCTOR_UUID,
  DEFAULT_NURSE_UUID,
} from '../api/operationsApi';
import { admissionApi } from '../api/admissionApi';
import { ICUAdmission } from '../types/admission';

export const IcuOperationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { patients } = useAppSelector((state) => state.patient);
  const { currentUser, activeRole } = useAppSelector((state) => state.auth);

  const {
    activeSubTab,
    selectedAdmissionId,
    selectedPatientId,
    selectedIcuId,

    doctorRounds,
    selectedDoctorRound,
    isDoctorRoundsLoading,
    isSubmittingRound,

    nursingActions,
    selectedNursingAction,
    isNursingActionsLoading,
    isSubmittingNursingAction,

    nurseHandovers,
    myPendingNurseHandovers,
    selectedNurseHandover,
    isNurseHandoversLoading,
    isSubmittingNurseHandover,
    isAcknowledgingNurseHandover,

    shiftHandovers,
    myPendingShiftHandovers,
    selectedShiftHandover,
    isShiftHandoversLoading,
    isSubmittingShiftHandover,
    isAcknowledgingShiftHandover,

    isRecordRoundModalOpen,
    isUpdateRoundModalOpen,
    isRecordNursingActionModalOpen,
    isSubmitNurseHandoverModalOpen,
    isAcknowledgeNurseHandoverModalOpen,
    isSubmitShiftHandoverModalOpen,
    isAcknowledgeShiftHandoverModalOpen,

    error,
    successMessage,
    lastSyncedTime,
  } = useAppSelector((state) => state.operations);

  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filters
  const [roundTypeFilter, setRoundTypeFilter] = useState<string>('ALL');
  const [nursingActionFilter, setNursingActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Doctor Round Form States
  const [formRoundType, setFormRoundType] = useState<DoctorRoundType>('MORNING_ROUNDS');
  const [formClinicalAssessment, setFormClinicalAssessment] = useState('');
  const [formManagementPlan, setFormManagementPlan] = useState('');
  const [formDischargePlanning, setFormDischargePlanning] = useState('');
  const [formRoundAttendeeName, setFormRoundAttendeeName] = useState('Dr. Alexander Mehta');
  const [formRoundAttendeeRole, setFormRoundAttendeeRole] = useState('Intensivist Lead');

  // Doctor Round Update Form States
  const [updateAssessment, setUpdateAssessment] = useState('');
  const [updatePlan, setUpdatePlan] = useState('');
  const [updateDischarge, setUpdateDischarge] = useState('');
  const [updateStatus, setUpdateStatus] = useState<string>('COMPLETED');

  // 2. Nursing Action Form States
  const [formActionType, setFormActionType] = useState<NursingActionType>('PATIENT_POSITIONING');
  const [formActionStatus, setFormActionStatus] = useState<NursingActionStatus>('COMPLETED');
  const [formActionDetails, setFormActionDetails] = useState('');
  const [formActionVitalsHr, setFormActionVitalsHr] = useState('');
  const [formActionVitalsSpo2, setFormActionVitalsSpo2] = useState('');
  const [formActionVitalsBp, setFormActionVitalsBp] = useState('');

  // 3. Nurse Handover Form States
  const [formSituation, setFormSituation] = useState('');
  const [formBackground, setFormBackground] = useState('');
  const [formAssessment, setFormAssessment] = useState('');
  const [formRecommendation, setFormRecommendation] = useState('');
  const [formLinesText, setFormLinesText] = useState('ET Tube 7.5mm @ 22cm, Right Radial A-Line, Right IJ CVC Triple Lumen');
  const [nurseAckNotes, setNurseAckNotes] = useState('');

  // 4. Shift Handover Form States
  const [formShiftType, setFormShiftType] = useState<ShiftHandoverType>('DAY_TO_NIGHT');
  const [formTotalBeds, setFormTotalBeds] = useState('12');
  const [formOccupiedBeds, setFormOccupiedBeds] = useState('10');
  const [formVentilatedPatients, setFormVentilatedPatients] = useState('6');
  const [formSafetyConcerns, setFormSafetyConcerns] = useState('All crash carts checked & defibrillators operational. Central oxygen pressure steady.');
  const [shiftAckNotes, setShiftAckNotes] = useState('');
  const [activeAdmissions, setActiveAdmissions] = useState<ICUAdmission[]>([]);

  // Load real active admissions from hospital
  useEffect(() => {
    admissionApi.listActive().then((res) => {
      if (res.data && res.data.length > 0) {
        setActiveAdmissions(res.data);
        const match = res.data.find((a) => a.id === selectedAdmissionId);
        if (!match && res.data[0]) {
          dispatch(setSelectedAdmissionId(res.data[0].id));
          if (res.data[0].patient_id) {
            dispatch(setSelectedPatientId(res.data[0].patient_id));
          }
        }
      }
    }).catch(() => {
      // Graceful fallback
    });
  }, [dispatch]);

  // Synchronize initial data
  useEffect(() => {
    dispatch(fetchDoctorRoundsThunk({ admission_id: selectedAdmissionId }));
    dispatch(fetchNursingActionsThunk({ admission_id: selectedAdmissionId }));
    dispatch(fetchNurseHandoversThunk({ admission_id: selectedAdmissionId }));
    dispatch(fetchMyPendingNurseHandoversThunk());
    dispatch(fetchShiftHandoversThunk({ icu_id: selectedIcuId }));
    dispatch(fetchMyPendingShiftHandoversThunk());
  }, [dispatch, selectedAdmissionId, selectedIcuId]);

  // Copy helper
  const handleCopy = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  // Refresh active tab data
  const handleRefreshActive = () => {
    if (activeSubTab === 'ROUNDS') {
      dispatch(fetchDoctorRoundsThunk({ admission_id: selectedAdmissionId }));
    } else if (activeSubTab === 'NURSING_ACTIONS') {
      dispatch(fetchNursingActionsThunk({ admission_id: selectedAdmissionId }));
    } else if (activeSubTab === 'NURSE_HANDOVERS') {
      dispatch(fetchNurseHandoversThunk({ admission_id: selectedAdmissionId }));
      dispatch(fetchMyPendingNurseHandoversThunk());
    } else if (activeSubTab === 'SHIFT_HANDOVERS') {
      dispatch(fetchShiftHandoversThunk({ icu_id: selectedIcuId }));
      dispatch(fetchMyPendingShiftHandoversThunk());
    }
  };

  // 1. Submit Doctor Round
  const handleCreateRoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClinicalAssessment.trim() || !formManagementPlan.trim()) return;

    await dispatch(
      createDoctorRoundThunk({
        admission_id: selectedAdmissionId,
        round_type: formRoundType,
        round_time: new Date().toISOString(),
        attendees: [
          { name: formRoundAttendeeName || currentUser.name, role: formRoundAttendeeRole },
        ],
        clinical_assessment: formClinicalAssessment.trim(),
        management_plan: formManagementPlan.trim(),
        discharge_planning: formDischargePlanning.trim() || null,
      })
    );
    setFormClinicalAssessment('');
    setFormManagementPlan('');
    setFormDischargePlanning('');
  };

  // Update Doctor Round
  const handleUpdateRoundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorRound) return;

    await dispatch(
      updateDoctorRoundThunk({
        roundId: selectedDoctorRound.id,
        payload: {
          clinical_assessment: updateAssessment.trim() || selectedDoctorRound.clinical_assessment,
          management_plan: updatePlan.trim() || selectedDoctorRound.management_plan,
          discharge_planning: updateDischarge.trim() || selectedDoctorRound.discharge_planning,
          status: updateStatus,
        },
      })
    );
  };

  // 2. Submit Nursing Action
  const handleCreateNursingActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const vitals: Record<string, any> = {};
    if (formActionVitalsHr.trim()) vitals.hr = Number(formActionVitalsHr);
    if (formActionVitalsSpo2.trim()) vitals.spo2 = Number(formActionVitalsSpo2);
    if (formActionVitalsBp.trim()) vitals.bp = formActionVitalsBp.trim();

    await dispatch(
      createNursingActionThunk({
        admission_id: selectedAdmissionId,
        action_type: formActionType,
        performed_time: new Date().toISOString(),
        status: formActionStatus,
        details: formActionDetails.trim() || null,
        vital_signs_recorded: Object.keys(vitals).length > 0 ? vitals : null,
      })
    );
    setFormActionDetails('');
    setFormActionVitalsHr('');
    setFormActionVitalsSpo2('');
    setFormActionVitalsBp('');
  };

  // 3. Submit Nurse SBAR Handover
  const handleCreateNurseHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSituation.trim() || !formAssessment.trim() || !formRecommendation.trim()) return;

    const devices = formLinesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ line: name }));

    await dispatch(
      createNurseHandoverThunk({
        admission_id: selectedAdmissionId,
        incoming_nurse_id: DEFAULT_NURSE_UUID,
        situation: formSituation.trim(),
        background: formBackground.trim() || 'Admitted with respiratory distress. Stabilized in ICU.',
        assessment: formAssessment.trim(),
        recommendation: formRecommendation.trim(),
        lines_and_devices: devices,
      })
    );
    setFormSituation('');
    setFormBackground('');
    setFormAssessment('');
    setFormRecommendation('');
  };

  // Acknowledge Nurse Handover
  const handleAcknowledgeNurseHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNurseHandover) return;

    await dispatch(
      acknowledgeNurseHandoverThunk({
        handoverId: selectedNurseHandover.id,
        payload: {
          acknowledgement_notes: nurseAckNotes.trim() || 'Physical bedside verification completed. Responsibility transferred.',
        },
      })
    );
    setNurseAckNotes('');
  };

  // 4. Submit Unit Shift Handover
  const handleCreateShiftHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await dispatch(
      createShiftHandoverThunk({
        icu_id: selectedIcuId,
        incoming_incharge_id: DEFAULT_NURSE_UUID,
        shift_type: formShiftType,
        shift_date: new Date().toISOString(),
        census_summary: {
          total_beds: Number(formTotalBeds) || 12,
          occupied_beds: Number(formOccupiedBeds) || 10,
          ventilated_patients: Number(formVentilatedPatients) || 6,
        },
        high_acuity_patient_ids: [selectedPatientId],
        safety_concerns: formSafetyConcerns.trim() || null,
      })
    );
  };

  // Acknowledge Shift Handover
  const handleAcknowledgeShiftHandoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShiftHandover) return;

    await dispatch(
      acknowledgeShiftHandoverThunk({
        handoverId: selectedShiftHandover.id,
        payload: {
          acknowledgement_notes: shiftAckNotes.trim() || 'Unit shift handover verified by incoming in-charge.',
        },
      })
    );
    setShiftAckNotes('');
  };

  // Open Update Modal for Doctor Round
  const openUpdateRoundModal = (round: DoctorRoundResponse) => {
    dispatch(setSelectedDoctorRound(round));
    setUpdateAssessment(round.clinical_assessment);
    setUpdatePlan(round.management_plan);
    setUpdateDischarge(round.discharge_planning || '');
    setUpdateStatus(round.status);
    dispatch(setIsUpdateRoundModalOpen(true));
  };

  // Active Patient info
  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0] || {
    id: selectedPatientId,
    name: 'Aarav Patel',
    mrn: 'MRN-ICU-88210',
    unitName: 'Medical ICU (MICU-EAST)',
    bedNumber: '04',
    status: 'CRITICAL',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans p-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100">
      {/* ================= HEADER & STATUS BAR ================= */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-teal-100 dark:bg-teal-500/20 text-[#0F766E] dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-300 dark:border-teal-500/30">
              ICU OPERATIONS & HANDOVERS ENGINE
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Synced: {lastSyncedTime}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Bedside Rounds & Clinical Handover Operations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time organ-system doctor rounds, nursing interventions, bedside SBAR transitions, and unit shift handovers.
          </p>
        </div>

        {/* Global Controls & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400 font-mono">ICU:</span>
            <span className="font-bold text-teal-700 dark:text-teal-400 font-mono">MICU-EAST</span>
          </div>

          <button
            onClick={handleRefreshActive}
            disabled={
              isDoctorRoundsLoading ||
              isNursingActionsLoading ||
              isNurseHandoversLoading ||
              isShiftHandoversLoading
            }
            className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition text-slate-700 dark:text-slate-200 cursor-pointer"
            title="Refresh active operation logs"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                isDoctorRoundsLoading ||
                isNursingActionsLoading ||
                isNurseHandoversLoading ||
                isShiftHandoversLoading
                  ? 'animate-spin text-teal-600'
                  : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* ================= SUCCESS / ERROR NOTIFICATIONS ================= */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearOperationAlerts())}
            className="text-emerald-600 hover:text-emerald-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearOperationAlerts())}
            className="text-rose-600 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ================= ACTIVE HOSPITAL ADMISSION STAY CONTEXT BAR ================= */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
            <Bed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Hospital Admission Stay Context:
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 border border-teal-300 dark:border-teal-700">
                ACTIVE IN-HOSPITAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Doctor rounds, nursing interventions & handovers are registered directly to this active admission stay.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
              Active Stay:
            </label>
            <select
              value={selectedAdmissionId}
              onChange={(e) => {
                const newAdmId = e.target.value;
                dispatch(setSelectedAdmissionId(newAdmId));
                const adm = activeAdmissions.find((a) => a.id === newAdmId);
                if (adm?.patient_id) {
                  dispatch(setSelectedPatientId(adm.patient_id));
                }
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-200"
            >
              {activeAdmissions.length > 0 ? (
                activeAdmissions.map((adm) => (
                  <option key={adm.id} value={adm.id}>
                    {adm.bed_number ? `[${adm.bed_number}] ` : ''}
                    {adm.patient_name || 'Patient'} ({adm.id.slice(0, 8)}...)
                  </option>
                ))
              ) : (
                <option value={DEFAULT_ADMISSION_UUID}>
                  [BED-02] Active ICU Patient ({DEFAULT_ADMISSION_UUID.slice(0, 8)}...)
                </option>
              )}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span>UUID:</span>
            <span
              className="font-bold text-teal-600 dark:text-teal-400 truncate max-w-[120px]"
              title={selectedAdmissionId}
            >
              {selectedAdmissionId}
            </span>
            <button
              onClick={() => handleCopy(selectedAdmissionId)}
              className="p-1 hover:text-teal-600 cursor-pointer"
              title="Copy Admission ID"
            >
              {copiedText === selectedAdmissionId ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= 4 OPERATIONS KPI SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Doctor Rounds */}
        <div
          onClick={() => dispatch(setActiveSubTab('ROUNDS'))}
          className={`bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-xs transition cursor-pointer ${
            activeSubTab === 'ROUNDS'
              ? 'border-teal-500 ring-2 ring-teal-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Doctor Rounds</span>
            <Stethoscope className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {doctorRounds.length}
            </span>
            <span className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold">
              Organ-System
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Latest: {doctorRounds[0]?.round_type.replace('_', ' ') || 'None today'}
          </span>
        </div>

        {/* Card 2: Nursing Actions */}
        <div
          onClick={() => dispatch(setActiveSubTab('NURSING_ACTIONS'))}
          className={`bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-xs transition cursor-pointer ${
            activeSubTab === 'NURSING_ACTIONS'
              ? 'border-teal-500 ring-2 ring-teal-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Nursing Actions</span>
            <HeartPulse className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {nursingActions.length}
            </span>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
              Interventions
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Line Care, Suction, Positioning
          </span>
        </div>

        {/* Card 3: Nurse Handovers */}
        <div
          onClick={() => dispatch(setActiveSubTab('NURSE_HANDOVERS'))}
          className={`bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-xs transition cursor-pointer ${
            activeSubTab === 'NURSE_HANDOVERS'
              ? 'border-teal-500 ring-2 ring-teal-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Nurse SBAR Handovers</span>
            <UserCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {nurseHandovers.length}
            </span>
            {myPendingNurseHandovers.length > 0 ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                {myPendingNurseHandovers.length} Pending
              </span>
            ) : (
              <span className="text-[11px] font-mono text-purple-700 dark:text-purple-400 font-bold">
                Transferred
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Bedside Responsibility Log
          </span>
        </div>

        {/* Card 4: Unit Shift Handovers */}
        <div
          onClick={() => dispatch(setActiveSubTab('SHIFT_HANDOVERS'))}
          className={`bg-white dark:bg-slate-800 border p-4 rounded-2xl shadow-xs transition cursor-pointer ${
            activeSubTab === 'SHIFT_HANDOVERS'
              ? 'border-teal-500 ring-2 ring-teal-500/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase">
            <span>Unit Shift Handovers</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {shiftHandovers.length}
            </span>
            <span className="text-[11px] font-mono text-blue-700 dark:text-blue-400 font-bold">
              ICU Ward
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Census & Safety Checks
          </span>
        </div>
      </div>

      {/* ================= SUB-TABS NAVIGATION ================= */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => dispatch(setActiveSubTab('ROUNDS'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeSubTab === 'ROUNDS'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>1. Bedside Doctor Rounds ({doctorRounds.length})</span>
        </button>

        <button
          onClick={() => dispatch(setActiveSubTab('NURSING_ACTIONS'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeSubTab === 'NURSING_ACTIONS'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <HeartPulse className="w-4 h-4" />
          <span>2. Bedside Nursing Actions ({nursingActions.length})</span>
        </button>

        <button
          onClick={() => dispatch(setActiveSubTab('NURSE_HANDOVERS'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeSubTab === 'NURSE_HANDOVERS'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>3. Nurse SBAR Handovers ({nurseHandovers.length})</span>
        </button>

        <button
          onClick={() => dispatch(setActiveSubTab('SHIFT_HANDOVERS'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 cursor-pointer ${
            activeSubTab === 'SHIFT_HANDOVERS'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>4. Unit Shift Handovers ({shiftHandovers.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: DOCTOR ROUNDS ================= */}
      {activeSubTab === 'ROUNDS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={roundTypeFilter}
                onChange={(e) => setRoundTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Round Types</option>
                <option value="MORNING_ROUNDS">Morning Rounds</option>
                <option value="EVENING_ROUNDS">Evening Rounds</option>
                <option value="NIGHT_SAFETY_ROUNDS">Night Safety Rounds</option>
                <option value="MULTIDISCIPLINARY_ROUNDS">Multidisciplinary Rounds</option>
              </select>

              <span className="text-slate-400 font-mono text-[11px]">
                Endpoint: GET & POST /api/v1/operations/rounds
              </span>
            </div>

            <button
              onClick={() => dispatch(setIsRecordRoundModalOpen(true))}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Record Bedside Doctor Round</span>
            </button>
          </div>

          {/* List of Doctor Rounds */}
          <div className="space-y-3">
            {doctorRounds
              .filter((r) => roundTypeFilter === 'ALL' || r.round_type === roundTypeFilter)
              .map((round) => (
                <div
                  key={round.id}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-3 hover:border-teal-500/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                        {round.round_type.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          round.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : round.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {round.status}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Lead MD: {round.lead_doctor_id.slice(0, 8)}...
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{new Date(round.round_time).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] block">
                        Organ-System Clinical Assessment:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {round.clinical_assessment}
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider text-[11px] block">
                        Directives & Management Plan:
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                        {round.management_plan}
                      </p>
                    </div>
                  </div>

                  {round.discharge_planning && (
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-300">
                      <span className="font-bold">Discharge / Stepdown Planning: </span>
                      <span>{round.discharge_planning}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span>Attendees:</span>
                      {round.attendees && round.attendees.length > 0 ? (
                        round.attendees.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[10px]"
                          >
                            {a.name || a.role || 'Staff'}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[10px]">Attending & Bedside MDT</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openUpdateRoundModal(round)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Update Assessment (PUT)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= TAB 2: NURSING ACTIONS ================= */}
      {activeSubTab === 'NURSING_ACTIONS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={nursingActionFilter}
                onChange={(e) => setNursingActionFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-teal-500"
              >
                <option value="ALL">All Nursing Action Types</option>
                <option value="PATIENT_POSITIONING">Patient Positioning</option>
                <option value="AIRWAY_SUCTIONING">Airway Suctioning</option>
                <option value="LINE_CARE">Line & Catheter Care</option>
                <option value="DRESSING_CHANGE">Dressing Change</option>
                <option value="ORAL_HYGIENE">Oral Hygiene</option>
                <option value="GLYCEMIC_CHECK">Glycemic POC Check</option>
                <option value="DRAIN_MEASUREMENT">Drain Measurement</option>
              </select>

              <span className="text-slate-400 font-mono text-[11px]">
                Endpoint: GET & POST /api/v1/operations/nursing-actions
              </span>
            </div>

            <button
              onClick={() => dispatch(setIsRecordNursingActionModalOpen(true))}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Log Bedside Nursing Action</span>
            </button>
          </div>

          {/* Table / Flowsheet */}
          <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5">Timestamp</th>
                  <th className="py-4 px-5">Intervention Type</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5">Clinical Observation Details</th>
                  <th className="py-4 px-5">Vitals Logged</th>
                  <th className="py-4 px-5 text-right">Nurse Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {nursingActions
                  .filter((a) => nursingActionFilter === 'ALL' || a.action_type === nursingActionFilter)
                  .map((action) => (
                    <tr
                      key={action.id}
                      onClick={() => dispatch(setSelectedNursingAction(action))}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-5 font-mono text-slate-900 dark:text-white font-bold">
                        {new Date(action.performed_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        <span className="block text-[10px] text-slate-400">
                          {new Date(action.performed_time).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-900 dark:text-white block font-mono text-xs">
                          {action.action_type.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            action.status === 'COMPLETED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          {action.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 max-w-md">
                        <p className="text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                          {action.details || 'Standard protocol executed per ICU order.'}
                        </p>
                      </td>

                      <td className="py-4 px-5">
                        {action.vital_signs_recorded ? (
                          <div className="flex flex-wrap gap-1 font-mono text-[10px]">
                            {Object.entries(action.vital_signs_recorded).map(([k, v]) => (
                              <span
                                key={k}
                                className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
                              >
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right font-mono text-slate-500">
                        {action.performed_by_id.slice(0, 8)}...
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: NURSE SBAR HANDOVERS ================= */}
      {activeSubTab === 'NURSE_HANDOVERS' && (
        <div className="space-y-4">
          {/* Pending Alerts Banner */}
          {myPendingNurseHandovers.length > 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    {myPendingNurseHandovers.length} Bedside Handover(s) Awaiting Incoming Responsibility Verification
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Endpoint: GET /api/v1/operations/nurse-handovers/pending/my
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                SBAR Bedside Shift Handover Log
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Situation • Background • Assessment • Recommendation
              </p>
            </div>

            <button
              onClick={() => dispatch(setIsSubmitNurseHandoverModalOpen(true))}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Submit SBAR Bedside Handover</span>
            </button>
          </div>

          {/* SBAR Cards */}
          <div className="space-y-3">
            {nurseHandovers.map((handover) => (
              <div
                key={handover.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        handover.status === 'ACKNOWLEDGED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {handover.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Outgoing: {handover.outgoing_nurse_id.slice(0, 8)}... → Incoming:{' '}
                      {handover.incoming_nurse_id.slice(0, 8)}...
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{new Date(handover.handover_time).toLocaleString()}</span>
                  </div>
                </div>

                {/* SBAR 4-Box Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                      [S] Situation
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {handover.situation}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                      [B] Background
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {handover.background}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                      [A] Assessment
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {handover.assessment}
                    </p>
                  </div>

                  <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl border border-teal-200 dark:border-teal-800">
                    <span className="font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider text-[10px] block mb-1">
                      [R] Recommendation
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                      {handover.recommendation}
                    </p>
                  </div>
                </div>

                {/* Lines & Devices Attached */}
                {handover.lines_and_devices && handover.lines_and_devices.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs">
                    <span className="text-slate-400 text-[11px] font-mono mr-1">Invasive Lines:</span>
                    {handover.lines_and_devices.map((d, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-semibold"
                      >
                        {d.type || d.line || 'Device'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Acknowledgement Status / Action */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  {handover.status === 'ACKNOWLEDGED' ? (
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Verified & Transferred at {new Date(handover.acknowledged_at || '').toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(setSelectedNurseHandover(handover));
                        dispatch(setIsAcknowledgeNurseHandoverModalOpen(true));
                      }}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Acknowledge & Transfer Responsibility</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: UNIT SHIFT HANDOVERS ================= */}
      {activeSubTab === 'SHIFT_HANDOVERS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Unit Ward Shift Handover (In-Charge Transition)
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Census summary, safety concerns, and high acuity patient rosters.
              </p>
            </div>

            <button
              onClick={() => dispatch(setIsSubmitShiftHandoverModalOpen(true))}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Unit Shift Handover</span>
            </button>
          </div>

          {/* List of Shift Handovers */}
          <div className="space-y-4">
            {shiftHandovers.map((shift) => (
              <div
                key={shift.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      {shift.shift_type.replace(/_/g, ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        shift.status === 'ACKNOWLEDGED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {shift.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Shift Date: {new Date(shift.shift_date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>{new Date(shift.handover_time).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Census Mini-Grid */}
                {shift.census_summary && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-slate-400 block text-[10px]">TOTAL BEDS</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {shift.census_summary.total_beds || 12}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-slate-400 block text-[10px]">OCCUPIED BEDS</span>
                      <span className="text-lg font-black text-teal-700 dark:text-teal-400">
                        {shift.census_summary.occupied_beds || 10}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-slate-400 block text-[10px]">ON VENTILATOR</span>
                      <span className="text-lg font-black text-purple-700 dark:text-purple-400">
                        {shift.census_summary.ventilated_patients || 6}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                      <span className="text-slate-400 block text-[10px]">OPEN / ADMIT</span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                        {shift.census_summary.open_beds || 2}
                      </span>
                    </div>
                  </div>
                )}

                {/* Safety Concerns */}
                {shift.safety_concerns && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Safety Briefing & Equipment Notes:</span>
                      <p>{shift.safety_concerns}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  {shift.status === 'ACKNOWLEDGED' ? (
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-[11px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Verified by In-Charge at {new Date(shift.acknowledged_at || '').toLocaleTimeString()}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        dispatch(setSelectedShiftHandover(shift));
                        dispatch(setIsAcknowledgeShiftHandoverModalOpen(true));
                      }}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Acknowledge Unit Shift Handover</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD DOCTOR ROUND ================= */}
      {isRecordRoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 rounded-xl">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Record Bedside Doctor Round
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    POST /api/v1/operations/rounds
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setIsRecordRoundModalOpen(false))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoundSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Round Type *
                  </label>
                  <select
                    value={formRoundType}
                    onChange={(e) => setFormRoundType(e.target.value as DoctorRoundType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="MORNING_ROUNDS">Morning Rounds</option>
                    <option value="EVENING_ROUNDS">Evening Rounds</option>
                    <option value="NIGHT_SAFETY_ROUNDS">Night Safety Rounds</option>
                    <option value="MULTIDISCIPLINARY_ROUNDS">Multidisciplinary Rounds</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Attending Clinician
                  </label>
                  <input
                    type="text"
                    value={formRoundAttendeeName}
                    onChange={(e) => setFormRoundAttendeeName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Organ-System Clinical Assessment *
                </label>
                <textarea
                  value={formClinicalAssessment}
                  onChange={(e) => setFormClinicalAssessment(e.target.value)}
                  rows={3}
                  placeholder="Review neurology (RASS), cardiovascular (MAP/pressors), pulmonary (P/F ratio), renal..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Management Plan & Interventions *
                </label>
                <textarea
                  value={formManagementPlan}
                  onChange={(e) => setFormManagementPlan(e.target.value)}
                  rows={3}
                  placeholder="Directives: ventilator weaning, fluid balance target, antibiotic de-escalation..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Discharge / Stepdown Planning (Optional)
                </label>
                <input
                  type="text"
                  value={formDischargePlanning}
                  onChange={(e) => setFormDischargePlanning(e.target.value)}
                  placeholder="e.g. Plan extubation trial tomorrow AM, transfer to HDU if stable."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch(setIsRecordRoundModalOpen(false))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRound}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingRound ? 'Saving...' : 'Record Doctor Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: UPDATE DOCTOR ROUND (PUT) ================= */}
      {isUpdateRoundModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Update Assessment & Management Plan
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  PUT /api/v1/operations/rounds/{'{round_id}'}
                </p>
              </div>
              <button
                onClick={() => dispatch(setIsUpdateRoundModalOpen(false))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoundSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Revised Clinical Assessment
                </label>
                <textarea
                  value={updateAssessment}
                  onChange={(e) => setUpdateAssessment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Revised Management Plan
                </label>
                <textarea
                  value={updatePlan}
                  onChange={(e) => setUpdatePlan(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch(setIsUpdateRoundModalOpen(false))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRound}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingRound ? 'Saving...' : 'Update Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG NURSING ACTION ================= */}
      {isRecordNursingActionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Log Bedside Nursing Action
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    POST /api/v1/operations/nursing-actions
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setIsRecordNursingActionModalOpen(false))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNursingActionSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Action Type *
                  </label>
                  <select
                    value={formActionType}
                    onChange={(e) => setFormActionType(e.target.value as NursingActionType)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="PATIENT_POSITIONING">Patient Positioning</option>
                    <option value="AIRWAY_SUCTIONING">Airway Suctioning</option>
                    <option value="LINE_CARE">Line & Catheter Care</option>
                    <option value="DRESSING_CHANGE">Dressing Change</option>
                    <option value="ORAL_HYGIENE">Oral Hygiene</option>
                    <option value="GLYCEMIC_CHECK">Glycemic POC Check</option>
                    <option value="DRAIN_MEASUREMENT">Drain Measurement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status *
                  </label>
                  <select
                    value={formActionStatus}
                    onChange={(e) => setFormActionStatus(e.target.value as NursingActionStatus)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DEFERRED">DEFERRED</option>
                    <option value="OMITTED">OMITTED</option>
                    <option value="REFUSED">REFUSED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Intervention Details & Notes
                </label>
                <textarea
                  value={formActionDetails}
                  onChange={(e) => setFormActionDetails(e.target.value)}
                  rows={3}
                  placeholder="e.g. In-line suctioning performed, thin secretions cleared. Skin intact upon lateral reposition."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Heart Rate
                  </label>
                  <input
                    type="number"
                    value={formActionVitalsHr}
                    onChange={(e) => setFormActionVitalsHr(e.target.value)}
                    placeholder="bpm"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    SpO2 (%)
                  </label>
                  <input
                    type="number"
                    value={formActionVitalsSpo2}
                    onChange={(e) => setFormActionVitalsSpo2(e.target.value)}
                    placeholder="%"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    BP (Sys/Dia)
                  </label>
                  <input
                    type="text"
                    value={formActionVitalsBp}
                    onChange={(e) => setFormActionVitalsBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch(setIsRecordNursingActionModalOpen(false))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNursingAction}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingNursingAction ? 'Logging...' : 'Log Nursing Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUBMIT SBAR NURSE HANDOVER ================= */}
      {isSubmitNurseHandoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Submit SBAR Bedside Nurse Handover
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    POST /api/v1/operations/nurse-handovers
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setIsSubmitNurseHandoverModalOpen(false))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNurseHandoverSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  [S] Situation *
                </label>
                <input
                  type="text"
                  value={formSituation}
                  onChange={(e) => setFormSituation(e.target.value)}
                  placeholder="e.g. 62 y/o Male admitted with ARDS. Currently intubated on PRVC."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  [B] Background
                </label>
                <input
                  type="text"
                  value={formBackground}
                  onChange={(e) => setFormBackground(e.target.value)}
                  placeholder="e.g. Day 3 ARDS post aspiration pneumonia. Broad spectrum antibiotics."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  [A] Assessment *
                </label>
                <textarea
                  value={formAssessment}
                  onChange={(e) => setFormAssessment(e.target.value)}
                  rows={2}
                  placeholder="e.g. Vitals stable on 0.04 norepinephrine. Urine output 45 mL/hr. RASS -1."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  [R] Recommendation *
                </label>
                <textarea
                  value={formRecommendation}
                  onChange={(e) => setFormRecommendation(e.target.value)}
                  rows={2}
                  placeholder="e.g. Check ABG at 18:00. Maintain ventilator PEEP 10. Wean pressors if MAP >= 65."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Invasive Lines & Devices (Comma-separated)
                </label>
                <input
                  type="text"
                  value={formLinesText}
                  onChange={(e) => setFormLinesText(e.target.value)}
                  placeholder="ET Tube 7.5mm, Right Radial A-Line, CVC Triple Lumen"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch(setIsSubmitNurseHandoverModalOpen(false))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNurseHandover}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingNurseHandover ? 'Submitting...' : 'Submit SBAR Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ACKNOWLEDGE NURSE HANDOVER ================= */}
      {isAcknowledgeNurseHandoverModalOpen && selectedNurseHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-teal-600" />
                Acknowledge Nurse Handover
              </h3>
              <button
                onClick={() => dispatch(setIsAcknowledgeNurseHandoverModalOpen(false))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAcknowledgeNurseHandoverSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Handover Summary:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {selectedNurseHandover.situation}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bedside Physical Verification Notes
                </label>
                <textarea
                  value={nurseAckNotes}
                  onChange={(e) => setNurseAckNotes(e.target.value)}
                  rows={3}
                  placeholder="Confirmed ET tube position at 22cm, infusions verified, alarms customized, responsibility accepted."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch(setIsAcknowledgeNurseHandoverModalOpen(false))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAcknowledgingNurseHandover}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isAcknowledgingNurseHandover ? 'Verifying...' : 'Sign & Accept Responsibility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: SUBMIT UNIT SHIFT HANDOVER ================= */}
      {isSubmitShiftHandoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Submit Unit Shift Handover
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    POST /api/v1/operations/shift-handovers
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setIsSubmitShiftHandoverModalOpen(false))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShiftHandoverSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shift Transition Type *
                </label>
                <select
                  value={formShiftType}
                  onChange={(e) => setFormShiftType(e.target.value as ShiftHandoverType)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-medium"
                >
                  <option value="DAY_TO_NIGHT">Day to Night (19:00 Transition)</option>
                  <option value="NIGHT_TO_DAY">Night to Day (07:00 Transition)</option>
                  <option value="EVENING_TRANSITION">Evening Mid-Shift Transition</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Beds
                  </label>
                  <input
                    type="number"
                    value={formTotalBeds}
                    onChange={(e) => setFormTotalBeds(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Occupied
                  </label>
                  <input
                    type="number"
                    value={formOccupiedBeds}
                    onChange={(e) => setFormOccupiedBeds(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    On Ventilator
                  </label>
                  <input
                    type="number"
                    value={formVentilatedPatients}
                    onChange={(e) => setFormVentilatedPatients(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Safety Concerns & Unit Briefing
                </label>
                <textarea
                  value={formSafetyConcerns}
                  onChange={(e) => setFormSafetyConcerns(e.target.value)}
                  rows={3}
                  placeholder="Crash cart checks, central gas pipeline alarms, isolated infections..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch(setIsSubmitShiftHandoverModalOpen(false))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShiftHandover}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isSubmittingShiftHandover ? 'Submitting...' : 'Submit Shift Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ACKNOWLEDGE SHIFT HANDOVER ================= */}
      {isAcknowledgeShiftHandoverModalOpen && selectedShiftHandover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                Acknowledge Unit Shift Handover
              </h3>
              <button
                onClick={() => dispatch(setIsAcknowledgeShiftHandoverModalOpen(false))}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAcknowledgeShiftHandoverSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Shift Type:</span>
                <p className="text-slate-800 dark:text-slate-200 font-medium">
                  {selectedShiftHandover.shift_type.replace(/_/g, ' ')}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Incoming In-Charge Verification Notes
                </label>
                <textarea
                  value={shiftAckNotes}
                  onChange={(e) => setShiftAckNotes(e.target.value)}
                  rows={3}
                  placeholder="Census verified, narcotics counts matched, patient assignments accepted."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => dispatch(setIsAcknowledgeShiftHandoverModalOpen(false))}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAcknowledgingShiftHandover}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold transition shadow-sm disabled:opacity-50"
                >
                  {isAcknowledgingShiftHandover ? 'Verifying...' : 'Sign & Accept Unit Charge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IcuOperationsPage;
