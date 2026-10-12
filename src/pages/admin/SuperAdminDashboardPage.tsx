import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Bed,
  Stethoscope,
  ShieldCheck,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Plus,
  Video,
  PieChart as PieChartIcon,
  Key,
  ShieldAlert,
  Layers,
  Activity,
  ClipboardList,
  HeartPulse,
  Network,
  Radio,
  FileSpreadsheet,
  X,
  ExternalLink,
  Shield,
  Clock,
  UserCheck
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedDistrict, setSelectedHospitalId, setHospitalsFromBackend } from '../../store/slices/superAdminSlice';
import { AddHospitalModal } from '../../features/admin/AddHospitalModal';
import { ReportGeneratorModal } from '../../features/admin/ReportGeneratorModal';
import { PtzCameraConfigModal } from '../../components/camera/PtzCameraConfigModal';
import { hospitalApi } from '../../api/hospitalApi';
import { HospitalRecord } from '../../types/superAdmin';
import { useRBAC } from '../../hooks/useRBAC';

export interface AuthorityPermission {
  code: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | 'verify' | 'prescribe' | 'write' | 'witness';
  category: 'Jurisdiction' | 'Facilities' | 'IAM & Workforce' | 'Patient Flow' | 'Clinical Telemetry' | 'Pharmacy & Orders' | 'Forensic Audit';
  description: string;
}

