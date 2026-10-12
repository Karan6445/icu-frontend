import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Layers,
  Users,
  Bed,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Trash2,
  ShieldCheck,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  X,
  Stethoscope,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { useRBAC } from '../../hooks/useRBAC';

export interface DepartmentItem {
  id: string;
  code: string;
  name: string;
  hospitalId: string;
  hospitalName: string;
  wing: string;
  floor: string;
  hodName: string;
  hodPhone: string;
  hodEmail: string;
  bedCount: number;
  staffCount: number;
  isIcuLinked: boolean;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  lastAudit: string;
}

const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  {
    id: 'dept-01',
    code: 'DEPT-ICU-01',
    name: 'Critical Care & Intensive Medicine (MICU/SICU)',
    hospitalId: 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospitalName: 'Patna Medical College & Hospital (PMCH)',
    wing: 'South Clinical Wing',
    floor: 'Floor 3',
    hodName: 'Dr. Vikramaditya Sen',
    hodPhone: '+91 98765 43210',
    hodEmail: 'v.sen@smarticu.org',
    bedCount: 40,
    staffCount: 32,
    isIcuLinked: true,
    status: 'ACTIVE',
    lastAudit: '2026-10-10 09:30'
  },
  {
    id: 'dept-02',
    code: 'DEPT-EMERG-01',
    name: 'Emergency & Acute Trauma Care',
    hospitalId: 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospitalName: 'Patna Medical College & Hospital (PMCH)',
    wing: 'Ground Emergency Block',
    floor: 'Ground Floor',
    hodName: 'Dr. Anand K. Sinha',
    hodPhone: '+91 98765 43211',
    hodEmail: 'a.sinha@smarticu.org',
    bedCount: 28,
    staffCount: 24,
    isIcuLinked: true,
    status: 'ACTIVE',
    lastAudit: '2026-10-11 14:15'
  },
  {
    id: 'dept-03',
    code: 'DEPT-CARD-01',
    name: 'Cardiology & Intensive Coronary Care (CCU)',
    hospitalId: 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospitalName: 'Patna Medical College & Hospital (PMCH)',
    wing: 'Heart Institute Wing B',
    floor: 'Floor 2',
    hodName: 'Dr. Rajiv Menon',
    hodPhone: '+91 98765 43212',
    hodEmail: 'r.menon@smarticu.org',
    bedCount: 22,
    staffCount: 18,
    isIcuLinked: true,
    status: 'ACTIVE',
    lastAudit: '2026-10-09 11:20'
  },
  {
    id: 'dept-04',
    code: 'DEPT-NEURO-01',
    name: 'Neurology & Neuro-Intensive Care',
    hospitalId: 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospitalName: 'Patna Medical College & Hospital (PMCH)',
    wing: 'Neuroscience Center',
    floor: 'Floor 4',
    hodName: 'Dr. Shalini Roy',
    hodPhone: '+91 98765 43213',
    hodEmail: 's.roy@smarticu.org',
    bedCount: 18,
    staffCount: 16,
    isIcuLinked: true,
    status: 'ACTIVE',
    lastAudit: '2026-10-08 16:45'
  },
  {
    id: 'dept-05',
    code: 'DEPT-PULM-01',
    name: 'Pulmonology & Respiratory Care',
    hospitalId: 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospitalName: 'Patna Medical College & Hospital (PMCH)',
    wing: 'Chest Medicine Block',
    floor: 'Floor 2',
    hodName: 'Dr. Devendra Sharma',
    hodPhone: '+91 98765 43214',
    hodEmail: 'd.sharma@smarticu.org',
    bedCount: 20,
    staffCount: 14,
    isIcuLinked: true,
    status: 'ACTIVE',
    lastAudit: '2026-10-07 10:00'
  },
  {
    id: 'dept-06',
    code: 'DEPT-PED-01',
    name: 'Pediatric & Neonatal Intensive Care (PICU/NICU)',
    hospitalId: 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospitalName: 'Patna Medical College & Hospital (PMCH)',
    wing: 'Maternal & Child Health Tower',
    floor: 'Floor 5',
    hodName: 'Dr. Kavita Verma',
    hodPhone: '+91 98765 43215',
    hodEmail: 'k.verma@smarticu.org',
    bedCount: 26,
    staffCount: 22,
    isIcuLinked: true,
    status: 'ACTIVE',
    lastAudit: '2026-10-10 18:30'
  },
  {
    id: 'dept-07',
    code: 'DEPT-NEPH-01',
    name: 'Nephrology & Renal Dialysis Unit',
    hospitalId: 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospitalName: 'Patna Medical College & Hospital (PMCH)',
    wing: 'Dialysis Center Annex',
    floor: 'Floor 1',
    hodName: 'Dr. Tariq Ahmed',
    hodPhone: '+91 98765 43216',
    hodEmail: 't.ahmed@smarticu.org',
    bedCount: 16,
    staffCount: 12,
    isIcuLinked: false,
    status: 'ACTIVE',
    lastAudit: '2026-10-06 15:10'
  },
  {
    id: 'dept-08',
    code: 'DEPT-SURG-01',
    name: 'General & Laparoscopic Surgery',
    hospitalId: 'a324634e-b022-44ac-b633-448e14f35ad4',
    hospitalName: 'Patna Medical College & Hospital (PMCH)',
    wing: 'Surgical Block A',
    floor: 'Floor 3',
    hodName: 'Dr. Rajeshwari Nair',
    hodPhone: '+91 98765 43217',
    hodEmail: 'r.nair@smarticu.org',
    bedCount: 35,
    staffCount: 28,
    isIcuLinked: false,
    status: 'ACTIVE',
    lastAudit: '2026-10-09 08:45'
  }
];

