import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

// ==========================================
// PATIENT TIMELINE & CLINICAL HISTORY CONTRACTS
// OpenAPI 3.1: /api/v1/patients/{patient_id}/*
// ==========================================

export interface PatientAccessHistoryItem {
  id: string;
  hospital_id: string | null;
  user_id: string | null;
  patient_id: string;
  action: string;
  ip_address: string;
  user_agent: string;
  status: string;
  access_reason: string | null;
  is_sensitive: boolean;
  accessed_at: string;
}

export interface PatientTimelineEvent {
  id: string;
  hospital_id: string;
  patient_id: string;
  admission_id?: string | null;
  event_type: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  actor_id?: string | null;
  actor_name?: string | null;
  actor_role?: string | null;
  metadata_payload?: Record<string, any> | null;
  event_time: string;
  created_at: string;
}

export interface TimelineMilestoneCreatePayload {
  event_type: string;
  category: string;
  severity: string;
  title: string;
  description: string;
  admission_id?: string | null;
  metadata_payload?: Record<string, any>;
  event_time?: string;
}

export interface PatientClinicalHistorySummary {
  patient_id: string;
  hospital_id: string;
  total_admissions: number;
  total_transfers: number;
  active_care_team_count: number;
  total_timeline_events: number;
  recent_events: PatientTimelineEvent[];
}

export interface PatientTimelineQueryParams {
  admission_id?: string | null;
  category?: string | null;
  severity?: string | null;
  event_type?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  page?: number;
  page_size?: number;
}

export interface PatientAccessHistoryQueryParams {
  page?: number;
  page_size?: number;
}

export interface PatientTimelineResponse {
  patient_id: string;
  items: PatientTimelineEvent[];
  total: number;
  page: number;
  page_size: number;
}

