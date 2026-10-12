export type HospitalType = 'Government General Hospital' | 'Super Specialty Center' | 'Multi-Specialty Hospital' | 'Private Tertiary Care' | 'District Headquarters Hospital';

export type HospitalStatus = 'Active' | 'Under Maintenance' | 'Critical Capacity' | 'Inactive';

export type ICUBedStatus = 'Available' | 'Occupied' | 'Reserved' | 'Maintenance';

export interface RemarkHistoryRecord {
  id: string;
  previousRemark: string;
  updatedRemark: string;
  updatedBy: string;
  updatedByRole: string;
  timestamp: string;
}

export interface DistrictData {
  id: string;
  name: string;
  code: string;
  state: string;
  totalHospitals: number;
  totalICUBeds: number;
  availableICUBeds: number;
  totalDoctors: number;
  totalNurses: number;
  totalPatients: number;
}

export interface HospitalRecord {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  type: HospitalType;
  address: string;
  contactNumber: string;
  email: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  totalICUBeds: number;
  availableICUBeds: number;
  occupiedICUBeds: number;
  reservedICUBeds: number;
  maintenanceICUBeds: number;
  doctorsCount: number;
  nursesCount: number;
  patientsCount: number;
  status: HospitalStatus;
  lastUpdated: string;
}

export interface SuperAdminDoctorRecord {
  id: string;
  doctorId: string;
  name: string;
  mobile: string;
  email: string;
  qualification: string;
  specialization: string;
  department: string;
  hospitalId: string;
  hospitalName: string;
  district: string;
  experience: string;
  shift: 'Morning Shift' | 'Evening Shift' | 'Night Shift';
  status: 'Active' | 'Inactive' | 'On Leave';
  remarks: string;
  remarkHistory: RemarkHistoryRecord[];
  assignedPatientsCount: number;
}

export interface SuperAdminNurseRecord {
  id: string;
  nurseId: string;
  name: string;
  mobile: string;
  email: string;
  qualification: string;
  department: string;
  hospitalId: string;
  hospitalName: string;
  district: string;
  shift: 'Morning Shift' | 'Evening Shift' | 'Night Shift';
  experience: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  remarks: string;
  remarkHistory: RemarkHistoryRecord[];
  assignedBedsCount: number;
}

export interface SuperAdminICUBedRecord {
  id: string;
  bedNumber: string;
  hospitalId: string;
  hospitalName: string;
  district: string;
  icuType: 'Medical ICU' | 'Surgical ICU' | 'Cardiac ICU' | 'Neuro ICU' | 'Pediatric ICU' | 'Neonatal ICU';
  status: ICUBedStatus;
  patientId?: string;
  patientName?: string;
  doctorName?: string;
  nurseName?: string;
  admissionDate?: string;
  lastUpdated: string;
}

export interface SuperAdminPatientRecord {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  hospitalId: string;
  hospitalName: string;
  district: string;
  department: string;
  wardType: 'ICU' | 'General Ward' | 'HDURI Unit' | 'Private Suite';
  bedNumber: string;
  doctorName: string;
  nurseName: string;
  admissionDate: string;
  dischargeDate?: string;
  patientStatus: 'CRITICAL' | 'WARNING' | 'STABLE' | 'RECOVERING' | 'DISCHARGED';
  lastUpdated: string;
  medicalNotes?: string;
}

export interface SuperAdminAuditItem {
  id: string;
  timestamp: string;
  user: string;
  userRole: string;
  action: string;
  module: string;
  hospital: string;
  district: string;
  recordId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
}
