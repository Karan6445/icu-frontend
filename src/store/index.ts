import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import patientReducer from './slices/patientSlice';
import icuBedReducer from './slices/icuBedSlice';
import doctorReducer from './slices/doctorSlice';
import nurseReducer from './slices/nurseSlice';
import rolePermissionReducer from './slices/rolePermissionSlice';
import logReducer from './slices/logSlice';
import shiftReducer from './slices/shiftSlice';
import settingsReducer from './slices/settingsSlice';
import reportReducer from './slices/reportSlice';
import hospitalReducer from './slices/hospitalSlice';
import superAdminReducer from './slices/superAdminSlice';
import hospitalAdminReducer from './slices/hospitalAdminSlice';
import userReducer from './slices/userSlice';
import stateReducer from './slices/stateSlice';
import districtReducer from './slices/districtSlice';
import organizationReducer from './slices/organizationSlice';
import departmentReducer from './slices/departmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    patient: patientReducer,
    icuBed: icuBedReducer,
    doctor: doctorReducer,
    nurse: nurseReducer,
    rolePermission: rolePermissionReducer,
    log: logReducer,
    shift: shiftReducer,
    settings: settingsReducer,
    report: reportReducer,
    hospital: hospitalReducer,
    superAdmin: superAdminReducer,
    hospitalAdmin: hospitalAdminReducer,
    user: userReducer,
    state: stateReducer,
    district: districtReducer,
    organization: organizationReducer,
    department: departmentReducer,
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


