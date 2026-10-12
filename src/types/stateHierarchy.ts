/**
 * State Hierarchy & Regional Governance Types
 * Matches OpenAPI 3.1 specification for /api/v1/states and /api/v1/districts
 */

export type StateStatus = 'ACTIVE' | 'INACTIVE' | 'DECOMMISSIONED' | string;

export interface StateResponse {
  id: string;
  code: string;
  name: string;
  status: StateStatus;
  created_at: string;
  updated_at?: string | null;
}

export interface StateCreatePayload {
  code: string;
  name: string;
  status?: string;
}

export interface StateUpdatePayload {
  code?: string | null;
  name?: string | null;
  status?: string | null;
}

export interface DistrictResponse {
  id: string;
  state_id: string;
  code: string;
  name: string;
  status: string;
  created_at: string;
  updated_at?: string | null;
}

export interface HospitalUserSummary {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
}

export interface HospitalWithUsersHierarchy {
  id: string;
  code: string;
  name: string;
  status: string;
  district_id?: string | null;
  users?: HospitalUserSummary[];
}

export interface DistrictWithHospitalsHierarchy {
  id: string;
  state_id: string;
  code: string;
  name: string;
  status: string;
  hospitals?: HospitalWithUsersHierarchy[];
}

export interface StateHierarchyResponse {
  id: string;
  code: string;
  name: string;
  status: string;
  districts?: DistrictWithHospitalsHierarchy[];
}

export interface StateSummary {
  id: string;
  code: string;
  name: string;
  status: string;
}

export interface DistrictSummary {
  id: string;
  state_id: string;
  code: string;
  name: string;
  status: string;
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
