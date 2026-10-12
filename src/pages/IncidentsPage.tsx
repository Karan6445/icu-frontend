import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertOctagon, 
  ShieldAlert, 
  Plus, 
  CheckCircle2, 
  FileText, 
  UserCheck, 
  Search, 
  Filter, 
  X, 
  Pill, 
  Cpu, 
  UserX, 
  Bug, 
  Clock, 
  Calendar, 
  ChevronRight, 
  AlertTriangle, 
  ExternalLink,
  CheckSquare,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { MOCK_PATIENTS } from '../data/mockData';

export type IncidentType = 'Medication Error' | 'Device Failure' | 'Patient Fall' | 'Infection';
export type IncidentSeverity = 'Critical' | 'High' | 'Moderate' | 'Low';
export type IncidentStatus = 'Open' | 'Under Investigation' | 'Root Cause Identified' | 'Resolved' | 'Closed';

export interface IncidentRecord {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  patientId: string;
  patientName: string;
  bedNumber: string;
  unitName: string;
  incidentDate: string;
  reportedBy: string;
  reportedByRole: string;
  assignedOfficer: string;
  description: string;
  immediateAction: string;
  specificDetails: string;
  rootCauseNotes?: string;
  correctiveActions?: string[];
}

export const INITIAL_INCIDENTS: IncidentRecord[] = [
  {
    id: 'INC-2026-104',
    type: 'Medication Error',
    severity: 'High',
    status: 'Under Investigation',
    patientId: 'P-1024',
    patientName: 'Ramesh Gupta',
    bedNumber: 'ICU-04',
    unitName: 'MICU-01',
    incidentDate: '2026-09-18T14:30:00Z',
    reportedBy: 'Priya Singh',
    reportedByRole: 'Staff RN',
    assignedOfficer: 'Dr. Rahul Sharma',
    description: 'Norepinephrine infusion rate calculated at double the prescribed rate (0.2 mcg/kg/min instead of 0.1 mcg/kg/min) for 15 minutes prior to smart pump guardrails alert.',
    immediateAction: 'Infusion rate immediately corrected to 0.1 mcg/kg/min. Attending physician notified. BP monitored Q5M.',
    specificDetails: 'Drug: Norepinephrine 4mg/250mL D5W • Prescribed: 0.1 mcg/kg/min • Administered: 0.2 mcg/kg/min',
    rootCauseNotes: 'Dual-nurse verification sign-off was bypassed due to urgent shift changeover noise.',
    correctiveActions: [
      'Enforce mandatory dual-sign-off popup on EHR smart pump integration.',
      'Conduct shift handover distraction awareness briefing.'
    ]
  },
  {
    id: 'INC-2026-103',
    type: 'Device Failure',
    severity: 'Critical',
    status: 'Root Cause Identified',
    patientId: 'P-1025',
    patientName: 'Sunita Saxena',
    bedNumber: 'ICU-01',
    unitName: 'MICU-01',
    incidentDate: '2026-09-17T08:15:00Z',
    reportedBy: 'Anjali Deshmukh',
    reportedByRole: 'Nurse Practitioner',
    assignedOfficer: 'Eng. Rajesh V.',
    description: 'Hamilton C6 ventilator touchscreen display froze during weaning protocol mode adjustment. Alarms remained audible but touch controls were unresponsive.',
    immediateAction: 'Patient manually bagged with Bag-Valve-Mask (BVM) while backup Servo-u ventilator was wheeled in and connected within 90 seconds. SpO2 maintained >94%.',
    specificDetails: 'Device: Hamilton C6 (ID: DEV-VENT-103) • Firmware v3.2.1 • Fault: UI Display Loop Freeze',
    rootCauseNotes: 'Biomedical engineering diagnostic revealed cache overflow on primary display board memory chip.',
    correctiveActions: [
      'Replace display processor board on DEV-VENT-103.',
      'Deploy firmware patch v3.2.4 across all 12 Hamilton ventilators.'
    ]
  },
  {
    id: 'INC-2026-102',
    type: 'Patient Fall',
    severity: 'Moderate',
    status: 'Resolved',
    patientId: 'P-1028',
    patientName: 'Kavita Menon',
    bedNumber: 'ICU-05',
    unitName: 'MICU-01',
    incidentDate: '2026-09-16T22:40:00Z',
    reportedBy: 'Suresh Nair',
    reportedByRole: 'Bedside RN',
    assignedOfficer: 'Dr. Amit Kumar',
    description: 'Patient attempted unassisted egress from bed to commode during night shift. Slipped on bedside floor mat.',
    immediateAction: 'Assisted back to bed with 2-staff hoist. STAT Portable X-ray of hip & pelvis performed — negative for acute fracture. Neurological checks normal.',
    specificDetails: 'Fall Category: Unwitnessed Bed Egress • Bed Rails: 2 of 4 up • Bed Alarm: Active but delayed activation',
    rootCauseNotes: 'Bed sensor mat sensitivity setting was on lowest threshold level.',
    correctiveActions: [
      'Recalibrate bed exit sensor sensitivity to Level 1 High Sensitivity.',
      'Place high-fall-risk yellow armband on patient.'
    ]
  },
  {
    id: 'INC-2026-101',
    type: 'Infection',
    severity: 'High',
    status: 'Closed',
    patientId: 'P-1031',
    patientName: 'Vikram Joshi',
    bedNumber: 'ICU-07',
    unitName: 'MICU-01',
    incidentDate: '2026-09-15T11:20:00Z',
    reportedBy: 'Dr. Ananya Roy',
    reportedByRole: 'Infection Control Specialist',
    assignedOfficer: 'Dr. Ananya Roy',
    description: 'Suspected Central Line-Associated Bloodstream Infection (CLABSI). Blood cultures drawn from triple-lumen subclavian line grew Methicillin-Resistant Staphylococcus Aureus (MRSA).',
    immediateAction: 'Subclavian CVC line removed immediately. Tip sent for culture. Vancomycin IV initiated per ID protocol.',
    specificDetails: 'Pathogen: MRSA • Site: Right Subclavian CVC (Line Day 6) • Fever Spike: 38.9°C',
    rootCauseNotes: 'Dressing change frequency exceeded 7-day protocol by 18 hours due to surgical dressing drainage concealment.',
    correctiveActions: [
      'Audit all CVC line insertion days daily during morning multidisciplinary rounds.',
      'Implement mandatory CVC Line Maintenance Bundle checklist.'
    ]
  }
];

