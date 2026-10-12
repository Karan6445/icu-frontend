export type DataQuality = 'LIVE' | 'DELAYED' | 'STALE' | 'DISCONNECTED';
export type ClinicalStatus = 'STABLE' | 'WARNING' | 'CRITICAL';
export type ReviewPriority = 'CRITICAL' | 'HIGH' | 'ROUTINE' | 'STABLE';
export type CodeStatus = 'FULL CODE' | 'DNR' | 'DNI';

export type UserRole = 'SYSTEM_ADMIN' | 'DOCTOR' | 'RN' | 'NP' | 'CCR';
export type ShiftType = 'MORNING' | 'EVENING' | 'NIGHT';

export interface User {
  id: string;
  staffId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  subRole?: string; // e.g. "Critical Care Registered Nurse", "Nurse Practitioner", "Charge Nurse"
  hospital: string;
  authorizedUnits: string[];
  status: 'ON_DUTY' | 'OFF_DUTY' | 'ON_CALL';
  shift?: ShiftType;
  shiftTime?: string; // e.g. "07:00 - 15:00"
  specialty?: string;
  avatarUrl?: string;
}

export interface VitalMetric {
  value: number | string;
  unit: string;
  previousValue?: number | string;
  trend?: 'UP' | 'DOWN' | 'STABLE';
  timestamp: string;
  source: string;
  quality: DataQuality;
}

export interface PatientVitals {
  hr: VitalMetric;
  spo2: VitalMetric;
  bpSystolic: VitalMetric;
  bpDiastolic: VitalMetric;
  map: VitalMetric;
  rr: VitalMetric;
  temp: VitalMetric;
}

export interface VentilatorData {
  mode: string;
  fio2: number;
  peep: number;
  pPeak: number;
  tidalVolume: number;
  rrSet: number;
  rrTotal: number;
  quality: DataQuality;
  timestamp: string;
  source: string;
}

export interface InfusionData {
  id: string;
  drug: string;
  rate: number;
  unit: string;
  volumeDelivered: number;
  bagVolume: number;
  status: 'RUNNING' | 'PAUSED' | 'ALARM' | 'STOPPED';
  quality: DataQuality;
  lastUpdate: string;
}

export interface DoctorNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  timestamp: string;
  generalObservation: string;
  clinicalNotes: string;
  condition: ClinicalStatus;
  doctorRemark: string;
  checkupType: 'Morning Round' | 'Evening Round' | 'Emergency Checkup' | 'Routine Checkup';
}

export interface OrganAssessmentItem {
  status: 'STABLE' | 'WARNING' | 'CRITICAL';
  observation: string;
  notes?: string;
}

export interface OrganAssessment {
  cardiovascular: OrganAssessmentItem;
  respiratory: OrganAssessmentItem;
  neurological: OrganAssessmentItem;
  gastrointestinal: OrganAssessmentItem;
  renal: OrganAssessmentItem;
  skin: OrganAssessmentItem;
}

export interface NurseNote {
  id: string;
  patientId: string;
  nurseId: string;
  nurseName: string;
  nurseRole: string; // e.g. "RN", "NP", "CCR"
  timestamp: string;
  observation: string;
  personalCare: string;
  positionChange: string;
  mobility: string;
  fluidMonitoring: string;
  generalNotes: string;
  organAssessment?: OrganAssessment;
}

export type MedicationStatus = 'SCHEDULED' | 'DUE' | 'ADMINISTERED' | 'DELAYED' | 'MISSED' | 'CANCELLED';

