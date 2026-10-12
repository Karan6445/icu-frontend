import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  districtApi,
  FALLBACK_DISTRICTS,
} from '../../api/districtApi';
import {
  DistrictResponse,
  DistrictCreatePayload,
  DistrictUpdatePayload,
  DistrictListParams,
  DistrictHierarchyResponse,
  DistrictHospitalItem,
} from '../../types/districtHierarchy';

export interface DistrictState {
  districts: DistrictResponse[];
  selectedDistrictId: string | null;
  selectedDistrict: DistrictResponse | null;
  selectedDistrictHospitals: DistrictHospitalItem[];
  selectedDistrictHierarchy: DistrictHierarchyResponse | null;
  selectedStateFilter: string | null;
  isLoading: boolean;
  isHospitalsLoading: boolean;
  isHierarchyLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: DistrictState = {
  districts: FALLBACK_DISTRICTS,
  selectedDistrictId: null,
  selectedDistrict: null,
  selectedDistrictHospitals: [],
  selectedDistrictHierarchy: null,
  selectedStateFilter: null,
  isLoading: false,
  isHospitalsLoading: false,
  isHierarchyLoading: false,
  isActionLoading: false,
  error: null,
  successMessage: null,
};

// ------------------------------------------------------------------
// Async Thunks
// ------------------------------------------------------------------

export const fetchDistrictsThunk = createAsyncThunk(
  'district/fetchDistricts',
  async (params: DistrictListParams | undefined, { rejectWithValue }) => {
    try {
      const response = await districtApi.listDistricts(params);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch districts');
    }
  }
);

export const fetchDistrictByIdThunk = createAsyncThunk(
  'district/fetchDistrictById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await districtApi.getDistrictById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch district ${id}`);
    }
  }
);

export const createDistrictThunk = createAsyncThunk(
  'district/createDistrict',
  async (payload: DistrictCreatePayload, { rejectWithValue }) => {
    try {
      const response = await districtApi.createDistrict(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to register district');
    }
  }
);

export const updateDistrictThunk = createAsyncThunk(
  'district/updateDistrict',
  async (
    { id, payload }: { id: string; payload: DistrictUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await districtApi.updateDistrict(id, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to update district ${id}`);
    }
  }
);

export const deleteDistrictThunk = createAsyncThunk(
  'district/deleteDistrict',
  async (id: string, { rejectWithValue }) => {
    try {
      await districtApi.deleteDistrict(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to delete district ${id}`);
    }
  }
);

export const fetchDistrictHospitalsThunk = createAsyncThunk(
  'district/fetchDistrictHospitals',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await districtApi.listHospitalsByDistrict(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch hospitals in district ${id}`);
    }
  }
);

export const fetchDistrictHierarchyThunk = createAsyncThunk(
  'district/fetchDistrictHierarchy',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await districtApi.getDistrictHierarchy(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch district hierarchy for ${id}`);
    }
  }
);

// ------------------------------------------------------------------
// District Slice Definition
// ------------------------------------------------------------------

