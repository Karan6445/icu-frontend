import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  notificationApi,
  NotificationResponse,
  NotificationCreatePayload,
  NotificationListQueryParams,
  NotificationDeliveryResponse,
  NotificationDeliveryStatus,
  createFallbackNotifications,
} from '../../api/notificationApi';

export interface NotificationState {
  notifications: NotificationResponse[];
  unreadCount: number;
  activeNotification: NotificationResponse | null;

  isLoading: boolean;
  isDispatching: boolean;
  isMarkingRead: boolean;
  isMarkingAllRead: boolean;
  isUpdatingDelivery: boolean;

  error: string | null;
  successMessage: string | null;

  filterPriority: string;
  filterRead: string;
  filterChannel: string;
  searchQuery: string;
}

const initialFallback = createFallbackNotifications();
const initialUnread = initialFallback.filter((n) => !n.is_read).length;

const initialState: NotificationState = {
  notifications: initialFallback,
  unreadCount: initialUnread,
  activeNotification: initialFallback[0] || null,

  isLoading: false,
  isDispatching: false,
  isMarkingRead: false,
  isMarkingAllRead: false,
  isUpdatingDelivery: false,

  error: null,
  successMessage: null,

  filterPriority: 'ALL',
  filterRead: 'ALL',
  filterChannel: 'ALL',
  searchQuery: '',
};

// ==========================================
// ASYNC THUNKS
// ==========================================

export const fetchNotificationsThunk = createAsyncThunk(
  'notifications/fetchList',
  async (params: NotificationListQueryParams | undefined, { dispatch, rejectWithValue }) => {
    try {
      const res = await notificationApi.list(params);
      const list = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      dispatch(fetchUnreadCountThunk());
      return Array.isArray(list) ? list : [];
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to retrieve notifications.');
    }
  }
);

export const fetchUnreadCountThunk = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await notificationApi.getUnreadCount();
      const raw = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      const count = typeof raw?.unread_count === 'number'
        ? raw.unread_count
        : typeof raw === 'number'
        ? raw
        : 0;
      return count;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to fetch unread badge counter.');
    }
  }
);

export const dispatchNotificationThunk = createAsyncThunk(
  'notifications/dispatch',
  async (payload: NotificationCreatePayload, { dispatch, rejectWithValue }) => {
    try {
      const res = await notificationApi.dispatch(payload);
      const item = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      dispatch(fetchNotificationsThunk(undefined));
      return item;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to dispatch clinical notification.');
    }
  }
);

export const markNotificationReadThunk = createAsyncThunk(
  'notifications/markRead',
  async (notificationId: string, { dispatch }) => {
    try {
      const res = await notificationApi.markAsRead(notificationId);
      const notif = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      dispatch(fetchUnreadCountThunk());
      return notif || { id: notificationId, is_read: true, read_at: new Date().toISOString() };
    } catch (err: any) {
      // Graceful local resolution: never crash on backend 404
      console.warn('[markNotificationReadThunk] Handled locally:', err?.message || err);
      dispatch(fetchUnreadCountThunk());
      return { id: notificationId, is_read: true, read_at: new Date().toISOString() };
    }
  }
);

export const markAllNotificationsReadThunk = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const res = await notificationApi.markAllAsRead();
      dispatch(fetchUnreadCountThunk());
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to mark all as read.');
    }
  }
);

export const updateDeliveryStatusThunk = createAsyncThunk(
  'notifications/updateDeliveryStatus',
  async (
    {
      deliveryId,
      status,
      errorMessage,
    }: {
      deliveryId: string;
      status: NotificationDeliveryStatus;
      errorMessage?: string | null;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const res = await notificationApi.updateDeliveryStatus(deliveryId, status, errorMessage);
      dispatch(fetchNotificationsThunk(undefined));
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || 'Failed to update delivery status.');
    }
  }
);

// ==========================================
// NOTIFICATION SLICE
// ==========================================

