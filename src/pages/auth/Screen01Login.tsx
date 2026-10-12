import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  Building2,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  Info,
  ExternalLink,
  Sun,
  Moon,
  Users,
  Smartphone
} from 'lucide-react';
import { authApi, getDeviceId } from '../../api/authApi';
import { hospitalApi, HospitalFacility } from '../../api/hospitalApi';
import { SecurityApiService } from '../../services/securityApiService';
import { SecurityUser } from '../../types/authSecurity';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useAppDispatch } from '../../store/hooks';
import { login, setActiveRole, setAuthenticatedUser, SystemRole, fetchCurrentUserThunk } from '../../store/slices/authSlice';
import { AuthService } from '../../services/authService';

export const Screen01Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isDark, toggleDarkMode } = useDarkMode();

  // Form State
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [deviceId, setDeviceId] = useState(() => getDeviceId());
  const [hospitals, setHospitals] = useState<HospitalFacility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Public Hospitals List (GET /api/v1/hospitals)
  useEffect(() => {
    let isMounted = true;
    hospitalApi.list().then((res) => {
      if (isMounted && res.data) {
        setHospitals(res.data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // MFA State
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [tempToken, setTempToken] = useState<string>('');
  const [pendingUser, setPendingUser] = useState<SecurityUser | null>(null);
  const [mfaCode, setMfaCode] = useState('');

  // ------------------------------------------------------------------
  // Screen Logic: Step 1 (POST /api/v1/auth/login)
  // ------------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('🌐 FIRED HTTP POST /api/v1/auth/login for:', usernameOrEmail);
      const apiRes = await authApi.login({
        email: usernameOrEmail,
        usernameOrEmail,
        password,
        ...(hospitalId ? { hospital_id: hospitalId } : {}),
        ...(deviceId ? { device_id: deviceId } : {})
      });

      const resData: any = apiRes.data;
      const innerData = resData?.data || resData;

      // Check whether backend requires MFA challenge
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
        setTempToken(challengeToken);
        const emailVal = innerData?.email || usernameOrEmail;
        const nameVal =
          innerData?.user?.name ||
          (emailVal ? emailVal.split('@')[0].replace('.', ' ') : 'Staff Member');
        const roleVal =
          innerData?.user?.role ||
          (emailVal.includes('nurse') ? 'NURSE' : emailVal.includes('doctor') ? 'DOCTOR' : 'STAFF');

        setPendingUser({
          id: innerData?.user?.id || 'pending-mfa',
          staffId: innerData?.user?.staffId || 'EMP-MFA',
          name: nameVal,
          email: emailVal,
          role: roleVal as any,
          hospital: innerData?.user?.hospital || 'Metro Central Smart Hospital',
        } as any);
        setIsMfaStep(true);
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      // Non-MFA direct login:
      const token = innerData?.access_token || innerData?.token || innerData?.accessToken || resData?.access_token || resData?.token;
      const refreshToken = innerData?.refresh_token || resData?.refresh_token;

      if (token) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('icu_auth_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (hospitalId || innerData?.hospital_id) {
        localStorage.setItem('selected_hospital_id', hospitalId || innerData?.hospital_id);
      }

      // Synchronize authoritative user data, role, and permissions into Redux immediately
      dispatch(setAuthenticatedUser(innerData));

      // Attempt /auth/me in background if supported by the server
      try {
        await dispatch(fetchCurrentUserThunk());
      } catch {}

      setIsLoading(false);
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard/overview';
      navigate(redirectUrl);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  // ------------------------------------------------------------------
  // Screen Logic: SSO Sign-In (Enterprise SAML / Azure AD)
  // ------------------------------------------------------------------
  const handleSSOSignIn = async (provider: 'AZURE_AD' | 'SAML') => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const apiRes = await authApi.login({
        email: usernameOrEmail,
        usernameOrEmail: usernameOrEmail,
        ...(hospitalId ? { hospital_id: hospitalId } : {}),
        ...(deviceId ? { device_id: deviceId } : {}),
        ssoProvider: provider
      });

      const session: any = apiRes.data;
      const innerData = session?.data || session;

      const isMfaRequired = Boolean(
        innerData?.mfa_required ||
        session?.mfa_required ||
        innerData?.isMfaRequired ||
        session?.isMfaRequired
      );
      const challengeToken =
        innerData?.mfa_token ||
        session?.mfa_token ||
        innerData?.tempMfaToken ||
        session?.tempMfaToken;

      if (isMfaRequired && challengeToken) {
        setTempToken(challengeToken);
        const emailVal = innerData?.email || usernameOrEmail;
        setPendingUser({
          id: innerData?.user?.id || 'pending-mfa',
          staffId: innerData?.user?.staffId || 'EMP-MFA',
          name: innerData?.user?.name || (emailVal ? emailVal.split('@')[0].replace('.', ' ') : 'Staff Member'),
          email: emailVal,
          role: (innerData?.user?.role || 'STAFF') as any,
          hospital: innerData?.user?.hospital || 'Metro Central Smart Hospital',
        } as any);
        setIsMfaStep(true);
        setIsLoading(false);
        setErrorMessage(null);
        return;
      }

      const token = innerData?.access_token || innerData?.token || innerData?.accessToken || session?.token;
      const refreshToken = innerData?.refresh_token || session?.refresh_token;

      if (token) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('icu_auth_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (hospitalId || innerData?.hospital_id) {
        localStorage.setItem('selected_hospital_id', hospitalId || innerData?.hospital_id);
      }

      await dispatch(fetchCurrentUserThunk());
      setIsLoading(false);
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard/overview';
      navigate(redirectUrl);
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'SSO Federation failed. Please contact your administrator.');
    }
  };

  // ------------------------------------------------------------------
  // Screen Logic: Step 2 (POST /api/v1/auth/mfa/verify)
  // ------------------------------------------------------------------
  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const cleanCode = mfaCode.trim();
    if (!cleanCode) {
      setIsLoading(false);
      setErrorMessage('Please enter your 6-digit TOTP passcode.');
      return;
    }

    try {
      console.log('🌐 FIRED HTTP POST /api/v1/auth/mfa/verify');
      const apiRes = await authApi.mfaVerify({
        mfa_token: tempToken,
        code: cleanCode,
        device_id: deviceId,
      });

      const resData: any = apiRes.data;
      const innerData = resData?.data || resData;

      const token = innerData?.access_token || innerData?.accessToken || innerData?.token;
      const refreshToken = innerData?.refresh_token || innerData?.refreshToken;

      if (token) {
        localStorage.setItem('accessToken', token);
        localStorage.setItem('icu_auth_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('auth_token', token);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      if (pendingUser?.hospital || innerData?.hospital_id) {
        localStorage.setItem('selected_hospital_id', innerData?.hospital_id || '');
      }

      // Synchronize authoritative user data, role, and permissions into Redux immediately
      dispatch(setAuthenticatedUser(innerData));

      try {
        await dispatch(fetchCurrentUserThunk());
      } catch {}

      setIsLoading(false);
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || '/dashboard/overview';
      navigate(redirectUrl);
    } catch (err: any) {
      setIsLoading(false);
      const msg = err.message || err.detail || 'MFA validation failed. Please check your verification code.';
      setErrorMessage(msg);
    }
  };

  // ------------------------------------------------------------------
  // Post-MFA: Issue session, load context, navigate to Screen 02
  // ------------------------------------------------------------------
  const completeLogin = async (user: SecurityUser) => {
    setIsLoading(false);

    // Sync Redux auth state
    const reduxRole: SystemRole =
      user.role === 'SUPER_ADMIN'
        ? 'SUPER_ADMIN'
        : user.role === 'HOSPITAL_ADMIN' || user.role === 'DIRECTOR'
        ? 'ADMIN'
        : user.role === 'DOCTOR'
        ? 'DOCTOR'
        : 'NURSE';

    dispatch(login({
      role: reduxRole,
      email: user.email,
      name: user.name,
      staffId: user.staffId,
      hospital: user.hospital
    }));
    dispatch(setActiveRole(reduxRole));
    AuthService.login(user.staffId);

    // Navigate directly to dashboard overview for all roles
    navigate('/dashboard/overview');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col justify-between relative selection:bg-teal-700 selection:text-white transition-colors duration-200">
      {/* ================= HEADER: LOGO & HOSPITAL BRANDING ================= */}
      <header className="w-full bg-[#0F766E] text-white border-b border-[#0D655E] px-4 sm:px-8 py-3 flex items-center justify-between shadow-md z-10 select-none">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
            {/* ECG Pulse Wave Animation */}
            <div className="absolute -inset-x-4 inset-y-0 flex items-center pointer-events-none z-0">
              <svg className="w-full h-7 overflow-visible opacity-90" viewBox="0 0 100 30" fill="none">
                <path
                  d="M 0 15 L 20 15 L 24 15 L 28 8 L 32 22 L 36 2 L 42 28 L 46 15 L 50 15 L 100 15"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-ecg-line"
                />
              </svg>
            </div>

            <div className="relative z-10 w-11 h-11 rounded-xl overflow-hidden p-1 flex items-center justify-center bg-slate-950 border border-teal-500/40 shadow-xs">
              <img
                src="/Naimify-logo-large.png"
                alt="Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider uppercase font-sans text-white leading-none">
                NAIMIFY <span className="text-teal-200 font-black">SMART ICU</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-teal-800/80 border border-teal-400/40 text-teal-200">
                SSO & MFA GATEWAY
              </span>
            </div>
            <span className="text-[11px] text-teal-100 font-sans block mt-0.5">
              <span className="font-serif italic font-semibold">enfinix</span>
              <span className="opacity-50 mx-1.5">|</span>
              Smart Clinical Decision Matrix
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-[#0D655E] px-3 py-1.5 rounded-xl border border-teal-500/30 text-[11px] font-mono font-bold text-teal-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>NABH & HIPAA Compliant</span>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-teal-100 hover:text-white hover:bg-[#0D655E] transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-teal-100" />}
          </button>
        </div>
      </header>

      {/* ================= CENTER: SSO, LOCAL CREDENTIALS & MFA SIGN-IN ================= */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Card Top Title */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isMfaStep ? 'Multi-Factor Verification' : 'Clinical Access Portal'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isMfaStep
                ? `Enter 6-digit TOTP code for ${pendingUser?.name}`
                : 'Sign in with your enterprise hospital credentials'}
            </p>
          </div>

          {/* Validation & Error Alert Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold block">Authentication Notice</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* ================= STEP 1: CREDENTIALS & SSO ================= */}
          {!isMfaStep ? (
            <div className="space-y-4">
              {/* Enterprise SSO Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleSSOSignIn('AZURE_AD')}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-xs transition-all active:scale-98 disabled:opacity-50"
                >
                  <Building2 className="w-4 h-4 text-teal-400" />
                  <span>Sign in with Microsoft Azure AD / Hospital SSO</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSSOSignIn('SAML')}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 shadow-xs transition-all active:scale-98 disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Hospital Federation SAML 2.0 Identity</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
                <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                  Or Local Username / Password
                </span>
                <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              </div>

              {/* Local Credentials Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-1">
                    <span>Hospital Facility</span>
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-normal">
                      (Optional for Super Admin)
                    </span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={hospitalId}
                      onChange={(e) => setHospitalId(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 font-medium appearance-none cursor-pointer"
                    >
                      <option value="">-- Select Hospital Facility (Optional for Super Admin) --</option>
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name} {h.city ? `(${h.city})` : ''}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Work Email / Hospital Staff ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      placeholder="Enter work email or staff ID"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Account Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Proceed to Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Quick Demo Credentials */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[10px] font-mono uppercase font-bold text-slate-400 mb-2 flex items-center justify-between">
                    <span>Quick Demo Credentials</span>
                    <span className="text-teal-600 dark:text-teal-400 font-semibold">1-Click Fill</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameOrEmail('superadmin@smarticu.org');
                        setPassword('AdminPassword@2026!');
                        setHospitalId('');
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>👑</span> <span>Super Admin</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">superadmin@smarticu.org</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameOrEmail('hospital.admin@smarticu.org');
                        setPassword('HospitalAdmin@2026!');
                        if (hospitals[0]) setHospitalId(hospitals[0].id);
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>🏥</span> <span>Hospital Admin</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">hospital.admin@smarticu.org</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameOrEmail('nurse.charge@smarticu.org');
                        setPassword('ChargeNurse@2026!');
                        if (hospitals[0]) setHospitalId(hospitals[0].id);
                      }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 hover:border-teal-400 text-left transition-colors cursor-pointer"
                    >
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>👩‍⚕️</span> <span>Charge Nurse</span>
                      </div>
                      <div className="text-[10px] text-teal-600 dark:text-teal-400 font-mono truncate">nurse.charge@smarticu.org</div>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* ================= STEP 2: MFA VERIFICATION ================= */
            <form onSubmit={handleMfaVerify} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs flex-1">
                  <span className="font-bold text-teal-900 dark:text-teal-200 block text-xs">
                    Multi-Factor Authentication Challenge
                  </span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 capitalize">
                    Staff: <strong>{pendingUser?.name}</strong> • <span className="font-mono">{pendingUser?.email}</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 text-center">
                  Enter 6-Digit Authenticator Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full py-3 text-center tracking-[0.5em] font-mono text-2xl font-black bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 focus:border-teal-500 rounded-2xl text-slate-900 dark:text-white focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-1">
                  Open Google Authenticator or Microsoft Authenticator
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || mfaCode.length < 6}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Token & Open Facilities</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMfaStep(false);
                    setMfaCode('');
                    setErrorMessage(null);
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* ================= FOOTER: PRIVACY, SUPPORT & VERSION ================= */}
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 py-3.5 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 select-none">
        <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
          <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NABH / HIPAA Patient Data Privacy Shield</span>
          </span>
          <span>•</span>
          <a href="#privacy" className="hover:text-slate-800 dark:hover:text-slate-200 underline">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="#terms" className="hover:text-slate-800 dark:hover:text-slate-200 underline">
            Clinical Terms of Service
          </a>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[11px]">
            <PhoneCall className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>24/7 ICU Hotline: <strong>1800-NAIMIFY-ICU</strong></span>
          </span>
          <span>•</span>
          <span className="font-mono text-[11px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
            v2.4.0-prod (Build 9021)
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Screen01Login;
