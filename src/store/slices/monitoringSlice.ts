import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  monitoringApi,
  MonitoringRuleResponse,
  MonitoringRuleCreatePayload,
  MonitoringRuleUpdatePayload,
  DeviceTelemetryCreatePayload,
  DeviceTelemetryResponse,
  MonitoringRulesQueryParams,
  LatestTelemetryQueryParams,
  TelemetryMetricType,
  createFallbackMonitoringRules,
  createFallbackTelemetry,
  DEFAULT_MONITORING_ICU_UUID,
  DEFAULT_MONITORING_BED_UUID,
  DEFAULT_MONITORING_PATIENT_UUID,
} from '../../api/monitoringApi';

export interface MonitoringState {
  rules: MonitoringRuleResponse[];
  isLoadingRules: boolean;
  isCreatingRule: boolean;
  isUpdatingRule: boolean;

  // Latest telemetry snapshot mapped by metricType (e.g. 'ECG_LEAD_II', 'PLETH', 'RESP_WAVE')
  latestTelemetryByMetric: Record<string, DeviceTelemetryResponse>;
  isLoadingTelemetry: boolean;
  isIngestingTelemetry: boolean;

  // Active filters and bed context
  selectedBedId: string;
  selectedIcuId: string;
  selectedPatientId: string;
  selectedMetricType: TelemetryMetricType;

  // UI Modals and drawers
  isRuleModalOpen: boolean;
  isTelemetrySimulatorOpen: boolean;
  selectedRuleForEdit: MonitoringRuleResponse | null;

  error: string | null;
  successMessage: string | null;
  lastTelemetryTimestamp: string | null;
}

