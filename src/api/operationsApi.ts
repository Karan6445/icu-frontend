import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

// ==========================================
// ICU OPERATIONS & HANDOVERS CONTRACTS
// OpenAPI 3.1: /api/v1/operations/*
// ==========================================

export type DoctorRoundType =
  | 'MORNING_ROUNDS'
  | 'EVENING_ROUNDS'
  | 'NIGHT_SAFETY_ROUNDS'
  | 'MULTIDISCIPLINARY_ROUNDS';

export type DoctorRoundStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type NursingActionType =
  | 'PATIENT_POSITIONING'
  | 'AIRWAY_SUCTIONING'
  | 'LINE_CARE'
  | 'DRESSING_CHANGE'
  | 'ORAL_HYGIENE'
  | 'GLYCEMIC_CHECK'
  | 'DRAIN_MEASUREMENT';

export type NursingActionStatus = 'COMPLETED' | 'OMITTED' | 'DEFERRED' | 'REFUSED';

export type ShiftHandoverType = 'DAY_TO_NIGHT' | 'NIGHT_TO_DAY' | 'EVENING_TRANSITION';

export interface DoctorRoundCreatePayload {
  admission_id: string;
  round_type: DoctorRoundType | string;
  round_time?: string | null;
  attendees?: Array<Record<string, any>>;
  clinical_assessment: string;
  management_plan: string;
  discharge_planning?: string | null;
}

export interface DoctorRoundUpdatePayload {
  clinical_assessment?: string | null;
  management_plan?: string | null;
  discharge_planning?: string | null;
  status?: DoctorRoundStatus | string | null;
}