export const districtSlice = createSlice({
  name: 'district',
  initialState,
  reducers: {
    setSelectedDistrictId: (state, action: PayloadAction<string | null>) => {
      state.selectedDistrictId = action.payload;
      if (action.payload) {
        state.selectedDistrict =
          state.districts.find((d) => d.id === action.payload) || null;
      } else {
        state.selectedDistrict = null;
      }
    },
    setSelectedDistrict: (state, action: PayloadAction<DistrictResponse | null>) => {
      state.selectedDistrict = action.payload;
      state.selectedDistrictId = action.payload ? action.payload.id : null;
    },
    setSelectedStateFilter: (state, action: PayloadAction<string | null>) => {
      state.selectedStateFilter = action.payload;
    },
    clearDistrictHierarchy: (state) => {
      state.selectedDistrictHierarchy = null;
    },
    clearDistrictHospitals: (state) => {
      state.selectedDistrictHospitals = [];
    },
    clearDistrictError: (state) => {
      state.error = null;
    },
    clearDistrictSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Districts
    builder
      .addCase(fetchDistrictsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDistrictsThunk.fulfilled,
        (state, action: PayloadAction<DistrictResponse[]>) => {
          state.isLoading = false;
          state.districts = action.payload;
          if (state.selectedDistrictId) {
            state.selectedDistrict =
              action.payload.find((d) => d.id === state.selectedDistrictId) ||
              state.selectedDistrict;
          }
        }
      )
      .addCase(fetchDistrictsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch District by ID
    builder
      .addCase(
        fetchDistrictByIdThunk.fulfilled,
        (state, action: PayloadAction<DistrictResponse>) => {
          state.selectedDistrict = action.payload;
          state.selectedDistrictId = action.payload.id;
          const exists = state.districts.some((d) => d.id === action.payload.id);
          if (exists) {
            state.districts = state.districts.map((d) =>
              d.id === action.payload.id ? action.payload : d
            );
          } else {
            state.districts.unshift(action.payload);
          }
        }
      );

    // Create District
    builder
      .addCase(createDistrictThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        createDistrictThunk.fulfilled,
        (state, action: PayloadAction<DistrictResponse>) => {
          state.isActionLoading = false;
          state.districts = [
            action.payload,
            ...state.districts.filter((d) => d.id !== action.payload.id),
          ];
          state.successMessage = `District "${action.payload.name}" (${action.payload.code}) registered successfully!`;
        }
      )
      .addCase(createDistrictThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // Update District
    builder
      .addCase(updateDistrictThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        updateDistrictThunk.fulfilled,
        (state, action: PayloadAction<DistrictResponse>) => {
          state.isActionLoading = false;
          state.districts = state.districts.map((d) =>
            d.id === action.payload.id ? action.payload : d
          );
          if (state.selectedDistrict?.id === action.payload.id) {
            state.selectedDistrict = action.payload;
          }
          state.successMessage = `District "${action.payload.name}" updated successfully!`;
        }
      )
      .addCase(updateDistrictThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // Delete District
    builder
      .addCase(deleteDistrictThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteDistrictThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isActionLoading = false;
        state.districts = state.districts.filter((d) => d.id !== action.payload);
        if (state.selectedDistrictId === action.payload) {
          state.selectedDistrictId = null;
          state.selectedDistrict = null;
          state.selectedDistrictHierarchy = null;
          state.selectedDistrictHospitals = [];
        }
        state.successMessage = 'District deactivated or deleted successfully.';
      })
      .addCase(deleteDistrictThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // Fetch District Hospitals
    builder
      .addCase(fetchDistrictHospitalsThunk.pending, (state) => {
        state.isHospitalsLoading = true;
      })
      .addCase(
        fetchDistrictHospitalsThunk.fulfilled,
        (state, action: PayloadAction<DistrictHospitalItem[]>) => {
          state.isHospitalsLoading = false;
          state.selectedDistrictHospitals = action.payload;
        }
      )
      .addCase(fetchDistrictHospitalsThunk.rejected, (state, action) => {
        state.isHospitalsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch District Hierarchy
    builder
      .addCase(fetchDistrictHierarchyThunk.pending, (state) => {
        state.isHierarchyLoading = true;
      })
      .addCase(
        fetchDistrictHierarchyThunk.fulfilled,
        (state, action: PayloadAction<DistrictHierarchyResponse>) => {
          state.isHierarchyLoading = false;
          state.selectedDistrictHierarchy = action.payload;
        }
      )
      .addCase(fetchDistrictHierarchyThunk.rejected, (state, action) => {
        state.isHierarchyLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedDistrictId,
  setSelectedDistrict,
  setSelectedStateFilter,
  clearDistrictHierarchy,
  clearDistrictHospitals,
  clearDistrictError,
  clearDistrictSuccessMessage,
} = districtSlice.actions;

export default districtSlice.reducer;
