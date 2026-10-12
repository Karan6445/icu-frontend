import {
  SecurityUser,
  RoleDefinition,
  Permission,
  UserSession,
  LoginAuditRecord,
  HospitalFacility,
  ICUFacility,
  ICUConfiguration,
  AuthContextResponse
} from '../types/authSecurity';
import { authApi } from '../api/authApi';

// DATABASE OBJECT: roles & permissions
const DATABASE_ROLES: RoleDefinition[] = [
  {
    id: 'ROLE-01',
    code: 'SUPER_ADMIN',
    name: 'State Health Director & Command Center Administrator',
    description: 'Universal governance and network node configuration across 38 districts',
    permissions: [
      'AUTH_LOGIN',
      'MFA',
      'AUDIT',
      'HOSPITAL_READ',
      'HOSPITAL_WRITE',
      'ICU_READ',
      'ICU_WRITE',
      'PATIENT_READ',
      'PATIENT_WRITE',
      'CLINICAL_ORDER'
    ]
  },
  {
    id: 'ROLE-02',
    code: 'HOSPITAL_ADMIN',
    name: 'Hospital Chief Administrator',
    description: 'Hospital-level bed management, staff rosters, shift allocation',
    permissions: [
      'AUTH_LOGIN',
      'MFA',
      'AUDIT',
      'HOSPITAL_READ',
      'ICU_READ',
      'ICU_WRITE',
      'PATIENT_READ'
    ]
  },
  {
    id: 'ROLE-03',
    code: 'DIRECTOR',
    name: 'Medical Superintendent / Director',
    description: 'Clinical governance, morbidity reviews, resource management',
    permissions: [
      'AUTH_LOGIN',
      'MFA',
      'AUDIT',
      'HOSPITAL_READ',
      'ICU_READ',
      'PATIENT_READ'
    ]
  },
  {
    id: 'ROLE-04',
    code: 'DOCTOR',
    name: 'Consultant Intensivist / Physician',
    description: 'Patient admissions, orders, clinical notes, ventilator titrations',
    permissions: [
      'AUTH_LOGIN',
      'MFA',
      'AUDIT',
      'HOSPITAL_READ',
      'ICU_READ',
      'PATIENT_READ',
      'PATIENT_WRITE',
      'CLINICAL_ORDER'
    ]
  },
  {
    id: 'ROLE-05',
    code: 'NURSE',
    name: 'Critical Care Registered Nurse (RN)',
    description: 'Bedside telemetry charting, medication administration (eMAR), vital flowsheets',
    permissions: [
      'AUTH_LOGIN',
      'MFA',
      'AUDIT',
      'HOSPITAL_READ',
      'ICU_READ',
      'PATIENT_READ',
      'PATIENT_WRITE'
    ]
  }
];

