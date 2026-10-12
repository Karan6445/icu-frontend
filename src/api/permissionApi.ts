import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

// --------------------------------------------------------------------------
// OpenAPI 3.1 Data Types for RBAC & Permissions
// --------------------------------------------------------------------------

export interface PermissionResponse {
  id: string;
  code: string;
  module: string;
  description?: string | null;
  action?: string | null;
}

export interface ResourcePermissionOptions {
  create?: string | null;
  read?: string | null;
  update?: string | null;
  delete?: string | null;
}

export interface ResourcePermissionsSummary {
  resource: string;
  name: string;
  description?: string | null;
  permissions: ResourcePermissionOptions;
}

export interface PermissionListParams {
  module?: string | null;
}

// --------------------------------------------------------------------------
// Canonical Matrix Seed Constants (Synced with Backend OpenAPI Specification)
// --------------------------------------------------------------------------

export const FALLBACK_PERMISSIONS_MATRIX: ResourcePermissionsSummary[] = [
  {
    resource: 'user',
    name: 'User Management',
    description: 'User accounts, credentials, and profile governance',
    permissions: {
      create: 'user:create',
      read: 'user:read',
      update: 'user:update',
      delete: 'user:delete',
    },
  },
  {
    resource: 'role',
    name: 'RBAC & Role Governance',
    description: 'Custom roles, capabilities, and tenant membership assignments',
    permissions: {
      create: 'role:create',
      read: 'role:read',
      update: 'role:update',
      delete: 'role:delete',
    },
  },
  {
    resource: 'patient',
    name: 'Patients & Demographics',
    description: 'Patient master demographic records, MRNs, and QR wristbands',
    permissions: {
      create: 'patient:create',
      read: 'patient:read',
      update: 'patient:update',
      delete: 'patient:delete',
    },
  },
  {
    resource: 'admission',
    name: 'ICU Admissions & Bed Allocation',
    description: 'Inpatient ICU admissions, bed transfers, and care teams',
    permissions: {
      create: 'admission:create',
      read: 'admission:read',
      update: 'admission:update',
      delete: 'admission:delete',
    },
  },
  {
    resource: 'clinical',
    name: 'Clinical Encounters & Notes',
    description: 'Progress notes, clinical encounters, assessments, and orders',
    permissions: {
      create: 'clinical:create',
      read: 'clinical:read',
      update: 'clinical:update',
      delete: 'clinical:delete',
    },
  },
  {
    resource: 'order',
    name: 'Medication & Diagnostic Orders',
    description: 'Stat and routine medication prescriptions and lab orders',
    permissions: {
      create: 'order:create',
      read: 'order:read',
      update: 'order:update',
      delete: 'order:delete',
    },
  },
  {
    resource: 'hospital',
    name: 'Hospital Facilities',
    description: 'Hospital configurations, facility metadata, and contact details',
    permissions: {
      create: 'hospital:create',
      read: 'hospital:read',
      update: 'hospital:update',
      delete: 'hospital:delete',
    },
  },
  {
    resource: 'department',
    name: 'Clinical Departments',
    description: 'Hospital departments and medical specialties',
    permissions: {
      create: 'department:create',
      read: 'department:read',
      update: 'department:update',
      delete: 'department:delete',
    },
  },
  {
    resource: 'icu',
    name: 'ICU Wards & Units',
    description: 'Intensive Care Units (MICU, SICU, NICU, etc.) and telemetry',
    permissions: {
      create: 'icu:create',
      read: 'icu:read',
      update: 'icu:update',
      delete: 'icu:delete',
    },
  },
  {
    resource: 'bed',
    name: 'Beds & Infrastructure',
    description: 'Smart bed hardware, isolation status, and dialysis ports',
    permissions: {
      create: 'bed:create',
      read: 'bed:read',
      update: 'bed:update',
      delete: 'bed:delete',
    },
  },
  {
    resource: 'staff',
    name: 'Clinical Staff Governance',
    description: 'Medical licenses, specialties, and on-duty rosters',
    permissions: {
      create: 'staff:create',
      read: 'staff:read',
      update: 'staff:update',
      delete: 'staff:delete',
    },
  },
  {
    resource: 'state',
    name: 'State Administrative Hierarchy',
    description: 'State geographic and administrative jurisdictions',
    permissions: {
      create: 'state:create',
      read: 'state:read',
      update: 'state:update',
      delete: 'state:delete',
    },
  },
  {
    resource: 'district',
    name: 'District Administrative Hierarchy',
    description: 'District geographic boundaries and hospital clusters',
    permissions: {
      create: 'district:create',
      read: 'district:read',
      update: 'district:update',
      delete: 'district:delete',
    },
  },
  {
    resource: 'audit',
    name: 'Audit Trails & Access Logs',
    description: 'Append-only forensic audit logs and patient chart access logs',
    permissions: {
      create: 'audit:create',
      read: 'audit:read',
      update: 'audit:update',
      delete: 'audit:delete',
    },
  },
];

