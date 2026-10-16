import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  emergencyApi,
  EmergencyEventResponse,
  EmergencyEventDeclare,
  EmergencyEventConclude,
  EmergencyListQueryParams,
  createFallbackEmergencyEvents,
} from '../../api/emergencyApi';

export interface EmergencyState {
  events: EmergencyEventResponse[];
  activeEvents: EmergencyEventResponse[];
  selectedEvent: EmergencyEventResponse | null;
  eventToConclude: EmergencyEventResponse | null;

  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  successMessage: string | null;

  // Modals & UI controls
  isDeclareModalOpen: boolean;
  isConcludeModalOpen: boolean;
  isDetailsDrawerOpen: boolean;

  // Active filters
  filterStatus: 'ALL' | 'ACTIVE' | 'CONCLUDED' | 'CANCELLED';
  searchQuery: string;
  selectedPatientFilter: string;

  lastPollTime: string | null;
}

const initialFallback = createFallbackEmergencyEvents();

const initialState: EmergencyState = {
  events: initialFallback,
  activeEvents: initialFallback.filter(e => e.status === 'ACTIVE'),
  selectedEvent: null,
  eventToConclude: null,

  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,

  isDeclareModalOpen: false,
  isConcludeModalOpen: false,
  isDetailsDrawerOpen: false,

  filterStatus: 'ALL',
  searchQuery: '',
  selectedPatientFilter: '',

  lastPollTime: null,
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchEmergencyEventsThunk = createAsyncThunk(
  'emergency/fetchEvents',
  async (params: EmergencyListQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await emergencyApi.list(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.message || 'Failed to retrieve emergency events from telemetry server.'
      );
    }
  }
);

export const fetchEmergencyEventByIdThunk = createAsyncThunk(
  'emergency/fetchEventById',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const res = await emergencyApi.getById(eventId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.message || 'Failed to retrieve emergency event dossier.'
      );
    }
  }
);

export const declareEmergencyThunk = createAsyncThunk(
  'emergency/declare',
  async (payload: EmergencyEventDeclare, { dispatch, rejectWithValue }) => {
    try {
      const res = await emergencyApi.declare(payload);
      // Immediately refresh the events list
      dispatch(fetchEmergencyEventsThunk(undefined));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.message || 'Failed to declare emergency resuscitation code blue.'
      );
    }
  }
);

export const concludeEmergencyThunk = createAsyncThunk(
  'emergency/conclude',
  async (
    { eventId, payload }: { eventId: string; payload: EmergencyEventConclude },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await emergencyApi.conclude(eventId, payload);
      // Immediately refresh the events list
      dispatch(fetchEmergencyEventsThunk(undefined));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.message || 'Failed to conclude resuscitation debrief.'
      );
    }
  }
);

// ==========================================
// EMERGENCY SLICE
// ==========================================

export const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    openDeclareModal: (state) => {
      state.isDeclareModalOpen = true;
      state.error = null;
    },
    closeDeclareModal: (state) => {
      state.isDeclareModalOpen = false;
    },
    openConcludeModal: (state, action: PayloadAction<EmergencyEventResponse>) => {
      state.eventToConclude = action.payload;
      state.isConcludeModalOpen = true;
      state.error = null;
    },
    closeConcludeModal: (state) => {
      state.isConcludeModalOpen = false;
      state.eventToConclude = null;
    },
    openDetailsDrawer: (state, action: PayloadAction<EmergencyEventResponse>) => {
      state.selectedEvent = action.payload;
      state.isDetailsDrawerOpen = true;
    },
    closeDetailsDrawer: (state) => {
      state.isDetailsDrawerOpen = false;
    },
    setSelectedEvent: (state, action: PayloadAction<EmergencyEventResponse | null>) => {
      state.selectedEvent = action.payload;
    },
    setStatusFilter: (
      state,
      action: PayloadAction<'ALL' | 'ACTIVE' | 'CONCLUDED' | 'CANCELLED'>
    ) => {
      state.filterStatus = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedPatientFilter: (state, action: PayloadAction<string>) => {
      state.selectedPatientFilter = action.payload;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch Events List
    builder.addCase(fetchEmergencyEventsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEmergencyEventsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.events = action.payload;
      state.activeEvents = action.payload.filter((e) => e.status === 'ACTIVE');
      state.lastPollTime = new Date().toLocaleTimeString();
    });
    builder.addCase(fetchEmergencyEventsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = (action.payload as string) || 'Failed to fetch emergency events.';
    });

    // 2. Fetch Single Event Dossier
    builder.addCase(fetchEmergencyEventByIdThunk.fulfilled, (state, action) => {
      state.selectedEvent = action.payload;
      // also update in list if present
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
        state.activeEvents = state.events.filter((e) => e.status === 'ACTIVE');
      }
    });

    // 3. Declare Emergency
    builder.addCase(declareEmergencyThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(declareEmergencyThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.isDeclareModalOpen = false;
      state.successMessage = `Code Blue Resuscitation activated for Bed ${action.payload.bed_id.slice(-6).toUpperCase()}!`;
      // Prepend to events list immediately
      const exists = state.events.some((e) => e.id === action.payload.id);
      if (!exists) {
        state.events = [action.payload, ...state.events];
      }
      state.activeEvents = state.events.filter((e) => e.status === 'ACTIVE');
    });
    builder.addCase(declareEmergencyThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = (action.payload as string) || 'Failed to activate emergency.';
    });

    // 4. Conclude Emergency
    builder.addCase(concludeEmergencyThunk.pending, (state) => {
      state.isSubmitting = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(concludeEmergencyThunk.fulfilled, (state, action) => {
      state.isSubmitting = false;
      state.isConcludeModalOpen = false;
      state.eventToConclude = null;
      const roscText = action.payload.rosc_achieved ? 'ROSC Achieved' : 'Resuscitation Concluded';
      state.successMessage = `${roscText}: Code Blue #${action.payload.id.slice(-6).toUpperCase()} concluded and debrief logged.`;
      // Update in events array
      state.events = state.events.map((e) =>
        e.id === action.payload.id ? action.payload : e
      );
      state.activeEvents = state.events.filter((e) => e.status === 'ACTIVE');
      if (state.selectedEvent?.id === action.payload.id) {
        state.selectedEvent = action.payload;
      }
    });
    builder.addCase(concludeEmergencyThunk.rejected, (state, action) => {
      state.isSubmitting = false;
      state.error = (action.payload as string) || 'Failed to conclude emergency debrief.';
    });
  },
});

export const {
  openDeclareModal,
  closeDeclareModal,
  openConcludeModal,
  closeConcludeModal,
  openDetailsDrawer,
  closeDetailsDrawer,
  setSelectedEvent,
  setStatusFilter,
  setSearchQuery,
  setSelectedPatientFilter,
  clearMessages,
} = emergencySlice.actions;

export default emergencySlice.reducer;
