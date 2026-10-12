import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';
import { HOSPITAL_ADMIN_EXACT_PERMISSIONS, CHARGE_NURSE_EXACT_PERMISSIONS } from '../../config/rbacConfig';

export type SystemRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'ADMIN'
  | 'DIRECTOR'
  | 'CHARGE_NURSE'
  | 'NURSE_LEAD'
  | 'ECLINIC_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'CLINIC_OPERATOR'
  | 'RECEPTIONIST';

export interface UserProfile {
  id: string;
  staffId: string;
  name: string;
  email: string;
  role: SystemRole;
  department: string;
  avatarUrl?: string;
  authorizedUnits: string[];
  status: 'ON_DUTY' | 'OFF_DUTY' | 'ON_CALL';
  specialty?: string;
  experience?: string;
  hospital?: string;
  hospitalId?: string;
  permissions?: string[];
  mfaEnabled?: boolean;
  mfaMethod?: string;
}

export interface AuthState {
  user: UserProfile | null;
  currentUser: UserProfile;
  activeRole: SystemRole;
  isAuthenticated: boolean;
  requiresMfa: boolean;
  loading: boolean;
  error: string | null;
  lastApiResponse: any | null;
}

const defaultUser: UserProfile = {
  id: '',
  staffId: '',
  name: '',
  email: '',
  role: 'SUPER_ADMIN',
  department: '',
  authorizedUnits: [],
  status: 'ON_DUTY',
  mfaEnabled: false,
};

const getInitialUser = (): UserProfile => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('naimify_active_security_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return formatUserProfile(parsed);
      } catch {}
    }
  }
  return defaultUser;
};

const formatUserProfile = (rawUserData: any): UserProfile => {
  if (!rawUserData) {
    return defaultUser;
  }
  const userData = rawUserData.data || rawUserData;
  const rawRole = (userData.role || '').toString().toLowerCase();

  let role: SystemRole = 'SUPER_ADMIN';
  if (rawRole.includes('command') || rawRole.includes('super') || userData.is_command_center) {
    role = 'SUPER_ADMIN';
  } else if (rawRole.includes('charge') || rawRole === 'charge_nurse') {
    role = 'CHARGE_NURSE';
  } else if (rawRole.includes('hospital') || rawRole.includes('admin')) {
    role = 'HOSPITAL_ADMIN';
  } else if (rawRole.includes('doctor') || rawRole.includes('physician')) {
    role = 'DOCTOR';
  } else if (rawRole.includes('nurse')) {
    role = 'NURSE';
  } else if (userData.role) {
    role = userData.role as SystemRole;
  }

  // Retrieve permissions either from payload, cached storage, or role defaults
  let userPermissions: string[] = [];
  if (Array.isArray(userData.permissions) && userData.permissions.length > 0) {
    userPermissions = userData.permissions;
  } else if (typeof window !== 'undefined') {
    const cachedPerms = localStorage.getItem('icu_user_permissions');
    if (cachedPerms) {
      try {
        userPermissions = JSON.parse(cachedPerms);
      } catch {}
    }
  }

  // Authoritative default fallback if not yet provided by server
  if (userPermissions.length === 0 && role === 'HOSPITAL_ADMIN') {
    userPermissions = HOSPITAL_ADMIN_EXACT_PERMISSIONS;
  } else if (userPermissions.length === 0 && (role === 'CHARGE_NURSE' || role === 'NURSE_LEAD')) {
    userPermissions = CHARGE_NURSE_EXACT_PERMISSIONS;
  }

  const isChargeNurse = role === 'CHARGE_NURSE' || role === 'NURSE_LEAD';

  const profile: UserProfile = {
    id: userData.id || userData.user_id || (isChargeNurse ? 'f40d0237-ffa7-458b-bda6-752204c24483' : (role === 'HOSPITAL_ADMIN' ? 'ec647bb6-0880-4f80-bfc4-70f4c37122ec' : 'b503be05-e5e5-43c0-b853-4cf88a014423')),
    staffId: userData.staffId || userData.staff_id || (role === 'SUPER_ADMIN' ? 'CMD-001' : (role === 'HOSPITAL_ADMIN' ? 'HA-8801' : (isChargeNurse ? 'CN-7704' : 'SA-9901'))),
    name: userData.name || (role === 'SUPER_ADMIN' ? 'Command Center Directorate (Super Admin)' : (role === 'HOSPITAL_ADMIN' ? 'Hospital Medical Administrator' : (isChargeNurse ? 'Charge Nurse Vikram Sharma' : (userData.email ? userData.email.split('@')[0] : 'Authenticated User')))),
    email: userData.email || (role === 'SUPER_ADMIN' ? 'superadmin@smarticu.org' : (role === 'HOSPITAL_ADMIN' ? 'hospital.admin@smarticu.org' : (isChargeNurse ? 'nurse.charge@smarticu.org' : 'user@smarticu.org'))),
    role: role,
    department: userData.department || (role === 'SUPER_ADMIN' ? 'Statewide Critical Care Directorate' : (role === 'HOSPITAL_ADMIN' ? 'Executive Administration & ICU Operations' : (isChargeNurse ? 'Intensive Care Unit (MICU / SICU)' : 'Critical Care Unit'))),
    authorizedUnits: userData.authorizedUnits || userData.authorized_units || ['MICU-01', 'SICU-01'],
    status: userData.status || 'ON_DUTY',
    specialty: userData.specialty || (role === 'SUPER_ADMIN' ? 'Chief Directorate Administrator' : (role === 'HOSPITAL_ADMIN' ? 'Hospital Operations & Critical Care Administration' : (isChargeNurse ? 'ICU Charge Nurse & Clinical Care Lead' : 'Intensivist'))),
    experience: userData.experience || (isChargeNurse ? '8+ Years Critical Care' : '10+ Years'),
    hospital: userData.hospital || userData.hospital_name || (role === 'SUPER_ADMIN' ? 'Statewide Command Center Network' : 'Apollo Super Specialty Hospital, Gandhinagar'),
    hospitalId: userData.hospitalId || userData.hospital_id || 'a324634e-b022-44ac-b633-448e14f35ad4',
    permissions: userPermissions,
    mfaEnabled: userData.mfaEnabled ?? userData.mfa_enabled ?? false,
    mfaMethod: userData.mfaMethod || userData.mfa_method || 'AUTHENTICATOR',
  };

  if (typeof window !== 'undefined' && userPermissions.length > 0) {
    try {
      localStorage.setItem('icu_user_permissions', JSON.stringify(userPermissions));
    } catch {}
  }

  return profile;
};