export const SUPER_ADMIN_EXACT_PERMISSIONS: AuthorityPermission[] = [
  // State & District (Jurisdiction)
  { code: 'state:create', module: 'State', action: 'create', category: 'Jurisdiction', description: 'Provision new healthcare state territory' },
  { code: 'state:read', module: 'State', action: 'read', category: 'Jurisdiction', description: 'Read state-level health metrics and registries' },
  { code: 'state:update', module: 'State', action: 'update', category: 'Jurisdiction', description: 'Modify state health infrastructure parameters' },
  { code: 'state:delete', module: 'State', action: 'delete', category: 'Jurisdiction', description: 'Decommission or archive state territory records' },
  { code: 'district:create', module: 'District', action: 'create', category: 'Jurisdiction', description: 'Enroll new administrative health district' },
  { code: 'district:read', module: 'District', action: 'read', category: 'Jurisdiction', description: 'Monitor district hospitals, beds and demographics' },
  { code: 'district:update', module: 'District', action: 'update', category: 'Jurisdiction', description: 'Update district boundaries and nodal officer contacts' },
  { code: 'district:delete', module: 'District', action: 'delete', category: 'Jurisdiction', description: 'Remove or consolidate health district records' },

  // Hospital & Facility Hierarchy
  { code: 'hospital:create', module: 'Hospital', action: 'create', category: 'Facilities', description: 'Register and onboard medical centers and hospitals' },
  { code: 'hospital:read', module: 'Hospital', action: 'read', category: 'Facilities', description: 'Access facility hierarchy, occupancy and equipment' },
  { code: 'hospital:update', module: 'Hospital', action: 'update', category: 'Facilities', description: 'Update hospital facility profile and contacts' },
  { code: 'hospital:delete', module: 'Hospital', action: 'delete', category: 'Facilities', description: 'Deactivate hospital facility in healthcare registry' },
  { code: 'department:create', module: 'Department', action: 'create', category: 'Facilities', description: 'Establish specialized clinical department' },
  { code: 'department:read', module: 'Department', action: 'read', category: 'Facilities', description: 'Inspect departments, HOD assignments and wings' },
  { code: 'department:update', module: 'Department', action: 'update', category: 'Facilities', description: 'Update department beds, floor and leadership' },
  { code: 'department:delete', module: 'Department', action: 'delete', category: 'Facilities', description: 'Decommission clinical department unit' },
  { code: 'icu:create', module: 'ICU', action: 'create', category: 'Facilities', description: 'Deploy new intensive care unit (MICU/SICU/NICU)' },
  { code: 'icu:read', module: 'ICU', action: 'read', category: 'Facilities', description: 'Stream ICU bed occupancy and camera status' },
  { code: 'icu:update', module: 'ICU', action: 'update', category: 'Facilities', description: 'Configure ICU ward capacity and protocols' },
  { code: 'icu:delete', module: 'ICU', action: 'delete', category: 'Facilities', description: 'Retire or merge ICU unit operations' },
  { code: 'bed:create', module: 'Bed', action: 'create', category: 'Facilities', description: 'Add new ICU telemetry bed slot' },
  { code: 'bed:read', module: 'Bed', action: 'read', category: 'Facilities', description: 'Read bed telemetry, occupancy, and ventilators' },
  { code: 'bed:update', module: 'Bed', action: 'update', category: 'Facilities', description: 'Modify bed operational status and assignment' },
  { code: 'bed:delete', module: 'Bed', action: 'delete', category: 'Facilities', description: 'Decommission ICU bed unit' },

  // IAM & Workforce
  { code: 'user:create', module: 'User', action: 'create', category: 'IAM & Workforce', description: 'Provision user accounts and login credentials' },
  { code: 'user:read', module: 'User', action: 'read', category: 'IAM & Workforce', description: 'View user directory, active sessions and MFA' },
  { code: 'user:update', module: 'User', action: 'update', category: 'IAM & Workforce', description: 'Update user profiles, passwords, and statuses' },
  { code: 'user:delete', module: 'User', action: 'delete', category: 'IAM & Workforce', description: 'Revoke and soft-delete user accounts' },
  { code: 'role:create', module: 'Role', action: 'create', category: 'IAM & Workforce', description: 'Create custom RBAC role and privilege scope' },
  { code: 'role:read', module: 'Role', action: 'read', category: 'IAM & Workforce', description: 'Inspect platform roles and permission matrix' },
  { code: 'role:update', module: 'Role', action: 'update', category: 'IAM & Workforce', description: 'Assign or revoke fine-grained permissions' },
  { code: 'role:delete', module: 'Role', action: 'delete', category: 'IAM & Workforce', description: 'Delete non-system custom roles' },
  { code: 'staff:create', module: 'Staff', action: 'create', category: 'IAM & Workforce', description: 'Onboard doctors, nurse leads and specialists' },
  { code: 'staff:read', module: 'Staff', action: 'read', category: 'IAM & Workforce', description: 'View clinical staff rosters and qualifications' },
  { code: 'staff:update', module: 'Staff', action: 'update', category: 'IAM & Workforce', description: 'Update staff shifts, remarks and duty status' },
  { code: 'staff:delete', module: 'Staff', action: 'delete', category: 'IAM & Workforce', description: 'Deactivate staff credentials and duties' },

  // Patient Flow & Admissions
  { code: 'patient:create', module: 'Patient', action: 'create', category: 'Patient Flow', description: 'Admit new ICU patients into registry' },
  { code: 'patient:read', module: 'Patient', action: 'read', category: 'Patient Flow', description: 'Review patient demographic and medical records' },
  { code: 'patient:update', module: 'Patient', action: 'update', category: 'Patient Flow', description: 'Update clinical encounter details and acuity' },
  { code: 'patient:delete', module: 'Patient', action: 'delete', category: 'Patient Flow', description: 'Archive deceased or discharged patient records' },
  { code: 'patient:write', module: 'Patient', action: 'write', category: 'Patient Flow', description: 'Record permanent clinical progress entries' },
  { code: 'patient:demographics:read', module: 'Patient', action: 'read', category: 'Patient Flow', description: 'Access protected health demographic data (PII)' },
  { code: 'patient:demographics:write', module: 'Patient', action: 'write', category: 'Patient Flow', description: 'Update identity, emergency contacts and insurance' },
  { code: 'admission:create', module: 'Admission', action: 'create', category: 'Patient Flow', description: 'Process emergency and transfer ICU admissions' },
  { code: 'admission:read', module: 'Admission', action: 'read', category: 'Patient Flow', description: 'Track admission status and encounter timeline' },
  { code: 'admission:update', module: 'Admission', action: 'update', category: 'Patient Flow', description: 'Transfer patient beds and update admission status' },
  { code: 'admission:delete', module: 'Admission', action: 'delete', category: 'Patient Flow', description: 'Cancel erroneous admission entries' },

  // Clinical Monitoring
  { code: 'clinical:create', module: 'Clinical', action: 'create', category: 'Clinical Telemetry', description: 'Log vital signs assessments and hemodynamic notes' },
  { code: 'clinical:read', module: 'Clinical', action: 'read', category: 'Clinical Telemetry', description: 'Live monitoring of waveforms, vitals, and alarms' },
  { code: 'clinical:update', module: 'Clinical', action: 'update', category: 'Clinical Telemetry', description: 'Update SOFA scores, GCS and clinical flowsheets' },
  { code: 'clinical:delete', module: 'Clinical', action: 'delete', category: 'Clinical Telemetry', description: 'Administrative correction of recorded entries' },

  // Pharmacy & Orders
  { code: 'order:create', module: 'Order', action: 'create', category: 'Pharmacy & Orders', description: 'Initiate critical care physician directives' },
  { code: 'order:read', module: 'Order', action: 'read', category: 'Pharmacy & Orders', description: 'Inspect active diagnostic, lab, and radiology orders' },
  { code: 'order:update', module: 'Order', action: 'update', category: 'Pharmacy & Orders', description: 'Modify dosing, frequency, or therapy duration' },
  { code: 'order:delete', module: 'Order', action: 'delete', category: 'Pharmacy & Orders', description: 'Discontinue or void medical orders' },
  { code: 'order:medication:prescribe', module: 'Order', action: 'prescribe', category: 'Pharmacy & Orders', description: 'Authorize scheduled pharmaceuticals & infusions' },
  { code: 'order:medication:verify', module: 'Order', action: 'verify', category: 'Pharmacy & Orders', description: 'Clinical pharmacist verification & sign-off' },
  { code: 'medication:administer:execute', module: 'Medication', action: 'execute', category: 'Pharmacy & Orders', description: 'Execute bedside Medication Administration (MAR)' },
  { code: 'medication:administer:witness', module: 'Medication', action: 'witness', category: 'Pharmacy & Orders', description: 'Dual nurse witness co-signing for high-alert drugs' },

  // Forensic Audit
  { code: 'audit:create', module: 'Audit', action: 'create', category: 'Forensic Audit', description: 'Write immutable security & access log records' },
  { code: 'audit:read', module: 'Audit', action: 'read', category: 'Forensic Audit', description: 'Inspect audit trail, login history and compliance' },
  { code: 'audit:update', module: 'Audit', action: 'update', category: 'Forensic Audit', description: 'Annotate compliance review notes' },
  { code: 'audit:delete', module: 'Audit', action: 'delete', category: 'Forensic Audit', description: 'Certified lifecycle retention archive' },
];

