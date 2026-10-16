import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  patientTimelineApi,
  PatientTimelineEvent,
  TimelineMilestoneCreatePayload,
  PatientClinicalHistorySummary,
  PatientAccessHistoryItem,
  PatientTimelineQueryParams,
  PatientAccessHistoryQueryParams,
  createFallbackTimelineEvents,
  createFallbackAccessHistory,
  createFallbackClinicalHistory,
} from '../../api/patientTimelineApi';

export type PatientTimelineSubTab = 'TIMELINE' | 'CLINICAL_HISTORY' | 'ACCESS_HISTORY';

export interface PatientTimelineState {
  activeSubTab: PatientTimelineSubTab;
  selectedPatientId: string;

  // 1. Chronological Timeline (/api/v1/patients/{id}/timeline)
  timelineEvents: PatientTimelineEvent[];
  timelineTotal: number;
  timelinePage: number;
  timelinePageSize: number;
  timelineFilters: {
    category: string;
    severity: string;
    event_type: string;
    admission_id: string;
    start_time: string;
    end_time: string;
    search: string;
  };
  isTimelineLoading: boolean;

  // 2. Clinical History Foundation (/api/v1/patients/{id}/clinical-history)
  clinicalHistory: PatientClinicalHistorySummary | null;
  isHistoryLoading: boolean;

  // 3. Access History Log (/api/v1/patients/{id}/access-history)
  accessHistory: PatientAccessHistoryItem[];
  accessTotal: number;
  accessPage: number;
  accessPageSize: number;
  isAccessLoading: boolean;

  // Milestone Creation & Modals
  isSubmittingMilestone: boolean;
  isMilestoneModalOpen: boolean;
  selectedTimelineEvent: PatientTimelineEvent | null;
  selectedAccessHistoryItem: PatientAccessHistoryItem | null;

  // Status & Telemetry
  error: string | null;
  successMessage: string | null;
  lastSyncedTime: string | null;
}

const DEFAULT_PATIENT_ID = '494baa9d-c2ab-4657-aef5-b7f5c57e60f6';

