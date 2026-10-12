import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePatient } from '../../hooks/usePatient';
import { MOCK_CHANGES } from '../../data/mockData';
import { ChangeVisualization } from '../../components/svg/ChangeVisualization';
import { ChangeItem } from '../../types/icu';
import { TrendingUp, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const ChangeReviewPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const { patient } = usePatient(patientId);
  const [changesList, setChangesList] = useState<ChangeItem[]>(MOCK_CHANGES);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredChanges = changesList.filter((c: ChangeItem) => {
    if (activeCategory === 'ALL') return true;
    return c.category === activeCategory;
  });

  const handleAcknowledge = (id: string) => {
    setChangesList((prev: ChangeItem[]) => prev.filter((c: ChangeItem) => c.id !== id));
  };

  const handleDismissAll = () => {
    setChangesList([]);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold bg-red-800 text-white px-2.5 py-1 rounded-lg">
              {changesList.length} ACTIVE FLAGS
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Change Review & AI Flag Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dedicated physician interface for reviewing system-generated flags and acknowledging or dismissing automated clinical alerts for {patient?.name || 'Ramesh Gupta'} ({patient?.bedNumber || 'ICU-04'}).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-2 rounded-xl text-xs font-mono font-bold text-amber-900">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Last Review: {patient?.lastReviewTime || '11:30 AM'}</span>
        </div>
      </div>

      {/* Explainable AI Flag Banner */}
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-900 shrink-0" />
          <div>
            <strong className="block font-bold">Explainable AI Flag Pattern Detected:</strong>
            <span>"Sustained tachycardia (HR 112 bpm) preceding drop in MAP (69 mmHg) and desaturation (SpO2 89%)."</span>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs & Dismiss Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          {['ALL', 'VITALS', 'VENTILATOR', 'INFUSIONS', 'LABS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeCategory === cat
                  ? 'bg-blue-900 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat} {cat === 'ALL' ? `(${changesList.length})` : ''}
            </button>
          ))}
        </div>

        {changesList.length > 0 && (
          <button
            onClick={handleDismissAll}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Acknowledge All Clinical Alerts</span>
          </button>
        )}
      </div>

      {/* Change Cards Grid */}
      {filteredChanges.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">All Alerts Acknowledged</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no unreviewed physiological flags pending for this patient.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredChanges.map((change: ChangeItem) => (
            <div key={change.id} className="relative group">
              <ChangeVisualization change={change as any} />
              <div className="mt-2 flex items-center justify-end gap-2 text-xs font-mono">
                <button
                  onClick={() => handleAcknowledge(change.id)}
                  className="px-3 py-1.5 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 transition-colors shadow-xs flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledge</span>
                </button>
                <button
                  onClick={() => handleAcknowledge(change.id)}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-300 transition-colors flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
