/**
 * District Hierarchy & Regional Administration Types
 * Matches OpenAPI 3.1 specification for /api/v1/districts
 */

import {
  StateSummary,
  HospitalWithUsersHierarchy,
} from './stateHierarchy';

export type DistrictStatus = 'ACTIVE' | 'INACTIVE' | 'DECOMMISSIONED' | string;

export interface DistrictResponse {
  id: string;
  state_id: string;
  code: string;
  name: string;
  status: DistrictStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface DistrictCreatePayload {
  state_id: string;
  code: string;
  name: string;
  status?: string;
}

export interface DistrictUpdatePayload {
  state_id?: string | null;
  code?: string | null;
  name?: string | null;
  status?: string | null;
}

export interface DistrictListParams {
  state_id?: string;
}

export interface DistrictHierarchyResponse {
  id: string;
  state_id: string;
  code: string;
  name: string;
  status: string;
  state?: StateSummary | null;
  hospitals?: HospitalWithUsersHierarchy[];
}

export interface DistrictHospitalItem {
  id: string;
  code: string;
  name: string;
  timezone?: string;
  country_code?: string | null;
  address?: Record<string, any> | string;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_command_center_enabled?: boolean;
  status: string;
  district_id?: string | null;
  organization_id?: string | null;
  created_at?: string;
}
