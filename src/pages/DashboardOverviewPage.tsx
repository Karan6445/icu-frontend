import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { HospitalAdminDashboardPage } from './admin/HospitalAdminDashboardPage';
import { DoctorOverviewPage } from './doctor/DoctorOverviewPage';
import { NurseOverviewPage } from './nurse/NurseOverviewPage';
import { SuperAdminDashboardPage } from './admin/SuperAdminDashboardPage';
import { Building2, Stethoscope, HeartPulse, ShieldCheck, Activity } from 'lucide-react';

export const DashboardOverviewPage: React.FC = () => {
  const { activeRole } = useAppSelector(state => state.auth);

  // Set default view based on active role
  const [activeTab, setActiveTab] = useState<'HOSPITAL' | 'DOCTOR' | 'NURSE' | 'SUPER_ADMIN'>(() => {
    if (activeRole === 'DOCTOR') return 'DOCTOR';
    if (activeRole === 'NURSE') return 'NURSE';
    if (activeRole === 'SUPER_ADMIN') return 'SUPER_ADMIN';
    return 'HOSPITAL';
  });

  // Sync active perspective when user switches roles
  useEffect(() => {
    if (activeRole === 'DOCTOR') {
      setActiveTab('DOCTOR');
    } else if (activeRole === 'NURSE') {
      setActiveTab('NURSE');
    } else if (activeRole === 'SUPER_ADMIN') {
      setActiveTab('SUPER_ADMIN');
    } else {
      setActiveTab('HOSPITAL');
    }
  }, [activeRole]);

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* Unified Perspective Switcher Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 sm:p-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm text-xs font-mono text-slate-800 dark:text-slate-200">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider px-2">
            OVERVIEW PERSPECTIVE:
          </span>

          {/* 1. Hospital Operations View - Removed from Nurse Dashboard */}
          {activeRole !== 'NURSE' && (
            <button
              onClick={() => setActiveTab('HOSPITAL')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'HOSPITAL'
                  ? 'bg-teal-700 text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Hospital Operations</span>
            </button>
          )}

          {/* 2. Doctor Workstation View - Removed from Nurse Dashboard */}
          {activeRole !== 'NURSE' && (
            <button
              onClick={() => setActiveTab('DOCTOR')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'DOCTOR'
                  ? 'bg-teal-700 text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Doctor Workstation</span>
            </button>
          )}

          {/* 3. Nursing Cockpit View - Removed from Doctor Dashboard */}
          {activeRole !== 'DOCTOR' && (
            <button
              onClick={() => setActiveTab('NURSE')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'NURSE'
                  ? 'bg-teal-700 text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5" />
              <span>Nursing Cockpit</span>
            </button>
          )}

          {/* 4. Super Admin State Network (if super admin) */}
          {(activeRole === 'SUPER_ADMIN' || activeRole === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('SUPER_ADMIN')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'SUPER_ADMIN'
                  ? 'bg-teal-700 text-white shadow-sm font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>State Network (38 Districts)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 pr-2">
          <Link
            to="/command-center"
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-sm text-xs transition-all active:scale-95"
            title="Launch ICU Command Center (Live Bed Grid & Telemetry)"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Launch ICU Command Center</span>
          </Link>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">ACTIVE ROLE:</span>
          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800 text-[10px] font-bold">
            {activeRole === 'SUPER_ADMIN' ? 'COMMAND CENTER' : activeRole}
          </span>
        </div>
      </div>

      {/* Render the Active Dashboard Overview */}
      <div className="transition-all duration-200">
        {activeTab === 'HOSPITAL' && activeRole !== 'NURSE' && <HospitalAdminDashboardPage />}
        {activeTab === 'DOCTOR' && activeRole !== 'NURSE' && <DoctorOverviewPage />}
        {activeTab === 'NURSE' && activeRole !== 'DOCTOR' && <NurseOverviewPage />}
        {activeTab === 'SUPER_ADMIN' && <SuperAdminDashboardPage />}
      </div>
    </div>
  );
};

export default DashboardOverviewPage;
