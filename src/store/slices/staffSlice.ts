import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  staffApi,
  HospitalStaffMember,
  StaffProfileCreatePayload,
  StaffQueryParams,
  DEFAULT_FALLBACK_STAFF,
  DEFAULT_HOSPITAL_ID,
} from '../../api/staffApi';

export type StaffScope = 'HOSPITAL' | 'DEPARTMENT' | 'ICU' | 'SHIFT';

export interface StaffState {
  items: HospitalStaffMember[];
  total: number;
  limit: number;
  offset: number;
  activeScope: StaffScope;
  selectedDepartmentId: string | null;
  selectedIcuId: string | null;
  selectedShiftId: string | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  lastSyncedUrl: string | null;
  lastSyncedTime: string | null;
}

const initialState: StaffState = {
  items: DEFAULT_FALLBACK_STAFF,
  total: DEFAULT_FALLBACK_STAFF.length,
  limit: 50,
  offset: 0,
  activeScope: 'HOSPITAL',
  selectedDepartmentId: null,
  selectedIcuId: null,
  selectedShiftId: null,
  isLoading: false,
  error: null,
  successMessage: null,
  lastSyncedUrl: `http://10.208.2.18:8000/api/v1/hospitals/${DEFAULT_HOSPITAL_ID}/staff`,
  lastSyncedTime: null,
};

// 1. GET /api/v1/hospitals/{hospital_id}/staff
export const fetchHospitalStaffThunk = createAsyncThunk(
  'staff/fetchByHospital',
  async (
    payload: { hospitalId?: string; params?: StaffQueryParams } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await staffApi.getByHospital(payload.hospitalId, payload.params);
      return {
        data: res.data,
        hospitalId: payload.hospitalId || DEFAULT_HOSPITAL_ID,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch hospital staff');
    }
  }
);

// 2. GET /api/v1/hospitals/{hospital_id}/departments/{department_id}/staff
export const fetchDepartmentStaffThunk = createAsyncThunk(
  'staff/fetchByDepartment',
  async (
    payload: { hospitalId: string; departmentId: string; params?: StaffQueryParams },
    { rejectWithValue }
  ) => {
    try {
      const res = await staffApi.getByDepartment(payload.hospitalId, payload.departmentId, payload.params);
      return {
        data: res.data,
        hospitalId: payload.hospitalId,
        departmentId: payload.departmentId,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch department staff');
    }
  }
);

// 3. GET /api/v1/hospitals/{hospital_id}/icus/{icu_id}/staff
export const fetchIcuStaffThunk = createAsyncThunk(
  'staff/fetchByIcu',
  async (
    payload: { hospitalId: string; icuId: string; params?: StaffQueryParams },
    { rejectWithValue }
  ) => {
    try {
      const res = await staffApi.getByIcu(payload.hospitalId, payload.icuId, payload.params);
      return {
        data: res.data,
        hospitalId: payload.hospitalId,
        icuId: payload.icuId,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch ICU staff');
    }
  }
);

// 4. GET /api/v1/hospitals/{hospital_id}/shifts/{shift_id}/staff
export const fetchShiftStaffThunk = createAsyncThunk(
  'staff/fetchByShift',
  async (
    payload: { hospitalId: string; shiftId: string; params?: StaffQueryParams },
    { rejectWithValue }
  ) => {
    try {
      const res = await staffApi.getByShift(payload.hospitalId, payload.shiftId, payload.params);
      return {
        data: res.data,
        hospitalId: payload.hospitalId,
        shiftId: payload.shiftId,
      };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch shift staff');
    }
  }
);

// 5. POST /api/v1/staff
export const createStaffProfileThunk = createAsyncThunk(
  'staff/createProfile',
  async (payload: StaffProfileCreatePayload, { rejectWithValue }) => {
    try {
      const res = await staffApi.create(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to register clinical staff');
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    setScope: (state, action: PayloadAction<StaffScope>) => {
      state.activeScope = action.payload;
    },
    setSelectedDepartmentId: (state, action: PayloadAction<string | null>) => {
      state.selectedDepartmentId = action.payload;
    },
    setSelectedIcuId: (state, action: PayloadAction<string | null>) => {
      state.selectedIcuId = action.payload;
    },
    setSelectedShiftId: (state, action: PayloadAction<string | null>) => {
      state.selectedShiftId = action.payload;
    },
    clearStaffMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Hospital Staff
    builder
      .addCase(fetchHospitalStaffThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHospitalStaffThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data.items;
        state.total = action.payload.data.total;
        state.limit = action.payload.data.limit;
        state.offset = action.payload.data.offset;
        state.activeScope = 'HOSPITAL';
        state.lastSyncedUrl = `http://10.208.2.18:8000/api/v1/hospitals/${action.payload.hospitalId}/staff`;
        state.lastSyncedTime = new Date().toLocaleTimeString();
      })
      .addCase(fetchHospitalStaffThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 2. Department Staff
    builder
      .addCase(fetchDepartmentStaffThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentStaffThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data.items;
        state.total = action.payload.data.total;
        state.limit = action.payload.data.limit;
        state.offset = action.payload.data.offset;
        state.activeScope = 'DEPARTMENT';
        state.selectedDepartmentId = action.payload.departmentId;
        state.lastSyncedUrl = `http://10.208.2.18:8000/api/v1/hospitals/${action.payload.hospitalId}/departments/${action.payload.departmentId}/staff`;
        state.lastSyncedTime = new Date().toLocaleTimeString();
      })
      .addCase(fetchDepartmentStaffThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 3. ICU Staff
    builder
      .addCase(fetchIcuStaffThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIcuStaffThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data.items;
        state.total = action.payload.data.total;
        state.limit = action.payload.data.limit;
        state.offset = action.payload.data.offset;
        state.activeScope = 'ICU';
        state.selectedIcuId = action.payload.icuId;
        state.lastSyncedUrl = `http://10.208.2.18:8000/api/v1/hospitals/${action.payload.hospitalId}/icus/${action.payload.icuId}/staff`;
        state.lastSyncedTime = new Date().toLocaleTimeString();
      })
      .addCase(fetchIcuStaffThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 4. Shift Staff
    builder
      .addCase(fetchShiftStaffThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShiftStaffThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data.items;
        state.total = action.payload.data.total;
        state.limit = action.payload.data.limit;
        state.offset = action.payload.data.offset;
        state.activeScope = 'SHIFT';
        state.selectedShiftId = action.payload.shiftId;
        state.lastSyncedUrl = `http://10.208.2.18:8000/api/v1/hospitals/${action.payload.hospitalId}/shifts/${action.payload.shiftId}/staff`;
        state.lastSyncedTime = new Date().toLocaleTimeString();
      })
      .addCase(fetchShiftStaffThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 5. Create Staff Profile
    builder
      .addCase(createStaffProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStaffProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = [action.payload, ...state.items];
        state.total += 1;
        state.successMessage = `Staff member ${action.payload.user.first_name} ${action.payload.user.last_name} registered successfully with license ${action.payload.medical_license_number}`;
      })
      .addCase(createStaffProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setScope,
  setSelectedDepartmentId,
  setSelectedIcuId,
  setSelectedShiftId,
  clearStaffMessages,
} = staffSlice.actions;

export default staffSlice.reducer;
