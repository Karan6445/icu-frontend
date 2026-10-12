import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

// ----------------------------------------------------
// Request & Response Types for Auth & Identity APIs
// ----------------------------------------------------

export interface LoginPayload {
  email?: string;
  usernameOrEmail?: string;
  password?: string;
  hospital_id?: string;
  device_id?: string;
  role?: string;
  ssoProvider?: 'AZURE_AD' | 'SAML' | 'GOOGLE';
}

export interface UserSessionInfo {
  token?: string;
  access_token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  isMfaRequired?: boolean;
  tempMfaToken?: string;
  mfaMethod?: 'AUTHENTICATOR' | 'SMS' | 'EMAIL';
  user?: {
    id: string;
    staffId?: string;
    name: string;
    email: string;
    role: string;
    hospital?: string;
    authorizedUnits?: string[];
    mfaEnabled?: boolean;
  };
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface MfaSetupResponse {
  secret: string;
  provisioning_uri?: string;
  qr_code?: string;
  qrCodeUrl: string;
  manualEntryKey: string;
  recoveryCodes?: string[];
}

export interface MfaEnablePayload {
  code?: string;
  secret?: string;
  totpCode?: string;
}

export interface MfaEnableResponse {
  success: boolean;
  mfaEnabled: boolean;
  status?: string;
  recoveryCodes: string[];
  message?: string;
}

export interface MfaVerifyPayload {
  mfa_token?: string;
  code?: string;
  device_id?: string;
  // Aliases for backward compatibility
  tempMfaToken?: string;
  totpCode?: string;
  recoveryCode?: string;
}

export interface MfaDisablePayload {
  password: string;
  code?: string;
  totpCode?: string;
  recoveryCode?: string;
}

export interface MfaRegenerateRecoveryCodesPayload {
  password: string;
  code: string;
}

export interface RegenerateRecoveryCodesResponse {
  success: boolean;
  recoveryCodes: string[];
  message?: string;
}

export const getDeviceId = (): string => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Web Browser Client';
  }

  let deviceId = localStorage.getItem('naimify_device_id');
  if (!deviceId) {
    const ua = navigator.userAgent;

    // Detect Browser Name
    let browser = 'Google Chrome';
    if (ua.includes('Edg/')) {
      browser = 'Microsoft Edge';
    } else if (ua.includes('OPR/') || ua.includes('Opera')) {
      browser = 'Opera Browser';
    } else if (ua.includes('Firefox/')) {
      browser = 'Mozilla Firefox';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      browser = 'Apple Safari';
    } else if (ua.includes('Chrome/')) {
      browser = 'Google Chrome';
    }

    // Detect Device Name / Platform
    let deviceName = 'Desktop PC';
    if (ua.includes('Windows')) {
      deviceName = 'Windows PC';
    } else if (ua.includes('Macintosh') || ua.includes('Mac OS')) {
      deviceName = 'Mac Workstation';
    } else if (ua.includes('iPhone')) {
      deviceName = 'iPhone';
    } else if (ua.includes('iPad')) {
      deviceName = 'iPad';
    } else if (ua.includes('Android')) {
      deviceName = 'Android Device';
    } else if (ua.includes('Linux')) {
      deviceName = 'Linux Workstation';
    }

    deviceId = `${browser} on ${deviceName}`;
    localStorage.setItem('naimify_device_id', deviceId);
  }
  return deviceId;
};

// ----------------------------------------------------
// Auth & Identity API Service Layer
// ----------------------------------------------------

