export type AppRole =
  | 'SUPER_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'ADMIN'
  | 'DIRECTOR'
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