const initialState: PatientTimelineState = {
  activeSubTab: 'TIMELINE',
  selectedPatientId: DEFAULT_PATIENT_ID,

  timelineEvents: createFallbackTimelineEvents(DEFAULT_PATIENT_ID),
  timelineTotal: createFallbackTimelineEvents(DEFAULT_PATIENT_ID).length,
  timelinePage: 1,
  timelinePageSize: 50,
  timelineFilters: {
    category: 'ALL',
    severity: 'ALL',
    event_type: 'ALL',
    admission_id: '',
    start_time: '',
    end_time: '',
    search: '',
  },
  isTimelineLoading: false,

  clinicalHistory: createFallbackClinicalHistory(DEFAULT_PATIENT_ID),
  isHistoryLoading: false,

  accessHistory: createFallbackAccessHistory(DEFAULT_PATIENT_ID),
  accessTotal: createFallbackAccessHistory(DEFAULT_PATIENT_ID).length,
  accessPage: 1,
  accessPageSize: 50,
  isAccessLoading: false,

  isSubmittingMilestone: false,
  isMilestoneModalOpen: false,
  selectedTimelineEvent: null,
  selectedAccessHistoryItem: null,

  error: null,
  successMessage: null,
  lastSyncedTime: null,
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchPatientTimelineThunk = createAsyncThunk(
  'patientTimeline/fetchTimeline',
  async (
    payload: { patientId: string; params?: PatientTimelineQueryParams },
    { rejectWithValue }
  ) => {
    try {
      const res = await patientTimelineApi.getTimeline(payload.patientId, payload.params);
      return { patientId: payload.patientId, data: res.data };
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch chronological patient timeline');
    }
  }
);

export const appendTimelineMilestoneThunk = createAsyncThunk(
  'patientTimeline/appendMilestone',
  async (
    payload: { patientId: string; data: TimelineMilestoneCreatePayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await patientTimelineApi.appendMilestone(payload.patientId, payload.data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to record timeline milestone');
    }
  }
);

export const fetchPatientClinicalHistoryThunk = createAsyncThunk(
  'patientTimeline/fetchClinicalHistory',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const res = await patientTimelineApi.getClinicalHistory(patientId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch patient clinical history');
    }
  }
);

export const fetchPatientAccessHistoryThunk = createAsyncThunk(
  'patientTimeline/fetchAccessHistory',
  async (
    payload: { patientId: string; params?: PatientAccessHistoryQueryParams },
    { rejectWithValue }
  ) => {
    try {
      const res = await patientTimelineApi.getAccessHistory(payload.patientId, payload.params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch patient access history');
    }
  }
);

// ==========================================
// REDUX SLICE
// ==========================================

export const patientTimelineSlice = createSlice({
  name: 'patientTimeline',
  initialState,
  reducers: {
    setActiveSubTab: (state, action: PayloadAction<PatientTimelineSubTab>) => {
      state.activeSubTab = action.payload;
    },
    setSelectedPatientId: (state, action: PayloadAction<string>) => {
      state.selectedPatientId = action.payload;
      state.timelinePage = 1;
      state.accessPage = 1;
    },
    setTimelinePage: (state, action: PayloadAction<number>) => {
      state.timelinePage = action.payload;
    },
    setTimelinePageSize: (state, action: PayloadAction<number>) => {
      state.timelinePageSize = action.payload;
    },
    setTimelineFilters: (
      state,
      action: PayloadAction<Partial<PatientTimelineState['timelineFilters']>>
    ) => {
      state.timelineFilters = { ...state.timelineFilters, ...action.payload };
      state.timelinePage = 1;
    },
    resetTimelineFilters: (state) => {
      state.timelineFilters = initialState.timelineFilters;
      state.timelinePage = 1;
    },
    setAccessPage: (state, action: PayloadAction<number>) => {
      state.accessPage = action.payload;
    },
    setAccessPageSize: (state, action: PayloadAction<number>) => {
      state.accessPageSize = action.payload;
    },
    setIsMilestoneModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isMilestoneModalOpen = action.payload;
    },
    setSelectedTimelineEvent: (state, action: PayloadAction<PatientTimelineEvent | null>) => {
      state.selectedTimelineEvent = action.payload;
    },
    setSelectedAccessHistoryItem: (state, action: PayloadAction<PatientAccessHistoryItem | null>) => {
      state.selectedAccessHistoryItem = action.payload;
    },
    clearTimelineMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch Timeline
    builder
      .addCase(fetchPatientTimelineThunk.pending, (state) => {
        state.isTimelineLoading = true;
        state.error = null;
      })
      .addCase(fetchPatientTimelineThunk.fulfilled, (state, action) => {
        state.isTimelineLoading = false;
        state.timelineEvents = action.payload.data.items;
        state.timelineTotal = action.payload.data.total;
        state.timelinePage = action.payload.data.page || state.timelinePage;
        state.timelinePageSize = action.payload.data.page_size || state.timelinePageSize;
        state.lastSyncedTime = new Date().toLocaleTimeString();
      })
      .addCase(fetchPatientTimelineThunk.rejected, (state, action) => {
        state.isTimelineLoading = false;
        state.error = action.payload as string;
      });

    // 2. Append Milestone
    builder
      .addCase(appendTimelineMilestoneThunk.pending, (state) => {
        state.isSubmittingMilestone = true;
        state.error = null;
      })
      .addCase(appendTimelineMilestoneThunk.fulfilled, (state, action) => {
        state.isSubmittingMilestone = false;
        state.timelineEvents.unshift(action.payload);
        state.timelineTotal += 1;
        state.successMessage = 'Clinical milestone appended to patient timeline.';
        state.isMilestoneModalOpen = false;
      })
      .addCase(appendTimelineMilestoneThunk.rejected, (state, action) => {
        state.isSubmittingMilestone = false;
        state.error = action.payload as string;
      });

    // 3. Clinical History Summary
    builder
      .addCase(fetchPatientClinicalHistoryThunk.pending, (state) => {
        state.isHistoryLoading = true;
      })
      .addCase(fetchPatientClinicalHistoryThunk.fulfilled, (state, action) => {
        state.isHistoryLoading = false;
        state.clinicalHistory = action.payload;
      })
      .addCase(fetchPatientClinicalHistoryThunk.rejected, (state, action) => {
        state.isHistoryLoading = false;
        state.error = action.payload as string;
      });

    // 4. Access History
    builder
      .addCase(fetchPatientAccessHistoryThunk.pending, (state) => {
        state.isAccessLoading = true;
      })
      .addCase(fetchPatientAccessHistoryThunk.fulfilled, (state, action) => {
        state.isAccessLoading = false;
        state.accessHistory = action.payload.items;
        state.accessTotal = action.payload.total;
        state.accessPage = action.payload.page || state.accessPage;
        state.accessPageSize = action.payload.page_size || state.accessPageSize;
      })
      .addCase(fetchPatientAccessHistoryThunk.rejected, (state, action) => {
        state.isAccessLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveSubTab,
  setSelectedPatientId,
  setTimelinePage,
  setTimelinePageSize,
  setTimelineFilters,
  resetTimelineFilters,
  setAccessPage,
  setAccessPageSize,
  setIsMilestoneModalOpen,
  setSelectedTimelineEvent,
  setSelectedAccessHistoryItem,
  clearTimelineMessages,
} = patientTimelineSlice.actions;

export default patientTimelineSlice.reducer;