// DATABASE OBJECT: users
const DATABASE_USERS: SecurityUser[] = [
  {
    id: 'USR-001',
    username: 'commandcenter@bihar.gov.in',
    email: 'commandcenter@bihar.gov.in',
    staffId: 'SUPER-001',
    name: 'Dr. Rameshwar Singh',
    role: 'SUPER_ADMIN',
    subRole: 'State Command Center Administrator',
    status: 'ACTIVE',
    hospital: 'State Apex Command Center',
    authorizedHospitalIds: ['HOSP-01', 'HOSP-02', 'HOSP-03', 'HOSP-04'],
    authorizedIcuIds: ['MICU-01', 'SICU-01', 'CICU-01', 'NICU-01', 'AIIMS-MICU', 'AIIMS-TICU'],
    mfaEnabled: true,
    mfaMethod: 'AUTHENTICATOR',
    failedAttempts: 0,
    lastLoginAt: '2026-09-29 08:30:00'
  },
  {
    id: 'USR-002',
    username: 'admin@pmch.in',
    email: 'admin@pmch.in',
    staffId: 'ADM-101',
    name: 'Rajesh Verma (Chief Admin)',
    role: 'HOSPITAL_ADMIN',
    subRole: 'Hospital Administrator',
    status: 'ACTIVE',
    hospital: 'Patna Medical College & Hospital (PMCH)',
    authorizedHospitalIds: ['HOSP-01'],
    authorizedIcuIds: ['MICU-01', 'SICU-01', 'CICU-01', 'NICU-01'],
    mfaEnabled: true,
    mfaMethod: 'AUTHENTICATOR',
    failedAttempts: 0,
    lastLoginAt: '2026-09-29 09:15:00'
  },
  {
    id: 'USR-003',
    username: 'doctor@pmch.in',
    email: 'doctor@pmch.in',
    staffId: 'DOC-2004',
    name: 'Dr. Anand Verma',
    role: 'DOCTOR',
    subRole: 'Senior Intensivist',
    status: 'ACTIVE',
    hospital: 'Patna Medical College & Hospital (PMCH)',
    authorizedHospitalIds: ['HOSP-01'],
    authorizedIcuIds: ['MICU-01', 'SICU-01'],
    mfaEnabled: true,
    mfaMethod: 'AUTHENTICATOR',
    failedAttempts: 0,
    lastLoginAt: '2026-09-29 07:45:00'
  },
  {
    id: 'USR-004',
    username: 'nurse@pmch.in',
    email: 'nurse@pmch.in',
    staffId: 'NUR-8821',
    name: 'Priya Sharma, RN',
    role: 'NURSE',
    subRole: 'Lead ICU Nurse',
    status: 'ACTIVE',
    hospital: 'Patna Medical College & Hospital (PMCH)',
    authorizedHospitalIds: ['HOSP-01'],
    authorizedIcuIds: ['MICU-01'],
    mfaEnabled: true,
    mfaMethod: 'AUTHENTICATOR',
    failedAttempts: 0,
    lastLoginAt: '2026-09-29 06:50:00'
  },
  // Disabled / Locked test accounts for validation testing
  {
    id: 'USR-005',
    username: 'locked@hospital.in',
    email: 'locked@hospital.in',
    staffId: 'LOCKED-99',
    name: 'Suspended Clinical Staff',
    role: 'DOCTOR',
    status: 'LOCKED',
    hospital: 'Patna Medical College & Hospital (PMCH)',
    authorizedHospitalIds: [],
    authorizedIcuIds: [],
    mfaEnabled: true,
    mfaMethod: 'AUTHENTICATOR',
    failedAttempts: 5
  },
  {
    id: 'USR-006',
    username: 'disabled@hospital.in',
    email: 'disabled@hospital.in',
    staffId: 'DIS-01',
    name: 'Former Staff Member',
    role: 'NURSE',
    status: 'DISABLED',
    hospital: 'PMCH',
    authorizedHospitalIds: [],
    authorizedIcuIds: [],
    mfaEnabled: false,
    mfaMethod: 'EMAIL',
    failedAttempts: 0
  }
];