export const FALLBACK_PERMISSIONS_LIST: PermissionResponse[] = [
  // admission
  { id: 'perm-adm-1', code: 'admission:create', module: 'admission', action: 'CREATE', description: 'Create new icu admissions & bed allocation records' },
  { id: 'perm-adm-2', code: 'admission:read', module: 'admission', action: 'READ', description: 'View and query icu admissions & bed allocation records' },
  { id: 'perm-adm-3', code: 'admission:update', module: 'admission', action: 'UPDATE', description: 'Modify and update existing icu admissions & bed allocation records' },
  { id: 'perm-adm-4', code: 'admission:delete', module: 'admission', action: 'DELETE', description: 'Soft-delete icu admissions & bed allocation records (SUPER_ADMIN only)' },
  // audit
  { id: 'perm-aud-1', code: 'audit:create', module: 'audit', action: 'CREATE', description: 'Create new audit trails & access logs records' },
  { id: 'perm-aud-2', code: 'audit:read', module: 'audit', action: 'READ', description: 'View and query audit trails & access logs records' },
  { id: 'perm-aud-3', code: 'audit:update', module: 'audit', action: 'UPDATE', description: 'Modify and update existing audit trails & access logs records' },
  { id: 'perm-aud-4', code: 'audit:delete', module: 'audit', action: 'DELETE', description: 'Soft-delete audit trails & access logs records (SUPER_ADMIN only)' },
  // bed
  { id: 'perm-bed-1', code: 'bed:create', module: 'bed', action: 'CREATE', description: 'Create new beds & infrastructure records' },
  { id: 'perm-bed-2', code: 'bed:read', module: 'bed', action: 'READ', description: 'View and query beds & infrastructure records' },
  { id: 'perm-bed-3', code: 'bed:update', module: 'bed', action: 'UPDATE', description: 'Modify and update existing beds & infrastructure records' },
  { id: 'perm-bed-4', code: 'bed:delete', module: 'bed', action: 'DELETE', description: 'Soft-delete beds & infrastructure records (SUPER_ADMIN only)' },
  // clinical
  { id: 'perm-cli-1', code: 'clinical:create', module: 'clinical', action: 'CREATE', description: 'Create new clinical encounters & notes records' },
  { id: 'perm-cli-2', code: 'clinical:read', module: 'clinical', action: 'READ', description: 'View and query clinical encounters & notes records' },
  { id: 'perm-cli-3', code: 'clinical:update', module: 'clinical', action: 'UPDATE', description: 'Modify and update existing clinical encounters & notes records' },
  { id: 'perm-cli-4', code: 'clinical:delete', module: 'clinical', action: 'DELETE', description: 'Soft-delete clinical encounters & notes records (SUPER_ADMIN only)' },
  { id: 'perm-cli-5', code: 'medication:administer:execute', module: 'clinical', action: null, description: 'Administer medication at patient bedside' },
  { id: 'perm-cli-6', code: 'medication:administer:witness', module: 'clinical', action: null, description: 'Witness high-risk medication administration' },
  // department
  { id: 'perm-dep-1', code: 'department:create', module: 'department', action: 'CREATE', description: 'Create new clinical departments records' },
  { id: 'perm-dep-2', code: 'department:read', module: 'department', action: 'READ', description: 'View and query clinical departments records' },
  { id: 'perm-dep-3', code: 'department:update', module: 'department', action: 'UPDATE', description: 'Modify and update existing clinical departments records' },
  { id: 'perm-dep-4', code: 'department:delete', module: 'department', action: 'DELETE', description: 'Soft-delete clinical departments records (SUPER_ADMIN only)' },
  // district
  { id: 'perm-dis-1', code: 'district:create', module: 'district', action: 'CREATE', description: 'Create new district administrative hierarchy records' },
  { id: 'perm-dis-2', code: 'district:read', module: 'district', action: 'READ', description: 'View and query district administrative hierarchy records' },
  { id: 'perm-dis-3', code: 'district:update', module: 'district', action: 'UPDATE', description: 'Modify and update existing district administrative hierarchy records' },
  { id: 'perm-dis-4', code: 'district:delete', module: 'district', action: 'DELETE', description: 'Soft-delete district administrative hierarchy records (SUPER_ADMIN only)' },
  // hospital
  { id: 'perm-hos-1', code: 'hospital:create', module: 'hospital', action: 'CREATE', description: 'Create new hospital facilities records' },
  { id: 'perm-hos-2', code: 'hospital:read', module: 'hospital', action: 'READ', description: 'View and query hospital facilities records' },
  { id: 'perm-hos-3', code: 'hospital:update', module: 'hospital', action: 'UPDATE', description: 'Modify and update existing hospital facilities records' },
  { id: 'perm-hos-4', code: 'hospital:delete', module: 'hospital', action: 'DELETE', description: 'Soft-delete hospital facilities records (SUPER_ADMIN only)' },
  // icu
  { id: 'perm-icu-1', code: 'icu:create', module: 'icu', action: 'CREATE', description: 'Create new icu wards & units records' },
  { id: 'perm-icu-2', code: 'icu:read', module: 'icu', action: 'READ', description: 'View and query icu wards & units records' },
  { id: 'perm-icu-3', code: 'icu:update', module: 'icu', action: 'UPDATE', description: 'Modify and update existing icu wards & units records' },
  { id: 'perm-icu-4', code: 'icu:delete', module: 'icu', action: 'DELETE', description: 'Soft-delete icu wards & units records (SUPER_ADMIN only)' },
  // order
  { id: 'perm-ord-1', code: 'order:create', module: 'order', action: 'CREATE', description: 'Create new medication & diagnostic orders records' },
  { id: 'perm-ord-2', code: 'order:read', module: 'order', action: 'READ', description: 'View and query medication & diagnostic orders records' },
  { id: 'perm-ord-3', code: 'order:update', module: 'order', action: 'UPDATE', description: 'Modify and update existing medication & diagnostic orders records' },
  { id: 'perm-ord-4', code: 'order:delete', module: 'order', action: 'DELETE', description: 'Soft-delete medication & diagnostic orders records (SUPER_ADMIN only)' },
  { id: 'perm-ord-5', code: 'order:medication:prescribe', module: 'order', action: null, description: 'Prescribe clinical inpatient medications' },
  { id: 'perm-ord-6', code: 'order:medication:verify', module: 'order', action: null, description: 'Clinical pharmacy validation of active prescriptions' },
  // patient
  { id: 'perm-pat-1', code: 'patient:create', module: 'patient', action: 'CREATE', description: 'Create new patient records' },
  { id: 'perm-pat-2', code: 'patient:read', module: 'patient', action: 'READ', description: 'View and query patient records' },
  { id: 'perm-pat-3', code: 'patient:update', module: 'patient', action: 'UPDATE', description: 'Modify and update existing patient records' },
  { id: 'perm-pat-4', code: 'patient:delete', module: 'patient', action: 'DELETE', description: 'Soft-delete patient records (SUPER_ADMIN only)' },
  { id: 'perm-pat-5', code: 'patient:demographics:read', module: 'patient', action: 'READ', description: 'Access protected patient demographic information' },
  { id: 'perm-pat-6', code: 'patient:demographics:write', module: 'patient', action: null, description: 'Update protected patient demographic identities' },
  { id: 'perm-pat-7', code: 'patient:write', module: 'patient', action: null, description: 'Direct write permission to patient profile' },
  // role
  { id: 'perm-rol-1', code: 'role:create', module: 'role', action: 'CREATE', description: 'Create new rbac & role governance records' },
  { id: 'perm-rol-2', code: 'role:read', module: 'role', action: 'READ', description: 'View and query rbac & role governance records' },
  { id: 'perm-rol-3', code: 'role:update', module: 'role', action: 'UPDATE', description: 'Modify and update existing rbac & role governance records' },
  { id: 'perm-rol-4', code: 'role:delete', module: 'role', action: 'DELETE', description: 'Soft-delete rbac & role governance records (SUPER_ADMIN only)' },
  // staff
  { id: 'perm-stf-1', code: 'staff:create', module: 'staff', action: 'CREATE', description: 'Create new clinical staff governance records' },
  { id: 'perm-stf-2', code: 'staff:read', module: 'staff', action: 'READ', description: 'View and query clinical staff governance records' },
  { id: 'perm-stf-3', code: 'staff:update', module: 'staff', action: 'UPDATE', description: 'Modify and update existing clinical staff governance records' },
  { id: 'perm-stf-4', code: 'staff:delete', module: 'staff', action: 'DELETE', description: 'Soft-delete clinical staff governance records (SUPER_ADMIN only)' },
  // state
  { id: 'perm-ste-1', code: 'state:create', module: 'state', action: 'CREATE', description: 'Create new state administrative hierarchy records' },
  { id: 'perm-ste-2', code: 'state:read', module: 'state', action: 'READ', description: 'View and query state administrative hierarchy records' },
  { id: 'perm-ste-3', code: 'state:update', module: 'state', action: 'UPDATE', description: 'Modify and update existing state administrative hierarchy records' },
  { id: 'perm-ste-4', code: 'state:delete', module: 'state', action: 'DELETE', description: 'Soft-delete state administrative hierarchy records (SUPER_ADMIN only)' },
  // user
  { id: 'perm-usr-1', code: 'user:create', module: 'user', action: 'CREATE', description: 'Create new user management records' },
  { id: 'perm-usr-2', code: 'user:read', module: 'user', action: 'READ', description: 'View and query user management records' },
  { id: 'perm-usr-3', code: 'user:update', module: 'user', action: 'UPDATE', description: 'Modify and update existing user management records' },
  { id: 'perm-usr-4', code: 'user:delete', module: 'user', action: 'DELETE', description: 'Soft-delete user management records (SUPER_ADMIN only)' },
];

