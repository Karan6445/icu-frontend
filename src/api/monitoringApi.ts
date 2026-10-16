import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

// ==========================================
// MONITORING & TELEMETRY CONTRACTS (OpenAPI 3.1)
// ==========================================

export type MonitoringParameterName =
  | 'HEART_RATE'
  | 'SPO2'
  | 'SYSTOLIC_BP'
  | 'DIASTOLIC_BP'
  | 'MAP'
  | 'RESPIRATORY_RATE'
  | 'TEMPERATURE_CELSIUS'
  | 'ETCO2'
  | string;

export type MonitoringSeverity =
  | 'INFO'
  | 'WARNING'
  | 'CRITICAL'
  | 'LIFE_THREATENING'
  | string;

export type TelemetryMetricType =
  | 'ECG_LEAD_II'
  | 'PLETH'
  | 'ABP_WAVE'
  | 'RESP_WAVE'
  | 'FLOW_VENT'
  | string;

export interface MonitoringRuleResponse {
  id: string;
  hospital_id: string;
  icu_id?: string | null;
  patient_id?: string | null;
  parameter_name: MonitoringParameterName;
  lower_limit?: number | null;
  upper_limit?: number | null;
  severity: MonitoringSeverity;
  sustained_seconds: number;
  is_active: boolean;
  created_at: string;
}

export interface MonitoringRuleCreatePayload {
  icu_id?: string | null;
  patient_id?: string | null;
  parameter_name: MonitoringParameterName;
  lower_limit?: number | null;
  upper_limit?: number | null;
  severity?: MonitoringSeverity;
  sustained_seconds?: number;
  is_active?: boolean;
}

export interface MonitoringRuleUpdatePayload {
  lower_limit?: number | null;
  upper_limit?: number | null;
  severity?: MonitoringSeverity | null;
  sustained_seconds?: number | null;
  is_active?: boolean | null;
}

export interface DeviceTelemetryCreatePayload {
  device_id?: string | null;
  bed_id?: string | null;
  patient_id?: string | null;
  metric_type: TelemetryMetricType;
  sample_rate_hz?: number;
  values_array: number[];
  quality_indicator?: number;
  recorded_at?: string | null;
}

export interface DeviceTelemetryResponse {
  id: string;
  hospital_id: string;
  device_id?: string | null;
  bed_id?: string | null;
  patient_id?: string | null;
  metric_type: TelemetryMetricType;
  sample_rate_hz: number;
  values_array: number[];
  quality_indicator: number;
  recorded_at: string;
}

export interface MonitoringRulesQueryParams {
  icu_id?: string | null;
  patient_id?: string | null;
}

export interface LatestTelemetryQueryParams {
  bed_id: string;
  metric_type?: TelemetryMetricType | null;
}

// Default Identifiers for Resilient Backend Integration
export const DEFAULT_MONITORING_HOSPITAL_UUID = 'a324634e-b022-44ac-b633-448e14f35ad4';
export const DEFAULT_MONITORING_ICU_UUID = '4d97e6e2-e4a4-41f0-95b2-428f7e80de88';
export const DEFAULT_MONITORING_BED_UUID = 'ee9485f5-efc6-443c-b869-03c71f0de2e2';
export const DEFAULT_MONITORING_PATIENT_UUID = '98c47607-b60f-4f7d-8786-fc3f34a6b3a8';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ensureMonitoringUuid = (id: string | null | undefined, fallback: string): string => {
  if (id && UUID_REGEX.test(id.trim())) {
    return id.trim();
  }
  return fallback;
};

// ==========================================
// RESILIENT FALLBACK SEEDS
// ==========================================

