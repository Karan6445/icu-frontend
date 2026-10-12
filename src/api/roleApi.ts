import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';
import {
  permissionApi,
  FALLBACK_PERMISSIONS_LIST,
  FALLBACK_PERMISSIONS_MATRIX,
  PermissionResponse,
  ResourcePermissionOptions,
  ResourcePermissionsSummary,
} from './permissionApi';

export type { PermissionResponse, ResourcePermissionOptions, ResourcePermissionsSummary };

export interface RoleResponse {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  is_system_role: boolean;
  hospital_id?: string | null;
  permissions: PermissionResponse[];
}

export interface RoleCreatePayload {
  code: string;
  name: string;
  description?: string | null;
  hospital_id?: string | null;
  permission_codes?: string[];
}

export interface RoleUpdatePayload {
  name?: string | null;
  description?: string | null;
  permission_codes?: string[] | null;
}

export interface RoleListParams {
  hospital_id?: string;
}

// ----------------------------------------------------
// Default Seed Permissions & Roles for Offline Fallback
// ----------------------------------------------------

// ----------------------------------------------------
// Canonical Permission Normalization Helpers
// ----------------------------------------------------

export const PERMISSION_MODULE_ALIASES: Record<string, string> = {
  patients: 'patient',
  patient: 'patient',
  beds: 'bed',
  bed: 'bed',
  doctors: 'staff',
  doctor: 'staff',
  nurses: 'staff',
  nurse: 'staff',
  staff: 'staff',
  reports: 'audit',
  report: 'audit',
  audit: 'audit',
  audits: 'audit',
  settings: 'hospital',
  setting: 'hospital',
  hospital: 'hospital',
  users: 'user',
  user: 'user',
  roles: 'role',
  role: 'role',
  icus: 'icu',
  icu: 'icu',
  departments: 'department',
  department: 'department',
  admissions: 'admission',
  admission: 'admission',
  orders: 'order',
  order: 'order',
  clinicals: 'clinical',
  clinical: 'clinical',
};

export function normalizePermissionCode(code: string): string {
  if (!code) return '';
  const parts = code.trim().toLowerCase().split(':');
  if (parts.length >= 2) {
    const mod = PERMISSION_MODULE_ALIASES[parts[0]] || parts[0];
    return `${mod}:${parts.slice(1).join(':')}`;
  }
  return code.trim().toLowerCase();
}

export function normalizePermissionCodes(codes?: string[] | null): string[] {
  if (!Array.isArray(codes)) return [];
  const normalized = codes
    .map(normalizePermissionCode)
    .filter((c) => c.length > 0);
  return Array.from(new Set(normalized));
}

export const FALLBACK_PERMISSIONS: PermissionResponse[] = FALLBACK_PERMISSIONS_LIST;

export const FALLBACK_ROLES: RoleResponse[] = [
  {
    id: 'r-001',
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Global system administrator with unrestricted governance across all hospitals, tenants, and modules.',
    is_system_role: true,
    hospital_id: null,
    permissions: [...FALLBACK_PERMISSIONS],
  },
  {
    id: 'r-002',
    code: 'HOSPITAL_ADMIN',
    name: 'Hospital Administrator',
    description: 'Command center administrator responsible for facility operations, staff provisioning, and bed mapping.',
    is_system_role: true,
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    permissions: FALLBACK_PERMISSIONS.filter(p => p.module !== 'Hospital' || p.action !== 'Delete'),
  },
  {
    id: 'r-003',
    code: 'INTENSIVIST',
    name: 'Consultant Intensivist',
    description: 'Senior ICU physician with clinical oversight, patient admission/discharge, orders, and consultation privileges.',
    is_system_role: true,
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    permissions: FALLBACK_PERMISSIONS.filter(p => ['Patient', 'Bed', 'Audit', 'Clinical'].includes(p.module)),
  },
  {
    id: 'r-004',
    code: 'ICU_STAFF_NURSE',
    name: 'ICU Bedside Staff Nurse',
    description: 'Registered nurse managing continuous vital sign flowsheet recording, patient alerts, and bed care.',
    is_system_role: true,
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    permissions: FALLBACK_PERMISSIONS.filter(p => ['Patient', 'Bed', 'Staff', 'Clinical'].includes(p.module) && p.action !== 'Delete'),
  },
  {
    id: 'r-005',
    code: 'ROLE_CLINICAL_AUDITOR',
    name: 'Clinical Quality Auditor',
    description: 'Custom governance role with read-only audit inspection across clinical reports, patient timelines, and logs.',
    is_system_role: false,
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    permissions: FALLBACK_PERMISSIONS.filter(p => p.action === 'View'),
  },
];

let localRoleStore: RoleResponse[] = [...FALLBACK_ROLES];
let localPermissionStore: PermissionResponse[] = [...FALLBACK_PERMISSIONS];

function extractData<T>(raw: any): T {
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined) {
    return raw.data as T;
  }
  return raw as T;
}

