import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  Activity, 
  CheckCheck, 
  ChevronRight, 
  ShieldAlert, 
  Info,
  Clock,
  X,
  Send,
  Radio,
  MessageSquare,
  Smartphone,
  ExternalLink,
  Check,
  Plus
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchNotificationsThunk,
  markNotificationReadThunk,
  markAllNotificationsReadThunk,
} from '../../store/slices/notificationSlice';
import { NotificationResponse } from '../../api/notificationApi';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDispatchModal?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  onOpenDispatchModal,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { notifications, unreadCount, isLoading } = useAppSelector(
    (state) => state.notifications
  );

  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL' | 'HIGH'>('ALL');

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchNotificationsThunk(undefined));
    }
  }, [isOpen, dispatch]);

  if (!isOpen) return null;

  const handleMarkRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(markNotificationReadThunk(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsReadThunk());
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.is_read;
    if (filter === 'CRITICAL') return n.priority === 'CRITICAL';
    if (filter === 'HIGH') return n.priority === 'HIGH' || n.priority === 'CRITICAL';
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            HIGH
          </span>
        );
      case 'NORMAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
            NORMAL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            LOW
          </span>
        );
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel?.toUpperCase()) {
      case 'WEBSOCKET':
        return <span title="WebSocket Push"><Radio className="w-3 h-3 text-teal-400" /></span>;
      case 'SMS':
        return <span title="SMS Prompt"><Smartphone className="w-3 h-3 text-blue-400" /></span>;
      case 'PAGER':
        return <span title="Hospital Pager"><Activity className="w-3 h-3 text-amber-400" /></span>;
      case 'FCM_PUSH':
        return <span title="FCM Mobile Push"><Send className="w-3 h-3 text-purple-400" /></span>;
      default:
        return <span><MessageSquare className="w-3 h-3 text-slate-400" /></span>;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover */}
      <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-all duration-200 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="p-3.5 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-none">
                Clinical Notifications & Push
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {unreadCount} unread • {notifications.length} total
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline px-2 py-1 rounded cursor-pointer"
                title="Mark all as read"
              >
                Read All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] bg-white dark:bg-slate-900">
          {(['ALL', 'UNREAD', 'CRITICAL', 'HIGH'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filter === tab
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL'
                ? `All (${notifications.length})`
                : tab === 'UNREAD'
                ? `Unread (${unreadCount})`
                : tab}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No notifications to display</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500">All alerts and clinical prompts are acknowledged.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) {
                    dispatch(markNotificationReadThunk(notif.id));
                  }
                }}
                className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 relative group cursor-pointer ${
                  !notif.is_read ? 'bg-teal-500/5 dark:bg-teal-950/20' : ''
                }`}
              >
                {/* Priority Icon */}
                <div className="mt-0.5 shrink-0">
                  {notif.priority === 'CRITICAL' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-500 animate-pulse" />
                  ) : notif.priority === 'HIGH' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  ) : notif.priority === 'NORMAL' ? (
                    <Bell className="w-4 h-4 text-teal-400" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className={`text-xs font-bold truncate ${
                        !notif.is_read ? 'text-teal-900 dark:text-teal-200' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {notif.title}
                      </span>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" title="Unread" />
                      )}
                    </div>
                    {getPriorityBadge(notif.priority)}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
                    {notif.body}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {notif.reference_type && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase text-[9px] font-semibold">
                          {notif.reference_type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Delivery channels */}
                      {notif.deliveries && notif.deliveries.length > 0 && (
                        <div className="flex items-center gap-1 mr-1">
                          {notif.deliveries.map((del) => (
                            <span key={del.id} title={`${del.channel}: ${del.delivery_status}`}>
                              {getChannelIcon(del.channel)}
                            </span>
                          ))}
                        </div>
                      )}

                      {!notif.is_read && (
                        <button
                          onClick={(e) => handleMarkRead(notif.id, e)}
                          className="text-teal-600 dark:text-teal-400 hover:underline font-semibold font-sans opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <Link
            to="/notifications"
            onClick={onClose}
            className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-semibold text-[11px] hover:underline"
          >
            <span>Open Notification Center</span>
            <ChevronRight className="w-3 h-3" />
          </Link>

          <Link
            to="/alerts"
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-[11px]"
          >
            ICU Alerts Feed
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotificationDropdown;
