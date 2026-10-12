import React, { useState } from 'react';
import { 
  CheckSquare, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  X, 
  Calendar, 
  TrendingUp, 
  ChevronRight, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  AlertOctagon,
  ExternalLink
} from 'lucide-react';

export type ActionStatus = 'Not Started' | 'In Progress' | 'Under Review' | 'Completed' | 'Overdue';
export type ActionPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface MilestoneStep {
  title: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface ActionItemRecord {
  id: string;
  title: string;
  category: string;
  ownerName: string;
  ownerRole: string;
  ownerAvatar?: string;
  dueDate: string;
  priority: ActionPriority;
  status: ActionStatus;
  progressPercent: number; // 0-100
  sourceOrigin: string; // e.g., "INC-2026-104 (Medication Error)" or "AUD-2026-087 (VAP Audit)"
  milestones: MilestoneStep[];
  description: string;
}

export const INITIAL_ACTIONS: ActionItemRecord[] = [
  {
    id: 'ACT-2026-301',
    title: 'Enforce Dual-Nurse Smart Pump Verification Protocol',
    category: 'Medication Safety',
    ownerName: 'Priya Singh',
    ownerRole: 'Staff RN / Safety Lead',
    dueDate: '2026-09-22',
    priority: 'High',
    status: 'In Progress',
    progressPercent: 75,
    sourceOrigin: 'Incident INC-2026-104 (Norepinephrine Rate Error)',
    description: 'Update smart pump infusion guardrails configuration and institute mandatory dual-rn barcode scan verification on high-alert vasopressor infusions.',
    milestones: [
      { title: 'Draft Protocol Changes', date: '18 Sep 2026', completed: true, notes: 'Approved by Pharmacy Board' },
      { title: 'EHR Guardrails System Patch', date: '19 Sep 2026', completed: true, notes: 'Deployed to MICU gateway' },
      { title: 'Nursing Staff In-Service Training', date: '21 Sep 2026', completed: false, notes: 'Scheduled for morning shift' },
      { title: 'Verification Audit', date: '22 Sep 2026', completed: false }
    ]
  },
  {
    id: 'ACT-2026-302',
    title: 'Hamilton C6 Ventilator Display Firmware Patch Rollout',
    category: 'Equipment Safety',
    ownerName: 'Eng. Rajesh Vardhan',
    ownerRole: 'Biomedical Lead Engineer',
    dueDate: '2026-09-18', // Overdue
    priority: 'Critical',
    status: 'Overdue',
    progressPercent: 40,
    sourceOrigin: 'Incident INC-2026-103 (Ventilator Display Freeze)',
    description: 'Deploy firmware patch v3.2.4 across all 12 Hamilton C6 ventilators to prevent UI memory cache overflow freezes.',
    milestones: [
      { title: 'Vendor Patch Acquisition', date: '17 Sep 2026', completed: true },
      { title: 'Bench Simulation Testing', date: '17 Sep 2026', completed: true },
      { title: 'Deploy to Beds 1-6', date: '18 Sep 2026', completed: false, notes: 'Delayed due to high unit occupancy' },
      { title: 'Deploy to Beds 7-12', date: '19 Sep 2026', completed: false }
    ]
  },
  {
    id: 'ACT-2026-303',
    title: 'Bed Exit Sensor Calibration & Fall Risk Armband Protocol',
    category: 'Patient Safety',
    ownerName: 'Suresh Nair',
    ownerRole: 'Bedside RN',
    dueDate: '2026-09-24',
    priority: 'Medium',
    status: 'In Progress',
    progressPercent: 60,
    sourceOrigin: 'Incident INC-2026-102 (Patient Fall)',
    description: 'Recalibrate bed exit mat sensor sensitivity to Level 1 and mandate high-risk yellow armband placement upon admission.',
    milestones: [
      { title: 'Biomed Sensor Sensitivity Tuning', date: '17 Sep 2026', completed: true },
      { title: 'Yellow Armband Supply Restock', date: '19 Sep 2026', completed: true },
      { title: 'Nursing Checklist Audit', date: '24 Sep 2026', completed: false }
    ]
  },
  {
    id: 'ACT-2026-304',
    title: 'VAP Subglottic Suction Timer EHR Reminder Alert',
    category: 'Infection Control',
    ownerName: 'Anjali Deshmukh',
    ownerRole: 'Nurse Practitioner',
    dueDate: '2026-09-28',
    priority: 'Medium',
    status: 'Not Started',
    progressPercent: 10,
    sourceOrigin: 'Audit AUD-2026-087 (VAP Care Bundle)',
    description: 'Program automated Q4H subglottic suctioning pop-up alerts on nurse workstation terminals.',
    milestones: [
      { title: 'EHR Alert Rule Definition', date: '20 Sep 2026', completed: false },
      { title: 'Clinical Testing in MICU', date: '25 Sep 2026', completed: false },
      { title: 'Go-Live Deployment', date: '28 Sep 2026', completed: false }
    ]
  },
  {
    id: 'ACT-2026-300',
    title: 'Hand Hygiene Station Alcohol Gel Automated Sensor Refill',
    category: 'Infection Control',
    ownerName: 'Dr. Ananya Roy',
    ownerRole: 'Infection Control Lead',
    dueDate: '2026-09-15',
    priority: 'Low',
    status: 'Completed',
    progressPercent: 100,
    sourceOrigin: 'Audit AUD-2026-088 (Hand Hygiene Audit)',
    description: 'Install low-level telemetry sensors on hand sanitizer dispensers to notify environmental services automatically.',
    milestones: [
      { title: 'Dispenser Telemetry Install', date: '12 Sep 2026', completed: true },
      { title: 'Gateway Connection Verification', date: '14 Sep 2026', completed: true },
      { title: 'Final Verification Sign-off', date: '15 Sep 2026', completed: true }
    ]
  }
];

export const ActionsPage: React.FC = () => {
  const [actions, setActions] = useState<ActionItemRecord[]>(INITIAL_ACTIONS);
  const [filterStatus, setFilterStatus] = useState<ActionStatus | 'ALL'>('ALL');
  const [filterPriority, setFilterPriority] = useState<ActionPriority | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionDetail, setSelectedActionDetail] = useState<ActionItemRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // New Action Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Medication Safety');
  const [newOwner, setNewOwner] = useState('Priya Singh (RN)');
  const [newOwnerRole, setNewOwnerRole] = useState('Staff RN / Safety Lead');
  const [newDueDate, setNewDueDate] = useState('2026-09-26');
  const [newPriority, setNewPriority] = useState<ActionPriority>('High');
  const [newSource, setNewSource] = useState('Clinical Governance Review');
  const [newDescription, setNewDescription] = useState('');

  const filteredActions = actions.filter((act) => {
    if (filterStatus !== 'ALL' && act.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && act.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = act.id.toLowerCase().includes(q);
      const matchTitle = act.title.toLowerCase().includes(q);
      const matchOwner = act.ownerName.toLowerCase().includes(q);
      const matchCat = act.category.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchOwner && !matchCat) return false;
    }
    return true;
  });

  // Calculate Metrics
  const totalActive = actions.filter(a => a.status !== 'Completed').length;
  const overdueCount = actions.filter(a => a.status === 'Overdue').length;
  const completedCount = actions.filter(a => a.status === 'Completed').length;
  const avgProgress = Math.round(actions.reduce((sum, a) => sum + a.progressPercent, 0) / actions.length);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: ActionItemRecord = {
      id: `ACT-2026-${Math.floor(300 + Math.random() * 600)}`,
      title: newTitle || 'Corrective Safety Plan Item',
      category: newCategory,
      ownerName: newOwner,
      ownerRole: newOwnerRole,
      dueDate: newDueDate,
      priority: newPriority,
      status: 'In Progress',
      progressPercent: 25,
      sourceOrigin: newSource,
      description: newDescription || 'Standard CAPA resolution workflow item.',
      milestones: [
        { title: 'Action Plan Initiated', date: new Date().toLocaleDateString(), completed: true },
        { title: 'Intervention Implementation', date: newDueDate, completed: false },
        { title: 'Quality Verification', date: newDueDate, completed: false }
      ]
    };

    setActions([created, ...actions]);
    setShowCreateModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);

    // Reset
    setNewTitle('');
    setNewDescription('');
  };

  const handleStatusUpdate = (id: string, status: ActionStatus, progress: number) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status, progressPercent: progress } : a));
    if (selectedActionDetail && selectedActionDetail.id === id) {
      setSelectedActionDetail({ ...selectedActionDetail, status, progressPercent: progress });
    }
  };

  const getPriorityBadge = (priority: ActionPriority) => {
    switch (priority) {
      case 'Critical':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs">CRITICAL</span>;
      case 'High':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs">HIGH</span>;
      case 'Medium':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-yellow-500 text-slate-950 shadow-xs">MEDIUM</span>;
      case 'Low':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">LOW</span>;
    }
  };

  const getStatusBadge = (status: ActionStatus) => {
    switch (status) {
      case 'Overdue':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 flex items-center gap-1 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            OVERDUE
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            In Progress
          </span>
        );
      case 'Not Started':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200">
            Not Started
          </span>
        );
      case 'Under Review':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300">
            Under Review
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Completed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-teal-500/40 flex items-center gap-3 animate-bounce">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Corrective Action Plan Created</h4>
            <p className="text-xs text-slate-300">
              New CAPA plan logged and assigned for resolution.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <CheckSquare className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Corrective Action & CAPA Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Accountability engine for resolution plans originating from incidents, safety audits, and risk reviews
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New CAPA Plan</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Actions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Active Action Plans
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {totalActive}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300">
            <CheckSquare className="w-6 h-6" />
          </div>
        </div>

        {/* Overdue Actions */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
              Overdue Actions
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {overdueCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Overall Completion % */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Avg CAPA Completion Rate
            </span>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono">
              {avgProgress}%
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Completed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
              Completed Actions
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {completedCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase mr-1">Status:</span>

          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All Actions ({actions.length})
          </button>
          <button
            onClick={() => setFilterStatus('In Progress')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'In Progress'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-900'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilterStatus('Overdue')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'Overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setFilterStatus('Completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterStatus === 'Completed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900'
            }`}
          >
            Completed
          </button>
        </div>

        {/* Priority & Search */}
        <div className="flex items-center gap-3">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action ID, owner, title..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-44 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Action Plans Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider font-mono">
                <th className="py-4 px-6">Action ID</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Action Title & Source</th>
                <th className="py-4 px-6">Accountable Owner</th>
                <th className="py-4 px-6">Progress %</th>
                <th className="py-4 px-6">Due Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredActions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No corrective action items match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredActions.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    {/* ID */}
                    <td className="py-4 px-6 font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                      {act.id}
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getPriorityBadge(act.priority)}
                    </td>

                    {/* Title & Source */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white">{act.title}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">Origin: {act.sourceOrigin}</div>
                    </td>

                    {/* Owner */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-teal-500/10 text-teal-600 font-bold flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{act.ownerName}</div>
                          <span className="text-[10px] text-slate-400">{act.ownerRole}</span>
                        </div>
                      </div>
                    </td>

                    {/* Progress Bar */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="w-32 space-y-1">
                        <div className="flex justify-between text-[10px] font-mono font-bold">
                          <span className="text-slate-500">Completion</span>
                          <span className="text-teal-600 dark:text-teal-400">{act.progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              act.progressPercent === 100
                                ? 'bg-emerald-500'
                                : act.status === 'Overdue'
                                ? 'bg-rose-500'
                                : 'bg-teal-500'
                            }`}
                            style={{ width: `${act.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className={act.status === 'Overdue' ? 'font-bold text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>
                          {act.dueDate}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      {getStatusBadge(act.status)}
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedActionDetail(act)}
                        className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>Timeline & Plan</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW CAPA PLAN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                  <CheckSquare className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                  Create Corrective Action Plan (CAPA)
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Action Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Recalibrate Bedside Exit Sensor Sensitivity"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Medication Safety">Medication Safety</option>
                    <option value="Equipment Safety">Equipment Safety</option>
                    <option value="Patient Safety">Patient Safety</option>
                    <option value="Infection Control">Infection Control</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as ActionPriority)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Critical">🔴 Critical</option>
                    <option value="High">🟠 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">⚪ Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Accountable Owner Name
                  </label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Source / Originating Finding
                </label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. Incident INC-2026-102 or Audit AUD-088"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Action Item Description
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Enter detailed action steps and expected outcome..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Action Item</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MILESTONE TIMELINE & DETAILS DRAWER */}
      {selectedActionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full h-full p-6 space-y-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                      {selectedActionDetail.id}
                    </span>
                    {getPriorityBadge(selectedActionDetail.priority)}
                    {getStatusBadge(selectedActionDetail.status)}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedActionDetail.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedActionDetail(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Update Controls */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Update Action Completion Status:</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{selectedActionDetail.progressPercent}%</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedActionDetail.id, 'In Progress', 50)}
                    className="px-3 py-1.5 rounded-xl bg-blue-100 text-blue-800 text-xs font-bold border border-blue-300 cursor-pointer"
                  >
                    Set 50% (In Progress)
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedActionDetail.id, 'Under Review', 85)}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 cursor-pointer"
                  >
                    Set 85% (Under Review)
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedActionDetail.id, 'Completed', 100)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Mark 100% Completed
                  </button>
                </div>
              </div>

              {/* Details & Owner Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Accountable Owner:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedActionDetail.ownerName} ({selectedActionDetail.ownerRole})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Due Date:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {selectedActionDetail.dueDate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source Finding:</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                    {selectedActionDetail.sourceOrigin}
                  </span>
                </div>
              </div>

              {/* Progress Timeline Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Milestone Progress Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                  {selectedActionDetail.milestones.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-3 text-xs">
                      {/* Timeline Dot */}
                      <span className={`absolute -left-[23px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                        step.completed
                          ? 'bg-teal-500 border-teal-500 text-white'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                      }`}>
                        {step.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </span>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className={`font-bold ${step.completed ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                            {step.title}
                          </h5>
                          <span className="text-[10px] font-mono text-slate-400">({step.date})</span>
                        </div>
                        {step.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                            {step.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedActionDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsPage;