// ----------------------------------------------------
// Role & RBAC API Service
// ----------------------------------------------------
export const roleApi = {
  /**
   * Create Custom Clinical or System Role
   * POST /api/v1/roles
   */
  async createRole(payload: RoleCreatePayload): Promise<ApiResponse<RoleResponse>> {
    const normalizedCodes = normalizePermissionCodes(payload.permission_codes);
    const sanitizedPayload: RoleCreatePayload = {
      ...payload,
      code: payload.code.toUpperCase().trim(),
      name: payload.name.trim(),
      description: payload.description ? payload.description.trim() : null,
      hospital_id: payload.hospital_id ? payload.hospital_id : null,
      permission_codes: normalizedCodes,
    };

    const selectedPerms = localPermissionStore.filter(p =>
      normalizedCodes.includes(normalizePermissionCode(p.code))
    );

    const fallbackNewRole: RoleResponse = {
      id: crypto.randomUUID ? crypto.randomUUID() : `role-${Date.now()}`,
      code: sanitizedPayload.code,
      name: sanitizedPayload.name,
      description: sanitizedPayload.description,
      is_system_role: false,
      hospital_id: sanitizedPayload.hospital_id,
      permissions: selectedPerms,
    };

    try {
      const res = await apiClient.post<RoleResponse>(
        API_ENDPOINTS.ROLES.BASE,
        sanitizedPayload,
        fallbackNewRole
      );
      const normalized = extractData<RoleResponse>(res.data);
      localRoleStore = [normalized, ...localRoleStore.filter(r => r.id !== normalized.id)];
      return { ...res, data: normalized };
    } catch (err) {
      localRoleStore = [fallbackNewRole, ...localRoleStore];
      return {
        data: fallbackNewRole,
        status: 201,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * List Roles (with optional hospital_id filter)
   * GET /api/v1/roles
   */
  async listRoles(params?: RoleListParams): Promise<ApiResponse<RoleResponse[]>> {
    let fallback = [...localRoleStore];
    if (params?.hospital_id) {
      fallback = fallback.filter(r => !r.hospital_id || r.hospital_id === params.hospital_id);
    }

    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.hospital_id) queryParams.hospital_id = params.hospital_id;

    try {
      const res = await apiClient.get<RoleResponse[]>(
        API_ENDPOINTS.ROLES.BASE,
        fallback,
        { params: queryParams }
      );
      const normalized = extractData<RoleResponse[]>(res.data);
      if (Array.isArray(normalized)) {
        const incomingIds = new Set(normalized.map(r => r.id));
        localRoleStore = [
          ...normalized,
          ...localRoleStore.filter(r => !incomingIds.has(r.id)),
        ];
        return { ...res, data: normalized };
      }
      return { ...res, data: fallback };
    } catch (err) {
      return {
        data: fallback,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get Role Details by ID
   * GET /api/v1/roles/{id}
   */
  async getRoleById(id: string): Promise<ApiResponse<RoleResponse>> {
    const fallback = localRoleStore.find(r => r.id === id) || localRoleStore[0];

    try {
      const res = await apiClient.get<RoleResponse>(
        API_ENDPOINTS.ROLES.DETAILS(id),
        fallback
      );
      const normalized = extractData<RoleResponse>(res.data);
      return { ...res, data: normalized };
    } catch (err) {
      return {
        data: fallback,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Update Role Details and Permissions
   * PATCH /api/v1/roles/{id}
   */
  async updateUserRole(id: string, payload: RoleUpdatePayload): Promise<ApiResponse<RoleResponse>> {
    const existing = localRoleStore.find(r => r.id === id);
    const normalizedCodes = payload.permission_codes
      ? normalizePermissionCodes(payload.permission_codes)
      : undefined;

    const sanitizedPayload: RoleUpdatePayload = {
      ...payload,
      name: payload.name !== undefined ? (payload.name ? payload.name.trim() : null) : undefined,
      description: payload.description !== undefined ? (payload.description ? payload.description.trim() : null) : undefined,
      permission_codes: normalizedCodes,
    };

    const updatedPerms = normalizedCodes
      ? localPermissionStore.filter(p => normalizedCodes.includes(normalizePermissionCode(p.code)))
      : existing?.permissions || [];

    const fallbackUpdated: RoleResponse = existing
      ? {
          ...existing,
          name: payload.name !== undefined && payload.name !== null ? payload.name.trim() : existing.name,
          description: payload.description !== undefined ? payload.description : existing.description,
          permissions: updatedPerms,
        }
      : {
          id,
          code: 'CUSTOM_ROLE',
          name: payload.name?.trim() || 'Custom Role',
          description: payload.description || null,
          is_system_role: false,
          permissions: updatedPerms,
        };

    try {
      const res = await apiClient.patch<RoleResponse>(
        API_ENDPOINTS.ROLES.DETAILS(id),
        sanitizedPayload,
        fallbackUpdated
      );
      const normalized = extractData<RoleResponse>(res.data);
      localRoleStore = localRoleStore.map(r => (r.id === id ? normalized : r));
      return { ...res, data: normalized };
    } catch (err) {
      localRoleStore = localRoleStore.map(r => (r.id === id ? fallbackUpdated : r));
      return {
        data: fallbackUpdated,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Delete Custom Role (Command Center Only)
   * DELETE /api/v1/roles/{id}
   */
  async deleteRole(id: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
    const fallbackRes = { success: true, message: 'Custom role deleted successfully.' };

    try {
      const res = await apiClient.delete<{ success: boolean; message?: string }>(
        API_ENDPOINTS.ROLES.DETAILS(id),
        fallbackRes
      );
      localRoleStore = localRoleStore.filter(r => r.id !== id);
      return res;
    } catch (err) {
      localRoleStore = localRoleStore.filter(r => r.id !== id);
      return {
        data: fallbackRes,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Assign Permissions to Role
   * POST /api/v1/roles/{id}/permissions
   */
  async assignRolePermissions(id: string, permission_codes: string[]): Promise<ApiResponse<RoleResponse>> {
    const normalizedCodes = normalizePermissionCodes(permission_codes);
    const existing = localRoleStore.find(r => r.id === id);
    const newPerms = localPermissionStore.filter(p =>
      normalizedCodes.includes(normalizePermissionCode(p.code))
    );
    const mergedPerms = existing
      ? [
          ...existing.permissions,
          ...newPerms.filter(np => !existing.permissions.some(ep => normalizePermissionCode(ep.code) === normalizePermissionCode(np.code))),
        ]
      : newPerms;

    const fallback: RoleResponse = existing
      ? { ...existing, permissions: mergedPerms }
      : {
          id,
          code: 'ROLE',
          name: 'Role',
          is_system_role: false,
          permissions: mergedPerms,
        };

    try {
      const res = await apiClient.post<RoleResponse>(
        API_ENDPOINTS.ROLES.PERMISSIONS(id),
        { permission_codes: normalizedCodes },
        fallback
      );
      const normalized = extractData<RoleResponse>(res.data);
      localRoleStore = localRoleStore.map(r => (r.id === id ? normalized : r));
      return { ...res, data: normalized };
    } catch (err) {
      localRoleStore = localRoleStore.map(r => (r.id === id ? fallback : r));
      return {
        data: fallback,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Bulk Revoke Permissions from Role (Command Center Only)
   * DELETE /api/v1/roles/{id}/permissions
   */
  async bulkRevokeRolePermissions(id: string, permission_codes: string[]): Promise<ApiResponse<RoleResponse>> {
    const normalizedCodes = normalizePermissionCodes(permission_codes);
    const existing = localRoleStore.find(r => r.id === id);
    const codesToRemove = new Set(normalizedCodes);
    const remainingPerms = existing
      ? existing.permissions.filter(p => !codesToRemove.has(normalizePermissionCode(p.code)))
      : [];

    const fallback: RoleResponse = existing
      ? { ...existing, permissions: remainingPerms }
      : {
          id,
          code: 'ROLE',
          name: 'Role',
          is_system_role: false,
          permissions: remainingPerms,
        };

    try {
      const res = await apiClient.request<RoleResponse>(
        API_ENDPOINTS.ROLES.PERMISSIONS(id),
        {
          method: 'DELETE',
          body: JSON.stringify({ permission_codes: normalizedCodes }),
        },
        fallback
      );
      const normalized = extractData<RoleResponse>(res.data);
      localRoleStore = localRoleStore.map(r => (r.id === id ? normalized : r));
      return { ...res, data: normalized };
    } catch (err) {
      localRoleStore = localRoleStore.map(r => (r.id === id ? fallback : r));
      return {
        data: fallback,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Revoke Single Permission from Role (Command Center Only)
   * DELETE /api/v1/roles/{id}/permissions/{permission_code}
   */
  async revokeSingleRolePermission(id: string, permission_code: string): Promise<ApiResponse<RoleResponse>> {
    const normalizedCode = normalizePermissionCode(permission_code);
    const existing = localRoleStore.find(r => r.id === id);
    const remainingPerms = existing
      ? existing.permissions.filter(p => normalizePermissionCode(p.code) !== normalizedCode)
      : [];

    const fallback: RoleResponse = existing
      ? { ...existing, permissions: remainingPerms }
      : {
          id,
          code: 'ROLE',
          name: 'Role',
          is_system_role: false,
          permissions: remainingPerms,
        };

    try {
      const res = await apiClient.delete<RoleResponse>(
        API_ENDPOINTS.ROLES.PERMISSION_SINGLE(id, normalizedCode),
        fallback
      );
      const normalized = extractData<RoleResponse>(res.data);
      localRoleStore = localRoleStore.map(r => (r.id === id ? normalized : r));
      return { ...res, data: normalized };
    } catch (err) {
      localRoleStore = localRoleStore.map(r => (r.id === id ? fallback : r));
      return {
        data: fallback,
        status: 200,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * List System Permissions
   * GET /api/v1/permissions
   */
  async listPermissions(module?: string): Promise<ApiResponse<PermissionResponse[]>> {
    return permissionApi.listPermissions(module);
  },

  /**
   * Get Resource CRUD Permissions Matrix for UI
   * GET /api/v1/permissions/matrix
   */
  async getPermissionsMatrix(): Promise<ApiResponse<ResourcePermissionsSummary[]>> {
    return permissionApi.getPermissionsMatrix();
  },
};

export default roleApi;