export const authApi = {
  /**
   * 1. POST /api/v1/auth/login
   * User Authentication & Token Issuance
   */
  async login(payload: LoginPayload): Promise<ApiResponse<UserSessionInfo>> {
    const emailVal = payload.email || payload.usernameOrEmail || '';
    const isSuperAdmin = payload.role === 'SUPER_ADMIN' || emailVal.includes('superadmin');
    const isDoctor = payload.role === 'DOCTOR' || emailVal.includes('doctor');
    const isNurse = payload.role === 'NURSE' || emailVal.includes('nurse');

    const bodyPayload: Record<string, any> = {
      email: emailVal,
      password: payload.password,
      hospital_id: payload.hospital_id || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      device_id: payload.device_id || getDeviceId(),
    };

    if (payload.role) {
      bodyPayload.role = payload.role;
    }
    if (payload.ssoProvider) {
      bodyPayload.ssoProvider = payload.ssoProvider;
    }

    return apiClient.post(API_ENDPOINTS.AUTH.LOGIN, bodyPayload);
  },

  /**
   * 2. POST /api/v1/auth/refresh
   * Rotate Access Token via Refresh Token
   */
  async refresh(payload: RefreshTokenPayload): Promise<ApiResponse<RefreshTokenResponse>> {
    return apiClient.post(API_ENDPOINTS.AUTH.REFRESH, payload);
  },

  /**
   * 3. POST /api/v1/auth/logout
   * Revoke Active Session
   */
  async logout(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
  },

  /**
   * 4. GET /api/v1/auth/me
   * Get Current Authenticated Profile
   */
  async me(): Promise<ApiResponse<UserSessionInfo['user']>> {
    return apiClient.get(API_ENDPOINTS.AUTH.ME);
  },

  /**
   * 5. POST /api/v1/auth/change-password
   * Update User Password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return apiClient.post(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload,
      { success: true, message: 'Password changed successfully.' }
    );
  },

  /**
   * 6. POST /api/v1/auth/mfa/setup
   * Initiate TOTP MFA Enrollment
   */
  /**
   * 6. POST /api/v1/auth/mfa/setup
   * Initiate TOTP MFA Enrollment
   */
  async mfaSetup(): Promise<ApiResponse<MfaSetupResponse>> {
    const res = await apiClient.post<any>(API_ENDPOINTS.AUTH.MFA_SETUP, {});
    const raw = res.data?.data || res.data;
    const normalized: MfaSetupResponse = {
      secret: raw?.secret || '',
      provisioning_uri: raw?.provisioning_uri || '',
      qr_code: raw?.qr_code || '',
      qrCodeUrl: raw?.qr_code || raw?.qrCodeUrl || '',
      manualEntryKey: raw?.secret || raw?.manualEntryKey || '',
      recoveryCodes: raw?.recovery_codes || raw?.recoveryCodes || [],
    };
    return {
      ...res,
      data: normalized,
    };
  },

  /**
   * 7. POST /api/v1/auth/mfa/enable
   * Verify and Activate TOTP MFA
   */
  async mfaEnable(payload: MfaEnablePayload): Promise<ApiResponse<MfaEnableResponse>> {
    const code = (payload.code || payload.totpCode || '').trim();
    const res = await apiClient.post<any>(API_ENDPOINTS.AUTH.MFA_ENABLE, { code });
    const raw = res.data?.data || res.data;
    const normalized: MfaEnableResponse = {
      success: true,
      mfaEnabled: true,
      status: raw?.status || 'MFA_ENABLED',
      recoveryCodes: raw?.recovery_codes || raw?.recoveryCodes || [],
      message: raw?.message || 'MFA enabled successfully.',
    };
    return {
      ...res,
      data: normalized,
    };
  },

  /**
   * 8. POST /api/v1/auth/mfa/verify
   * Resolve Login MFA Challenge via TOTP or Recovery Code
   */
  async mfaVerify(payload: MfaVerifyPayload): Promise<ApiResponse<UserSessionInfo>> {
    const token = payload.mfa_token || payload.tempMfaToken || '';
    const code = (payload.code || payload.totpCode || payload.recoveryCode || '').trim();
    const deviceId = payload.device_id || getDeviceId();

    const res = await apiClient.post<any>(API_ENDPOINTS.AUTH.MFA_VERIFY, {
      mfa_token: token,
      code,
      device_id: deviceId,
    });

    const raw = res.data?.data || res.data;
    const accessToken = raw?.access_token || raw?.accessToken || raw?.token;
    const refreshToken = raw?.refresh_token || raw?.refreshToken;

    const normalized: UserSessionInfo = {
      token: accessToken,
      access_token: accessToken,
      accessToken,
      refreshToken,
      expiresAt: raw?.expires_in ? new Date(Date.now() + raw.expires_in * 1000).toISOString() : undefined,
      user: {
        id: raw?.user_id || raw?.id || '',
        name: raw?.full_name || raw?.name || (raw?.email ? raw.email.split('@')[0] : 'Staff Member'),
        email: raw?.email || '',
        role: raw?.role || 'ICU_STAFF_NURSE',
        hospital: raw?.hospital_id || '',
        mfaEnabled: true,
      },
    };

    return {
      ...res,
      data: normalized,
    };
  },

  /**
   * 9. POST /api/v1/auth/mfa/disable
   * Disable TOTP MFA on Account
   */
  async mfaDisable(payload: MfaDisablePayload): Promise<ApiResponse<{ success: boolean; mfaEnabled: boolean; message?: string }>> {
    const code = (payload.code || payload.totpCode || payload.recoveryCode || '').trim();
    const res = await apiClient.post<any>(API_ENDPOINTS.AUTH.MFA_DISABLE, {
      password: payload.password,
      code,
    });
    const raw = res.data?.data || res.data;
    return {
      ...res,
      data: {
        success: true,
        mfaEnabled: false,
        message: raw?.message || 'Multi-Factor Authentication disabled successfully.',
      },
    };
  },

  /**
   * 10. POST /api/v1/auth/mfa/recovery-codes/regenerate
   * Regenerate MFA One-Time Recovery Codes
   */
  async mfaRegenerateRecoveryCodes(payload?: MfaRegenerateRecoveryCodesPayload): Promise<ApiResponse<RegenerateRecoveryCodesResponse>> {
    const body = payload || { password: '', code: '' };
    const res = await apiClient.post<any>(API_ENDPOINTS.AUTH.MFA_REGENERATE_RECOVERY_CODES, body);
    const raw = res.data?.data || res.data;
    const normalized: RegenerateRecoveryCodesResponse = {
      success: true,
      recoveryCodes: raw?.recovery_codes || raw?.recoveryCodes || [],
      message: raw?.message || 'New recovery codes generated successfully.',
    };
    return {
      ...res,
      data: normalized,
    };
  },
};

export default authApi;