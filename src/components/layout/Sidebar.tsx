import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { useRBAC } from '../../hooks/useRBAC';
import {
  LayoutDashboard,
  Users,
  User,
  UserCheck,
  Cpu,
  Activity,
  FileSpreadsheet,
  FileText,
  HeartPulse,
  ClipboardList,
  Stethoscope,
  Truck,
  Video,
  Layers,
  ShieldCheck,
  BarChart3,
  Settings,
  Sliders,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  X,
  Building2,
  Radio,
  Network,
  Siren,
  Bed,
  Calendar,
  History,
  ShieldAlert,
  PlusCircle,
  Globe2,
  MapPin
} from 'lucide-react';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  category: string;
  onClick?: () => void;
}

export interface CategoryConfig {
  id: string;
  title: string;
  icon: React.ElementType;
}

// ================= SUPER ADMIN CATEGORY DEFINITION =================
const SUPER_ADMIN_CATEGORIES: CategoryConfig[] = [
  { id: 'DASHBOARD', title: 'Dashboard', icon: LayoutDashboard },
  { id: 'COMMAND_CENTER', title: 'Command Center', icon: Radio },
  { id: 'ORGANIZATION', title: 'Organization', icon: Network },
  { id: 'EMERGENCY', title: 'Emergency & Remote Care', icon: Siren },
  { id: 'CLINICAL', title: 'Clinical Operations', icon: HeartPulse },
  { id: 'QUALITY', title: 'Quality & Administration', icon: ShieldCheck },
  { id: 'SETTINGS', title: 'Settings', icon: Sliders },
  { id: 'USER_MENU', title: 'User Menu', icon: UserCheck }
];

// ================= HOSPITAL ADMIN CATEGORY DEFINITION =================
const HOSPITAL_ADMIN_DIRECT_ITEMS: MenuItem[] = [
  {
    id: 'admin-command-center',
    label: 'ICU Command Center',
    path: '/command-center',
    icon: Activity,
    badge: 'LIVE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    category: 'DIRECT'
  },
  {
    id: 'admin-hospital-overview',
    label: 'Hospital Overview',
    path: '/admin/hospital-overview',
    icon: Building2,
    badge: 'LIVE',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    category: 'DIRECT'
  },
  {
    id: 'admin-director',
    label: 'Director Profile',
    path: '/admin/director',
    icon: UserCheck,
    badge: 'Director',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
    category: 'DIRECT'
  }
];

const HOSPITAL_ADMIN_CATEGORIES: CategoryConfig[] = [
  { id: 'STAFF_MANAGEMENT', title: 'Staff Management', icon: Users },
  { id: 'ICU_OPERATIONS', title: 'ICU Operations', icon: Layers },
  { id: 'CLINICAL_OPERATIONS', title: 'Clinical Operations', icon: Activity },
  { id: 'REPORTING_SECURITY', title: 'Reporting & Security', icon: ShieldCheck }
];

// ================= STANDARD PLATFORM CATEGORY DEFINITION (DOCTOR / NURSE / ADMIN) =================
const PLATFORM_CATEGORIES: CategoryConfig[] = [
  { id: 'COMMAND CENTER', title: 'Command Center', icon: Radio },
  { id: 'CLINICAL MONITORING', title: 'Clinical Monitoring', icon: Activity },
  { id: 'DIAGNOSTICS & PHARMA', title: 'Diagnostics & Pharma', icon: FileSpreadsheet },
  { id: 'CARE WORKFLOW', title: 'Care Workflow', icon: ClipboardList },
  { id: 'EMERGENCY & REMOTE', title: 'Emergency & Remote', icon: Siren },
  { id: 'QUALITY & ADMINISTRATION', title: 'Quality & Administration', icon: ShieldCheck }
];

