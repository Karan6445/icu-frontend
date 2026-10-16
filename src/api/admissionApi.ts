import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';
import {
  ICUAdmission,
  AdmitPatientPayload,
  DischargePatientPayload,
  CareTeamMember,
  AddCareTeamMemberPayload,
  AdmissionFilterParams,
} from '../types/admission';
import { initialEncountersData } from '../data/hospitalAdminData';

// Normalizer for ICU Admissions
export const normalizeAdmission = (raw: any): ICUAdmission => {
  if (!raw) {
    return {
      id: 'ADM-2026-001',
      patient_id: 'P-1024',
      patient_name: 'Unknown Patient',
      hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
      icu_id: 'MICU-01',
      bed_id: 'B-101',
      bed_number: 'BED-01',
      admitting_diagnosis: 'ICU Admission',
      admission_type: 'EMERGENCY',
      acuity_level: 'CRITICAL',
      status: 'ACTIVE',
      admitted_at: new Date().toISOString(),
    };
  }

  return {
    id: raw.id || raw.admission_id || `ADM-${Date.now().toString().slice(-4)}`,
    patient_id: raw.patient_id || raw.patientId || 'P-1024',
    patient_name: raw.patient_name || raw.patientName || 'Rajesh Sharma',
    patient_mrn: raw.patient_mrn || raw.mrn,
    age: raw.age ? Number(raw.age) : 58,
    gender: raw.gender || 'Male',
    hospital_id: raw.hospital_id || raw.hospitalId || 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospital_name: raw.hospital_name || raw.hospitalName || 'Apollo Super Specialty Hospital',
    icu_id: raw.icu_id || raw.icuId || 'MICU-01',
    icu_name: raw.icu_name || raw.icuName || 'Medical ICU 01',
    bed_id: raw.bed_id || raw.bedId || 'B-101',
    bed_number: raw.bed_number || raw.bedNumber || 'BED-01',
    admitting_doctor_id: raw.admitting_doctor_id || raw.doctorLeadId,
    admitting_doctor_name: raw.admitting_doctor_name || raw.doctorName || 'Dr. Vikram Sethi',
    primary_nurse_id: raw.primary_nurse_id || raw.nurseLeadId,
    primary_nurse_name: raw.primary_nurse_name || raw.nurseName || 'Sunita Rao',
    admitting_diagnosis: raw.admitting_diagnosis || raw.diagnosis || 'Acute Sepsis / Multi-Organ Dysfunction',
    admission_type: raw.admission_type || raw.encounterType || 'EMERGENCY',
    acuity_level: raw.acuity_level || raw.acuity || 'CRITICAL',
    admission_notes: raw.admission_notes || raw.notes,
    status: raw.status === 'Discharged' ? 'DISCHARGED' : (raw.status || 'ACTIVE'),
    admitted_at: raw.admitted_at || raw.encounterDate || raw.created_at || new Date().toISOString(),
    discharged_at: raw.discharged_at || null,
    discharge_disposition: raw.discharge_disposition || null,
    discharge_summary: raw.discharge_summary || null,
    follow_up_instructions: raw.follow_up_instructions || null,
    care_team_count: raw.care_team_count || (Array.isArray(raw.care_team) ? raw.care_team.length : 3),
    created_at: raw.created_at || raw.admitted_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
};

// Initial fallback mock admissions from existing encounter records
const DEFAULT_FALLBACK_ADMISSIONS: ICUAdmission[] = initialEncountersData.map(enc => ({
  id: enc.id,
  patient_id: enc.patientId,
  patient_name: enc.patientName,
  age: enc.age,
  gender: enc.gender,
  hospital_id: enc.hospitalId,
  icu_id: enc.icuId,
  icu_name: enc.icuName,
  bed_id: `BED-${enc.bedNumber}`,
  bed_number: enc.bedNumber,
  admitting_doctor_name: enc.doctorName,
  primary_nurse_name: enc.nurseName,
  admitting_diagnosis: enc.diagnosis,
  admission_type: enc.encounterType === 'Admission' ? 'EMERGENCY' : enc.encounterType.toUpperCase(),
  acuity_level: 'CRITICAL',
  status: enc.status === 'ACTIVE' ? 'ACTIVE' : 'DISCHARGED',
  admitted_at: enc.encounterDate,
  care_team_count: 4,
}));

export const admissionApi = {
  /**
   * POST /api/v1/admissions
   * Admit Patient to ICU Bed
   */
  async admitPatient(payload: AdmitPatientPayload): Promise<ApiResponse<ICUAdmission>> {
    const body = {
      patient_id: payload.patient_id,
      patient_name: payload.patient_name,
      age: payload.age,
      gender: payload.gender,
      bed_id: payload.bed_id,
      bed_number: payload.bed_number,
      icu_id: payload.icu_id,
      hospital_id: payload.hospital_id,
      admitting_diagnosis: payload.admitting_diagnosis,
      admission_type: payload.admission_type || 'EMERGENCY',
      acuity_level: payload.acuity_level || 'CRITICAL',
      admitting_doctor_id: payload.admitting_doctor_id,
      admitting_doctor_name: payload.admitting_doctor_name,
      primary_nurse_id: payload.primary_nurse_id,
      primary_nurse_name: payload.primary_nurse_name,
      admission_notes: payload.admission_notes,
      initial_vitals: payload.initial_vitals,
    };

    const fallback = normalizeAdmission({
      ...body,
      id: `ADM-${Date.now().toString().slice(-4)}`,
      status: 'ACTIVE',
      admitted_at: new Date().toISOString(),
    });

    const res = await apiClient.post<any>(API_ENDPOINTS.ADMISSIONS.BASE, body, fallback);
    const rawData = res.data?.data || res.data;
    const normalized = normalizeAdmission(rawData);

    return {
      data: normalized,
      status: res.status,
      message: res.message || `Patient admitted to bed ${normalized.bed_number} successfully.`,
      timestamp: res.timestamp,
    };
  },

  /**
   * GET /api/v1/admissions/active
   * List Active ICU Admissions
   */
  async listActive(params?: AdmissionFilterParams): Promise<ApiResponse<ICUAdmission[]>> {
    const activeFallbacks = DEFAULT_FALLBACK_ADMISSIONS.filter(a => a.status === 'ACTIVE');

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const sanitizedParams: Record<string, string | number | boolean> = {};
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
          if (k === 'hospital_id' || k === 'icu_id') {
            if (typeof v === 'string' && UUID_REGEX.test(v)) {
              sanitizedParams[k] = v;
            }
          } else {
            sanitizedParams[k] = v as string | number | boolean;
          }
        }
      });
    }

    const res = await apiClient.get<any>(
      API_ENDPOINTS.ADMISSIONS.ACTIVE,
      activeFallbacks,
      Object.keys(sanitizedParams).length > 0 ? { params: sanitizedParams } : undefined
    );

    const rawList = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.items)
      ? res.data.items
      : activeFallbacks;

    const normalized = rawList.map(normalizeAdmission);

    return {
      data: normalized,
      status: res.status,
      message: res.message || 'Active admissions retrieved successfully.',
      timestamp: res.timestamp,
    };
  },

  /**
   * GET /api/v1/admissions/{admission_id}
   * Get Admission Details
   */
  async getDetails(admissionId: string): Promise<ApiResponse<ICUAdmission>> {
    const fallback =
      DEFAULT_FALLBACK_ADMISSIONS.find(a => a.id === admissionId) ||
      DEFAULT_FALLBACK_ADMISSIONS[0];

    const res = await apiClient.get<any>(
      API_ENDPOINTS.ADMISSIONS.DETAILS(admissionId),
      fallback
    );
    const rawData = res.data?.data || res.data;
    const normalized = normalizeAdmission(rawData);

    return {
      data: normalized,
      status: res.status,
      message: res.message || 'Admission details retrieved.',
      timestamp: res.timestamp,
    };
  },

  /**
   * POST /api/v1/admissions/{admission_id}/discharge
   * Formally Discharge Patient and Release Bed
   */
  async dischargePatient(
    admissionId: string,
    payload: DischargePatientPayload
  ): Promise<ApiResponse<ICUAdmission>> {
    const body = {
      discharge_disposition: payload.discharge_disposition,
      discharge_summary: payload.discharge_summary,
      discharge_date: payload.discharge_date || new Date().toISOString(),
      follow_up_instructions: payload.follow_up_instructions,
      release_bed: payload.release_bed ?? true,
    };

    const targetAdmission =
      DEFAULT_FALLBACK_ADMISSIONS.find(a => a.id === admissionId) ||
      DEFAULT_FALLBACK_ADMISSIONS[0];

    const fallback: ICUAdmission = {
      ...targetAdmission,
      status: 'DISCHARGED',
      discharged_at: body.discharge_date,
      discharge_disposition: body.discharge_disposition,
      discharge_summary: body.discharge_summary,
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.ADMISSIONS.DISCHARGE(admissionId),
      body,
      fallback
    );

    const rawData = res.data?.data || res.data;
    const normalized = normalizeAdmission(rawData);

    return {
      data: normalized,
      status: res.status,
      message: res.message || 'Patient discharged and bed released successfully.',
      timestamp: res.timestamp,
    };
  },

  /**
   * GET /api/v1/admissions/{admission_id}/care-team
   * Get Admission Multi-Disciplinary Care Team
   */
  async getCareTeam(admissionId: string): Promise<ApiResponse<CareTeamMember[]>> {
    const fallbackCareTeam: CareTeamMember[] = [
      {
        id: `CTM-101`,
        admission_id: admissionId,
        user_id: 'DOC-101',
        name: 'Dr. Vikram Sethi',
        role: 'PRIMARY_INTENSIVIST',
        specialty: 'Critical Care Medicine',
        phone: '+91 98111 10001',
        is_primary: true,
        status: 'ACTIVE',
        assigned_at: new Date().toISOString(),
      },
      {
        id: `CTM-102`,
        admission_id: admissionId,
        user_id: 'NLEAD-5001',
        name: 'Nurse Lead Sunita Rao',
        role: 'CHARGE_NURSE',
        specialty: 'ICU Clinical Lead',
        phone: '+91 98111 20001',
        is_primary: false,
        status: 'ACTIVE',
        assigned_at: new Date().toISOString(),
      },
      {
        id: `CTM-103`,
        admission_id: admissionId,
        user_id: 'DOC-106',
        name: 'Dr. Kavita Menon',
        role: 'CARDIOLOGIST',
        specialty: 'Cardiothoracic Critical Care',
        phone: '+91 98111 10006',
        is_primary: false,
        status: 'ACTIVE',
        assigned_at: new Date().toISOString(),
      },
      {
        id: `CTM-104`,
        admission_id: admissionId,
        user_id: 'RT-201',
        name: 'Arjun Verma',
        role: 'RESPIRATORY_THERAPIST',
        specialty: 'Mechanical Ventilation Protocol',
        phone: '+91 98111 30001',
        is_primary: false,
        status: 'ACTIVE',
        assigned_at: new Date().toISOString(),
      },
    ];

    const res = await apiClient.get<any>(
      API_ENDPOINTS.ADMISSIONS.CARE_TEAM(admissionId),
      fallbackCareTeam
    );

    const rawList = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.members)
      ? res.data.members
      : fallbackCareTeam;

    const normalized: CareTeamMember[] = rawList.map((m: any, idx: number) => ({
      id: m.id || m.member_id || `CTM-${idx + 1}`,
      admission_id: m.admission_id || admissionId,
      user_id: m.user_id || m.clinician_id || `DOC-${idx}`,
      name: m.name || m.clinician_name || m.doctor_name || 'Clinician',
      role: m.role || m.care_team_role || 'ATTENDING_PHYSICIAN',
      specialty: m.specialty || 'Critical Care',
      phone: m.phone || m.contact,
      email: m.email,
      is_primary: Boolean(m.is_primary ?? m.isPrimary ?? idx === 0),
      status: m.status || 'ACTIVE',
      assigned_at: m.assigned_at || m.assignedAt || new Date().toISOString(),
      notes: m.notes,
    }));

    return {
      data: normalized,
      status: res.status,
      message: res.message || 'Care team members retrieved.',
      timestamp: res.timestamp,
    };
  },

  /**
   * POST /api/v1/admissions/{admission_id}/care-team/members
   * Assign Clinician to Patient Care Team
   */
  async addCareTeamMember(
    admissionId: string,
    payload: AddCareTeamMemberPayload
  ): Promise<ApiResponse<CareTeamMember>> {
    const body = {
      user_id: payload.user_id,
      role: payload.role,
      name: payload.name,
      specialty: payload.specialty,
      phone: payload.phone,
      email: payload.email,
      is_primary: payload.is_primary ?? false,
      notes: payload.notes,
    };

    const fallback: CareTeamMember = {
      id: `CTM-${Date.now().toString().slice(-4)}`,
      admission_id: admissionId,
      user_id: payload.user_id,
      name: payload.name || 'Assigned Clinician',
      role: payload.role,
      specialty: payload.specialty || 'ICU Care Specialist',
      phone: payload.phone,
      email: payload.email,
      is_primary: payload.is_primary ?? false,
      status: 'ACTIVE',
      assigned_at: new Date().toISOString(),
      notes: payload.notes,
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.ADMISSIONS.CARE_TEAM_MEMBERS(admissionId),
      body,
      fallback
    );

    const rawData = res.data?.data || res.data;
    const normalized: CareTeamMember = {
      id: rawData.id || fallback.id,
      admission_id: admissionId,
      user_id: rawData.user_id || payload.user_id,
      name: rawData.name || payload.name || 'Clinician',
      role: rawData.role || payload.role,
      specialty: rawData.specialty || payload.specialty,
      phone: rawData.phone || payload.phone,
      email: rawData.email || payload.email,
      is_primary: Boolean(rawData.is_primary ?? payload.is_primary),
      status: rawData.status || 'ACTIVE',
      assigned_at: rawData.assigned_at || new Date().toISOString(),
      notes: rawData.notes || payload.notes,
    };

    return {
      data: normalized,
      status: res.status,
      message: res.message || 'Clinician assigned to care team successfully.',
      timestamp: res.timestamp,
    };
  },

  /**
   * DELETE /api/v1/admissions/{admission_id}/care-team/members/{member_id}
   * Remove / Deactivate Clinician from Care Team (SUPER_ADMIN / Command Center Only)
   */
  async removeCareTeamMember(
    admissionId: string,
    memberId: string
  ): Promise<ApiResponse<{ success: boolean; member_id: string; message: string }>> {
    const fallback = {
      success: true,
      member_id: memberId,
      message: 'Clinician removed from care team.',
    };

    const res = await apiClient.delete<any>(
      API_ENDPOINTS.ADMISSIONS.CARE_TEAM_MEMBER_SINGLE(admissionId, memberId),
      fallback
    );

    return {
      data: {
        success: res.data?.success ?? true,
        member_id: memberId,
        message: res.data?.message || 'Clinician removed from care team.',
      },
      status: res.status,
      message: res.message || 'Clinician removed from care team.',
      timestamp: res.timestamp,
    };
  },
};

export default admissionApi;
