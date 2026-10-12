import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle2, 
  FileSpreadsheet, 
  Building2,
  Stethoscope,
  Filter
} from 'lucide-react';
import { useRBAC } from '../../hooks/useRBAC';
import { MOCK_CLINICS, MOCK_DOCTORS, getStoredAppointments } from '../../data/mockEclinicData';

export const EClinicReportsPage: React.FC = () => {
  const { role, can } = useRBAC();
  const appointments = getStoredAppointments();
  const [dateRange, setDateRange] = useState('TODAY');

  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const inProgress = appointments.filter(a => a.status === 'IN_CONSULTATION').length;
  const waiting = appointments.filter(a => a.status === 'WAITING' || a.status === 'READY_FOR_DOCTOR').length;

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Token,Patient Name,MRN,Doctor,Date,Time,Status,Priority\n" +
      appointments.map(a => `${a.tokenNumber},"${a.patientName}",${a.patientMrn},"${a.doctorName}",${a.date},${a.time},${a.status},${a.priority}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eclinic_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              E-Clinic Operational & Clinical Analytics
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              AGGREGATED REPORT
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turnaround times, tele-consultation completion rates, specialist workloads, and patient volumes
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Encounters CSV</span>
        </button>
      </div>

      {/* 2. KPI METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold">
            <span>Total Encounters</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {appointments.length}
            </span>
            <span className="text-xs text-emerald-600 font-bold">+18% vs yesterday</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Across 3 E-Clinic nodes
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold">
            <span>Average Triage Wait</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
              16.4
            </span>
            <span className="text-xs text-slate-500 font-bold">Minutes</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Target SLA: &lt;20 mins
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold">
            <span>Completion Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              96.8%
            </span>
            <span className="text-xs text-emerald-600 font-bold">Optimal</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            {completed} of {appointments.length} concluded
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold">
            <span>Prescriptions Filed</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
              100%
            </span>
            <span className="text-xs text-slate-500 font-bold">Digital Rx</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            Zero paper prescription leak
          </span>
        </div>
      </div>

      {/* 3. PERFORMANCE BREAKDOWN BY NODE & DOCTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Node Performance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>E-Clinic Node Volumes</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Live Telemetry</span>
          </div>

          <div className="space-y-3">
            {MOCK_CLINICS.map(clinic => {
              const clinicAppointments = appointments.filter(a => a.clinicId === clinic.id);
              const count = clinicAppointments.length || 2;
              const percentage = Math.round((count / (appointments.length || 1)) * 100);

              return (
                <div key={clinic.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {clinic.clinicName}
                    </span>
                    <span className="font-mono text-slate-500">
                      {count} encounters ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Doctor Workload */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              <span>Specialist Consultation Volume</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Physician</span>
          </div>

          <div className="space-y-3">
            {MOCK_DOCTORS.map(doc => {
              const total = doc.todayAppointmentsCount;
              const seen = doc.completedTodayCount;
              const pct = Math.round((seen / (total || 1)) * 100);

              return (
                <div key={doc.doctorId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {doc.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {doc.specialty}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {seen} / {total} seen ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EClinicReportsPage;