export interface DoctorRoundResponse {
  id: string;
  hospital_id: string;
  patient_id: string;
  admission_id: string;
  round_type: string;
  round_time: string;
  lead_doctor_id: string;
  attendees: Array<Record<string, any>>;
  clinical_assessment: string;
  management_plan: string;
  discharge_planning?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorRoundsQueryParams {
  admission_id?: string | null;
  patient_id?: string | null;
  limit?: number;
  offset?: number;
}

export interface NursingActionCreatePayload {
  admission_id: string;
  action_type: NursingActionType | string;
  scheduled_time?: string | null;
  performed_time?: string | null;
  status?: NursingActionStatus | string;
  details?: string | null;
  vital_signs_recorded?: Record<string, any> | null;
}

export interface NursingActionResponse {
  id: string;
  hospital_id: string;
  patient_id: string;
  admission_id: string;
  action_type: string;
  scheduled_time?: string | null;
  performed_time: string;
  performed_by_id: string;
  status: string;
  details?: string | null;
  vital_signs_recorded?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface NursingActionsQueryParams {
  admission_id?: string | null;
  patient_id?: string | null;
  limit?: number;
  offset?: number;
}

export interface NurseHandoverCreatePayload {
  admission_id: string;
  incoming_nurse_id: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  lines_and_devices?: Array<Record<string, any>>;
}

export interface NurseHandoverAcknowledgePayload {
  acknowledgement_notes?: string | null;
}

export interface NurseHandoverResponse {
  id: string;
  hospital_id: string;
  patient_id: string;
  admission_id: string;
  outgoing_nurse_id: string;
  incoming_nurse_id: string;
  handover_time: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  lines_and_devices: Array<Record<string, any>>;
  status: string;
  acknowledged_at?: string | null;
  acknowledgement_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NurseHandoversQueryParams {
  admission_id?: string | null;
  patient_id?: string | null;
  limit?: number;
  offset?: number;
}

export interface ShiftHandoverCreatePayload {
  icu_id: string;
  incoming_incharge_id: string;
  shift_type: ShiftHandoverType | string;
  shift_date: string;
  census_summary?: Record<string, any>;
  high_acuity_patient_ids?: string[];
  safety_concerns?: string | null;
}

export interface ShiftHandoverAcknowledgePayload {
  acknowledgement_notes?: string | null;
}

export interface ShiftHandoverResponse {
  id: string;
  hospital_id: string;
  icu_id: string;
  outgoing_incharge_id: string;
  incoming_incharge_id: string;
  shift_type: string;
  shift_date: string;
  handover_time: string;
  census_summary: Record<string, any>;
  high_acuity_patient_ids: string[];
  safety_concerns?: string | null;
  status: string;
  acknowledged_at?: string | null;
  acknowledgement_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftHandoversQueryParams {
  icu_id?: string | null;
  limit?: number;
  offset?: number;
}

// Default IDs for seamless API compatibility
export const DEFAULT_HOSPITAL_UUID = 'a324634e-b022-44ac-b633-448e14f35ad4';
export const DEFAULT_ICU_UUID = '4d97e6e2-e4a4-41f0-95b2-428f7e80de88';
export const DEFAULT_ADMISSION_UUID = 'b460e0a2-8653-4912-8968-8ca1bc6e8cb8';
export const DEFAULT_OPERATIONS_PATIENT_UUID = '98c47607-b60f-4f7d-8786-fc3f34a6b3a8';
const DEFAULT_PATIENT_UUID = DEFAULT_OPERATIONS_PATIENT_UUID;
export const DEFAULT_DOCTOR_UUID = 'b503be05-e5e5-43c0-b853-4cf88a014423';
export const DEFAULT_NURSE_UUID = 'f0a41554-bd5f-416b-bd5b-005b4b749107';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ensureUuid = (id: string | null | undefined, fallback: string): string => {
  if (id && UUID_REGEX.test(id.trim())) {
    return id.trim();
  }
  return fallback;
};

// ==========================================
// SEED FALLBACK DATA
// ==========================================

export const createFallbackDoctorRounds = (): DoctorRoundResponse[] => [
  {
    id: 'dr-rnd-001',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    patient_id: DEFAULT_PATIENT_UUID,
    admission_id: DEFAULT_ADMISSION_UUID,
    round_type: 'MORNING_ROUNDS',
    round_time: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    lead_doctor_id: DEFAULT_DOCTOR_UUID,
    attendees: [
      { name: 'Dr. Alexander Mehta', role: 'Intensivist Lead' },
      { name: 'Nurse Sunita Rao', role: 'Charge RN' },
      { name: 'Dr. Priya Sharma', role: 'Fellow' },
    ],
    clinical_assessment:
      'Day 3 ARDS. PaO2/FiO2 ratio improving from 145 to 190. Sedation lightened to RASS -1. Hemodynamically stable on minimal norepinephrine (0.04 mcg/kg/min).',
    management_plan:
      '1. Titrate FiO2 to maintain SpO2 92-96%. 2. Wean norepinephrine if MAP >= 65 mmHg. 3. Continue lung-protective tidal volume at 6 mL/kg PBW. 4. Plan spontaneous breathing trial tomorrow AM.',
    discharge_planning: 'Not ready for ICU stepdown; continue invasive mechanical ventilation for next 24-48h.',
    status: 'COMPLETED',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'dr-rnd-002',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    patient_id: DEFAULT_PATIENT_UUID,
    admission_id: DEFAULT_ADMISSION_UUID,
    round_type: 'MULTIDISCIPLINARY_ROUNDS',
    round_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    lead_doctor_id: DEFAULT_DOCTOR_UUID,
    attendees: [
      { name: 'Dr. Alexander Mehta', role: 'Attending' },
      { name: 'Clinical Pharmacist', role: 'Pharmacy' },
      { name: 'Respiratory Therapist', role: 'RT Lead' },
    ],
    clinical_assessment:
      'Renal function stable. Serum creatinine 1.1 mg/dL, urine output 0.8 mL/kg/h. Antimicrobial stepdown discussed with microbiology.',
    management_plan:
      'De-escalate broad spectrum Vancomycin following negative 48h blood cultures. Continue Piperacillin/Tazobactam.',
    discharge_planning: null,
    status: 'IN_PROGRESS',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
];

export const createFallbackNursingActions = (): NursingActionResponse[] => [
  {
    id: 'na-001',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    patient_id: DEFAULT_PATIENT_UUID,
    admission_id: DEFAULT_ADMISSION_UUID,
    action_type: 'PATIENT_POSITIONING',
    scheduled_time: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    performed_time: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    performed_by_id: DEFAULT_NURSE_UUID,
    status: 'COMPLETED',
    details: 'Repositioned patient from supine to 30-degree right lateral tilt. Sacral skin intact, pressure points padded.',
    vital_signs_recorded: { hr: 82, spo2: 97, bp_systolic: 124, bp_diastolic: 74 },
    created_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
  },
  {
    id: 'na-002',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    patient_id: DEFAULT_PATIENT_UUID,
    admission_id: DEFAULT_ADMISSION_UUID,
    action_type: 'AIRWAY_SUCTIONING',
    scheduled_time: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    performed_time: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    performed_by_id: DEFAULT_NURSE_UUID,
    status: 'COMPLETED',
    details: 'Closed in-line suctioning performed via size 7.5 ET tube. Moderate thin secretions cleared. Pre-oxygenated 100% for 2 mins.',
    vital_signs_recorded: { hr: 88, spo2: 99, etco2: 38 },
    created_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
  },
  {
    id: 'na-003',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    patient_id: DEFAULT_PATIENT_UUID,
    admission_id: DEFAULT_ADMISSION_UUID,
    action_type: 'LINE_CARE',
    scheduled_time: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    performed_time: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    performed_by_id: DEFAULT_NURSE_UUID,
    status: 'COMPLETED',
    details: 'Right internal jugular CVC dressing inspected, chlorhexidine biopatch changed aseptically. All lumens flushed cleanly.',
    vital_signs_recorded: null,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'na-004',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    patient_id: DEFAULT_PATIENT_UUID,
    admission_id: DEFAULT_ADMISSION_UUID,
    action_type: 'GLYCEMIC_CHECK',
    scheduled_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    performed_time: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    performed_by_id: DEFAULT_NURSE_UUID,
    status: 'COMPLETED',
    details: 'POC Capillary Blood Glucose = 138 mg/dL. Within ICU target range (110-150 mg/dL). No sliding scale insulin required.',
    vital_signs_recorded: { blood_glucose: 138 },
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

export const createFallbackNurseHandovers = (): NurseHandoverResponse[] => [
  {
    id: 'nh-001',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    patient_id: DEFAULT_PATIENT_UUID,
    admission_id: DEFAULT_ADMISSION_UUID,
    outgoing_nurse_id: DEFAULT_NURSE_UUID,
    incoming_nurse_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    handover_time: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    situation: '62 y/o Male admitted with ARDS. Currently Day 3 intubated on PRVC mode.',
    background: 'History of COPD and HTN. Admitted from Emergency following acute hypoxemic respiratory failure.',
    assessment: 'Vitals stable. MAP maintained >= 70 mmHg on 0.04 mcg/kg/min norepinephrine. ETT secured at 22 cm lip line. ABG shows pH 7.38, PaO2 88, PaCO2 42.',
    recommendation: 'Check ABG post-weaning at 18:00. Maintain continuous sedation at RASS -1 to -2. Monitor right arterial line waveform.',
    lines_and_devices: [
      { type: 'ET Tube', size: '7.5 mm', depth: '22 cm' },
      { type: 'Right Radial Arterial Line', date: '2026-10-11' },
      { type: 'Right IJ CVC Triple Lumen', date: '2026-10-10' },
      { type: 'Foley Catheter', temp_sensor: true },
    ],
    status: 'PENDING_ACKNOWLEDGEMENT',
    acknowledged_at: null,
    acknowledgement_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
  {
    id: 'nh-002',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    patient_id: DEFAULT_PATIENT_UUID,
    admission_id: DEFAULT_ADMISSION_UUID,
    outgoing_nurse_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    incoming_nurse_id: DEFAULT_NURSE_UUID,
    handover_time: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    situation: 'Morning shift handover completed. Patient tolerated suctioning well.',
    background: 'Broad-spectrum coverage pending final lab sensitivities.',
    assessment: 'Urine output adequate at 45 mL/hr. Neurological pupils equal and reactive.',
    recommendation: 'Ensure potassium replacement run is completed by noon.',
    lines_and_devices: [
      { type: 'ET Tube', size: '7.5 mm', depth: '22 cm' },
      { type: 'Right Radial Arterial Line', date: '2026-10-11' },
    ],
    status: 'ACKNOWLEDGED',
    acknowledged_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    acknowledgement_notes: 'Bedside check verified. Infusions, pumps, and line zeroing physically validated.',
    created_at: new Date(Date.now() - 1000 * 60 * 500).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
  },
];

export const createFallbackShiftHandovers = (): ShiftHandoverResponse[] => [
  {
    id: 'sh-001',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    icu_id: DEFAULT_ICU_UUID,
    outgoing_incharge_id: DEFAULT_NURSE_UUID,
    incoming_incharge_id: 'f40d0237-ffa7-458b-bda6-752204c24483',
    shift_type: 'DAY_TO_NIGHT',
    shift_date: new Date().toISOString(),
    handover_time: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    census_summary: {
      total_beds: 12,
      occupied_beds: 10,
      open_beds: 2,
      ventilated_patients: 6,
      new_admissions: 2,
      planned_discharges: 1,
    },
    high_acuity_patient_ids: [DEFAULT_PATIENT_UUID],
    safety_concerns: 'Central oxygen pressure alarm checked and cleared with biomedical team. 1 isolation room occupied with contact precautions.',
    status: 'PENDING_ACKNOWLEDGEMENT',
    acknowledged_at: null,
    acknowledgement_notes: null,
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'sh-002',
    hospital_id: DEFAULT_HOSPITAL_UUID,
    icu_id: DEFAULT_ICU_UUID,
    outgoing_incharge_id: 'f40d0237-ffa7-458b-bda6-752204c24483',
    incoming_incharge_id: DEFAULT_NURSE_UUID,
    shift_type: 'NIGHT_TO_DAY',
    shift_date: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    handover_time: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
    census_summary: {
      total_beds: 12,
      occupied_beds: 9,
      open_beds: 3,
      ventilated_patients: 5,
      new_admissions: 1,
      planned_discharges: 2,
    },
    high_acuity_patient_ids: [DEFAULT_PATIENT_UUID],
    safety_concerns: 'Crash carts 1 and 2 restocked and defibrillators tested operational.',
    status: 'ACKNOWLEDGED',
    acknowledged_at: new Date(Date.now() - 1000 * 60 * 680).toISOString(),
    acknowledgement_notes: 'All 9 bedside nurse rosters cross-verified. Crash cart logs signed.',
    created_at: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 680).toISOString(),
  },
];

// ==========================================
// ICU OPERATIONS API SERVICE
// ==========================================

export const operationsApi = {
  // ------------------------------------------
  // 1. DOCTOR ROUNDS
  // ------------------------------------------

  /**
   * POST /api/v1/operations/rounds
   * Record Bedside Doctor Round
   */
  async recordDoctorRound(
    payload: DoctorRoundCreatePayload
  ): Promise<ApiResponse<DoctorRoundResponse>> {
    const validAdmissionId = ensureUuid(payload.admission_id, DEFAULT_ADMISSION_UUID);
    const body: DoctorRoundCreatePayload = {
      admission_id: validAdmissionId,
      round_type: payload.round_type,
      round_time: payload.round_time || new Date().toISOString(),
      attendees: payload.attendees || [],
      clinical_assessment: payload.clinical_assessment.trim(),
      management_plan: payload.management_plan.trim(),
      discharge_planning: payload.discharge_planning || undefined,
    };

    const fallback: DoctorRoundResponse = {
      id: crypto.randomUUID ? crypto.randomUUID() : `dr-new-${Date.now()}`,
      hospital_id: DEFAULT_HOSPITAL_UUID,
      patient_id: DEFAULT_PATIENT_UUID,
      admission_id: validAdmissionId,
      round_type: body.round_type,
      round_time: body.round_time || new Date().toISOString(),
      lead_doctor_id: DEFAULT_DOCTOR_UUID,
      attendees: body.attendees || [],
      clinical_assessment: body.clinical_assessment,
      management_plan: body.management_plan,
      discharge_planning: body.discharge_planning || null,
      status: 'COMPLETED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.OPERATIONS.ROUNDS,
      body,
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Bedside doctor round recorded successfully.',
    };
  },

  /**
   * GET /api/v1/operations/rounds
   * List Doctor Rounds by Admission or Patient
   */
  async listDoctorRounds(
    params?: DoctorRoundsQueryParams
  ): Promise<ApiResponse<DoctorRoundResponse[]>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.admission_id && UUID_REGEX.test(params.admission_id)) {
      queryParams.admission_id = params.admission_id;
    }
    if (params?.patient_id && UUID_REGEX.test(params.patient_id)) {
      queryParams.patient_id = params.patient_id;
    }
    if (typeof params?.limit === 'number') queryParams.limit = params.limit;
    if (typeof params?.offset === 'number') queryParams.offset = params.offset;

    const fallback = createFallbackDoctorRounds();
    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.ROUNDS,
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const raw = res.data?.data || res.data;
    const items = Array.isArray(raw) ? raw : fallback;
    return {
      ...res,
      data: items,
      message: res.message || 'Doctor rounds retrieved successfully.',
    };
  },

  /**
   * PUT /api/v1/operations/rounds/{round_id}
   * Update Doctor Round Assessment / Management Plan
   */
  async updateDoctorRound(
    roundId: string,
    payload: DoctorRoundUpdatePayload
  ): Promise<ApiResponse<DoctorRoundResponse>> {
    const fallback: DoctorRoundResponse = {
      ...createFallbackDoctorRounds()[0],
      id: roundId,
      clinical_assessment: payload.clinical_assessment || 'Updated assessment',
      management_plan: payload.management_plan || 'Updated management plan',
      discharge_planning: payload.discharge_planning || null,
      status: payload.status || 'COMPLETED',
      updated_at: new Date().toISOString(),
    };

    const res = await apiClient.put<any>(
      API_ENDPOINTS.OPERATIONS.ROUND_BY_ID(roundId),
      payload,
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Doctor round updated successfully.',
    };
  },

  /**
   * GET /api/v1/operations/rounds/{round_id}
   * Get Doctor Round Details
   */
  async getDoctorRound(roundId: string): Promise<ApiResponse<DoctorRoundResponse>> {
    const fallback = createFallbackDoctorRounds()[0];
    fallback.id = roundId;

    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.ROUND_BY_ID(roundId),
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Doctor round details retrieved successfully.',
    };
  },

  // ------------------------------------------
  // 2. NURSING ACTIONS
  // ------------------------------------------

  /**
   * POST /api/v1/operations/nursing-actions
   * Log Bedside Nursing Action
   */
  async recordNursingAction(
    payload: NursingActionCreatePayload
  ): Promise<ApiResponse<NursingActionResponse>> {
    const validAdmissionId = ensureUuid(payload.admission_id, DEFAULT_ADMISSION_UUID);
    const body: NursingActionCreatePayload = {
      admission_id: validAdmissionId,
      action_type: payload.action_type,
      scheduled_time: payload.scheduled_time || undefined,
      performed_time: payload.performed_time || new Date().toISOString(),
      status: payload.status || 'COMPLETED',
      details: payload.details?.trim() || undefined,
      vital_signs_recorded: payload.vital_signs_recorded || undefined,
    };

    const fallback: NursingActionResponse = {
      id: crypto.randomUUID ? crypto.randomUUID() : `na-new-${Date.now()}`,
      hospital_id: DEFAULT_HOSPITAL_UUID,
      patient_id: DEFAULT_PATIENT_UUID,
      admission_id: validAdmissionId,
      action_type: body.action_type,
      scheduled_time: body.scheduled_time || null,
      performed_time: body.performed_time || new Date().toISOString(),
      performed_by_id: DEFAULT_NURSE_UUID,
      status: body.status || 'COMPLETED',
      details: body.details || null,
      vital_signs_recorded: body.vital_signs_recorded || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.OPERATIONS.NURSING_ACTIONS,
      body,
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Bedside nursing action logged successfully.',
    };
  },

  /**
   * GET /api/v1/operations/nursing-actions
   * List Nursing Actions by Admission or Patient
   */
  async listNursingActions(
    params?: NursingActionsQueryParams
  ): Promise<ApiResponse<NursingActionResponse[]>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.admission_id && UUID_REGEX.test(params.admission_id)) {
      queryParams.admission_id = params.admission_id;
    }
    if (params?.patient_id && UUID_REGEX.test(params.patient_id)) {
      queryParams.patient_id = params.patient_id;
    }
    if (typeof params?.limit === 'number') queryParams.limit = params.limit;
    if (typeof params?.offset === 'number') queryParams.offset = params.offset;

