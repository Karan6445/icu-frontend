export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE' | 'OFFLINE';
export type StaffStatus = 'ACTIVE' | 'ON_DUTY' | 'OFF_DUTY' | 'ON_LEAVE';
export type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT';
export type ShiftStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON DUTY' | 'OFF DUTY' | 'LEAVE';
export type TelemetryStatus = 'ONLINE' | 'OFFLINE' | 'WARNING';
export type EncounterType = 'Admission' | 'ICU Encounter' | 'Follow-up' | 'Emergency' | 'Transfer' | 'Discharge';
export type EncounterStatus = 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'DISCHARGED';
export type NurseRank = 'NURSE_LEAD' | 'ICU_NURSE' | 'SENIOR_NURSE';

export interface HospitalDirectorRecord {
  id: string;
  name: string;
  employeeId: string;
  designation: string;
  department: string;
  qualification: string;
  experienceYears: number;
  phone: string;
  email: string;
  status: 'ACTIVE';
  hospitalId: string;
  hospitalName: string;
  assignedDate: string;
  bio: string;
}

export interface HospitalAdminDoctorRecord {
  id: string;
  name: string;
  employeeId: string;
  specialization: string;
  qualification: string;
  assignedICU: string;
  assignedICUId: string;
  shift: ShiftType;
  workload: string; // e.g. "4 Patients Assigned"
  activePatientsCount: number;
  phone: string;
  email: string;
  status: StaffStatus;
  hospitalId: string;
  joinedDate: string;
}

export interface HospitalAdminNurseRecord {
  id: string;
  name: string;
  employeeId: string;
  rank: NurseRank;
  qualification: string;
  assignedICU: string;
  assignedICUId: string;
  shift: ShiftType;
  supervisorName: string;
  phone: string;
  email: string;
  status: StaffStatus;
  hospitalId: string;
  joinedDate: string;
}

export interface HospitalAdminShiftRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: 'DOCTOR' | 'NURSE_LEAD' | 'NURSE';
  icuId: string;
  icuName: string;
  shiftType: ShiftType;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  hospitalId: string;
}

export interface HospitalAdminICURecord {
  id: string;
  name: string;
  code: string;
  type: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  reservedBeds: number;
  maintenanceBeds: number;
  offlineBeds: number;
  doctorLeadId: string;
  doctorLeadName: string;
  nurseLeadId: string;
  nurseLeadName: string;
  floorLocation: string;
  hospitalId: string;
}

export interface HospitalAdminBedRecord {
  id: string;
  bedNumber: string;
  icuId: string;
  icuName: string;
  status: BedStatus;
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  admissionDate?: string;
  assignedDoctor?: string;
  assignedNurse?: string;
  telemetryStatus: TelemetryStatus;
  equipmentConnected: string[];
  hospitalId: string;
}

export interface PatientEncounterRecord {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  icuId: string;
  icuName: string;
  bedNumber: string;
  doctorName: string;
  nurseName: string;
  encounterDate: string;
  encounterType: EncounterType;
  status: EncounterStatus;
  diagnosis: string;
  createdAt: string;
  hospitalId: string;
}

export interface PatientClinicalRemarkRecord {
  id: string;
  patientId: string;
  patientName: string;
  authorId: string;
  authorName: string;
  authorRole: 'DOCTOR' | 'NURSE';
  remarkType: 'Clinical Note' | 'Vitals Assessment' | 'Medication Order' | 'Nursing Handover' | 'Doctor Evaluation';
  content: string;
  timestamp: string;
  isLocked: boolean;
  lockReason: string;
  hospitalId: string;
}

export interface PatientTimelineEventRecord {
  id: string;
  patientId: string;
  patientName: string;
  timestamp: string;
  user: string;
  role: string;
  event: string;
  details: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING';
  hospitalId: string;
}

export interface ReportDateFilter {
  fromDate: string;
  toDate: string;
  icuFilter: string;
  staffFilter: string;
  searchQuery: string;
}

export interface HospitalAdminActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: string;
  details: string;
  hospitalId: string;
  ipAddress: string;
}
