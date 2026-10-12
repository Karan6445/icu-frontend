export type UserRole = 
  | 'System Administrator'
  | 'ICU Administrator'
  | 'Doctor'
  | 'Nurse'
  | 'Biomedical Engineer'
  | 'Read Only';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  authorizedUnits: string[]; // e.g. ["MICU-01", "SICU-02", "CICU-01"]
  specialty?: string;
  hospital: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetResource: string;
  ipAddress: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
}
