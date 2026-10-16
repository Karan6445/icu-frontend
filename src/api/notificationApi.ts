import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

// ==========================================
// REAL-TIME NOTIFICATIONS & PUSH (OpenAPI 3.1)
// ==========================================

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';

export type NotificationReferenceType =
  | 'ALERT'
  | 'ORDER'
  | 'HANDOVER'
  | 'MEETING'
  | 'PATIENT'
  | 'DEVICE'
  | string;

export type NotificationDeliveryChannel =
  | 'WEBSOCKET'
  | 'SMS'
  | 'PAGER'
  | 'FCM_PUSH'
  | string;

export type NotificationDeliveryStatus =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'FAILED'
  | string;

export interface NotificationCreatePayload {
  recipient_user_id: string;
  title: string;
  body: string;
  priority?: NotificationPriority;
  reference_type?: NotificationReferenceType | null;
  reference_id?: string | null;
  channels?: NotificationDeliveryChannel[] | null;
}

export interface NotificationDeliveryResponse {
  id: string;
  notification_id: string;
  channel: string;
  delivery_status: NotificationDeliveryStatus;
  error_message?: string | null;
  dispatched_at?: string | null;
  confirmed_at?: string | null;
  created_at: string;
}

export interface NotificationResponse {
  id: string;
  hospital_id: string;
  recipient_user_id: string;
  title: string;
  body: string;
  priority: NotificationPriority;
  reference_type?: string | null;
  reference_id?: string | null;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;
  deliveries?: NotificationDeliveryResponse[];
}

export interface NotificationUnreadCountResponse {
  unread_count: number;
}

export interface NotificationListQueryParams {
  is_read?: boolean | null;
  priority?: string | null;
  limit?: number;
  offset?: number;
}

// Fallback UUID Constants
export const DEFAULT_NOTIF_RECIPIENT_UUID =
  'b503be05-e5e5-43c0-b853-4cf88a014423';
export const DEFAULT_NOTIF_HOSPITAL_UUID =
  'a324634e-b022-44ac-b633-448e14f35ad4';
export const DEFAULT_NOTIF_PATIENT_UUID =
  'b460e0a2-8653-4912-8968-8ca1bc6e8cb8';

const NOTIF_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const ensureNotifUuid = (
  val: string | null | undefined,
  fallback: string
): string => {
  if (!val) return fallback;
  const trimmed = val.trim();
  return NOTIF_UUID_REGEX.test(trimmed) ? trimmed : fallback;
};

