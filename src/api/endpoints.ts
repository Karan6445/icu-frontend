// Centralized API Endpoint Constants

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
    ME: '/api/v1/auth/me',
    CHANGE_PASSWORD: '/api/v1/auth/change-password',
    MFA_SETUP: '/api/v1/auth/mfa/setup',
    MFA_ENABLE: '/api/v1/auth/mfa/enable',
    MFA_VERIFY: '/api/v1/auth/mfa/verify',
    MFA_DISABLE: '/api/v1/auth/mfa/disable',
    MFA_REGENERATE_RECOVERY_CODES: '/api/v1/auth/mfa/recovery-codes/regenerate',
    SWITCH_ROLE: '/api/v1/auth/switch-role',
  },
  PATIENTS: {
    BASE: '/api/v1/patients',
    DETAILS: (id: string) => `/api/v1/patients/${id}`,
    VITALS: (id: string) => `/api/v1/patients/${id}/vitals`,
    CLINICAL_NOTES: (id: string) => `/api/v1/patients/${id}/notes/clinical`,
    NURSING_NOTES: (id: string) => `/api/v1/patients/${id}/notes/nursing`,
    HANDOVERS: (id: string) => `/api/v1/patients/${id}/handovers`,
    TIMELINE: (id: string) => `/api/v1/patients/${id}/timeline`,
  },
  ADMISSIONS: {
    BASE: '/api/v1/admissions',
    ACTIVE: '/api/v1/admissions/active',
    DETAILS: (id: string) => `/api/v1/admissions/${id}`,
    DISCHARGE: (id: string) => `/api/v1/admissions/${id}/discharge`,
    CARE_TEAM: (id: string) => `/api/v1/admissions/${id}/care-team`,
    CARE_TEAM_MEMBERS: (id: string) => `/api/v1/admissions/${id}/care-team/members`,
    CARE_TEAM_MEMBER_SINGLE: (id: string, memberId: string) => `/api/v1/admissions/${id}/care-team/members/${memberId}`,
  },
  ADMIN: {
    HOSPITALS: '/api/v1/admin/hospitals',
    DISTRICTS: '/api/v1/admin/districts',
    ICU_BEDS: '/api/v1/admin/icu-beds',
    DOCTORS: '/api/v1/admin/doctors',
    NURSES: '/api/v1/admin/nurses',
    SHIFTS: '/api/v1/admin/shifts',
    ROLES: '/api/v1/admin/roles',
    REPORTS: '/api/v1/admin/reports',
    AUDIT_LOGS: '/api/v1/admin/audit-logs',
  },
  DEVICES: {
    BASE: '/api/v1/devices',
    TELEMETRY: (id: string) => `/api/v1/devices/${id}/telemetry`,
    PTZ_CONFIG: (id: string) => `/api/v1/devices/${id}/ptz`,
  },
  HOSPITALS: {
    BASE: '/api/v1/hospitals',
    DETAILS: (id: string) => `/api/v1/hospitals/${id}`,
    HIERARCHY: (id: string) => `/api/v1/hospitals/${id}/hierarchy`,
  },
  USERS: {
    BASE: '/api/v1/users',
    DETAILS: (id: string) => `/api/v1/users/${id}`,
    HIERARCHY: (id: string) => `/api/v1/users/${id}/hierarchy`,
    RESTORE: (id: string) => `/api/v1/users/${id}/restore`,
  },
  ROLES: {
    BASE: '/api/v1/roles',
    DETAILS: (id: string) => `/api/v1/roles/${id}`,
    PERMISSIONS: (id: string) => `/api/v1/roles/${id}/permissions`,
    PERMISSION_SINGLE: (id: string, code: string) => `/api/v1/roles/${id}/permissions/${code}`,
  },
  PERMISSIONS: {
    BASE: '/api/v1/permissions',
    MATRIX: '/api/v1/permissions/matrix',
  },
  STATES: {
    BASE: '/api/v1/states',
    DETAILS: (id: string) => `/api/v1/states/${id}`,
    DISTRICTS: (id: string) => `/api/v1/states/${id}/districts`,
    HIERARCHY: (id: string) => `/api/v1/states/${id}/hierarchy`,
  },
  DISTRICTS: {
    BASE: '/api/v1/districts',
    DETAILS: (id: string) => `/api/v1/districts/${id}`,
    HOSPITALS: (id: string) => `/api/v1/districts/${id}/hospitals`,
    HIERARCHY: (id: string) => `/api/v1/districts/${id}/hierarchy`,
  },
  ORGANIZATIONS: {
    BASE: '/api/v1/organizations',
  },
} as const;


