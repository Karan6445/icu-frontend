export type AppRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'ADMIN'
  | 'DIRECTOR'
  | 'CHARGE_NURSE'
  | 'NURSE_LEAD'
  | 'ECLINIC_ADMIN'
  | 'DOCTOR'
  | 'NURSE'
  | 'CLINIC_OPERATOR'
  | 'RECEPTIONIST';

export type AppNavModule = 'ICU' | 'E_CLINIC';

export interface RolePermissions {
  role: AppRole;
  displayName: string;
  badgeColor: string;
  allowedModules: AppNavModule[];
  // Actions
  canAccessIcu: boolean;
  canAccessEClinic: boolean;
  canRegisterPatient: boolean;
  canBookAppointment: boolean;
  canCheckIn: boolean;
  canManageQueue: boolean;
  canCaptureVitals: boolean;
  canStartConsultation: boolean;
  canCreatePrescription: boolean;
  canWriteSoapNotes: boolean;
  canCreateReferral: boolean;
  canViewClinicalHistory: boolean;
  canViewDiagnosis: boolean;
  canManageDoctors: boolean;
  canViewAuditLogs: boolean;
  canViewAnalytics: boolean;
}

export const ROLE_DEFINITIONS: Record<AppRole, RolePermissions> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    displayName: 'Super Administrator (Directorate)',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    allowedModules: ['ICU', 'E_CLINIC'],
    canAccessIcu: true,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: true,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: true,
    canCreatePrescription: true,
    canWriteSoapNotes: true,
    canCreateReferral: true,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: true,
    canViewAuditLogs: true,
    canViewAnalytics: true
  },
  HOSPITAL_ADMIN: {
    role: 'HOSPITAL_ADMIN',
    displayName: 'Hospital Operations Admin',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    allowedModules: ['ICU', 'E_CLINIC'],
    canAccessIcu: true,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: true,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: false,
    canCreatePrescription: false,
    canWriteSoapNotes: false,
    canCreateReferral: false,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: true,
    canViewAuditLogs: true,
    canViewAnalytics: true
  },
  ADMIN: {
    // Alias for HOSPITAL_ADMIN in legacy code
    role: 'ADMIN',
    displayName: 'Hospital Admin',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    allowedModules: ['ICU', 'E_CLINIC'],
    canAccessIcu: true,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: true,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: false,
    canCreatePrescription: false,
    canWriteSoapNotes: false,
    canCreateReferral: false,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: true,
    canViewAuditLogs: true,
    canViewAnalytics: true
  },
  DIRECTOR: {
    role: 'DIRECTOR',
    displayName: 'Chief Medical Director',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    allowedModules: ['ICU', 'E_CLINIC'],
    canAccessIcu: true,
    canAccessEClinic: true,
    canRegisterPatient: false,
    canBookAppointment: false,
    canCheckIn: false,
    canManageQueue: false,
    canCaptureVitals: false,
    canStartConsultation: true,
    canCreatePrescription: true,
    canWriteSoapNotes: true,
    canCreateReferral: true,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: true,
    canViewAuditLogs: true,
    canViewAnalytics: true
  },
  ECLINIC_ADMIN: {
    role: 'ECLINIC_ADMIN',
    displayName: 'E-Clinic Operations Director',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    allowedModules: ['E_CLINIC'],
    canAccessIcu: false,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: true,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: false,
    canCreatePrescription: false,
    canWriteSoapNotes: false,
    canCreateReferral: false,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: true,
    canViewAuditLogs: true,
    canViewAnalytics: true
  },
  DOCTOR: {
    role: 'DOCTOR',
    displayName: 'Attending Physician / Intensivist',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    allowedModules: ['ICU', 'E_CLINIC'],
    canAccessIcu: true,
    canAccessEClinic: true,
    canRegisterPatient: false,
    canBookAppointment: false,
    canCheckIn: false,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: true,
    canCreatePrescription: true,
    canWriteSoapNotes: true,
    canCreateReferral: true,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: false,
    canViewAuditLogs: false,
    canViewAnalytics: true
  },
  NURSE: {
    role: 'NURSE',
    displayName: 'Critical Care Staff Nurse',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    allowedModules: ['ICU', 'E_CLINIC'],
    canAccessIcu: true,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: false,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: false,
    canCreatePrescription: false,
    canWriteSoapNotes: false,
    canCreateReferral: false,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: false,
    canViewAuditLogs: false,
    canViewAnalytics: false
  },
  NURSE_LEAD: {
    role: 'NURSE_LEAD',
    displayName: 'ICU Nurse Lead',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    allowedModules: ['ICU', 'E_CLINIC'],
    canAccessIcu: true,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: false,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: false,
    canCreatePrescription: false,
    canWriteSoapNotes: true,
    canCreateReferral: false,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: false,
    canViewAuditLogs: false,
    canViewAnalytics: true
  },
  CHARGE_NURSE: {
    role: 'CHARGE_NURSE',
    displayName: 'ICU Charge Nurse & Clinical Care Lead',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    allowedModules: ['ICU', 'E_CLINIC'],
    canAccessIcu: true,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: false,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: false,
    canCreatePrescription: false,
    canWriteSoapNotes: true,
    canCreateReferral: false,
    canViewClinicalHistory: true,
    canViewDiagnosis: true,
    canManageDoctors: false,
    canViewAuditLogs: false,
    canViewAnalytics: true
  },
  CLINIC_OPERATOR: {
    role: 'CLINIC_OPERATOR',
    displayName: 'E-Clinic Operator',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    allowedModules: ['E_CLINIC'],
    canAccessIcu: false,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: true,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: true,
    canStartConsultation: false,
    canCreatePrescription: false,
    canWriteSoapNotes: false,
    canCreateReferral: false,
    canViewClinicalHistory: false, // Protected
    canViewDiagnosis: false, // Sensitive
    canManageDoctors: false,
    canViewAuditLogs: false,
    canViewAnalytics: false
  },
  RECEPTIONIST: {
    role: 'RECEPTIONIST',
    displayName: 'OPD Receptionist',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    allowedModules: ['E_CLINIC'],
    canAccessIcu: false,
    canAccessEClinic: true,
    canRegisterPatient: true,
    canBookAppointment: true,
    canCheckIn: true,
    canManageQueue: true,
    canCaptureVitals: false, // Clinical restriction
    canStartConsultation: false,
    canCreatePrescription: false,
    canWriteSoapNotes: false,
    canCreateReferral: false,
    canViewClinicalHistory: false, // Strict privacy shield
    canViewDiagnosis: false, // Strict privacy shield
    canManageDoctors: false,
    canViewAuditLogs: false,
    canViewAnalytics: false
  }
};