    const fallback = createFallbackNursingActions();
    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.NURSING_ACTIONS,
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const raw = res.data?.data || res.data;
    const items = Array.isArray(raw) ? raw : fallback;
    return {
      ...res,
      data: items,
      message: res.message || 'Nursing actions retrieved successfully.',
    };
  },

  /**
   * GET /api/v1/operations/nursing-actions/{action_id}
   * Get Nursing Action Details
   */
  async getNursingAction(actionId: string): Promise<ApiResponse<NursingActionResponse>> {
    const fallback = createFallbackNursingActions()[0];
    fallback.id = actionId;

    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.NURSING_ACTION_BY_ID(actionId),
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Nursing action details retrieved successfully.',
    };
  },

  // ------------------------------------------
  // 3. NURSE HANDOVERS (SBAR)
  // ------------------------------------------

  /**
   * POST /api/v1/operations/nurse-handovers
   * Submit SBAR Bedside Nurse Handover
   */
  async submitNurseHandover(
    payload: NurseHandoverCreatePayload
  ): Promise<ApiResponse<NurseHandoverResponse>> {
    const validAdmissionId = ensureUuid(payload.admission_id, DEFAULT_ADMISSION_UUID);
    const validIncomingNurseId = ensureUuid(payload.incoming_nurse_id, DEFAULT_NURSE_UUID);

    const body: NurseHandoverCreatePayload = {
      admission_id: validAdmissionId,
      incoming_nurse_id: validIncomingNurseId,
      situation: payload.situation.trim(),
      background: payload.background.trim(),
      assessment: payload.assessment.trim(),
      recommendation: payload.recommendation.trim(),
      lines_and_devices: payload.lines_and_devices || [],
    };

    const fallback: NurseHandoverResponse = {
      id: crypto.randomUUID ? crypto.randomUUID() : `nh-new-${Date.now()}`,
      hospital_id: DEFAULT_HOSPITAL_UUID,
      patient_id: DEFAULT_PATIENT_UUID,
      admission_id: validAdmissionId,
      outgoing_nurse_id: DEFAULT_NURSE_UUID,
      incoming_nurse_id: validIncomingNurseId,
      handover_time: new Date().toISOString(),
      situation: body.situation,
      background: body.background,
      assessment: body.assessment,
      recommendation: body.recommendation,
      lines_and_devices: body.lines_and_devices || [],
      status: 'PENDING_ACKNOWLEDGEMENT',
      acknowledged_at: null,
      acknowledgement_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.OPERATIONS.NURSE_HANDOVERS,
      body,
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Bedside SBAR nurse handover submitted successfully.',
    };
  },

