import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchBusinessAuditLogsThunk,
  fetchAccessAuditLogsThunk,
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
  AuditTabType,
} from '../../store/slices/auditSlice';
import { AuditBusinessLogItem, AuditAccessLogItem } from '../../api/auditApi';
import {
  ShieldCheck,
  Search,
  Filter,
  Lock,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RefreshCw,
  Eye,
  Database,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft,
  X,
  Copy,
  Check,
  Download,
  ShieldAlert,
  ArrowRight,
  Globe,
  SlidersHorizontal,
} from 'lucide-react';

export const AuditLogsManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    activeTab,
    businessLogs,
    businessTotal,
    businessPage,
    businessPageSize,
    businessFilters,
    accessLogs,
    accessTotal,
    accessPage,
    accessPageSize,
    accessFilters,
    selectedBusinessLog,
    selectedAccessLog,
    isLoading,
    error,
    lastSyncedTime,
    lastSyncedUrl,
  } = useAppSelector((state) => state.audit);

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [quickDatePreset, setQuickDatePreset] = useState<'ALL' | '24H' | '7D' | '30D'>('ALL');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // 1. Fetch Business Logs when relevant filters or pagination change
  useEffect(() => {
    if (activeTab === 'BUSINESS_LOGS') {
      const params: any = {
        page: businessPage,
        page_size: businessPageSize,
      };

      if (businessFilters.entity_name && businessFilters.entity_name !== 'ALL') {
        params.entity_name = businessFilters.entity_name;
      }
      if (businessFilters.action && businessFilters.action !== 'ALL') {
        params.action = businessFilters.action;
      }
      if (businessFilters.entity_id && UUID_REGEX.test(businessFilters.entity_id.trim())) {
        params.entity_id = businessFilters.entity_id.trim();
      }
      if (businessFilters.user_id && UUID_REGEX.test(businessFilters.user_id.trim())) {
        params.user_id = businessFilters.user_id.trim();
      }
      if (businessFilters.start_time) {
        params.start_time = businessFilters.start_time;
      }
      if (businessFilters.end_time) {
        params.end_time = businessFilters.end_time;
      }

      dispatch(fetchBusinessAuditLogsThunk(params));
    }
  }, [
    dispatch,
    activeTab,
    businessPage,
    businessPageSize,
    businessFilters.entity_name,
    businessFilters.action,
    businessFilters.entity_id,
    businessFilters.user_id,
    businessFilters.start_time,
    businessFilters.end_time,
  ]);

  // 2. Fetch Access Logs when relevant filters or pagination change
  useEffect(() => {
    if (activeTab === 'ACCESS_LOGS') {
      const params: any = {
        page: accessPage,
        page_size: accessPageSize,
      };

      if (accessFilters.action && accessFilters.action !== 'ALL') {
        params.action = accessFilters.action;
      }
      if (accessFilters.patient_id && UUID_REGEX.test(accessFilters.patient_id.trim())) {
        params.patient_id = accessFilters.patient_id.trim();
      }
      if (accessFilters.user_id && UUID_REGEX.test(accessFilters.user_id.trim())) {
        params.user_id = accessFilters.user_id.trim();
      }
      if (accessFilters.is_sensitive !== 'ALL') {
        params.is_sensitive = accessFilters.is_sensitive === 'TRUE';
      }
      if (accessFilters.start_time) {
        params.start_time = accessFilters.start_time;
      }
      if (accessFilters.end_time) {
        params.end_time = accessFilters.end_time;
      }

      dispatch(fetchAccessAuditLogsThunk(params));
    }
  }, [
    dispatch,
    activeTab,
    accessPage,
    accessPageSize,
    accessFilters.action,
    accessFilters.patient_id,
    accessFilters.user_id,
    accessFilters.is_sensitive,
    accessFilters.start_time,
    accessFilters.end_time,
  ]);

  // Manual Trigger to refresh active tab
  const handleRefresh = () => {
    if (activeTab === 'BUSINESS_LOGS') {
      const params: any = { page: businessPage, page_size: businessPageSize };
      if (businessFilters.entity_name && businessFilters.entity_name !== 'ALL') params.entity_name = businessFilters.entity_name;
      if (businessFilters.action && businessFilters.action !== 'ALL') params.action = businessFilters.action;
      if (businessFilters.entity_id && UUID_REGEX.test(businessFilters.entity_id.trim())) params.entity_id = businessFilters.entity_id.trim();
      if (businessFilters.user_id && UUID_REGEX.test(businessFilters.user_id.trim())) params.user_id = businessFilters.user_id.trim();
      if (businessFilters.start_time) params.start_time = businessFilters.start_time;
      if (businessFilters.end_time) params.end_time = businessFilters.end_time;
      dispatch(fetchBusinessAuditLogsThunk(params));
    } else {
      const params: any = { page: accessPage, page_size: accessPageSize };
      if (accessFilters.action && accessFilters.action !== 'ALL') params.action = accessFilters.action;
      if (accessFilters.patient_id && UUID_REGEX.test(accessFilters.patient_id.trim())) params.patient_id = accessFilters.patient_id.trim();
      if (accessFilters.user_id && UUID_REGEX.test(accessFilters.user_id.trim())) params.user_id = accessFilters.user_id.trim();
      if (accessFilters.is_sensitive !== 'ALL') params.is_sensitive = accessFilters.is_sensitive === 'TRUE';
      if (accessFilters.start_time) params.start_time = accessFilters.start_time;
      if (accessFilters.end_time) params.end_time = accessFilters.end_time;
      dispatch(fetchAccessAuditLogsThunk(params));
    }
  };

  // Quick Date Range Handler
  const handleQuickDatePreset = (preset: 'ALL' | '24H' | '7D' | '30D') => {
    setQuickDatePreset(preset);
    let startTime = '';
    const now = new Date();

    if (preset === '24H') {
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    } else if (preset === '7D') {
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (preset === '30D') {
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    if (activeTab === 'BUSINESS_LOGS') {
      dispatch(setBusinessFilters({ start_time: startTime, end_time: startTime ? now.toISOString() : '' }));
    } else {
      dispatch(setAccessFilters({ start_time: startTime, end_time: startTime ? now.toISOString() : '' }));
    }
  };

  // Clipboard copy helper
  const handleCopy = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2500);
    }
  };

  // Export JSON handler
  const handleExportJson = () => {
    const dataToExport = activeTab === 'BUSINESS_LOGS' ? businessLogs : accessLogs;
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_${activeTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Client-side quick search filtering for business logs
  const filteredBusinessLogs = businessLogs.filter((log) => {
    const query = businessFilters.search.toLowerCase().trim();
    if (!query) return true;
    return (
      log.action.toLowerCase().includes(query) ||
      log.entity_name.toLowerCase().includes(query) ||
      (log.user_role && log.user_role.toLowerCase().includes(query)) ||
      (log.user_id && log.user_id.toLowerCase().includes(query)) ||
      (log.entity_id && log.entity_id.toLowerCase().includes(query)) ||
      (log.correlation_id && log.correlation_id.toLowerCase().includes(query)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(query)) ||
      (log.reason && log.reason.toLowerCase().includes(query))
    );
  });

  // Client-side quick search filtering for access logs
  const filteredAccessLogs = accessLogs.filter((log) => {
    const query = accessFilters.search.toLowerCase().trim();
    if (!query) return true;
    return (
      log.action.toLowerCase().includes(query) ||
      log.status.toLowerCase().includes(query) ||
      (log.user_id && log.user_id.toLowerCase().includes(query)) ||
      (log.patient_id && log.patient_id.toLowerCase().includes(query)) ||
      (log.ip_address && log.ip_address.toLowerCase().includes(query)) ||
      (log.access_reason && log.access_reason.toLowerCase().includes(query))
    );
  });

  // KPI Calculations
  const sensitiveAccessCount = accessLogs.filter((l) => l.is_sensitive).length;
  const mutationCount = businessLogs.filter((l) =>
    ['CREATE', 'UPDATE', 'DELETE'].some((act) => l.action.toUpperCase().includes(act))
  ).length;

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-teal-50 dark:bg-teal-500/10 rounded-2xl border border-teal-200 dark:border-teal-500/20 text-[#0F766E] dark:text-teal-400 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-300 dark:border-teal-500/30">
                Audit Trails & Access Logs API
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> RFC 4122 Immutable Ledger
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Audit Trails & Security Access Logs
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Query immutable business mutations and forensic chart access telemetry from backend cluster.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 transition shadow-xs"
            title="Download JSON Export"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Logs</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-sm transition hover:shadow-md disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live Audit API</span>
          </button>
        </div>
      </div>


      {/* ================= KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Business Audit Records
            </span>
            <div className="p-2 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-xl">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {businessTotal}
          </p>
          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-mono mt-1 block">
            GET /api/v1/audit/logs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Security Access Logs
            </span>
            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {accessTotal}
          </p>
          <span className="text-[11px] text-blue-700 dark:text-blue-400 font-mono mt-1 block">
            GET /api/v1/audit/access-logs
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sensitive Chart Access
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {sensitiveAccessCount}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
            Filtered is_sensitive: true
          </span>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Mutation Events
            </span>
            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 rounded-xl">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {mutationCount}
          </p>
          <span className="text-[11px] text-purple-700 dark:text-purple-400 font-mono mt-1 block">
            CREATE / UPDATE / DELETE
          </span>
        </div>
      </div>

      {/* ================= TABS NAVIGATION ================= */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => dispatch(setActiveTab('BUSINESS_LOGS'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 ${
            activeTab === 'BUSINESS_LOGS'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>1. Immutable Business Audit Trail</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300">
            {businessTotal}
          </span>
        </button>

        <button
          onClick={() => dispatch(setActiveTab('ACCESS_LOGS'))}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold transition border-b-2 ${
            activeTab === 'ACCESS_LOGS'
              ? 'border-teal-700 text-teal-800 dark:text-teal-300 dark:border-teal-400 bg-teal-50/50 dark:bg-teal-950/20'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>2. Security & Chart Access Logs</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
            {accessTotal}
          </span>
        </button>
      </div>

      {/* ================= FILTER TOOLBAR ================= */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={
                activeTab === 'BUSINESS_LOGS'
                  ? 'Search by action, entity, user, correlation ID, reason...'
                  : 'Search by action, patient ID, user ID, reason, IP...'
              }
              value={activeTab === 'BUSINESS_LOGS' ? businessFilters.search : accessFilters.search}
              onChange={(e) => {
                if (activeTab === 'BUSINESS_LOGS') {
                  dispatch(setBusinessFilters({ search: e.target.value }));
                } else {
                  dispatch(setAccessFilters({ search: e.target.value }));
                }
              }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {(['ALL', '24H', '7D', '30D'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handleQuickDatePreset(preset)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  quickDatePreset === preset
                    ? 'bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {preset === 'ALL' ? 'All Time' : preset}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
              isFilterDrawerOpen
                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-500 text-teal-800 dark:text-teal-300'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Advanced Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Query Filter Controls */}
        {isFilterDrawerOpen && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in text-xs">
            {activeTab === 'BUSINESS_LOGS' ? (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Entity Table
                  </label>
                  <select
                    value={businessFilters.entity_name}
                    onChange={(e) => dispatch(setBusinessFilters({ entity_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">All Entities</option>
                    <option value="User">User</option>
                    <option value="HospitalStaff">HospitalStaff</option>
                    <option value="Bed">Bed</option>
                    <option value="ICUWard">ICUWard</option>
                    <option value="Department">Department</option>
                    <option value="Patient">Patient</option>
                    <option value="RolePermission">RolePermission</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Action Type
                  </label>
                  <select
                    value={businessFilters.action}
                    onChange={(e) => dispatch(setBusinessFilters({ action: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ALL">All Actions</option>
                    <option value="USER_LOGIN_SUCCESS">USER_LOGIN_SUCCESS</option>
                    <option value="CREATE_CLINICAL_STAFF">CREATE_CLINICAL_STAFF</option>
                    <option value="UPDATE_BED_STATUS">UPDATE_BED_STATUS</option>
                    <option value="SECURITY_PERMISSION_ASSIGN">SECURITY_PERMISSION_ASSIGN</option>
                    <option value="CREATE">CREATE</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Filter by Actor User UUID
                  </label>
                  <input
                    type="text"
                    placeholder="b503be05-e5e5-43c0-b853-4cf88a014423"
                    value={businessFilters.user_id}
                    onChange={(e) => dispatch(setBusinessFilters({ user_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => dispatch(resetBusinessFilters())}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition text-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Sensitivity Scope
                  </label>
                  <select
                    value={accessFilters.is_sensitive}
                    onChange={(e) => dispatch(setAccessFilters({ is_sensitive: e.target.value as any }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ALL">All Access Records</option>
                    <option value="TRUE">Sensitive Charts Only 🔒</option>
                    <option value="FALSE">Standard Telemetry Access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Access Action
                  </label>
                  <select
                    value={accessFilters.action}
                    onChange={(e) => dispatch(setAccessFilters({ action: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ALL">All Actions</option>
                    <option value="PATIENT_CHART_OPEN">PATIENT_CHART_OPEN</option>
                    <option value="MEDICATION_ADMIN_CHART">MEDICATION_ADMIN_CHART</option>
                    <option value="AUDIT_LOG_SEARCH">AUDIT_LOG_SEARCH</option>
                    <option value="LAB_RESULTS_DISCLOSURE">LAB_RESULTS_DISCLOSURE</option>
                    <option value="TELEMETRY_ACCESS">TELEMETRY_ACCESS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Filter by Patient UUID
                  </label>
                  <input
                    type="text"
                    placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    value={accessFilters.patient_id}
                    onChange={(e) => dispatch(setAccessFilters({ patient_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => dispatch(resetAccessFilters())}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 transition text-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ================= TAB 1: IMMUTABLE BUSINESS AUDIT LOGS ================= */}
      {activeTab === 'BUSINESS_LOGS' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5">Timestamp & IP</th>
                  <th className="py-4 px-5">Actor & Role</th>
                  <th className="py-4 px-5">Action & Entity</th>
                  <th className="py-4 px-5">Reason / Diff</th>
                  <th className="py-4 px-5">Correlation ID</th>
                  <th className="py-4 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredBusinessLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No business audit records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredBusinessLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                      onClick={() => dispatch(setSelectedBusinessLog(log))}
                    >
                      {/* Timestamp & IP */}
                      <td className="py-4 px-5">
                        <span className="font-mono text-slate-900 dark:text-white font-bold block">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>IP: {log.ip_address}</span>
                        </div>
                      </td>

                      {/* Actor & Role */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[120px]">
                            {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                          </span>
                          {log.user_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(log.user_id!);
                              }}
                              className="text-slate-400 hover:text-teal-600"
                              title="Copy User UUID"
                            >
                              {copiedText === log.user_id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-300 border border-teal-200 dark:border-teal-800 inline-block mt-0.5 uppercase">
                          {log.user_role || 'STAFF'}
                        </span>
                      </td>

                      {/* Action & Entity */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-teal-800 dark:text-teal-300 block font-mono">
                          {log.action}
                        </span>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {log.entity_name}
                          </span>
                          {log.entity_id && (
                            <span className="font-mono text-[10px]">
                              ({log.entity_id.slice(0, 8)}...)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Reason & Diff preview */}
                      <td className="py-4 px-5 max-w-xs">
                        <p className="text-slate-800 dark:text-slate-200 font-medium truncate">
                          {log.reason || 'Operational ledger write'}
                        </p>
                        {(log.old_values || log.new_values) && (
                          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold block mt-0.5">
                            ✦ State mutation diff recorded
                          </span>
                        )}
                      </td>

                      {/* Correlation ID */}
                      <td className="py-4 px-5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {log.correlation_id || 'system-direct'}
                      </td>

                      {/* Inspect Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedBusinessLog(log));
                          }}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Diff</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-2">
            <span>
              Showing {filteredBusinessLogs.length} of {businessTotal} immutable records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={businessPage <= 1}
                onClick={() => dispatch(setBusinessPage(businessPage - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 flex items-center gap-1 font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="font-mono font-bold px-2">Page {businessPage}</span>
              <button
                disabled={businessLogs.length < businessPageSize}
                onClick={() => dispatch(setBusinessPage(businessPage + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 flex items-center gap-1 font-bold"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SECURITY & CHART ACCESS LOGS ================= */}
      {activeTab === 'ACCESS_LOGS' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-5">Accessed At & IP</th>
                  <th className="py-4 px-5">Clinician User UUID</th>
                  <th className="py-4 px-5">Patient UUID</th>
                  <th className="py-4 px-5">Action & Status</th>
                  <th className="py-4 px-5">Sensitivity & Reason</th>
                  <th className="py-4 px-5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {filteredAccessLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No security access records match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredAccessLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                      onClick={() => dispatch(setSelectedAccessLog(log))}
                    >
                      {/* Accessed At & IP */}
                      <td className="py-4 px-5">
                        <span className="font-mono text-slate-900 dark:text-white font-bold block">
                          {new Date(log.accessed_at).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>IP: {log.ip_address}</span>
                        </div>
                      </td>

                      {/* Clinician User UUID */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[130px]">
                            {log.user_id ? log.user_id.slice(0, 8) + '...' : 'System'}
                          </span>
                          {log.user_id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(log.user_id!);
                              }}
                              className="text-slate-400 hover:text-teal-600"
                              title="Copy User UUID"
                            >
                              {copiedText === log.user_id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Patient UUID */}
                      <td className="py-4 px-5 font-mono">
                        {log.patient_id ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-teal-900 dark:text-teal-300 font-semibold">
                              {log.patient_id.slice(0, 8)}...
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(log.patient_id!);
                              }}
                              className="text-slate-400 hover:text-teal-600"
                              title="Copy Patient UUID"
                            >
                              {copiedText === log.patient_id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None / General</span>
                        )}
                      </td>

                      {/* Action & Status */}
                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-900 dark:text-white block font-mono">
                          {log.action}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 inline-block mt-0.5">
                          {log.status}
                        </span>
                      </td>

                      {/* Sensitivity & Reason */}
                      <td className="py-4 px-5 max-w-sm">
                        <div className="flex items-center gap-2 mb-1">
                          {log.is_sensitive ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> SENSITIVE CHART
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              STANDARD
                            </span>
                          )}
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-xs font-medium truncate">
                          {log.access_reason || 'Medical record accessed under clinical care protocol'}
                        </p>
                      </td>

                      {/* Inspect */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setSelectedAccessLog(log));
                          }}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Trace</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-2">
            <span>
              Showing {filteredAccessLogs.length} of {accessTotal} security records
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={accessPage <= 1}
                onClick={() => dispatch(setAccessPage(accessPage - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 flex items-center gap-1 font-bold"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="font-mono font-bold px-2">Page {accessPage}</span>
              <button
                disabled={accessLogs.length < accessPageSize}
                onClick={() => dispatch(setAccessPage(accessPage + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40 flex items-center gap-1 font-bold"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: BUSINESS LOG DIFF INSPECTION ================= */}
      {selectedBusinessLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 dark:bg-teal-950 rounded-xl text-teal-700 dark:text-teal-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Immutable Business Log Record
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedBusinessLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setSelectedBusinessLog(null))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block font-mono">ACTION TYPE:</span>
                <span className="font-bold text-teal-700 dark:text-teal-300 font-mono">
                  {selectedBusinessLog.action}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">ENTITY NAME:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedBusinessLog.entity_name} ({selectedBusinessLog.entity_id || 'N/A'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">ACTOR ROLE:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {selectedBusinessLog.user_role || 'STAFF'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-mono">TIMESTAMP (UTC):</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedBusinessLog.created_at}
                </span>
              </div>
            </div>

            {selectedBusinessLog.reason && (
              <div className="p-3 bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 rounded-xl text-xs">
                <span className="font-bold text-teal-900 dark:text-teal-200 block mb-0.5">
                  Audit Justification / Reason:
                </span>
                <p className="text-slate-700 dark:text-slate-300">{selectedBusinessLog.reason}</p>
              </div>
            )}

            {/* Old Values vs New Values JSON Diff View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Old State Values:
                </span>
                <pre className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-mono overflow-x-auto text-slate-800 dark:text-slate-300 max-h-48">
                  {selectedBusinessLog.old_values
                    ? JSON.stringify(selectedBusinessLog.old_values, null, 2)
                    : '// No prior state (Entity Creation)'}
                </pre>
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                  New State Values:
                </span>
                <pre className="p-3 bg-slate-100 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 rounded-xl text-[11px] font-mono overflow-x-auto text-emerald-900 dark:text-emerald-300 max-h-48">
                  {selectedBusinessLog.new_values
                    ? JSON.stringify(selectedBusinessLog.new_values, null, 2)
                    : '// No post state (Entity Deletion)'}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
              <span className="font-mono text-slate-400">
                IP: {selectedBusinessLog.ip_address}
              </span>
              <button
                onClick={() => dispatch(setSelectedBusinessLog(null))}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 transition"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ACCESS LOG TRACE INSPECTION ================= */}
      {selectedAccessLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-xl text-blue-700 dark:text-blue-400">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Chart Access Security Trace
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: {selectedAccessLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dispatch(setSelectedAccessLog(null))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-mono">ACCESS ACTION:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {selectedAccessLog.action}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-mono">SENSITIVE CLASSIFICATION:</span>
                  {selectedAccessLog.is_sensitive ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      RESTRICTED CLINICAL CHART 🔒
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      STANDARD
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-mono">PATIENT UUID:</span>
                  <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                    {selectedAccessLog.patient_id || 'System Level Access'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-mono">USER AGENT:</span>
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs">
                    {selectedAccessLog.user_agent}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-0.5">
                  Clinical Access Protocol Justification:
                </span>
                <p className="text-slate-700 dark:text-slate-300">
                  {selectedAccessLog.access_reason || 'Verified clinical observation in ICU unit.'}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                onClick={() => dispatch(setSelectedAccessLog(null))}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-200 transition text-xs"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsManagementPage;
