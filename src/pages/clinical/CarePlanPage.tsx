import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Target, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';

interface CarePlanItem {
  id: string;
  problem: string;
  problemPriority: 'HIGH' | 'MEDIUM' | 'LOW';
  problemStatus: 'ACTIVE' | 'RESOLVING' | 'RESOLVED';
  goal: string;
  goalTarget: string;
  goalDue: string;
  action: string;
  actionOwner: string;
  actionDue: string;
  actionStatus: 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  outcomeResult: string;
  outcomeEvidence: string;
}

export const CarePlanPage: React.FC = () => {
  const [carePlan, setCarePlan] = useState<CarePlanItem[]>([
    {
      id: 'CP-01',
      problem: 'Acute Respiratory Distress Syndrome (ARDS) secondary to Severe Pneumonia',
      problemPriority: 'HIGH',
      problemStatus: 'ACTIVE',
      goal: 'Improve oxygenation and achieve PaO2/FiO2 ratio > 200 with lung-protective ventilation',
      goalTarget: 'PaO2/FiO2 > 200 mmHg, Pplat < 30 cmH2O',
      goalDue: 'Next 24 Hours',
      action: 'Protocolized prone positioning for 16 hours daily + Hamilton PRVC low tidal volume (6 mL/kg PBW).',
      actionOwner: 'Dr. Anand Verma (Lead Intensivist)',
      actionDue: 'Today 20:00',
      actionStatus: 'IN_PROGRESS',
      outcomeResult: 'PaO2/FiO2 improved from 120 to 148 mmHg post 1st prone cycle.',
      outcomeEvidence: 'Serial ABG at 08:00 & 12:15 UTC+5:30'
    },
    {
      id: 'CP-02',
      problem: 'Septic Shock with Vasodilatory Hypotension',
      problemPriority: 'HIGH',
      problemStatus: 'RESOLVING',
      goal: 'Maintain Mean Arterial Pressure (MAP) >= 65 mmHg while de-escalating norepinephrine infusion',
      goalTarget: 'MAP >= 65 mmHg on Norepinephrine < 0.05 mcg/kg/min',
      goalDue: 'Today 18:00',
      action: 'Dynamic fluid responsiveness assessment (PLR / VTI) + stress-dose hydrocortisone if refractory.',
      actionOwner: 'RN Vikram Singh (Primary ICU Nurse)',
      actionDue: 'Today 16:00',
      actionStatus: 'IN_PROGRESS',
      outcomeResult: 'Lactate clearing (3.8 -> 2.6 mmol/L). Capillary refill time normalized to < 2 seconds.',
      outcomeEvidence: 'LIS Lactate trend and Arterial Line trace'
    },
    {
      id: 'CP-03',
      problem: 'Ventilator-Associated Complications & Delirium Risk',
      problemPriority: 'MEDIUM',
      problemStatus: 'ACTIVE',
      goal: 'Perform daily Spontaneous Awakening Trial (SAT) and maintain CAM-ICU negative',
      goalTarget: 'RASS score -1 to 0; successful SAT trial',
      goalDue: 'Daily 09:00',
      action: 'Lighten Propofol sedation daily at 07:00, early passive physiotherapy and head of bed elevation > 30°.',
      actionOwner: 'RN Priya Singh (ICU Nurse)',
      actionDue: 'Tomorrow 07:00',
      actionStatus: 'IN_PROGRESS',
      outcomeResult: 'Patient calm, follows simple commands on reduced sedation.',
      outcomeEvidence: 'CAM-ICU flowsheet assessment'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProblem, setNewProblem] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newAction, setNewAction] = useState('');
  const [newOwner, setNewOwner] = useState('Dr. Anand Verma');

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblem.trim() || !newGoal.trim() || !newAction.trim()) return;

    const newItem: CarePlanItem = {
      id: `CP-0${carePlan.length + 1}`,
      problem: newProblem,
      problemPriority: 'HIGH',
      problemStatus: 'ACTIVE',
      goal: newGoal,
      goalTarget: 'Achieve clinical target',
      goalDue: 'Next 24h',
      action: newAction,
      actionOwner: newOwner,
      actionDue: 'Next shift',
      actionStatus: 'IN_PROGRESS',
      outcomeResult: 'Pending reassessment',
      outcomeEvidence: 'Awaiting clinical data'
    };

    setCarePlan(prev => [newItem, ...prev]);
    setNewProblem('');
    setNewGoal('');
    setNewAction('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-12 select-none">
      {/* SCREEN 14: HEADER */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-slate-900 dark:text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 uppercase tracking-widest">
              SCREEN 14
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Rahul Sharma (42M) · Bed 04 · Encounter ENC-90821
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2">
            <span>Interdisciplinary Clinical Care Plan</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
            Systematic care pathway: Problem → Goal → Action/Intervention → Outcome with verified ownership.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-mono text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Care Plan Goal</span>
        </button>
      </div>

      {/* CARE PLAN MATRIX */}
      <div className="space-y-4">
        {carePlan.map(item => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-teal-400 dark:hover:border-teal-500/60 transition-all duration-200"
          >
            {/* Header: Problem and Status */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-black text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-teal-200 dark:border-slate-700">
                  {item.id}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40">
                  {item.problemPriority} PRIORITY
                </span>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{item.problem}</h3>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-black bg-teal-50 text-teal-800 border border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800">
                ● {item.problemStatus}
              </span>
            </div>

            {/* 4-Step Chain: Problem -> Goal -> Action -> Outcome */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. GOAL */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-teal-700 dark:text-teal-400 font-mono font-bold text-[11px]">
                  <Target className="w-3.5 h-3.5" />
                  <span>TARGET GOAL</span>
                </div>
                <p className="text-slate-800 dark:text-white font-medium leading-relaxed font-sans">{item.goal}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Target: <strong className="text-teal-700 dark:text-teal-300">{item.goalTarget}</strong></span>
                  <span className="text-amber-600 dark:text-amber-400">{item.goalDue}</span>
                </div>
              </div>

              {/* 2. ACTION / INTERVENTION */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-400 font-mono font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ACTION / INTERVENTION</span>
                </div>
                <p className="text-slate-800 dark:text-white font-medium leading-relaxed font-sans">{item.action}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>Owner: <strong className="text-sky-700 dark:text-sky-300">{item.actionOwner}</strong></span>
                  <span className="text-slate-500">{item.actionDue}</span>
                </div>
              </div>

              {/* 3. OUTCOME & EVIDENCE */}
              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[11px]">
                  <Award className="w-3.5 h-3.5" />
                  <span>MEASURED OUTCOME</span>
                </div>
                <p className="text-slate-800 dark:text-white font-medium leading-relaxed font-sans">{item.outcomeResult}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  <span>Evidence: <strong className="text-emerald-700 dark:text-emerald-300">{item.outcomeEvidence}</strong></span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CARE PLAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <h3 className="font-black text-base text-slate-900 dark:text-white mb-4">Add Problem / Goal to Care Plan</h3>
            <form onSubmit={handleAddPlan} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">CLINICAL PROBLEM</label>
                <input
                  type="text"
                  required
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  placeholder="e.g. Acute Kidney Injury Stage 2"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">MEASURABLE GOAL</label>
                <input
                  type="text"
                  required
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="e.g. Maintain urine output > 0.5 mL/kg/hr without nephrotoxic insults"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">PLANNED INTERVENTION (ACTION)</label>
                <textarea
                  required
                  rows={3}
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  placeholder="e.g. Avoid NSAIDs, optimize preload, monitor hourly urometer"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-mono text-slate-600 dark:text-slate-400 mb-1 font-bold">ASSIGNED CLINICAL OWNER</label>
                <input
                  type="text"
                  required
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
                >
                  Save to Care Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarePlanPage;
