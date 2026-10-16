import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

export interface DepartmentCreate {
  hospital_id: string;
  code: string;
  name: string;
  head_of_department_id?: string | null;
}

export interface DepartmentResponse {
  id: string;
  hospital_id: string;
  code: string;
  name: string;
  head_of_department_id?: string | null;
  is_active: boolean;
  created_at: string;
}

export const FALLBACK_DEPARTMENTS: DepartmentResponse[] = [
  {
    id: '33ec5e42-1a7c-428b-afc4-92fdf708da64',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    code: 'DEPT-CRIT-CARE',
    name: 'Department of Critical Care Medicine',
    head_of_department_id: null,
    is_active: true,
    created_at: '2026-09-29T08:46:35.584300Z',
  },
  {
    id: 'e28a0112-9c12-4211-85b4-d1912a781b21',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    code: 'DEPT-PULM',
    name: 'Department of Pulmonology & Respiratory ICU',
    head_of_department_id: null,
    is_active: true,
    created_at: '2026-10-01T10:15:20.100000Z',
  },
  {
    id: 'f91b7234-8d43-4109-91ce-b81893c72a88',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    code: 'DEPT-CARD',
    name: 'Department of Cardiology & Coronary Care',
    head_of_department_id: null,
    is_active: true,
    created_at: '2026-10-02T14:22:11.200000Z',
  },
  {
    id: '71a28109-1f22-4919-b5a7-91a82c610992',
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    code: 'DEPT-NEURO',
    name: 'Department of Neuro-Intensive Care',
    head_of_department_id: null,
    is_active: true,
    created_at: '2026-10-03T09:30:00.000000Z',
  },
];

// In-memory simulation cache for created departments
const simulatedDepartments: DepartmentResponse[] = [...FALLBACK_DEPARTMENTS];

function extractData<T>(res: any): T {
  if (res && typeof res === 'object' && 'data' in res && res.success !== undefined) {
    return res.data;
  }
  return res as T;
}

export const departmentApi = {
  /**
   * GET /api/v1/departments?hospital_id=...
   * List Clinical Departments in Hospital
   */
  async list(hospital_id?: string): Promise<ApiResponse<DepartmentResponse[]>> {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validHospId = hospital_id && UUID_REGEX.test(hospital_id) ? hospital_id : 'a324634e-b022-44ac-b633-448e14f35ad4';
    try {
      const res = await apiClient.get<any>(API_ENDPOINTS.DEPARTMENTS.BASE, undefined, {
        params: { hospital_id: validHospId },
      });
      const raw = res.data;
      const listData = Array.isArray(raw) ? raw : (raw?.data || raw?.items || []);

      if (Array.isArray(listData)) {
        return {
          data: listData,
          status: res.status,
          message: raw?.message || 'Departments retrieved successfully',
          timestamp: res.timestamp,
        };
      }

      const filtered = simulatedDepartments.filter((d) => d.hospital_id === hospital_id);
      return {
        data: filtered.length > 0 ? filtered : FALLBACK_DEPARTMENTS,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn('[departmentApi.list] Network or API error, falling back to simulated departments:', err?.message || err);
      const filtered = simulatedDepartments.filter((d) => d.hospital_id === hospital_id);
      return {
        data: filtered.length > 0 ? filtered : FALLBACK_DEPARTMENTS,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * POST /api/v1/departments
   * Create Clinical Department
   */
  async create(payload: DepartmentCreate): Promise<ApiResponse<DepartmentResponse>> {
    try {
      const res = await apiClient.post<any>(API_ENDPOINTS.DEPARTMENTS.BASE, payload);
      const data: DepartmentResponse = extractData(res.data);
      if (data && data.id) {
        simulatedDepartments.unshift(data);
      }
      return {
        data,
        status: res.status,
        message: res.data?.message || 'Clinical department created successfully.',
        timestamp: res.timestamp,
      };
    } catch (err: any) {
      console.warn('[departmentApi.create] Network or API error, falling back to local simulation:', err?.message || err);
      const simulatedDept: DepartmentResponse = {
        id: `dept-${Math.random().toString(36).substring(2, 9)}`,
        hospital_id: payload.hospital_id,
        code: payload.code.toUpperCase(),
        name: payload.name,
        head_of_department_id: payload.head_of_department_id || null,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      simulatedDepartments.unshift(simulatedDept);
      return {
        data: simulatedDept,
        status: 201,
        message: 'Clinical department created successfully (simulated offline).',
        timestamp: new Date().toISOString(),
      };
    }
  },
};

export default departmentApi;
