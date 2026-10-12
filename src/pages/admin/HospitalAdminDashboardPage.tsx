import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import {
  Building2,
  Users,
  Stethoscope,
  HeartPulse,
  Bed,
  Activity,
  Calendar,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Lock,
  CheckCircle2,
  BarChart3,
  Search,
  Filter,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Plus,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  X,
  ExternalLink,
  Shield,
  MapPin,
  ClipboardList
} from 'lucide-react';
import {
  HOSPITAL_ADMIN_DETAILED_PERMISSIONS,
  HOSPITAL_ADMIN_EXACT_PERMISSIONS,
  HospitalAdminPermission
} from '../../config/rbacConfig';
import { useRBAC } from '../../hooks/useRBAC';

export const HospitalAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useRBAC();
  const {
    hospitalName,
    hospitalCode,
    director,
    doctors,
    nurses,
    icus,
    beds,
    encounters,
    remarks,
    shifts,
    activityLogs
  } = useAppSelector(state => state.hospitalAdmin);

  const userList = useAppSelector(state => state.user?.users);
  const roleList = useAppSelector(state => state.rolePermission?.roles);

  // Authority Matrix Inspection Modal State
  const [isAuthorityModalOpen, setIsAuthorityModalOpen] = useState(false);
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedPermissionCategory, setSelectedPermissionCategory] = useState<string>('ALL');

  const totalDoctors = doctors.length;
  const nurseLeads = nurses.filter(n => n.rank === 'NURSE_LEAD').length;
  const totalNurses = nurses.length;
  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED').length;
  const availableBeds = beds.filter(b => b.status === 'AVAILABLE').length;
  const reservedBeds = beds.filter(b => b.status === 'RESERVED').length;
  const maintenanceBeds = beds.filter(b => b.status === 'MAINTENANCE').length;
  const activeEncounters = encounters.filter(e => e.status === 'ACTIVE').length;
  const lockedRemarksCount = remarks.filter(r => r.isLocked).length;

  const occupancyRate = Math.round((occupiedBeds / (totalBeds || 1)) * 100);

  // Filter permissions in the authority modal
  const filteredPermissions = HOSPITAL_ADMIN_DETAILED_PERMISSIONS.filter(p => {
    const matchesCategory =
      selectedPermissionCategory === 'ALL' || p.category === selectedPermissionCategory;
    const matchesSearch =
      p.code.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      p.module.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(permissionSearch.toLowerCase()) ||
      p.action.toLowerCase().includes(permissionSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'read':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'update':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'delete':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'write':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 font-sans w-full max-w-full overflow-x-hidden">
      {/* ================= 1. EXECUTIVE COMMAND HEADER BANNER ================= */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 border border-teal-700/60 text-white rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-3 min-w-0 flex-1">
            {/* Authority & Status Badges */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-teal-500/25 text-teal-200 border border-teal-400/40 text-[11px] sm:text-xs font-mono font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
                <span>Assigned Hospital Command</span>
              </span>

              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[11px] sm:text-xs font-mono font-bold rounded-full">
                Code: {hospitalCode}
              </span>

              {/* 37 Permissions Verified Badge & Modal Trigger */}
              <button
                onClick={() => setIsAuthorityModalOpen(true)}
                className="px-3.5 py-1 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 hover:from-emerald-500/40 hover:to-teal-500/40 text-emerald-200 border border-emerald-400/50 text-[11px] sm:text-xs font-mono font-bold rounded-full flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                title="Inspect Authority Matrix (37 Active Permissions)"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>37 Permissions Verified</span>
                <span className="bg-emerald-400/30 text-emerald-100 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                  View Scope
                </span>
              </button>

              <span className="px-3 py-1 bg-rose-500/20 text-rose-200 border border-rose-400/40 text-[11px] sm:text-xs font-mono font-semibold rounded-full flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-rose-300" />
                <span>Read-Only Clinical Safeguard</span>
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight break-words">
                {hospitalName}
              </h1>
              <p className="text-teal-100/90 text-xs sm:text-sm max-w-3xl leading-relaxed">
                Executive hospital administration console: bed capacity allocation, clinical departments, staff shift rostering, patient registry census, and institutional audit governance.
              </p>
            </div>
          </div>

          {/* Director Profile Quick Card */}
          <div
            onClick={() => navigate('/admin/director')}
            className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-teal-400/40 hover:border-teal-400/60 rounded-2xl p-4 flex items-center gap-4 w-full lg:w-auto lg:min-w-[340px] max-w-full shadow-lg cursor-pointer transition-all active:scale-[0.99] group shrink-0"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/40 to-emerald-500/40 border border-teal-300/50 text-white flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform shadow-inner">
              <Stethoscope className="w-6 h-6 text-teal-200" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider block">
                Chief Medical Director
              </span>
              <h3 className="text-sm font-extrabold text-white leading-snug truncate">{director.name}</h3>
              <p className="text-xs text-teal-100 leading-tight mt-0.5 font-medium">
                <span className="font-mono text-[11px] text-teal-200 font-semibold">{director.employeeId}</span>
                <span className="mx-1.5 opacity-60">•</span>
                <span className="truncate">{director.designation.split('&')[0].trim()}</span>
              </p>
            </div>
            <div
              className="p-2 text-teal-200 group-hover:text-white group-hover:bg-teal-500/20 rounded-xl transition-colors shrink-0"
              title="View Director Details"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. PRIMARY KEY PERFORMANCE INDICATORS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Doctors */}
        <div
          onClick={() => navigate('/admin/hospital-doctors')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Medical Doctors
            </span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{totalDoctors}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Specialists On Roster</span>
            <span className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">staff:read</span>
          </p>
        </div>

        {/* ICU Nursing Staff */}
        <div
          onClick={() => navigate('/admin/hospital-nurses')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              ICU Nursing Staff
            </span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalNurses} <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-sans">({nurseLeads} Leads)</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>Shift Coverage</span>
            <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">staff:create</span>
          </p>
        </div>

        {/* Clinical Departments */}
        <div
          onClick={() => navigate('/admin/departments')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Clinical Departments
            </span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            6 <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 font-sans">Wings</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>MICU, SICU, Cardio</span>
            <span className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">department:*</span>
          </p>
        </div>

        {/* Bed Capacity & Occupancy */}
        <div
          onClick={() => navigate('/admin/bed-map')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Bed Occupancy
            </span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <Bed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {occupancyRate}% <span className="text-xs font-semibold text-slate-400 font-sans">({totalBeds} Beds)</span>
          </div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-mono font-bold">
            {occupiedBeds} Occ • {availableBeds} Avail
          </p>
        </div>

        {/* Patient Census & Encounters */}
        <div
          onClick={() => navigate('/admin/encounters')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Patient Census
            </span>
            <div className="p-2 bg-teal-50 dark:bg-teal-950/60 rounded-xl text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {activeEncounters} <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 font-sans">Active</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>ICU Admissions</span>
            <span className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400">admission:*</span>
          </p>
        </div>

        {/* IAM Users & RBAC */}
        <div
          onClick={() => navigate('/admin/users')}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-4 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md group"
        >
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-2">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              IAM Users & Roles
            </span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {userList?.length || 18} <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 font-sans">Accounts</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
            <span>{roleList?.length || 9} Institutional Roles</span>
            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">user:*, role:*</span>
          </p>
        </div>
      </div>

      {/* ================= 3. DOMAIN ACCELERATOR CARDS (MATCHING 37 PERMISSIONS) ================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Operational Domain Accelerators</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct access to facilities, staff rostering, patient registry, and IAM governance modules
            </p>
          </div>
          <button
            onClick={() => setIsAuthorityModalOpen(true)}
            className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white bg-teal-50 dark:bg-teal-500/20 px-3.5 py-1.5 rounded-xl border border-teal-200 dark:border-teal-500/40 transition-colors flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Authority Matrix (37 Permissions)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Facility & Clinical Departments */}
          <div
            onClick={() => navigate('/admin/departments')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/40 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                department:*, hospital:*
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Department Wings & Governance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Establish clinical departments (Cardiology, Neurology, MICU), configure HOD leadership, and manage ward capacities.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-teal-700 dark:text-teal-400">
              <span>Manage Departments →</span>
              <span className="text-[11px] text-slate-400 font-mono font-normal">Create / Update</span>
            </div>
          </div>

          {/* 2. ICU Units & Interactive Bed Map */}
          <div
            onClick={() => navigate('/admin/bed-map')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 group-hover:scale-105 transition-transform">
                <Bed className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                bed:*, icu:*
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                ICU Units & Interactive Bed Map
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Inspect 72-bed telemetry status grid, manage bed status (Available, Occupied, Maintenance), and allocate ventilators.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span>Open Bed Grid →</span>
              <span className="text-[11px] text-slate-400 font-mono font-normal">{occupancyRate}% Occupancy</span>
            </div>
          </div>

          {/* 3. Clinical Workforce & Rostering */}
          <div
            onClick={() => navigate('/admin/hospital-shifts')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                staff:create, read, update
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Workforce Shift Rostering
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Manage doctor and nurse lead assignments across Morning, Evening, and Night rotations for continuous ICU coverage.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-purple-700 dark:text-purple-400">
              <span>View Shift Schedule →</span>
              <span className="text-[11px] text-slate-400 font-mono font-normal">3 Daily Shifts</span>
            </div>
          </div>

          {/* 4. Patient Census & Admissions Registry */}
          <div
            onClick={() => navigate('/admin/hospital-patients')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                patient:*, admission:*
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Patient Census & Intake Registry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Register incoming ICU admissions, update protected demographics, manage bed transfers, and view encounter logs.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-blue-700 dark:text-blue-400">
              <span>Patient Directory →</span>
              <span className="text-[11px] text-slate-400 font-mono font-normal">{activeEncounters} Admitted</span>
            </div>
          </div>

          {/* 5. IAM User Accounts & RBAC Profiles */}
          <div
            onClick={() => navigate('/admin/users')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40 group-hover:scale-105 transition-transform">
                <UserCheck className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                user:*, role:*
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                User Management & Roles
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Provision staff accounts, configure passwords, assign institution-scoped RBAC roles, and enforce MFA protocols.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-indigo-700 dark:text-indigo-400">
              <span>Manage User Directory →</span>
              <span className="text-[11px] text-slate-400 font-mono font-normal">RBAC Scoped</span>
            </div>
          </div>

          {/* 6. Custom Reports & Forensic Audit */}
          <div
            onClick={() => navigate('/admin/custom-reports')}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 rounded-2xl p-5 cursor-pointer transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/40 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                audit:delete, reports
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                Custom Reports & Forensic Audit
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                Generate date-range KPI performance analytics, export CSV/PDF reports, and inspect institutional audit logs.
              </p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-teal-700 dark:text-teal-400">
              <span>Export KPI Reports →</span>
              <span className="text-[11px] text-slate-400 font-mono font-normal">Audit Trail</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 4. OPERATIONAL ICU CAPACITY BREAKDOWN & LEADS ================= */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Operational ICU Units ({hospitalCode})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Real-time telemetry bed capacity, occupancy, and assigned Doctor Lead & Nurse Lead coverage
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/add-icu')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 bg-emerald-50 dark:bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-500/40 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add ICU Unit</span>
            </button>
            <button
              onClick={() => navigate('/admin/hospital-icus')}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-900 bg-teal-50 dark:bg-teal-500/20 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-500/40 transition-colors"
            >
              Full Units Detail →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {icus.map(icu => {
            const icuOccupancy = Math.round((icu.occupiedBeds / icu.totalBeds) * 100);
            return (
              <div
                key={icu.id}
                className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/90 rounded-2xl p-4 space-y-3 hover:border-teal-400 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{icu.name}</h3>
                    <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-semibold">
                      {icu.code} • {icu.floorLocation}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-lg ${
                      icuOccupancy > 80
                        ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40'
                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                    }`}
                  >
                    {icuOccupancy}%
                  </span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      icuOccupancy > 80 ? 'bg-rose-500' : icuOccupancy > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${icuOccupancy}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-mono pt-1">
                  <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Occ</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{icu.occupiedBeds}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Avail</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{icu.availableBeds}</span>
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Total</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{icu.totalBeds}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 dark:text-slate-300 border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Doctor Lead:</span>
                    <span className="font-semibold text-teal-700 dark:text-teal-300 truncate max-w-[130px]">
                      {icu.doctorLeadName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400">Nurse Lead:</span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[130px]">
                      {icu.nurseLeadName}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= 5. RECENT LOCKED CLINICAL REMARKS & ACTIVITY LOGS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Locked Clinical Remarks */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Recent Locked Clinical Remarks (Read-Only)</span>
            </h3>
            <button
              onClick={() => navigate('/admin/remarks')}
              className="text-xs text-teal-700 dark:text-teal-300 hover:underline font-mono font-bold"
            >
              View All ({remarks.length})
            </button>
          </div>

          <div className="space-y-3">
            {remarks.slice(0, 3).map(rem => (
              <div
                key={rem.id}
                className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{rem.patientName}</span>
                    <span className="text-[10px] font-mono bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-semibold">
                      {rem.patientId}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500/40 px-2 py-0.5 rounded-lg flex items-center gap-1 font-bold">
                    <Lock className="w-3 h-3" /> LOCKED (READ-ONLY)
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  "{rem.content}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <span>Author: {rem.authorName} ({rem.authorRole})</span>
                  <span>{rem.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admin Activity Log */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Admin Activity & Audit Stream</span>
            </h3>
            <button
              onClick={() => navigate('/admin/activity-logs')}
              className="text-xs text-teal-700 dark:text-teal-300 hover:underline font-mono font-bold"
            >
              Full Log ({activityLogs.length})
            </button>
          </div>

          <div className="space-y-3">
            {activityLogs.slice(0, 4).map(log => (
              <div
                key={log.id}
                className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3 flex items-start gap-3"
              >
                <div className="p-2 bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 rounded-lg shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{log.action}</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5 font-mono">{log.details}</p>
                  <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono block mt-1 font-semibold">
                    Target: {log.entity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 6. INTERACTIVE 37-PERMISSION AUTHORITY MATRIX MODAL ================= */}
      {isAuthorityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-teal-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/40">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-black text-white tracking-tight">
                      Hospital Admin Authority Matrix
                    </h2>
                    <span className="px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 text-xs font-mono font-bold rounded-full">
                      37 Permissions Verified
                    </span>
                  </div>
                  <p className="text-xs text-teal-100/90 mt-0.5 font-medium">
                    Assigned to: {hospitalName} (Hospital Code: {hospitalCode})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAuthorityModalOpen(false)}
                className="p-2 text-teal-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scope & Boundary Guidance Banner */}
            <div className="p-4 bg-teal-50/70 dark:bg-teal-950/30 border-b border-teal-100 dark:border-teal-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-3 shrink-0">
              <AlertTriangle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-teal-900 dark:text-teal-200">
                  Operational Scope & Separation of Clinical Duties:
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hospital Admin possesses full institutional commissioning and update privileges across facilities, staff, beds, departments, and admissions (<span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">create</span>, <span className="font-mono font-bold text-blue-600 dark:text-blue-400">read</span>, <span className="font-mono font-bold text-amber-600 dark:text-amber-400">update</span>). Core entity deletion (<span className="font-mono">patient:delete</span>, <span className="font-mono">hospital:delete</span>) is protected by Super Admin to preserve legal medical audit trails. Clinical orders & prescriptions are delegated to attending physicians.
                </p>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'ALL', label: 'All Permissions', count: 37 },
                  { id: 'Facility & Units', label: 'Facility Hierarchy (12)', count: 12 },
                  { id: 'Workforce & IAM', label: 'Workforce & IAM (9)', count: 9 },
                  { id: 'Patient Flow & Admissions', label: 'Patient & Admissions (9)', count: 9 },
                  { id: 'Regional Jurisdiction', label: 'Jurisdiction (6)', count: 6 },
                  { id: 'Audit & Governance', label: 'Audit (1)', count: 1 }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedPermissionCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedPermissionCategory === cat.id
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={permissionSearch}
                  onChange={e => setPermissionSearch(e.target.value)}
                  placeholder="Search code or module..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Permissions Table List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                <span>Displaying {filteredPermissions.length} of 37 Authoritative Permissions</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">Role: HOSPITAL_ADMIN</span>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 uppercase text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3">Permission Code</th>
                      <th className="p-3">Module</th>
                      <th className="p-3 text-center">Action</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Granted Authority Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {filteredPermissions.map(p => (
                      <tr key={p.code} className="hover:bg-teal-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-bold text-teal-700 dark:text-teal-300">{p.code}</td>
                        <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{p.module}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase ${getActionBadgeColor(
                              p.action
                            )}`}
                          >
                            {p.action}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">{p.category}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300 font-sans text-xs">
                          {p.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
              <span className="text-slate-500 dark:text-slate-400">
                Token Scope: <strong className="text-slate-800 dark:text-slate-200">HOSPITAL_ADMIN (tenant-bound)</strong>
              </span>
              <button
                onClick={() => setIsAuthorityModalOpen(false)}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Close Matrix Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalAdminDashboardPage;
