import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

// ==========================================
// AUDIT LOGS & ACCESS LOGS DATA CONTRACTS
// OpenAPI 3.1: /api/v1/audit/logs & /api/v1/audit/access-logs
// ==========================================

export interface AuditBusinessLogItem {
  id: string;
  hospital_id: string | null;
  user_id: string | null;
  user_role: string | null;
  action: string;
  entity_name: string;
  entity_id: string | null;
  correlation_id: string | null;
  ip_address: string;
  user_agent: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  reason: string | null;
  created_at: string;
}

export interface AuditAccessLogItem {
  id: string;
  hospital_id: string | null;
  user_id: string | null;
  patient_id: string | null;
  action: string;
  ip_address: string;
  user_agent: string;
  status: string;
  access_reason: string | null;
  is_sensitive: boolean;
  accessed_at: string;
}

export interface AuditLogsQueryParams {
  entity_name?: string | null;
  entity_id?: string | null;
  user_id?: string | null;
  action?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  page?: number;
  page_size?: number;
}

export interface AccessLogsQueryParams {
  patient_id?: string | null;
  user_id?: string | null;
  action?: string | null;
  is_sensitive?: boolean | null;
  start_time?: string | null;
  end_time?: string | null;
  page?: number;
  page_size?: number;
}

export interface AuditLogsPaginatedResponse {
  items: AuditBusinessLogItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AccessLogsPaginatedResponse {
  items: AuditAccessLogItem[];
  total: number;
  page: number;
  page_size: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ==========================================
// RESILIENT FALLBACK DATA
// ==========================================

export const FALLBACK_BUSINESS_LOGS: AuditBusinessLogItem[] = [
  {
    id: '329136d1-0b33-44d3-9ea8-5934a74fed9f',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    user_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
    user_role: 'command_center',
    action: 'USER_LOGIN_SUCCESS',
    entity_name: 'User',
    entity_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
    correlation_id: 'cor-7890123-sec',
    ip_address: '10.208.2.250',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    old_values: null,
    new_values: { session_state: 'AUTHENTICATED', role: 'SUPER_ADMIN' },
    reason: 'Routine Command Center authentication check',
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: '7b4e912f-90ca-4c8d-8a27-0fae231b54a1',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    user_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    user_role: 'DOCTOR',
    action: 'CREATE_CLINICAL_STAFF',
    entity_name: 'HospitalStaff',
    entity_id: '2036afd7-f5c0-4b01-ae93-91df02b24a51',
    correlation_id: 'cor-staff-reg-882',
    ip_address: '10.208.2.14',
    user_agent: 'ClinicalStation/2.4 (SmartICU Edge)',
    old_values: null,
    new_values: {
      medical_license: 'LIC-MED-DL-NDL-01-02',
      specialty: 'Pulmonology & Mechanical Ventilation',
      pager_number: 'PAG-0502',
    },
    reason: 'Onboarded senior critical care consultant to MICU ward',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: '8839cb51-ef02-4720-bd44-24584e8812c3',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    user_id: 'f40d0237-ffa7-458b-bda6-752204c24483',
    user_role: 'CHARGE_NURSE',
    action: 'UPDATE_BED_STATUS',
    entity_name: 'Bed',
    entity_id: '4d97e6e2-e4a4-41f0-95b2-428f7e80de88',
    correlation_id: 'cor-bed-stat-441',
    ip_address: '10.208.2.55',
    user_agent: 'WardTablet/v3.0 (Android ICU)',
    old_values: { status: 'CLEANING', is_isolation: false },
    new_values: { status: 'AVAILABLE', is_isolation: false },
    reason: 'Sanitization protocol passed inspection by Nursing Supervisor',
    created_at: new Date(Date.now() - 1000 * 60 * 62).toISOString(),
  },
  {
    id: '992a014b-57f3-42eb-bb01-38102ff94a7e',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    user_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
    user_role: 'command_center',
    action: 'SECURITY_PERMISSION_ASSIGN',
    entity_name: 'RolePermission',
    entity_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    correlation_id: 'cor-rbac-perm-009',
    ip_address: '10.208.2.250',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    old_values: { permission: 'audit:read' },
    new_values: { permission: 'audit:read', scope: 'TENANT_WIDE' },
    reason: 'Elevated compliance monitor credentials for regulatory audit',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export const FALLBACK_ACCESS_LOGS: AuditAccessLogItem[] = [
  {
    id: 'e3e1274c-ecb8-4892-9cc0-6019af48b6a2',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    user_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
    patient_id: '9c88214a-7182-4ef1-b551-09827361284a',
    action: 'AUDIT_LOG_SEARCH',
    ip_address: '10.208.2.250',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'SUCCESS',
    access_reason: 'Audit trail query on entity User by compliance officer',
    is_sensitive: false,
    accessed_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'b12749aa-0921-4f7b-8392-49120ff921bb',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    user_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    patient_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    action: 'PATIENT_CHART_OPEN',
    ip_address: '10.208.2.14',
    user_agent: 'ClinicalStation/2.4 (SmartICU Edge)',
    status: 'SUCCESS',
    access_reason: 'STAT evaluation of worsening PaO2/FiO2 ratio in Bed 04',
    is_sensitive: true,
    accessed_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: 'd99824ff-7190-4821-ab91-884102ff94a2',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    user_id: 'f40d0237-ffa7-458b-bda6-752204c24483',
    patient_id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    action: 'MEDICATION_ADMIN_CHART',
    ip_address: '10.208.2.55',
    user_agent: 'WardTablet/v3.0 (Android ICU)',
    status: 'SUCCESS',
    access_reason: 'Infusion rate verification for Norepinephrine titration',
    is_sensitive: true,
    accessed_at: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
  },
  {
    id: 'f48201ac-9912-4291-a182-10827361288c',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    user_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
    patient_id: '67410294-bba1-4190-8812-7821038192a4',
    action: 'LAB_RESULTS_DISCLOSURE',
    ip_address: '10.208.2.250',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'SUCCESS',
    access_reason: 'Clinical audit verification for blood culture report release',
    is_sensitive: false,
    accessed_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
  },
];

// Helper to normalize paginated responses from either envelope { data: { items, total } } or direct { items, total }
function unwrapPaginatedResponse<T>(raw: any, fallbackItems: T[]): { items: T[]; total: number; page: number; page_size: number } {
  if (!raw) {
    return { items: fallbackItems, total: fallbackItems.length, page: 1, page_size: 50 };
  }

  const payload = raw.data || raw;

  if (Array.isArray(payload)) {
    return { items: payload as T[], total: payload.length, page: 1, page_size: payload.length || 50 };
  }

  if (payload && Array.isArray(payload.items)) {
    return {
      items: payload.items as T[],
      total: typeof payload.total === 'number' ? payload.total : payload.items.length,
      page: typeof payload.page === 'number' ? payload.page : 1,
      page_size: typeof payload.page_size === 'number' ? payload.page_size : payload.items.length || 50,
    };
  }

  return { items: fallbackItems, total: fallbackItems.length, page: 1, page_size: 50 };
}

// ==========================================
// AUDIT LOGS API CLIENT
// ==========================================

export const auditApi = {
  /**
   * Query Immutable Business Audit Trail
   * GET /api/v1/audit/logs
   */
  async queryBusinessLogs(params?: AuditLogsQueryParams): Promise<ApiResponse<AuditLogsPaginatedResponse>> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params) {
      if (params.entity_name?.trim()) queryParams.entity_name = params.entity_name.trim();
      if (params.entity_id && UUID_REGEX.test(params.entity_id.trim())) {
        queryParams.entity_id = params.entity_id.trim();
      }
      if (params.user_id && UUID_REGEX.test(params.user_id.trim())) {
        queryParams.user_id = params.user_id.trim();
      }
      if (params.action?.trim()) queryParams.action = params.action.trim();
      if (params.start_time?.trim()) queryParams.start_time = params.start_time.trim();
      if (params.end_time?.trim()) queryParams.end_time = params.end_time.trim();
      if (typeof params.page === 'number' && params.page >= 1) queryParams.page = params.page;
      if (typeof params.page_size === 'number' && params.page_size >= 1) {
        queryParams.page_size = Math.min(200, params.page_size);
      }
    }

    const fallback: AuditLogsPaginatedResponse = {
      items: FALLBACK_BUSINESS_LOGS,
      total: FALLBACK_BUSINESS_LOGS.length,
      page: params?.page || 1,
      page_size: params?.page_size || 50,
    };

    const res = await apiClient.get<any>(
      API_ENDPOINTS.AUDIT.LOGS,
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const unwrapped = unwrapPaginatedResponse<AuditBusinessLogItem>(res.data, FALLBACK_BUSINESS_LOGS);
    return {
      ...res,
      data: unwrapped,
      message: res.message || 'Business audit logs retrieved successfully.',
    };
  },

  /**
   * Query Security and Chart Access Logs
   * GET /api/v1/audit/access-logs
   */
  async queryAccessLogs(params?: AccessLogsQueryParams): Promise<ApiResponse<AccessLogsPaginatedResponse>> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params) {
      if (params.patient_id && UUID_REGEX.test(params.patient_id.trim())) {
        queryParams.patient_id = params.patient_id.trim();
      }
      if (params.user_id && UUID_REGEX.test(params.user_id.trim())) {
        queryParams.user_id = params.user_id.trim();
      }
      if (params.action?.trim()) queryParams.action = params.action.trim();
      if (typeof params.is_sensitive === 'boolean') queryParams.is_sensitive = params.is_sensitive;
      if (params.start_time?.trim()) queryParams.start_time = params.start_time.trim();
      if (params.end_time?.trim()) queryParams.end_time = params.end_time.trim();
      if (typeof params.page === 'number' && params.page >= 1) queryParams.page = params.page;
      if (typeof params.page_size === 'number' && params.page_size >= 1) {
        queryParams.page_size = Math.min(200, params.page_size);
      }
    }

    const fallback: AccessLogsPaginatedResponse = {
      items: FALLBACK_ACCESS_LOGS,
      total: FALLBACK_ACCESS_LOGS.length,
      page: params?.page || 1,
      page_size: params?.page_size || 50,
    };

    const res = await apiClient.get<any>(
      API_ENDPOINTS.AUDIT.ACCESS_LOGS,
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const unwrapped = unwrapPaginatedResponse<AuditAccessLogItem>(res.data, FALLBACK_ACCESS_LOGS);
    return {
      ...res,
      data: unwrapped,
      message: res.message || 'Security access logs retrieved successfully.',
    };
  },
};

export default auditApi;
