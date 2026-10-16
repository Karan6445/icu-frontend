import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  operationsApi,
  DoctorRoundResponse,
  DoctorRoundCreatePayload,
  DoctorRoundUpdatePayload,
  DoctorRoundsQueryParams,
  NursingActionResponse,
  NursingActionCreatePayload,
  NursingActionsQueryParams,
  NurseHandoverResponse,
  NurseHandoverCreatePayload,
  NurseHandoverAcknowledgePayload,
  NurseHandoversQueryParams,
  ShiftHandoverResponse,
  ShiftHandoverCreatePayload,
  ShiftHandoverAcknowledgePayload,
  ShiftHandoversQueryParams,
  createFallbackDoctorRounds,
  createFallbackNursingActions,
  createFallbackNurseHandovers,
  createFallbackShiftHandovers,
  DEFAULT_ADMISSION_UUID,
  DEFAULT_OPERATIONS_PATIENT_UUID as DEFAULT_PATIENT_UUID,
  DEFAULT_ICU_UUID,
} from '../../api/operationsApi';

export type OperationsSubTab =
  | 'ROUNDS'
  | 'NURSING_ACTIONS'
  | 'NURSE_HANDOVERS'
  | 'SHIFT_HANDOVERS';

export interface OperationsState {
  activeSubTab: OperationsSubTab;
  selectedAdmissionId: string;
  selectedPatientId: string;
  selectedIcuId: string;

  // 1. Doctor Rounds
  doctorRounds: DoctorRoundResponse[];
  selectedDoctorRound: DoctorRoundResponse | null;
  isDoctorRoundsLoading: boolean;
  isSubmittingRound: boolean;

  // 2. Nursing Actions
  nursingActions: NursingActionResponse[];
  selectedNursingAction: NursingActionResponse | null;
  isNursingActionsLoading: boolean;
  isSubmittingNursingAction: boolean;

  // 3. Nurse Handovers
  nurseHandovers: NurseHandoverResponse[];
  myPendingNurseHandovers: NurseHandoverResponse[];
  selectedNurseHandover: NurseHandoverResponse | null;
  isNurseHandoversLoading: boolean;
  isSubmittingNurseHandover: boolean;
  isAcknowledgingNurseHandover: boolean;

  // 4. Shift Handovers
  shiftHandovers: ShiftHandoverResponse[];
  myPendingShiftHandovers: ShiftHandoverResponse[];
  selectedShiftHandover: ShiftHandoverResponse | null;
  isShiftHandoversLoading: boolean;
  isSubmittingShiftHandover: boolean;
  isAcknowledgingShiftHandover: boolean;

  // Modals & UI Controls
  isRecordRoundModalOpen: boolean;
  isUpdateRoundModalOpen: boolean;
  isRecordNursingActionModalOpen: boolean;
  isSubmitNurseHandoverModalOpen: boolean;
  isAcknowledgeNurseHandoverModalOpen: boolean;
  isSubmitShiftHandoverModalOpen: boolean;
  isAcknowledgeShiftHandoverModalOpen: boolean;

  error: string | null;
  successMessage: string | null;
  lastSyncedTime: string;
}

const initialState: OperationsState = {
  activeSubTab: 'ROUNDS',
  selectedAdmissionId: DEFAULT_ADMISSION_UUID,
  selectedPatientId: DEFAULT_PATIENT_UUID,
  selectedIcuId: DEFAULT_ICU_UUID,

  doctorRounds: createFallbackDoctorRounds(),
  selectedDoctorRound: null,
  isDoctorRoundsLoading: false,
  isSubmittingRound: false,

  nursingActions: createFallbackNursingActions(),
  selectedNursingAction: null,
  isNursingActionsLoading: false,
  isSubmittingNursingAction: false,

  nurseHandovers: createFallbackNurseHandovers(),
  myPendingNurseHandovers: createFallbackNurseHandovers().filter(
    (h) => h.status === 'PENDING_ACKNOWLEDGEMENT'
  ),
  selectedNurseHandover: null,
  isNurseHandoversLoading: false,
  isSubmittingNurseHandover: false,
  isAcknowledgingNurseHandover: false,

  shiftHandovers: createFallbackShiftHandovers(),
  myPendingShiftHandovers: createFallbackShiftHandovers().filter(
    (h) => h.status === 'PENDING_ACKNOWLEDGEMENT'
  ),
  selectedShiftHandover: null,
  isShiftHandoversLoading: false,
  isSubmittingShiftHandover: false,
  isAcknowledgingShiftHandover: false,

  isRecordRoundModalOpen: false,
  isUpdateRoundModalOpen: false,
  isRecordNursingActionModalOpen: false,
  isSubmitNurseHandoverModalOpen: false,
  isAcknowledgeNurseHandoverModalOpen: false,
  isSubmitShiftHandoverModalOpen: false,
  isAcknowledgeShiftHandoverModalOpen: false,

  error: null,
  successMessage: null,
  lastSyncedTime: new Date().toLocaleTimeString(),
};