export const getRolePermissions = (role: string): RolePermissions => {
  return ROLE_DEFINITIONS[role as AppRole] || ROLE_DEFINITIONS.DOCTOR;
};

export interface HospitalAdminPermission {
  code: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'write';
  category: 'Facility & Units' | 'Workforce & IAM' | 'Patient Flow & Admissions' | 'Regional Jurisdiction' | 'Audit & Governance';
  description: string;
}

export const HOSPITAL_ADMIN_DETAILED_PERMISSIONS: HospitalAdminPermission[] = [
  // Facility & Units (12)
  { code: 'hospital:create', module: 'Hospital', action: 'create', category: 'Facility & Units', description: 'Commission and register new hospital facilities & branches' },
  { code: 'hospital:read', module: 'Hospital', action: 'read', category: 'Facility & Units', description: 'View assigned hospital operational metrics and profiles' },
  { code: 'hospital:update', module: 'Hospital', action: 'update', category: 'Facility & Units', description: 'Update facility parameters, emergency contacts and addresses' },
  { code: 'department:create', module: 'Department', action: 'create', category: 'Facility & Units', description: 'Provision hospital clinical wings and departmental units' },
  { code: 'department:read', module: 'Department', action: 'read', category: 'Facility & Units', description: 'Inspect departments, bed capacities, and HOD assignments' },
  { code: 'department:update', module: 'Department', action: 'update', category: 'Facility & Units', description: 'Modify department floor locations, wing allocations and leadership' },
  { code: 'icu:create', module: 'ICU', action: 'create', category: 'Facility & Units', description: 'Deploy new intensive care units (MICU, SICU, CICU, NICU)' },
  { code: 'icu:read', module: 'ICU', action: 'read', category: 'Facility & Units', description: 'Monitor ICU occupancy, floor layouts and ward leads' },
  { code: 'icu:update', module: 'ICU', action: 'update', category: 'Facility & Units', description: 'Reconfigure ICU unit specifications, protocols and capacities' },
  { code: 'bed:create', module: 'Bed', action: 'create', category: 'Facility & Units', description: 'Allocate and register new critical care telemetry beds' },
  { code: 'bed:read', module: 'Bed', action: 'read', category: 'Facility & Units', description: 'Inspect real-time bed occupancy, ventilators and status grid' },
  { code: 'bed:update', module: 'Bed', action: 'update', category: 'Facility & Units', description: 'Update bed status (Available, Occupied, Maintenance, Reserved)' },

  // Workforce & IAM (9)
  { code: 'staff:create', module: 'Staff', action: 'create', category: 'Workforce & IAM', description: 'Onboard medical doctors, nurse leads and critical care specialists' },
  { code: 'staff:read', module: 'Staff', action: 'read', category: 'Workforce & IAM', description: 'Access clinician rosters, shift allocations and duty status' },
  { code: 'staff:update', module: 'Staff', action: 'update', category: 'Workforce & IAM', description: 'Update clinician shift schedules, rotations and assignments' },
  { code: 'user:create', module: 'User', action: 'create', category: 'Workforce & IAM', description: 'Provision user login accounts and access credentials' },
  { code: 'user:read', module: 'User', action: 'read', category: 'Workforce & IAM', description: 'View user directory, active sessions and MFA enrollment' },
  { code: 'user:update', module: 'User', action: 'update', category: 'Workforce & IAM', description: 'Manage account statuses, password resets and security credentials' },
  { code: 'role:create', module: 'Role', action: 'create', category: 'Workforce & IAM', description: 'Create tailored institutional RBAC roles with scoped permissions' },
  { code: 'role:read', module: 'Role', action: 'read', category: 'Workforce & IAM', description: 'Inspect active hospital roles and privilege matrix' },
  { code: 'role:update', module: 'Role', action: 'update', category: 'Workforce & IAM', description: 'Update permission assignments for hospital staff roles' },

  // Patient Flow & Admissions (9)
  { code: 'admission:create', module: 'Admission', action: 'create', category: 'Patient Flow & Admissions', description: 'Admit patients to ICU wards, triage intake and emergency bed allocation' },
  { code: 'admission:read', module: 'Admission', action: 'read', category: 'Patient Flow & Admissions', description: 'Track admission status, encounter history and transfers' },
  { code: 'admission:update', module: 'Admission', action: 'update', category: 'Patient Flow & Admissions', description: 'Process bed transfers, update admission status and discharge triage' },
  { code: 'patient:create', module: 'Patient', action: 'create', category: 'Patient Flow & Admissions', description: 'Enroll new patient records into hospital master registry' },
  { code: 'patient:read', module: 'Patient', action: 'read', category: 'Patient Flow & Admissions', description: 'Access active patient census and demographic listings' },
  { code: 'patient:update', module: 'Patient', action: 'update', category: 'Patient Flow & Admissions', description: 'Update encounter records and patient acuity classification' },
  { code: 'patient:write', module: 'Patient', action: 'write', category: 'Patient Flow & Admissions', description: 'Commit administrative intake logs and case records' },
  { code: 'patient:demographics:read', module: 'Patient', action: 'read', category: 'Patient Flow & Admissions', description: 'Access protected patient demographic information' },
  { code: 'patient:demographics:write', module: 'Patient', action: 'write', category: 'Patient Flow & Admissions', description: 'Update identity, insurance, next-of-kin, and contact data' },

  // Regional Jurisdiction (6)
  { code: 'state:create', module: 'State', action: 'create', category: 'Regional Jurisdiction', description: 'Register state jurisdiction configuration for healthcare network' },
  { code: 'state:read', module: 'State', action: 'read', category: 'Regional Jurisdiction', description: 'Inspect regional healthcare territory hierarchy' },
  { code: 'state:update', module: 'State', action: 'update', category: 'Regional Jurisdiction', description: 'Update state regulatory affiliation parameters' },
  { code: 'district:create', module: 'District', action: 'create', category: 'Regional Jurisdiction', description: 'Enroll administrative health district linkage' },
  { code: 'district:read', module: 'District', action: 'read', category: 'Regional Jurisdiction', description: 'Monitor district hospital linkages and demographics' },
  { code: 'district:update', module: 'District', action: 'update', category: 'Regional Jurisdiction', description: 'Update district boundaries and nodal officer contacts' },

  // Audit & Governance (1)
  { code: 'audit:delete', module: 'Audit', action: 'delete', category: 'Audit & Governance', description: 'Purge forensic audit logs according to institutional data retention policies' }
];

