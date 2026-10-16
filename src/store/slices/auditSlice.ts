import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  auditApi,
  AuditBusinessLogItem,
  AuditAccessLogItem,
  AuditLogsQueryParams,
  AccessLogsQueryParams,
  FALLBACK_BUSINESS_LOGS,
  FALLBACK_ACCESS_LOGS,
} from '../../api/auditApi';

export type AuditTabType = 'BUSINESS_LOGS' | 'ACCESS_LOGS';

export interface AuditState {
  activeTab: AuditTabType;

  // 1. Business Audit Logs State (/api/v1/audit/logs)
  businessLogs: AuditBusinessLogItem[];
  businessTotal: number;
  businessPage: number;
  businessPageSize: number;
  businessFilters: {
    entity_name: string;
    entity_id: string;
    user_id: string;
    action: string;
    start_time: string;
    end_time: string;
    search: string;
  };

  // 2. Security Access Logs State (/api/v1/audit/access-logs)
  accessLogs: AuditAccessLogItem[];
  accessTotal: number;
  accessPage: number;
  accessPageSize: number;
  accessFilters: {
    patient_id: string;
    user_id: string;
    action: string;
    is_sensitive: 'ALL' | 'TRUE' | 'FALSE';
    start_time: string;
    end_time: string;
    search: string;
  };

  // Selected for Modal Inspection
  selectedBusinessLog: AuditBusinessLogItem | null;
  selectedAccessLog: AuditAccessLogItem | null;

  // Status & Telemetry
  isLoading: boolean;
  error: string | null;
  lastSyncedTime: string | null;
  lastSyncedUrl: string | null;
}

const initialState: AuditState = {
  activeTab: 'BUSINESS_LOGS',

  businessLogs: FALLBACK_BUSINESS_LOGS,
  businessTotal: FALLBACK_BUSINESS_LOGS.length,
  businessPage: 1,
  businessPageSize: 50,
  businessFilters: {
    entity_name: '',
    entity_id: '',
    user_id: '',
    action: 'ALL',
    start_time: '',
    end_time: '',
    search: '',
  },

  accessLogs: FALLBACK_ACCESS_LOGS,
  accessTotal: FALLBACK_ACCESS_LOGS.length,
  accessPage: 1,
  accessPageSize: 50,
  accessFilters: {
    patient_id: '',
    user_id: '',
    action: 'ALL',
    is_sensitive: 'ALL',
    start_time: '',
    end_time: '',
    search: '',
  },

  selectedBusinessLog: null,
  selectedAccessLog: null,

  isLoading: false,
  error: null,
  lastSyncedTime: null,
  lastSyncedUrl: null,
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchBusinessAuditLogsThunk = createAsyncThunk(
  'audit/fetchBusinessLogs',
  async (params: AuditLogsQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await auditApi.queryBusinessLogs(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch business audit logs');
    }
  }
);

export const fetchAccessAuditLogsThunk = createAsyncThunk(
  'audit/fetchAccessLogs',
  async (params: AccessLogsQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await auditApi.queryAccessLogs(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch security access logs');
    }
  }
);

// ==========================================
// REDUX SLICE
// ==========================================

export const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<AuditTabType>) => {
      state.activeTab = action.payload;
    },
    setBusinessPage: (state, action: PayloadAction<number>) => {
      state.businessPage = action.payload;
    },
    setBusinessPageSize: (state, action: PayloadAction<number>) => {
      state.businessPageSize = action.payload;
    },
    setBusinessFilters: (
      state,
      action: PayloadAction<Partial<AuditState['businessFilters']>>
    ) => {
      state.businessFilters = { ...state.businessFilters, ...action.payload };
      state.businessPage = 1;
    },
    resetBusinessFilters: (state) => {
      state.businessFilters = initialState.businessFilters;
      state.businessPage = 1;
    },

    setAccessPage: (state, action: PayloadAction<number>) => {
      state.accessPage = action.payload;
    },
    setAccessPageSize: (state, action: PayloadAction<number>) => {
      state.accessPageSize = action.payload;
    },
    setAccessFilters: (
      state,
      action: PayloadAction<Partial<AuditState['accessFilters']>>
    ) => {
      state.accessFilters = { ...state.accessFilters, ...action.payload };
      state.accessPage = 1;
    },
    resetAccessFilters: (state) => {
      state.accessFilters = initialState.accessFilters;
      state.accessPage = 1;
    },

    setSelectedBusinessLog: (state, action: PayloadAction<AuditBusinessLogItem | null>) => {
      state.selectedBusinessLog = action.payload;
    },
    setSelectedAccessLog: (state, action: PayloadAction<AuditAccessLogItem | null>) => {
      state.selectedAccessLog = action.payload;
    },
    clearAuditMessages: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Business Audit Logs
    builder
      .addCase(fetchBusinessAuditLogsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusinessAuditLogsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessLogs = action.payload.items;
        state.businessTotal = action.payload.total;
        state.businessPage = action.payload.page || state.businessPage;
        state.businessPageSize = action.payload.page_size || state.businessPageSize;
        state.lastSyncedUrl = 'http://10.208.2.18:8000/api/v1/audit/logs';
        state.lastSyncedTime = new Date().toLocaleTimeString();
      })
      .addCase(fetchBusinessAuditLogsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // 2. Access Audit Logs
    builder
      .addCase(fetchAccessAuditLogsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccessAuditLogsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessLogs = action.payload.items;
        state.accessTotal = action.payload.total;
        state.accessPage = action.payload.page || state.accessPage;
        state.accessPageSize = action.payload.page_size || state.accessPageSize;
        state.lastSyncedUrl = 'http://10.208.2.18:8000/api/v1/audit/access-logs';
        state.lastSyncedTime = new Date().toLocaleTimeString();
      })
      .addCase(fetchAccessAuditLogsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setActiveTab,
  setBusinessPage,
  setBusinessPageSize,
  setBusinessFilters,
  resetBusinessFilters,
  setAccessPage,
  setAccessPageSize,
  setAccessFilters,
  resetAccessFilters,
  setSelectedBusinessLog,
  setSelectedAccessLog,
  clearAuditMessages,
} = auditSlice.actions;

export default auditSlice.reducer;
