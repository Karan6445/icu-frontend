import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateHospitalSettings, updateIcuConfigSettings, updateUserPreferences, clearSavedMessage } from '../../store/slices/settingsSlice';
import { Settings, Building2, Bed, Moon, Sun, Bell, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { clean10DigitPhone, validate10DigitPhone, format10DigitPhone } from '../../utils/validation';
import { MfaSecuritySettings } from '../../components/common/MfaSecuritySettings';

export const AdminSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { hospital, icuConfig, userPreferences, savedNotificationMessage } = useAppSelector(state => state.settings);

  // Local state initialized from Redux
  const [hospName, setHospName] = useState(hospital.hospitalName);
  const [hospAddress, setHospAddress] = useState(hospital.address);
  const [hospContact, setHospContact] = useState(() => clean10DigitPhone(hospital.contactNumber));
  const [contactError, setContactError] = useState<string | null>(null);

  const [icuName, setIcuName] = useState(icuConfig.icuName);
  const [bedCapacity, setBedCapacity] = useState(icuConfig.totalBedCapacity);
  const [refreshRate, setRefreshRate] = useState(icuConfig.telemetryRefreshRateSec);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => (localStorage.getItem('icu_theme') === 'dark' ? 'dark' : userPreferences.theme));
  const [notifs, setNotifs] = useState(userPreferences.notificationsEnabled);

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('icu_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('icu_theme', 'light');
    }
    window.dispatchEvent(new CustomEvent('icu_theme_change', { detail: { isDark: newTheme === 'dark' } }));
  };

  const handleSaveAllSettings = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Contact Information
    const contactValidation = validate10DigitPhone(hospContact, 'Contact information', true);
    if (contactValidation !== true) {
      setContactError(contactValidation);
      return;
    }
    setContactError(null);

    dispatch(updateHospitalSettings({
      hospitalName: hospName,
      address: hospAddress,
      contactNumber: hospContact ? format10DigitPhone(hospContact) : ''
    }));
    dispatch(updateIcuConfigSettings({ icuName, totalBedCapacity: Number(bedCapacity), telemetryRefreshRateSec: Number(refreshRate) }));
    dispatch(updateUserPreferences({ theme, notificationsEnabled: notifs }));
    setTimeout(() => {
      dispatch(clearSavedMessage());
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#10B981] selection:text-white max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D1D5DB] shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            SYSTEM SETTINGS
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Hospital Management & ICU Control Panel</h1>
          <p className="text-xs text-slate-500">Configure hospital metadata, ICU bed capacity, telemetry refresh intervals, and UI theme preferences.</p>
        </div>
      </div>

      {savedNotificationMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-mono flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          <span>{savedNotificationMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveAllSettings} className="space-y-6">
        {/* Section 1: Hospital Settings */}
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Building2 className="w-5 h-5 text-[#0F766E]" />
            <h2 className="text-base font-extrabold text-slate-900">1. Hospital Management & Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">Hospital Name</label>
              <input
                type="text"
                value={hospName}
                onChange={(e) => setHospName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-bold">Contact Information *</label>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  clean10DigitPhone(hospContact).length === 10
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    : 'text-slate-500 bg-slate-100 border border-slate-200'
                }`}>
                  {clean10DigitPhone(hospContact).length}/10 digits
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={hospContact}
                onChange={(e) => {
                  const clean = clean10DigitPhone(e.target.value);
                  setHospContact(clean);
                  if (contactError) setContactError(null);
                }}
                placeholder="10-digit contact / mobile number"
                className={`w-full bg-slate-50 border ${
                  contactError
                    ? 'border-rose-500 focus:border-rose-500 ring-1 ring-rose-500/20'
                    : 'border-slate-300 focus:border-[#0F766E]'
                } rounded-xl p-3 text-slate-900 focus:outline-none font-bold font-mono transition-colors`}
              />
              {contactError && (
                <span className="text-rose-600 text-[11px] mt-1.5 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5 inline shrink-0 text-rose-500" />
                  {contactError}
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-700 mb-1 font-bold">Hospital Address</label>
              <textarea
                rows={2}
                value={hospAddress}
                onChange={(e) => setHospAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: ICU Settings */}
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Bed className="w-5 h-5 text-[#10B981]" />
            <h2 className="text-base font-extrabold text-slate-900">2. ICU Settings & Configuration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">ICU Block Name</label>
              <input
                type="text"
                value={icuName}
                onChange={(e) => setIcuName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Total Bed Capacity</label>
              <input
                type="number"
                value={bedCapacity}
                onChange={(e) => setBedCapacity(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Telemetry Refresh Rate (Sec)</label>
              <input
                type="number"
                value={refreshRate}
                onChange={(e) => setRefreshRate(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 focus:border-[#0F766E] focus:outline-none font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: User Settings */}
        <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <Settings className="w-5 h-5 text-[#0F766E]" />
            <h2 className="text-base font-extrabold text-slate-900">3. User & UI Preferences</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 mb-1 font-bold">UI Theme</label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`flex-1 py-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    theme === 'dark' ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs' : 'bg-slate-50 border-slate-300 text-slate-600'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode (Hospital)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`flex-1 py-3 rounded-xl border text-center font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    theme === 'light' ? 'bg-[#10B981] text-white border-[#059669] shadow-xs' : 'bg-slate-50 border-slate-300 text-slate-600'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-bold">Notifications & Alarms</label>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-300 mt-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-slate-900 font-bold text-xs">Critical Vital Alarms</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifs}
                  onChange={(e) => setNotifs(e.target.checked)}
                  className="w-4 h-4 accent-[#0F766E] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: MFA & Account Security */}
        <MfaSecuritySettings />

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="px-8 py-3.5 bg-[#0F766E] hover:bg-[#0D655E] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Save All Hospital Settings
          </button>
        </div>
      </form>
    </div>
  );
};