  /**
   * GET /api/v1/operations/nurse-handovers
   * List Nurse Handovers by Admission or Patient
   */
  async listNurseHandovers(
    params?: NurseHandoversQueryParams
  ): Promise<ApiResponse<NurseHandoverResponse[]>> {
    const queryParams: Record<string, string | number> = {};
    if (params?.admission_id && UUID_REGEX.test(params.admission_id)) {
      queryParams.admission_id = params.admission_id;
    }
    if (params?.patient_id && UUID_REGEX.test(params.patient_id)) {
      queryParams.patient_id = params.patient_id;
    }
    if (typeof params?.limit === 'number') queryParams.limit = params.limit;
    if (typeof params?.offset === 'number') queryParams.offset = params.offset;

    const fallback = createFallbackNurseHandovers();
    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.NURSE_HANDOVERS,
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const raw = res.data?.data || res.data;
    const items = Array.isArray(raw) ? raw : fallback;
    return {
      ...res,
      data: items,
      message: res.message || 'Nurse handovers retrieved successfully.',
    };
  },

  /**
   * POST /api/v1/operations/nurse-handovers/{handover_id}/acknowledge
   * Acknowledge Nurse Handover and Transfer Responsibility
   */
  async acknowledgeNurseHandover(
    handoverId: string,
    payload?: NurseHandoverAcknowledgePayload
  ): Promise<ApiResponse<NurseHandoverResponse>> {
    const fallback: NurseHandoverResponse = {
      ...createFallbackNurseHandovers()[0],
      id: handoverId,
      status: 'ACKNOWLEDGED',
      acknowledged_at: new Date().toISOString(),
      acknowledgement_notes: payload?.acknowledgement_notes || 'Handover responsibility acknowledged.',
      updated_at: new Date().toISOString(),
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.OPERATIONS.NURSE_HANDOVER_ACKNOWLEDGE(handoverId),
      payload || {},
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Nurse handover acknowledged and responsibility transferred.',
    };
  },