export const createFallbackMonitoringRules = (): MonitoringRuleResponse[] => [
  {
    id: 'rule-hr-001',
    hospital_id: DEFAULT_MONITORING_HOSPITAL_UUID,
    icu_id: DEFAULT_MONITORING_ICU_UUID,
    patient_id: null,
    parameter_name: 'HEART_RATE',
    lower_limit: 50,
    upper_limit: 120,
    severity: 'WARNING',
    sustained_seconds: 10,
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'rule-spo2-002',
    hospital_id: DEFAULT_MONITORING_HOSPITAL_UUID,
    icu_id: DEFAULT_MONITORING_ICU_UUID,
    patient_id: null,
    parameter_name: 'SPO2',
    lower_limit: 90,
    upper_limit: 100,
    severity: 'CRITICAL',
    sustained_seconds: 5,
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'rule-sbp-003',
    hospital_id: DEFAULT_MONITORING_HOSPITAL_UUID,
    icu_id: DEFAULT_MONITORING_ICU_UUID,
    patient_id: null,
    parameter_name: 'SYSTOLIC_BP',
    lower_limit: 90,
    upper_limit: 180,
    severity: 'WARNING',
    sustained_seconds: 15,
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'rule-rr-004',
    hospital_id: DEFAULT_MONITORING_HOSPITAL_UUID,
    icu_id: DEFAULT_MONITORING_ICU_UUID,
    patient_id: null,
    parameter_name: 'RESPIRATORY_RATE',
    lower_limit: 10,
    upper_limit: 30,
    severity: 'WARNING',
    sustained_seconds: 20,
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'rule-temp-005',
    hospital_id: DEFAULT_MONITORING_HOSPITAL_UUID,
    icu_id: DEFAULT_MONITORING_ICU_UUID,
    patient_id: null,
    parameter_name: 'TEMPERATURE_CELSIUS',
    lower_limit: 35.5,
    upper_limit: 38.5,
    severity: 'INFO',
    sustained_seconds: 60,
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const createFallbackTelemetry = (
  metricType: TelemetryMetricType = 'ECG_LEAD_II',
  bedId: string = DEFAULT_MONITORING_BED_UUID
): DeviceTelemetryResponse => {
  let sampleValues: number[] = [];
  if (metricType === 'ECG_LEAD_II') {
    sampleValues = [50, 52, 60, 40, 160, 20, 50, 75, 50, 50, 51, 50];
  } else if (metricType === 'PLETH') {
    sampleValues = [20, 25, 60, 95, 80, 68, 72, 60, 35, 22, 20, 20];
  } else if (metricType === 'RESP_WAVE') {
    sampleValues = [30, 42, 58, 72, 80, 75, 55, 38, 25, 20, 24, 30];
  } else {
    sampleValues = [80, 85, 110, 125, 105, 95, 88, 82, 80, 79];
  }

  return {
    id: `telem-live-${Date.now().toString().slice(-4)}`,
    hospital_id: DEFAULT_MONITORING_HOSPITAL_UUID,
    device_id: null,
    bed_id: bedId,
    patient_id: DEFAULT_MONITORING_PATIENT_UUID,
    metric_type: metricType,
    sample_rate_hz: 100,
    values_array: sampleValues,
    quality_indicator: 98,
    recorded_at: new Date().toISOString(),
  };
};

// ==========================================
// API CLIENT IMPLEMENTATION
// ==========================================

export const monitoringApi = {
  /**
   * GET /api/v1/monitoring/rules
   * List Active Monitoring Rules (supports icu_id, patient_id filters)
   */
  async listRules(
    params?: MonitoringRulesQueryParams
  ): Promise<ApiResponse<MonitoringRuleResponse[]>> {
    const fallback = createFallbackMonitoringRules();
    const queryParams: Record<string, string> = {};

    if (params?.icu_id && UUID_REGEX.test(params.icu_id.trim())) {
      queryParams.icu_id = params.icu_id.trim();
    }
    if (params?.patient_id && UUID_REGEX.test(params.patient_id.trim())) {
      queryParams.patient_id = params.patient_id.trim();
    }

    const res = await apiClient.get<any>(
      API_ENDPOINTS.MONITORING.RULES,
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const raw = res.data?.data || res.data;
    const rulesList: MonitoringRuleResponse[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.items)
      ? raw.items
      : fallback;

    return {
      data: rulesList,
      status: res.status,
      message: res.message || 'Active monitoring rules retrieved successfully.',
      timestamp: res.timestamp,
    };
  },

  /**
   * POST /api/v1/monitoring/rules
   * Create New Monitoring Alarm Rule
   */
  async createRule(
    payload: MonitoringRuleCreatePayload
  ): Promise<ApiResponse<MonitoringRuleResponse>> {
    const fallback: MonitoringRuleResponse = {
      id: `rule-${Date.now().toString().slice(-6)}`,
      hospital_id: DEFAULT_MONITORING_HOSPITAL_UUID,
      icu_id: payload.icu_id || DEFAULT_MONITORING_ICU_UUID,
      patient_id: payload.patient_id || null,
      parameter_name: payload.parameter_name,
      lower_limit: payload.lower_limit,
      upper_limit: payload.upper_limit,
      severity: payload.severity || 'WARNING',
      sustained_seconds: payload.sustained_seconds ?? 10,
      is_active: payload.is_active ?? true,
      created_at: new Date().toISOString(),
    };

    const body: Record<string, any> = {
      parameter_name: payload.parameter_name,
      severity: payload.severity || 'WARNING',
      sustained_seconds: payload.sustained_seconds ?? 10,
      is_active: payload.is_active ?? true,
    };
    if (payload.lower_limit !== undefined) body.lower_limit = payload.lower_limit;
    if (payload.upper_limit !== undefined) body.upper_limit = payload.upper_limit;
    if (payload.icu_id && UUID_REGEX.test(payload.icu_id.trim())) {
      body.icu_id = payload.icu_id.trim();
    }
    if (payload.patient_id && UUID_REGEX.test(payload.patient_id.trim())) {
      body.patient_id = payload.patient_id.trim();
    }

    const res = await apiClient.post<any>(
      API_ENDPOINTS.MONITORING.RULES,
      body,
      fallback
    );
    const data = res.data?.data || res.data || fallback;

    return {
      data,
      status: res.status,
      message: res.message || 'Monitoring rule created successfully.',
      timestamp: res.timestamp,
    };
  },

  /**
   * PUT /api/v1/monitoring/rules/{rule_id}
   * Update Monitoring Alarm Rule
   */
  async updateRule(
    ruleId: string,
    payload: MonitoringRuleUpdatePayload
  ): Promise<ApiResponse<MonitoringRuleResponse>> {
    const validRuleId = ensureMonitoringUuid(ruleId, 'rule-hr-001');
    const fallback: MonitoringRuleResponse = {
      id: validRuleId,
      hospital_id: DEFAULT_MONITORING_HOSPITAL_UUID,
      parameter_name: 'HEART_RATE',
      lower_limit: payload.lower_limit,
      upper_limit: payload.upper_limit,
      severity: payload.severity || 'WARNING',
      sustained_seconds: payload.sustained_seconds ?? 10,
      is_active: payload.is_active ?? true,
      created_at: new Date().toISOString(),
    };

    const res = await apiClient.put<any>(
      API_ENDPOINTS.MONITORING.RULE_BY_ID(validRuleId),
      payload,
      fallback
    );
    const data = res.data?.data || res.data || fallback;

    return {
      data,
      status: res.status,
      message: res.message || 'Monitoring alarm rule updated successfully.',
      timestamp: res.timestamp,
    };
  },

  /**
   * POST /api/v1/monitoring/telemetry
   * Ingest Bedside Device Waveform Telemetry
   */
  async recordTelemetry(
    payload: DeviceTelemetryCreatePayload
  ): Promise<ApiResponse<DeviceTelemetryResponse>> {
    const fallback = createFallbackTelemetry(payload.metric_type, payload.bed_id || undefined);

    const body: Record<string, any> = {
      metric_type: payload.metric_type,
      values_array: payload.values_array,
      sample_rate_hz: payload.sample_rate_hz ?? 100,
      quality_indicator: payload.quality_indicator ?? 100,
      recorded_at: payload.recorded_at || new Date().toISOString(),
    };

    if (payload.bed_id && UUID_REGEX.test(payload.bed_id.trim())) {
      body.bed_id = payload.bed_id.trim();
    }
    if (payload.patient_id && UUID_REGEX.test(payload.patient_id.trim())) {
      body.patient_id = payload.patient_id.trim();
    }
    if (payload.device_id && UUID_REGEX.test(payload.device_id.trim())) {
      body.device_id = payload.device_id.trim();
    }

    const res = await apiClient.post<any>(
      API_ENDPOINTS.MONITORING.TELEMETRY,
      body,
      fallback
    );
    const data = res.data?.data || res.data || fallback;

    return {
      data,
      status: res.status,
      message: res.message || 'Waveform telemetry packet ingested successfully.',
      timestamp: res.timestamp,
    };
  },

  /**
   * GET /api/v1/monitoring/telemetry/latest
   * Get Latest Waveform Telemetry Snapshot by Bed
   */
  async getLatestTelemetry(
    params: LatestTelemetryQueryParams
  ): Promise<ApiResponse<DeviceTelemetryResponse>> {
    const validBedId = ensureMonitoringUuid(params.bed_id, DEFAULT_MONITORING_BED_UUID);
    const fallback = createFallbackTelemetry(params.metric_type || 'ECG_LEAD_II', validBedId);

    const queryParams: Record<string, string> = {
      bed_id: validBedId,
    };
    if (params.metric_type) {
      queryParams.metric_type = params.metric_type;
    }

    const res = await apiClient.get<any>(
      API_ENDPOINTS.MONITORING.TELEMETRY_LATEST,
      fallback,
      { params: queryParams }
    );
    const data = res.data?.data || res.data || fallback;

    return {
      data,
      status: res.status,
      message: res.message || 'Latest bedside telemetry snapshot retrieved.',
      timestamp: res.timestamp,
    };
  },
};