// ================= E-CLINIC CATEGORY DEFINITION =================
const ECLINIC_CATEGORIES: CategoryConfig[] = [
  { id: 'ECLINIC_CLINICAL', title: 'Clinical OPD', icon: HeartPulse },
  { id: 'ECLINIC_TELEMED', title: 'Tele-Consultation', icon: Video },
  { id: 'ECLINIC_MANAGEMENT', title: 'Operations & Audit', icon: ShieldCheck }
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileDrawer = false,
  onCloseMobileDrawer
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { activeRole, currentUser } = useAppSelector(state => state.auth);
  const { can, canAccessModule } = useRBAC();
  const isEClinicMode = location.pathname.startsWith('/eclinic');
  const { hospitals, doctors, nurses, patients } = useAppSelector(state => state.superAdmin);
  const {
    doctors: adminDoctors,
    nurses: adminNurses,
    icus: adminIcus,
    beds: adminBeds,
    encounters: adminEncounters,
    remarks: adminRemarks,
    shifts: adminShifts
  } = useAppSelector(state => state.hospitalAdmin);

  const collapsed = isMobileDrawer ? false : isCollapsed;

  const handleLogoutClick = () => {
    dispatch(logout());
    navigate('/login');
  };

  // ================= EXACT SUPER ADMIN SPECIFICATION: TREE MATRIX =================
  const superAdminMenuItems: MenuItem[] = [
    // DASHBOARD
    {
      id: 'super-dashboard',
      label: 'Overall ICU Overview',
      path: '/dashboard/overview',
      icon: LayoutDashboard,
      badge: 'Hospital',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'DASHBOARD'
    },

    // COMMAND CENTER
    {
      id: 'command-center',
      label: 'ICU Command Center',
      path: '/command-center',
      icon: Activity,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      category: 'COMMAND_CENTER'
    },
    {
      id: 'devices-command',
      label: 'Multi-Type Device Command Center',
      path: '/devices',
      icon: Cpu,
      category: 'COMMAND_CENTER'
    },

    // ORGANIZATION
    {
      id: 'org-parent-trusts',
      label: 'Organizations',
      path: '/admin/organizations',
      icon: Network,
      badge: 'TRUST',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      category: 'ORGANIZATION'
    },
    {
      id: 'org-state-hierarchy',
      label: 'State Hierarchy',
      path: '/admin/states',
      icon: Globe2,
      badge: 'GOV',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'ORGANIZATION'
    },
    {
      id: 'org-districts',
      label: 'Districts',
      path: '/admin/districts',
      icon: MapPin,
      badge: 38,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      category: 'ORGANIZATION'
    },
    {
      id: 'org-hospitals',
      label: 'Hospitals',
      path: '/admin/hospitals',
      icon: Building2,
      badge: hospitals.length || 4,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'ORGANIZATION'
    },
    {
      id: 'org-doctors',
      label: 'Doctors',
      path: '/admin/doctor-management',
      icon: Stethoscope,
      badge: doctors.length || 6,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      category: 'ORGANIZATION'
    },
    {
      id: 'org-nurses',
      label: 'Nurses',
      path: '/admin/nurse-management',
      icon: Users,
      badge: nurses.length || 6,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      category: 'ORGANIZATION'
    },
    {
      id: 'org-patients',
      label: 'Patients',
      path: '/admin/patient-management',
      icon: UserCheck,
      badge: patients.length || 12,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      category: 'ORGANIZATION'
    },
    {
      id: 'org-users',
      label: 'User Management',
      path: '/admin/users',
      icon: Users,
      badge: 'RBAC',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'ORGANIZATION'
    },

    // EMERGENCY & REMOTE CARE
    {
      id: 'ambulance',
      label: 'Ambulance Command',
      path: '/ambulance',
      icon: Truck,
      badge: 'GPS',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      category: 'EMERGENCY'
    },
    {
      id: 'video',
      label: 'Video Command',
      path: '/video',
      icon: Video,
      badge: 'PTZ Live',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'EMERGENCY'
    },
    {
      id: 'virtual-icu',
      label: 'Virtual ICU',
      path: '/virtual-icu',
      icon: Layers,
      category: 'EMERGENCY'
    },

    // CLINICAL OPERATIONS
    {
      id: 'patient-monitoring',
      label: 'Patient Monitoring',
      path: '/live-monitoring',
      icon: Activity,
      badge: 'ECG/ART',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      category: 'CLINICAL'
    },
    {
      id: 'alerts',
      label: 'Alerts & Escalation',
      path: '/alerts',
      icon: Bell,
      badge: 'Active',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      category: 'CLINICAL'
    },
    {
      id: 'orders',
      label: 'Orders',
      path: '/orders',
      icon: ClipboardList,
      category: 'CLINICAL'
    },
    {
      id: 'medications',
      label: 'Medications',
      path: '/medications',
      icon: HeartPulse,
      badge: 'MAR',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      category: 'CLINICAL'
    },
    {
      id: 'nursing',
      label: 'Nursing',
      path: '/nursing',
      icon: Stethoscope,
      badge: 'Flowsheet',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'CLINICAL'
    },
    {
      id: 'handover',
      label: 'Handover',
      path: '/handover',
      icon: FileText,
      badge: 'ISBAR',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      category: 'CLINICAL'
    },

    // QUALITY & ADMINISTRATION
    {
      id: 'governance',
      label: 'Governance 360',
      path: '/governance-360',
      icon: ShieldCheck,
      category: 'QUALITY'
    },
    {
      id: 'analytics',
      label: 'Analytics & KPIs',
      path: '/analytics',
      icon: BarChart3,
      category: 'QUALITY'
    },
    {
      id: 'admin',
      label: 'Admin / RBAC',
      path: '/admin/roles',
      icon: Settings,
      category: 'QUALITY'
    },

    // SETTINGS
    {
      id: 'settings-device',
      label: 'Device Management',
      path: '/admin/settings',
      icon: Cpu,
      category: 'SETTINGS'
    },
    {
      id: 'settings-integrations',
      label: 'Integrations',
      path: '/admin/settings',
      icon: Sliders,
      category: 'SETTINGS'
    },
    {
      id: 'settings-health',
      label: 'System Health',
      path: '/admin/activity-logs',
      icon: Activity,
      category: 'SETTINGS'
    },
    {
      id: 'settings-add-icu',
      label: 'Add ICU',
      path: '/admin/add-icu',
      icon: PlusCircle,
      badge: 'Add',
      badgeColor: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
      category: 'SETTINGS'
    },

    // USER MENU
    {
      id: 'user-profile',
      label: 'Profile',
      path: '/doctor/profile',
      icon: User,
      category: 'USER_MENU'
    },
    {
      id: 'user-security',
      label: 'Security',
      path: '/admin/roles',
      icon: ShieldCheck,
      category: 'USER_MENU'
    },
    {
      id: 'user-logout',
      label: 'Logout',
      path: '/login',
      icon: LogOut,
      category: 'USER_MENU',
      onClick: handleLogoutClick
    }
  ];

  // ================= STANDARD ROLE SPECIFICATION (DOCTOR / NURSE / ADMIN) =================
  const platformMenuItems: MenuItem[] = [
    // COMMAND CENTER
    { id: 'dashboard-overview', label: 'Dashboard Overview', path: '/dashboard/overview', icon: LayoutDashboard, badge: 'Hospital', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30', category: 'COMMAND CENTER' },
    { id: 'command-center', label: 'ICU Command Center', path: '/command-center', icon: Activity, badge: 'LIVE', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', category: 'COMMAND CENTER' },
    
    // CLINICAL MONITORING
    { id: 'patients', label: 'Patients', path: '/patients', icon: Users, badge: '18 Beds', badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30', category: 'CLINICAL MONITORING' },
    { id: 'devices', label: 'Devices', path: '/devices', icon: Cpu, category: 'CLINICAL MONITORING' },
    { id: 'waveforms', label: 'Waveforms', path: '/waveforms', icon: Activity, badge: 'ECG/ART', badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30', category: 'CLINICAL MONITORING' },
    
    // DIAGNOSTICS & PHARMA
    { id: 'labs', label: 'Labs', path: '/labs', icon: FileSpreadsheet, category: 'DIAGNOSTICS & PHARMA' },
    { id: 'imaging', label: 'Imaging / PACS', path: '/imaging', icon: FileText, category: 'DIAGNOSTICS & PHARMA' },
    { id: 'medications', label: 'Medications', path: '/medications', icon: HeartPulse, badge: 'MAR', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30', category: 'DIAGNOSTICS & PHARMA' },
    
    // CARE WORKFLOW
    { id: 'orders', label: 'Doctor Orders', path: '/orders', icon: ClipboardList, category: 'CARE WORKFLOW' },
    { id: 'nursing', label: 'Nursing', path: '/nursing', icon: Stethoscope, badge: 'Flowsheet', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30', category: 'CARE WORKFLOW' },
    { id: 'care-plan', label: 'Care Plan', path: '/care-plan', icon: FileText, category: 'CARE WORKFLOW' },
    
    // EMERGENCY & REMOTE
    { id: 'ambulance', label: 'Ambulance Command', path: '/ambulance', icon: Truck, badge: 'GPS', badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30', category: 'EMERGENCY & REMOTE' },
    { id: 'video', label: 'Video Command', path: '/video', icon: Video, badge: 'PTZ Live', badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30', category: 'EMERGENCY & REMOTE' },
    { id: 'virtual-icu', label: 'Virtual ICU', path: '/virtual-icu', icon: Layers, category: 'EMERGENCY & REMOTE' },
    
    // QUALITY & ADMINISTRATION
    { id: 'governance', label: 'Governance 360', path: '/governance-360', icon: ShieldCheck, category: 'QUALITY & ADMINISTRATION' },
    { id: 'analytics', label: 'Analytics & KPIs', path: '/analytics', icon: BarChart3, category: 'QUALITY & ADMINISTRATION' },
    { id: 'admin', label: 'Admin / RBAC', path: '/admin/roles', icon: Settings, category: 'QUALITY & ADMINISTRATION' }
  ];

  // ================= HOSPITAL ADMIN MENU SPECIFICATION =================
  const hospitalAdminMenuItems: MenuItem[] = [
    // STAFF MANAGEMENT
    {
      id: 'admin-doctor-roster',
      label: 'Doctor Roster',
      path: '/admin/hospital-doctors',
      icon: Stethoscope,
      badge: `${adminDoctors?.length || 18} Doctors`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      category: 'STAFF_MANAGEMENT'
    },
    {
      id: 'admin-nurse-roster',
      label: 'Nurse Roster',
      path: '/admin/hospital-nurses',
      icon: HeartPulse,
      badge: `${adminNurses?.length || 42} Nurses`,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'STAFF_MANAGEMENT'
    },
    {
      id: 'admin-shift-management',
      label: 'Shift Management',
      path: '/admin/hospital-shifts',
      icon: Calendar,
      badge: `${adminShifts?.length || 3} Shifts`,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      category: 'STAFF_MANAGEMENT'
    },

    // ICU OPERATIONS
    {
      id: 'admin-icu-units',
      label: 'ICU Units',
      path: '/admin/hospital-icus',
      icon: Network,
      badge: `${adminIcus?.length || 6} Units`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      category: 'ICU_OPERATIONS'
    },
    {
      id: 'admin-bed-map',
      label: 'Interactive Bed Map',
      path: '/admin/bed-map',
      icon: Bed,
      badge: `${adminBeds?.length || 72} Beds`,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'ICU_OPERATIONS'
    },
    {
      id: 'admin-patient-census',
      label: 'Patient Census',
      path: '/admin/hospital-patients',
      icon: Users,
      badge: `${patients?.length || 68} Census`,
      badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      category: 'ICU_OPERATIONS'
    },
    {
      id: 'admin-add-icu',
      label: 'Add ICU',
      path: '/admin/add-icu',
      icon: PlusCircle,
      badge: 'Add',
      badgeColor: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/40',
      category: 'ICU_OPERATIONS'
    },

    // CLINICAL OPERATIONS
    {
      id: 'admin-encounters',
      label: 'Encounters',
      path: '/admin/encounters',
      icon: ClipboardList,
      badge: `${adminEncounters?.length || 18} Cases`,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'CLINICAL_OPERATIONS'
    },
    {
      id: 'admin-remarks',
      label: 'Remarks & Audits',
      path: '/admin/remarks',
      icon: ShieldAlert,
      badge: `${adminRemarks?.length || 12} Audits`,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      category: 'CLINICAL_OPERATIONS'
    },
    {
      id: 'admin-timeline',
      label: 'Hospital Timeline',
      path: '/admin/timeline',
      icon: History,
      badge: 'Timeline',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'CLINICAL_OPERATIONS'
    },

    // REPORTING & SECURITY
    {
      id: 'admin-custom-reports',
      label: 'Custom Reports',
      path: '/admin/custom-reports',
      icon: FileSpreadsheet,
      badge: 'Reports',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'REPORTING_SECURITY'
    },
    {
      id: 'admin-activity-logs',
      label: 'Activity Logs',
      path: '/admin/activity-logs',
      icon: Activity,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      category: 'REPORTING_SECURITY'
    },
    {
      id: 'admin-rbac-roles',
      label: 'Admin / RBAC',
      path: '/admin/roles',
      icon: Settings,
      badge: 'RBAC',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'REPORTING_SECURITY'
    }
  ];

  // ================= E-CLINIC MENU SPECIFICATION =================
  const eclinicDirectItems: MenuItem[] = [
    {
      id: 'eclinic-dashboard',
      label: 'E-Clinic Overview',
      path: '/eclinic',
      icon: LayoutDashboard,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      category: 'DIRECT'
    },
    {
      id: 'eclinic-queue',
      label: 'Live Queue & Triage',
      path: '/eclinic/queue',
      icon: Activity,
      badge: 'OPD',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'DIRECT'
    }
  ];

  const eclinicMenuItems: MenuItem[] = [
    // CLINICAL OPD
    {
      id: 'eclinic-patients',
      label: 'Patient Directory',
      path: '/eclinic/patients',
      icon: Users,
      category: 'ECLINIC_CLINICAL'
    },
    {
      id: 'eclinic-appointments',
      label: 'Appointments',
      path: '/eclinic/appointments',
      icon: Calendar,
      category: 'ECLINIC_CLINICAL'
    },
    ...(can('canCaptureVitals') ? [{
      id: 'eclinic-vitals',
      label: 'Vitals Capture',
      path: '/eclinic/vitals',
      icon: HeartPulse,
      badge: 'Triage',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      category: 'ECLINIC_CLINICAL'
    }] : []),
    {
      id: 'eclinic-doctors',
      label: 'Doctor Directory',
      path: '/eclinic/doctors',
      icon: Stethoscope,
      category: 'ECLINIC_CLINICAL'
    },

    // TELE-CONSULTATION
    ...(can('canStartConsultation') ? [
      {
        id: 'eclinic-workspace',
        label: 'Doctor Workspace',
        path: '/eclinic/doctor-workspace',
        icon: Layers,
        badge: 'Cockpit',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
        category: 'ECLINIC_TELEMED'
      },
      {
        id: 'eclinic-telemed',
        label: 'Tele-Consultation',
        path: '/eclinic/telemedicine',
        icon: Video,
        badge: 'HD',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
        category: 'ECLINIC_TELEMED'
      }
    ] : []),

    // OPERATIONS & AUDIT
    ...(can('canViewAnalytics') ? [{
      id: 'eclinic-reports',
      label: 'Reports & Analytics',
      path: '/eclinic/reports',
      icon: BarChart3,
      category: 'ECLINIC_MANAGEMENT'
    }] : []),
    ...(canAccessModule('ICU') ? [{
      id: 'switch-to-icu',
      label: 'Switch to Smart ICU',
      path: '/command-center',
      icon: Radio,
      badge: '18 Units',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      category: 'ECLINIC_MANAGEMENT'
    }] : [])
  ];

  // Helper to determine active item
  const isItemActive = (item: MenuItem) => {
    if (location.pathname === item.path) return true;
    if (item.path === '/eclinic' && location.pathname === '/eclinic') return true;
    if (item.path === '/eclinic/patients' && location.pathname.startsWith('/eclinic/patients')) return true;
    if (item.path === '/eclinic/queue' && location.pathname === '/eclinic/queue') return true;
    if (item.path === '/eclinic/appointments' && location.pathname === '/eclinic/appointments') return true;
    if (item.path === '/eclinic/vitals' && location.pathname === '/eclinic/vitals') return true;
    if (item.path === '/eclinic/doctors' && location.pathname === '/eclinic/doctors') return true;
    if (item.path === '/eclinic/doctor-workspace' && location.pathname === '/eclinic/doctor-workspace') return true;
    if (item.path === '/eclinic/telemedicine' && location.pathname === '/eclinic/telemedicine') return true;
    if (item.path === '/eclinic/reports' && location.pathname === '/eclinic/reports') return true;
    if (item.path === '/admin/hospital-overview') {
      return (
        location.pathname === '/admin' ||
        location.pathname === '/admin/overview' ||
        location.pathname === '/admin/dashboard' ||
        location.pathname === '/admin/hospital-overview'
      );
    }
    if (item.path === '/admin/hospital-doctors' && location.pathname === '/admin/doctors') return true;
    if (item.path === '/admin/hospital-nurses' && (location.pathname === '/admin/nurses' || location.pathname === '/admin/nurse-leads')) return true;
    if (item.path === '/admin/hospital-shifts' && location.pathname === '/admin/shifts') return true;
    if (item.path === '/admin/hospital-icus' && location.pathname === '/admin/icu-management') return true;
    if (item.path === '/admin/add-icu' && (location.pathname === '/admin/add-icu' || location.search.includes('add-icu'))) return true;
    if (item.path === '/admin/hospital-patients' && location.pathname === '/admin/patients') return true;
    if (item.path === '/admin/remarks' && (location.pathname === '/admin/doctor-remarks' || location.pathname === '/admin/nurse-remarks')) return true;
    if (item.path === '/admin/timeline' && location.pathname === '/admin/patient-timeline') return true;
    if (item.path === '/admin/custom-reports' && location.pathname === '/admin/reports') return true;
    if (item.path === '/admin/activity-logs' && location.pathname === '/admin/logs') return true;
    if (item.path === '/dashboard/overview' && (location.pathname === '/dashboard' || location.pathname === '/dashboard/overview')) return true;
    if (item.path === '/command-center' && location.pathname === '/') return true;
    return false;
  };

  // Select active configuration based on role
  const isSuperAdminRole = activeRole === 'SUPER_ADMIN';
  const isHospitalAdminRole =
    (activeRole as string) === 'ADMIN' ||
    (activeRole as string) === 'HOSPITAL_ADMIN' ||
    (activeRole as string) === 'SYSTEM_ADMIN';

  let currentCategories: CategoryConfig[] = [];
  let currentMenuItems: MenuItem[] = [];
  let currentDirectItems: MenuItem[] = [];

  if (isEClinicMode) {
    currentCategories = ECLINIC_CATEGORIES;
    currentMenuItems = eclinicMenuItems;
    currentDirectItems = eclinicDirectItems;
  } else if (isHospitalAdminRole) {
    currentCategories = HOSPITAL_ADMIN_CATEGORIES;
    currentMenuItems = hospitalAdminMenuItems;
    currentDirectItems = HOSPITAL_ADMIN_DIRECT_ITEMS;
  } else if (isSuperAdminRole) {
    currentCategories = SUPER_ADMIN_CATEGORIES;
    currentMenuItems = superAdminMenuItems;
    currentDirectItems = [];
  } else {
    currentCategories = PLATFORM_CATEGORIES;
    currentMenuItems = platformMenuItems;
    currentDirectItems = [];
  }

  // Helper to determine if a category contains the active page
  const isCategoryActive = (categoryId: string) => {
    const items = currentMenuItems.filter(i => i.category === categoryId);
    return items.some(isItemActive);
  };

  // State to track which categories are open
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    currentCategories.forEach(cat => {
      const items = currentMenuItems.filter(i => i.category === cat.id);
      if (items.some(isItemActive)) {
        initial[cat.id] = true;
      }
    });
    // Open first category if none active
    if (Object.keys(initial).length === 0 && currentCategories.length > 0) {
      initial[currentCategories[0].id] = true;
    }
    return initial;
  });

  // Keep active category expanded on route or role change
  useEffect(() => {
    currentCategories.forEach(cat => {
      const items = currentMenuItems.filter(i => i.category === cat.id);
      if (items.some(isItemActive)) {
        setOpenCategories(prev => ({
          ...prev,
          [cat.id]: true
        }));
      }
    });
  }, [location.pathname, activeRole]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  return (
    <aside
      className={`bg-[#0F766E] text-white flex flex-col justify-between border-r border-[#0D655E] shadow-md transition-all duration-300 select-none z-30 ${
        isMobileDrawer ? 'w-72 h-full' : collapsed ? 'w-20 h-full' : 'w-64 h-full'
      }`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        {/* Sidebar Header Bar */}
        <div className="px-4 py-3 border-b border-[#0D655E] flex items-center justify-between shrink-0 bg-[#0D655E]/60">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-wider text-white bg-[#10B981] px-2.5 py-0.5 rounded border border-[#059669] uppercase shadow-xs">
                {isEClinicMode ? 'NAIMIFY E-CLINIC' : isHospitalAdminRole ? 'HOSPITAL ADMIN' : isSuperAdminRole ? 'COMMAND CENTER' : `${activeRole} PORTAL`}
              </span>
            </div>
          )}

          {isMobileDrawer ? (
            <button onClick={onCloseMobileDrawer} className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-[#0D655E]">
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-[#0D655E] hidden lg:block ml-auto cursor-pointer"
              title={collapsed ? 'Expand Left Menu' : 'Collapse Left Menu'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Left Menu Items (Collapsible Accordion for ALL Roles) */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1.5 text-xs font-sans custom-scrollbar">
          {/* Direct Items (e.g. Hospital Overview, Director Profile for Hospital Admin) */}
          {currentDirectItems.length > 0 && (
            <div className="space-y-1 mb-2 pb-2 border-b border-[#0D655E]/80">
              {currentDirectItems.map(item => {
                const Icon = item.icon;
                const active = isItemActive(item);

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={isMobileDrawer ? onCloseMobileDrawer : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                      active
                        ? 'bg-[#10B981] text-white shadow-xs font-bold'
                        : 'text-teal-100/90 hover:bg-[#0D655E] hover:text-white'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                          active
                            ? 'bg-white text-teal-800 shadow-xs'
                            : 'bg-[#0B5650] text-teal-200 group-hover:bg-[#10B981] group-hover:text-white border border-teal-500/30'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                      </div>

                      {!collapsed && (
                        <span className="truncate font-sans font-bold tracking-wide text-xs">
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold shrink-0 ${
                          active
                            ? 'bg-white/20 text-white border border-white/30'
                            : item.badgeColor || 'bg-teal-900/60 text-teal-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}

          {currentCategories.map(cat => {
            const categoryItems = currentMenuItems.filter(i => i.category === cat.id);
            if (categoryItems.length === 0) return null;

            const isCategoryOpen = !!openCategories[cat.id];
            const categoryActive = isCategoryActive(cat.id);
            const CategoryIcon = cat.icon;

            return (
              <div key={cat.id} className="space-y-1">
                {/* Category Main Item (Professional Icon & Clickable Header) */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isCategoryOpen
                      ? 'bg-[#0D655E] text-white border border-teal-500/50 shadow-xs'
                      : categoryActive
                      ? 'bg-[#0D655E]/70 text-white border border-teal-500/30'
                      : 'text-teal-100/90 hover:bg-[#0D655E]/60 hover:text-white'
                  }`}
                  title={collapsed ? cat.title : `Click to toggle ${cat.title}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Modern Professional Vector Icon Chip */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                        isCategoryOpen
                          ? 'bg-[#10B981] text-white shadow-xs'
                          : categoryActive
                          ? 'bg-teal-700/80 text-white border border-teal-400/40'
                          : 'bg-[#0B5650] text-teal-200 group-hover:bg-[#10B981] group-hover:text-white border border-teal-500/30'
                      }`}
                    >
                      <CategoryIcon className="w-3.5 h-3.5 shrink-0" />
                    </div>

                    {!collapsed && (
                      <span className="truncate font-sans font-bold tracking-wide text-xs text-white">
                        {cat.title}
                      </span>
                    )}
                  </div>

                  {!collapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          categoryActive || isCategoryOpen
                            ? 'bg-teal-400/25 text-teal-100 border border-teal-400/30'
                            : 'bg-teal-900/60 text-teal-300'
                        }`}
                      >
                        {categoryItems.length}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-teal-300 transition-transform duration-200 shrink-0 ${
                          isCategoryOpen ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                  )}
                </button>

                {/* Inner Components (Rendered ONLY when clicked / open) */}
                {isCategoryOpen && !collapsed && (
                  <div className="pl-4 ml-4.5 space-y-1 border-l-2 border-teal-500/30 animate-in fade-in slide-in-from-top-1 duration-150 my-1">
                    {categoryItems.map(item => {
                      const Icon = item.icon;
                      const active = isItemActive(item);

                      return item.onClick ? (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (isMobileDrawer && onCloseMobileDrawer) onCloseMobileDrawer();
                            item.onClick!();
                          }}
                          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group text-rose-200 hover:bg-rose-500/20 hover:text-white cursor-pointer"
                          title={item.label}
                        >
                          <div className="w-5.5 h-5.5 rounded-md flex items-center justify-center bg-rose-950/40 text-rose-300 group-hover:bg-rose-500/30 group-hover:text-rose-100 shrink-0">
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                          </div>
                          <span className="truncate flex-1 text-left">{item.label}</span>
                        </button>
                      ) : (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          onClick={isMobileDrawer ? onCloseMobileDrawer : undefined}
                          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group relative cursor-pointer ${
                            active
                              ? 'bg-[#10B981] text-white font-bold border border-[#059669] shadow-xs'
                              : 'text-teal-100/85 hover:bg-[#0D655E] hover:text-white'
                          }`}
                          title={item.label}
                        >
                          <div
                            className={`w-5.5 h-5.5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                              active
                                ? 'bg-white/20 text-white'
                                : 'bg-teal-900/40 text-teal-300 group-hover:bg-teal-700/50 group-hover:text-white'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                          </div>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded-full border font-mono shrink-0 ${
                                active
                                  ? 'bg-white/20 text-white border-white/30'
                                  : item.badgeColor || 'bg-[#0D655E] text-teal-100 border-teal-500/40'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout in footer */}
      <div className="p-3 border-t border-[#0D655E] shrink-0 bg-[#0D655E]/50">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#10B981] border border-[#059669] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-xs text-white truncate block">{currentUser.name}</span>
                <span className="text-[10px] text-teal-200 font-mono block truncate font-bold">{activeRole === 'SUPER_ADMIN' ? 'COMMAND CENTER' : activeRole}</span>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              title="Logout"
              className="p-2 rounded-xl text-rose-200 hover:bg-rose-500/20 hover:text-rose-100 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogoutClick}
            className="w-full py-2 flex items-center justify-center text-rose-200 hover:bg-rose-500/20 rounded-xl cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