let localCachedPermissions: PermissionResponse[] = [...FALLBACK_PERMISSIONS_LIST];
let localCachedMatrix: ResourcePermissionsSummary[] = [...FALLBACK_PERMISSIONS_MATRIX];

// Helper to reliably unwrap standard backend envelopes ({ success: true, data: T })
export function extractData<T>(raw: any): T {
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'data' in raw && raw.data !== undefined) {
    return extractData<T>(raw.data);
  }
  return raw as T;
}

// --------------------------------------------------------------------------
// RBAC & Permissions API Service
// --------------------------------------------------------------------------

export const permissionApi = {
  /**
   * List System Permissions
   * GET /api/v1/permissions
   * Supports optional `module` filter (e.g. 'clinical', 'patient', 'bed', etc.)
   */
  async listPermissions(
    paramsOrModule?: string | PermissionListParams
  ): Promise<ApiResponse<PermissionResponse[]>> {
    let moduleFilter: string | undefined;

    if (typeof paramsOrModule === 'string') {
      moduleFilter = paramsOrModule.trim();
    } else if (paramsOrModule?.module) {
      moduleFilter = paramsOrModule.module.trim();
    }

    let fallback = [...localCachedPermissions];
    if (moduleFilter && moduleFilter.toUpperCase() !== 'ALL') {
      fallback = fallback.filter(
        (p) => p.module.toLowerCase() === moduleFilter!.toLowerCase()
      );
    }

    const queryParams: Record<string, string> = {};
    if (moduleFilter && moduleFilter.toUpperCase() !== 'ALL') {
      queryParams.module = moduleFilter;
    }

    try {
      const res = await apiClient.get<PermissionResponse[]>(
        API_ENDPOINTS.PERMISSIONS.BASE,
        fallback,
        Object.keys(queryParams).length > 0 ? { params: queryParams } : undefined
      );

      const unwrapped = extractData<PermissionResponse[]>(res.data);
      if (Array.isArray(unwrapped)) {
        if (!moduleFilter || moduleFilter.toUpperCase() === 'ALL') {
          localCachedPermissions = unwrapped;
        } else {
          // Merge newly fetched module permissions into local cache
          const otherPerms = localCachedPermissions.filter(
            (p) => p.module.toLowerCase() !== moduleFilter!.toLowerCase()
          );
          localCachedPermissions = [...otherPerms, ...unwrapped];
        }
        return { ...res, data: unwrapped };
      }

      return { ...res, data: fallback };
    } catch (err: any) {
      console.warn('[permissionApi] listPermissions error, using fallback:', err?.message || err);
      return {
        data: fallback,
        status: 200,
        message: 'Loaded from local fallback cache',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get Resource CRUD Permissions Matrix for UI
   * GET /api/v1/permissions/matrix
   * Returns resource-level CRUD mappings for user, role, patient, admission, etc.
   */
  async getPermissionsMatrix(): Promise<ApiResponse<ResourcePermissionsSummary[]>> {
    const fallbackMatrix = [...localCachedMatrix];

    try {
      const res = await apiClient.get<ResourcePermissionsSummary[]>(
        API_ENDPOINTS.PERMISSIONS.MATRIX,
        fallbackMatrix
      );

      const unwrapped = extractData<ResourcePermissionsSummary[]>(res.data);
      if (Array.isArray(unwrapped) && unwrapped.length > 0) {
        localCachedMatrix = unwrapped;
        return { ...res, data: unwrapped };
      }

      return { ...res, data: fallbackMatrix };
    } catch (err: any) {
      console.warn('[permissionApi] getPermissionsMatrix error, using fallback:', err?.message || err);
      return {
        data: fallbackMatrix,
        status: 200,
        message: 'Loaded from local fallback matrix',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Helper: Filter system permissions by module name
   */
  async getPermissionsByModule(moduleName: string): Promise<ApiResponse<PermissionResponse[]>> {
    return this.listPermissions({ module: moduleName });
  },

  /**
   * Helper: Synchronously retrieve locally cached permissions
   */
  getCachedPermissions(): PermissionResponse[] {
    return localCachedPermissions;
  },

  /**
   * Helper: Synchronously retrieve locally cached matrix
   */
  getCachedMatrix(): ResourcePermissionsSummary[] {
    return localCachedMatrix;
  },
};

export default permissionApi;