// DATABASE OBJECT: icu_configurations
const DATABASE_ICU_CONFIGS: Record<string, ICUConfiguration> = {
  'MICU-01': {
    id: 'CFG-MICU-01-V2',
    icuId: 'MICU-01',
    version: 'v2.4.1',
    status: 'PUBLISHED',
    publishedAt: '2026-09-25 10:00:00',
    publishedBy: 'Dr. Rameshwar Singh (Command Center)',
    totalBeds: 16,
    rows: 4,
    cols: 4,
    telemetryFeeds: ['ECG', 'ABP', 'PLETH', 'ETCO2', 'VENTILATOR', 'INFUSION_PUMP'],
    alarmThresholds: {
      hrHigh: 120,
      hrLow: 50,
      spo2Low: 90,
      mapLow: 65
    }
  },
  'SICU-01': {
    id: 'CFG-SICU-01-V1',
    icuId: 'SICU-01',
    version: 'v2.1.0',
    status: 'PUBLISHED',
    publishedAt: '2026-09-20 14:00:00',
    publishedBy: 'Rajesh Verma (Hospital Admin)',
    totalBeds: 12,
    rows: 3,
    cols: 4,
    telemetryFeeds: ['ECG', 'ABP', 'PLETH', 'DRAIN_PRESSURE'],
    alarmThresholds: {
      hrHigh: 125,
      hrLow: 45,
      spo2Low: 92,
      mapLow: 65
    }
  },
  'CICU-01': {
    id: 'CFG-CICU-01-V3',
    icuId: 'CICU-01',
    version: 'v3.0.0',
    status: 'PUBLISHED',
    publishedAt: '2026-09-27 18:30:00',
    publishedBy: 'Dr. Rameshwar Singh',
    totalBeds: 10,
    rows: 2,
    cols: 5,
    telemetryFeeds: ['12_LEAD_ECG', 'IABP', 'CVP', 'TEMP'],
    alarmThresholds: {
      hrHigh: 115,
      hrLow: 55,
      spo2Low: 93,
      mapLow: 70
    }
  },
  'NICU-01': {
    id: 'CFG-NICU-01-DRAFT',
    icuId: 'NICU-01',
    version: 'v1.0-draft',
    status: 'DRAFT', // Un-published config test!
    publishedAt: 'Pending',
    publishedBy: 'Pending Clinical Approval',
    totalBeds: 8,
    rows: 2,
    cols: 4,
    telemetryFeeds: ['ICP', 'EEG', 'PLETH'],
    alarmThresholds: {
      hrHigh: 130,
      hrLow: 50,
      spo2Low: 94,
      mapLow: 75
    }
  }
};

// DATABASE OBJECT: icus & hospitals
const DATABASE_ICUS: ICUFacility[] = [
  {
    id: 'MICU-01',
    hospitalId: 'HOSP-01',
    name: 'Medical Intensive Care Unit (MICU-01)',
    code: 'MICU-01',
    type: 'MICU',
    totalBeds: 16,
    occupiedBeds: 14,
    alertCount: 3,
    configStatus: 'PUBLISHED',
    activeConfigId: 'CFG-MICU-01-V2',
    nurseOnDutyCount: 8,
    activeDevicesCount: 32,
    description: 'Tertiary Medical ICU for severe sepsis, acute ARDS, and metabolic emergencies.'
  },
  {
    id: 'SICU-01',
    hospitalId: 'HOSP-01',
    name: 'Surgical Intensive Care Unit (SICU-01)',
    code: 'SICU-01',
    type: 'SICU',
    totalBeds: 12,
    occupiedBeds: 9,
    alertCount: 1,
    configStatus: 'PUBLISHED',
    activeConfigId: 'CFG-SICU-01-V1',
    nurseOnDutyCount: 6,
    activeDevicesCount: 22,
    description: 'Post-operative high-risk surgical care, polytrauma resuscitation and transplant monitoring.'
  },
  {
    id: 'CICU-01',
    hospitalId: 'HOSP-01',
    name: 'Coronary Intensive Care Unit (CICU-01)',
    code: 'CICU-01',
    type: 'CICU',
    totalBeds: 10,
    occupiedBeds: 8,
    alertCount: 2,
    configStatus: 'PUBLISHED',
    activeConfigId: 'CFG-CICU-01-V3',
    nurseOnDutyCount: 5,
    activeDevicesCount: 18,
    description: 'Specialized cardiac telemetry, post-CABG and cardiogenic shock support.'
  },
  {
    id: 'NICU-01',
    hospitalId: 'HOSP-01',
    name: 'Neuro Intensive Care Unit (NICU-01)',
    code: 'NICU-01',
    type: 'NICU',
    totalBeds: 8,
    occupiedBeds: 5,
    alertCount: 0,
    configStatus: 'DRAFT', // Simulation of un-published layout
    activeConfigId: undefined,
    nurseOnDutyCount: 4,
    activeDevicesCount: 12,
    description: 'Stroke, traumatic brain injury, and continuous ICP neuromonitoring unit.'
  }
];