const getInitialToken = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!(localStorage.getItem('accessToken') || localStorage.getItem('icu_auth_token'));
  }
  return false;
};

const hasInitialToken = getInitialToken();
const initialUser = getInitialUser();

const initialState: AuthState = {
  user: hasInitialToken ? initialUser : null,
  currentUser: initialUser,
  activeRole: initialUser.role || 'SUPER_ADMIN',
  isAuthenticated: hasInitialToken,
  requiresMfa: false,
  loading: false,
  error: null,
  lastApiResponse: null,
};

// ----------------------------------------------------
// Async Thunks
// ----------------------------------------------------

/**
 * Fetch authoritative user profile from GET /api/v1/auth/me
 */
export const fetchCurrentUserThunk = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('icu_auth_token');
    if (!token) {
      return rejectWithValue('No access token found');
    }
    try {
      const response = await authApi.me();
      return response.data;
    } catch (err: any) {
      const cached = localStorage.getItem('naimify_active_security_user');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
      return rejectWithValue(err.message || 'Session verification failed.');
    }
  }
);

/**
 * Perform login via POST /api/v1/auth/login and retrieve /auth/me
 */
export const loginUserThunk = createAsyncThunk(
  'auth/loginUser',
  async (payload: import('../../api/authApi').LoginPayload, { dispatch, rejectWithValue }) => {
    try {
      // Clear stale user state before initiating new login
      dispatch(resetAuthState());

      const res = await authApi.login(payload);
      const resData: any = res.data;
      const innerData = resData?.data || resData;

      const isMfaRequired = Boolean(
        innerData?.mfa_required ||
        resData?.mfa_required ||
        innerData?.isMfaRequired ||
        resData?.isMfaRequired
      );
      const challengeToken =
        innerData?.mfa_token ||
        resData?.mfa_token ||
        innerData?.tempMfaToken ||
        resData?.tempMfaToken;

      if (isMfaRequired && challengeToken) {
        return {
          isMfaRequired: true,
          tempMfaToken: challengeToken,
          user: innerData?.user || resData?.user || {
            email: innerData?.email || payload.email || payload.usernameOrEmail,
            name: (innerData?.email || payload.email || '').split('@')[0],
            role: 'ICU_STAFF_NURSE'
          },
          lastApiResponse: res
        };
      }

      const token = innerData?.access_token || innerData?.token || innerData?.accessToken || resData?.access_token || resData?.token;
      const refreshToken = innerData?.refresh_token || resData?.refresh_token;

      if (token) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('icu_auth_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Call GET /api/v1/auth/me for authoritative user context
      try {
        const meRes = await authApi.me();
        const userObj = meRes.data || innerData;
        return { isMfaRequired: false, user: userObj, lastApiResponse: meRes };
      } catch (meErr) {
        const userObj = innerData || resData?.user;
        if (userObj) {
          return { isMfaRequired: false, user: userObj, lastApiResponse: res };
        }
        throw meErr;
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Authentication failed. Please verify credentials.');
    }
  }
);

/**
 * Verify MFA challenge via POST /api/v1/auth/mfa/verify
 */
export const verifyMfaThunk = createAsyncThunk(
  'auth/verifyMfa',
  async (payload: import('../../api/authApi').MfaVerifyPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.mfaVerify(payload);
      const session = res.data;
      const token = session.token || session.access_token || session.accessToken;
      const refreshToken = session.refreshToken;

      if (token) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('icu_auth_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      try {
        const meRes = await authApi.me();
        return meRes.data || session.user;
      } catch {
        return session.user;
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'MFA validation failed.');
    }
  }
);

/**
 * Perform logout via POST /api/v1/auth/logout and clear local session state
 */
export const logoutUserThunk = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try {
      await authApi.logout();
    } catch {
      // Proceed even if logout endpoint fails
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('icu_auth_token');
      localStorage.removeItem('icu_active_role');
      localStorage.removeItem('naimify_active_security_user');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      dispatch(resetAuthState());
    }
  }
);

