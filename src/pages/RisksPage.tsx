import React from 'react';
import { ShieldAlert, Activity, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const RisksPage: React.FC = () => {
  const risks = [
    { id: 'R-021', risk: 'Ventilator dependency prolongment', score: 16, level: 'High Risk', owner: 'Dr. Mehta', review: '30 Sep 2026' },
    { id: 'R-018', risk: 'Medication storage temperature deviation', score: 9, level: 'Medium Risk', owner: 'Pharm Lead', review: '25 Sep 2026' },
    { id: 'R-014', risk: 'Staffing shortage - night shift', score: 12, level: 'High Risk', owner: 'Nursing Dir.', review: '20 Sep 2026' },
    { id: 'R-011', risk: 'Infection control protocol compliance', score: 6, level: 'Medium Risk', owner: 'IPC Lead', review: '05 Oct 2026' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
              ICU Risk Register & Predictive AI Safety Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Predictive acuity risk scoring, likelihood x impact matrix modeling, control effectiveness, and board assurance.
          </p>
        </div>
      </div>

      {/* Risk Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider font-mono">
              <tr>
                <th className="py-4 px-6">Risk ID</th>
                <th className="py-4 px-6">Risk Description</th>
                <th className="py-4 px-6">Score</th>
                <th className="py-4 px-6">Classification</th>
                <th className="py-4 px-6">Accountable Owner</th>
                <th className="py-4 px-6">Review Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-sans">
              {risks.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-purple-600 dark:text-purple-400">{r.id}</td>
                  <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{r.risk}</td>
                  <td className="py-4 px-6 font-mono font-bold text-base">{r.score}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      r.level.includes('High') ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {r.level}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{r.owner}</td>
                  <td className="py-4 px-6 font-mono text-slate-500">{r.review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RisksPage;
