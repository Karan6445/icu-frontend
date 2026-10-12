import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import patientApi, {
  PatientCreate,
  PatientUpdate,
  PatientResponse,
  PatientDetailResponse,
  PatientQRResponse,
  PatientQRScanResponse,
  PatientQueryParams,
} from '../../api/patientApi';

export interface RegistrationFormData {
  // Step 1: Personal Details
  patientId: string;
  fullName: string;
  age: number | string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  mobileNumber: string;
  email: string;

  // Step 2: Emergency Details
  emergencyContactName: string;
  emergencyContactNumber: string;
  relation: string;

  // Step 3: Medical Information
  medicalHistory: string;
  currentDiagnosis: string;
  allergies: string;

  // Step 4: Documents
  aadhaarFile?: string;
  medicalReportsFile?: string;
  prescriptionFile?: string;

  // Step 5: Address
  country: string;
  state: string;
  city: string;
  addressLine: string;
  pincode: string;

  // Step 6: Assign Doctor
  assignedDoctor: string;
  department: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface AuditHistoryRecord {
  id: string;
  timestamp: string;
  editedBy: string;
  editedByRole: string;
  previousContent: string;
  newContent: string;
  auditReason: string;
}

export interface UnifiedRemark {
  id: string;
  patientId: string;
  type: 'DOCTOR_REMARK' | 'NURSE_REMARK';
  authorName: string;
  authorId?: string;
  authorRole: string;
  category: string;
  priority: string;
  content: string;
  timestamp: string;
  isLocked: boolean;
  lockedAt: string;
  isEditedBySuperAdmin?: boolean;
  lastEditedAt?: string;
  lastEditedBy?: string;
  auditHistory?: AuditHistoryRecord[];
}

export interface DoctorHandoverUpdate {
  id: string;
  doctorName: string;
  updateType: 'TAKEOVER' | 'DIRECTIVES_UPDATE' | 'CLINICAL_ADDENDUM' | 'VENTILATOR_WEANING' | 'MEDICATION_CHANGE' | 'ENDORSEMENT';
  date: string;
  note: string;
  revisedRecommendation?: string;
  previousDoctorName?: string;
  acknowledgedPreviousPlan?: boolean;
}

export interface DoctorHandoverDirectives {
  doctorName: string;
  incomingDoctor?: string;
  timestamp: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
  handoverStatus?: 'PENDING_REVIEW' | 'TAKEN_OVER' | 'DIRECTIVES_UPDATED';
  acknowledgedByIncomingDoctor?: boolean;
}

export interface PatientRecord {
  id: string;
  mrn: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  mobileNumber: string;
  email: string;
  bedNumber: string;
  unitName: string;
  status: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'STABLE';
  reviewPriority: 'CRITICAL' | 'HIGH' | 'ROUTINE' | 'STABLE';
  admissionTime: string;
  admittingDiagnosis: string;
  medicalHistory?: string;
  allergies?: string;
  codeStatus?: string;
  assignedClinician: string;
  assignedNurse: string;
  department: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  relation: string;
  address: {
    country: string;
    state: string;
    city: string;
    addressLine: string;
    pincode: string;
  };
  vitals: {
    hr: number;
    spo2: number;
    bpSystolic: number;
    bpDiastolic: number;
    map: number;
    rr: number;
    temp: number;
    quality: 'LIVE' | 'STALE';
    timestamp: string;
  };
  ventilator?: {
    mode: string;
    fio2: number;
    peep: number;
    tidalVolume: number;
    pPeak: number;
    quality: 'LIVE' | 'STALE';
  };
  documents?: { name: string; type: string; date: string }[];
  clinicalNotesHistory?: { id: string; doctorName: string; date: string; note: string; remark: string }[];
  nursingNotesHistory?: { id: string; nurseName: string; date: string; note: string; shift: string }[];
  unifiedRemarks?: UnifiedRemark[];
  latestDoctorHandover?: DoctorHandoverDirectives;
  doctorHandoverUpdates?: DoctorHandoverUpdate[];
}

export interface PatientState {
  patients: PatientRecord[];
  apiPatients: PatientResponse[];
  selectedPatientDetail: PatientDetailResponse | null;
  scannedPatient: PatientQRScanResponse | null;
  qrData: PatientQRResponse | null;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  qrLoading: boolean;
  error: string | null;
  successMessage: string | null;
  searchQuery: string;
  statusFilter: string;
  unitFilter: string;
  registrationStep: number;
  registrationForm: RegistrationFormData;
}

const initialRegistrationForm: RegistrationFormData = {
  patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`,
  fullName: '',
  age: '',
  gender: 'Male',
  bloodGroup: 'O+',
  mobileNumber: '',
  email: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  relation: 'Spouse',
  medicalHistory: 'Hypertension, Type 2 Diabetes',
  currentDiagnosis: 'Acute Respiratory Distress Syndrome (ARDS)',
  allergies: 'Penicillin',
  country: 'India',
  state: 'Bihar',
  city: 'Patna',
  addressLine: 'Boring Road, Patna',
  pincode: '800001',
  assignedDoctor: 'Dr. Ananya Roy (Intensivist)',
  department: 'Medical ICU',
  priority: 'HIGH'
};

const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'P-1024',
    mrn: 'MRN-8849201',
    name: 'Rajesh Sharma',
    age: 62,
    gender: 'Male',
    bloodGroup: 'B+',
    mobileNumber: '+91 98201 44321',
    email: 'rajesh.sharma@example.com',
    bedNumber: 'BED-07',
    unitName: 'Medical ICU',
    status: 'CRITICAL',
    reviewPriority: 'CRITICAL',
    admissionTime: '2026-09-15 08:30',
    admittingDiagnosis: 'ARDS Secondary to Severe Pneumonia',
    medicalHistory: 'Type 2 Diabetes, COPD',
    allergies: 'Sulfa Drugs',
    assignedClinician: 'Dr. Ananya Roy (Intensivist)',
    assignedNurse: 'Nurse Vikram Singh',
    department: 'Pulmonology & Critical Care',
    emergencyContactName: 'Meena Sharma',
    emergencyContactNumber: '+91 98201 99887',
    relation: 'Wife',
    address: {
      country: 'India',
      state: 'Bihar',
      city: 'Patna',
      addressLine: '12-A Kankarbagh Main Road, Patna',
      pincode: '800020'
    },
    vitals: { hr: 104, spo2: 91, bpSystolic: 108, bpDiastolic: 64, map: 78, rr: 27, temp: 38.2, quality: 'LIVE', timestamp: '11:45:00' },
    ventilator: { mode: 'PRVC', fio2: 60, peep: 10, tidalVolume: 420, pPeak: 28, quality: 'LIVE' },
    documents: [
      { name: 'Aadhaar_Card_Rajesh.pdf', type: 'Identity Proof', date: '2026-09-15' },
      { name: 'Chest_XRay_15Sep.png', type: 'Medical Report', date: '2026-09-15' }
    ],
    clinicalNotesHistory: [
      { id: 'CN-1', doctorName: 'Dr. Ananya Roy', date: '2026-09-19 09:15', note: 'Patient shows signs of severe hypoxemia. PEEP increased to 10cmH2O.', remark: 'Monitor ABG in 2h' }
    ],
    nursingNotesHistory: [
      { id: 'NN-1', nurseName: 'Nurse Vikram Singh', date: '2026-09-19 08:00', note: 'Morning vitals recorded. Suctioning performed via ET tube.', shift: 'Morning Shift' }
    ],
    unifiedRemarks: [
      {
        id: 'REM-DOC-101',
        patientId: 'P-1024',
        type: 'DOCTOR_REMARK',
        authorName: 'Dr. Ananya Roy',
        authorRole: 'Doctor',
        category: 'Ventilator / Respiratory Plan',
        priority: 'CRITICAL',
        content: 'Maintain VC-AC mode, FiO2 60%, target PaO2 > 80 mmHg. Titrate vasopressor support to keep MAP > 65. Repeat arterial blood gas at 14:00.',
        timestamp: '2026-09-19 09:15',
        isLocked: true,
        lockedAt: '2026-09-19 09:15'
      },
      {
        id: 'REM-NUR-102',
        patientId: 'P-1024',
        type: 'NURSE_REMARK',
        authorName: 'Nurse Vikram Singh',
        authorRole: 'Nurse',
        category: 'Nursing Assessment & Airway Care',
        priority: 'HIGH',
        content: 'Endotracheal suctioning performed with moderate thick secretions. Oral hygiene rendered. Position changed to right lateral 30 degrees. Vitals re-checked.',
        timestamp: '2026-09-19 08:00',
        isLocked: true,
        lockedAt: '2026-09-19 08:00'
      }
    ],
    latestDoctorHandover: {
      doctorName: 'Dr. Ananya Roy (PMCH / AIIMS Intensivist Lead)',
      incomingDoctor: 'Dr. Priya Sharma (PMCH Patna - Senior Intensivist)',
      timestamp: '2026-09-25 15:30',
      situation: 'Admitted to ICU for ARDS Secondary to Severe Pneumonia. Patient status is CRITICAL. Airway: PRVC Mechanical Ventilation (FiO2 60%, PEEP 10 cmH2O). Hemodynamically supported on Norepinephrine infusion.',
      background: 'Admitted on 2026-09-15 08:30. History: Type 2 Diabetes, COPD. Invasive Arterial Line in Right Radial, Central Line in Right Subclavian. Allergies: Sulfa Drugs. Sputum culture pending.',
      assessment: 'Latest Vitals — HR: 104 bpm, BP: 108/64 mmHg, SpO2: 91%, MAP: 78 mmHg, Temp: 38.2°C, RR: 27/min. Telemetry shows sinus tachycardia. Arterial blood gas shows PaO2 (88 mmHg).',
      recommendation: 'Continue mechanical ventilation weaning protocol. Wean FiO2 to 50% if SpO2 > 92%. Maintain MAP > 65 mmHg with Norad. Repeat ABG at 18:00. Maintain strict lung-protective ventilation and aseptic endotracheal suctioning.',
      lastUpdatedBy: 'Dr. Priya Sharma (PMCH Patna - Senior Intensivist)',
      lastUpdatedAt: '2026-09-25 16:15',
      handoverStatus: 'TAKEN_OVER',
      acknowledgedByIncomingDoctor: true
    },
    doctorHandoverUpdates: [
      {
        id: 'DHU-101',
        doctorName: 'Dr. Priya Sharma (PMCH Patna - Senior Intensivist)',
        updateType: 'TAKEOVER',
        date: '2026-09-25 16:15',
        note: 'Patient reviewed bedside upon shift takeover. Vitals stable on PRVC ventilation. ABG PaO2 at 88 mmHg. Arterial line zeroed and transduced accurately. Discussed weaning trial with charge nurse.',
        revisedRecommendation: 'Wean FiO2 from 60% to 50% if SpO2 > 92%. Continue Norepinephrine infusion to maintain MAP > 65 mmHg. Repeat arterial blood gas (ABG) at 18:00.',
        previousDoctorName: 'Dr. Ananya Roy (PMCH / AIIMS Intensivist Lead)',
        acknowledgedPreviousPlan: true
      }
    ]
  },
  {
    id: 'P-1025',
    mrn: 'MRN-9021482',
    name: 'Sunita Patel',
    age: 54,
    gender: 'Female',
    bloodGroup: 'A+',
    mobileNumber: '+91 97112 33445',
    email: 'sunita.patel@example.com',
    bedNumber: 'BED-03',
    unitName: 'Medical ICU',
    status: 'HIGH',
    reviewPriority: 'HIGH',
    admissionTime: '2026-09-17 14:15',
    admittingDiagnosis: 'Septic Shock Post Cholecystectomy',
    medicalHistory: 'Hypertension',
    allergies: 'None',
    assignedClinician: 'Dr. Rahul Mehta (Surgeon)',
    assignedNurse: 'Nurse Priya Sharma',
    department: 'General Surgery',
    emergencyContactName: 'Karan Patel',
    emergencyContactNumber: '+91 97112 88776',
    relation: 'Son',
    address: {
      country: 'India',
      state: 'Gujarat',
      city: 'Ahmedabad',
      addressLine: '45 Swastik Society, Navrangpura',
      pincode: '380009'
    },
    vitals: { hr: 118, spo2: 94, bpSystolic: 92, bpDiastolic: 56, map: 68, rr: 22, temp: 38.9, quality: 'LIVE', timestamp: '11:45:00' },
    documents: [
      { name: 'PostOp_Report_Sunita.pdf', type: 'Surgical Report', date: '2026-09-17' }
    ],
    clinicalNotesHistory: [
      { id: 'CN-2', doctorName: 'Dr. Rahul Mehta', date: '2026-09-18 18:30', note: 'Vasopressor support started. Blood cultures drawn.', remark: 'Re-eval fluid bolus' }
    ],
    nursingNotesHistory: [
      { id: 'NN-2', nurseName: 'Nurse Priya Sharma', date: '2026-09-19 07:30', note: 'Infusion rate adjusted as per MAP target.', shift: 'Morning Shift' }
    ],
    unifiedRemarks: [
      {
        id: 'REM-DOC-103',
        patientId: 'P-1025',
        type: 'DOCTOR_REMARK',
        authorName: 'Dr. Rahul Mehta',
        authorRole: 'Doctor',
        category: 'Infection Control & Hemodynamics',
        priority: 'HIGH',
        content: 'Broad spectrum IV antibiotics initiated. Repeat serum lactate in 4 hours. Fluid balance to be strictly neutral to slightly negative.',
        timestamp: '2026-09-18 18:30',
        isLocked: true,
        lockedAt: '2026-09-18 18:30'
      },
      {
        id: 'REM-NUR-104',
        patientId: 'P-1025',
        type: 'NURSE_REMARK',
        authorName: 'Nurse Priya Sharma',
        authorRole: 'Nurse',
        category: 'Fluid Balance & Vitals',
        priority: 'ROUTINE',
        content: 'Foley catheter output 45 mL/hr clear yellow urine. Norepinephrine infusion running at 0.08 mcg/kg/min via central line.',
        timestamp: '2026-09-19 07:30',
        isLocked: true,
        lockedAt: '2026-09-19 07:30'
      }
    ],
    latestDoctorHandover: {
      doctorName: 'Dr. Rahul Mehta (Consultant Surgeon)',
      incomingDoctor: 'Dr. Amit Kumar (AIIMS Patna - HOD Critical Care)',
      timestamp: '2026-09-25 14:00',
      situation: 'Post-op Day 3 laparoscopic cholecystectomy converted to open for bile leak. Developing septic shock. Status: HIGH review priority.',
      background: 'Admitted 2026-09-17 14:15. History of Hypertension. Abdominal drain in subhepatic space draining serosanguinous fluid. Central venous catheter in right internal jugular.',
      assessment: 'Vitals — HR 118 bpm, BP 92/56 mmHg, SpO2 94%, MAP 68 mmHg, Temp 38.9°C. Abdominal exam soft with moderate RUQ tenderness. Serum lactate 2.4 mmol/L.',
      recommendation: 'Continue broad spectrum antibiotics (Meropenem 1g IV TDS). Check drain output every 4 hours. Keep NPO, continue IV maintenance fluids at 80 mL/hr. Notify surgical fellow if drain output exceeds 150 mL.',
      handoverStatus: 'PENDING_REVIEW'
    },
    doctorHandoverUpdates: []
  },
  {
    id: 'P-1026',
    mrn: 'MRN-7712390',
    name: 'Amitabh Sen',
    age: 71,
    gender: 'Male',
    bloodGroup: 'AB+',
    mobileNumber: '+91 98300 11223',
    email: 'amitabh.sen@example.com',
    bedNumber: 'BED-12',
    unitName: 'Cardiac ICU',
    status: 'MEDIUM',
    reviewPriority: 'ROUTINE',
    admissionTime: '2026-09-18 20:00',
    admittingDiagnosis: 'Acute Anterior Wall STEMI',
    medicalHistory: 'Ischemic Heart Disease, Hyperlipidemia',
    allergies: 'Aspirin (Mild GI distress)',
    assignedClinician: 'Dr. Kavita Deshmukh (Cardiologist)',
    assignedNurse: 'Nurse Sneha Rao',
    department: 'Cardiology',
    emergencyContactName: 'Anindita Sen',
    emergencyContactNumber: '+91 98300 44556',
    relation: 'Daughter',
    address: {
      country: 'India',
      state: 'West Bengal',
      city: 'Kolkata',
      addressLine: '88 Salt Lake Sector 1',
      pincode: '700064'
    },
    vitals: { hr: 78, spo2: 97, bpSystolic: 124, bpDiastolic: 78, map: 93, rr: 16, temp: 36.8, quality: 'LIVE', timestamp: '11:45:00' },
    documents: [
      { name: 'ECG_12Lead_Anterior.pdf', type: 'Diagnostic ECG', date: '2026-09-18' }
    ],
    unifiedRemarks: [
      {
        id: 'REM-DOC-105',
        patientId: 'P-1026',
        type: 'DOCTOR_REMARK',
        authorName: 'Dr. Kavita Deshmukh',
        authorRole: 'Doctor',
        category: 'Cardiac Post-PCI Directives',
        priority: 'ROUTINE',
        content: 'Post-primary PCI stable. Dual antiplatelet therapy active. Continuous telemetry monitoring for ventricular arrhythmias.',
        timestamp: '2026-09-18 21:15',
        isLocked: true,
        lockedAt: '2026-09-18 21:15'
      }
    ]
  },
  {
    id: 'P-1027',
    mrn: 'MRN-6644120',
    name: 'Pooja Verma',
    age: 38,
    gender: 'Female',
    bloodGroup: 'O-',
    mobileNumber: '+91 99401 55667',
    email: 'pooja.verma@example.com',
    bedNumber: 'BED-02',
    unitName: 'Surgical ICU',
    status: 'STABLE',
    reviewPriority: 'STABLE',
    admissionTime: '2026-09-16 11:00',
    admittingDiagnosis: 'Polytrauma Post MVA (Spleen Laceration)',
    medicalHistory: 'None',
    allergies: 'Lidocaine',
    assignedClinician: 'Dr. Suresh Nair (Trauma Lead)',
    assignedNurse: 'Nurse Vikram Singh',
    department: 'Trauma & Emergency',
    emergencyContactName: 'Rohan Verma',
    emergencyContactNumber: '+91 99401 99001',
    relation: 'Husband',
    address: {
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      addressLine: '14 Indiranagar 100ft Road',
      pincode: '560038'
    },
    vitals: { hr: 72, spo2: 99, bpSystolic: 118, bpDiastolic: 76, map: 90, rr: 14, temp: 36.6, quality: 'LIVE', timestamp: '11:45:00' },
    unifiedRemarks: [
      {
        id: 'REM-NUR-106',
        patientId: 'P-1027',
        type: 'NURSE_REMARK',
        authorName: 'Nurse Vikram Singh',
        authorRole: 'Nurse',
        category: 'Post-Op Monitoring & Pain Control',
        priority: 'STABLE',
        content: 'Abdominal dressing clean and dry. Pain score 3/10 on PCA pump. Ambulated with assistance to chair.',
        timestamp: '2026-09-17 10:30',
        isLocked: true,
        lockedAt: '2026-09-17 10:30'
      }
    ]
  }
];

export function mapPatientResponseToRecord(p: PatientResponse, existingRecord?: PatientRecord): PatientRecord {
  const age = p.date_of_birth
    ? Math.max(0, new Date().getFullYear() - new Date(p.date_of_birth).getFullYear())
    : existingRecord?.age || 45;
  const fullName = `${p.first_name} ${p.middle_name ? p.middle_name + ' ' : ''}${p.last_name}`.trim();
  const gender = p.gender === 'MALE' ? 'Male' : p.gender === 'FEMALE' ? 'Female' : 'Other';
  const bloodMap: Record<string, string> = {
    A_POSITIVE: 'A+',
    A_NEGATIVE: 'A-',
    B_POSITIVE: 'B+',
    B_NEGATIVE: 'B-',
    AB_POSITIVE: 'AB+',
    AB_NEGATIVE: 'AB-',
    O_POSITIVE: 'O+',
    O_NEGATIVE: 'O-',
    UNKNOWN: 'Unknown',
  };
  const bloodGroup = bloodMap[p.blood_group] || p.blood_group || 'O+';
  const allergyStr = Array.isArray(p.allergies)
    ? p.allergies.map((a: any) => (typeof a === 'string' ? a : a.name || a.allergy || JSON.stringify(a))).join(', ')
    : '';
  const conditionStr = Array.isArray(p.chronic_conditions)
    ? p.chronic_conditions.map((c: any) => (typeof c === 'string' ? c : c.name || c.condition || JSON.stringify(c))).join(', ')
    : '';

  return {
    id: p.id,
    mrn: p.mrn,
    name: fullName || existingRecord?.name || 'Patient',
    age,
    gender,
    bloodGroup,
    mobileNumber: p.primary_phone || existingRecord?.mobileNumber || '+91 98000 00000',
    email: existingRecord?.email || 'patient@hospital.in',
    bedNumber: existingRecord?.bedNumber || 'ICU-10',
    unitName: existingRecord?.unitName || 'Medical ICU',
    status: (existingRecord?.status || (p.status === 'DECEASED' ? 'CRITICAL' : 'STABLE')) as any,
    reviewPriority: existingRecord?.reviewPriority || 'ROUTINE',
    admissionTime: existingRecord?.admissionTime || p.created_at?.slice(0, 16).replace('T', ' ') || '2026-10-12 10:00',
    admittingDiagnosis: existingRecord?.admittingDiagnosis || conditionStr || 'General Observation',
    medicalHistory: conditionStr || existingRecord?.medicalHistory,
    allergies: allergyStr || existingRecord?.allergies,
    assignedClinician: existingRecord?.assignedClinician || 'Dr. Ananya Roy (Intensivist)',
    assignedNurse: existingRecord?.assignedNurse || 'Nurse Priya Sharma',
    department: existingRecord?.department || 'Medical ICU',
    emergencyContactName: p.emergency_contact_name || existingRecord?.emergencyContactName || '',
    emergencyContactNumber: p.emergency_contact_phone || existingRecord?.emergencyContactNumber || '',
    relation: p.emergency_contact_relation || existingRecord?.relation || 'Spouse',
    address: existingRecord?.address || {
      country: 'India',
      state: 'Bihar',
      city: 'Patna',
      addressLine: 'Hospital Ward',
      pincode: '800001',
    },
    vitals: existingRecord?.vitals || {
      hr: 82,
      spo2: 98,
      bpSystolic: 120,
      bpDiastolic: 80,
      map: 93,
      rr: 16,
      temp: 36.9,
      quality: 'LIVE',
      timestamp: new Date().toTimeString().slice(0, 8),
    },
    documents: existingRecord?.documents,
    clinicalNotesHistory: existingRecord?.clinicalNotesHistory,
    nursingNotesHistory: existingRecord?.nursingNotesHistory,
    unifiedRemarks: existingRecord?.unifiedRemarks,
    latestDoctorHandover: existingRecord?.latestDoctorHandover,
    doctorHandoverUpdates: existingRecord?.doctorHandoverUpdates,
  };
}

// ------------------------------------------
// ASYNC THUNKS FOR PATIENTS & DEMOGRAPHICS
// ------------------------------------------

export const fetchPatientsThunk = createAsyncThunk<
  PatientResponse[],
  PatientQueryParams | undefined,
  { rejectValue: string }
>('patient/fetchPatients', async (params, { rejectWithValue }) => {
  try {
    const res = await patientApi.list(params);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to fetch patients from server');
  }
});

export const fetchPatientDetailsThunk = createAsyncThunk<
  PatientDetailResponse,
  string,
  { rejectValue: string }
>('patient/fetchPatientDetails', async (patientId, { rejectWithValue }) => {
  try {
    const res = await patientApi.getById(patientId);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to fetch patient details');
  }
});

export const registerPatientThunk = createAsyncThunk<
  PatientResponse,
  { data: PatientCreate; hospitalId?: string },
  { rejectValue: string }
>('patient/registerPatient', async ({ data, hospitalId }, { rejectWithValue }) => {
  try {
    const res = await patientApi.create(data, hospitalId);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to register patient');
  }
});

export const updatePatientDemographicsThunk = createAsyncThunk<
  PatientResponse,
  { patientId: string; data: PatientUpdate },
  { rejectValue: string }
>('patient/updateDemographics', async ({ patientId, data }, { rejectWithValue }) => {
  try {
    const res = await patientApi.update(patientId, data);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to update patient demographics');
  }
});

export const deletePatientThunk = createAsyncThunk<
  string,
  { patientId: string; reason?: string },
  { rejectValue: string }
>('patient/deletePatient', async ({ patientId, reason }, { rejectWithValue }) => {
  try {
    await patientApi.delete(patientId, reason);
    return patientId;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to delete patient');
  }
});

export const resolvePatientQRThunk = createAsyncThunk<
  PatientQRScanResponse,
  string,
  { rejectValue: string }
>('patient/resolveQR', async (token, { rejectWithValue }) => {
  try {
    const res = await patientApi.resolveQR(token);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to resolve patient wristband QR token');
  }
});

export const regeneratePatientQRThunk = createAsyncThunk<
  PatientQRResponse,
  string,
  { rejectValue: string }
>('patient/regenerateQR', async (patientId, { rejectWithValue }) => {
  try {
    const res = await patientApi.regenerateQR(patientId);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to regenerate wristband QR');
  }
});

const initialState: PatientState = {
  patients: INITIAL_PATIENTS,
  apiPatients: [],
  selectedPatientDetail: null,
  scannedPatient: null,
  qrData: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  qrLoading: false,
  error: null,
  successMessage: null,
  searchQuery: '',
  statusFilter: 'ALL',
  unitFilter: 'ALL',
  registrationStep: 1,
  registrationForm: initialRegistrationForm,
};

export const patientSlice = createSlice({
  name: 'patient',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
    setUnitFilter: (state, action: PayloadAction<string>) => {
      state.unitFilter = action.payload;
    },
    setRegistrationStep: (state, action: PayloadAction<number>) => {
      state.registrationStep = action.payload;
    },
    updateRegistrationForm: (state, action: PayloadAction<Partial<RegistrationFormData>>) => {
      state.registrationForm = { ...state.registrationForm, ...action.payload };
    },
    resetRegistrationForm: (state) => {
      state.registrationStep = 1;
      state.registrationForm = {
        ...initialRegistrationForm,
        patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`
      };
    },
    submitPatientRegistration: (state) => {
      const form = state.registrationForm;
      const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
      const newPatient: PatientRecord = {
        id: form.patientId || `P-${Math.floor(1000 + Math.random() * 9000)}`,
        mrn: `MRN-${Math.floor(1000000 + Math.random() * 9000000)}`,
        name: form.fullName || 'New Patient',
        age: Number(form.age) || 45,
        gender: form.gender || 'Male',
        bloodGroup: form.bloodGroup || 'O+',
        mobileNumber: form.mobileNumber || '+91 98000 00000',
        email: form.email || 'patient@hospital.in',
        bedNumber: `BED-${Math.floor(1 + Math.random() * 20).toString().padStart(2, '0')}`,
        unitName: form.department || 'Medical ICU',
        status: form.priority === 'CRITICAL' ? 'CRITICAL' : form.priority === 'HIGH' ? 'HIGH' : 'STABLE',
        reviewPriority: form.priority === 'CRITICAL' ? 'CRITICAL' : 'ROUTINE',
        admissionTime: nowStr,
        admittingDiagnosis: form.currentDiagnosis || 'General Observation',
        medicalHistory: form.medicalHistory,
        allergies: form.allergies,
        assignedClinician: form.assignedDoctor || 'Dr. Ananya Roy (Intensivist)',
        assignedNurse: 'Nurse Priya Sharma',
        department: form.department || 'Medical ICU',
        emergencyContactName: form.emergencyContactName,
        emergencyContactNumber: form.emergencyContactNumber,
        relation: form.relation,
        address: {
          country: form.country || 'India',
          state: form.state || 'Bihar',
          city: form.city || 'Patna',
          addressLine: form.addressLine || 'Main Road, Patna',
          pincode: form.pincode || '800001'
        },
        vitals: {
          hr: 82,
          spo2: 98,
          bpSystolic: 120,
          bpDiastolic: 80,
          map: 93,
          rr: 16,
          temp: 36.9,
          quality: 'LIVE',
          timestamp: new Date().toTimeString().slice(0, 8)
        },
        documents: form.aadhaarFile ? [
          { name: form.aadhaarFile, type: 'Aadhaar Card', date: new Date().toISOString().slice(0, 10) }
        ] : [],
        unifiedRemarks: [
          {
            id: `REM-REG-${Date.now()}`,
            patientId: form.patientId || 'P-NEW',
            type: 'NURSE_REMARK',
            authorName: 'Nurse Priya Sharma (Staff Nurse)',
            authorRole: 'Nurse',
            category: 'Initial Nurse Registration & Triage',
            priority: form.priority || 'ROUTINE',
            content: `Patient registered into system by Nurse Priya Sharma. Admitting diagnosis: ${form.currentDiagnosis || 'General Observation'}. Initial vitals stabilized upon ICU bed admission.`,
            timestamp: nowStr,
            isLocked: true,
            lockedAt: nowStr
          }
        ]
      };

      state.patients.unshift(newPatient);
      state.registrationStep = 1;
      state.registrationForm = {
        ...initialRegistrationForm,
        patientId: `P-${Math.floor(1000 + Math.random() * 9000)}`
      };
    },
    updatePatient: (state, action: PayloadAction<Partial<PatientRecord> & { id: string }>) => {
      const index = state.patients.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.patients[index] = { ...state.patients[index], ...action.payload };
      }
    },
    deletePatient: (state, action: PayloadAction<string>) => {
      state.patients = state.patients.filter(p => p.id !== action.payload);
    },
    assignDoctorToPatient: (state, action: PayloadAction<{ patientId: string; doctorName: string; department: string }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        patient.assignedClinician = action.payload.doctorName;
        patient.department = action.payload.department;
      }
    },
    assignBedAndStaff: (state, action: PayloadAction<{ patientId: string; bedNumber: string; unitName: string; doctorName: string; nurseName: string }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        patient.bedNumber = action.payload.bedNumber;
        patient.unitName = action.payload.unitName;
        patient.assignedClinician = action.payload.doctorName;
        patient.assignedNurse = action.payload.nurseName;
      }
    },
    addDoctorRemark: (state, action: PayloadAction<{ patientId: string; doctorName: string; category: string; priority: string; content: string }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        if (!patient.unifiedRemarks) patient.unifiedRemarks = [];
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const newRemark: UnifiedRemark = {
          id: `REM-DOC-${Date.now()}`,
          patientId: action.payload.patientId,
          type: 'DOCTOR_REMARK',
          authorName: action.payload.doctorName,
          authorRole: 'Doctor',
          category: action.payload.category || 'Clinical Directives',
          priority: action.payload.priority || 'ROUTINE',
          content: action.payload.content,
          timestamp: nowStr,
          isLocked: true,
          lockedAt: nowStr
        };
        patient.unifiedRemarks.unshift(newRemark);
      }
    },
    addNurseRemark: (state, action: PayloadAction<{ patientId: string; nurseName: string; category: string; priority: string; content: string }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        if (!patient.unifiedRemarks) patient.unifiedRemarks = [];
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
        const newRemark: UnifiedRemark = {
          id: `REM-NUR-${Date.now()}`,
          patientId: action.payload.patientId,
          type: 'NURSE_REMARK',
          authorName: action.payload.nurseName,
          authorRole: 'Nurse',
          category: action.payload.category || 'Nursing Observation',
          priority: action.payload.priority || 'ROUTINE',
          content: action.payload.content,
          timestamp: nowStr,
          isLocked: true,
          lockedAt: nowStr
        };
        patient.unifiedRemarks.unshift(newRemark);
      }
    },
    superAdminEditRemark: (state, action: PayloadAction<{ patientId: string; remarkId: string; newContent: string; auditReason: string; superAdminName: string }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient && patient.unifiedRemarks) {
        const remark = patient.unifiedRemarks.find(r => r.id === action.payload.remarkId);
        if (remark) {
          const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
          if (!remark.auditHistory) remark.auditHistory = [];

          const auditRecord: AuditHistoryRecord = {
            id: `AUD-${Date.now()}`,
            timestamp: nowStr,
            editedBy: action.payload.superAdminName,
            editedByRole: 'SUPER_ADMIN',
            previousContent: remark.content,
            newContent: action.payload.newContent,
            auditReason: action.payload.auditReason
          };

          remark.auditHistory.unshift(auditRecord);
          remark.content = action.payload.newContent;
          remark.isEditedBySuperAdmin = true;
          remark.lastEditedAt = nowStr;
          remark.lastEditedBy = action.payload.superAdminName;
        }
      }
    },
    addClinicalNote: (state, action: PayloadAction<{ patientId: string; doctorName: string; note: string; remark: string }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        if (!patient.clinicalNotesHistory) patient.clinicalNotesHistory = [];
        patient.clinicalNotesHistory.unshift({
          id: `CN-${Date.now()}`,
          doctorName: action.payload.doctorName,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          note: action.payload.note,
          remark: action.payload.remark
        });
      }
    },
    addNursingNote: (state, action: PayloadAction<{ patientId: string; nurseName: string; note: string; shift: string }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        if (!patient.nursingNotesHistory) patient.nursingNotesHistory = [];
        patient.nursingNotesHistory.unshift({
          id: `NN-${Date.now()}`,
          nurseName: action.payload.nurseName,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          note: action.payload.note,
          shift: action.payload.shift
        });
      }
    },
    updateVitals: (state, action: PayloadAction<{ patientId: string; vitals: PatientRecord['vitals'] }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        patient.vitals = action.payload.vitals;
      }
    },
    updateDoctorShiftHandover: (state, action: PayloadAction<{
      patientId: string;
      doctorName: string;
      incomingDoctor?: string;
      situation: string;
      background: string;
      assessment: string;
      recommendation: string;
      lastUpdatedBy?: string;
      handoverStatus?: 'PENDING_REVIEW' | 'TAKEN_OVER' | 'DIRECTIVES_UPDATED';
    }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
        patient.latestDoctorHandover = {
          doctorName: action.payload.doctorName,
          incomingDoctor: action.payload.incomingDoctor,
          timestamp: nowStr,
          situation: action.payload.situation,
          background: action.payload.background,
          assessment: action.payload.assessment,
          recommendation: action.payload.recommendation,
          lastUpdatedBy: action.payload.lastUpdatedBy || action.payload.doctorName,
          lastUpdatedAt: nowStr,
          handoverStatus: action.payload.handoverStatus || 'DIRECTIVES_UPDATED'
        };
      }
    },
    addDoctorHandoverUpdate: (state, action: PayloadAction<{
      patientId: string;
      doctorName: string;
      updateType: 'TAKEOVER' | 'DIRECTIVES_UPDATE' | 'CLINICAL_ADDENDUM' | 'VENTILATOR_WEANING' | 'MEDICATION_CHANGE' | 'ENDORSEMENT';
      note: string;
      setAsAssignedClinician?: boolean;
      revisedRecommendation?: string;
      revisedDirectives?: {
        situation?: string;
        background?: string;
        assessment?: string;
        recommendation?: string;
      };
    }>) => {
      const patient = state.patients.find(p => p.id === action.payload.patientId);
      if (patient) {
        const nowStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
        if (!patient.doctorHandoverUpdates) {
          patient.doctorHandoverUpdates = [];
        }

        const updateRecord: DoctorHandoverUpdate = {
          id: `DHU-${Date.now()}`,
          doctorName: action.payload.doctorName,
          updateType: action.payload.updateType,
          date: nowStr,
          note: action.payload.note,
          revisedRecommendation: action.payload.revisedRecommendation || action.payload.revisedDirectives?.recommendation,
          previousDoctorName: patient.latestDoctorHandover?.doctorName,
          acknowledgedPreviousPlan: true
        };
        patient.doctorHandoverUpdates.unshift(updateRecord);

        // Update latestDoctorHandover directives
        if (!patient.latestDoctorHandover) {
          patient.latestDoctorHandover = {
            doctorName: action.payload.doctorName,
            timestamp: nowStr,
            situation: action.payload.revisedDirectives?.situation || patient.admittingDiagnosis,
            background: action.payload.revisedDirectives?.background || patient.medicalHistory || '',
            assessment: action.payload.revisedDirectives?.assessment || `HR ${patient.vitals.hr}, BP ${patient.vitals.bpSystolic}/${patient.vitals.bpDiastolic}, SpO2 ${patient.vitals.spo2}%`,
            recommendation: action.payload.revisedRecommendation || action.payload.revisedDirectives?.recommendation || action.payload.note,
            lastUpdatedBy: action.payload.doctorName,
            lastUpdatedAt: nowStr,
            handoverStatus: action.payload.updateType === 'TAKEOVER' ? 'TAKEN_OVER' : 'DIRECTIVES_UPDATED'
          };
        } else {
          if (action.payload.revisedDirectives?.situation) {
            patient.latestDoctorHandover.situation = action.payload.revisedDirectives.situation;
          }
          if (action.payload.revisedDirectives?.background) {
            patient.latestDoctorHandover.background = action.payload.revisedDirectives.background;
          }
          if (action.payload.revisedDirectives?.assessment) {
            patient.latestDoctorHandover.assessment = action.payload.revisedDirectives.assessment;
          }
          if (action.payload.revisedRecommendation || action.payload.revisedDirectives?.recommendation) {
            patient.latestDoctorHandover.recommendation = action.payload.revisedRecommendation || action.payload.revisedDirectives?.recommendation || '';
          }
          patient.latestDoctorHandover.lastUpdatedBy = action.payload.doctorName;
          patient.latestDoctorHandover.lastUpdatedAt = nowStr;
          patient.latestDoctorHandover.handoverStatus = action.payload.updateType === 'TAKEOVER' ? 'TAKEN_OVER' : 'DIRECTIVES_UPDATED';
        }

        // If requested, set incoming doctor as primary assigned clinician
        if (action.payload.setAsAssignedClinician) {
          patient.assignedClinician = action.payload.doctorName;
        }

        // Also add to clinical notes history
        if (!patient.clinicalNotesHistory) {
          patient.clinicalNotesHistory = [];
        }
        patient.clinicalNotesHistory.unshift({
          id: `CN-${Date.now()}`,
          doctorName: action.payload.doctorName,
          date: nowStr,
          note: `[INCOMING DOCTOR SHIFT UPDATE: ${action.payload.updateType}] ${action.payload.note}${action.payload.revisedRecommendation ? ` | Revised Plan: ${action.payload.revisedRecommendation}` : ''}`,
          remark: 'Incoming Doctor Update'
        });
      }
    },
    clearPatientError: (state) => {
      state.error = null;
    },
    clearPatientSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearScannedPatient: (state) => {
      state.scannedPatient = null;
    },
    clearSelectedPatientDetail: (state) => {
      state.selectedPatientDetail = null;
    },
    clearQrData: (state) => {
      state.qrData = null;
    },
  },
  extraReducers: (builder) => {
    // 1. fetchPatientsThunk
    builder
      .addCase(fetchPatientsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.apiPatients = action.payload || [];
        if (action.payload && action.payload.length > 0) {
          const liveRecords = action.payload.map((p) => {
            const existing = state.patients.find((ep) => ep.id === p.id || ep.mrn === p.mrn);
            return mapPatientResponseToRecord(p, existing);
          });
          const unmappedLocal = state.patients.filter(
            (lp) => !action.payload.some((bp) => bp.id === lp.id || bp.mrn === lp.mrn)
          );
          state.patients = [...liveRecords, ...unmappedLocal];
        }
      })
      .addCase(fetchPatientsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch patients';
      });

    // 2. fetchPatientDetailsThunk
    builder
      .addCase(fetchPatientDetailsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatientDetailsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPatientDetail = action.payload;
      })
      .addCase(fetchPatientDetailsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch patient details';
      });

    // 3. registerPatientThunk
    builder
      .addCase(registerPatientThunk.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(registerPatientThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.apiPatients.unshift(action.payload);
        const newRec = mapPatientResponseToRecord(action.payload);
        state.patients.unshift(newRec);
        state.successMessage = `Patient ${action.payload.first_name} ${action.payload.last_name} registered successfully (MRN: ${action.payload.mrn})`;
      })
      .addCase(registerPatientThunk.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload || 'Failed to register patient';
      });

    // 4. updatePatientDemographicsThunk
    builder
      .addCase(updatePatientDemographicsThunk.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updatePatientDemographicsThunk.fulfilled, (state, action) => {
        state.updating = false;
        const idx = state.apiPatients.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) {
          state.apiPatients[idx] = action.payload;
        }
        const pIdx = state.patients.findIndex((p) => p.id === action.payload.id);
        if (pIdx !== -1) {
          state.patients[pIdx] = mapPatientResponseToRecord(action.payload, state.patients[pIdx]);
        }
        if (state.selectedPatientDetail?.id === action.payload.id) {
          state.selectedPatientDetail = { ...state.selectedPatientDetail, ...action.payload };
        }
        state.successMessage = `Patient ${action.payload.first_name} ${action.payload.last_name} demographics updated successfully.`;
      })
      .addCase(updatePatientDemographicsThunk.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload || 'Failed to update demographics';
      });

    // 5. deletePatientThunk
    builder
      .addCase(deletePatientThunk.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deletePatientThunk.fulfilled, (state, action) => {
        state.deleting = false;
        state.apiPatients = state.apiPatients.filter((p) => p.id !== action.payload);
        state.patients = state.patients.filter((p) => p.id !== action.payload);
        if (state.selectedPatientDetail?.id === action.payload) {
          state.selectedPatientDetail = null;
        }
        state.successMessage = 'Patient soft deleted successfully.';
      })
      .addCase(deletePatientThunk.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || 'Failed to delete patient';
      });

    // 6. resolvePatientQRThunk
    builder
      .addCase(resolvePatientQRThunk.pending, (state) => {
        state.qrLoading = true;
        state.error = null;
      })
      .addCase(resolvePatientQRThunk.fulfilled, (state, action) => {
        state.qrLoading = false;
        state.scannedPatient = action.payload;
      })
      .addCase(resolvePatientQRThunk.rejected, (state, action) => {
        state.qrLoading = false;
        state.error = action.payload || 'Invalid or inactive QR token';
      });

    // 7. regeneratePatientQRThunk
    builder
      .addCase(regeneratePatientQRThunk.pending, (state) => {
        state.qrLoading = true;
        state.error = null;
      })
      .addCase(regeneratePatientQRThunk.fulfilled, (state, action) => {
        state.qrLoading = false;
        state.qrData = action.payload;
        if (state.selectedPatientDetail && state.selectedPatientDetail.id === action.payload.patient_id) {
          state.selectedPatientDetail.qr_token = action.payload.qr_token;
        }
        const pIdx = state.patients.findIndex((p) => p.id === action.payload.patient_id);
        if (pIdx !== -1) {
          (state.patients[pIdx] as any).qr_token = action.payload.qr_token;
        }
        state.successMessage = 'Bedside wristband QR token regenerated successfully.';
      })
      .addCase(regeneratePatientQRThunk.rejected, (state, action) => {
        state.qrLoading = false;
        state.error = action.payload || 'Failed to regenerate wristband QR';
      });
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  setUnitFilter,
  setRegistrationStep,
  updateRegistrationForm,
  resetRegistrationForm,
  submitPatientRegistration,
  updatePatient,
  deletePatient,
  assignDoctorToPatient,
  assignBedAndStaff,
  addDoctorRemark,
  addNurseRemark,
  superAdminEditRemark,
  addClinicalNote,
  addNursingNote,
  updateVitals,
  updateDoctorShiftHandover,
  addDoctorHandoverUpdate,
  clearPatientError,
  clearPatientSuccessMessage,
  clearScannedPatient,
  clearSelectedPatientDetail,
  clearQrData,
} = patientSlice.actions;

export default patientSlice.reducer;