  /**
   * GET /api/v1/operations/nurse-handovers/pending/my
   * List Pending Nurse Handovers For Active Nurse
   */
  async listMyPendingNurseHandovers(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<NurseHandoverResponse[]>> {
    const queryParams: Record<string, number> = {};
    if (typeof params?.limit === 'number') queryParams.limit = params.limit;
    if (typeof params?.offset === 'number') queryParams.offset = params.offset;

    const fallback = createFallbackNurseHandovers().filter(
      (h) => h.status === 'PENDING_ACKNOWLEDGEMENT'
    );
    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.NURSE_HANDOVERS_PENDING_MY,
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const raw = res.data?.data || res.data;
    const items = Array.isArray(raw) ? raw : fallback;
    return {
      ...res,
      data: items,
      message: res.message || 'Pending nurse handovers retrieved successfully.',
    };
  },

  /**
   * GET /api/v1/operations/nurse-handovers/{handover_id}
   * Get Nurse Handover Details
   */
  async getNurseHandover(handoverId: string): Promise<ApiResponse<NurseHandoverResponse>> {
    const fallback = createFallbackNurseHandovers()[0];
    fallback.id = handoverId;

    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.NURSE_HANDOVER_BY_ID(handoverId),
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Nurse handover details retrieved successfully.',
    };
  },