// ----------------------------------------------------
// Redux Auth Slice Definition
// ----------------------------------------------------

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.user = null;
      state.currentUser = defaultUser;
      state.isAuthenticated = false;
      state.requiresMfa = false;
      state.loading = false;
      state.error = null;
      state.lastApiResponse = null;
    },
    setAuthenticatedUser: (state, action: PayloadAction<any>) => {
      const formatted = formatUserProfile(action.payload);
      state.user = formatted;
      state.currentUser = formatted;
      state.activeRole = formatted.role;
      state.isAuthenticated = true;
      state.requiresMfa = false;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('icu_active_role', formatted.role);
        localStorage.setItem('naimify_active_security_user', JSON.stringify(formatted));
      }
    },
    setActiveRole: (state, action: PayloadAction<SystemRole>) => {
      state.activeRole = action.payload;
      if (state.user) {
        state.user.role = action.payload;
        state.currentUser.role = action.payload;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('icu_active_role', action.payload);
      }
    },
    login: (state, action: PayloadAction<{ role: SystemRole; email?: string; name?: string; staffId?: string; hospital?: string }>) => {
      const role = action.payload.role;
      const formatted: UserProfile = {
        id: `USR-${Date.now()}`,
        staffId: action.payload.staffId || 'SA-9901',
        name: action.payload.name || (action.payload.email ? action.payload.email.split('@')[0] : 'Authenticated User'),
        email: action.payload.email || 'user@smarticu.org',
        role: role,
        department: role === 'SUPER_ADMIN' ? 'Hospital System Governance' : 'Critical Care Center',
        authorizedUnits: ['MICU-01', 'SICU-01'],
        status: 'ON_DUTY',
        hospital: action.payload.hospital || 'Patna Medical College & Hospital (PMCH)'
      };
      state.user = formatted;
      state.currentUser = formatted;
      state.activeRole = role;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('icu_active_role', role);
        localStorage.setItem('naimify_active_security_user', JSON.stringify(formatted));
      }
    },
    logout: (state) => {
      state.user = null;
      state.currentUser = defaultUser;
      state.isAuthenticated = false;
      state.requiresMfa = false;
      state.loading = false;
      state.error = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('icu_auth_token');
        localStorage.removeItem('icu_active_role');
        localStorage.removeItem('naimify_active_security_user');
      }
    },
    setLastApiResponse: (state, action: PayloadAction<any>) => {
      state.lastApiResponse = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Current User (/auth/me)
      .addCase(fetchCurrentUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        const formatted = formatUserProfile(action.payload);
        state.user = formatted;
        state.currentUser = formatted;
        state.activeRole = formatted.role;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        state.lastApiResponse = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem('icu_active_role', formatted.role);
          localStorage.setItem('naimify_active_security_user', JSON.stringify(formatted));
        }
      })
      .addCase(fetchCurrentUserThunk.rejected, (state, action) => {
        state.user = null;
        state.currentUser = defaultUser;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = action.payload as string;
      })
      // Login User
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.lastApiResponse = action.payload.lastApiResponse;
        if (action.payload.isMfaRequired) {
          state.requiresMfa = true;
        } else if (action.payload.user) {
          const formatted = formatUserProfile(action.payload.user);
          state.user = formatted;
          state.currentUser = formatted;
          state.activeRole = formatted.role;
          state.isAuthenticated = true;
          state.requiresMfa = false;
          if (typeof window !== 'undefined') {
            localStorage.setItem('icu_active_role', formatted.role);
            localStorage.setItem('naimify_active_security_user', JSON.stringify(formatted));
          }
        }
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Verify MFA
      .addCase(verifyMfaThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyMfaThunk.fulfilled, (state, action) => {
        const formatted = formatUserProfile(action.payload);
        state.user = formatted;
        state.currentUser = formatted;
        state.activeRole = formatted.role;
        state.isAuthenticated = true;
        state.requiresMfa = false;
        state.loading = false;
        state.error = null;
        if (typeof window !== 'undefined') {
          localStorage.setItem('icu_active_role', formatted.role);
          localStorage.setItem('naimify_active_security_user', JSON.stringify(formatted));
        }
      })
      .addCase(verifyMfaThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout User
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.user = null;
        state.currentUser = defaultUser;
        state.isAuthenticated = false;
        state.requiresMfa = false;
        state.loading = false;
        state.error = null;
      });
  }
});

export const {
  resetAuthState,
  setAuthenticatedUser,
  setActiveRole,
  login,
  logout,
  setLastApiResponse
} = authSlice.actions;

export default authSlice.reducer;
