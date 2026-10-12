import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  User, 
  ChevronRight, 
  Award, 
  AlertTriangle, 
  BarChart3, 
  CheckSquare, 
  X, 
  Sparkles, 
  ArrowUpRight, 
  ChevronLeft,
  Building2,
  ListFilter
} from 'lucide-react';

export type AuditStatus = 'Completed' | 'In Progress' | 'Scheduled' | 'Needs Remediation' | 'Overdue';
export type AuditCategory = 'Infection Prevention' | 'Ventilator Care Bundle' | 'Medication Safety' | 'Biomedical Equipment' | 'Nursing Documentation';

export interface AuditChecklistItem {
  id: number;
  question: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'NA';
  notes?: string;
}

export interface AuditRecord {
  id: string;
  title: string;
  category: AuditCategory;
  unitName: string;
  auditorName: string;
  auditorRole: string;
  auditDate: string;
  targetDate?: string;
  status: AuditStatus;
  passScore: number; // percentage
  checklistItems: AuditChecklistItem[];
  remediationAction?: string;
  assignedOfficer?: string;
}

export const MOCK_AUDITS: AuditRecord[] = [
  {
    id: 'AUD-2026-088',
    title: 'ICU Hand Hygiene & PPE Compliance Audit',
    category: 'Infection Prevention',
    unitName: 'MICU-01',
    auditorName: 'Dr. Ananya Roy',
    auditorRole: 'Infection Preventionist',
    auditDate: '2026-09-18',
    status: 'Completed',
    passScore: 92,
    checklistItems: [
      { id: 1, question: 'Hand hygiene station fully stocked with alcohol rub at bedside', category: 'Hand Hygiene', status: 'PASS' },
      { id: 2, question: 'Personal protective equipment (PPE) donned prior to entering isolation room', category: 'PPE', status: 'PASS' },
      { id: 3, question: 'Aseptic non-touch technique (ANTT) followed during CVC line access', category: 'Line Access', status: 'PASS' },
      { id: 4, question: 'Daily terminal isolation cleaning log completed & signed', category: 'Environment', status: 'FAIL', notes: 'Log missing signature for 15 Sep evening shift.' },
      { id: 5, question: 'Sharps disposal bin < 3/4 full and properly locked', category: 'Safety', status: 'PASS' }
    ],
    remediationAction: 'Charge Nurse to verify evening environmental cleaning sign-off during shift handover.',
    assignedOfficer: 'Anjali Deshmukh (NP)'
  },
  {
    id: 'AUD-2026-087',
    title: 'Ventilator-Associated Pneumonia (VAP) Care Bundle',
    category: 'Ventilator Care Bundle',
    unitName: 'SICU-01',
    auditorName: 'Dr. Rahul Sharma',
    auditorRole: 'Pulmonology Lead',
    auditDate: '2026-09-16',
    status: 'Needs Remediation',
    passScore: 75,
    checklistItems: [
      { id: 1, question: 'Head of bed elevated 30 to 45 degrees unless contraindicated', category: 'Positioning', status: 'PASS' },
      { id: 2, question: 'Daily sedation vacation & spontaneous breathing trial (SBT) assessed', category: 'Weaning', status: 'PASS' },
      { id: 3, question: 'Subglottic secretion suctioning performed Q4H', category: 'Airway', status: 'FAIL', notes: 'Suctioning frequency delayed on Bed ICU-03.' },
      { id: 4, question: 'Chlorhexidine oral care performed & documented Q6H', category: 'Oral Hygiene', status: 'PASS' },
      { id: 5, question: 'Peptic ulcer disease (PUD) & DVT prophylaxis ordered', category: 'Medication', status: 'FAIL', notes: 'DVT prophylaxis order expired without renewal note.' }
    ],
    remediationAction: 'Audit oral care suction timer and re-issue automated EHR DVT prophylaxis renewal alerts.',
    assignedOfficer: 'Priya Singh (RN)'
  },
  {
    id: 'AUD-2026-086',
    title: 'Central Line (CLABSI) Maintenance Inspection',
    category: 'Infection Prevention',
    unitName: 'CICU-01',
    auditorName: 'Dr. Sunita Patel',
    auditorRole: 'Cardiothoracic Auditor',
    auditDate: '2026-09-14',
    status: 'Completed',
    passScore: 100,
    checklistItems: [
      { id: 1, question: 'Transparent semi-permeable CVC dressing clean, dry, and intact', category: 'Dressing', status: 'PASS' },
      { id: 2, question: 'CVC dressing changed within 7 days or immediately if loose/soiled', category: 'Dressing', status: 'PASS' },
      { id: 3, question: 'Infusion tubing replaced per protocol (72h for standard, 24h for propofol)', category: 'Tubing', status: 'PASS' },
      { id: 4, question: 'Subclavian or jugular site preferred over femoral site', category: 'Site', status: 'PASS' }
    ],
    assignedOfficer: 'Suresh Nair (RN)'
  },
  {
    id: 'AUD-2026-090',
    title: 'Biomedical Device Calibration & Battery Readiness',
    category: 'Biomedical Equipment',
    unitName: 'MICU-01',
    auditorName: 'Eng. Rajesh V.',
    auditorRole: 'Chief Biomedical Engineer',
    auditDate: '2026-09-22',
    targetDate: '2026-09-22',
    status: 'Scheduled',
    passScore: 0,
    checklistItems: [
      { id: 1, question: 'Defibrillator battery self-test passed and discharge test verified', category: 'Defibrillator', status: 'PASS' },
      { id: 2, question: 'ECG monitors calibrated against IEEE simulator standard', category: 'Monitors', status: 'PASS' },
      { id: 3, question: 'Infusion pump flow rate accuracy within +/- 2% tolerance', category: 'Pumps', status: 'PASS' }
    ],
    assignedOfficer: 'Biomed Team'
  }
];