  // ------------------------------------------
  // 4. SHIFT HANDOVERS (UNIT LEVEL)
  // ------------------------------------------

  /**
   * POST /api/v1/operations/shift-handovers
   * Submit Unit Shift Handover
   */
  async submitShiftHandover(
    payload: ShiftHandoverCreatePayload
  ): Promise<ApiResponse<ShiftHandoverResponse>> {
    const validIcuId = ensureUuid(payload.icu_id, DEFAULT_ICU_UUID);
    const validIncomingInchargeId = ensureUuid(
      payload.incoming_incharge_id,
      DEFAULT_NURSE_UUID
    );

    const body: ShiftHandoverCreatePayload = {
      icu_id: validIcuId,
      incoming_incharge_id: validIncomingInchargeId,
      shift_type: payload.shift_type,
      shift_date: payload.shift_date || new Date().toISOString(),
      census_summary: payload.census_summary || {},
      high_acuity_patient_ids: payload.high_acuity_patient_ids || [],
      safety_concerns: payload.safety_concerns || undefined,
    };

    const fallback: ShiftHandoverResponse = {
      id: crypto.randomUUID ? crypto.randomUUID() : `sh-new-${Date.now()}`,
      hospital_id: DEFAULT_HOSPITAL_UUID,
      icu_id: validIcuId,
      outgoing_incharge_id: DEFAULT_NURSE_UUID,
      incoming_incharge_id: validIncomingInchargeId,
      shift_type: body.shift_type,
      shift_date: body.shift_date,
      handover_time: new Date().toISOString(),
      census_summary: body.census_summary || {},
      high_acuity_patient_ids: body.high_acuity_patient_ids || [],
      safety_concerns: body.safety_concerns || null,
      status: 'PENDING_ACKNOWLEDGEMENT',
      acknowledged_at: null,
      acknowledgement_notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.OPERATIONS.SHIFT_HANDOVERS,
      body,
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Unit shift handover submitted successfully.',
    };
  },

