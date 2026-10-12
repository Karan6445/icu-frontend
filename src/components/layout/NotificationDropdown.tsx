import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  Activity, 
  CheckCheck, 
  ChevronRight, 
  ShieldAlert, 
  Info,
  Clock,
  X
} from 'lucide-react';
import { AlertService } from '../../services/alertService';
import { AlertItem } from '../../types/icu';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'VITALS' | 'SYSTEM'>('ALL');
  const [alerts, setAlerts] = useState<AlertItem[]>(AlertService.getActiveAlerts());

  if (!isOpen) return null;

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    AlertService.acknowledgeAlert(id, 'CURRENT_USER', 'Clinical Staff', 'RN');
    setAlerts(AlertService.getActiveAlerts());
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'VITALS') return a.source?.toLowerCase().includes('monitor') || a.message.toLowerCase().includes('spo2') || a.message.toLowerCase().includes('bp') || a.message.toLowerCase().includes('hr');
    if (filter === 'SYSTEM') return a.source?.toLowerCase().includes('gateway') || a.source?.toLowerCase().includes('system');
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
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
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
            INFO
          </span>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover */}
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-all duration-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-none">
                ICU Alert Feed
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                {alerts.length} active telemetry notification{alerts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto text-[11px] bg-white dark:bg-slate-900">
          {(['ALL', 'CRITICAL', 'VITALS', 'SYSTEM'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' ? `All (${alerts.length})` : tab}
            </button>
          ))}
        </div>

        {/* Alert List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCheck className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">All alerts cleared</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-500">No active telemetry warnings for current filter.</p>
            </div>
          ) : (
            filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3 relative group"
              >
                <div className="mt-0.5">
                  {alert.severity === 'CRITICAL' ? (
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 animate-pulse" />
                  ) : alert.severity === 'HIGH' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        Bed {alert.bedNumber}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                        • {alert.patientName}
                      </span>
                    </div>
                    {getSeverityBadge(alert.severity)}
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                    {alert.message}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={(e) => handleAcknowledge(alert.id, e)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold font-sans opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Acknowledge
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              alerts.forEach(a => AlertService.acknowledgeAlert(a.id, 'CURRENT_USER', 'Clinical Staff', 'RN'));
              setAlerts([]);
            }}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium text-[11px] transition-colors"
          >
            Acknowledge All
          </button>
          <Link
            to="/alerts"
            onClick={onClose}
            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold text-[11px] hover:underline"
          >
            <span>Open Alert Center</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </>
  );
};