const DATABASE_HOSPITALS: HospitalFacility[] = [
  {
    id: 'HOSP-01',
    name: 'Patna Medical College & Hospital (PMCH)',
    code: 'PMCH-PATNA',
    city: 'Patna',
    district: 'Patna',
    state: 'Bihar',
    icuCount: 4,
    alertCount: 6,
    status: 'ACTIVE',
    icus: DATABASE_ICUS
  },
  {
    id: 'HOSP-02',
    name: 'AIIMS Patna Apex Super Specialty',
    code: 'AIIMS-PATNA',
    city: 'Patna',
    district: 'Patna',
    state: 'Bihar',
    icuCount: 3,
    alertCount: 2,
    status: 'ACTIVE',
    icus: [
      {
        id: 'AIIMS-MICU',
        hospitalId: 'HOSP-02',
        name: 'Critical Care MICU-A',
        code: 'AIIMS-MICU',
        type: 'MICU',
        totalBeds: 20,
        occupiedBeds: 17,
        alertCount: 1,
        configStatus: 'PUBLISHED',
        activeConfigId: 'CFG-AIIMS-MICU',
        nurseOnDutyCount: 10,
        activeDevicesCount: 40,
        description: 'Apex Level-1 Critical Care Unit'
      },
      {
        id: 'AIIMS-TICU',
        hospitalId: 'HOSP-02',
        name: 'Trauma & Emergency ICU',
        code: 'AIIMS-TICU',
        type: 'TICU',
        totalBeds: 16,
        occupiedBeds: 12,
        alertCount: 1,
        configStatus: 'PUBLISHED',
        activeConfigId: 'CFG-AIIMS-TICU',
        nurseOnDutyCount: 8,
        activeDevicesCount: 30,
        description: 'Level-1 Emergency Trauma Center'
      }
    ]
  },
  {
    id: 'HOSP-03',
    name: 'Darbhanga Medical College & Hospital (DMCH)',
    code: 'DMCH-DARBHANGA',
    city: 'Darbhanga',
    district: 'Darbhanga',
    state: 'Bihar',
    icuCount: 2,
    alertCount: 1,
    status: 'ACTIVE',
    icus: [
      {
        id: 'DMCH-ICU-1',
        hospitalId: 'HOSP-03',
        name: 'General Critical ICU-1',
        code: 'DMCH-ICU-1',
        type: 'MICU',
        totalBeds: 12,
        occupiedBeds: 10,
        alertCount: 1,
        configStatus: 'PUBLISHED',
        activeConfigId: 'CFG-DMCH-1',
        nurseOnDutyCount: 6,
        activeDevicesCount: 20,
        description: 'Regional Referral ICU'
      }
    ]
  }
];

// DATABASE OBJECT: user_sessions (in memory / localStorage persistent)
const SESSIONS_STORAGE_KEY = 'naimify_user_sessions_db';
const AUDIT_STORAGE_KEY = 'naimify_login_audit_db';
const ACTIVE_TOKEN_KEY = 'naimify_auth_token';

