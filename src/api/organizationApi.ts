import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';
import {
  OrganizationResponse,
  OrganizationCreatePayload,
} from '../types/organization';

// ----------------------------------------------------
// Fallback In-Memory Seed Organizations
// ----------------------------------------------------
export const FALLBACK_ORGANIZATIONS: OrganizationResponse[] = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    code: 'ORG-METRO-HEALTH',
    name: 'Metro Health Care System',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    config: {
      tele_icu_enabled: true,
    },
    created_at: '2026-09-29T08:46:35.584300Z',
  },
  {
    id: 'cb39f55b-c697-4056-a688-101973396833',
    code: 'NHS-TRUST-01',
    name: 'National Health Trust London',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    config: {
      tele_icu_enabled: true,
    },
    created_at: '2026-10-12T06:14:31.129061Z',
  },
  {
    id: '869b821a-811f-4e2c-a6aa-67dac9ba21df',
    code: 'ORG-SYNTHETIC-NETWORK',
    name: 'Synthetic Multi-Tenant Healthcare Network',
    tier: 'ENTERPRISE',
    status: 'ACTIVE',
    config: {
      tele_icu_enabled: true,
      synthetic_fixture: true,
    },
    created_at: '2026-10-07T12:14:37.270771Z',
  },
];

let localOrganizationCache: OrganizationResponse[] = [...FALLBACK_ORGANIZATIONS];

// Helper to normalize backend envelope response: { success: true, data: T } or T
function extractData<T>(raw: any): T {
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data !== undefined) {
    return raw.data as T;
  }
  return raw as T;
}

// ----------------------------------------------------
// Organization Hierarchy API Service
// ----------------------------------------------------
export const organizationApi = {
  /**
   * List Organizations
   * GET /api/v1/organizations
   */
  async listOrganizations(): Promise<ApiResponse<OrganizationResponse[]>> {
    try {
      const res = await apiClient.get<any>(
        API_ENDPOINTS.ORGANIZATIONS.BASE,
        FALLBACK_ORGANIZATIONS
      );
      const normalizedData = extractData<OrganizationResponse[]>(res.data) || [];
      if (Array.isArray(normalizedData) && normalizedData.length > 0) {
        localOrganizationCache = normalizedData;
      }
      return { ...res, data: Array.isArray(normalizedData) ? normalizedData : [] };
    } catch (err: any) {
      console.warn('[organizationApi.listOrganizations] Fallback to local cache:', err);
      return {
        data: localOrganizationCache,
        status: 200,
        message: 'Loaded from local organization cache',
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Register Parent Healthcare Organization
   * POST /api/v1/organizations
   */
  async createOrganization(
    payload: OrganizationCreatePayload
  ): Promise<ApiResponse<OrganizationResponse>> {
    const fallbackNewOrg: OrganizationResponse = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `org-${Date.now()}`,
      code: payload.code.toUpperCase().trim(),
      name: payload.name.trim(),
      tier: payload.tier || 'STANDARD',
      status: 'ACTIVE',
      config: payload.config || { tele_icu_enabled: true },
      created_at: new Date().toISOString(),
    };

    try {
      const res = await apiClient.post<any>(
        API_ENDPOINTS.ORGANIZATIONS.BASE,
        {
          code: payload.code.toUpperCase().trim(),
          name: payload.name.trim(),
          tier: payload.tier || 'STANDARD',
          config: payload.config || {},
        },
        fallbackNewOrg
      );
      const normalizedData = extractData<OrganizationResponse>(res.data);
      localOrganizationCache = [
        normalizedData,
        ...localOrganizationCache.filter((o) => o.id !== normalizedData.id),
      ];
      return { ...res, data: normalizedData };
    } catch (err: any) {
      console.warn('[organizationApi.createOrganization] Error occurred, using optimistic fallback:', err);
      localOrganizationCache = [fallbackNewOrg, ...localOrganizationCache];
      return {
        data: fallbackNewOrg,
        status: 201,
        message: 'Optimistically saved locally',
        timestamp: new Date().toISOString(),
      };
    }
  },
};

export default organizationApi;