export interface MedicationItem {
  id: string;
  patientId: string;
  medicineName: string;
  dosage: string;
  route: string; // IV, Oral, Inhalation, etc.
  scheduledTime: string;
  status: MedicationStatus;
  prescribedBy: string;
  prescribedById: string;
  administeredBy?: string;
  administeredById?: string;
  administeredByRole?: string;
  administeredAt?: string;
  note?: string;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface AlertItem {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  severity: AlertSeverity;
  message: string;
  parameterName?: string;
  currentValue?: string;
  thresholdLimit?: string;
  category?: 'VITALS' | 'VENTILATOR' | 'INFUSION' | 'TELEMETRY' | 'LABS';
  detectedAt: string;
  source: string;
  recipients: string[]; // e.g. ['DOCTOR', 'NURSE', 'SYSTEM_ADMIN']
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  ackNote?: string;
}

export interface PainAssessmentValues {
  painScore: number; // 0-10
  location: string;
  character: string[];
  interventions: string[];
  reassessmentTime?: string;
  notes?: string;
}

export interface FluidIntakeValues {
  oral: number; // mL
  ivFluids: number; // mL
  bloodProducts: number; // mL
  enteralFeed: number; // mL
  otherIntake: number; // mL
}

export interface FluidOutputValues {
  urine: number; // mL
  urineCatheterType: string;
  woundDrains: number; // mL
  emesisNG: number; // mL
  stool: number; // mL
  otherOutput: number; // mL
}

export interface ClinicalNotesValues {
  neurologicalNotes: string;
  cardiovascularNotes: string;
  respiratoryNotes: string;
  gastrointestinalNotes: string;
  skinIntegrityNotes: string;
  safetyChecklist: {
    fallRiskAssessed: boolean;
    sideRailsUp: boolean;
    callBellInReach: boolean;
    linesTubesSecured: boolean;
  };
}

export interface ShiftSummaryValues {
  shiftType: 'DAY' | 'NIGHT';
  nurseName: string;
  nurseBadgeId: string;
  patientTrajectory: 'STABLE' | 'IMPROVING' | 'DETERIORATING' | 'CRITICAL';
  attendingNotified: boolean;
  attendingDoctorName?: string;
  shiftHandoverNotes: string;
}

export interface NursingAssessmentFormValues {
  patientId: string;
  assessmentTimestamp: string;
  pain: PainAssessmentValues;
  fluidIntake: FluidIntakeValues;
  fluidOutput: FluidOutputValues;
  clinicalNotes: ClinicalNotesValues;
  shiftSummary: ShiftSummaryValues;
}

export interface HandoverRecord {
  id: string;
  patientId: string;
  previousDoctorId: string;
  previousDoctorName: string;
  previousNurseId: string;
  previousNurseName: string;
  newDoctorId: string;
  newDoctorName: string;
  newNurseId: string;
  newNurseName: string;
  shiftStart: string;
  shiftEnd: string;
  handoverSummary: string;
  recentVitalsSummary: string;
  recentDoctorNotesSummary: string;
  recentNurseNotesSummary: string;
  medicineSummary: string;
  activeAlertsCount: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  patientId?: string;
  action: string;
  previousValue?: string;
  newValue?: string;
}

export interface Assignment {
  id: string;
  patientId: string;
  bedNumber: string;
  doctorId: string;
  doctorName: string;
  nurseId: string;
  nurseName: string;
  nurseRole: string;
  assignedAt: string;
  status: 'ACTIVE' | 'TRANSFERRED' | 'DISCHARGED';
}

export interface Patient {
  id: string; // e.g. "P-1024"
  mrn: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  bedNumber: string; // e.g. "ICU-04"
  unitName: string; // e.g. "MICU-01"
  status: ClinicalStatus;
  reviewPriority: ReviewPriority;
  admissionTime: string;
  admittingDiagnosis: string;
  assignedClinicianId: string;
  assignedClinician: string;
  assignedNurseId: string;
  assignedNurse: string;
  assignedNurseRole: string;
  codeStatus: CodeStatus;
  vitals: PatientVitals;
  ventilator?: VentilatorData;
  infusions: InfusionData[];
  deviceConnectivity: number;
  lastReviewTime: string;
  unreadChangesCount: number;
}

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface Bed {
  id: string;
  number: string;
  unitName: string;
  occupied: boolean;
  status: BedStatus;
  patientId?: string;
  patient?: Patient;
  lastSanitized?: string;
  equipment?: string[];
}


export interface TimelineItem {
  id: string;
  patientId: string;
  timestamp: string;
  type: 'VITALS' | 'LABS' | 'VENTILATOR' | 'INFUSION' | 'PROCEDURE' | 'NOTES' | 'EVENTS';
  title: string;
  description: string;
  value?: string;
  previousValue?: string;
  unit?: string;
  source: string;
  deviceId: string;
  receivedTimestamp: string;
  quality: DataQuality;
  author?: string;
  authorRole?: string;
}

export interface ChangeItem {
  id: string;
  patientId: string;
  parameterName: string;
  beforeValue: string | number;
  currentValue: string | number;
  unit: string;
  changeDelta: string;
  duration: string;
  timestamp: string;
  source: string;
  deviceId: string;
  quality: DataQuality;
  isMeaningful: boolean;
  category: 'VITALS' | 'VENTILATOR' | 'INFUSION' | 'LABS' | 'EVENTS';
  explainableAIReason?: string;
}

export interface DeviceItem {
  id: string;
  name: string;
  type: 'MONITOR' | 'VENTILATOR' | 'INFUSION_PUMP' | 'LAB_GATEWAY';
  vendor: string;
  model: string;
  bedNumber: string;
  gatewayId: string;
  ipAddress: string;
  protocol: string;
  status: DataQuality;
  lastMessage: string;
  latencyMs: number;
  packetsPerMin: number;
  errorRate: number;
  adapter: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  text: string;
  timestamp: string;
  citations?: {
    id: string;
    timestamp: string;
    source: string;
    parameterName: string;
    value: string;
    quality: DataQuality;
  }[];
}
