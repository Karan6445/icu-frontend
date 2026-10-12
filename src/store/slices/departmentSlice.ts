import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  departmentApi,
  DepartmentCreate,
  DepartmentResponse,
  FALLBACK_DEPARTMENTS,
} from '../../api/departmentApi';

export interface DepartmentState {
  departments: DepartmentResponse[];
  selectedHospitalId: string | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: DepartmentState = {
  departments: FALLBACK_DEPARTMENTS,
  selectedHospitalId: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
  successMessage: null,
};

// 1. GET /api/v1/departments?hospital_id=... (List Departments)
export const fetchDepartmentsThunk = createAsyncThunk(
  'department/fetchDepartments',
  async (hospital_id: string, { rejectWithValue }) => {
    try {
      const res = await departmentApi.list(hospital_id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to fetch departments');
    }
  }
);

// 2. POST /api/v1/departments (Create Clinical Department)
export const createDepartmentThunk = createAsyncThunk(
  'department/createDepartment',
  async (payload: DepartmentCreate, { rejectWithValue }) => {
    try {
      const res = await departmentApi.create(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || err?.message || 'Failed to create department');
    }
  }
);

export const departmentSlice = createSlice({
  name: 'department',
  initialState,
  reducers: {
    setSelectedHospitalId: (state, action: PayloadAction<string>) => {
      state.selectedHospitalId = action.payload;
    },
    clearDepartmentError: (state) => {
      state.error = null;
    },
    clearDepartmentSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // fetchDepartmentsThunk
    builder.addCase(fetchDepartmentsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDepartmentsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.departments = action.payload;
    });
    builder.addCase(fetchDepartmentsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to load departments';
    });

    // createDepartmentThunk
    builder.addCase(createDepartmentThunk.pending, (state) => {
      state.isActionLoading = true;
      state.error = null;
    });
    builder.addCase(createDepartmentThunk.fulfilled, (state, action) => {
      state.isActionLoading = false;
      state.departments.unshift(action.payload);
      state.successMessage = `Department "${action.payload.name}" created successfully.`;
    });
    builder.addCase(createDepartmentThunk.rejected, (state, action) => {
      state.isActionLoading = false;
      state.error = (action.payload as string) || action.error.message || 'Failed to create department';
    });
  },
});

export const {
  setSelectedHospitalId,
  clearDepartmentError,
  clearDepartmentSuccessMessage,
} = departmentSlice.actions;

export default departmentSlice.reducer;