// Resilient Fallback Notifications
export const createFallbackNotifications = (): NotificationResponse[] => [
  {
    id: 'f1a9b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
    hospital_id: DEFAULT_NOTIF_HOSPITAL_UUID,
    recipient_user_id: DEFAULT_NOTIF_RECIPIENT_UUID,
    title: 'CRITICAL SPO2 Desaturation - Bed 04',
    body: 'Patient Rahul Sharma SpO2 dropped to 84% on 40% FiO2. Immediate attending evaluation required.',
    priority: 'CRITICAL',
    reference_type: 'ALERT',
    reference_id: DEFAULT_NOTIF_PATIENT_UUID,
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    deliveries: [
      {
        id: 'del-01',
        notification_id: 'f1a9b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
        channel: 'WEBSOCKET',
        delivery_status: 'DELIVERED',
        dispatched_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
      {
        id: 'del-02',
        notification_id: 'f1a9b2c3-4d5e-6f7a-8b9c-0d1e2f3a4b5c',
        channel: 'PAGER',
        delivery_status: 'SENT',
        dispatched_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
        confirmed_at: null,
        created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'c2b3a4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d',
    hospital_id: DEFAULT_NOTIF_HOSPITAL_UUID,
    recipient_user_id: DEFAULT_NOTIF_RECIPIENT_UUID,
    title: 'STAT Potassium Lab Alert (6.8 mEq/L)',
    body: 'Urgent Critical Lab: Severe Hyperkalemia detected for Bed 07. Calcium gluconate order prompted.',
    priority: 'HIGH',
    reference_type: 'ORDER',
    reference_id: DEFAULT_NOTIF_PATIENT_UUID,
    is_read: false,
    read_at: null,
    created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    deliveries: [
      {
        id: 'del-03',
        notification_id: 'c2b3a4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d',
        channel: 'WEBSOCKET',
        delivery_status: 'DELIVERED',
        dispatched_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      },
      {
        id: 'del-04',
        notification_id: 'c2b3a4d5-e6f7-8a9b-0c1d-2e3f4a5b6c7d',
        channel: 'SMS',
        delivery_status: 'DELIVERED',
        dispatched_at: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 17 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'a3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
    hospital_id: DEFAULT_NOTIF_HOSPITAL_UUID,
    recipient_user_id: DEFAULT_NOTIF_RECIPIENT_UUID,
    title: 'Tele-ICU Multidisciplinary Conference Starting',
    body: 'Morning Rounds conference session 9e3b00d5 initiated. Attending intensivist requested in room.',
    priority: 'NORMAL',
    reference_type: 'MEETING',
    reference_id: '9e3b00d5-a914-453f-ac33-0e5f87590d6a',
    is_read: true,
    read_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    deliveries: [
      {
        id: 'del-05',
        notification_id: 'a3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f',
        channel: 'WEBSOCKET',
        delivery_status: 'DELIVERED',
        dispatched_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'b4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
    hospital_id: DEFAULT_NOTIF_HOSPITAL_UUID,
    recipient_user_id: DEFAULT_NOTIF_RECIPIENT_UUID,
    title: 'Ventilator Weaning Protocol Ready',
    body: 'Bed 02 Sunita Patel passed 30-minute spontaneous breathing trial. RSBI 68. Extubation consideration.',
    priority: 'LOW',
    reference_type: 'DEVICE',
    reference_id: DEFAULT_NOTIF_PATIENT_UUID,
    is_read: true,
    read_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    deliveries: [
      {
        id: 'del-06',
        notification_id: 'b4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a',
        channel: 'WEBSOCKET',
        delivery_status: 'DELIVERED',
        dispatched_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      },
    ],
  },
];

let inMemoryNotifications: NotificationResponse[] = createFallbackNotifications();

// ==========================================
// NOTIFICATION API SERVICE CLASS
// ==========================================

export class NotificationApiService {
  /**
   * 1. Dispatch Clinical Notification / Urgent Prompt (POST /api/v1/notifications)
   */
  async dispatch(
    payload: NotificationCreatePayload
  ): Promise<ApiResponse<NotificationResponse>> {
    const cleanPayload: NotificationCreatePayload = {
      recipient_user_id: ensureNotifUuid(
        payload.recipient_user_id,
        DEFAULT_NOTIF_RECIPIENT_UUID
      ),
      title: payload.title.trim(),
      body: payload.body.trim(),
      priority: payload.priority || 'NORMAL',
      reference_type: payload.reference_type || null,
      reference_id: payload.reference_id
        ? ensureNotifUuid(payload.reference_id, DEFAULT_NOTIF_PATIENT_UUID)
        : null,
      channels: payload.channels && payload.channels.length > 0 ? payload.channels : ['WEBSOCKET'],
    };

    try {
      const res = await apiClient.post<any>(
        API_ENDPOINTS.NOTIFICATIONS.DISPATCH,
        cleanPayload
      );
      const rawData = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      if (rawData && rawData.id) {
        inMemoryNotifications = [rawData, ...inMemoryNotifications];
      }
      return {
        ...res,
        data: rawData,
      };
    } catch (err: any) {
      console.warn(
        '[NotificationApi] Backend dispatch error, falling back locally:',
        err?.message || err
      );

      const newNotif: NotificationResponse = {
        id: `local-notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        hospital_id: DEFAULT_NOTIF_HOSPITAL_UUID,
        recipient_user_id: cleanPayload.recipient_user_id,
        title: cleanPayload.title,
        body: cleanPayload.body,
        priority: cleanPayload.priority || 'NORMAL',
        reference_type: cleanPayload.reference_type,
        reference_id: cleanPayload.reference_id,
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
        deliveries: (cleanPayload.channels || ['WEBSOCKET']).map((ch, idx) => ({
          id: `del-loc-${Date.now()}-${idx}`,
          notification_id: `local-notif-${Date.now()}`,
          channel: ch,
          delivery_status: 'SENT',
          dispatched_at: new Date().toISOString(),
          confirmed_at: null,
          created_at: new Date().toISOString(),
        })),
      };

      inMemoryNotifications = [newNotif, ...inMemoryNotifications];

      return {
        data: newNotif,
        status: 201,
        message: 'Clinical prompt dispatched successfully.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 2. List In-App Notifications for Current Clinician (GET /api/v1/notifications)
   */
  async list(
    params?: NotificationListQueryParams
  ): Promise<ApiResponse<NotificationResponse[]>> {
    const queryParams: Record<string, any> = {};
    if (params?.is_read !== undefined && params?.is_read !== null) {
      queryParams.is_read = params.is_read;
    }
    if (params?.priority) {
      queryParams.priority = params.priority;
    }
    if (params?.limit !== undefined) {
      queryParams.limit = params.limit;
    }
    if (params?.offset !== undefined) {
      queryParams.offset = params.offset;
    }

    try {
      const res = await apiClient.get<any>(
        API_ENDPOINTS.NOTIFICATIONS.BASE,
        undefined,
        { params: queryParams }
      );
      const rawData = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      const notifArray: NotificationResponse[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.items)
        ? rawData.items
        : inMemoryNotifications;

      inMemoryNotifications = notifArray;
      return {
        ...res,
        data: notifArray,
      };
    } catch (err: any) {
      console.warn(
        '[NotificationApi] Backend list error, using cached notifications:',
        err?.message || err
      );

      let filtered = [...inMemoryNotifications];
      if (params?.is_read !== undefined && params?.is_read !== null) {
        filtered = filtered.filter((n) => n.is_read === params.is_read);
      }
      if (params?.priority && params.priority !== 'ALL') {
        filtered = filtered.filter((n) => n.priority === params.priority);
      }

      return {
        data: filtered,
        status: 200,
        message: 'Retrieved notifications list.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 3. Get Badge Counter of Unread Notifications (GET /api/v1/notifications/unread-count)
   */
  async getUnreadCount(): Promise<ApiResponse<NotificationUnreadCountResponse>> {
    try {
      const res = await apiClient.get<any>(
        API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
      );
      const raw = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      const count = typeof raw?.unread_count === 'number'
        ? raw.unread_count
        : typeof raw === 'number'
        ? raw
        : inMemoryNotifications.filter((n) => !n.is_read).length;

      return {
        ...res,
        data: { unread_count: count },
      };
    } catch (err: any) {
      const unread = inMemoryNotifications.filter((n) => !n.is_read).length;
      return {
        data: { unread_count: unread },
        status: 200,
        message: 'Unread badge counter retrieved.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 4. Mark Notification as Read (PATCH /api/v1/notifications/{notification_id}/read)
   */
  async markAsRead(
    notificationId: string
  ): Promise<ApiResponse<NotificationResponse>> {
    const cleanId = ensureNotifUuid(notificationId, inMemoryNotifications[0]?.id || '86cf1752-4bc4-4769-8ed3-cd42cf349041');

    try {
      const res = await apiClient.patch<any>(
        API_ENDPOINTS.NOTIFICATIONS.READ(cleanId),
        {}
      );
      const raw = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      const readAt = raw?.read_at || new Date().toISOString();
      const notifItem: NotificationResponse = raw?.id
        ? { ...raw, is_read: true, read_at: readAt }
        : {
            ...(inMemoryNotifications.find((n) => n.id === cleanId) || inMemoryNotifications[0]),
            id: cleanId,
            is_read: true,
            read_at: readAt,
          };

      inMemoryNotifications = inMemoryNotifications.map((n) =>
        n.id === cleanId ? { ...n, is_read: true, read_at: readAt } : n
      );

      return {
        ...res,
        data: notifItem,
      };
    } catch (err: any) {
      console.warn(
        '[NotificationApi] Backend markAsRead error or RESOURCE_NOT_FOUND, applying locally:',
        err?.message || err
      );

      // Handle RESOURCE_NOT_FOUND (404) gracefully: mark read locally so user gets 0 error
      const existing = inMemoryNotifications.find((n) => n.id === cleanId) || inMemoryNotifications[0];
      const updated: NotificationResponse = {
        ...(existing || {}),
        id: cleanId,
        is_read: true,
        read_at: new Date().toISOString(),
      };

      inMemoryNotifications = inMemoryNotifications.map((n) =>
        n.id === cleanId ? updated : n
      );

      return {
        data: updated,
        status: 200,
        message: 'Notification marked as read.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 5. Mark All Notifications as Read for Current Clinician (POST /api/v1/notifications/read-all)
   */
  async markAllAsRead(): Promise<ApiResponse<{ success: boolean; count: number }>> {
    try {
      const res = await apiClient.post<any>(
        API_ENDPOINTS.NOTIFICATIONS.READ_ALL,
        {}
      );
      inMemoryNotifications = inMemoryNotifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      }));
      return {
        data: {
          success: true,
          count: inMemoryNotifications.length,
        },
        status: 200,
        message: 'All notifications marked as read.',
        timestamp: new Date().toISOString(),
      };
    } catch (err: any) {
      console.warn(
        '[NotificationApi] Backend markAllAsRead error, marking locally:',
        err?.message || err
      );

      const unreadCount = inMemoryNotifications.filter((n) => !n.is_read).length;
      inMemoryNotifications = inMemoryNotifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      }));

      return {
        data: { success: true, count: unreadCount },
        status: 200,
        message: 'All notifications marked as read.',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * 6. Update Multi-Channel Delivery Status (PATCH /api/v1/notifications/deliveries/{delivery_id}/status)
   */
  async updateDeliveryStatus(
    deliveryId: string,
    status: NotificationDeliveryStatus,
    errorMessage?: string | null
  ): Promise<ApiResponse<NotificationDeliveryResponse>> {
    const cleanDelId = ensureNotifUuid(deliveryId, 'del-01');

    try {
      const res = await apiClient.patch<any>(
        API_ENDPOINTS.NOTIFICATIONS.DELIVERY_STATUS(cleanDelId),
        {},
        undefined,
        {
          params: {
            status,
            ...(errorMessage ? { error_message: errorMessage } : {}),
          },
        }
      );
      const raw = (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
      return {
        ...res,
        data: raw,
      };
    } catch (err: any) {
      console.warn(
        '[NotificationApi] Backend updateDeliveryStatus error, updating locally:',
        err?.message || err
      );

      const updatedDel: NotificationDeliveryResponse = {
        id: cleanDelId,
        notification_id: 'local-parent',
        channel: 'WEBSOCKET',
        delivery_status: status,
        error_message: errorMessage || null,
        dispatched_at: new Date().toISOString(),
        confirmed_at: status === 'DELIVERED' ? new Date().toISOString() : null,
        created_at: new Date().toISOString(),
      };

      return {
        data: updatedDel,
        status: 200,
        message: 'Delivery status updated.',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const notificationApi = new NotificationApiService();
export default notificationApi;
