import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  meetingApi,
  MeetingResponse,
  MeetingCreatePayload,
  MeetingParticipantCreatePayload,
  MeetingParticipantResponse,
  MeetingRecordingCreatePayload,
  MeetingRecordingResponse,
  MeetingTranscriptCreatePayload,
  MeetingTranscriptResponse,
  MeetingSummaryCreatePayload,
  MeetingSummaryResponse,
  MeetingListQueryParams,
  createFallbackMeetings,
} from '../../api/meetingApi';

export interface MeetingState {
  meetings: MeetingResponse[];
  activeMeeting: MeetingResponse | null;
  activeMeetingId: string | null;
  transcript: MeetingTranscriptResponse | null;
  summary: MeetingSummaryResponse | null;

  isLoading: boolean;
  isStarting: boolean;
  isEnding: boolean;
  isJoining: boolean;
  isLeaving: boolean;
  isSavingSummary: boolean;
  isVerifyingSummary: boolean;
  isCreating: boolean;

  error: string | null;
  successMessage: string | null;

  filterStatus: string;
  filterType: string;
  searchQuery: string;
}

const initialFallback = createFallbackMeetings();

const initialState: MeetingState = {
  meetings: initialFallback,
  activeMeeting: initialFallback[0] || null,
  activeMeetingId: initialFallback[0]?.id || null,
  transcript: null,
  summary: initialFallback[0]?.summary || null,

  isLoading: false,
  isStarting: false,
  isEnding: false,
  isJoining: false,
  isLeaving: false,
  isSavingSummary: false,
  isVerifyingSummary: false,
  isCreating: false,

  error: null,
  successMessage: null,

  filterStatus: 'ALL',
  filterType: 'ALL',
  searchQuery: '',
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchMeetingsThunk = createAsyncThunk(
  'meetings/fetchList',
  async (params: MeetingListQueryParams | undefined, { rejectWithValue }) => {
    try {
      const res = await meetingApi.list(params);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to retrieve clinical meetings.');
    }
  }
);

export const fetchMeetingDetailsThunk = createAsyncThunk(
  'meetings/fetchDetails',
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const res = await meetingApi.getById(meetingId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to retrieve meeting details.');
    }
  }
);

export const createMeetingThunk = createAsyncThunk(
  'meetings/create',
  async (payload: MeetingCreatePayload, { dispatch, rejectWithValue }) => {
    try {
      const res = await meetingApi.create(payload);
      dispatch(fetchMeetingsThunk(undefined));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to schedule Tele-ICU meeting.');
    }
  }
);

export const startMeetingThunk = createAsyncThunk(
  'meetings/start',
  async (meetingId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await meetingApi.start(meetingId);
      dispatch(fetchMeetingsThunk(undefined));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to start meeting session.');
    }
  }
);

export const endMeetingThunk = createAsyncThunk(
  'meetings/end',
  async (meetingId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await meetingApi.end(meetingId);
      dispatch(fetchMeetingsThunk(undefined));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to conclude meeting session.');
    }
  }
);

