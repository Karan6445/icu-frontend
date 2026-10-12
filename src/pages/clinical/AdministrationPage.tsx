import React, { useState } from 'react';
import { UserRole, AuditEvent } from '../../types/user';
import { ShieldCheck, Users, Lock, KeyRound, Building2, HardDrive, FileText, CheckCircle2, XCircle } from 'lucide-react';

export const AdministrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'RBAC' | 'AUDIT' | 'UNITS' | 'INTEGRATIONS'>('RBAC');

  const roles: UserRole[] = [
    'System Administrator',
    'ICU Administrator',
    'Doctor',
    'Nurse',
    'Biomedical Engineer',
    'Read Only'
  ];

  const permissions = [
    { key: 'view_telemetry', label: 'View Real-time Patient Telemetry' },
    { key: 'view_timeline', label: 'View Patient History & Timeline' },
    { key: 'view_changes', label: 'Review Change Detection Engine' },
    { key: 'use_copilot', label: 'Interact with ICU Copilot' },
    { key: 'assign_bed', label: 'Manage Bed & Encounter Assignment' },
    { key: 'map_device', label: 'Map Bedside Device & Gateway Node' },
    { key: 'configure_system', label: 'System Configuration & RBAC Roles' },
  ];

  // Permission Matrix mapping (True/False)
  const matrix: Record<UserRole, Record<string, boolean>> = {
    'System Administrator': { view_telemetry: true, view_timeline: true, view_changes: true, use_copilot: true, assign_bed: true, map_device: true, configure_system: true },
    'ICU Administrator': { view_telemetry: true, view_timeline: true, view_changes: true, use_copilot: true, assign_bed: true, map_device: true, configure_system: false },
    'Doctor': { view_telemetry: true, view_timeline: true, view_changes: true, use_copilot: true, assign_bed: true, map_device: false, configure_system: false },
    'Nurse': { view_telemetry: true, view_timeline: true, view_changes: true, use_copilot: true, assign_bed: true, map_device: false, configure_system: false },
    'Biomedical Engineer': { view_telemetry: true, view_timeline: false, view_changes: false, use_copilot: false, assign_bed: false, map_device: true, configure_system: false },
    'Read Only': { view_telemetry: true, view_timeline: true, view_changes: true, use_copilot: false, assign_bed: false, map_device: false, configure_system: false },
  };

  const auditLogs: AuditEvent[] = [
    { id: 'aud-01', timestamp: '2026-09-17 12:41:32', userId: 'usr-901', userName: 'Dr. Ananya Roy', userRole: 'Doctor', action: 'PATIENT_TIMELINE_VIEW', targetResource: 'Patient P-1024', ipAddress: '192.168.10.14', status: 'SUCCESS' },
    { id: 'aud-02', timestamp: '2026-09-17 12:35:10', userId: 'usr-901', userName: 'Dr. Ananya Roy', userRole: 'Doctor', action: 'COPILOT_QUERY_SUMMARIZE', targetResource: 'Bed 07 Telemetry', ipAddress: '192.168.10.14', status: 'SUCCESS' },
    { id: 'aud-03', timestamp: '2026-09-17 12:15:00', userId: 'usr-901', userName: 'Dr. Ananya Roy', userRole: 'Doctor', action: 'VENTILATOR_TITRATION_NOTE', targetResource: 'Ventilator-ICU-07', ipAddress: '192.168.10.14', status: 'SUCCESS' },
    { id: 'aud-04', timestamp: '2026-09-17 11:45:22', userId: 'usr-302', userName: 'Eng. Ramesh Kumar', userRole: 'Biomedical Engineer', action: 'GATEWAY_MAP_UPDATE', targetResource: 'Gateway GW-MICU-01', ipAddress: '192.168.10.50', status: 'SUCCESS' },
    { id: 'aud-05', timestamp: '2026-09-17 10:20:15', userId: 'usr-774', userName: 'Nurse Priya Mehta', userRole: 'Nurse', action: 'CHANGE_MARK_REVIEWED', targetResource: 'Bed 03 Changes', ipAddress: '192.168.10.22', status: 'SUCCESS' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-clinical-border p-6 rounded-2xl shadow-clinical-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-teal-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-clinical-navy">
              Screen 08 — Administration & Governance
            </h1>
            <span className="text-xs text-slate-500">
              Role-Based Access Control (RBAC), audit logging, hospital identity parameters, and integration settings.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('RBAC')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'RBAC' ? 'bg-white text-clinical-navy font-bold shadow' : 'text-slate-600'
            }`}
          >
            RBAC Permission Matrix
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'AUDIT' ? 'bg-white text-clinical-navy font-bold shadow' : 'text-slate-600'
            }`}
          >
            Security Audit Trail
          </button>
        </div>
      </div>

      {activeTab === 'RBAC' ? (
        /* RBAC Permission Matrix */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-clinical-md space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-mono">
                Role-Based Access Control (RBAC) Permission Matrix
              </h3>
              <p className="text-xs text-slate-500">Enforces least privilege across clinical, nursing, and engineering roles.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Permission Capability</th>
                  {roles.map((r) => (
                    <th key={r} className="py-3 px-3 text-center">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {permissions.map((p) => (
                  <tr key={p.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{p.label}</td>
                    {roles.map((r) => {
                      const allowed = matrix[r][p.key];
                      return (
                        <td key={r} className="py-3 px-3 text-center">
                          {allowed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Trail Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-clinical-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white font-mono">
                Tamper-Evident Security Audit Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Immutable audit records for hospital regulatory compliance.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 text-slate-900 dark:text-white">Timestamp</th>
                  <th className="py-2.5 px-3 text-slate-900 dark:text-white">User Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Action Performed</th>
                  <th className="py-2.5 px-3">Target Resource</th>
                  <th className="py-2.5 px-3">Terminal IP</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{log.timestamp}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{log.userName}</td>
                    <td className="py-3 px-3 text-teal-700 dark:text-teal-400 font-bold">{log.userRole}</td>
                    <td className="py-3 px-3 font-bold text-purple-700 dark:text-purple-400">{log.action}</td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{log.targetResource}</td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{log.ipAddress}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