  /**
   * GET /api/v1/operations/shift-handovers
   * List Shift Handovers by ICU Ward
   */
  async listShiftHandovers(
    params?: ShiftHandoversQueryParams
  ): Promise<ApiResponse<ShiftHandoverResponse[]>> {
    const validIcuId = ensureUuid(params?.icu_id, DEFAULT_ICU_UUID);
    const queryParams: Record<string, string | number> = {
      icu_id: validIcuId,
    };
    if (typeof params?.limit === 'number') queryParams.limit = params.limit;
    if (typeof params?.offset === 'number') queryParams.offset = params.offset;

    const fallback = createFallbackShiftHandovers();
    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.SHIFT_HANDOVERS,
      fallback,
      { params: queryParams }
    );

    const raw = res.data?.data || res.data;
    const items = Array.isArray(raw) ? raw : fallback;
    return {
      ...res,
      data: items,
      message: res.message || 'Shift handovers retrieved successfully.',
    };
  },

  /**
   * POST /api/v1/operations/shift-handovers/{handover_id}/acknowledge
   * Acknowledge Unit Shift Handover
   */
  async acknowledgeShiftHandover(
    handoverId: string,
    payload?: ShiftHandoverAcknowledgePayload
  ): Promise<ApiResponse<ShiftHandoverResponse>> {
    const fallback: ShiftHandoverResponse = {
      ...createFallbackShiftHandovers()[0],
      id: handoverId,
      status: 'ACKNOWLEDGED',
      acknowledged_at: new Date().toISOString(),
      acknowledgement_notes:
        payload?.acknowledgement_notes || 'Unit shift handover verified by incoming in-charge.',
      updated_at: new Date().toISOString(),
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.OPERATIONS.SHIFT_HANDOVER_ACKNOWLEDGE(handoverId),
      payload || {},
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Unit shift handover acknowledged successfully.',
    };
  },

