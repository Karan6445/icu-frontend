// Database Objects & API Interfaces for Screen 01 (Auth / SSO / MFA) and Screen 02 (Hospital & ICU Selector)

export type UserStatus = 'ACTIVE' | 'LOCKED' | 'DISABLED';

export type UserRoleCode = 'SUPER_ADMIN' | 'HOSPITAL_ADMIN' | 'DIRECTOR' | 'DOCTOR' | 'NURSE';

export type Permission =
  | 'AUTH_LOGIN'
  | 'MFA'
  | 'AUDIT'
  | 'HOSPITAL_READ'
  | 'HOSPITAL_WRITE'
  | 'ICU_READ'
  | 'ICU_WRITE'
  | 'PATIENT_READ'
  | 'PATIENT_WRITE'
  | 'CLINICAL_ORDER';

export interface RoleDefinition {
  id: string;
  code: UserRoleCode;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface SecurityUser {
  id: string;
  username: string;
  email: string;
  staffId: string;
  name: string;
  role: UserRoleCode;
  subRole?: string;
  status: UserStatus;
  hospital: string;
  authorizedHospitalIds: string[];
  authorizedIcuIds: string[];
  mfaEnabled: boolean;
  mfaMethod: 'AUTHENTICATOR' | 'SMS' | 'EMAIL';
  failedAttempts: number;
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface UserSession {
  sessionId: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
}

export type LoginAuditEvent =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'MFA_REQUIRED'
  | 'MFA_VERIFIED'
  | 'MFA_FAILED'
  | 'ACCOUNT_LOCKED';

export interface LoginAuditRecord {
  id: string;
  timestamp: string;
  userId?: string;
  username: string;
  staffId?: string;
  ipAddress: string;
  event: LoginAuditEvent;
  method: 'PASSWORD' | 'SSO_SAML' | 'SSO_OIDC' | 'MFA_TOTP';
  status: 'SUCCESS' | 'FAILED' | 'DENIED';
  details?: string;
}

export interface ICUConfiguration {
  id: string;
  icuId: string;
  version: string;
  status: 'PUBLISHED' | 'DRAFT' | 'MAINTENANCE';
  publishedAt: string;
  publishedBy: string;
  totalBeds: number;
  rows: number;
  cols: number;
  telemetryFeeds: string[];
  alarmThresholds: {
    hrHigh: number;
    hrLow: number;
    spo2Low: number;
    mapLow: number;
  };
}

export interface ICUFacility {
  id: string;
  hospitalId: string;
  name: string;
  code: string;
  type: 'MICU' | 'SICU' | 'CICU' | 'NICU' | 'TICU';
  totalBeds: number;
  occupiedBeds: number;
  alertCount: number;
  configStatus: 'PUBLISHED' | 'DRAFT' | 'MAINTENANCE';
  activeConfigId?: string;
  nurseOnDutyCount: number;
  activeDevicesCount: number;
  description: string;
}

export interface HospitalFacility {
  id: string;
  name: string;
  code: string;
  city: string;
  district: string;
  state: string;
  icuCount: number;
  alertCount: number;
  status: 'ACTIVE' | 'CRITICAL_CAPACITY' | 'MAINTENANCE';
  icus: ICUFacility[];
}

export interface AuthContextResponse {
  user: SecurityUser;
  roles: RoleDefinition[];
  permissions: Permission[];
  authorizedHospitals: HospitalFacility[];
  session: UserSession;
}