export const IncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [filterType, setFilterType] = useState<IncidentType | 'ALL'>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<IncidentSeverity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<IncidentRecord | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State
  const [newType, setNewType] = useState<IncidentType>('Medication Error');
  const [newSeverity, setNewSeverity] = useState<IncidentSeverity>('Moderate');
  const [newPatientId, setNewPatientId] = useState('P-1024');
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 16));
  const [newDescription, setNewDescription] = useState('');
  const [newImmediateAction, setNewImmediateAction] = useState('');
  const [newSpecificDetails, setNewSpecificDetails] = useState('');
  const [newReportedBy, setNewReportedBy] = useState('Priya Singh (RN)');

  const filteredIncidents = incidents.filter((inc) => {
    if (filterType !== 'ALL' && inc.type !== filterType) return false;
    if (filterSeverity !== 'ALL' && inc.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = inc.id.toLowerCase().includes(q);
      const matchPatient = inc.patientName.toLowerCase().includes(q);
      const matchBed = inc.bedNumber.toLowerCase().includes(q);
      const matchDesc = inc.description.toLowerCase().includes(q);
      if (!matchId && !matchPatient && !matchBed && !matchDesc) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = MOCK_PATIENTS.find(p => p.id === newPatientId) || MOCK_PATIENTS[0];
    
    const created: IncidentRecord = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      type: newType,
      severity: newSeverity,
      status: 'Open',
      patientId: patientObj.id,
      patientName: patientObj.name,
      bedNumber: patientObj.bedNumber,
      unitName: patientObj.unitName,
      incidentDate: newDate,
      reportedBy: newReportedBy,
      reportedByRole: 'Bedside RN',
      assignedOfficer: 'Quality & Safety Officer',
      description: newDescription || 'No detailed description provided.',
      immediateAction: newImmediateAction || 'Bedside evaluation conducted.',
      specificDetails: newSpecificDetails || 'Standard clinical safety protocol initiated.'
    };

    setIncidents([created, ...incidents]);
    setShowCreateModal(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);

    // Reset Form
    setNewDescription('');
    setNewImmediateAction('');
    setNewSpecificDetails('');
  };

  const handleStatusChange = (id: string, newStatus: IncidentStatus) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: newStatus } : inc));
    if (selectedIncidentDetail && selectedIncidentDetail.id === id) {
      setSelectedIncidentDetail({ ...selectedIncidentDetail, status: newStatus });
    }
  };

  const getTypeIcon = (type: IncidentType) => {
    switch (type) {
      case 'Medication Error':
        return <Pill className="w-4 h-4 text-purple-500" />;
      case 'Device Failure':
        return <Cpu className="w-4 h-4 text-rose-500" />;
      case 'Patient Fall':
        return <UserX className="w-4 h-4 text-amber-500" />;
      case 'Infection':
        return <Bug className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getTypeBadge = (type: IncidentType) => {
    switch (type) {
      case 'Medication Error':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
            <Pill className="w-3.5 h-3.5 text-purple-500" />
            Medication Error
          </span>
        );
      case 'Device Failure':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-rose-500" />
            Device Failure
          </span>
        );
      case 'Patient Fall':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
            <UserX className="w-3.5 h-3.5 text-amber-500" />
            Patient Fall
          </span>
        );
      case 'Infection':
        return (
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
            <Bug className="w-3.5 h-3.5 text-emerald-500" />
            Infection
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'Critical':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-xs">CRITICAL</span>;
      case 'High':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs">HIGH</span>;
      case 'Moderate':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-yellow-500 text-slate-950 shadow-xs">MODERATE</span>;
      case 'Low':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">LOW</span>;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'Open':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">Open</span>;
      case 'Under Investigation':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">Under Investigation</span>;
      case 'Root Cause Identified':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300">RCA Identified</span>;
      case 'Resolved':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300">Resolved</span>;
      case 'Closed':
        return <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">Closed</span>;
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
            <h4 className="font-bold text-sm text-white">Incident Report Created</h4>
            <p className="text-xs text-slate-300">
              New safety event logged and routed to Quality & Governance Board.
            </p>
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertOctagon className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white font-sans">
                Clinical Safety & Incident Management System
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Root Cause Analysis (RCA), medication error tracking, device failure reporting & governance workflows
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Safety Incident</span>
        </button>
      </div>

      {/* Incident Type Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Medication Error Card */}
        <button
          onClick={() => setFilterType(filterType === 'Medication Error' ? 'ALL' : 'Medication Error')}
          className={`p-5 rounded-3xl border transition-all text-left cursor-pointer flex items-center justify-between ${
            filterType === 'Medication Error'
              ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">
              Medication Errors
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {incidents.filter(i => i.type === 'Medication Error').length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300">
            <Pill className="w-6 h-6" />
          </div>
        </button>

        {/* Device Failure Card */}
        <button
          onClick={() => setFilterType(filterType === 'Device Failure' ? 'ALL' : 'Device Failure')}
          className={`p-5 rounded-3xl border transition-all text-left cursor-pointer flex items-center justify-between ${
            filterType === 'Device Failure'
              ? 'ring-2 ring-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
              Device Failures
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {incidents.filter(i => i.type === 'Device Failure').length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
            <Cpu className="w-6 h-6" />
          </div>
        </button>

        {/* Patient Fall Card */}
        <button
          onClick={() => setFilterType(filterType === 'Patient Fall' ? 'ALL' : 'Patient Fall')}
          className={`p-5 rounded-3xl border transition-all text-left cursor-pointer flex items-center justify-between ${
            filterType === 'Patient Fall'
              ? 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 font-mono">
              Patient Falls
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {incidents.filter(i => i.type === 'Patient Fall').length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300">
            <UserX className="w-6 h-6" />
          </div>
        </button>

        {/* Infection Card */}
        <button
          onClick={() => setFilterType(filterType === 'Infection' ? 'ALL' : 'Infection')}
          className={`p-5 rounded-3xl border transition-all text-left cursor-pointer flex items-center justify-between ${
            filterType === 'Infection'
              ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
              Infection Control
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {incidents.filter(i => i.type === 'Infection').length}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300">
            <Bug className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Toolbar Filters & View Toggle */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <span className="text-xs font-bold text-slate-400 font-mono uppercase mr-1">Filter Type:</span>
          
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-teal-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Types ({incidents.length})
          </button>

          <button
            onClick={() => setFilterType('Medication Error')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'Medication Error'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
            }`}
          >
            Medication Error
          </button>

          <button
            onClick={() => setFilterType('Device Failure')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'Device Failure'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            Device Failure
          </button>

          <button
            onClick={() => setFilterType('Patient Fall')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'Patient Fall'
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            Patient Fall
          </button>

          <button
            onClick={() => setFilterType('Infection')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === 'Infection'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            Infection
          </button>
        </div>

        {/* Severity Filter, Search & View Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search incident ID, patient, bed..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards' ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs' : 'text-slate-400'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Table or Card List */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider font-mono">
                  <th className="py-4 px-6">Incident ID</th>
                  <th className="py-4 px-6">Incident Type</th>
                  <th className="py-4 px-6">Severity</th>
                  <th className="py-4 px-6">Patient & Location</th>
                  <th className="py-4 px-6">Reported Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No safety incidents match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {inc.id}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getTypeBadge(inc.type)}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getSeverityBadge(inc.severity)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 dark:text-white">{inc.patientName}</div>
                        <div className="text-[10px] font-mono text-slate-400">Bed {inc.bedNumber} ({inc.unitName})</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400 whitespace-nowrap">
                        {new Date(inc.incidentDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        {getStatusBadge(inc.status)}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedIncidentDetail(inc)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Review & RCA</span>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                    {inc.id}
                  </span>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(inc.type)}
                    {getSeverityBadge(inc.severity)}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                    {inc.patientName} (Bed {inc.bedNumber})
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {inc.description}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono">
                  <span className="font-bold text-slate-500">Details:</span> {inc.specificDetails}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>{getStatusBadge(inc.status)}</div>
                <button
                  onClick={() => setSelectedIncidentDetail(inc)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <span>Review Report</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE INCIDENT FORM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <AlertOctagon className="w-5 h-5" />
                </span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                  Report Clinical Safety Incident
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Incident Classification / Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as IncidentType)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Medication Error">💊 Medication Error</option>
                    <option value="Device Failure">⚡ Device Failure</option>
                    <option value="Patient Fall">⚠️ Patient Fall</option>
                    <option value="Infection">🦠 Infection (CLABSI/VAP/CAUTI)</option>
                  </select>
                </div>

                {/* Severity */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Initial Severity Rating
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as IncidentSeverity)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Critical">🔴 Critical (Immediate Harm/Egress)</option>
                    <option value="High">🟠 High (High Risk/Intervention Needed)</option>
                    <option value="Moderate">🟡 Moderate (Minor Harm/Near Miss)</option>
                    <option value="Low">⚪ Low (No Harm/Process Variance)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Patient */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Affected Patient & Bed
                  </label>
                  <select
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {MOCK_PATIENTS.map(p => (
                      <option key={p.id} value={p.id}>
                        Bed {p.bedNumber} — {p.name} ({p.id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date & Time */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    Date & Time of Occurrence
                  </label>
                  <input
                    type="datetime-local"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Specific Details input tailored to Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Specific Details ({newType})
                </label>
                <input
                  type="text"
                  value={newSpecificDetails}
                  onChange={(e) => setNewSpecificDetails(e.target.value)}
                  placeholder={
                    newType === 'Medication Error' ? 'e.g. Drug: Norepinephrine • Prescribed: 0.1mcg/kg/min • Given: 0.2mcg/kg/min' :
                    newType === 'Device Failure' ? 'e.g. Device: Hamilton C6 (DEV-103) • Error: Screen Display Freeze' :
                    newType === 'Patient Fall' ? 'e.g. Location: Bedside Floor • Mat Sensitivity: Low' :
                    'e.g. Pathogen: MRSA • Site: CVC Subclavian Line Day 6'
                  }
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Detailed Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Factual Incident Narrative / Sequence of Events
                </label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe chronologically what occurred, who was present, and environmental factors..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Immediate Actions Taken */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Immediate Clinical Interventions & Actions Taken
                </label>
                <textarea
                  rows={2}
                  value={newImmediateAction}
                  onChange={(e) => setNewImmediateAction(e.target.value)}
                  placeholder="e.g. Patient assessed by STAT physician, infusion corrected, vital signs monitored Q5M..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Reporter Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Reporting Clinician Name & Title
                </label>
                <input
                  type="text"
                  value={newReportedBy}
                  onChange={(e) => setNewReportedBy(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Safety Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INCIDENT DETAILS & RCA MODAL DRAWER */}
      {selectedIncidentDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end p-0">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full h-full p-6 space-y-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400">
                      {selectedIncidentDetail.id}
                    </span>
                    {getTypeBadge(selectedIncidentDetail.type)}
                    {getSeverityBadge(selectedIncidentDetail.severity)}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedIncidentDetail.patientName} (Bed {selectedIncidentDetail.bedNumber})
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedIncidentDetail(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Selector & Workflow */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-xs font-bold text-slate-500 font-mono uppercase block">
                  Governance Status & Workflow Stage
                </label>
                <select
                  value={selectedIncidentDetail.status}
                  onChange={(e) => handleStatusChange(selectedIncidentDetail.id, e.target.value as IncidentStatus)}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="Open">🔴 Open (Pending Review)</option>
                  <option value="Under Investigation">🟡 Under Investigation</option>
                  <option value="Root Cause Identified">🟣 Root Cause Identified</option>
                  <option value="Resolved">🟢 Resolved (Actions Implemented)</option>
                  <option value="Closed">✅ Closed (Verified by Safety Committee)</option>
                </select>
              </div>

              {/* Incident Details Card */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Occurrence Specifications
                </h4>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Time:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {new Date(selectedIncidentDetail.incidentDate).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reporter:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedIncidentDetail.reportedBy} ({selectedIncidentDetail.reportedByRole})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Assigned Safety Officer:</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">
                      {selectedIncidentDetail.assignedOfficer}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 font-bold block mb-1">Key Metrics:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700 block">
                      {selectedIncidentDetail.specificDetails}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description & Immediate Action */}
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Narrative Description</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    {selectedIncidentDetail.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Immediate Actions Taken</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60">
                    {selectedIncidentDetail.immediateAction}
                  </p>
                </div>
              </div>

              {/* Root Cause & Corrective Actions */}
              {selectedIncidentDetail.rootCauseNotes && (
                <div className="space-y-3 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">
                    Root Cause Analysis & Action Plan
                  </h4>

                  <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 space-y-2">
                    <span className="font-bold text-purple-900 dark:text-purple-200 block">Root Cause Finding:</span>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedIncidentDetail.rootCauseNotes}
                    </p>
                  </div>

                  {selectedIncidentDetail.correctiveActions && (
                    <div className="space-y-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">Corrective Action Items:</span>
                      {selectedIncidentDetail.correctiveActions.map((act, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-teal-500 shrink-0" />
                          <span className="text-slate-800 dark:text-slate-200 font-medium">{act}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <Link
                to={`/patient/${selectedIncidentDetail.patientId}`}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
              >
                <span>Open Patient Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedIncidentDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentsPage;
