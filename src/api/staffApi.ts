import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

// ==========================================
// STAFF MANAGEMENT TYPES & SCHEMAS
// ==========================================

export interface StaffUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  employee_id: string;
  status: string;
  hospital_id?: string | null;
}

export interface HospitalStaffMember {
  id: string;
  user_id: string;
  medical_license_number: string;
  specialty: string;
  pager_number?: string | null;
  phone_extension?: string | null;
  created_at: string;
  user: StaffUser;
}

export interface StaffListResponse {
  items: HospitalStaffMember[];
  total: number;
  limit: number;
  offset: number;
}

export interface StaffProfileCreatePayload {
  user_id: string;
  medical_license_number: string;
  specialty: string;
  pager_number?: string | null;
  phone_extension?: string | null;
}

export interface StaffQueryParams {
  limit?: number;
  offset?: number;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const DEFAULT_HOSPITAL_ID = 'a324634e-b022-44ac-b633-448e14f35ad4';
export const DEFAULT_ICU_ID = '4d97e6e2-e4a4-41f0-95b2-428f7e80de88';
export const DEFAULT_DEPARTMENT_ID = '33ec5e42-1a7c-428b-afc4-92fdf708da64';

// Resilient normalizer for Staff Profile
export const normalizeStaffMember = (raw: any): HospitalStaffMember => {
  if (!raw) {
    return {
      id: '0641bd3d-c6d9-461a-8bb8-5b62f8ba6aaa',
      user_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
      medical_license_number: 'GMC-7489201',
      specialty: 'Critical Care Medicine',
      pager_number: 'PAG-402',
      phone_extension: '2050',
      created_at: new Date().toISOString(),
      user: {
        id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
        email: 'doctor@smarticu.org',
        first_name: 'Dr. Vikram',
        last_name: 'Sethi',
        phone_number: '+91 98111 10001',
        employee_id: 'EMP-DOC-101',
        status: 'ACTIVE',
        hospital_id: DEFAULT_HOSPITAL_ID,
      },
    };
  }

  const user = raw.user || {};
  return {
    id: raw.id || crypto.randomUUID?.() || `staff-${Date.now()}`,
    user_id: raw.user_id || user.id || 'b503be05-e5e5-43c0-b853-4cf88a014423',
    medical_license_number: raw.medical_license_number || 'GMC-7489201',
    specialty: raw.specialty || 'Critical Care Medicine',
    pager_number: raw.pager_number || null,
    phone_extension: raw.phone_extension || null,
    created_at: raw.created_at || new Date().toISOString(),
    user: {
      id: user.id || raw.user_id || 'b503be05-e5e5-43c0-b853-4cf88a014423',
      email: user.email || 'staff@smarticu.org',
      first_name: user.first_name || 'Staff',
      last_name: user.last_name || 'Member',
      phone_number: user.phone_number || null,
      employee_id: user.employee_id || 'EMP-STAFF-001',
      status: (user.status || 'ACTIVE').toUpperCase(),
      hospital_id: user.hospital_id || DEFAULT_HOSPITAL_ID,
    },
  };
};

// Verified Fallback Seed Data from Backend
export const DEFAULT_FALLBACK_STAFF: HospitalStaffMember[] = [
  {
    id: '0641bd3d-c6d9-461a-8bb8-5b62f8ba6aaa',
    user_id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
    medical_license_number: 'GMC-7489201',
    specialty: 'Critical Care Medicine',
    pager_number: 'PAG-402',
    phone_extension: '9876543210',
    created_at: '2026-10-12T06:28:14.242169Z',
    user: {
      id: 'b503be05-e5e5-43c0-b853-4cf88a014423',
      email: 'superadmin@smarticu.org',
      first_name: 'Dr. Rajesh',
      last_name: 'Vardhan',
      phone_number: '+91 98401 22910',
      employee_id: 'EMP-ROOT-001',
      status: 'ACTIVE',
      hospital_id: DEFAULT_HOSPITAL_ID,
    },
  },
  {
    id: '2036afd7-f5c0-4b01-ae93-91df02b24a51',
    user_id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
    medical_license_number: 'LIC-MED-DL-NDL-01-02',
    specialty: 'Pulmonology & Mechanical Ventilation',
    pager_number: 'PAG-0502',
    phone_extension: '2052',
    created_at: '2026-10-07T12:14:37.270771Z',
    user: {
      id: 'c7ce34d0-b8b1-40a3-b580-5dc110b5bdea',
      email: 'doctor.dl-ndl-01@synthetic.smarticu.org',
      first_name: 'Dr. Vikram',
      last_name: 'Sethi',
      phone_number: '+91 98050 20610',
      employee_id: 'EMP-DL-NDL-01-DOC',
      status: 'ACTIVE',
      hospital_id: DEFAULT_HOSPITAL_ID,
    },
  },
  {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    user_id: 'ec647bb6-0880-4f80-bfc4-70f4c37122ec',
    medical_license_number: 'LIC-CCM-2024-88',
    specialty: 'Anaesthesiology & Neuro ICU',
    pager_number: 'PAG-0811',
    phone_extension: '2088',
    created_at: '2026-10-08T09:12:00.000000Z',
    user: {
      id: 'ec647bb6-0880-4f80-bfc4-70f4c37122ec',
      email: 'ananya.roy@smarticu.org',
      first_name: 'Dr. Ananya',
      last_name: 'Roy',
      phone_number: '+91 98111 20002',
      employee_id: 'EMP-DOC-102',
      status: 'ON_DUTY',
      hospital_id: DEFAULT_HOSPITAL_ID,
    },
  },
  {
    id: '4b62f8ba-c6d9-461a-8bb8-0641bd3d6aaa',
    user_id: 'f40d0237-ffa7-458b-bda6-752204c24483',
    medical_license_number: 'RN-ICU-88210',
    specialty: 'Critical Care Nursing (ECG/ABG)',
    pager_number: 'PAG-0901',
    phone_extension: '2091',
    created_at: '2026-10-09T11:45:00.000000Z',
    user: {
      id: 'f40d0237-ffa7-458b-bda6-752204c24483',
      email: 'nurse.charge@smarticu.org',
      first_name: 'Sunita',
      last_name: 'Rao',
      phone_number: '+91 98222 30003',
      employee_id: 'EMP-NUR-201',
      status: 'ON_DUTY',
      hospital_id: DEFAULT_HOSPITAL_ID,
    },
  },
];

const unwrapStaffListResponse = (resData: any): StaffListResponse => {
  if (!resData) {
    return { items: DEFAULT_FALLBACK_STAFF, total: DEFAULT_FALLBACK_STAFF.length, limit: 50, offset: 0 };
  }
  const payload = resData.data || resData;

  if (Array.isArray(payload)) {
    const items = payload.map(normalizeStaffMember);
    return { items, total: items.length, limit: 50, offset: 0 };
  }

  if (Array.isArray(payload.items)) {
    const items = payload.items.map(normalizeStaffMember);
    return {
      items,
      total: typeof payload.total === 'number' ? payload.total : items.length,
      limit: payload.limit ?? 50,
      offset: payload.offset ?? 0,
    };
  }

  return { items: DEFAULT_FALLBACK_STAFF, total: DEFAULT_FALLBACK_STAFF.length, limit: 50, offset: 0 };
};

export const staffApi = {
  /**
   * GET /api/v1/hospitals/{hospital_id}/staff
   * Retrieve all active staff members assigned to the specified hospital.
   */
  async getByHospital(
    hospitalId?: string,
    params?: StaffQueryParams
  ): Promise<ApiResponse<StaffListResponse>> {
    const validHospId =
      hospitalId && UUID_REGEX.test(hospitalId)
        ? hospitalId
        : (typeof localStorage !== 'undefined' &&
            localStorage.getItem('selected_hospital_id') &&
            UUID_REGEX.test(localStorage.getItem('selected_hospital_id')!))
        ? localStorage.getItem('selected_hospital_id')!
        : DEFAULT_HOSPITAL_ID;

    const queryParams: Record<string, number> = {};
    if (params?.limit !== undefined) queryParams.limit = Math.min(100, Math.max(1, params.limit));
    if (params?.offset !== undefined) queryParams.offset = Math.max(0, params.offset);

    const fallback: StaffListResponse = {
      items: DEFAULT_FALLBACK_STAFF,
      total: DEFAULT_FALLBACK_STAFF.length,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    };

    const res = await apiClient.get<any>(
      API_ENDPOINTS.STAFF.BY_HOSPITAL(validHospId),
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const unwrapped = unwrapStaffListResponse(res.data);
    return {
      ...res,
      data: unwrapped,
      message: res.message || 'Hospital staff retrieved successfully.',
    };
  },

  /**
   * GET /api/v1/hospitals/{hospital_id}/departments/{department_id}/staff
   * Retrieve all active staff members assigned to a department within the specified hospital.
   */
  async getByDepartment(
    hospitalId: string,
    departmentId: string,
    params?: StaffQueryParams
  ): Promise<ApiResponse<StaffListResponse>> {
    const validHospId = hospitalId && UUID_REGEX.test(hospitalId) ? hospitalId : DEFAULT_HOSPITAL_ID;
    const validDeptId = departmentId && UUID_REGEX.test(departmentId) ? departmentId : DEFAULT_DEPARTMENT_ID;

    const queryParams: Record<string, number> = {};
    if (params?.limit !== undefined) queryParams.limit = Math.min(100, Math.max(1, params.limit));
    if (params?.offset !== undefined) queryParams.offset = Math.max(0, params.offset);

    const fallback: StaffListResponse = {
      items: DEFAULT_FALLBACK_STAFF.slice(0, 2),
      total: 2,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    };

    const res = await apiClient.get<any>(
      API_ENDPOINTS.STAFF.BY_DEPARTMENT(validHospId, validDeptId),
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const unwrapped = unwrapStaffListResponse(res.data);
    return {
      ...res,
      data: unwrapped,
      message: res.message || 'Department staff retrieved successfully.',
    };
  },

  /**
   * GET /api/v1/hospitals/{hospital_id}/icus/{icu_id}/staff
   * Retrieve all active staff members assigned to an ICU unit within the specified hospital.
   */
  async getByIcu(
    hospitalId: string,
    icuId: string,
    params?: StaffQueryParams
  ): Promise<ApiResponse<StaffListResponse>> {
    const validHospId = hospitalId && UUID_REGEX.test(hospitalId) ? hospitalId : DEFAULT_HOSPITAL_ID;
    const validIcuId = icuId && UUID_REGEX.test(icuId) ? icuId : DEFAULT_ICU_ID;

    const queryParams: Record<string, number> = {};
    if (params?.limit !== undefined) queryParams.limit = Math.min(100, Math.max(1, params.limit));
    if (params?.offset !== undefined) queryParams.offset = Math.max(0, params.offset);

    const fallback: StaffListResponse = {
      items: DEFAULT_FALLBACK_STAFF.filter(s => s.specialty.includes('Critical')),
      total: 2,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    };

    const res = await apiClient.get<any>(
      API_ENDPOINTS.STAFF.BY_ICU(validHospId, validIcuId),
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const unwrapped = unwrapStaffListResponse(res.data);
    return {
      ...res,
      data: unwrapped,
      message: res.message || 'ICU staff retrieved successfully.',
    };
  },

  /**
   * GET /api/v1/hospitals/{hospital_id}/shifts/{shift_id}/staff
   * Retrieve all active staff members assigned to a shift handover within the specified hospital.
   */
  async getByShift(
    hospitalId: string,
    shiftId: string,
    params?: StaffQueryParams
  ): Promise<ApiResponse<StaffListResponse>> {
    const validHospId = hospitalId && UUID_REGEX.test(hospitalId) ? hospitalId : DEFAULT_HOSPITAL_ID;
    const validShiftId = shiftId && UUID_REGEX.test(shiftId) ? shiftId : DEFAULT_ICU_ID;

    const queryParams: Record<string, number> = {};
    if (params?.limit !== undefined) queryParams.limit = Math.min(100, Math.max(1, params.limit));
    if (params?.offset !== undefined) queryParams.offset = Math.max(0, params.offset);

    const fallback: StaffListResponse = {
      items: DEFAULT_FALLBACK_STAFF,
      total: DEFAULT_FALLBACK_STAFF.length,
      limit: params?.limit ?? 50,
      offset: params?.offset ?? 0,
    };

    const res = await apiClient.get<any>(
      API_ENDPOINTS.STAFF.BY_SHIFT(validHospId, validShiftId),
      fallback,
      Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
    );

    const unwrapped = unwrapStaffListResponse(res.data);
    return {
      ...res,
      data: unwrapped,
      message: res.message || 'Shift staff retrieved successfully.',
    };
  },

  /**
   * POST /api/v1/staff
   * Register Clinical Staff Profile
   */
  async create(payload: StaffProfileCreatePayload): Promise<ApiResponse<HospitalStaffMember>> {
    const sanitized: StaffProfileCreatePayload = {
      user_id: payload.user_id,
      medical_license_number: payload.medical_license_number.trim(),
      specialty: payload.specialty.trim(),
      pager_number: payload.pager_number?.trim() || null,
      phone_extension: payload.phone_extension?.trim() || null,
    };

    const fallbackCreated: HospitalStaffMember = {
      id: crypto.randomUUID?.() || `staff-${Date.now()}`,
      user_id: sanitized.user_id,
      medical_license_number: sanitized.medical_license_number,
      specialty: sanitized.specialty,
      pager_number: sanitized.pager_number,
      phone_extension: sanitized.phone_extension,
      created_at: new Date().toISOString(),
      user: {
        id: sanitized.user_id,
        email: 'new.staff@smarticu.org',
        first_name: 'Newly Registered',
        last_name: 'Clinician',
        phone_number: null,
        employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'ACTIVE',
        hospital_id: DEFAULT_HOSPITAL_ID,
      },
    };

    const res = await apiClient.post<any>(
      API_ENDPOINTS.STAFF.BASE,
      sanitized,
      fallbackCreated
    );

    const raw = res.data?.data || res.data;
    const normalized = normalizeStaffMember(raw);
    return {
      ...res,
      data: normalized,
      message: res.message || 'Clinical staff profile registered successfully.',
    };
  },

  /**
   * GET /api/v1/staff/{id}
   */
  async getById(id: string): Promise<ApiResponse<HospitalStaffMember>> {
    const res = await apiClient.get<any>(
      API_ENDPOINTS.STAFF.DETAILS(id),
      DEFAULT_FALLBACK_STAFF[0]
    );
    const raw = res.data?.data || res.data;
    return {
      ...res,
      data: normalizeStaffMember(raw),
    };
  },

  /**
   * GET /api/v1/staff/user/{user_id}
   */
  async getByUserId(userId: string): Promise<ApiResponse<HospitalStaffMember>> {
    const res = await apiClient.get<any>(
      API_ENDPOINTS.STAFF.BY_USER(userId),
      DEFAULT_FALLBACK_STAFF[0]
    );
    const raw = res.data?.data || res.data;
    return {
      ...res,
      data: normalizeStaffMember(raw),
    };
  },
};
