import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';
import { Patient } from '../types/icu';

// ==========================================
// TYPE DEFINITIONS FOR PATIENTS & DEMOGRAPHICS
// ==========================================

export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER' | 'UNKNOWN';

export type BloodGroup =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'
  | 'UNKNOWN';

export type PatientStatus = 'ACTIVE' | 'INACTIVE' | 'DECEASED';

export interface PatientCreate {
  mrn: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth: string; // YYYY-MM-DD
  gender: PatientGender;
  blood_group?: BloodGroup;
  national_id?: string | null;
  allergies?: Array<Record<string, any>>;
  chronic_conditions?: Array<Record<string, any>>;
  primary_phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
}

export interface PatientUpdate {
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  national_id?: string | null;
  gender?: PatientGender | null;
  blood_group?: BloodGroup | null;
  allergies?: Array<Record<string, any>> | null;
  chronic_conditions?: Array<Record<string, any>> | null;
  primary_phone?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  emergency_contact_relation?: string | null;
  status?: PatientStatus | null;
}

export interface PatientResponse {
  id: string;
  hospital_id: string;
  mrn: string;
  national_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  allergies: Array<Record<string, any>>;
  chronic_conditions: Array<Record<string, any>>;
  primary_phone: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  qr_token?: string | null;
}

export interface PatientDetailResponse extends PatientResponse {
  active_admission?: any | null;
  admissions_count?: number;
}

export interface PatientQRResponse {
  id: string;
  hospital_id: string;
  patient_id: string;
  qr_token: string;
  is_active: boolean;
  issued_at: string;
  last_scanned_at?: string | null;
  last_scanned_by?: string | null;
}

export interface PatientQRScanResponse {
  patient: PatientResponse;
  qr_token: string;
  is_active: boolean;
  last_scanned_at: string;
  active_admission?: any | null;
}

export interface PatientQueryParams {
  search?: string;
  status?: string;
  hospital_id?: string;
  skip?: number;
  limit?: number;
}

// ==========================================
// PATIENT API SERVICE
// ==========================================

export const patientApi = {
  /**
   * GET /api/v1/patients
   * List / Search Patients
   */
  async list(params?: PatientQueryParams): Promise<ApiResponse<PatientResponse[]>> {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sanitizedParams: Record<string, string | number | boolean> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
          if (k === 'hospital_id') {
            if (typeof v === 'string' && UUID_REGEX.test(v)) {
              sanitizedParams[k] = v;
            }
          } else {
            sanitizedParams[k] = v as string | number | boolean;
          }
        }
      });
    }
    const config = Object.keys(sanitizedParams).length > 0 ? { params: sanitizedParams } : undefined;
    const res = await apiClient.get<any>(API_ENDPOINTS.PATIENTS.BASE, [], config);
    // Unwrap standard envelope if present
    const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
    return {
      ...res,
      data,
    };
  },

  /**
   * GET /api/v1/patients/{patient_id}
   * Get Patient Details
   */
  async getById(patientId: string): Promise<ApiResponse<PatientDetailResponse>> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PATIENTS.DETAILS(patientId));
    const data = res.data?.data || res.data;
    return {
      ...res,
      data,
    };
  },

  /**
   * POST /api/v1/patients
   * Register New Patient
   */
  async create(payload: PatientCreate, hospitalId?: string): Promise<ApiResponse<PatientResponse>> {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validHospId = hospitalId && UUID_REGEX.test(hospitalId) ? hospitalId : (hospitalId ? 'a324634e-b022-44ac-b633-448e14f35ad4' : undefined);
    const config = validHospId ? { params: { hospital_id: validHospId } } : undefined;
    const res = await apiClient.post<any>(API_ENDPOINTS.PATIENTS.BASE, payload, undefined, config);
    const data = res.data?.data || res.data;
    return {
      ...res,
      data,
    };
  },

  /**
   * PUT /api/v1/patients/{patient_id}
   * Update Patient Demographics
   */
  async update(patientId: string, payload: PatientUpdate): Promise<ApiResponse<PatientResponse>> {
    const res = await apiClient.put<any>(API_ENDPOINTS.PATIENTS.UPDATE(patientId), payload);
    const data = res.data?.data || res.data;
    return {
      ...res,
      data,
    };
  },

  /**
   * DELETE /api/v1/patients/{patient_id}
   * Soft Delete Patient (SUPER_ADMIN / Command Center Only)
   */
  async delete(patientId: string, reason?: string): Promise<ApiResponse<void>> {
    const config = reason ? { params: { reason } } : undefined;
    const res = await apiClient.delete<any>(API_ENDPOINTS.PATIENTS.DELETE(patientId), undefined, config);
    return {
      ...res,
      data: undefined as unknown as void,
    };
  },

  /**
   * GET /api/v1/patients/qr/{token}
   * Resolve Patient via Bedside Wristband QR Token
   */
  async resolveQR(token: string): Promise<ApiResponse<PatientQRScanResponse>> {
    const res = await apiClient.get<any>(API_ENDPOINTS.PATIENTS.QR_RESOLVE(token));
    const data = res.data?.data || res.data;
    return {
      ...res,
      data,
    };
  },

  /**
   * POST /api/v1/patients/{patient_id}/qr/regenerate
   * Regenerate Patient Cryptographic QR Wristband
   */
  async regenerateQR(patientId: string): Promise<ApiResponse<PatientQRResponse>> {
    const res = await apiClient.post<any>(API_ENDPOINTS.PATIENTS.QR_REGENERATE(patientId), {});
    const data = res.data?.data || res.data;
    return {
      ...res,
      data,
    };
  },

  // ==========================================
  // BACKWARD-COMPATIBILITY HELPERS
  // ==========================================
  async getPatients(mockPatients?: Patient[]): Promise<ApiResponse<Patient[]>> {
    return apiClient.get(API_ENDPOINTS.PATIENTS.BASE, mockPatients || []);
  },

  async getPatientById(id: string, mockPatient?: Patient): Promise<ApiResponse<Patient | undefined>> {
    return apiClient.get(API_ENDPOINTS.PATIENTS.DETAILS(id), mockPatient);
  },

  async updateVitals(patientId: string, vitalsData: any): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put(API_ENDPOINTS.PATIENTS.VITALS(patientId), vitalsData, { success: true });
  },
};

export default patientApi;
