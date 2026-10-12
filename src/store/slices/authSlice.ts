import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/authApi';

export type SystemRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'ADMIN'
  | 'DIRECTOR'
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

const formatUserProfile = (rawUserData: any): UserProfile => {
  if (!rawUserData) {
    return defaultUser;
  }
  const userData = rawUserData.data || rawUserData;
  const rawRole = (userData.role || '').toString().toLowerCase();

  let role: SystemRole = 'SUPER_ADMIN';
  if (rawRole.includes('command') || rawRole.includes('super')) {
    role = 'SUPER_ADMIN';
  } else if (rawRole.includes('hospital') || rawRole.includes('admin')) {
    role = 'HOSPITAL_ADMIN';
  } else if (rawRole.includes('doctor') || rawRole.includes('physician')) {
    role = 'DOCTOR';
  } else if (rawRole.includes('nurse')) {
    role = 'NURSE';
  } else if (userData.role) {
    role = userData.role as SystemRole;
  }

  return {
    id: userData.id || userData.user_id || 'USR-001',
    staffId: userData.staffId || userData.staff_id || 'SA-9901',
    name: userData.name || (userData.email ? userData.email.split('@')[0] : 'Authenticated User'),
    email: userData.email || 'user@smarticu.org',
    role: role,
    department: userData.department || (role === 'SUPER_ADMIN' ? 'Hospital System Governance Board' : 'Critical Care Unit'),
    authorizedUnits: userData.authorizedUnits || userData.authorized_units || ['MICU-01', 'SICU-01'],
    status: userData.status || 'ON_DUTY',
    specialty: userData.specialty || (role === 'SUPER_ADMIN' ? 'Chief Executive Officer' : 'Intensivist'),
    experience: userData.experience || '10+ Years',
    hospital: userData.hospital || userData.hospital_name || 'Patna Medical College & Hospital (PMCH)',
    hospitalId: userData.hospitalId || userData.hospital_id || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    permissions: userData.permissions || [],
    mfaEnabled: userData.mfaEnabled ?? userData.mfa_enabled ?? false,
    mfaMethod: userData.mfaMethod || userData.mfa_method || 'AUTHENTICATOR',
  };
};

const getInitialToken = (): boolean => {
  if (typeof window !== 'undefined') {
    return !!(localStorage.getItem('accessToken') || localStorage.getItem('icu_auth_token'));
  }
  return false;
};

const hasInitialToken = getInitialToken();

const initialState: AuthState = {
  user: null,
  currentUser: defaultUser,
  activeRole: 'SUPER_ADMIN',
  isAuthenticated: hasInitialToken,
  requiresMfa: false,
  loading: hasInitialToken,
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('icu_auth_token');
      localStorage.removeItem('naimify_active_security_user');
      return rejectWithValue(err.message || 'Session expired. Please sign in again.');
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
