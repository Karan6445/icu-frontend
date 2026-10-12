import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck, Sparkles, Layers } from 'lucide-react';

export const AdminExportPage: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState<'Patients' | 'Doctors' | 'Nurses' | 'Reports'>('Patients');
  const [selectedFormat, setSelectedFormat] = useState<'Excel' | 'CSV' | 'PDF'>('PDF');
  const [dateRange, setDateRange] = useState('ALL');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleTriggerExport = () => {
    setDownloading(true);
    setDownloadSuccess(false);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12 font-sans selection:bg-[#10B981] selection:text-white max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#D1D5DB] shadow-sm">
        <div>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-[#0F766E] font-mono text-xs font-bold rounded-full">
            EXPORT DATA
          </span>
          <h1 className="text-3xl font-black text-slate-900 mt-2">Enterprise Data Export Engine</h1>
          <p className="text-xs text-slate-500">Export structured data across Patients, Doctors, Nurses, and Reports into Excel, CSV, or PDF formats.</p>
        </div>
      </div>

      <div className="bg-white border border-[#D1D5DB] rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
        {/* Step 1: Select Export Module */}
        <div className="space-y-3">
          <label className="block text-slate-700 font-mono text-xs uppercase font-bold">1. Select Target Export Module</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['Patients', 'Doctors', 'Nurses', 'Reports'] as const).map(mod => (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                className={`p-4 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  selectedModule === mod
                    ? 'bg-[#0F766E] border-[#0F766E] text-white shadow-xs'
                    : 'bg-slate-50 border-[#D1D5DB] text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className={`w-5 h-5 mx-auto mb-2 ${selectedModule === mod ? 'text-white' : 'text-[#0F766E]'}`} />
                <span>{mod} Data</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Format */}
        <div className="space-y-3">
          <label className="block text-slate-700 font-mono text-xs uppercase font-bold">2. Select Export Format</label>
          <div className="grid grid-cols-3 gap-3">
            {(['Excel', 'CSV', 'PDF'] as const).map(fmt => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`p-4 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                  selectedFormat === fmt
                    ? 'bg-[#10B981] border-[#059669] text-white shadow-xs'
                    : 'bg-slate-50 border-[#D1D5DB] text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt === 'Excel' && <FileSpreadsheet className={`w-6 h-6 mx-auto mb-2 ${selectedFormat === fmt ? 'text-white' : 'text-emerald-600'}`} />}
                {fmt === 'CSV' && <FileText className={`w-6 h-6 mx-auto mb-2 ${selectedFormat === fmt ? 'text-white' : 'text-amber-600'}`} />}
                {fmt === 'PDF' && <FileText className={`w-6 h-6 mx-auto mb-2 ${selectedFormat === fmt ? 'text-white' : 'text-rose-600'}`} />}
                <span>{fmt} Format</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Date Range */}
        <div className="space-y-3">
          <label className="block text-slate-700 font-mono text-xs uppercase font-bold">3. Select Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full bg-slate-50 border border-[#D1D5DB] rounded-xl p-3 text-slate-900 text-xs font-mono font-bold focus:border-[#0F766E] focus:outline-none"
          >
            <option value="ALL">All Available Time History</option>
            <option value="TODAY">Today Only</option>
            <option value="THIS_WEEK">Current Week</option>
            <option value="THIS_MONTH">Current Month (September 2026)</option>
          </select>
        </div>

        {/* Success / Loading Banner */}
        {downloadSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <span>Export file <strong>Naimify_{selectedModule}_{selectedFormat}_Report.pdf</strong> successfully generated!</span>
            </div>
            <span className="text-[10px] text-emerald-700 underline font-bold cursor-pointer">Download File</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            disabled={downloading}
            onClick={handleTriggerExport}
            className="px-8 py-3.5 bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Compiling Export File...' : `Export ${selectedModule} as ${selectedFormat}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