// ==========================================
// ASYNC THUNKS: 1. DOCTOR ROUNDS
// ==========================================

export const fetchDoctorRoundsThunk = createAsyncThunk(
  'operations/fetchDoctorRounds',
  async (params: DoctorRoundsQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await operationsApi.listDoctorRounds(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch doctor rounds');
    }
  }
);

export const createDoctorRoundThunk = createAsyncThunk(
  'operations/createDoctorRound',
  async (payload: DoctorRoundCreatePayload, { rejectWithValue }) => {
    try {
      const res = await operationsApi.recordDoctorRound(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to record doctor round');
    }
  }
);

export const updateDoctorRoundThunk = createAsyncThunk(
  'operations/updateDoctorRound',
  async (
    { roundId, payload }: { roundId: string; payload: DoctorRoundUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await operationsApi.updateDoctorRound(roundId, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update doctor round');
    }
  }
);

export const fetchDoctorRoundDetailThunk = createAsyncThunk(
  'operations/fetchDoctorRoundDetail',
  async (roundId: string, { rejectWithValue }) => {
    try {
      const res = await operationsApi.getDoctorRound(roundId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch doctor round details');
    }
  }
);

// ==========================================
// ASYNC THUNKS: 2. NURSING ACTIONS
// ==========================================

export const fetchNursingActionsThunk = createAsyncThunk(
  'operations/fetchNursingActions',
  async (params: NursingActionsQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await operationsApi.listNursingActions(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch nursing actions');
    }
  }
);

export const createNursingActionThunk = createAsyncThunk(
  'operations/createNursingAction',
  async (payload: NursingActionCreatePayload, { rejectWithValue }) => {
    try {
      const res = await operationsApi.recordNursingAction(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to log bedside nursing action');
    }
  }
);

export const fetchNursingActionDetailThunk = createAsyncThunk(
  'operations/fetchNursingActionDetail',
  async (actionId: string, { rejectWithValue }) => {
    try {
      const res = await operationsApi.getNursingAction(actionId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch nursing action details');
    }
  }
);

// ==========================================
// ASYNC THUNKS: 3. NURSE HANDOVERS
// ==========================================

export const fetchNurseHandoversThunk = createAsyncThunk(
  'operations/fetchNurseHandovers',
  async (params: NurseHandoversQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await operationsApi.listNurseHandovers(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch nurse handovers');
    }
  }
);

export const fetchMyPendingNurseHandoversThunk = createAsyncThunk(
  'operations/fetchMyPendingNurseHandovers',
  async (params: { limit?: number; offset?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await operationsApi.listMyPendingNurseHandovers(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch pending nurse handovers');
    }
  }
);

export const createNurseHandoverThunk = createAsyncThunk(
  'operations/createNurseHandover',
  async (payload: NurseHandoverCreatePayload, { rejectWithValue }) => {
    try {
      const res = await operationsApi.submitNurseHandover(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit bedside nurse handover');
    }
  }
);

export const acknowledgeNurseHandoverThunk = createAsyncThunk(
  'operations/acknowledgeNurseHandover',
  async (
    {
      handoverId,
      payload,
    }: {
      handoverId: string;
      payload?: NurseHandoverAcknowledgePayload;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await operationsApi.acknowledgeNurseHandover(handoverId, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to acknowledge nurse handover');
    }
  }
);

export const fetchNurseHandoverDetailThunk = createAsyncThunk(
  'operations/fetchNurseHandoverDetail',
  async (handoverId: string, { rejectWithValue }) => {
    try {
      const res = await operationsApi.getNurseHandover(handoverId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch nurse handover details');
    }
  }
);

// ==========================================
// ASYNC THUNKS: 4. SHIFT HANDOVERS
// ==========================================

export const fetchShiftHandoversThunk = createAsyncThunk(
  'operations/fetchShiftHandovers',
  async (params: ShiftHandoversQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await operationsApi.listShiftHandovers(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch unit shift handovers');
    }
  }
);

export const fetchMyPendingShiftHandoversThunk = createAsyncThunk(
  'operations/fetchMyPendingShiftHandovers',
  async (params: { limit?: number; offset?: number } | undefined, { rejectWithValue }) => {
    try {
      const res = await operationsApi.listMyPendingShiftHandovers(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch pending shift handovers');
    }
  }
);

export const createShiftHandoverThunk = createAsyncThunk(
  'operations/createShiftHandover',
  async (payload: ShiftHandoverCreatePayload, { rejectWithValue }) => {
    try {
      const res = await operationsApi.submitShiftHandover(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to submit unit shift handover');
    }
  }
);

export const acknowledgeShiftHandoverThunk = createAsyncThunk(
  'operations/acknowledgeShiftHandover',
  async (
    {
      handoverId,
      payload,
    }: {
      handoverId: string;
      payload?: ShiftHandoverAcknowledgePayload;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await operationsApi.acknowledgeShiftHandover(handoverId, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to acknowledge shift handover');
    }
  }
);

export const fetchShiftHandoverDetailThunk = createAsyncThunk(
  'operations/fetchShiftHandoverDetail',
  async (handoverId: string, { rejectWithValue }) => {
    try {
      const res = await operationsApi.getShiftHandover(handoverId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch shift handover details');
    }
  }
);

// ==========================================
// OPERATIONS SLICE
// ==========================================

const operationsSlice = createSlice({
  name: 'operations',
  initialState,
  reducers: {
    setActiveSubTab: (state, action: PayloadAction<OperationsSubTab>) => {
      state.activeSubTab = action.payload;
      state.error = null;
      state.successMessage = null;
    },
    setSelectedAdmissionId: (state, action: PayloadAction<string>) => {
      state.selectedAdmissionId = action.payload;
    },
    setSelectedPatientId: (state, action: PayloadAction<string>) => {
      state.selectedPatientId = action.payload;
    },
    setSelectedIcuId: (state, action: PayloadAction<string>) => {
      state.selectedIcuId = action.payload;
    },
    setSelectedDoctorRound: (state, action: PayloadAction<DoctorRoundResponse | null>) => {
      state.selectedDoctorRound = action.payload;
    },
    setSelectedNursingAction: (state, action: PayloadAction<NursingActionResponse | null>) => {
      state.selectedNursingAction = action.payload;
    },
    setSelectedNurseHandover: (state, action: PayloadAction<NurseHandoverResponse | null>) => {
      state.selectedNurseHandover = action.payload;
    },
    setSelectedShiftHandover: (state, action: PayloadAction<ShiftHandoverResponse | null>) => {
      state.selectedShiftHandover = action.payload;
    },

    // Modal Visibility Toggles
    setIsRecordRoundModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isRecordRoundModalOpen = action.payload;
    },
    setIsUpdateRoundModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isUpdateRoundModalOpen = action.payload;
    },
    setIsRecordNursingActionModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isRecordNursingActionModalOpen = action.payload;
    },
    setIsSubmitNurseHandoverModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSubmitNurseHandoverModalOpen = action.payload;
    },
    setIsAcknowledgeNurseHandoverModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAcknowledgeNurseHandoverModalOpen = action.payload;
    },
    setIsSubmitShiftHandoverModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isSubmitShiftHandoverModalOpen = action.payload;
    },
    setIsAcknowledgeShiftHandoverModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAcknowledgeShiftHandoverModalOpen = action.payload;
    },

    clearOperationAlerts: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Doctor Rounds List
    builder.addCase(fetchDoctorRoundsThunk.pending, (state) => {
      state.isDoctorRoundsLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDoctorRoundsThunk.fulfilled, (state, action) => {
      state.isDoctorRoundsLoading = false;
      state.doctorRounds = action.payload || [];
      state.lastSyncedTime = new Date().toLocaleTimeString();
    });
    builder.addCase(fetchDoctorRoundsThunk.rejected, (state, action) => {
      state.isDoctorRoundsLoading = false;
      state.error = action.payload as string;
    });

    // Record Doctor Round
    builder.addCase(createDoctorRoundThunk.pending, (state) => {
      state.isSubmittingRound = true;
      state.error = null;
    });
    builder.addCase(createDoctorRoundThunk.fulfilled, (state, action) => {
      state.isSubmittingRound = false;
      state.doctorRounds.unshift(action.payload);
      state.successMessage = 'Bedside doctor round recorded successfully.';
      state.isRecordRoundModalOpen = false;
    });
    builder.addCase(createDoctorRoundThunk.rejected, (state, action) => {
      state.isSubmittingRound = false;
      state.error = action.payload as string;
    });

    // Update Doctor Round
    builder.addCase(updateDoctorRoundThunk.pending, (state) => {
      state.isSubmittingRound = true;
      state.error = null;
    });
    builder.addCase(updateDoctorRoundThunk.fulfilled, (state, action) => {
      state.isSubmittingRound = false;
      const idx = state.doctorRounds.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.doctorRounds[idx] = action.payload;
      }
      if (state.selectedDoctorRound?.id === action.payload.id) {
        state.selectedDoctorRound = action.payload;
      }
      state.successMessage = 'Doctor round assessment & plan updated successfully.';
      state.isUpdateRoundModalOpen = false;
    });
    builder.addCase(updateDoctorRoundThunk.rejected, (state, action) => {
      state.isSubmittingRound = false;
      state.error = action.payload as string;
    });

    // 2. Nursing Actions List
    builder.addCase(fetchNursingActionsThunk.pending, (state) => {
      state.isNursingActionsLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNursingActionsThunk.fulfilled, (state, action) => {
      state.isNursingActionsLoading = false;
      state.nursingActions = action.payload || [];
      state.lastSyncedTime = new Date().toLocaleTimeString();
    });
    builder.addCase(fetchNursingActionsThunk.rejected, (state, action) => {
      state.isNursingActionsLoading = false;
      state.error = action.payload as string;
    });

    // Record Nursing Action
    builder.addCase(createNursingActionThunk.pending, (state) => {
      state.isSubmittingNursingAction = true;
      state.error = null;
    });
    builder.addCase(createNursingActionThunk.fulfilled, (state, action) => {
      state.isSubmittingNursingAction = false;
      state.nursingActions.unshift(action.payload);
      state.successMessage = 'Bedside nursing action logged successfully.';
      state.isRecordNursingActionModalOpen = false;
    });
    builder.addCase(createNursingActionThunk.rejected, (state, action) => {
      state.isSubmittingNursingAction = false;
      state.error = action.payload as string;
    });

    // 3. Nurse Handovers List
    builder.addCase(fetchNurseHandoversThunk.pending, (state) => {
      state.isNurseHandoversLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNurseHandoversThunk.fulfilled, (state, action) => {
      state.isNurseHandoversLoading = false;
      state.nurseHandovers = action.payload || [];
      state.lastSyncedTime = new Date().toLocaleTimeString();
    });
    builder.addCase(fetchNurseHandoversThunk.rejected, (state, action) => {
      state.isNurseHandoversLoading = false;
      state.error = action.payload as string;
    });

    // My Pending Nurse Handovers
    builder.addCase(fetchMyPendingNurseHandoversThunk.fulfilled, (state, action) => {
      state.myPendingNurseHandovers = action.payload || [];
    });

    // Submit Nurse Handover
    builder.addCase(createNurseHandoverThunk.pending, (state) => {
      state.isSubmittingNurseHandover = true;
      state.error = null;
    });
    builder.addCase(createNurseHandoverThunk.fulfilled, (state, action) => {
      state.isSubmittingNurseHandover = false;
      state.nurseHandovers.unshift(action.payload);
      state.successMessage = 'Bedside SBAR nurse handover submitted successfully.';
      state.isSubmitNurseHandoverModalOpen = false;
    });
    builder.addCase(createNurseHandoverThunk.rejected, (state, action) => {
      state.isSubmittingNurseHandover = false;
      state.error = action.payload as string;
    });

    // Acknowledge Nurse Handover
    builder.addCase(acknowledgeNurseHandoverThunk.pending, (state) => {
      state.isAcknowledgingNurseHandover = true;
      state.error = null;
    });
    builder.addCase(acknowledgeNurseHandoverThunk.fulfilled, (state, action) => {
      state.isAcknowledgingNurseHandover = false;
      const idx = state.nurseHandovers.findIndex((h) => h.id === action.payload.id);
      if (idx !== -1) {
        state.nurseHandovers[idx] = action.payload;
      }
      state.myPendingNurseHandovers = state.myPendingNurseHandovers.filter(
        (h) => h.id !== action.payload.id
      );
      state.successMessage = 'Nurse handover acknowledged and responsibility transferred.';
      state.isAcknowledgeNurseHandoverModalOpen = false;
    });
    builder.addCase(acknowledgeNurseHandoverThunk.rejected, (state, action) => {
      state.isAcknowledgingNurseHandover = false;
      state.error = action.payload as string;
    });

    // 4. Shift Handovers List
    builder.addCase(fetchShiftHandoversThunk.pending, (state) => {
      state.isShiftHandoversLoading = true;
      state.error = null;
    });
    builder.addCase(fetchShiftHandoversThunk.fulfilled, (state, action) => {
      state.isShiftHandoversLoading = false;
      state.shiftHandovers = action.payload || [];
      state.lastSyncedTime = new Date().toLocaleTimeString();
    });
    builder.addCase(fetchShiftHandoversThunk.rejected, (state, action) => {
      state.isShiftHandoversLoading = false;
      state.error = action.payload as string;
    });

    // My Pending Shift Handovers
    builder.addCase(fetchMyPendingShiftHandoversThunk.fulfilled, (state, action) => {
      state.myPendingShiftHandovers = action.payload || [];
    });

    // Submit Shift Handover
    builder.addCase(createShiftHandoverThunk.pending, (state) => {
      state.isSubmittingShiftHandover = true;
      state.error = null;
    });
    builder.addCase(createShiftHandoverThunk.fulfilled, (state, action) => {
      state.isSubmittingShiftHandover = false;
      state.shiftHandovers.unshift(action.payload);
      state.successMessage = 'Unit shift handover submitted successfully.';
      state.isSubmitShiftHandoverModalOpen = false;
    });
    builder.addCase(createShiftHandoverThunk.rejected, (state, action) => {
      state.isSubmittingShiftHandover = false;
      state.error = action.payload as string;
    });

    // Acknowledge Shift Handover
    builder.addCase(acknowledgeShiftHandoverThunk.pending, (state) => {
      state.isAcknowledgingShiftHandover = true;
      state.error = null;
    });
    builder.addCase(acknowledgeShiftHandoverThunk.fulfilled, (state, action) => {
      state.isAcknowledgingShiftHandover = false;
      const idx = state.shiftHandovers.findIndex((h) => h.id === action.payload.id);
      if (idx !== -1) {
        state.shiftHandovers[idx] = action.payload;
      }
      state.myPendingShiftHandovers = state.myPendingShiftHandovers.filter(
        (h) => h.id !== action.payload.id
      );
      state.successMessage = 'Unit shift handover acknowledged successfully.';
      state.isAcknowledgeShiftHandoverModalOpen = false;
    });
    builder.addCase(acknowledgeShiftHandoverThunk.rejected, (state, action) => {
      state.isAcknowledgingShiftHandover = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setActiveSubTab,
  setSelectedAdmissionId,
  setSelectedPatientId,
  setSelectedIcuId,
  setSelectedDoctorRound,
  setSelectedNursingAction,
  setSelectedNurseHandover,
  setSelectedShiftHandover,
  setIsRecordRoundModalOpen,
  setIsUpdateRoundModalOpen,
  setIsRecordNursingActionModalOpen,
  setIsSubmitNurseHandoverModalOpen,
  setIsAcknowledgeNurseHandoverModalOpen,
  setIsSubmitShiftHandoverModalOpen,
  setIsAcknowledgeShiftHandoverModalOpen,
  clearOperationAlerts,
} = operationsSlice.actions;

export default operationsSlice.reducer;