export const AdminDepartmentsPage: React.FC = () => {
  const { hospitals } = useAppSelector(state => state.hospital);
  const { hasPermission } = useRBAC();

  const [departments, setDepartments] = useState<DepartmentItem[]>(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'>('ALL');
  const [icuFilter, setIcuFilter] = useState<'ALL' | 'ICU_ONLY' | 'NON_ICU'>('ALL');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentItem | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formWing, setFormWing] = useState('');
  const [formFloor, setFormFloor] = useState('Floor 1');
  const [formHod, setFormHod] = useState('');
  const [formPhone, setFormPhone] = useState('+91 ');
  const [formEmail, setFormEmail] = useState('');
  const [formBeds, setFormBeds] = useState('20');
  const [formStaff, setFormStaff] = useState('15');
  const [formIcuLinked, setFormIcuLinked] = useState(true);
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'>('ACTIVE');

  // Filtered List
  const filteredDepartments = departments.filter(d => {
    if (statusFilter !== 'ALL' && d.status !== statusFilter) return false;
    if (icuFilter === 'ICU_ONLY' && !d.isIcuLinked) return false;
    if (icuFilter === 'NON_ICU' && d.isIcuLinked) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.hodName.toLowerCase().includes(q) ||
        d.wing.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI Calculations
  const totalDepts = departments.length;
  const icuLinkedDepts = departments.filter(d => d.isIcuLinked).length;
  const totalBedCapacity = departments.reduce((acc, d) => acc + d.bedCount, 0);
  const totalStaffAssigned = departments.reduce((acc, d) => acc + d.staffCount, 0);

  // Handlers
  const handleOpenAdd = () => {
    setFormName('');
    setFormCode(`DEPT-${Math.floor(100 + Math.random() * 900)}`);
    setFormWing('Main Clinical Block');
    setFormFloor('Floor 2');
    setFormHod('');
    setFormPhone('+91 ');
    setFormEmail('');
    setFormBeds('24');
    setFormStaff('18');
    setFormIcuLinked(true);
    setFormStatus('ACTIVE');
    setIsAddModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDept: DepartmentItem = {
      id: `dept-${Date.now()}`,
      code: formCode.trim().toUpperCase(),
      name: formName.trim(),
      hospitalId: hospitals[0]?.id || 'a324634e-b022-44ac-b633-448e14f35ad4',
      hospitalName: hospitals[0]?.name || 'Patna Medical College & Hospital (PMCH)',
      wing: formWing.trim(),
      floor: formFloor,
      hodName: formHod.trim() || 'Dr. Designated Lead',
      hodPhone: formPhone.trim(),
      hodEmail: formEmail.trim() || `dept.${formCode.toLowerCase()}@smarticu.org`,
      bedCount: parseInt(formBeds, 10) || 20,
      staffCount: parseInt(formStaff, 10) || 15,
      isIcuLinked: formIcuLinked,
      status: formStatus,
      lastAudit: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    setDepartments([newDept, ...departments]);
    setIsAddModalOpen(false);
    setBannerMessage(`Department "${newDept.name}" created successfully (department:create).`);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditingDept(dept);
    setFormName(dept.name);
    setFormCode(dept.code);
    setFormWing(dept.wing);
    setFormFloor(dept.floor);
    setFormHod(dept.hodName);
    setFormPhone(dept.hodPhone);
    setFormEmail(dept.hodEmail);
    setFormBeds(dept.bedCount.toString());
    setFormStaff(dept.staffCount.toString());
    setFormIcuLinked(dept.isIcuLinked);
    setFormStatus(dept.status);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;

    setDepartments(prev =>
      prev.map(d =>
        d.id === editingDept.id
          ? {
              ...d,
              name: formName.trim(),
              code: formCode.trim().toUpperCase(),
              wing: formWing.trim(),
              floor: formFloor,
              hodName: formHod.trim(),
              hodPhone: formPhone.trim(),
              hodEmail: formEmail.trim(),
              bedCount: parseInt(formBeds, 10) || d.bedCount,
              staffCount: parseInt(formStaff, 10) || d.staffCount,
              isIcuLinked: formIcuLinked,
              status: formStatus,
              lastAudit: new Date().toISOString().slice(0, 16).replace('T', ' ')
            }
          : d
      )
    );
    setEditingDept(null);
    setBannerMessage(`Department "${formName}" updated successfully (department:update).`);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  const handleDeleteConfirm = () => {
    if (!deletingDept) return;
    setDepartments(prev => prev.filter(d => d.id !== deletingDept.id));
    setBannerMessage(`Department "${deletingDept.name}" deleted (department:delete).`);
    setDeletingDept(null);
    setTimeout(() => setBannerMessage(null), 4000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-100 rounded-3xl font-sans">
      {/* Banner */}
      {bannerMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{bannerMessage}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Directorate Header */}
      <div className="bg-gradient-to-r from-[#0F766E] via-[#0D655E] to-[#047857] p-6 sm:p-8 rounded-3xl text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 border border-teal-700">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              DEPARTMENT GOVERNANCE • SUPER ADMIN AUTHORITY
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/25 border border-emerald-300/40 text-emerald-200 text-[10px] font-mono font-bold">
              department:create • read • update • delete
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hospital Departments Management
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-2xl leading-relaxed font-medium">
            Centralized administration of specialized clinical units, ICU wings, bed quotas, and departmental heads across connected medical facilities.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {hasPermission('department:create') && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Department</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Departments</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalDepts}</div>
          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-bold">100% Operational Status</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">ICU Linked Wings</span>
          <div className="text-2xl font-black text-[#0F766E] dark:text-teal-400 font-mono">{icuLinkedDepts}</div>
          <span className="text-[11px] text-emerald-600 font-bold">Integrated Telemetry</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Bed Quota</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalBedCapacity}</div>
          <span className="text-[11px] text-slate-500 font-mono">Beds Monitored</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Assigned Staff</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalStaffAssigned}</div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-bold">Specialists & RNs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, code, HOD..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <select
            value={icuFilter}
            onChange={e => setIcuFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Departments</option>
            <option value="ICU_ONLY">ICU Linked Only</option>
            <option value="NON_ICU">Standard Inpatient</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Under Maintenance</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0F766E] dark:text-teal-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Department Inventory ({filteredDepartments.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Authorized: department:read
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Code / Dept Name</th>
                <th className="py-3 px-4">Location / Wing</th>
                <th className="py-3 px-4">Head of Department</th>
                <th className="py-3 px-4 text-center">Beds & Staff</th>
                <th className="py-3 px-4 text-center">ICU Linked</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredDepartments.map(dept => (
                <tr key={dept.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-[#0F766E] dark:text-teal-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{dept.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                          <span>{dept.code}</span>
                          <span>•</span>
                          <span className="truncate max-w-[180px]">{dept.hospitalName}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{dept.wing}</div>
                    <div className="text-[10px] text-slate-400">{dept.floor}</div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{dept.hodName}</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">{dept.hodPhone}</div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-2 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                        {dept.bedCount} Beds
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold">
                        {dept.staffCount} Staff
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    {dept.isIcuLinked ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-[#0F766E] dark:text-teal-300 border border-teal-500/30">
                        ICU Linked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        Standard
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      dept.status === 'ACTIVE'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                        : dept.status === 'MAINTENANCE'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30'
                    }`}>
                      {dept.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {hasPermission('department:update') && (
                        <button
                          onClick={() => handleOpenEdit(dept)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Department (department:update)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {hasPermission('department:delete') && (
                        <button
                          onClick={() => setDeletingDept(dept)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Department (department:delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DEPARTMENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Add Hospital Department</h3>
                  <span className="text-[10px] font-mono text-teal-600">Action: department:create</span>
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Critical Care & Anesthesia"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={e => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Floor Level
                  </label>
                  <select
                    value={formFloor}
                    onChange={e => setFormFloor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900 dark:text-white"
                  >
                    <option value="Ground Floor">Ground Floor</option>
                    <option value="Floor 1">Floor 1</option>
                    <option value="Floor 2">Floor 2</option>
                    <option value="Floor 3">Floor 3</option>
                    <option value="Floor 4">Floor 4</option>
                    <option value="Floor 5">Floor 5</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Wing / Building Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. South Critical Tower, Wing B"
                  value={formWing}
                  onChange={e => setFormWing(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Head of Department (HOD)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Dr. Full Name"
                    value={formHod}
                    onChange={e => setFormHod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 00000"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Allocated Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formBeds}
                    onChange={e => setFormBeds(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Assigned
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formStaff}
                    onChange={e => setFormStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="checkbox"
                  id="icu-link-check"
                  checked={formIcuLinked}
                  onChange={e => setFormIcuLinked(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="icu-link-check" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Direct ICU Linked Wing (Enables real-time 24x7 telemetry integration)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DEPARTMENT MODAL */}
      {editingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Edit Department</h3>
                  <span className="text-[10px] font-mono text-teal-600">Action: department:update • {editingDept.code}</span>
                </div>
              </div>
              <button onClick={() => setEditingDept(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Head of Department (HOD)
                  </label>
                  <input
                    type="text"
                    required
                    value={formHod}
                    onChange={e => setFormHod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-medium text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Allocated Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formBeds}
                    onChange={e => setFormBeds(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Staff Assigned
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formStaff}
                    onChange={e => setFormStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 font-mono text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 border border-rose-200 dark:border-rose-800">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Delete Department?</h3>
                <span className="text-[10px] font-mono text-rose-600">Action: department:delete</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to remove <strong>{deletingDept.name}</strong> ({deletingDept.code})? This will archive departmental quota and shift mappings.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingDept(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDepartmentsPage;
