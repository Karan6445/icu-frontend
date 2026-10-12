export type AppointmentStatus =
  | 'BOOKED'
  | 'CHECKED_IN'
  | 'WAITING'
  | 'VITALS_COMPLETED'
  | 'READY_FOR_DOCTOR'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'REFERRED';

export type AppointmentPriority = 'ROUTINE' | 'PRIORITY' | 'URGENT' | 'EMERGENCY';

export type ConsultationMode = 'VIDEO' | 'IN_PERSON' | 'HYBRID';

export type ReferralType =
  | 'HOSPITAL_ADMISSION'
  | 'SPECIALIST_CONSULT'
  | 'EMERGENCY_TRANSFER'
  | 'DIAGNOSTIC_LAB'
  | 'PHYSICAL_EXAM';

export interface EClinic {
  id: string;
  hospitalId: string;
  clinicCode: string;
  clinicName: string;
  location: string;
  address: string;
  contactNumber: string;
  operatingStatus: 'OPEN' | 'BUSY' | 'CLOSED';
}

export interface EClinicVitals {
  id: string;
  patientId: string;
  appointmentId?: string;
  systolicBp: number;
  diastolicBp: number;
  pulseRate: number; // bpm
  spo2: number; // percentage
  temperature: number; // Celsius
  bloodGlucose?: number; // mg/dL
  weightKg: number;
  heightCm: number;
  bmi: number;
  warnings: string[];
  recordedBy: string;
  recordedAt: string;
}

export interface PrescriptionItem {
  id?: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1"
  route?: string; // e.g. "Oral"
  duration: string; // e.g. "5 days"
  instructions: string; // e.g. "After food"
  quantity?: number;
}

export interface Prescription {
  id: string;
  consultationId?: string;
  appointmentId?: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date?: string;
  items: PrescriptionItem[];
  generalAdvice?: string;
  followUpDate?: string;
  nextFollowUpDate?: string;
  isFinalized?: boolean;
  finalizedAt?: string;
  issuedAt?: string;
}

export interface ClinicalSoapNote {
  id?: string;
  consultationId?: string;
  patientId?: string;
  doctorId?: string;
  doctorSignature?: string;
  recordedAt?: string;
  subjective: string; // Chief complaint & patient history
  objective: string; // Physical exam & vitals
  assessment: string; // Clinical diagnosis
  plan: string; // Orders, medication, lifestyle
  isSigned?: boolean;
  signedAt?: string;
}

export interface Referral {
  id: string;
  consultationId?: string;
  appointmentId?: string;
  patientId: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  destination?: string;
  referralHospitalName?: string;
  department?: string;
  referralType?: ReferralType;
  priority?: 'ROUTINE' | 'URGENT' | 'IMMEDIATE_EMERGENCY';
  urgency?: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  reason?: string;
  clinicalSummary: string;
  emergencyWarning?: boolean;
  createdAt?: string;
  issuedAt?: string;
}

export interface DoctorAvailability {
  doctorId: string;
  name: string;
  specialty: string;
  qualification: string;
  licenseNumber: string;
  experience: string;
  avatarUrl?: string;
  consultationModes: ConsultationMode[];
  isOnline: boolean;
  isTelemedEnabled: boolean;
  clinicId: string;
  clinicName: string;
  todayAppointmentsCount: number;
  waitingPatientsCount: number;
  completedTodayCount: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface Appointment {
  id: string;
  tokenNumber: string; // e.g. "TK-01"
  clinicId: string;
  clinicName: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  doctorId?: string;
  doctorName?: string;
  specialty: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  reason: string;
  vitals?: EClinicVitals;
  soapNote?: ClinicalSoapNote;
  prescription?: Prescription;
  referral?: Referral;
  waitingDurationMinutes: number;
  createdAt: string;
}

export interface ConsultationSession {
  id: string;
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientAge: number;
  patientGender: string;
  allergies: string[];
  chronicConditions: string[];
  doctorId: string;
  doctorName: string;
  clinicName: string;
  startedAt: string;
  status: 'ACTIVE' | 'COMPLETED';
  vitals?: EClinicVitals;
  soapNote?: ClinicalSoapNote;
  prescription?: Prescription;
  referral?: Referral;
}
