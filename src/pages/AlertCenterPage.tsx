import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  AlertOctagon, 
  Clock, 
  Filter, 
  Check, 
  Search, 
  LayoutGrid, 
  Table as TableIcon,
  AlertTriangle, 
  Info, 
  ExternalLink, 
  ChevronRight, 
  Sparkles, 
  Activity, 
  X,
  Plus,
  RefreshCw,
  Send,
  Radio,
  Smartphone,
  CheckCheck,
  RotateCcw,
  Sliders,
  Copy,
  Layers,
  MessageSquare,
  ShieldCheck,
  Disc,
  Users
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchNotificationsThunk,
  fetchUnreadCountThunk,
  dispatchNotificationThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
  updateDeliveryStatusThunk,
  clearNotificationMessages,
} from '../store/slices/notificationSlice';
import {
  NotificationResponse,
  NotificationPriority,
  NotificationReferenceType,
  NotificationDeliveryChannel,
  NotificationDeliveryStatus,
  DEFAULT_NOTIF_RECIPIENT_UUID,
  DEFAULT_NOTIF_PATIENT_UUID,
} from '../api/notificationApi';
import { AlertService } from '../services/alertService';
import { AlertItem, AlertSeverity } from '../types/icu';

export const AlertCenterPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Top Tab Switcher: 'realtime' (Real-Time Push & Prompts) vs 'telemetry' (Bedside Telemetry Alarms)
  const [activeTab, setActiveTab] = useState<'realtime' | 'telemetry'>(() => {
    return searchParams.get('tab') === 'telemetry' ? 'telemetry' : 'realtime';
  });

  // Redux Notification State
  const {
    notifications,
    unreadCount,
    isLoading,
    isDispatching,
    isMarkingRead,
    isMarkingAllRead,
    isUpdatingDelivery,
    error,
    successMessage,
  } = useAppSelector((state) => state.notifications);

  // Local Filter & Search State for Real-Time Notifications
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterReadStatus, setFilterReadStatus] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [filterChannel, setFilterChannel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dispatch Notification Modal Form State (POST /api/v1/notifications)
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [dispatchRecipientId, setDispatchRecipientId] = useState<string>(DEFAULT_NOTIF_RECIPIENT_UUID);
  const [dispatchTitle, setDispatchTitle] = useState<string>('STAT Potassium Alert (6.8 mEq/L)');
  const [dispatchBody, setDispatchBody] = useState<string>(
    'Urgent Critical Lab: Severe Hyperkalemia detected for Bed 07. Immediate IV calcium gluconate order prompted.'
  );
  const [dispatchPriority, setDispatchPriority] = useState<NotificationPriority>('HIGH');
  const [dispatchRefType, setDispatchRefType] = useState<NotificationReferenceType>('ORDER');
  const [dispatchRefId, setDispatchRefId] = useState<string>(DEFAULT_NOTIF_PATIENT_UUID);
  const [dispatchChannels, setDispatchChannels] = useState<NotificationDeliveryChannel[]>([
    'WEBSOCKET',
    'SMS',
  ]);

  // Worker Delivery Callback Modal State (PATCH /api/v1/notifications/deliveries/{id}/status)
  const [selectedDeliveryToUpdate, setSelectedDeliveryToUpdate] = useState<{
    deliveryId: string;
    notificationTitle: string;
    channel: string;
    currentStatus: string;
  } | null>(null);
  const [updateDeliveryStatusVal, setUpdateDeliveryStatusVal] = useState<NotificationDeliveryStatus>('DELIVERED');
  const [updateDeliveryErrorMsg, setUpdateDeliveryErrorMsg] = useState<string>('');

  // Initial Fetch for Notifications
  useEffect(() => {
    dispatch(fetchNotificationsThunk(undefined));
  }, [dispatch]);

  // Synchronize Tab with URL query
  const handleTabChange = (tab: 'realtime' | 'telemetry') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPI Metrics Calculation for Real-Time Notifications
  const totalNotifications = notifications.length;
  const criticalCount = useMemo(() => {
    return notifications.filter((n) => n.priority === 'CRITICAL').length;
  }, [notifications]);

  const allDeliveries = useMemo(() => {
    return notifications.flatMap((n) => n.deliveries || []);
  }, [notifications]);

  const deliveredCount = useMemo(() => {
    return allDeliveries.filter((d) => d.delivery_status === 'DELIVERED').length;
  }, [allDeliveries]);

  const deliverySuccessRate =
    allDeliveries.length > 0 ? Math.round((deliveredCount / allDeliveries.length) * 100) : 100;

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // Read filter
      if (filterReadStatus === 'UNREAD' && notif.is_read) return false;
      if (filterReadStatus === 'READ' && !notif.is_read) return false;

      // Priority filter
      if (filterPriority !== 'ALL' && notif.priority !== filterPriority) return false;

      // Channel filter
      if (filterChannel !== 'ALL') {
        const hasChannel = (notif.deliveries || []).some(
          (d) => d.channel.toUpperCase() === filterChannel.toUpperCase()
        );
        if (!hasChannel) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = notif.title.toLowerCase().includes(q);
        const matchBody = notif.body.toLowerCase().includes(q);
        const matchRefType = (notif.reference_type || '').toLowerCase().includes(q);
        const matchId = notif.id.toLowerCase().includes(q);
        const matchRecipient = notif.recipient_user_id.toLowerCase().includes(q);
        if (!matchTitle && !matchBody && !matchRefType && !matchId && !matchRecipient) {
          return false;
        }
      }

      return true;
    });
  }, [notifications, filterReadStatus, filterPriority, filterChannel, searchQuery]);

  // Handle Dispatch Notification Form Submit (POST /api/v1/notifications)
  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      dispatchNotificationThunk({
        recipient_user_id: dispatchRecipientId.trim(),
        title: dispatchTitle.trim(),
        body: dispatchBody.trim(),
        priority: dispatchPriority,
        reference_type: dispatchRefType,
        reference_id: dispatchRefId.trim() || null,
        channels: dispatchChannels.length > 0 ? dispatchChannels : ['WEBSOCKET'],
      })
    );
    setIsDispatchModalOpen(false);
  };

  // Handle Mark All Read (POST /api/v1/notifications/read-all)
  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsReadThunk());
  };

  // Handle 1-Click Mark Single Read (PATCH /api/v1/notifications/{id}/read)
  const handleMarkSingleRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    dispatch(markNotificationReadThunk(id));
  };

  // Handle Worker Delivery Status Update (PATCH /api/v1/notifications/deliveries/{id}/status)
  const handleUpdateDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryToUpdate) return;
    await dispatch(
      updateDeliveryStatusThunk({
        deliveryId: selectedDeliveryToUpdate.deliveryId,
        status: updateDeliveryStatusVal,
        errorMessage: updateDeliveryErrorMsg.trim() || null,
      })
    );
    setSelectedDeliveryToUpdate(null);
    setUpdateDeliveryErrorMsg('');
  };

  // Toggle Delivery Channel in Modal Form
  const toggleDispatchChannel = (channel: NotificationDeliveryChannel) => {
    setDispatchChannels((prev) =>
      prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]
    );
  };

  // Priority Badge Helper
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-rose-400" />
            CRITICAL STAT
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            HIGH
          </span>
        );
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            NORMAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            LOW
          </span>
        );
    }
  };

  // Delivery Channel Icon & Badge Helper
  const renderChannelChip = (del: any) => {
    const isDelivered = del.delivery_status === 'DELIVERED';
    const isFailed = del.delivery_status === 'FAILED';

    return (
      <button
        key={del.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedDeliveryToUpdate({
            deliveryId: del.id,
            notificationTitle: 'Notification Delivery',
            channel: del.channel,
            currentStatus: del.delivery_status,
          });
          setUpdateDeliveryStatusVal(del.delivery_status as any);
        }}
        title={`Channel: ${del.channel} | Status: ${del.delivery_status} (Click to invoke worker callback)`}
        className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
          isDelivered
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500'
            : isFailed
            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 hover:border-rose-500'
            : 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 hover:border-teal-500'
        }`}
      >
        {del.channel === 'WEBSOCKET' && <Radio className="w-2.5 h-2.5 text-teal-600 dark:text-teal-400" />}
        {del.channel === 'SMS' && <Smartphone className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />}
        {del.channel === 'PAGER' && <Activity className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />}
        {del.channel === 'FCM_PUSH' && <Send className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />}
        <span>{del.channel}</span>
        <span className="text-[9px] opacity-75">({del.delivery_status})</span>
      </button>
    );
  };

  // ==========================================
  // TAB 2 STATE: BEDSIDE TELEMETRY ALARMS
  // ==========================================
  const [alertsList, setAlertsList] = useState<AlertItem[]>(() => AlertService.getAllAlerts());
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [filterTelemetryStatus, setFilterTelemetryStatus] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED'>('ALL');
  const [telemetrySearchQuery, setTelemetrySearchQuery] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [selectedAlertForAck, setSelectedAlertForAck] = useState<AlertItem | null>(null);
  const [ackNoteText, setAckNoteText] = useState('');

  const handleAcknowledgeSubmit = (alertId: string) => {
    AlertService.acknowledgeAlert(
      alertId,
      'RN-88042',
      'Priya Singh (RN)',
      'RN',
      ackNoteText || 'Acknowledged and bedside review initiated.'
    );
    setAlertsList([...AlertService.getAllAlerts()]);
    setSelectedAlertForAck(null);
    setAckNoteText('');
  };

  const filteredTelemetryAlerts = alertsList.filter((alert) => {
    if (filterSeverity !== 'ALL' && alert.severity !== filterSeverity) return false;
    if (filterTelemetryStatus !== 'ALL' && alert.status !== filterTelemetryStatus) return false;
    if (telemetrySearchQuery.trim()) {
      const q = telemetrySearchQuery.toLowerCase();
      const matchName = alert.patientName.toLowerCase().includes(q);
      const matchBed = alert.bedNumber.toLowerCase().includes(q);
      const matchMsg = alert.message.toLowerCase().includes(q);
      if (!matchName && !matchBed && !matchMsg) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12 text-slate-900 dark:text-slate-100 font-sans">
      
      {/* ==========================================
          TOP LEVEL TAB SWITCHER: REAL-TIME NOTIFICATIONS VS TELEMETRY
         ========================================== */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-2 sm:p-2.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => handleTabChange('realtime')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'realtime'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Bell className="w-4 h-4 text-teal-300" />
            <span>Real-Time Notifications & Push</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono animate-pulse">
                {unreadCount}
              </span>
            )}
            <span className="text-[10px] font-mono bg-black/15 dark:bg-white/20 text-white px-1.5 py-0.2 rounded">
              OpenAPI 3.1
            </span>
          </button>

          <button
            onClick={() => handleTabChange('telemetry')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'telemetry'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Activity className="w-4 h-4 text-teal-300" />
            <span>Bedside Telemetry & Monitor Alarms</span>
            <span className="text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-1.5 py-0.2 rounded font-bold">
              {alertsList.filter((a) => a.status === 'ACTIVE').length} Active
            </span>
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 px-3 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>Backend:</span>
          <span className="text-teal-700 dark:text-teal-400 font-bold truncate max-w-xs">http://10.115.196.18:8000</span>
        </div>
      </div>

      {/* Global Alerts from Slice */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => dispatch(clearNotificationMessages())}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button
            onClick={() => dispatch(clearNotificationMessages())}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          VIEW 1: REAL-TIME NOTIFICATIONS & PUSH (6 BACKEND OPENAPI ENDPOINTS)
         ========================================================================= */}
      {activeTab === 'realtime' && (
        <div className="space-y-6">
          
          {/* Top Header Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-400 shadow-xs">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Clinical Notifications & Multi-Channel Push
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-500/30">
                    Live Dispatcher
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Multi-channel urgent notifications (WebSocket, SMS, Hospital Pager, FCM Push), read receipts, and worker delivery callbacks
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => dispatch(fetchNotificationsThunk(undefined))}
                disabled={isLoading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                title="Refresh notifications"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleMarkAllRead}
                disabled={isMarkingAllRead || unreadCount === 0}
                className="px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700 border border-teal-300 dark:border-slate-700 text-xs font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>

              <button
                onClick={() => setIsDispatchModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Dispatch Clinical Prompt</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Unread */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Unread Clinical Prompts</span>
                <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <Bell className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-2 mt-1">
                <span>{unreadCount}</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider animate-pulse">
                    Requires Review
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Badge counter sync with GET /unread-count</p>
            </div>

            {/* KPI 2: Critical */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Critical Priority Alerts</span>
                <div className="w-9 h-9 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono tracking-tight mt-1">
                {criticalCount}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">STAT priority clinical escalations</p>
            </div>

            {/* KPI 3: Multi-channel Dispatches */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Multi-Channel Dispatches</span>
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight mt-1">
                {allDeliveries.length}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">WebSocket, SMS, Hospital Pager, FCM</p>
            </div>

            {/* KPI 4: Delivery Confirmation Rate */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-1 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Delivery Confirmation Rate</span>
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <CheckCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight flex items-baseline gap-1.5 mt-1">
                <span>{deliverySuccessRate}%</span>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">({deliveredCount}/{allDeliveries.length || 1})</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Confirmed via worker status callbacks</p>
            </div>
          </div>

          {/* Toolbar & Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              {[
                { id: 'ALL', label: 'All Notifications', count: notifications.length },
                { id: 'UNREAD', label: 'Unread', count: unreadCount },
                { id: 'READ', label: 'Acknowledged', count: notifications.length - unreadCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterReadStatus(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterReadStatus === tab.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    filterReadStatus === tab.id ? 'bg-black/20 dark:bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Filter by Priority, Channel, and Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Priority Select */}
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Priorities</option>
                <option value="CRITICAL">Critical STAT</option>
                <option value="HIGH">High Urgency</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Low</option>
              </select>

              {/* Channel Select */}
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-xs"
              >
                <option value="ALL">All Channels</option>
                <option value="WEBSOCKET">WebSocket Push</option>
                <option value="SMS">SMS Message</option>
                <option value="PAGER">Hospital Pager</option>
                <option value="FCM_PUSH">FCM Mobile Push</option>
              </select>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title, prompt, UUID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-8 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg cursor-pointer transition-all ${
                    viewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-xs font-bold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Notifications Table View */}
          {viewMode === 'table' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] font-mono">
                      <th className="py-3.5 px-4">Priority / Status</th>
                      <th className="py-3.5 px-4">Notification Prompt</th>
                      <th className="py-3.5 px-4">Clinical Context</th>
                      <th className="py-3.5 px-4">Multi-Channel Deliveries</th>
                      <th className="py-3.5 px-4">Dispatched At</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {filteredNotifications.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-400">
                          <Bell className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No clinical notifications found</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Dispatch a new urgent prompt or adjust filter parameters
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredNotifications.map((n) => (
                        <tr
                          key={n.id}
                          className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group ${
                            !n.is_read ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                          }`}
                        >
                          {/* Priority & Read Status */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                {!n.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 shrink-0" title="Unread" />
                                )}
                                {getPriorityBadge(n.priority)}
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">
                                {n.is_read ? 'Read' : 'Unread'}
                              </span>
                            </div>
                          </td>

                          {/* Title & Body */}
                          <td className="py-3.5 px-4 max-w-md">
                            <div className="space-y-1">
                              <span className="font-bold text-slate-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors block">
                                {n.title}
                              </span>
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {n.body}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                <span>ID: {n.id.slice(0, 8)}...</span>
                                <button
                                  onClick={() => handleCopy(n.id)}
                                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                                  title="Copy UUID"
                                >
                                  {copiedId === n.id ? (
                                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                                <span>•</span>
                                <span>Recipient: {n.recipient_user_id.slice(0, 8)}...</span>
                              </div>
                            </div>
                          </td>

                          {/* Reference Context */}
                          <td className="py-3.5 px-4">
                            {n.reference_type ? (
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-slate-200 dark:border-slate-700 font-mono">
                                  {n.reference_type}
                                </span>
                                {n.reference_id && (
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate max-w-[120px]">
                                    Ref: {n.reference_id.slice(0, 8)}...
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">General Broadcast</span>
                            )}
                          </td>

                          {/* Deliveries Chips */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {(n.deliveries || []).length === 0 ? (
                                <span className="text-slate-400 text-[11px]">No Worker Deliveries</span>
                              ) : (
                                (n.deliveries || []).map((del) => renderChannelChip(del))
                              )}
                            </div>
                          </td>

                          {/* Time */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px] font-mono">
                              <div className="font-semibold">
                                {new Date(n.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </div>
                              <span className="text-[10px] text-slate-500">
                                {new Date(n.created_at).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!n.is_read ? (
                                <button
                                  onClick={(e) => handleMarkSingleRead(n.id, e)}
                                  disabled={isMarkingRead}
                                  className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                  title="Mark as Read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Mark Read</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono font-bold">
                                  <CheckCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                  Read
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 space-y-3 shadow-xs hover:shadow-md transition-all ${
                    !n.is_read ? 'border-teal-400/60 dark:border-teal-500/40 bg-teal-50/20 dark:bg-teal-950/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400" />}
                      {getPriorityBadge(n.priority)}
                    </div>
                    {n.reference_type && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-mono border border-slate-200 dark:border-slate-700">
                        {n.reference_type}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{n.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                      {n.body}
                    </p>
                  </div>

                  {/* Delivery Channels */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                    {(n.deliveries || []).map((del) => renderChannelChip(del))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {!n.is_read ? (
                      <button
                        onClick={(e) => handleMarkSingleRead(n.id, e)}
                        className="text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-sans font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Read</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1 font-bold">
                        <CheckCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                        Acknowledged
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          VIEW 2: BEDSIDE TELEMETRY ALARMS CONSOLE (PRESERVED)
         ========================================================================= */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Top Banner Header */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 flex items-center justify-center shadow-xs">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  Bedside Telemetry & Monitor Alarms Console
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time physiological alarm priority routing, acknowledgment workflow, and severity color coding
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                  isAudioMuted
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                }`}
              >
                {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isAudioMuted ? 'AUDIBLE ALARM MUTED' : 'AUDIBLE ALARM ACTIVE'}</span>
              </button>
            </div>
          </div>

          {/* Telemetry Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setFilterSeverity('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  filterSeverity === 'ALL' ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                All Severities ({alertsList.length})
              </button>
              <button
                onClick={() => setFilterSeverity('CRITICAL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  filterSeverity === 'CRITICAL' ? 'bg-rose-600 text-white shadow-xs' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                }`}
              >
                Critical ({alertsList.filter((a) => a.severity === 'CRITICAL').length})
              </button>
              <button
                onClick={() => setFilterSeverity('HIGH')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  filterSeverity === 'HIGH' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                }`}
              >
                High ({alertsList.filter((a) => a.severity === 'HIGH').length})
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterTelemetryStatus}
                onChange={(e) => setFilterTelemetryStatus(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Alarms</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Bed / Patient..."
                  value={telemetrySearchQuery}
                  onChange={(e) => setTelemetrySearchQuery(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Telemetry Alarms Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] font-mono">
                  <th className="py-3.5 px-4">Bed & Patient</th>
                  <th className="py-3.5 px-4">Alarm Message</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Detected At</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredTelemetryAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">Bed {alert.bedNumber}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{alert.patientName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-200 font-medium">{alert.message}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        alert.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {alert.status === 'ACTIVE' ? (
                        <button
                          onClick={() => setSelectedAlertForAck(alert)}
                          className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          Acknowledge
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px] flex items-center justify-end gap-1 font-mono font-bold">
                          <CheckCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          Acked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: DISPATCH CLINICAL NOTIFICATION / PROMPT (POST /api/v1/notifications)
         ========================================================================= */}
      {isDispatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-up text-slate-900 dark:text-slate-100 font-sans">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-300">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Dispatch Clinical Notification</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Multi-Channel Urgent Prompt (OpenAPI 3.1)</p>
                </div>
              </div>
              <button
                onClick={() => setIsDispatchModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="p-5 space-y-4 text-xs">
              {/* Recipient User UUID */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Recipient Clinician User UUID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dispatchRecipientId}
                  onChange={(e) => setDispatchRecipientId(e.target.value)}
                  placeholder="UUID"
                  className="w-full font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-[11px]"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Notification Summary Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={dispatchTitle}
                  onChange={(e) => setDispatchTitle(e.target.value)}
                  placeholder="e.g. Critical Potassium Alert (6.8 mEq/L)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">
                  Detailed Clinical Message or Prompt <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={dispatchBody}
                  onChange={(e) => setDispatchBody(e.target.value)}
                  placeholder="Enter high-acuity prompt details for attending intensivist..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Priority & Reference Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Priority</label>
                  <select
                    value={dispatchPriority}
                    onChange={(e) => setDispatchPriority(e.target.value as NotificationPriority)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (STAT)</option>
                    <option value="HIGH">HIGH Urgency</option>
                    <option value="NORMAL">NORMAL</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Reference Context</label>
                  <select
                    value={dispatchRefType}
                    onChange={(e) => setDispatchRefType(e.target.value as NotificationReferenceType)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer font-bold"
                  >
                    <option value="ALERT">ALERT (Telemetry/Monitor)</option>
                    <option value="ORDER">ORDER (Diagnostics/Pharma)</option>
                    <option value="HANDOVER">HANDOVER (Shift)</option>
                    <option value="MEETING">MEETING (Tele-ICU)</option>
                    <option value="PATIENT">PATIENT (Admission)</option>
                    <option value="DEVICE">DEVICE (Ventilator/Infusion)</option>
                  </select>
                </div>
              </div>

              {/* Reference ID */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Reference ID (Optional UUID)</label>
                <input
                  type="text"
                  value={dispatchRefId}
                  onChange={(e) => setDispatchRefId(e.target.value)}
                  placeholder="UUID"
                  className="w-full font-mono bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 text-[11px]"
                />
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1.5">
                  Delivery Channels (Multi-Channel Dispatch)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['WEBSOCKET', 'SMS', 'PAGER', 'FCM_PUSH'] as NotificationDeliveryChannel[]).map((ch) => (
                    <label
                      key={ch}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        dispatchChannels.includes(ch)
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-400 dark:border-teal-700 text-teal-900 dark:text-teal-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={dispatchChannels.includes(ch)}
                        onChange={() => toggleDispatchChannel(ch)}
                        className="accent-teal-600 rounded"
                      />
                      <span className="font-bold text-xs">{ch}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isDispatching ? 'Dispatching...' : 'Dispatch Prompt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: WORKER DELIVERY CALLBACK (PATCH /api/v1/notifications/deliveries/{id}/status)
         ========================================================================= */}
      {selectedDeliveryToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100 font-sans animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Update Delivery Status (Worker Callback)</h3>
              </div>
              <button
                onClick={() => setSelectedDeliveryToUpdate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1 text-xs font-mono">
              <div>Delivery UUID: <span className="text-teal-800 dark:text-teal-300 font-bold">{selectedDeliveryToUpdate.deliveryId}</span></div>
              <div>Channel: <span className="text-slate-900 dark:text-white font-bold">{selectedDeliveryToUpdate.channel}</span></div>
              <div>Current Status: <span className="text-amber-800 dark:text-amber-300 font-bold">{selectedDeliveryToUpdate.currentStatus}</span></div>
            </div>

            <form onSubmit={handleUpdateDeliverySubmit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">New Delivery Status</label>
                <select
                  value={updateDeliveryStatusVal}
                  onChange={(e) => setUpdateDeliveryStatusVal(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer font-bold"
                >
                  <option value="SENT">SENT</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              {updateDeliveryStatusVal === 'FAILED' && (
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-bold block mb-1">Error Reason</label>
                  <input
                    type="text"
                    value={updateDeliveryErrorMsg}
                    onChange={(e) => setUpdateDeliveryErrorMsg(e.target.value)}
                    placeholder="e.g. Gateway unreachable or carrier timeout"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedDeliveryToUpdate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingDelivery}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isUpdatingDelivery ? 'Updating...' : 'Update Status Callback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: TELEMETRY ALARM ACKNOWLEDGMENT NOTE MODAL (PRESERVED)
         ========================================================================= */}
      {selectedAlertForAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100 font-sans animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Acknowledge Bedside Alarm</h3>
              <button
                onClick={() => setSelectedAlertForAck(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">
                Bed {selectedAlertForAck.bedNumber} — {selectedAlertForAck.patientName}
              </div>
              <p className="text-slate-600 dark:text-slate-300">{selectedAlertForAck.message}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Clinical Action Note
              </label>
              <textarea
                rows={3}
                value={ackNoteText}
                onChange={(e) => setAckNoteText(e.target.value)}
                placeholder="Enter clinical action taken..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAlertForAck(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAcknowledgeSubmit(selectedAlertForAck.id)}
                className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Acknowledgment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertCenterPage;