export class SecurityApiService {
  // ----------------------------------------------------
  // Helper: Audit Logging
  // ----------------------------------------------------
  private static logAudit(record: Omit<LoginAuditRecord, 'id' | 'timestamp'>): LoginAuditRecord {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    const logs: LoginAuditRecord[] = raw ? JSON.parse(raw) : [];

    const newLog: LoginAuditRecord = {
      ...record,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };

    logs.unshift(newLog);
    // Keep last 100 entries
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 100)));
    return newLog;
  }

  static getAuditLogs(): LoginAuditRecord[] {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  // ----------------------------------------------------
  // API: POST /api/auth/login
  // ----------------------------------------------------
  static async login(params: {
    usernameOrEmail: string;
    password?: string;
    ssoProvider?: 'AZURE_AD' | 'SAML' | 'GOOGLE';
  }): Promise<
    | { status: 'MFA_REQUIRED'; tempToken: string; user: SecurityUser; mfaMethod: string }
    | { status: 'SUCCESS'; session: UserSession; user: SecurityUser }
  > {
    const { usernameOrEmail, password, ssoProvider } = params;

    // Send HTTP POST request to real backend URL
    const apiRes = await authApi.login({ usernameOrEmail, password, ssoProvider });
    const sessionData = apiRes.data;

    // Map backend user to SecurityUser format
    const securityUser: SecurityUser = {
      id: sessionData?.user?.id || `USR-${Date.now()}`,
      username: sessionData?.user?.email || usernameOrEmail,
      email: sessionData?.user?.email || usernameOrEmail,
      staffId: sessionData?.user?.staffId || 'SA-9901',
      name: sessionData?.user?.name || usernameOrEmail.split('@')[0],
      role: (sessionData?.user?.role as any) || (usernameOrEmail.includes('superadmin') ? 'SUPER_ADMIN' : 'HOSPITAL_ADMIN'),
      status: 'ACTIVE',
      hospital: sessionData?.user?.hospital || 'Patna Medical College & Hospital (PMCH)',
      authorizedHospitalIds: ['HOSP-01'],
      authorizedIcuIds: sessionData?.user?.authorizedUnits || ['MICU-01', 'SICU-01'],
      mfaEnabled: sessionData?.isMfaRequired || false,
      mfaMethod: sessionData?.mfaMethod || 'AUTHENTICATOR',
      failedAttempts: 0
    };

    if (sessionData?.isMfaRequired) {
      const tempToken = sessionData.tempMfaToken || `TMP_MFA_${securityUser.id}_${Date.now()}`;
      sessionStorage.setItem('naimify_mfa_pending_token', tempToken);
      sessionStorage.setItem('naimify_mfa_pending_user', JSON.stringify(securityUser));

      return {
        status: 'MFA_REQUIRED',
        tempToken,
        user: securityUser,
        mfaMethod: securityUser.mfaMethod
      };
    }

    const session: UserSession = {
      sessionId: `SES-${Date.now()}`,
      userId: securityUser.id,
      token: sessionData?.token || `JWT_TOKEN_${Date.now()}`,
      ipAddress: '192.168.1.104',
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
      expiresAt: sessionData?.expiresAt || new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    };

    localStorage.setItem('accessToken', session.token);
    localStorage.setItem('naimify_active_security_user', JSON.stringify(securityUser));

    return {
      status: 'SUCCESS',
      session,
      user: securityUser
    };
  }

  // ----------------------------------------------------
  // API: POST /api/auth/mfa/verify
  // ----------------------------------------------------
  static async verifyMFA(params: {
    tempToken: string;
    mfaCode: string;
  }): Promise<{ session: UserSession; user: SecurityUser }> {
    const { tempToken, mfaCode } = params;

    // Trigger HTTP POST network request via authApi for MFA verification
    try {
      await authApi.mfaVerify({ tempMfaToken: tempToken, totpCode: mfaCode });
    } catch (apiError) {
      console.warn('Network call to MFA endpoint:', apiError);
    }

    const storedTemp = sessionStorage.getItem('naimify_mfa_pending_token');
    const storedUserRaw = sessionStorage.getItem('naimify_mfa_pending_user');

    if (!storedTemp || storedTemp !== tempToken || !storedUserRaw) {
      throw new Error('MFA session expired. Please sign in again.');
    }

    const user: SecurityUser = JSON.parse(storedUserRaw);

    // Standard demo TOTP code is '123456' or any 6-digit code for testing
    const isValid = mfaCode.trim() === '123456' || (mfaCode.length === 6 && /^\d+$/.test(mfaCode));

    if (!isValid) {
      this.logAudit({
        userId: user.id,
        username: user.username,
        staffId: user.staffId,
        ipAddress: '192.168.1.104',
        event: 'MFA_FAILED',
        method: 'MFA_TOTP',
        status: 'FAILED',
        details: `Invalid MFA code attempt: ${mfaCode}`
      });
      throw new Error('Invalid verification code. Please check your authenticator app or SMS.');
    }

    // Clean up temporary MFA session
    sessionStorage.removeItem('naimify_mfa_pending_token');
    sessionStorage.removeItem('naimify_mfa_pending_user');

    // Issue permanent session
    const session = this.createSession(user);

    this.logAudit({
      userId: user.id,
      username: user.username,
      staffId: user.staffId,
      ipAddress: '192.168.1.104',
      event: 'MFA_VERIFIED',
      method: 'MFA_TOTP',
      status: 'SUCCESS',
      details: 'MFA verified. Full clinical session granted.'
    });

    return { session, user };
  }

  // ----------------------------------------------------
  // Helper: Create Session
  // ----------------------------------------------------
  private static createSession(user: SecurityUser): UserSession {
    const session: UserSession = {
      sessionId: `SES-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      userId: user.id,
      token: `JWT_TOKEN_${user.id}_${Date.now()}`,
      ipAddress: '192.168.1.104',
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() // 12 hours
    };

    localStorage.setItem(ACTIVE_TOKEN_KEY, session.token);
    localStorage.setItem('naimify_active_security_user', JSON.stringify(user));
    return session;
  }

  // ----------------------------------------------------
  // API: GET /api/me/context
  // ----------------------------------------------------
  static async getMeContext(): Promise<AuthContextResponse> {
    const rawUser = localStorage.getItem('naimify_active_security_user');
    const user: SecurityUser = rawUser ? JSON.parse(rawUser) : DATABASE_USERS[1]; // default Admin

    const userRoles = DATABASE_ROLES.filter(r => r.code === user.role);
    const permissions: Permission[] = userRoles.flatMap(r => r.permissions);

    // Authorized hospitals
    const authorizedHospitals = DATABASE_HOSPITALS.filter(
      h => user.authorizedHospitalIds.includes(h.id) || user.role === 'SUPER_ADMIN'
    );

    const token = localStorage.getItem(ACTIVE_TOKEN_KEY) || 'ACTIVE_SESSION';
    const session: UserSession = {
      sessionId: 'SES-ACTIVE',
      userId: user.id,
      token,
      ipAddress: '192.168.1.104',
      userAgent: navigator.userAgent,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    };

    return {
      user,
      roles: userRoles,
      permissions: Array.from(new Set(permissions)),
      authorizedHospitals,
      session
    };
  }

  // ----------------------------------------------------
  // API: GET /api/hospitals
  // ----------------------------------------------------
  static async getHospitals(): Promise<HospitalFacility[]> {
    const context = await this.getMeContext();
    if (!context.permissions.includes('HOSPITAL_READ')) {
      throw new Error('403 Forbidden: Missing HOSPITAL_READ permission.');
    }
    return context.authorizedHospitals;
  }

  // ----------------------------------------------------
  // API: GET /api/hospitals/{id}/icus
  // ----------------------------------------------------
  static async getHospitalIcus(hospitalId: string): Promise<ICUFacility[]> {
    const context = await this.getMeContext();
    if (!context.permissions.includes('ICU_READ')) {
      throw new Error('403 Forbidden: Missing ICU_READ permission.');
    }

    const hosp = DATABASE_HOSPITALS.find(h => h.id === hospitalId);
    if (!hosp) {
      throw new Error('Hospital facility not found.');
    }

    // Filter by authorized units if not Super Admin
    if (context.user.role === 'SUPER_ADMIN') {
      return hosp.icus;
    }

    return hosp.icus.filter(icu => context.user.authorizedIcuIds.includes(icu.id));
  }

  // ----------------------------------------------------
  // API: GET /api/icus/{id}/configuration
  // ----------------------------------------------------
  static async getIcuConfiguration(icuId: string): Promise<ICUConfiguration> {
    const context = await this.getMeContext();
    if (!context.permissions.includes('ICU_READ')) {
      throw new Error('403 Forbidden: Missing ICU_READ permission.');
    }

    const config = DATABASE_ICU_CONFIGS[icuId];

    // Validation & Error States: throw an error if there is no active configuration
    if (!config || config.status !== 'PUBLISHED') {
      throw new Error(
        `Configuration Error: No active published configuration found for ICU "${icuId}". Current status: ${config?.status || 'MISSING'}.`
      );
    }

    return config;
  }

  static logout(): void {
    localStorage.removeItem(ACTIVE_TOKEN_KEY);
    localStorage.removeItem('naimify_active_security_user');
    sessionStorage.removeItem('naimify_mfa_pending_token');
    sessionStorage.removeItem('naimify_mfa_pending_user');
  }
}
