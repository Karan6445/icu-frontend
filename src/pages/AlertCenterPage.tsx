import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  X
} from 'lucide-react';
import { AlertService } from '../services/alertService';
import { AlertItem, AlertSeverity } from '../types/icu';

export const AlertCenterPage: React.FC = () => {
  const [alertsList, setAlertsList] = useState<AlertItem[]>(() => AlertService.getAllAlerts());
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'ACKNOWLEDGED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
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

  const filteredAlerts = alertsList.filter((alert) => {
    // Severity filter
    if (filterSeverity !== 'ALL' && alert.severity !== filterSeverity) {
      return false;
    }
    // Status filter
    if (filterStatus !== 'ALL' && alert.status !== filterStatus) {
      return false;
    }
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = alert.patientName.toLowerCase().includes(q);
      const matchBed = alert.bedNumber.toLowerCase().includes(q);
      const matchMsg = alert.message.toLowerCase().includes(q);
      const matchParam = alert.parameterName?.toLowerCase().includes(q);
      if (!matchName && !matchBed && !matchMsg && !matchParam) return false;
    }
    return true;
  });

  // Severity counts
  const countCritical = alertsList.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE').length;
  const countHigh = alertsList.filter(a => a.severity === 'HIGH' && a.status === 'ACTIVE').length;
  const countMedium = alertsList.filter(a => a.severity === 'MEDIUM' && a.status === 'ACTIVE').length;
  const countLow = alertsList.filter(a => a.severity === 'LOW' && a.status === 'ACTIVE').length;
  const countActiveTotal = alertsList.filter(a => a.status === 'ACTIVE').length;

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1.5 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-950/80 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-800 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            LOW
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200">
            INFO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Bell className="w-6 h-6 animate-bounce" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Clinical Telemetry & Alarm Console
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time alarm priority routing, acknowledgment workflow, and severity color coding
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${
              isAudioMuted
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                : 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
            }`}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isAudioMuted ? 'AUDIBLE ALARM MUTED' : 'AUDIBLE ALARM ACTIVE'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Active */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Active Alarms
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {countActiveTotal}
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Card */}
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-4 rounded-3xl border transition-all text-left cursor-pointer ${
            filterSeverity === 'CRITICAL'
              ? 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
              Critical Severity
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono mt-1">
            {countCritical}
          </div>
        </button>

        {/* High Card */}
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`p-4 rounded-3xl border transition-all text-left cursor-pointer ${
            filterSeverity === 'HIGH'
              ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              High Severity
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            {countHigh}
          </div>
        </button>

        {/* Medium Card */}
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`p-4 rounded-3xl border transition-all text-left cursor-pointer ${
            filterSeverity === 'MEDIUM'
              ? 'ring-2 ring-yellow-500 bg-yellow-50 dark:bg-yellow-950/40 border-yellow-300 dark:border-yellow-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-600 dark:text-yellow-400 font-mono">
              Medium Severity
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          </div>
          <div className="text-2xl font-black text-yellow-600 dark:text-yellow-400 font-mono mt-1">
            {countMedium}
          </div>
        </button>

        {/* Low Card */}
        <button
          onClick={() => setFilterSeverity(filterSeverity === 'LOW' ? 'ALL' : 'LOW')}
          className={`p-4 rounded-3xl border transition-all text-left cursor-pointer ${
            filterSeverity === 'LOW'
              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Low Severity
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono mt-1">
            {countLow}
          </div>
        </button>
      </div>

      {/* Filter & Controls Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase mr-1">Severity:</span>

          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'ALL'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Severities ({alertsList.length})
          </button>

          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'CRITICAL'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
            }`}
          >
            Critical ({countCritical})
          </button>

          <button
            onClick={() => setFilterSeverity('HIGH')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'HIGH'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
            }`}
          >
            High ({countHigh})
          </button>

          <button
            onClick={() => setFilterSeverity('MEDIUM')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'MEDIUM'
                ? 'bg-yellow-500 text-slate-950 shadow-md'
                : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900'
            }`}
          >
            Medium ({countMedium})
          </button>

          <button
            onClick={() => setFilterSeverity('LOW')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterSeverity === 'LOW'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
            }`}
          >
            Low ({countLow})
          </button>
        </div>

        {/* Status, Search & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Only</option>
            <option value="ACKNOWLEDGED">Acknowledged Only</option>
          </select>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient, bed, or alert..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-48 sm:w-56"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Alert Display Section */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-mono">
                  <th className="p-4">Severity</th>
                  <th className="p-4">Patient & Bed</th>
                  <th className="p-4">Parameter & Description</th>
                  <th className="p-4">Value / Limit</th>
                  <th className="p-4">Source</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No alerts match the selected severity and filters.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Severity */}
                      <td className="p-4 whitespace-nowrap">
                        {getSeverityBadge(alert.severity)}
                      </td>

                      {/* Patient & Bed */}
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-teal-400 font-mono font-bold text-[11px]">
                            {alert.bedNumber}
                          </span>
                          <div>
                            <Link
                              to={`/patient/${alert.patientId}`}
                              className="font-bold text-slate-900 dark:text-white hover:text-teal-500 flex items-center gap-1"
                            >
                              <span>{alert.patientName}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </Link>
                            <span className="text-[10px] font-mono text-slate-400 block">ID: {alert.patientId}</span>
                          </div>
                        </div>
                      </td>

                      {/* Parameter & Message */}
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {alert.parameterName || alert.category || 'Clinical Alarm'}
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mt-0.5">
                          {alert.message}
                        </div>
                      </td>

                      {/* Value / Limit */}
                      <td className="p-4 whitespace-nowrap font-mono">
                        {alert.currentValue ? (
                          <div>
                            <span className="font-extrabold text-rose-600 dark:text-rose-400">{alert.currentValue}</span>
                            {alert.thresholdLimit && (
                              <span className="text-[10px] text-slate-400 block">Limit: {alert.thresholdLimit}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="p-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {alert.source}
                      </td>

                      {/* Timestamp */}
                      <td className="p-4 whitespace-nowrap font-mono text-[11px] text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="p-4 whitespace-nowrap text-right">
                        {alert.status === 'ACTIVE' ? (
                          <button
                            onClick={() => setSelectedAlertForAck(alert)}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Acknowledge</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ACKNOWLEDGED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.length === 0 ? (
            <div className="md:col-span-2 p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
              No alerts match the selected filters.
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-5 rounded-3xl border shadow-xs transition-all flex flex-col justify-between gap-4 ${
                  alert.severity === 'CRITICAL'
                    ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60'
                    : alert.severity === 'HIGH'
                    ? 'bg-amber-50/40 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                    : alert.severity === 'MEDIUM'
                    ? 'bg-yellow-50/40 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-900/60'
                    : 'bg-blue-50/40 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-teal-400 px-2.5 py-1 rounded-xl">
                        Bed {alert.bedNumber}
                      </span>
                      {getSeverityBadge(alert.severity)}
                    </div>

                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                      {alert.patientName}
                    </h3>
                    <p className="text-xs text-slate-700 dark:text-slate-200 font-semibold mt-1 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>

                  {alert.currentValue && (
                    <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Current Value:</span>
                      <span className="font-extrabold text-rose-600 dark:text-rose-400">{alert.currentValue} (Limit: {alert.thresholdLimit})</span>
                    </div>
                  )}

                  <div className="text-[10px] font-mono text-slate-400">
                    Source: {alert.source}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    to={`/patient/${alert.patientId}`}
                    className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Patient</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  {alert.status === 'ACTIVE' ? (
                    <button
                      onClick={() => setSelectedAlertForAck(alert)}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Acknowledge Alert</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-bold border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ACKNOWLEDGED
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Acknowledgment Modal Drawer */}
      {selectedAlertForAck && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                  Acknowledge Telemetry Alarm
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlertForAck(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  Bed {selectedAlertForAck.bedNumber} — {selectedAlertForAck.patientName}
                </span>
                {getSeverityBadge(selectedAlertForAck.severity)}
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                {selectedAlertForAck.message}
              </p>
              <div className="text-[10px] font-mono text-slate-400">
                Source: {selectedAlertForAck.source}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Acknowledgment Clinical Note / Action Taken
              </label>
              <textarea
                rows={3}
                value={ackNoteText}
                onChange={(e) => setAckNoteText(e.target.value)}
                placeholder="Enter clinical action taken (e.g., bedside checked, vasopressor uptitrated)..."
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAlertForAck(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAcknowledgeSubmit(selectedAlertForAck.id)}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
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