export const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setActiveNotification: (state, action: PayloadAction<NotificationResponse | null>) => {
      state.activeNotification = action.payload;
    },
    setFilterPriority: (state, action: PayloadAction<string>) => {
      state.filterPriority = action.payload;
    },
    setFilterRead: (state, action: PayloadAction<string>) => {
      state.filterRead = action.payload;
    },
    setFilterChannel: (state, action: PayloadAction<string>) => {
      state.filterChannel = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearNotificationMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    addNewIncomingNotification: (state, action: PayloadAction<NotificationResponse>) => {
      state.notifications = [action.payload, ...state.notifications];
      if (!action.payload.is_read) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    // 1. Fetch List
    builder.addCase(fetchNotificationsThunk.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
      state.isLoading = false;
      const list = Array.isArray(action.payload)
        ? action.payload
        : (action.payload && Array.isArray((action.payload as any).data)
            ? (action.payload as any).data
            : state.notifications);
      state.notifications = list;
      state.unreadCount = list.filter((n: any) => !n.is_read).length;
      if (!state.activeNotification && list.length > 0) {
        state.activeNotification = list[0];
      }
    });
    builder.addCase(fetchNotificationsThunk.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // 2. Fetch Unread Count
    builder.addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
      if (typeof action.payload === 'number') {
        state.unreadCount = action.payload;
      }
    });

    // 3. Dispatch Notification
    builder.addCase(dispatchNotificationThunk.pending, (state) => {
      state.isDispatching = true;
      state.error = null;
    });
    builder.addCase(dispatchNotificationThunk.fulfilled, (state, action) => {
      state.isDispatching = false;
      state.successMessage = `Prompt "${action.payload?.title || 'Notification'}" dispatched successfully.`;
      // Prepend optimistically
      if (action.payload && action.payload.id) {
        const exists = state.notifications.some((n) => n.id === action.payload.id);
        if (!exists) {
          state.notifications = [action.payload, ...state.notifications];
          if (!action.payload.is_read) {
            state.unreadCount += 1;
          }
        }
      }
    });
    builder.addCase(dispatchNotificationThunk.rejected, (state, action) => {
      state.isDispatching = false;
      state.error = action.payload as string;
    });

    // 4. Mark Read
    builder.addCase(markNotificationReadThunk.pending, (state) => {
      state.isMarkingRead = true;
      state.error = null;
    });
    builder.addCase(markNotificationReadThunk.fulfilled, (state, action) => {
      state.isMarkingRead = false;
      const targetId = action.payload?.id;
      if (targetId) {
        state.notifications = state.notifications.map((n) =>
          n.id === targetId
            ? { ...n, is_read: true, read_at: action.payload.read_at || new Date().toISOString() }
            : n
        );
        state.unreadCount = Math.max(0, state.notifications.filter((n) => !n.is_read).length);
        if (state.activeNotification && state.activeNotification.id === targetId) {
          state.activeNotification.is_read = true;
          state.activeNotification.read_at = action.payload.read_at || new Date().toISOString();
        }
      }
    });
    builder.addCase(markNotificationReadThunk.rejected, (state) => {
      state.isMarkingRead = false;
    });

    // 5. Mark All Read
    builder.addCase(markAllNotificationsReadThunk.pending, (state) => {
      state.isMarkingAllRead = true;
    });
    builder.addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
      state.isMarkingAllRead = false;
      state.notifications = state.notifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: n.read_at || new Date().toISOString(),
      }));
      state.unreadCount = 0;
      state.successMessage = 'All in-app clinical notifications marked as read.';
    });
    builder.addCase(markAllNotificationsReadThunk.rejected, (state, action) => {
      state.isMarkingAllRead = false;
      state.error = action.payload as string;
    });

    // 6. Update Delivery Status
    builder.addCase(updateDeliveryStatusThunk.pending, (state) => {
      state.isUpdatingDelivery = true;
    });
    builder.addCase(updateDeliveryStatusThunk.fulfilled, (state, action) => {
      state.isUpdatingDelivery = false;
      state.successMessage = `Delivery status updated to ${action.payload.delivery_status}.`;
    });
    builder.addCase(updateDeliveryStatusThunk.rejected, (state, action) => {
      state.isUpdatingDelivery = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setActiveNotification,
  setFilterPriority,
  setFilterRead,
  setFilterChannel,
  setSearchQuery,
  clearNotificationMessages,
  addNewIncomingNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;
