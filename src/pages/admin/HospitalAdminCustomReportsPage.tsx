import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setDateRangeFilter, logActivity } from '../../store/slices/hospitalAdminSlice';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  Filter,
  Users,
  Building2,
  Bed,
  Activity,
  Lock,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Search,
  X
} from 'lucide-react';

export const HospitalAdminCustomReportsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dateFilter, hospitalName, hospitalCode, doctors, nurses, icus, beds, encounters, remarks, shifts } = useAppSelector(
    state => state.hospitalAdmin
  );

  const [fromDate, setFromDate] = useState(dateFilter.fromDate);
  const [toDate, setToDate] = useState(dateFilter.toDate);
  const [icuFilter, setIcuFilter] = useState(dateFilter.icuFilter);
  const [activeReportTab, setActiveReportTab] = useState<
    'STAFF' | 'ICU' | 'PATIENTS' | 'CLINICAL' | 'OPERATIONAL' | 'SYSTEM'
  >('STAFF');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleApplyDateRange = () => {
    dispatch(setDateRangeFilter({ fromDate, toDate, icuFilter }));
    dispatch(
      logActivity({
        action: 'REPORT_GENERATION',
        entity: `Custom Date Range Report (${fromDate} to ${toDate})`,
        details: `Generated administrative report console for hospital ${hospitalCode}`
      })
    );
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['AIIMS Patna & Critical Care Center (AIIMS-PAT-01) Administrative KPI Report'],
      [`Date Range: ${fromDate} to ${toDate}`],
      [''],
      ['Metric', 'Value', 'Unit'],
      ['Total Admissions', '38', 'Patients'],
      ['ICU Occupancy Rate', '85%', 'Percent'],
      ['Average Length of Stay (ALOS)', '4.8', 'Days'],
      ['Discharge Rate', '92%', 'Percent'],
      ['Clinical Encounters Logged', encounters.length.toString(), 'Encounters'],
      ['Locked Clinical Remarks', remarks.length.toString(), 'Remarks'],
      ['Bed Turnaround Time', '42', 'Minutes'],
      ['Staff On Duty', shifts.filter(s => s.status === 'ON DUTY').length.toString(), 'Staff'],
      ['Critical Alert Resolution Rate', '98.4%', 'Percent'],
      ['Telemetry & Device Uptime', '99.9%', 'Percent']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hospital_Report_${hospitalCode}_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    dispatch(
      logActivity({
        action: 'REPORT_EXPORT',
        entity: `CSV Export (${fromDate} to ${toDate})`,
        details: `Downloaded CSV KPI summary file for ${hospitalCode}`
      })
    );
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-mono font-bold rounded border border-teal-200 dark:border-teal-800">
              Custom Date Range Reporting ({hospitalCode})
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold rounded border border-emerald-200 dark:border-emerald-800">
              Real-time KPI Engine Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Hospital Operational & Administrative Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-dimensional reporting console for {hospitalName} with CSV download & PDF print preview.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-teal-500/40 text-slate-800 dark:text-teal-300 text-xs font-mono font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Export CSV Data
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-mono font-bold px-4 py-2.5 rounded-xl shadow transition-all"
          >
            <Printer className="w-4 h-4" /> Print PDF Report
          </button>
        </div>
      </div>

      {/* Date Range Selection & Filter Control Panel */}
      <div className="bg-gradient-to-r from-slate-100 via-white to-teal-50 dark:from-slate-800 dark:via-slate-800/90 dark:to-teal-950/40 border border-teal-200 dark:border-teal-500/30 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* From Date */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-mono shadow-xs">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400 font-bold">From Date:</span>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            />
          </div>

          {/* To Date */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-mono shadow-xs">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400 font-bold">To Date:</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            />
          </div>

          {/* ICU Filter */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-mono shadow-xs">
            <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-600 dark:text-slate-400 font-bold">ICU Filter:</span>
            <select
              value={icuFilter}
              onChange={e => setIcuFilter(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All ICUs</option>
              {icus.map(i => (
                <option key={i.id} value={i.id}>{i.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleApplyDateRange}
          className="w-full md:w-auto bg-teal-600 hover:bg-teal-500 text-white font-mono font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all"
        >
          Update Report KPIs
        </button>
      </div>

      {/* 10 Real-Time KPI Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Admissions */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">1. Total Admissions</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">38 <span className="text-xs font-normal text-teal-700 dark:text-teal-300 font-mono">Patients</span></div>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono block">Selected Period</span>
        </div>

        {/* KPI 2: Occupancy Rate */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">2. ICU Occupancy Rate</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">85%</div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono block">41 / 48 Beds Occupied</span>
        </div>

        {/* KPI 3: ALOS */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">3. Avg Length of Stay</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">4.8 <span className="text-xs font-normal text-emerald-700 dark:text-emerald-300 font-mono">Days</span></div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">Optimal Benchmark</span>
        </div>

        {/* KPI 4: Discharge Rate */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">4. Discharge Rate</span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-300">92%</div>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono block">Step-down Transfers</span>
        </div>

        {/* KPI 5: Clinical Encounters */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">5. Clinical Encounters</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{encounters.length}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block">Logged Encounters</span>
        </div>

        {/* KPI 6: Locked Remarks */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">6. Locked Remarks</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{remarks.length}</div>
          <span className="text-[10px] text-rose-700 dark:text-rose-300 font-mono block">Immutable Evaluations</span>
        </div>

        {/* KPI 7: Bed Turnaround */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">7. Bed Turnaround</span>
          <div className="text-2xl font-black text-teal-600 dark:text-teal-300">42 <span className="text-xs font-normal text-teal-700 dark:text-teal-200 font-mono">Mins</span></div>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono block">Sanitization Speed</span>
        </div>

        {/* KPI 8: Staff Shift Coverage */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">8. Staff On Duty</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{shifts.filter(s => s.status === 'ON DUTY').length}</div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono block">Active Shift Staff</span>
        </div>

        {/* KPI 9: Alert Resolution */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">9. Alert Resolution</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">98.4%</div>
          <span className="text-[10px] text-amber-700 dark:text-amber-300 font-mono block">Avg &lt; 3 Mins</span>
        </div>

        {/* KPI 10: Device Uptime */}
        <div className="bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-4 rounded-xl space-y-1 shadow-sm">
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">10. Telemetry Uptime</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">99.9%</div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-mono block">Continuous Hub Sync</span>
        </div>
      </div>

      {/* Sub-Reports Console Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveReportTab('STAFF')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
              activeReportTab === 'STAFF' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Staff Reports ({doctors.length + nurses.length})
          </button>
          <button
            onClick={() => setActiveReportTab('ICU')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
              activeReportTab === 'ICU' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ICU Reports ({icus.length})
          </button>
          <button
            onClick={() => setActiveReportTab('PATIENTS')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
              activeReportTab === 'PATIENTS' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Patient Reports
          </button>
          <button
            onClick={() => setActiveReportTab('CLINICAL')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
              activeReportTab === 'CLINICAL' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Clinical Activity Reports
          </button>
          <button
            onClick={() => setActiveReportTab('OPERATIONAL')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
              activeReportTab === 'OPERATIONAL' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Operational Shift Reports
          </button>
          <button
            onClick={() => setActiveReportTab('SYSTEM')}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-bold shrink-0 transition-all ${
              activeReportTab === 'SYSTEM' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            System & Device Reports
          </button>
        </div>

        {/* Tab Content Display */}
        {activeReportTab === 'STAFF' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-mono uppercase tracking-wider">
              Staff Distribution & Workload Report ({fromDate} to {toDate})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-teal-700 dark:text-teal-300 font-mono block">Doctors Roster Breakdown</span>
                <p className="text-slate-700 dark:text-slate-300">12 Doctors registered across MICU, SICU, CICU, NICU. Average assigned workload: 3.2 patients / doctor.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono block">Nursing Staff Breakdown</span>
                <p className="text-slate-700 dark:text-slate-300">28 Nurses (4 Nurse Leads, 24 ICU Staff Nurses). Nurse-to-Patient ratio maintained at 1:1.5 in critical units.</p>
              </div>
            </div>
          </div>
        )}

        {activeReportTab === 'ICU' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-mono uppercase tracking-wider">
              ICU Unit Performance & Occupancy Analytics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {icus.map(icu => (
                <div key={icu.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{icu.name}</span>
                    <span className="font-mono text-teal-700 dark:text-teal-300 font-bold">{icu.code}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 font-mono">
                    <span>Occupied: {icu.occupiedBeds} / {icu.totalBeds} Beds</span>
                    <span>Available: {icu.availableBeds} Beds</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeReportTab === 'PATIENTS' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-mono uppercase tracking-wider">
              Patient Admission & Length of Stay Report
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p>38 total patient admissions recorded during date range {fromDate} to {toDate}.</p>
              <p className="font-mono text-teal-700 dark:text-teal-300">Average length of stay: 4.8 Days. Readmission rate &lt; 2.1%.</p>
            </div>
          </div>
        )}

        {activeReportTab === 'CLINICAL' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-mono uppercase tracking-wider">
              Clinical Encounters & Locked Remarks Audit Summary
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p>{encounters.length} clinical encounters and {remarks.length} locked clinical remarks recorded.</p>
              <p className="text-rose-700 dark:text-rose-300 font-mono">All clinical remarks carry locked status flags enforcing hospital admin read-only access.</p>
            </div>
          </div>
        )}

        {activeReportTab === 'OPERATIONAL' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-mono uppercase tracking-wider">
              Operational Shift Schedule & Bed Turnaround Efficiency
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p>100% shift coverage maintained across Morning, Evening, and Night shifts.</p>
              <p className="text-emerald-700 dark:text-emerald-300 font-mono">Average bed turnaround time post-discharge: 42 Minutes.</p>
            </div>
          </div>
        )}

        {activeReportTab === 'SYSTEM' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm font-mono uppercase tracking-wider">
              System Health & Telemetry Telecommunications Log
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p>Telemetry uptime: 99.9% across 48 bedside monitors, ventilators, and infusion pumps.</p>
              <p className="text-teal-700 dark:text-teal-300 font-mono">Zero data packet drop recorded for hospital {hospitalCode}.</p>
            </div>
          </div>
        )}
      </div>

      {/* PDF Print Preview Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-teal-500/40 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-lg">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">PDF Print Preview Document</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{hospitalName} ({hospitalCode})</p>
                </div>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Box */}
            <div className="bg-slate-50 text-slate-900 p-6 rounded-xl space-y-4 font-sans text-xs border border-slate-200 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-slate-300 pb-4">
                <div>
                  <h1 className="text-lg font-black text-slate-900">{hospitalName}</h1>
                  <p className="text-xs text-slate-600">Hospital Code: {hospitalCode} • Command Center Report</p>
                </div>
                <div className="text-right text-[10px] font-mono text-slate-500">
                  <div>Date Range: {fromDate} to {toDate}</div>
                  <div>Generated: {new Date().toLocaleString()}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Key Executive Indicators</h3>
                <div className="grid grid-cols-2 gap-2 text-xs border border-slate-300 p-3 rounded bg-white">
                  <div>Total Admissions: <strong>38</strong></div>
                  <div>ICU Occupancy: <strong>85%</strong></div>
                  <div>Avg Length of Stay: <strong>4.8 Days</strong></div>
                  <div>Discharge Rate: <strong>92%</strong></div>
                  <div>Clinical Encounters: <strong>{encounters.length}</strong></div>
                  <div>Locked Remarks: <strong>{remarks.length}</strong></div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Governance Statement</h3>
                <p className="text-[11px] text-slate-600 italic">
                  This administrative report is strictly scoped to assigned hospital {hospitalCode}. Clinical decisions and remarks remain locked under read-only state platform rules.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-mono text-xs border border-slate-200 dark:border-slate-700"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                  setIsPrintModalOpen(false);
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold font-mono text-xs rounded-xl shadow"
              >
                Send to Printer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