const initialState: MonitoringState = {
  rules: createFallbackMonitoringRules(),
  isLoadingRules: false,
  isCreatingRule: false,
  isUpdatingRule: false,

  latestTelemetryByMetric: {
    ECG_LEAD_II: createFallbackTelemetry('ECG_LEAD_II', DEFAULT_MONITORING_BED_UUID),
    PLETH: createFallbackTelemetry('PLETH', DEFAULT_MONITORING_BED_UUID),
    RESP_WAVE: createFallbackTelemetry('RESP_WAVE', DEFAULT_MONITORING_BED_UUID),
  },
  isLoadingTelemetry: false,
  isIngestingTelemetry: false,

  selectedBedId: DEFAULT_MONITORING_BED_UUID,
  selectedIcuId: DEFAULT_MONITORING_ICU_UUID,
  selectedPatientId: DEFAULT_MONITORING_PATIENT_UUID,
  selectedMetricType: 'ECG_LEAD_II',

  isRuleModalOpen: false,
  isTelemetrySimulatorOpen: false,
  selectedRuleForEdit: null,

  error: null,
  successMessage: null,
  lastTelemetryTimestamp: new Date().toLocaleTimeString(),
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchMonitoringRulesThunk = createAsyncThunk(
  'monitoring/fetchRules',
  async (params: MonitoringRulesQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await monitoringApi.listRules(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch monitoring rules');
    }
  }
);

export const createMonitoringRuleThunk = createAsyncThunk(
  'monitoring/createRule',
  async (payload: MonitoringRuleCreatePayload, { rejectWithValue }) => {
    try {
      const res = await monitoringApi.createRule(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to create monitoring rule');
    }
  }
);

export const updateMonitoringRuleThunk = createAsyncThunk(
  'monitoring/updateRule',
  async (
    { ruleId, payload }: { ruleId: string; payload: MonitoringRuleUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const res = await monitoringApi.updateRule(ruleId, payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update monitoring rule');
    }
  }
);

export const ingestTelemetryThunk = createAsyncThunk(
  'monitoring/ingestTelemetry',
  async (payload: DeviceTelemetryCreatePayload, { rejectWithValue }) => {
    try {
      const res = await monitoringApi.recordTelemetry(payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to ingest device telemetry');
    }
  }
);

export const fetchLatestTelemetryThunk = createAsyncThunk(
  'monitoring/fetchLatestTelemetry',
  async (params: LatestTelemetryQueryParams, { rejectWithValue }) => {
    try {
      const res = await monitoringApi.getLatestTelemetry(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch latest telemetry');
    }
  }
);

// ==========================================
// MONITORING SLICE
// ==========================================

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    setSelectedBedId: (state, action: PayloadAction<string>) => {
      state.selectedBedId = action.payload;
    },
    setSelectedIcuId: (state, action: PayloadAction<string>) => {
      state.selectedIcuId = action.payload;
    },
    setSelectedPatientId: (state, action: PayloadAction<string>) => {
      state.selectedPatientId = action.payload;
    },
    setSelectedMetricType: (state, action: PayloadAction<TelemetryMetricType>) => {
      state.selectedMetricType = action.payload;
    },
    setIsRuleModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isRuleModalOpen = action.payload;
    },
    setIsTelemetrySimulatorOpen: (state, action: PayloadAction<boolean>) => {
      state.isTelemetrySimulatorOpen = action.payload;
    },
    setSelectedRuleForEdit: (state, action: PayloadAction<MonitoringRuleResponse | null>) => {
      state.selectedRuleForEdit = action.payload;
    },
    clearMonitoringAlerts: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch Rules
    builder.addCase(fetchMonitoringRulesThunk.pending, (state) => {
      state.isLoadingRules = true;
      state.error = null;
    });
    builder.addCase(fetchMonitoringRulesThunk.fulfilled, (state, action) => {
      state.isLoadingRules = false;
      if (action.payload && action.payload.length > 0) {
        state.rules = action.payload;
      }
    });
    builder.addCase(fetchMonitoringRulesThunk.rejected, (state, action) => {
      state.isLoadingRules = false;
      state.error = action.payload as string;
    });

    // 2. Create Rule
    builder.addCase(createMonitoringRuleThunk.pending, (state) => {
      state.isCreatingRule = true;
      state.error = null;
    });
    builder.addCase(createMonitoringRuleThunk.fulfilled, (state, action) => {
      state.isCreatingRule = false;
      state.rules.unshift(action.payload);
      state.successMessage = `Monitoring rule for ${action.payload.parameter_name} created successfully.`;
      state.isRuleModalOpen = false;
    });
    builder.addCase(createMonitoringRuleThunk.rejected, (state, action) => {
      state.isCreatingRule = false;
      state.error = action.payload as string;
    });

    // 3. Update Rule
    builder.addCase(updateMonitoringRuleThunk.pending, (state) => {
      state.isUpdatingRule = true;
      state.error = null;
    });
    builder.addCase(updateMonitoringRuleThunk.fulfilled, (state, action) => {
      state.isUpdatingRule = false;
      const idx = state.rules.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) {
        state.rules[idx] = action.payload;
      }
      state.successMessage = `Alarm rule limits updated successfully.`;
      state.isRuleModalOpen = false;
      state.selectedRuleForEdit = null;
    });
    builder.addCase(updateMonitoringRuleThunk.rejected, (state, action) => {
      state.isUpdatingRule = false;
      state.error = action.payload as string;
    });

    // 4. Ingest Telemetry
    builder.addCase(ingestTelemetryThunk.pending, (state) => {
      state.isIngestingTelemetry = true;
      state.error = null;
    });
    builder.addCase(ingestTelemetryThunk.fulfilled, (state, action) => {
      state.isIngestingTelemetry = false;
      state.latestTelemetryByMetric[action.payload.metric_type] = action.payload;
      state.lastTelemetryTimestamp = new Date().toLocaleTimeString();
      state.successMessage = `Live telemetry packet ingested (${action.payload.metric_type}).`;
      state.isTelemetrySimulatorOpen = false;
    });
    builder.addCase(ingestTelemetryThunk.rejected, (state, action) => {
      state.isIngestingTelemetry = false;
      state.error = action.payload as string;
    });

    // 5. Fetch Latest Telemetry
    builder.addCase(fetchLatestTelemetryThunk.pending, (state) => {
      state.isLoadingTelemetry = true;
    });
    builder.addCase(fetchLatestTelemetryThunk.fulfilled, (state, action) => {
      state.isLoadingTelemetry = false;
      if (action.payload) {
        state.latestTelemetryByMetric[action.payload.metric_type] = action.payload;
        state.lastTelemetryTimestamp = new Date(action.payload.recorded_at).toLocaleTimeString();
      }
    });
    builder.addCase(fetchLatestTelemetryThunk.rejected, (state, action) => {
      state.isLoadingTelemetry = false;
      // Keep existing telemetry on error for smooth charts
    });
  },
});

export const {
  setSelectedBedId,
  setSelectedIcuId,
  setSelectedPatientId,
  setSelectedMetricType,
  setIsRuleModalOpen,
  setIsTelemetrySimulatorOpen,
  setSelectedRuleForEdit,
  clearMonitoringAlerts,
} = monitoringSlice.actions;

export default monitoringSlice.reducer;
