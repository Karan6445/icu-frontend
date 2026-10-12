import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  stateApi,
  FALLBACK_STATES,
} from '../../api/stateApi';
import {
  StateResponse,
  StateCreatePayload,
  StateUpdatePayload,
  DistrictResponse,
  StateHierarchyResponse,
} from '../../types/stateHierarchy';

export interface StateState {
  states: StateResponse[];
  selectedStateId: string | null;
  selectedState: StateResponse | null;
  selectedStateDistricts: DistrictResponse[];
  selectedStateHierarchy: StateHierarchyResponse | null;
  isLoading: boolean;
  isHierarchyLoading: boolean;
  isDistrictsLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: StateState = {
  states: FALLBACK_STATES,
  selectedStateId: null,
  selectedState: null,
  selectedStateDistricts: [],
  selectedStateHierarchy: null,
  isLoading: false,
  isHierarchyLoading: false,
  isDistrictsLoading: false,
  isActionLoading: false,
  error: null,
  successMessage: null,
};

// ------------------------------------------------------------------
// Async Thunks
// ------------------------------------------------------------------

export const fetchStatesThunk = createAsyncThunk(
  'state/fetchStates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await stateApi.listStates();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch states');
    }
  }
);

export const fetchStateByIdThunk = createAsyncThunk(
  'state/fetchStateById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await stateApi.getStateById(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch state ${id}`);
    }
  }
);

export const createStateThunk = createAsyncThunk(
  'state/createState',
  async (payload: StateCreatePayload, { rejectWithValue }) => {
    try {
      const response = await stateApi.createState(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to register state');
    }
  }
);

export const updateStateThunk = createAsyncThunk(
  'state/updateState',
  async ({ id, payload }: { id: string; payload: StateUpdatePayload }, { rejectWithValue }) => {
    try {
      const response = await stateApi.updateState(id, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to update state ${id}`);
    }
  }
);

export const deleteStateThunk = createAsyncThunk(
  'state/deleteState',
  async (id: string, { rejectWithValue }) => {
    try {
      await stateApi.deleteState(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to delete state ${id}`);
    }
  }
);

export const fetchStateDistrictsThunk = createAsyncThunk(
  'state/fetchStateDistricts',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await stateApi.listDistrictsByState(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch districts for state ${id}`);
    }
  }
);

export const fetchStateHierarchyThunk = createAsyncThunk(
  'state/fetchStateHierarchy',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await stateApi.getStateHierarchy(id);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || `Failed to fetch state hierarchy for ${id}`);
    }
  }
);

// ------------------------------------------------------------------
// State Slice Definition
// ------------------------------------------------------------------

export const stateSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    setSelectedStateId: (state, action: PayloadAction<string | null>) => {
      state.selectedStateId = action.payload;
      if (action.payload) {
        state.selectedState = state.states.find((s) => s.id === action.payload) || null;
      } else {
        state.selectedState = null;
      }
    },
    setSelectedState: (state, action: PayloadAction<StateResponse | null>) => {
      state.selectedState = action.payload;
      state.selectedStateId = action.payload ? action.payload.id : null;
    },
    clearHierarchy: (state) => {
      state.selectedStateHierarchy = null;
    },
    clearStateDistricts: (state) => {
      state.selectedStateDistricts = [];
    },
    clearStateError: (state) => {
      state.error = null;
    },
    clearStateSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch States
    builder
      .addCase(fetchStatesThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStatesThunk.fulfilled, (state, action: PayloadAction<StateResponse[]>) => {
        state.isLoading = false;
        state.states = action.payload;
        // Keep selectedState in sync if one is selected
        if (state.selectedStateId) {
          state.selectedState = action.payload.find((s) => s.id === state.selectedStateId) || state.selectedState;
        }
      })
      .addCase(fetchStatesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch State by ID
    builder
      .addCase(fetchStateByIdThunk.fulfilled, (state, action: PayloadAction<StateResponse>) => {
        state.selectedState = action.payload;
        state.selectedStateId = action.payload.id;
        const exists = state.states.some((s) => s.id === action.payload.id);
        if (exists) {
          state.states = state.states.map((s) => (s.id === action.payload.id ? action.payload : s));
        } else {
          state.states.unshift(action.payload);
        }
      });

    // Create State
    builder
      .addCase(createStateThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createStateThunk.fulfilled, (state, action: PayloadAction<StateResponse>) => {
        state.isActionLoading = false;
        state.states = [action.payload, ...state.states.filter((s) => s.id !== action.payload.id)];
        state.successMessage = `State "${action.payload.name}" (${action.payload.code}) registered successfully!`;
      })
      .addCase(createStateThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // Update State
    builder
      .addCase(updateStateThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateStateThunk.fulfilled, (state, action: PayloadAction<StateResponse>) => {
        state.isActionLoading = false;
        state.states = state.states.map((s) => (s.id === action.payload.id ? action.payload : s));
        if (state.selectedState?.id === action.payload.id) {
          state.selectedState = action.payload;
        }
        state.successMessage = `State "${action.payload.name}" updated successfully!`;
      })
      .addCase(updateStateThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // Delete State
    builder
      .addCase(deleteStateThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
      })
      .addCase(deleteStateThunk.fulfilled, (state, action: PayloadAction<string>) => {
        state.isActionLoading = false;
        state.states = state.states.filter((s) => s.id !== action.payload);
        if (state.selectedStateId === action.payload) {
          state.selectedStateId = null;
          state.selectedState = null;
          state.selectedStateHierarchy = null;
          state.selectedStateDistricts = [];
        }
        state.successMessage = 'State record removed or deactivated successfully.';
      })
      .addCase(deleteStateThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });

    // Fetch State Districts
    builder
      .addCase(fetchStateDistrictsThunk.pending, (state) => {
        state.isDistrictsLoading = true;
      })
      .addCase(fetchStateDistrictsThunk.fulfilled, (state, action: PayloadAction<DistrictResponse[]>) => {
        state.isDistrictsLoading = false;
        state.selectedStateDistricts = action.payload;
      })
      .addCase(fetchStateDistrictsThunk.rejected, (state, action) => {
        state.isDistrictsLoading = false;
        state.error = action.payload as string;
      });

    // Fetch State Hierarchy
    builder
      .addCase(fetchStateHierarchyThunk.pending, (state) => {
        state.isHierarchyLoading = true;
      })
      .addCase(fetchStateHierarchyThunk.fulfilled, (state, action: PayloadAction<StateHierarchyResponse>) => {
        state.isHierarchyLoading = false;
        state.selectedStateHierarchy = action.payload;
      })
      .addCase(fetchStateHierarchyThunk.rejected, (state, action) => {
        state.isHierarchyLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedStateId,
  setSelectedState,
  clearHierarchy,
  clearStateDistricts,
  clearStateError,
  clearStateSuccessMessage,
} = stateSlice.actions;

export default stateSlice.reducer;
