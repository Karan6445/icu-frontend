/**
 * Organization Hierarchy & Multi-Tenant Healthcare System Types
 * Matches OpenAPI 3.1 specification for /api/v1/organizations
 */

export type OrganizationTier = 'STANDARD' | 'ENTERPRISE' | 'ACADEMIC' | 'GOVERNMENT' | string;
export type OrganizationStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;

export interface OrganizationResponse {
  id: string;
  code: string;
  name: string;
  tier: OrganizationTier;
  status: OrganizationStatus;
  config: Record<string, any>;
  created_at: string;
}

export interface OrganizationCreatePayload {
  code: string;
  name: string;
  tier?: string;
  config?: Record<string, any>;
}
