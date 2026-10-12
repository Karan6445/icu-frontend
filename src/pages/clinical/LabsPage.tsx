import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  Filter, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  X, 
  History, 
  Download,
  Calendar,
  Layers,
  Activity
} from 'lucide-react';

interface LabResult {
  id: string;
  test: string;
  category: 'ABG' | 'CBC' | 'CHEMISTRY' | 'COAGULATION' | 'CARDIAC';
  value: number | string;
  unit: string;
  reference: string;
  abnormal: boolean;
  critical: boolean;
  collectedTime: string;
  reportedTime: string;
  status: 'FINAL' | 'CORRECTED' | 'PRELIMINARY';
  source: string;
  history?: { timestamp: string; value: string; amendedBy: string; reason: string }[];
  trend: number[];
}

export const LabsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedLab, setSelectedLab] = useState<LabResult | null>(null);

  const labResults: LabResult[] = [
    {
      id: 'LAB-01',
      test: 'Arterial Blood Gas: Lactate',
      category: 'ABG',
      value: 3.8,
      unit: 'mmol/L',
      reference: '0.5 - 2.0',
      abnormal: true,
      critical: true,
      collectedTime: '12:15 UTC+5:30',
      reportedTime: '12:28 UTC+5:30',
      status: 'FINAL',
      source: 'Radiometer ABL90 FLEX (Point of Care)',
      trend: [1.8, 2.1, 2.9, 3.4, 3.8]
    },
    {
      id: 'LAB-02',
      test: 'Arterial Blood Gas: pH',
      category: 'ABG',
      value: 7.28,
      unit: '',
      reference: '7.35 - 7.45',
      abnormal: true,
      critical: true,
      collectedTime: '12:15 UTC+5:30',
      reportedTime: '12:28 UTC+5:30',
      status: 'FINAL',
      source: 'Radiometer ABL90 FLEX',
      trend: [7.38, 7.35, 7.31, 7.29, 7.28]
    },
    {
      id: 'LAB-03',
      test: 'Arterial Blood Gas: PaO2 / FiO2 Ratio',
      category: 'ABG',
      value: 148,
      unit: 'mmHg',
      reference: '> 300',
      abnormal: true,
      critical: true,
      collectedTime: '12:15 UTC+5:30',
      reportedTime: '12:28 UTC+5:30',
      status: 'FINAL',
      source: 'Radiometer ABL90 FLEX',
      trend: [220, 190, 165, 150, 148]
    },
    {
      id: 'LAB-04',
      test: 'White Blood Cell Count (WBC)',
      category: 'CBC',
      value: 18.6,
      unit: '10^3/uL',
      reference: '4.5 - 11.0',
      abnormal: true,
      critical: false,
      collectedTime: '08:00 UTC+5:30',
      reportedTime: '09:12 UTC+5:30',
      status: 'FINAL',
      source: 'Sysmex XN-1000 Central Hematology',
      trend: [11.2, 14.5, 17.1, 18.6]
    },
    {
      id: 'LAB-05',
      test: 'Serum Potassium (K+)',
      category: 'CHEMISTRY',
      value: 5.6,
      unit: 'mEq/L',
      reference: '3.5 - 5.0',
      abnormal: true,
      critical: true,
      collectedTime: '08:00 UTC+5:30',
      reportedTime: '09:15 UTC+5:30',
      status: 'CORRECTED',
      source: 'Roche Cobas 8000 Central Chem',
      history: [
        { timestamp: '09:15', value: '6.2 mEq/L (Hemolyzed)', amendedBy: 'Dr. C. Roy (Pathologist)', reason: 'Sample repeated due to in-vitro hemolysis' },
        { timestamp: '09:40', value: '5.6 mEq/L', amendedBy: 'Dr. C. Roy (Pathologist)', reason: 'Confirmed true value on repeat draw' }
      ],
      trend: [4.2, 4.5, 5.1, 5.6]
    },
    {
      id: 'LAB-06',
      test: 'High-Sensitivity Troponin-I',
      category: 'CARDIAC',
      value: 12.4,
      unit: 'ng/L',
      reference: '< 14.0',
      abnormal: false,
      critical: false,
      collectedTime: '08:00 UTC+5:30',
      reportedTime: '09:20 UTC+5:30',
      status: 'FINAL',
      source: 'Abbott Architect i2000SR',
      trend: [8.2, 9.4, 11.0, 12.4]
    },
    {
      id: 'LAB-07',
      test: 'Serum Creatinine',
      category: 'CHEMISTRY',
      value: 2.1,
      unit: 'mg/dL',
      reference: '0.7 - 1.3',
      abnormal: true,
      critical: false,
      collectedTime: '08:00 UTC+5:30',
      reportedTime: '09:15 UTC+5:30',
      status: 'FINAL',
      source: 'Roche Cobas 8000 Central Chem',
      trend: [1.1, 1.4, 1.8, 2.1]
    },
    {
      id: 'LAB-08',
      test: 'Platelet Count',
      category: 'CBC',
      value: 94,
      unit: '10^3/uL',
      reference: '150 - 450',
      abnormal: true,
      critical: true,
      collectedTime: '08:00 UTC+5:30',
      reportedTime: '09:12 UTC+5:30',
      status: 'FINAL',
      source: 'Sysmex XN-1000 Central Hematology',
      trend: [180, 142, 110, 94]
    }
  ];

  const filteredLabs = labResults.filter(item => {
    if (criticalOnly && !item.critical) return false;
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.test.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* SCREEN 09: HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-800 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-teal-800 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-widest">
              SCREEN 09
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              HL7 ORU / FHIR Observation Engine · Encounter ENC-90821
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Diagnostic Laboratory & Arterial Blood Gas (ABG)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Real-time HL7/LIS mapping, critical rule validation & longitudinal trend visualization.
          </p>
        </div>

        {/* TOOLBAR: Test search; date; critical only */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Critical Only Toggle */}
          <button
            onClick={() => setCriticalOnly(!criticalOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold border transition-all ${
              criticalOnly
                ? 'bg-rose-600 border-rose-500 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-300" />
            <span>CRITICAL ONLY ({labResults.filter(l => l.critical).length})</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search lab test or panel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-teal-600 text-slate-900 dark:text-white w-48 sm:w-56 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs font-mono font-bold shadow-xs">
        {['ALL', 'ABG', 'CBC', 'CHEMISTRY', 'CARDIAC', 'COAGULATION'].map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 rounded-lg transition-all ${
              categoryFilter === cat
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* MAIN LAYOUT: Table + Selected Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Table: Test; value; unit; reference; abnormal; critical; times */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">Test Name</th>
                  <th className="p-3.5">Result Value</th>
                  <th className="p-3.5">Ref Range</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Collected</th>
                  <th className="p-3.5">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredLabs.map((lab) => {
                  const isSelected = selectedLab?.id === lab.id;
                  return (
                    <tr
                      key={lab.id}
                      onClick={() => setSelectedLab(lab)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-slate-900 dark:text-white font-semibold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <td className="p-3.5 font-bold">
                        <div className="flex items-center gap-2">
                          {lab.critical && (
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
                          )}
                          <span className="text-slate-900 dark:text-white">{lab.test}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block">{lab.category}</span>
                      </td>

                      <td className="p-3.5 font-mono">
                        <span className={`text-sm font-black ${
                          lab.critical 
                            ? 'text-rose-600 dark:text-rose-400' 
                            : lab.abnormal 
                            ? 'text-amber-600 dark:text-amber-400' 
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {lab.value}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">{lab.unit}</span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {lab.reference} {lab.unit}
                      </td>

                      <td className="p-3.5 font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                          lab.status === 'CORRECTED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                            : 'bg-slate-100 text-teal-800 border-slate-200 dark:bg-slate-800 dark:text-teal-300 dark:border-slate-700'
                        }`}>
                          {lab.status}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {lab.collectedTime}
                      </td>

                      <td className="p-3.5">
                        <button className="text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 font-mono text-[11px] font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT DRAWER / TREND PANEL: Source; status; corrected history; trend graph */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between text-xs space-y-4">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="font-mono font-bold text-teal-700 dark:text-teal-400 uppercase text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                LONGITUDINAL TEST TREND
              </span>
              {selectedLab && (
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">
                  {selectedLab.id}
                </span>
              )}
            </div>

            {selectedLab ? (
              <div className="space-y-4 mt-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{selectedLab.test}</h3>
                  <div className="flex items-baseline gap-2 font-mono mt-1">
                    <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{selectedLab.value}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{selectedLab.unit}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">(Ref: {selectedLab.reference})</span>
                  </div>
                </div>

                {/* Trend Bars Visualization */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold block">
                    LAST 5 MEASUREMENTS (TREND TRAJECTORY)
                  </span>
                  <div className="h-24 flex items-end justify-between gap-2 pt-2 px-2">
                    {selectedLab.trend.map((val, idx) => {
                      const maxVal = Math.max(...selectedLab.trend, 1);
                      const heightPercent = Math.min(100, Math.round((val / maxVal) * 80) + 20);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[9px] font-mono text-slate-700 dark:text-slate-300 font-bold">{val}</span>
                          <div
                            className={`w-full rounded-t-md transition-all duration-300 ${
                              idx === selectedLab.trend.length - 1 ? 'bg-rose-500' : 'bg-teal-600'
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className="text-[8px] font-mono text-slate-400 dark:text-slate-500">T-{selectedLab.trend.length - 1 - idx}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Source & Instrument Details */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">ANALYZER / LIS SOURCE</span>
                    <span className="text-slate-900 dark:text-white font-bold">{selectedLab.source}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">VALIDATION STATUS</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">HL7 ACKNOWLEDGED / VERIFIED</span>
                  </div>
                </div>

                {/* Corrected History Audit */}
                {selectedLab.history && (
                  <div className="bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                      <History className="w-3 h-3" />
                      CORRECTED RESULT AUDIT TRAIL
                    </span>
                    <div className="space-y-1.5 text-[10px] font-mono">
                      {selectedLab.history.map((h, i) => (
                        <div key={i} className="p-2 rounded bg-white dark:bg-slate-900 border border-amber-200 dark:border-slate-800 shadow-2xs">
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span>{h.timestamp}</span>
                            <span className="text-amber-700 dark:text-amber-300 font-bold">{h.amendedBy}</span>
                          </div>
                          <span className="text-slate-900 dark:text-white font-semibold block mt-0.5">{h.value}</span>
                          <span className="text-slate-500 block text-[9px] mt-0.5">Reason: {h.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
                Select any test row to inspect its longitudinal trend and corrected audit history.
              </div>
            )}
          </div>

          <button
            onClick={() => alert('Diagnostic PDF report with cryptographic timestamp exported.')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Verified Diagnostic PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabsPage;