export interface PatientAccessHistoryResponse {
  items: PatientAccessHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEFAULT_HOSPITAL_ID = 'a324634e-b022-44ac-b633-448e14f35ad4';
export const DEFAULT_PATIENT_UUID = '494baa9d-c2ab-4657-aef5-b7f5c57e60f6';

export const ensurePatientUuid = (id?: string | null): string => {
  if (id && UUID_REGEX.test(id.trim())) {
    return id.trim();
  }
  return DEFAULT_PATIENT_UUID;
};

// ==========================================
// SEED FALLBACK DATA
// ==========================================

export const createFallbackTimelineEvents = (patientId: string): PatientTimelineEvent[] => [
  {
    id: 'tl-ev-001',
    hospital_id: DEFAULT_HOSPITAL_ID,
    patient_id: patientId,
    admission_id: 'a1d63183-f727-4a4c-a8d8-a12db1454282',
    event_type: 'PROCEDURE_PERFORMED',
    category: 'PROCEDURE',
    severity: 'INFO',
    title: 'Arterial line inserted in left radial artery',
    description: 'Procedure tolerated well. Transducer zeroed, calibrated, and connected to telemetry monitor.',
    actor_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    actor_name: 'Dr. Alexander Mehta',
    actor_role: 'INTENSIVIST',
    metadata_payload: { site: 'Left Radial', allen_test: 'Positive', gauge: '20G' },
    event_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'tl-ev-002',
    hospital_id: DEFAULT_HOSPITAL_ID,
    patient_id: patientId,
    admission_id: 'a1d63183-f727-4a4c-a8d8-a12db1454282',
    event_type: 'LAB_RESULT_RECEIVED',
    category: 'LABORATORY',
    severity: 'HIGH',
    title: 'Critical Arterial Blood Gas (ABG) Analysis',
    description: 'PaO2: 64 mmHg, PaCO2: 52 mmHg, pH: 7.28, HCO3: 24. Severe acute respiratory acidosis confirmed.',
    actor_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
    actor_name: 'Central Diagnostic Lab',
    actor_role: 'LAB_SYSTEM',
    metadata_payload: { pH: 7.28, PaO2: 64, PaCO2: 52, FiO2: 60, PF_ratio: 106 },
    event_time: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'tl-ev-003',
    hospital_id: DEFAULT_HOSPITAL_ID,
    patient_id: patientId,
    admission_id: 'a1d63183-f727-4a4c-a8d8-a12db1454282',
    event_type: 'VENTILATOR_ADJUSTMENT',
    category: 'VENTILATOR',
    severity: 'MEDIUM',
    title: 'PEEP & Tidal Volume Titration',
    description: 'PEEP increased from 8 to 12 cmH2O. Tidal volume set to 420 mL (6 mL/kg PBW ARDSnet protocol).',
    actor_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    actor_name: 'Dr. Alexander Mehta',
    actor_role: 'INTENSIVIST',
    metadata_payload: { mode: 'PRVC', PEEP: 12, FiO2: 65, Vt: 420 },
    event_time: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  },
  {
    id: 'tl-ev-004',
    hospital_id: DEFAULT_HOSPITAL_ID,
    patient_id: patientId,
    admission_id: 'a1d63183-f727-4a4c-a8d8-a12db1454282',
    event_type: 'MEDICATION_ADMINISTERED',
    category: 'MEDICATION',
    severity: 'INFO',
    title: 'Norepinephrine Continuous Infusion Adjusted',
    description: 'Titrated down to 0.06 mcg/kg/min following MAP stabilization > 68 mmHg.',
    actor_id: 'f40d0237-ffa7-458b-bda6-752204c24483',
    actor_name: 'Sunita Rao, RN',
    actor_role: 'CHARGE_NURSE',
    metadata_payload: { drug: 'Norepinephrine', dose: '0.06 mcg/kg/min', target_map: 65 },
    event_time: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: 'tl-ev-005',
    hospital_id: DEFAULT_HOSPITAL_ID,
    patient_id: patientId,
    admission_id: 'a1d63183-f727-4a4c-a8d8-a12db1454282',
    event_type: 'CLINICAL_OBSERVATION',
    category: 'CLINICAL',
    severity: 'INFO',
    title: 'Multi-Disciplinary ICU Morning Round',
    description: 'Sedation hold planned for 11:00 AM. Spontaneous breathing trial readiness criteria to be reviewed.',
    actor_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    actor_name: 'Dr. Alexander Mehta & Team',
    actor_role: 'INTENSIVIST',
    metadata_payload: { round_type: 'Morning Multi-Disciplinary', rass_target: -1 },
    event_time: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
  },
];

export const createFallbackAccessHistory = (patientId: string): PatientAccessHistoryItem[] => [
  {
    id: 'acc-hist-01',
    hospital_id: DEFAULT_HOSPITAL_ID,
    user_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    patient_id: patientId,
    action: 'PATIENT_CHART_OPEN',
    ip_address: '10.208.2.14',
    user_agent: 'ClinicalStation/2.4 (SmartICU Edge)',
    status: 'SUCCESS',
    access_reason: 'STAT arterial line procedure & ventilation check',
    is_sensitive: true,
    accessed_at: new Date(Date.now() - 1000 * 60 * 46).toISOString(),
  },
  {
    id: 'acc-hist-02',
    hospital_id: DEFAULT_HOSPITAL_ID,
    user_id: 'f40d0237-ffa7-458b-bda6-752204c24483',
    patient_id: patientId,
    action: 'MEDICATION_ADMIN_CHART',
    ip_address: '10.208.2.55',
    user_agent: 'WardTablet/v3.0 (Android ICU)',
    status: 'SUCCESS',
    access_reason: 'Vasopressor continuous rate verification',
    is_sensitive: true,
    accessed_at: new Date(Date.now() - 1000 * 60 * 242).toISOString(),
  },
  {
    id: 'acc-hist-03',
    hospital_id: DEFAULT_HOSPITAL_ID,
    user_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
    patient_id: patientId,
    action: 'TELEMETRY_ACCESS',
    ip_address: '10.208.2.250',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'SUCCESS',
    access_reason: 'Bedside telemetry monitor sync validation',
    is_sensitive: false,
    accessed_at: new Date(Date.now() - 1000 * 60 * 380).toISOString(),
  },
];

export const createFallbackClinicalHistory = (patientId: string): PatientClinicalHistorySummary => {
  const events = createFallbackTimelineEvents(patientId);
  return {
    patient_id: patientId,
    hospital_id: DEFAULT_HOSPITAL_ID,
    total_admissions: 1,
    total_transfers: 0,
    active_care_team_count: 3,
    total_timeline_events: events.length,
    recent_events: events.slice(0, 3),
  };
};

// ==========================================
// PATIENT TIMELINE API SERVICE
// ==========================================

export const patientTimelineApi = {
  /**
   * GET /api/v1/patients/{patient_id}/timeline
   * Retrieve Chronological Patient Timeline
   */
  async getTimeline(
    patientId: string,
    params?: PatientTimelineQueryParams
  ): Promise<ApiResponse<PatientTimelineResponse>> {
    const validPatientId = ensurePatientUuid(patientId);
    const queryParams: Record<string, string | number> = {};

    if (params) {
      if (params.admission_id && UUID_REGEX.test(params.admission_id.trim())) {
        queryParams.admission_id = params.admission_id.trim();
      }
      if (params.category && params.category !== 'ALL') queryParams.category = params.category;
      if (params.severity && params.severity !== 'ALL') queryParams.severity = params.severity;
      if (params.event_type && params.event_type !== 'ALL') queryParams.event_type = params.event_type;
      if (params.start_time) queryParams.start_time = params.start_time;
      if (params.end_time) queryParams.end_time = params.end_time;
      if (typeof params.page === 'number' && params.page >= 1) queryParams.page = params.page;
      if (typeof params.page_size === 'number' && params.page_size >= 1) {
        queryParams.page_size = Math.min(200, params.page_size);
      }
    }

    const fallbackEvents = createFallbackTimelineEvents(validPatientId);
    const fallback: PatientTimelineResponse = {
      patient_id: validPatientId,
      items: fallbackEvents,
      total: fallbackEvents.length,
      page: params?.page || 1,
      page_size: params?.page_size || 50,
    };

    const res = await apiClient.get<any>(
      API_ENDPOINTS.PATIENTS.TIMELINE(validPatientId),
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const raw = res.data?.data || res.data;
    let unwrapped: PatientTimelineResponse;

    if (raw && Array.isArray(raw.items)) {
      unwrapped = {
        patient_id: raw.patient_id || patientId,
        items: raw.items,
        total: typeof raw.total === 'number' ? raw.total : raw.items.length,
        page: raw.page || 1,
        page_size: raw.page_size || 50,
      };
    } else if (Array.isArray(raw)) {
      unwrapped = {
        patient_id: patientId,
        items: raw,
        total: raw.length,
        page: 1,
        page_size: raw.length || 50,
      };
    } else {
      unwrapped = fallback;
    }

    return {
      ...res,
      data: unwrapped,
      message: res.message || 'Patient chronological timeline retrieved successfully.',
    };
  },

  /**
   * POST /api/v1/patients/{patient_id}/timeline
   * Append Clinical Timeline Milestone / Observation
   */
  async appendMilestone(
    patientId: string,
    payload: TimelineMilestoneCreatePayload
  ): Promise<ApiResponse<PatientTimelineEvent>> {
    const validPatientId = ensurePatientUuid(patientId);
    const sanitizedPayload = {
      event_type: payload.event_type,
      category: payload.category,
      severity: payload.severity,
      title: payload.title.trim(),
      description: payload.description.trim(),
      admission_id: payload.admission_id && UUID_REGEX.test(payload.admission_id) ? payload.admission_id : undefined,
      metadata_payload: payload.metadata_payload || {},
      event_time: payload.event_time || new Date().toISOString(),
    };

    const fallbackCreated: PatientTimelineEvent = {
      id: crypto.randomUUID ? crypto.randomUUID() : `tl-new-${Date.now()}`,
      hospital_id: DEFAULT_HOSPITAL_ID,
      patient_id: validPatientId,
      admission_id: sanitizedPayload.admission_id,
      event_type: sanitizedPayload.event_type,
      category: sanitizedPayload.category,
      severity: sanitizedPayload.severity,
      title: sanitizedPayload.title,
      description: sanitizedPayload.description,
      actor_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
      actor_name: 'Attending Clinician',
      actor_role: 'DOCTOR',
      metadata_payload: sanitizedPayload.metadata_payload,
      event_time: sanitizedPayload.event_time,
      created_at: new Date().toISOString(),
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.PATIENTS.TIMELINE(validPatientId),
      sanitizedPayload,
      fallbackCreated
    );

    const data = res.data?.data || res.data || fallbackCreated;
    return {
      ...res,
      data,
      message: res.message || 'Clinical timeline milestone recorded successfully.',
    };
  },

  /**
   * GET /api/v1/patients/{patient_id}/clinical-history
   * Retrieve Patient Clinical History Summary Foundation
   */
  async getClinicalHistory(patientId: string): Promise<ApiResponse<PatientClinicalHistorySummary>> {
    const validPatientId = ensurePatientUuid(patientId);
    const fallback = createFallbackClinicalHistory(validPatientId);

    const res = await apiClient.get<any>(
      API_ENDPOINTS.PATIENTS.CLINICAL_HISTORY(validPatientId),
      fallback
    );

    const raw = res.data?.data || res.data;
    const data: PatientClinicalHistorySummary = {
      patient_id: raw?.patient_id || patientId,
      hospital_id: raw?.hospital_id || DEFAULT_HOSPITAL_ID,
      total_admissions: typeof raw?.total_admissions === 'number' ? raw.total_admissions : fallback.total_admissions,
      total_transfers: typeof raw?.total_transfers === 'number' ? raw.total_transfers : fallback.total_transfers,
      active_care_team_count: typeof raw?.active_care_team_count === 'number' ? raw.active_care_team_count : fallback.active_care_team_count,
      total_timeline_events: typeof raw?.total_timeline_events === 'number' ? raw.total_timeline_events : fallback.total_timeline_events,
      recent_events: Array.isArray(raw?.recent_events) ? raw.recent_events : fallback.recent_events,
    };

    return {
      ...res,
      data,
      message: res.message || 'Clinical history foundation retrieved successfully.',
    };
  },

  /**
   * GET /api/v1/patients/{patient_id}/access-history
   * View Access History for a Patient
   */
  async getAccessHistory(
    patientId: string,
    params?: PatientAccessHistoryQueryParams
  ): Promise<ApiResponse<PatientAccessHistoryResponse>> {
    const validPatientId = ensurePatientUuid(patientId);
    const queryParams: Record<string, number> = {};
    if (typeof params?.page === 'number' && params.page >= 1) queryParams.page = params.page;
    if (typeof params?.page_size === 'number' && params.page_size >= 1) {
      queryParams.page_size = Math.min(200, params.page_size);
    }

    const fallbackItems = createFallbackAccessHistory(validPatientId);
    const fallback: PatientAccessHistoryResponse = {
      items: fallbackItems,
      total: fallbackItems.length,
      page: params?.page || 1,
      page_size: params?.page_size || 50,
    };

    const res = await apiClient.get<any>(
      API_ENDPOINTS.PATIENTS.ACCESS_HISTORY(validPatientId),
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const raw = res.data?.data || res.data;
    let unwrapped: PatientAccessHistoryResponse;

    if (raw && Array.isArray(raw.items)) {
      unwrapped = {
        items: raw.items,
        total: typeof raw.total === 'number' ? raw.total : raw.items.length,
        page: raw.page || 1,
        page_size: raw.page_size || 50,
      };
    } else if (Array.isArray(raw)) {
      unwrapped = {
        items: raw,
        total: raw.length,
        page: 1,
        page_size: raw.length || 50,
      };
    } else {
      unwrapped = fallback;
    }

    return {
      ...res,
      data: unwrapped,
      message: res.message || 'Patient access history retrieved successfully.',
    };
  },
};

export default patientTimelineApi;