export const AuditLogsPage: React.FC = () => {
  const [audits, setAudits] = useState<AuditRecord[]>(MOCK_AUDITS);
  const [filterStatus, setFilterStatus] = useState<AuditStatus | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<AuditCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<AuditRecord | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'audits' | 'calendar'>('audits');

  // New Audit Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AuditCategory>('Infection Prevention');
  const [newUnit, setNewUnit] = useState('MICU-01');
  const [newAuditor, setNewAuditor] = useState('Dr. Rahul Sharma');
  const [newTargetDate, setNewTargetDate] = useState('2026-09-25');

  const filteredAudits = audits.filter((aud) => {
    if (filterStatus !== 'ALL' && aud.status !== filterStatus) return false;
    if (filterCategory !== 'ALL' && aud.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = aud.id.toLowerCase().includes(q);
      const matchTitle = aud.title.toLowerCase().includes(q);
      const matchUnit = aud.unitName.toLowerCase().includes(q);
      const matchAuditor = aud.auditorName.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchUnit && !matchAuditor) return false;
    }
    return true;
  });

  // Calculate Metrics
  const completedAudits = audits.filter(a => a.status === 'Completed' || a.status === 'Needs Remediation');
  const avgPassScore = completedAudits.length > 0
    ? Math.round(completedAudits.reduce((acc, a) => acc + a.passScore, 0) / completedAudits.length)
    : 90;
  const needsRemediationCount = audits.filter(a => a.status === 'Needs Remediation').length;
  const scheduledCount = audits.filter(a => a.status === 'Scheduled').length;

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: AuditRecord = {
      id: `AUD-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle || 'Routine ICU Clinical Quality Inspection',
      category: newCategory,
      unitName: newUnit,
      auditorName: newAuditor,
      auditorRole: 'Quality Auditor',
      auditDate: newTargetDate,
      targetDate: newTargetDate,
      status: 'Scheduled',
      passScore: 0,
      checklistItems: [
        { id: 1, question: 'Hand hygiene station fully stocked & functional', category: 'Hand Hygiene', status: 'PASS' },
        { id: 2, question: 'Bedside equipment cables properly bundled & grounded', category: 'Safety', status: 'PASS' },
        { id: 3, question: 'Medication refrigerator temperature log checked (2-8°C)', category: 'Medication', status: 'PASS' }
      ],
      assignedOfficer: newAuditor
    };

    setAudits([created, ...audits]);
    setShowScheduleModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
    setNewTitle('');
  };

  const getStatusBadge = (status: AuditStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Completed
          </span>
        );
      case 'Needs Remediation':
        return (
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            Needs Remediation
          </span>
        );
      case 'Scheduled':
        return (
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
            Scheduled
          </span>
        );
      case 'In Progress':
        return (
          <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            In Progress
          </span>
        );
      default:
        return <span className="px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">Pending</span>;
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
            <h4 className="font-bold text-sm text-white">Quality Audit Scheduled</h4>
            <p className="text-xs text-slate-300">
              Audit record added to unit compliance calendar.
            </p>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Clinical Quality & Compliance Audit Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Admin Quality Dashboard • Infection Checklists • Audit Calendar • Corrective Action Tracking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Audit</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Pass Rate */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Avg Compliance Pass Rate
            </span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
              <span>{avgPassScore}%</span>
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                HIGH PASS
              </span>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Audits Completed */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Audits Executed
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {completedAudits.length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-teal-100 dark:bg-teal-900/60 text-teal-600 dark:text-teal-300">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Needs Remediation */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
              Action Items Needed
            </span>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {needsRemediationCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Upcoming Scheduled */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
              Scheduled Inspections
            </span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
              {scheduledCount}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
            <CalendarIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Mode Navigation Tabs (Audits Directory vs Audit Schedule Calendar) */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('audits')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audits'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Audit Registry Directory ({audits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'calendar'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Audit Schedule Calendar</span>
        </button>
      </div>

      {activeTab === 'audits' ? (
        /* AUDITS REGISTRY TABLE VIEW */
        <div className="space-y-4">
          {/* Search & Category Filter Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 font-mono uppercase mr-1">Status:</span>

              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'ALL'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilterStatus('Completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'Completed'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setFilterStatus('Needs Remediation')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'Needs Remediation'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900'
                }`}
              >
                Needs Remediation
              </button>
              <button
                onClick={() => setFilterStatus('Scheduled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === 'Scheduled'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-900'
                }`}
              >
                Scheduled
              </button>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="Infection Prevention">Infection Prevention</option>
                <option value="Ventilator Care Bundle">Ventilator Care Bundle</option>
                <option value="Medication Safety">Medication Safety</option>
                <option value="Biomedical Equipment">Biomedical Equipment</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search audit, unit, auditor..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-44 sm:w-56"
                />
              </div>
            </div>
          </div>

          {/* Audit Registry Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider font-mono">
                    <th className="py-4 px-6">Audit ID</th>
                    <th className="py-4 px-6">Audit Inspection Title</th>
                    <th className="py-4 px-6">Unit / Location</th>
                    <th className="py-4 px-6">Auditor</th>
                    <th className="py-4 px-6">Pass Score</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredAudits.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No quality audits match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAudits.map((aud) => (
                      <tr key={aud.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-teal-600 dark:text-teal-400">
                          {aud.id}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 dark:text-white">{aud.title}</div>
                          <span className="text-[10px] font-mono text-slate-400">{aud.category}</span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-teal-400 font-mono font-bold text-[11px]">
                            {aud.unitName}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white">{aud.auditorName}</div>
                          <span className="text-[10px] text-slate-400">{aud.auditorRole}</span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {aud.status === 'Scheduled' ? (
                            <span className="text-slate-400 font-mono">--</span>
                          ) : (
                            <span className={`font-mono font-extrabold text-sm px-2.5 py-1 rounded-xl border ${
                              aud.passScore >= 90
                                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border-emerald-300'
                                : 'bg-rose-50 dark:bg-rose-950 text-rose-600 border-rose-300'
                            }`}>
                              {aud.passScore}%
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          {getStatusBadge(aud.status)}
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedAuditDetail(aud)}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Inspect Findings</span>
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
        </div>
      ) : (
        /* AUDIT SCHEDULE CALENDAR VIEW */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                September 2026 Quality Audit Schedule Calendar
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled weekly hand hygiene compliance, device inspections, and bundle reviews
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                SEP 2026
              </span>
              <button className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Representation */}
          <div className="grid grid-cols-7 gap-3 text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="font-bold text-slate-400 uppercase text-center font-mono py-1">
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {Array.from({ length: 28 }).map((_, i) => {
              const dayNum = i + 1;
              const scheduledForDay = audits.filter(a => {
                const dateObj = new Date(a.auditDate || a.targetDate || '');
                return dateObj.getDate() === dayNum;
              });

              return (
                <div
                  key={i}
                  className={`min-h-[100px] p-2.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    dayNum === 18
                      ? 'bg-teal-50/50 dark:bg-teal-950/30 border-teal-400 dark:border-teal-800 ring-2 ring-teal-500/20'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-mono font-bold text-xs ${dayNum === 18 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-500'}`}>
                      {dayNum}
                    </span>
                    {dayNum === 18 && (
                      <span className="text-[9px] font-bold font-mono bg-teal-600 text-white px-1.5 py-0.5 rounded-md">
                        TODAY
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1">
                    {scheduledForDay.map(aud => (
                      <button
                        key={aud.id}
                        onClick={() => setSelectedAuditDetail(aud)}
                        className={`w-full text-left p-1.5 rounded-xl border text-[10px] font-semibold truncate transition-all cursor-pointer block ${
                          aud.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : aud.status === 'Needs Remediation'
                            ? 'bg-rose-100 text-rose-900 border-rose-300'
                            : 'bg-blue-100 text-blue-900 border-blue-300'
                        }`}
                        title={aud.title}
                      >
                        {aud.unitName}: {aud.title}
                      </button>
                    ))}
                  </div>

                  <div className="text-[9px] text-slate-400 font-mono text-right">
                    {scheduledForDay.length > 0 ? `${scheduledForDay.length} audit(s)` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SCHEDULE NEW AUDIT MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                  Schedule Quality Audit
                </h3>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Audit Inspection Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Weekly CLABSI Bundle Maintenance Audit"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                    onChange={(e) => setNewCategory(e.target.value as AuditCategory)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Infection Prevention">Infection Prevention</option>
                    <option value="Ventilator Care Bundle">Ventilator Care Bundle</option>
                    <option value="Medication Safety">Medication Safety</option>
                    <option value="Biomedical Equipment">Biomedical Equipment</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Target Unit
                  </label>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="MICU-01">MICU-01 (Medical ICU)</option>
                    <option value="SICU-01">SICU-01 (Surgical ICU)</option>
                    <option value="CICU-01">CICU-01 (Cardiac ICU)</option>
                    <option value="NICU-01">NICU-01 (Neuro ICU)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Lead Auditor
                  </label>
                  <input
                    type="text"
                    value={newAuditor}
                    onChange={(e) => setNewAuditor(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Confirm Schedule</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AUDIT FINDINGS DEEP-DIVE DRAWER */}
      {selectedAuditDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full h-full p-6 space-y-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                      {selectedAuditDetail.id}
                    </span>
                    {getStatusBadge(selectedAuditDetail.status)}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedAuditDetail.title}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedAuditDetail(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pass Score Card */}
              <div className="p-4 rounded-3xl bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    Audit Compliance Score
                  </span>
                  <div className="text-3xl font-black font-mono text-teal-400 mt-0.5">
                    {selectedAuditDetail.status === 'Scheduled' ? 'Pending Run' : `${selectedAuditDetail.passScore}%`}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Auditor: {selectedAuditDetail.auditorName} ({selectedAuditDetail.auditorRole})
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Award className="w-7 h-7" />
                </div>
              </div>

              {/* Checklist Items Evaluation */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Evaluated Checklist Items ({selectedAuditDetail.checklistItems.length})
                </h4>

                <div className="space-y-2.5">
                  {selectedAuditDetail.checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-slate-400 text-[10px]">
                            Item Q{item.id} • {item.category}
                          </span>
                          <h5 className="font-bold text-slate-900 dark:text-white leading-snug">
                            {item.question}
                          </h5>
                        </div>

                        <span className={`px-3 py-1 rounded-full font-black text-[11px] shrink-0 ${
                          item.status === 'PASS'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {item.notes && (
                        <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60">
                          Non-Compliance Note: {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation Action Plan */}
              {selectedAuditDetail.remediationAction && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-200 block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Corrective Action Plan Required:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {selectedAuditDetail.remediationAction}
                  </p>
                  <div className="text-[10px] font-mono text-slate-500 pt-1">
                    Assigned Lead: {selectedAuditDetail.assignedOfficer || 'Quality Lead'}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedAuditDetail(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Close Audit Findings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;