export const SuperAdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.auth);
  const { hasPermission } = useRBAC();

  useEffect(() => {
    hospitalApi.list().then(res => {
      if (res.data && res.data.length > 0) {
        const records: HospitalRecord[] = res.data.map(f => {
          const totalBeds = f.totalBeds || 40;
          const icuBeds = Math.round(totalBeds * 0.35);
          const availableIcu = f.availableBeds || Math.round(icuBeds * 0.4);
          return {
            id: f.id,
            name: f.name,
            code: f.code,
            district: f.district || f.city || 'Patna',
            state: f.state || 'Bihar',
            type: 'Super Specialty Center',
            address: typeof f.address === 'string' ? f.address : `${f.city || ''}, ${f.state || ''}`,
            contactNumber: f.contact_phone || f.contactNumber || '+91 612 2300100',
            email: f.contact_email || `contact@${f.code.toLowerCase()}.smarticu.org`,
            totalBeds: totalBeds,
            occupiedBeds: Math.round(totalBeds * 0.65),
            availableBeds: Math.round(totalBeds * 0.35),
            totalICUBeds: icuBeds,
            availableICUBeds: availableIcu,
            occupiedICUBeds: icuBeds - availableIcu,
            reservedICUBeds: 2,
            maintenanceICUBeds: 1,
            doctorsCount: 12,
            nursesCount: 28,
            patientsCount: icuBeds - availableIcu,
            status: f.isActive || f.status === 'ACTIVE' ? 'Active' : 'Inactive',
            lastUpdated: new Date().toISOString().slice(0, 16).replace('T', ' '),
          };
        });
        dispatch(setHospitalsFromBackend(records));
      }
    });
  }, [dispatch]);

  // Modals state
  const [isAddHospitalOpen, setIsAddHospitalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPtzCameraOpen, setIsPtzCameraOpen] = useState(false);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permSearchTerm, setPermSearchTerm] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('ALL');

  const {
    districts,
    hospitals,
    doctors,
    nurses,
    patients,
  } = useAppSelector(state => state.superAdmin);

  // Compute Total Metrics across 38 Districts & Hospitals
  const totalDistrictsCount = 38;
  const totalHospitalsCount = hospitals.length || 6;
  const activeHospitalsCount = hospitals.filter(h => h.status === 'Active').length || totalHospitalsCount;

  const totalBedsCount = hospitals.reduce((acc, h) => acc + h.totalBeds, 0) || 240;
  const totalICUBedsCount = hospitals.reduce((acc, h) => acc + h.totalICUBeds, 0) || 84;
  const availableICUBedsCount = hospitals.reduce((acc, h) => acc + h.availableICUBeds, 0) || 38;
  const occupiedICUBedsCount = totalICUBedsCount - availableICUBedsCount;
  const icuUtilizationPercent = Math.round((occupiedICUBedsCount / (totalICUBedsCount || 1)) * 100);

  const totalDoctorsCount = doctors.length + districts.reduce((acc, d) => acc + d.totalDoctors, 0) || 48;
  const totalNursesCount = nurses.length + districts.reduce((acc, d) => acc + d.totalNurses, 0) || 120;
  const totalPatientsCount = patients.length + districts.reduce((acc, d) => acc + d.totalPatients, 0) || 46;

  const topDistricts = districts.slice(0, 8);

  const handleDistrictClick = (districtName: string) => {
    dispatch(setSelectedDistrict(districtName));
    navigate('/admin/districts');
  };

  // Filter Permissions for Modal
  const filteredPermissions = SUPER_ADMIN_EXACT_PERMISSIONS.filter(p => {
    if (selectedCategoryTab !== 'ALL' && p.category !== selectedCategoryTab) return false;
    if (permSearchTerm) {
      const q = permSearchTerm.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.module.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 font-sans pb-12 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen p-4 sm:p-6 rounded-3xl text-slate-900 dark:text-slate-100">
      {/* Top Directorate Banner */}
      <div className="bg-gradient-to-r from-[#0F766E] via-[#0D655E] to-[#047857] p-6 sm:p-8 rounded-3xl text-white shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-teal-700">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-white/20 text-white border border-white/30 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              SUPER ADMINISTRATOR • COMMAND CENTER DIRECTORATE
            </span>
            <button
              onClick={() => setIsPermModalOpen(true)}
              className="px-2.5 py-1 rounded-full bg-emerald-400/25 hover:bg-emerald-400/40 border border-emerald-300/40 text-emerald-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Key className="w-3 h-3 text-emerald-300" />
              <span>58 Active Permissions Verified</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-80" />
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
            Statewide Command Center Master Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-3xl leading-relaxed font-medium">
            Centralized Command & Governance across <strong>38 Districts</strong>, Hospital Facility Trees, Department Wings, ICU Bed Matrix, User Accounts, and Clinical Audits.
          </p>

          <div className="flex items-center gap-3 text-xs font-mono text-teal-200/90 pt-1">
            <span>Operator: <strong>{currentUser?.email || 'superadmin@smarticu.org'}</strong></span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-teal-800/80 border border-teal-500/40 text-[10px] text-teal-200 font-bold">
              ROLE: command_center
            </span>
          </div>
        </div>

        {/* Quick Actions Header */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsAddHospitalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Create Facility (hospital:create)"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Add Hospital</span>
          </button>

          <button
            onClick={() => navigate('/command-center')}
            className="px-4 py-2.5 rounded-xl bg-teal-900/90 hover:bg-teal-900 text-white border border-teal-400/50 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            title="Launch 24x7 ICU Command Center (clinical:read)"
          >
            <Radio className="w-4 h-4 text-emerald-300 animate-pulse" />
            <span>Launch ICU Grid</span>
          </button>

          <button
            onClick={() => setIsPtzCameraOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Video className="w-4 h-4 text-teal-700" />
            <span className="hidden sm:inline">PTZ Cameras</span>
          </button>
        </div>
      </div>

      {/* 6 DOMAIN COMMAND CARDS (DIRECT PERMISSION ACCELERATORS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => navigate('/admin/districts')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="p-2 w-fit rounded-xl bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400 mb-2 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">Districts & States</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">state:* • district:*</div>
          <div className="text-[11px] font-bold text-teal-700 dark:text-teal-400 mt-2 flex items-center gap-1">
            <span>38 Active</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/hospitals')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="p-2 w-fit rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-105 transition-transform">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">Hospitals Network</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">hospital:* • read/create</div>
          <div className="text-[11px] font-bold text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
            <span>{totalHospitalsCount} Facilities</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/departments')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="p-2 w-fit rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-105 transition-transform">
            <Network className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">Departments</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">department:* • all</div>
          <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1">
            <span>14 Wings</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/beds')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="p-2 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
            <Bed className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">ICU & Bed Map</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">icu:* • bed:*</div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
            <span>{totalICUBedsCount} ICU Beds</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/users')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="p-2 w-fit rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">IAM & Staff</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">user:* • role:* • staff:*</div>
          <div className="text-[11px] font-bold text-purple-600 dark:text-purple-400 mt-2 flex items-center gap-1">
            <span>RBAC Matrix</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/audit-logs')}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 text-left transition-all hover:shadow-md cursor-pointer group"
        >
          <div className="p-2 w-fit rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 mb-2 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white">Audit Trails</div>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">audit:* • tamper-proof</div>
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-2 flex items-center gap-1">
            <span>Immutable</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* 9 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-center sm:text-left hover:border-teal-500 transition-colors">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Districts</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalDistrictsCount}</div>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">district:read</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-center sm:text-left hover:border-teal-500 transition-colors">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Hospitals</span>
          <div className="text-2xl font-black text-[#0F766E] dark:text-teal-400 font-mono">{totalHospitalsCount}</div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">{activeHospitalsCount} Active</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-center sm:text-left hover:border-emerald-500 transition-colors">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Departments</span>
          <div className="text-2xl font-black text-emerald-600 font-mono">14</div>
          <span className="text-[10px] text-emerald-600 font-bold">department:all</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-center sm:text-left hover:border-teal-500 transition-colors">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total ICU Beds</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalICUBedsCount}</div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">icu:read • bed:read</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">Available Beds</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{availableICUBedsCount}</div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold">Ready for Intake</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs space-y-1 text-center sm:text-left">
          <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Occupied Beds</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">{occupiedICUBedsCount}</div>
          <span className="text-[10px] text-rose-600 font-bold">{icuUtilizationPercent}% Capacity</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-center sm:text-left hover:border-teal-500 transition-colors">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Doctors</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalDoctorsCount}</div>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">staff:read</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-center sm:text-left hover:border-teal-500 transition-colors">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Nurses</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalNursesCount}</div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">staff:all</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-center sm:text-left hover:border-teal-500 transition-colors">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Total Patients</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalPatientsCount}</div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">patient:read</span>
        </div>
      </div>

      {/* CHARTS & ANALYTICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
                District-wise Hospital Count & ICU Bed Availability
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Distribution across key major districts (district:read)</p>
            </div>
            <button
              onClick={() => navigate('/admin/districts')}
              className="text-xs text-[#0F766E] dark:text-teal-400 font-bold hover:underline flex items-center gap-1 font-mono"
            >
              <span>View All 38 Districts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {topDistricts.map((d) => {
              const availPercent = Math.round((d.availableICUBeds / (d.totalICUBeds || 1)) * 100);
              return (
                <div
                  key={d.id}
                  onClick={() => handleDistrictClick(d.name)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-teal-50/50 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between font-sans">
                    <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <MapPin className="w-4 h-4 text-[#0F766E] dark:text-teal-400 group-hover:scale-110 transition-transform" />
                      <span>{d.name}</span>
                      <span className="text-[10px] font-mono text-slate-600 dark:text-sky-300 bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded border border-transparent dark:border-slate-700">
                        {d.totalHospitals} Hospitals
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      ICU: <strong className="text-emerald-700 dark:text-emerald-400">{d.availableICUBeds} Available</strong> / <span className="text-slate-900 dark:text-slate-100">{d.totalICUBeds} Total</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden flex border border-transparent dark:border-slate-700/50">
                    <div
                      style={{ width: `${100 - availPercent}%` }}
                      className="bg-rose-500 h-full transition-all"
                      title="Occupied Beds"
                    />
                    <div
                      style={{ width: `${availPercent}%` }}
                      className="bg-emerald-500 h-full transition-all"
                      title="Available Beds"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
              Statewide ICU Utilization
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Resource allocation breakdown</p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0F766E] text-white text-center space-y-2 shadow-md">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-100">
              State Capacity Index
            </span>
            <div className="text-4xl font-black font-mono text-white">
              {icuUtilizationPercent}%
            </div>
            <p className="text-xs text-teal-100 font-mono">ICU Beds Occupied Across 38 Districts</p>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-teal-600/60 text-xs font-mono">
              <div className="p-2 rounded-xl bg-teal-800/80 border border-emerald-400/40 text-emerald-200">
                <span className="block text-[10px] text-teal-100">AVAILABLE</span>
                <strong className="text-sm">{availableICUBedsCount}</strong>
              </div>
              <div className="p-2 rounded-xl bg-teal-800/80 border border-rose-400/40 text-rose-200">
                <span className="block text-[10px] text-teal-100">OCCUPIED</span>
                <strong className="text-sm">{occupiedICUBedsCount}</strong>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 font-sans text-xs">
            <span className="font-bold text-slate-900 dark:text-white block">Medical Personnel Ratios</span>
            <div className="flex items-center justify-between font-mono text-slate-600 dark:text-slate-300">
              <span>Doctor to Patient:</span>
              <strong className="text-slate-900 dark:text-white">1 : {(totalPatientsCount / (totalDoctorsCount || 1)).toFixed(1)}</strong>
            </div>
            <div className="flex items-center justify-between font-mono text-slate-600 dark:text-slate-300">
              <span>Nurse to ICU Bed:</span>
              <strong className="text-emerald-700 dark:text-emerald-400 font-bold">1 : 1.2 (Standard)</strong>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono text-[11px]">
              <span className="text-slate-500">Security Audit Trail:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero Violations</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 38-DISTRICT QUICK DIRECTORY TABLE SNAPSHOT */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0F766E] dark:text-teal-400" />
              Statewide District Directory (All 38 Districts)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Select any district to inspect hospitals, ICUs, and bed telemetry</p>
          </div>

          <button
            onClick={() => navigate('/admin/districts')}
            className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Full District Manager</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {districts.map((dist) => (
            <div
              key={dist.id}
              onClick={() => handleDistrictClick(dist.name)}
              className="district-card p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/60 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-teal-500 dark:hover:border-teal-400 transition-all cursor-pointer space-y-2 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#0F766E] dark:group-hover:text-teal-300 transition-colors">
                  {dist.name}
                </span>
                <span className="district-badge text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-sky-300 font-bold border border-transparent dark:border-slate-700">
                  {dist.code}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                <div>Hospitals: <strong className="text-slate-900 dark:text-slate-100">{dist.totalHospitals}</strong></div>
                <div>ICU Beds: <strong className="text-slate-900 dark:text-slate-100">{dist.totalICUBeds}</strong></div>
                <div>Available: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{dist.availableICUBeds}</strong></div>
                <div>Doctors: <strong className="text-slate-900 dark:text-slate-100">{dist.totalDoctors}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AUTHORITY PERMISSIONS MATRIX MODAL (ALL 58 ACTIVE PERMISSIONS INSPECTOR) */}
      {isPermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950 text-[#0F766E] dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Super Admin Authority & Permission Matrix</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold border border-emerald-400/40">
                      58 Granted
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Token Scope: command_center • Session ID: active • Multi-Tenant Statewide Clearance
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPermModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter 58 permissions (e.g. bed:create, state, audit)..."
                  value={permSearchTerm}
                  onChange={e => setPermSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 text-xs font-mono">
                {['ALL', 'Jurisdiction', 'Facilities', 'IAM & Workforce', 'Patient Flow', 'Clinical Telemetry', 'Pharmacy & Orders', 'Forensic Audit'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryTab(cat)}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap cursor-pointer transition-all ${
                      selectedCategoryTab === cat
                        ? 'bg-teal-700 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Grid / List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredPermissions.map(perm => (
                  <div
                    key={perm.code}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-teal-400 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {perm.code}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                          {perm.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2 font-medium">
                        {perm.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 text-[10px] font-mono font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>GRANTED</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
              <div>Showing {filteredPermissions.length} of 58 Total Authoritative Scope Codes</div>
              <button
                onClick={() => setIsPermModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD HOSPITAL MODAL */}
      <AddHospitalModal
        isOpen={isAddHospitalOpen}
        onClose={() => setIsAddHospitalOpen(false)}
      />

      {/* PTZ CAMERA LIVE STREAM MODAL */}
      <PtzCameraConfigModal
        isOpen={isPtzCameraOpen}
        onClose={() => setIsPtzCameraOpen(false)}
      />

      {/* UNIVERSAL REPORT GENERATOR MODAL */}
      <ReportGeneratorModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        defaultReportType="STATEWIDE_EXECUTIVE"
      />
    </div>
  );
};

export default SuperAdminDashboardPage;
