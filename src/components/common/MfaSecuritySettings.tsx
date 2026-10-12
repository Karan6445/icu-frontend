import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { authApi, MfaSetupResponse } from '../../api/authApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCurrentUserThunk } from '../../store/slices/authSlice';

export const MfaSecuritySettings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const mfaEnabled = user?.mfaEnabled ?? false;

  // Setup / Enable State
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [isVerifyingEnable, setIsVerifyingEnable] = useState(false);
  const [enableError, setEnableError] = useState<string | null>(null);
  const [enableSuccess, setEnableSuccess] = useState<string | null>(null);

  // Disable State
  const [isDisabling, setIsDisabling] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableTotp, setDisableTotp] = useState('');
  const [isVerifyingDisable, setIsVerifyingDisable] = useState(false);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // ----------------------------------------------------
  // 1. Initiate Setup (POST /api/v1/auth/mfa/setup)
  // ----------------------------------------------------
  const handleStartSetup = async () => {
    setIsSettingUp(true);
    setEnableError(null);
    setEnableSuccess(null);
    setTotpCode('');

    try {
      const res = await authApi.mfaSetup();
      setSetupData(res.data);
    } catch (err: any) {
      setEnableError(err.message || 'Failed to initialize MFA setup session.');
      setIsSettingUp(false);
    }
  };

  // ----------------------------------------------------
  // 2. Enable MFA (POST /api/v1/auth/mfa/enable)
  // ----------------------------------------------------
  const handleEnableMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupData || !totpCode) return;

    setIsVerifyingEnable(true);
    setEnableError(null);

    try {
      await authApi.mfaEnable({
        code: totpCode.trim(),
        secret: setupData.secret,
        totpCode: totpCode.trim(),
      });

      setEnableSuccess('Multi-Factor Authentication (TOTP) successfully activated on your account.');
      setIsSettingUp(false);
      setSetupData(null);
      setTotpCode('');
      await dispatch(fetchCurrentUserThunk());
    } catch (err: any) {
      setEnableError(err.message || 'Invalid TOTP verification code. Please check your authenticator app and try again.');
    } finally {
      setIsVerifyingEnable(false);
    }
  };

  // ----------------------------------------------------
  // 3. Disable MFA (POST /api/v1/auth/mfa/disable)
  // ----------------------------------------------------
  const handleDisableMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingDisable(true);
    setDisableError(null);

    try {
      await authApi.mfaDisable({
        password: disablePassword,
        ...(disableTotp ? { totpCode: disableTotp.trim() } : {}),
      });

      setEnableSuccess('Multi-Factor Authentication has been disabled.');
      setIsDisabling(false);
      setDisablePassword('');
      setDisableTotp('');
      await dispatch(fetchCurrentUserThunk());
    } catch (err: any) {
      setDisableError(err.message || 'Failed to disable MFA. Please verify your password and code.');
    } finally {
      setIsVerifyingDisable(false);
    }
  };

  return (
    <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl text-white ${mfaEnabled ? 'bg-emerald-600' : 'bg-amber-500'}`}>
            {mfaEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900">Multi-Factor Authentication (MFA / TOTP)</h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  mfaEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border border-amber-300'
                }`}
              >
                {mfaEnabled ? 'MFA ACTIVE' : 'MFA DISABLED'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure your account using Google Authenticator, Microsoft Authenticator, or TOTP mobile apps.
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {enableSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{enableSuccess}</span>
          </div>
          <button onClick={() => setEnableSuccess(null)} className="text-xs font-bold text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {enableError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{enableError}</span>
        </div>
      )}

      {/* Overview Status & Action Controls */}
      {!isSettingUp && !isDisabling && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-800 block">
              {mfaEnabled
                ? 'Your account is protected with 2-step TOTP verification.'
                : 'MFA is currently disabled. Protect your clinical data with 2FA.'}
            </span>
            <span className="text-slate-500 text-[11px] block">
              Authorized Method: <strong>TOTP Authenticator App</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {!mfaEnabled ? (
              <button
                type="button"
                onClick={handleStartSetup}
                className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Enable MFA</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsDisabling(true);
                  setDisableError(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition-all cursor-pointer"
              >
                Disable MFA
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= STEP-BY-STEP MFA SETUP FORM ================= */}
      {isSettingUp && setupData && (
        <form onSubmit={handleEnableMfaSubmit} className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-5">
          <div className="flex items-center justify-between border-b border-teal-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-600" />
              <span>Setup Multi-Factor Authentication</span>
            </h3>
            <button
              type="button"
              onClick={() => {
                setIsSettingUp(false);
                setSetupData(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Step 1: QR Code & Manual Key */}
            <div className="space-y-3">
              <span className="font-bold text-slate-800 block">Step 1: Scan QR Code with Authenticator App</span>
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-slate-200 w-fit">
                <img src={setupData.qrCodeUrl} alt="MFA QR Code" className="w-36 h-36 object-contain rounded-lg" />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block mb-1">Manual Entry Key:</span>
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800">
                  <span>{setupData.manualEntryKey}</span>
                </div>
              </div>
            </div>

            {/* Step 2: Verification TOTP Code */}
            <div className="space-y-4">
              <span className="font-bold text-slate-800 block">Step 2: Enter 6-Digit Code from App</span>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  6-Digit Passcode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full py-2.5 text-center tracking-[0.4em] font-mono text-xl font-black bg-white border-2 border-teal-500/60 rounded-xl focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingEnable || totpCode.length < 6}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                {isVerifyingEnable ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify Code & Activate MFA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ================= DISABLE MFA CONFIRMATION FORM ================= */}
      {isDisabling && (
        <form onSubmit={handleDisableMfaSubmit} className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-rose-200/60 pb-2">
            <h3 className="font-bold text-rose-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Confirm Disabling MFA</span>
            </h3>
            <button type="button" onClick={() => setIsDisabling(false)} className="font-bold text-slate-500 hover:text-slate-800">
              Cancel
            </button>
          </div>

          {disableError && (
            <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-200 text-rose-800 font-medium text-[11px]">
              {disableError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Account Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-9 py-2 bg-white border border-slate-300 rounded-xl font-medium focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">6-Digit Authenticator Passcode *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={disableTotp}
                onChange={(e) => setDisableTotp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full py-2 bg-white border border-slate-300 rounded-xl font-mono text-center font-bold tracking-widest focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              disabled={isVerifyingDisable || !disablePassword || !disableTotp}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isVerifyingDisable ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Confirm Deactivation</span>}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default MfaSecuritySettings;
