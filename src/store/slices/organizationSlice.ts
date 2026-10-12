import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  organizationApi,
  FALLBACK_ORGANIZATIONS,
} from '../../api/organizationApi';
import {
  OrganizationResponse,
  OrganizationCreatePayload,
} from '../../types/organization';

export interface OrganizationState {
  organizations: OrganizationResponse[];
  selectedOrganizationId: string | null;
  selectedOrganization: OrganizationResponse | null;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: OrganizationState = {
  organizations: FALLBACK_ORGANIZATIONS,
  selectedOrganizationId: null,
  selectedOrganization: null,
  isLoading: false,
  isActionLoading: false,
  error: null,
  successMessage: null,
};

// ------------------------------------------------------------------
// Async Thunks
// ------------------------------------------------------------------

export const fetchOrganizationsThunk = createAsyncThunk(
  'organization/fetchOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationApi.listOrganizations();
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch organizations list');
    }
  }
);

export const createOrganizationThunk = createAsyncThunk(
  'organization/createOrganization',
  async (payload: OrganizationCreatePayload, { rejectWithValue }) => {
    try {
      const response = await organizationApi.createOrganization(payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to register parent healthcare organization');
    }
  }
);

// ------------------------------------------------------------------
// Organization Slice Definition
// ------------------------------------------------------------------

export const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setSelectedOrganizationId: (state, action: PayloadAction<string | null>) => {
      state.selectedOrganizationId = action.payload;
      if (action.payload) {
        state.selectedOrganization =
          state.organizations.find((o) => o.id === action.payload) || null;
      } else {
        state.selectedOrganization = null;
      }
    },
    setSelectedOrganization: (state, action: PayloadAction<OrganizationResponse | null>) => {
      state.selectedOrganization = action.payload;
      state.selectedOrganizationId = action.payload ? action.payload.id : null;
    },
    clearOrganizationError: (state) => {
      state.error = null;
    },
    clearOrganizationSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Organizations
    builder
      .addCase(fetchOrganizationsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchOrganizationsThunk.fulfilled,
        (state, action: PayloadAction<OrganizationResponse[]>) => {
          state.isLoading = false;
          state.organizations = action.payload;
          if (state.selectedOrganizationId) {
            state.selectedOrganization =
              action.payload.find((o) => o.id === state.selectedOrganizationId) ||
              state.selectedOrganization;
          }
        }
      )
      .addCase(fetchOrganizationsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Organization
    builder
      .addCase(createOrganizationThunk.pending, (state) => {
        state.isActionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        createOrganizationThunk.fulfilled,
        (state, action: PayloadAction<OrganizationResponse>) => {
          state.isActionLoading = false;
          state.organizations = [
            action.payload,
            ...state.organizations.filter((o) => o.id !== action.payload.id),
          ];
          state.successMessage = `Organization "${action.payload.name}" (${action.payload.code}) registered successfully!`;
        }
      )
      .addCase(createOrganizationThunk.rejected, (state, action) => {
        state.isActionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedOrganizationId,
  setSelectedOrganization,
  clearOrganizationError,
  clearOrganizationSuccessMessage,
} = organizationSlice.actions;

export default organizationSlice.reducer;