export const HOSPITAL_ADMIN_EXACT_PERMISSIONS: string[] = HOSPITAL_ADMIN_DETAILED_PERMISSIONS.map(p => p.code);

export interface ChargeNursePermission {
  code: string;
  module: string;
  action: 'create' | 'read' | 'update' | 'write';
  category: 'Clinical Care & Telemetry' | 'Bed & Ward Allocation' | 'Patient Census & Demographics' | 'Admissions & Intake Encounters';
  description: string;
}

export const CHARGE_NURSE_DETAILED_PERMISSIONS: ChargeNursePermission[] = [
  // 1. Clinical Care & Telemetry (3 permissions)
  { code: 'clinical:create', module: 'Clinical', action: 'create', category: 'Clinical Care & Telemetry', description: 'Record bedside vital signs, fluid balance intake/output, and telemetry observations' },
  { code: 'clinical:read', module: 'Clinical', action: 'read', category: 'Clinical Care & Telemetry', description: 'Inspect real-time patient vital sign trends, continuous waveforms, and bedside flowsheets' },
  { code: 'clinical:update', module: 'Clinical', action: 'update', category: 'Clinical Care & Telemetry', description: 'Update shift nursing assessments, flowsheet notes, care plan progress, and locked MAR logs' },

  // 2. Bed & Ward Allocation (6 permissions)
  { code: 'bed:create', module: 'Bed', action: 'create', category: 'Bed & Ward Allocation', description: 'Commission and provision critical care telemetry beds to assigned ICU units' },
  { code: 'bed:read', module: 'Bed', action: 'read', category: 'Bed & Ward Allocation', description: 'Inspect real-time bed occupancy, ventilator attachments, and telemetry connectivity' },
  { code: 'bed:update', module: 'Bed', action: 'update', category: 'Bed & Ward Allocation', description: 'Update bed operational status (Available, Occupied, Cleaning/Sanitization, Maintenance)' },
  { code: 'icu:create', module: 'ICU', action: 'create', category: 'Bed & Ward Allocation', description: 'Provision and register intensive care pods and specialized ICU units' },
  { code: 'icu:read', module: 'ICU', action: 'read', category: 'Bed & Ward Allocation', description: 'Review ICU floor layouts, unit capacities, and nurse-to-patient staffing ratios' },
  { code: 'icu:update', module: 'ICU', action: 'update', category: 'Bed & Ward Allocation', description: 'Reconfigure unit operational protocols, telemetry gateways, and capacity limits' },

  // 3. Patient Census & Demographics (6 permissions)
  { code: 'patient:create', module: 'Patient', action: 'create', category: 'Patient Census & Demographics', description: 'Enroll new critical care patients into ICU registry via registration wizard' },
  { code: 'patient:read', module: 'Patient', action: 'read', category: 'Patient Census & Demographics', description: 'Access active patient roster, bed locations, and bedside clinical summaries' },
  { code: 'patient:update', module: 'Patient', action: 'update', category: 'Patient Census & Demographics', description: 'Update patient clinical acuity classification and assigned care team' },
  { code: 'patient:write', module: 'Patient', action: 'write', category: 'Patient Census & Demographics', description: 'Commit bedside nursing charts, clinical assessments, and observation notes' },
  { code: 'patient:demographics:read', module: 'Patient', action: 'read', category: 'Patient Census & Demographics', description: 'View protected patient demographic records, age, gender, and contact info' },
  { code: 'patient:demographics:write', module: 'Patient', action: 'write', category: 'Patient Census & Demographics', description: 'Update patient emergency contacts, next of kin, and insurance identification' },

  // 4. Admissions & Intake Encounters (3 permissions)
  { code: 'admission:create', module: 'Admission', action: 'create', category: 'Admissions & Intake Encounters', description: 'Initiate emergency triage intake, ER-to-ICU transfers, and bedside admissions' },
  { code: 'admission:read', module: 'Admission', action: 'read', category: 'Admissions & Intake Encounters', description: 'Track encounter histories, admission reasons, and clinical triage scores' },
  { code: 'admission:update', module: 'Admission', action: 'update', category: 'Admissions & Intake Encounters', description: 'Update admission status (Admitted, In-Transit, Transferred, Awaiting Bed)' }
];

export const CHARGE_NURSE_EXACT_PERMISSIONS: string[] = CHARGE_NURSE_DETAILED_PERMISSIONS.map(p => p.code);