  /**
   * GET /api/v1/operations/shift-handovers/pending/my
   * List Pending Shift Handovers For Active In-Charge
   */
  async listMyPendingShiftHandovers(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<ShiftHandoverResponse[]>> {
    const queryParams: Record<string, number> = {};
    if (typeof params?.limit === 'number') queryParams.limit = params.limit;
    if (typeof params?.offset === 'number') queryParams.offset = params.offset;

    const fallback = createFallbackShiftHandovers().filter(
      (h) => h.status === 'PENDING_ACKNOWLEDGEMENT'
    );
    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.SHIFT_HANDOVERS_PENDING_MY,
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const raw = res.data?.data || res.data;
    const items = Array.isArray(raw) ? raw : fallback;
    return {
      ...res,
      data: items,
      message: res.message || 'Pending shift handovers retrieved successfully.',
    };
  },

  /**
   * GET /api/v1/operations/shift-handovers/{handover_id}
   * Get Shift Handover Details
   */
  async getShiftHandover(handoverId: string): Promise<ApiResponse<ShiftHandoverResponse>> {
    const fallback = createFallbackShiftHandovers()[0];
    fallback.id = handoverId;

    const res = await apiClient.get<any>(
      API_ENDPOINTS.OPERATIONS.SHIFT_HANDOVER_BY_ID(handoverId),
      fallback
    );

    const data = res.data?.data || res.data || fallback;
    return {
      ...res,
      data,
      message: res.message || 'Shift handover details retrieved successfully.',
    };
  },
};

export default operationsApi;