export const joinMeetingThunk = createAsyncThunk(
  'meetings/join',
  async (meetingId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await meetingApi.join(meetingId);
      dispatch(fetchMeetingDetailsThunk(meetingId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to join meeting session.');
    }
  }
);

export const leaveMeetingThunk = createAsyncThunk(
  'meetings/leave',
  async (meetingId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await meetingApi.leave(meetingId);
      dispatch(fetchMeetingDetailsThunk(meetingId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to leave meeting session.');
    }
  }
);

export const inviteParticipantThunk = createAsyncThunk(
  'meetings/inviteParticipant',
  async (
    { meetingId, payload }: { meetingId: string; payload: MeetingParticipantCreatePayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await meetingApi.addParticipant(meetingId, payload);
      dispatch(fetchMeetingDetailsThunk(meetingId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to invite participant.');
    }
  }
);

export const saveTranscriptThunk = createAsyncThunk(
  'meetings/saveTranscript',
  async (
    { meetingId, payload }: { meetingId: string; payload: MeetingTranscriptCreatePayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await meetingApi.saveTranscript(meetingId, payload);
      dispatch(fetchMeetingDetailsThunk(meetingId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to save speech transcript.');
    }
  }
);

export const fetchTranscriptThunk = createAsyncThunk(
  'meetings/fetchTranscript',
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const res = await meetingApi.getTranscript(meetingId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load speech transcript.');
    }
  }
);

export const saveSummaryThunk = createAsyncThunk(
  'meetings/saveSummary',
  async (
    { meetingId, payload }: { meetingId: string; payload: MeetingSummaryCreatePayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await meetingApi.saveSummary(meetingId, payload);
      dispatch(fetchMeetingDetailsThunk(meetingId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to save clinical AI summary.');
    }
  }
);

export const fetchSummaryThunk = createAsyncThunk(
  'meetings/fetchSummary',
  async (meetingId: string, { rejectWithValue }) => {
    try {
      const res = await meetingApi.getSummary(meetingId);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to load clinical summary.');
    }
  }
);

export const verifySummaryThunk = createAsyncThunk(
  'meetings/verifySummary',
  async (meetingId: string, { dispatch, rejectWithValue }) => {
    try {
      const res = await meetingApi.verifySummary(meetingId);
      dispatch(fetchMeetingDetailsThunk(meetingId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to clinically verify decisions.');
    }
  }
);

export const attachRecordingThunk = createAsyncThunk(
  'meetings/attachRecording',
  async (
    { meetingId, payload }: { meetingId: string; payload: MeetingRecordingCreatePayload },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await meetingApi.attachRecording(meetingId, payload);
      dispatch(fetchMeetingDetailsThunk(meetingId));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to attach encrypted recording.');
    }
  }
);

// ==========================================
// MEETING SLICE
// ==========================================

export const meetingSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    setActiveMeetingId: (state, action: PayloadAction<string>) => {
      state.activeMeetingId = action.payload;
      const found = state.meetings.find((m) => m.id === action.payload);
      if (found) {
        state.activeMeeting = found;
        state.summary = found.summary || null;
        state.transcript = found.transcript || null;
      }
    },
    setActiveMeeting: (state, action: PayloadAction<MeetingResponse | null>) => {
      state.activeMeeting = action.payload;
      state.activeMeetingId = action.payload ? action.payload.id : null;
      if (action.payload) {
        state.summary = action.payload.summary || null;
        state.transcript = action.payload.transcript || null;
      }
    },
    setFilterStatus: (state, action: PayloadAction<string>) => {
      state.filterStatus = action.payload;
    },
    setFilterType: (state, action: PayloadAction<string>) => {
      state.filterType = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearMeetingMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch List
    builder.addCase(fetchMeetingsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchMeetingsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      state.meetings = action.payload;
      if (state.activeMeetingId) {
        const updated = action.payload.find((m) => m.id === state.activeMeetingId);
        if (updated) {
          state.activeMeeting = updated;
          state.summary = updated.summary || null;
          state.transcript = updated.transcript || null;
        }
      } else if (action.payload.length > 0) {
        state.activeMeeting = action.payload[0];
        state.activeMeetingId = action.payload[0].id;
        state.summary = action.payload[0].summary || null;
        state.transcript = action.payload[0].transcript || null;
      }
    });
    builder.addCase(fetchMeetingsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // 2. Fetch Details
    builder.addCase(fetchMeetingDetailsThunk.fulfilled, (state, action) => {
      state.activeMeeting = action.payload;
      state.activeMeetingId = action.payload.id;
      state.summary = action.payload.summary || null;
      state.transcript = action.payload.transcript || null;
      const idx = state.meetings.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) {
        state.meetings[idx] = action.payload;
      } else {
        state.meetings = [action.payload, ...state.meetings];
      }
    });

    // 3. Create Meeting
    builder.addCase(createMeetingThunk.pending, (state) => {
      state.isCreating = true;
      state.error = null;
    });
    builder.addCase(createMeetingThunk.fulfilled, (state, action) => {
      state.isCreating = false;
      state.activeMeeting = action.payload;
      state.activeMeetingId = action.payload.id;
      state.successMessage = `Tele-ICU session "${action.payload.title}" scheduled successfully.`;
    });
    builder.addCase(createMeetingThunk.rejected, (state, action) => {
      state.isCreating = false;
      state.error = action.payload as string;
    });

    // 4. Start Meeting
    builder.addCase(startMeetingThunk.pending, (state) => {
      state.isStarting = true;
      state.error = null;
    });
    builder.addCase(startMeetingThunk.fulfilled, (state, action) => {
      state.isStarting = false;
      state.activeMeeting = action.payload;
      state.successMessage = `Conference "${action.payload.title}" is now LIVE.`;
    });
    builder.addCase(startMeetingThunk.rejected, (state, action) => {
      state.isStarting = false;
      state.error = action.payload as string;
    });

    // 5. End Meeting
    builder.addCase(endMeetingThunk.pending, (state) => {
      state.isEnding = true;
      state.error = null;
    });
    builder.addCase(endMeetingThunk.fulfilled, (state, action) => {
      state.isEnding = false;
      state.activeMeeting = action.payload;
      state.successMessage = `Conference "${action.payload.title}" has concluded.`;
    });
    builder.addCase(endMeetingThunk.rejected, (state, action) => {
      state.isEnding = false;
      state.error = action.payload as string;
    });

    // 6. Join
    builder.addCase(joinMeetingThunk.pending, (state) => {
      state.isJoining = true;
    });
    builder.addCase(joinMeetingThunk.fulfilled, (state) => {
      state.isJoining = false;
      state.successMessage = 'You joined the Tele-ICU conference.';
    });
    builder.addCase(joinMeetingThunk.rejected, (state, action) => {
      state.isJoining = false;
      state.error = action.payload as string;
    });

    // 7. Leave
    builder.addCase(leaveMeetingThunk.pending, (state) => {
      state.isLeaving = true;
    });
    builder.addCase(leaveMeetingThunk.fulfilled, (state) => {
      state.isLeaving = false;
      state.successMessage = 'You left the meeting session.';
    });

    // 8. Transcript
    builder.addCase(fetchTranscriptThunk.fulfilled, (state, action) => {
      state.transcript = action.payload;
    });
    builder.addCase(saveTranscriptThunk.fulfilled, (state, action) => {
      state.transcript = action.payload;
      state.successMessage = 'Speech-to-text transcript updated.';
    });

    // 9. Summary & Verification
    builder.addCase(saveSummaryThunk.pending, (state) => {
      state.isSavingSummary = true;
    });
    builder.addCase(saveSummaryThunk.fulfilled, (state, action) => {
      state.isSavingSummary = false;
      state.summary = action.payload;
      state.successMessage = 'Clinical AI synthesis & care decisions saved.';
    });
    builder.addCase(saveSummaryThunk.rejected, (state, action) => {
      state.isSavingSummary = false;
      state.error = action.payload as string;
    });

    builder.addCase(verifySummaryThunk.pending, (state) => {
      state.isVerifyingSummary = true;
    });
    builder.addCase(verifySummaryThunk.fulfilled, (state, action) => {
      state.isVerifyingSummary = false;
      state.summary = action.payload;
      state.successMessage = 'Clinical decisions verified by attending intensivist.';
    });
    builder.addCase(verifySummaryThunk.rejected, (state, action) => {
      state.isVerifyingSummary = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setActiveMeetingId,
  setActiveMeeting,
  setFilterStatus,
  setFilterType,
  setSearchQuery,
  clearMeetingMessages,
} = meetingSlice.actions;

export default meetingSlice.reducer;
