import React, { useState } from 'react';

export const Governance360Page: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Summary');
  const tabs = ['Summary', 'Timeline', 'Clinical Context', 'Risk', 'Audit', 'Actions', 'Evidence'];

  return (
    <div className="space-y-6">
      {/* Top Header Bar inside App */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight font-sans">
          Governance 360 - Incident INC-2026-102
        </h2>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200">
            Hospital: Patna
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full border border-emerald-200">
            Dr. Admin
          </span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs font-medium text-slate-500 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-[#00a896] text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Patient Profile Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-teal-700 font-bold text-lg flex items-center justify-center border border-slate-200 shrink-0">
            AM
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">Aarav Kumar</h3>
            <p className="text-xs font-medium text-slate-500">ICU-04 | Bed 7</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 bg-rose-100 text-rose-700 font-bold text-xs rounded-full border border-rose-200">
            CRITICAL
          </span>
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-medium text-xs rounded-full border border-amber-200">
            Ventilated
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 font-medium text-xs rounded-full border border-blue-200">
            LOS 3d
          </span>
          <span className="text-xs font-mono text-slate-400 ml-2">
            MRN 2026-00417
          </span>
        </div>
      </div>

      {/* 2 Columns: SUMMARY & CONNECTED EVIDENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: SUMMARY */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
              SUMMARY
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Medication incident during ICU stay. Contained within 2 minutes. Investigation assigned.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <span className="px-4 py-1.5 bg-amber-100 text-amber-800 font-bold text-xs rounded-full border border-amber-200">
              Moderate
            </span>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-800 font-bold text-xs rounded-full border border-blue-200">
              Under review
            </span>
          </div>
        </div>

        {/* Right Column: CONNECTED EVIDENCE */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">
            CONNECTED EVIDENCE
          </h3>
          <div className="space-y-2 text-xs font-sans text-slate-700">
            <div className="py-1">1 linked patient</div>
            <div className="py-1">1 risk</div>
            <div className="py-1">2 actions</div>
            <div className="py-1">1 audit finding</div>
            <div className="py-1">3 attachments</div>
          </div>
        </div>
      </div>

      {/* Bottom Full-Width Button */}
      <div className="pt-2">
        <button className="w-full py-4 bg-[#00a896] hover:bg-[#009484] text-white font-bold text-xs rounded-2xl transition-all shadow-sm">
          Open linked records without losing incident context
        </button>
      </div>
    </div>
  );
};

export default Governance360Page;
