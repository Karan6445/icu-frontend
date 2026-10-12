import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface HospitalSettings {
  hospitalName: string;
  address: string;
  contactNumber: string;
  emergencyHelpline: string;
  email: string;
  licenseNumber: string;
}

export interface IcuConfigSettings {
  icuName: string;
  totalBedCapacity: number;
  telemetryRefreshRateSec: number;
  alarmSoundEnabled: boolean;
  autoSaveIntervalMin: number;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  emailAlertsEnabled: boolean;
  soundAlertsEnabled: boolean;
}

interface SettingsState {
  hospital: HospitalSettings;
  icuConfig: IcuConfigSettings;
  userPreferences: UserPreferences;
  savedNotificationMessage?: string;
}

const initialState: SettingsState = {
  hospital: {
    hospitalName: 'AIIMS Patna & Critical Care Center',
    address: 'Phulwari Sharif, Patna, Bihar - 801507',
    contactNumber: '+91 612 245 1070',
    emergencyHelpline: '108 / +91 612 245 1088',
    email: 'contact@aiimspatna.org',
    licenseNumber: 'BIH-HOSP-2026-8891'
  },
  icuConfig: {
    icuName: 'Central Advanced ICU Block',
    totalBedCapacity: 15,
    telemetryRefreshRateSec: 2,
    alarmSoundEnabled: true,
    autoSaveIntervalMin: 5
  },
  userPreferences: {
    theme: 'dark',
    notificationsEnabled: true,
    emailAlertsEnabled: true,
    soundAlertsEnabled: true
  }
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateHospitalSettings: (state, action: PayloadAction<Partial<HospitalSettings>>) => {
      state.hospital = { ...state.hospital, ...action.payload };
      state.savedNotificationMessage = 'Hospital settings updated successfully.';
    },
    updateIcuConfigSettings: (state, action: PayloadAction<Partial<IcuConfigSettings>>) => {
      state.icuConfig = { ...state.icuConfig, ...action.payload };
      state.savedNotificationMessage = 'ICU configuration updated successfully.';
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload };
      state.savedNotificationMessage = 'User preferences saved.';
    },
    clearSavedMessage: (state) => {
      state.savedNotificationMessage = undefined;
    }
  }
});

export const {
  updateHospitalSettings,
  updateIcuConfigSettings,
  updateUserPreferences,
  clearSavedMessage
} = settingsSlice.actions;

export default settingsSlice.reducer;
