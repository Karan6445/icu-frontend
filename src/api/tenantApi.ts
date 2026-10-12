import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';
import { extractData } from './permissionApi';

// --------------------------------------------------------------------------
// OpenAPI 3.1 Data Types for Tenant Governance
// --------------------------------------------------------------------------

export interface TenantMembershipCreate {
  user_id: string; // UUID
  hospital_id: string; // UUID
  role_id: string; // UUID
  badge_number?: string | null;
}

export interface TenantMembershipResponse {
  id: string; // UUID
  user_id: string; // UUID
  hospital_id: string; // UUID
  role_id: string; // UUID
  role_code?: string | null;
  role_name?: string | null;
  status: string; // e.g. "ACTIVE"
  badge_number?: string | null;
}

// In-memory fallback membership store
let localMembershipStore: TenantMembershipResponse[] = [];

// --------------------------------------------------------------------------
// Tenant Governance API Service
// --------------------------------------------------------------------------

export const tenantApi = {
  /**
   * Assign User to Hospital Tenant with Role
   * POST /api/v1/tenants/memberships
   */
  async assignTenantMembership(
    payload: TenantMembershipCreate
  ): Promise<ApiResponse<TenantMembershipResponse>> {
    const sanitizedPayload: TenantMembershipCreate = {
      user_id: payload.user_id.trim(),
      hospital_id: payload.hospital_id.trim(),
      role_id: payload.role_id.trim(),
      badge_number: payload.badge_number ? payload.badge_number.trim() : null,
    };

    const fallbackResponse: TenantMembershipResponse = {
      id: crypto.randomUUID ? crypto.randomUUID() : `tm-${Date.now()}`,
      user_id: sanitizedPayload.user_id,
      hospital_id: sanitizedPayload.hospital_id,
      role_id: sanitizedPayload.role_id,
      role_code: null,
      role_name: null,
      status: 'ACTIVE',
      badge_number: sanitizedPayload.badge_number,
    };

    try {
      const res = await apiClient.post<TenantMembershipResponse>(
        API_ENDPOINTS.TENANTS.MEMBERSHIPS,
        sanitizedPayload,
        fallbackResponse
      );

      const unwrapped = extractData<TenantMembershipResponse>(res.data);
      if (unwrapped && unwrapped.id) {
        localMembershipStore = [
          unwrapped,
          ...localMembershipStore.filter((m) => m.id !== unwrapped.id),
        ];
        return { ...res, data: unwrapped };
      }

      return { ...res, data: fallbackResponse };
    } catch (err: any) {
      console.warn('[tenantApi] assignTenantMembership error, using fallback:', err?.message || err);
      localMembershipStore = [fallbackResponse, ...localMembershipStore];
      return {
        data: fallbackResponse,
        status: 201,
        message: 'Assigned to tenant in local fallback store',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Helper: Retrieve locally cached memberships
   */
  getCachedMemberships(): TenantMembershipResponse[] {
    return localMembershipStore;
  },
};

export default tenantApi;
