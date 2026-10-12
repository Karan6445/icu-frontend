import {
  EClinic,
  DoctorAvailability,
  Appointment,
  EClinicVitals,
  PrescriptionItem
} from '../types/eclinic';

export const MOCK_CLINICS: EClinic[] = [
  {
    id: 'ECLINIC-PATNA-01',
    hospitalId: 'HOSP-METRO-001',
    clinicCode: 'ECL-PAT-01',
    clinicName: 'Patna Central Digital E-Clinic',
    location: 'District Center, Patna',
    address: 'Gate 4, Rajendra Nagar Medical Hub, Patna, Bihar 800016',
    contactNumber: '+91 612 254 9912',
    operatingStatus: 'OPEN'
  },
  {
    id: 'ECLINIC-GAYA-02',
    hospitalId: 'HOSP-GAYA-002',
    clinicCode: 'ECL-GAY-02',
    clinicName: 'Gaya Rural Tele-Health Node',
    location: 'Bodh Gaya Primary Node',
    address: 'Near PHC Campus, Bodh Gaya, Bihar 824231',
    contactNumber: '+91 631 222 4110',
    operatingStatus: 'OPEN'
  },
  {
    id: 'ECLINIC-MUZ-03',
    hospitalId: 'HOSP-MUZ-003',
    clinicCode: 'ECL-MUZ-03',
    clinicName: 'Muzaffarpur Community OPD Center',
    location: 'SKMCH Extension Node',
    address: 'North Ring Road, Muzaffarpur, Bihar 842004',
    contactNumber: '+91 621 245 8080',
    operatingStatus: 'BUSY'
  }
];

export const MOCK_DOCTORS: DoctorAvailability[] = [
  {
    doctorId: 'DOC-101',
    name: 'Dr. Alexander Watson',
    specialty: 'General Physician & Critical Care',
    qualification: 'MD, FCCP (Intensive Care)',
    licenseNumber: 'MCI-BIH-48921',
    experience: '14 Years Experience',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    consultationModes: ['VIDEO', 'IN_PERSON', 'HYBRID'],
    isOnline: true,
    isTelemedEnabled: true,
    clinicId: 'ECLINIC-PATNA-01',
    clinicName: 'Patna Central Digital E-Clinic',
    todayAppointmentsCount: 12,
    waitingPatientsCount: 3,
    completedTodayCount: 7,
    schedule: [
      { dayOfWeek: 'Monday - Friday', startTime: '09:00 AM', endTime: '02:00 PM' },
      { dayOfWeek: 'Monday - Friday', startTime: '04:00 PM', endTime: '07:30 PM' }
    ]
  },
  {
    doctorId: 'DOC-102',
    name: 'Dr. Ananya Roy',
    specialty: 'Pulmonologist & Respiratory Care',
    qualification: 'MD (Chest Medicine), DM',
    licenseNumber: 'MCI-BIH-51204',
    experience: '12 Years Experience',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813583-0599c2d1b8c1?w=150&auto=format&fit=crop&q=80',
    consultationModes: ['VIDEO', 'HYBRID'],
    isOnline: true,
    isTelemedEnabled: true,
    clinicId: 'ECLINIC-PATNA-01',
    clinicName: 'Patna Central Digital E-Clinic',
    todayAppointmentsCount: 8,
    waitingPatientsCount: 2,
    completedTodayCount: 5,
    schedule: [
      { dayOfWeek: 'Tuesday, Thursday, Saturday', startTime: '10:00 AM', endTime: '03:00 PM' }
    ]
  },
  {
    doctorId: 'DOC-103',
    name: 'Dr. Rajesh Vardhan',
    specialty: 'Cardiologist',
    qualification: 'MD, DM (Cardiology), FACC',
    licenseNumber: 'MCI-BIH-39182',
    experience: '18 Years Experience',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    consultationModes: ['VIDEO'],
    isOnline: true,
    isTelemedEnabled: true,
    clinicId: 'ECLINIC-PATNA-01',
    clinicName: 'Patna Central Digital E-Clinic',
    todayAppointmentsCount: 10,
    waitingPatientsCount: 1,
    completedTodayCount: 8,
    schedule: [
      { dayOfWeek: 'Monday, Wednesday, Friday', startTime: '11:00 AM', endTime: '04:00 PM' }
    ]
  },
  {
    doctorId: 'DOC-104',
    name: 'Dr. Sunita Rao',
    specialty: 'Pediatrician',
    qualification: 'MBBS, DCH, MD (Pediatrics)',
    licenseNumber: 'MCI-BIH-60293',
    experience: '10 Years Experience',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    consultationModes: ['VIDEO', 'IN_PERSON'],
    isOnline: false,
    isTelemedEnabled: true,
    clinicId: 'ECLINIC-GAYA-02',
    clinicName: 'Gaya Rural Tele-Health Node',
    todayAppointmentsCount: 6,
    waitingPatientsCount: 0,
    completedTodayCount: 6,
    schedule: [
      { dayOfWeek: 'Daily Except Sunday', startTime: '09:00 AM', endTime: '01:00 PM' }
    ]
  }
];

export const MOCK_MEDICATION_FORMULARY: PrescriptionItem[] = [
  {
    id: 'MED-01',
    medicineName: 'Paracetamol',
    genericName: 'Acetaminophen',
    strength: '650 mg',
    dosage: '1 Tablet',
    frequency: '1-0-1',
    route: 'Oral',
    duration: '3 Days',
    instructions: 'After meals for fever / body ache',
    quantity: 6
  },
  {
    id: 'MED-02',
    medicineName: 'Amoxicillin + Clavulanic Acid',
    genericName: 'Amoxicillin / Clavulanate',
    strength: '625 mg',
    dosage: '1 Tablet',
    frequency: '1-0-1',
    route: 'Oral',
    duration: '5 Days',
    instructions: 'Complete full course with meals',
    quantity: 10
  },
  {
    id: 'MED-03',
    medicineName: 'Azithromycin',
    genericName: 'Azithromycin Dihydrate',
    strength: '500 mg',
    dosage: '1 Tablet',
    frequency: '1-0-0',
    route: 'Oral',
    duration: '3 Days',
    instructions: '1 hour before food, once daily',
    quantity: 3
  },
  {
    id: 'MED-04',
    medicineName: 'Pantoprazole',
    genericName: 'Pantoprazole Sodium',
    strength: '40 mg',
    dosage: '1 Tablet',
    frequency: '1-0-0',
    route: 'Oral',
    duration: '7 Days',
    instructions: 'Empty stomach, early morning',
    quantity: 7
  },
  {
    id: 'MED-05',
    medicineName: 'Levocetirizine + Montelukast',
    genericName: 'Levocetirizine / Montelukast',
    strength: '5mg / 10mg',
    dosage: '1 Tablet',
    frequency: '0-0-1',
    route: 'Oral',
    duration: '10 Days',
    instructions: 'At bedtime for allergic symptoms',
    quantity: 10
  },
  {
    id: 'MED-06',
    medicineName: 'Metformin Hydrochloride',
    genericName: 'Metformin Sustained Release',
    strength: '500 mg',
    dosage: '1 Tablet',
    frequency: '1-0-1',
    route: 'Oral',
    duration: '30 Days',
    instructions: 'With or immediately after main meals',
    quantity: 60
  },
  {
    id: 'MED-07',
    medicineName: 'Telmisartan',
    genericName: 'Telmisartan',
    strength: '40 mg',
    dosage: '1 Tablet',
    frequency: '1-0-0',
    route: 'Oral',
    duration: '30 Days',
    instructions: 'Once daily morning for blood pressure',
    quantity: 30
  },
  {
    id: 'MED-08',
    medicineName: 'Budecort Inhaler',
    genericName: 'Budesonide Inhalation Aerosol',
    strength: '200 mcg',
    dosage: '2 Puffs',
    frequency: '1-0-1',
    route: 'Inhalation',
    duration: '14 Days',
    instructions: 'Rinse mouth thoroughly after each inhalation',
    quantity: 1
  }
];

export const FORMULARY_MEDICATIONS = MOCK_MEDICATION_FORMULARY;

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-1001',
    tokenNumber: 'TK-01',
    clinicId: 'ECLINIC-PATNA-01',
    clinicName: 'Patna Central Digital E-Clinic',
    patientId: 'PT-1001',
    patientName: 'Rajesh Kumar Verma',
    patientMrn: 'MRN-PAT-8801',
    patientAge: 48,
    patientGender: 'Male',
    patientPhone: '+91 98350 12841',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Alexander Watson',
    specialty: 'General Physician & Critical Care',
    date: '2026-10-05',
    time: '10:15 AM',
    status: 'READY_FOR_DOCTOR',
    priority: 'URGENT',
    reason: 'High fever (102°F) since 3 days, persistent dry cough and chest congestion',
    waitingDurationMinutes: 14,
    createdAt: '2026-10-05T09:45:00Z',
    vitals: {
      id: 'VIT-1001',
      patientId: 'PT-1001',
      appointmentId: 'APT-1001',
      systolicBp: 142,
      diastolicBp: 92,
      pulseRate: 104,
      spo2: 94,
      temperature: 38.9,
      bloodGlucose: 138,
      weightKg: 74,
      heightCm: 172,
      bmi: 25.0,
      warnings: ['Elevated systolic blood pressure', 'Resting tachycardia (>100 bpm)', 'Pyrexia / High fever (38.9°C)'],
      recordedBy: 'Nurse Priya Sharma (RN-102)',
      recordedAt: '10:05 AM'
    }
  },
  {
    id: 'APT-1002',
    tokenNumber: 'TK-02',
    clinicId: 'ECLINIC-PATNA-01',
    clinicName: 'Patna Central Digital E-Clinic',
    patientId: 'PT-1002',
    patientName: 'Sunita Devi',
    patientMrn: 'MRN-PAT-8802',
    patientAge: 56,
    patientGender: 'Female',
    patientPhone: '+91 94312 90432',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Alexander Watson',
    specialty: 'General Physician & Critical Care',
    date: '2026-10-05',
    time: '10:30 AM',
    status: 'READY_FOR_DOCTOR',
    priority: 'ROUTINE',
    reason: 'Routine hypertension and diabetes mellitus 3-month review. Occasional morning headaches',
    waitingDurationMinutes: 28,
    createdAt: '2026-10-05T09:50:00Z',
    vitals: {
      id: 'VIT-1002',
      patientId: 'PT-1002',
      appointmentId: 'APT-1002',
      systolicBp: 136,
      diastolicBp: 86,
      pulseRate: 78,
      spo2: 98,
      temperature: 36.8,
      bloodGlucose: 154,
      weightKg: 68,
      heightCm: 158,
      bmi: 27.2,
      warnings: ['Pre-hypertension stage 1', 'Elevated random blood glucose (>140 mg/dL)'],
      recordedBy: 'Nurse Priya Sharma (RN-102)',
      recordedAt: '10:12 AM'
    }
  },
  {
    id: 'APT-1003',
    tokenNumber: 'TK-03',
    clinicId: 'ECLINIC-PATNA-01',
    clinicName: 'Patna Central Digital E-Clinic',
    patientId: 'PT-1003',
    patientName: 'Amit Kumar Singh',
    patientMrn: 'MRN-PAT-8803',
    patientAge: 34,
    patientGender: 'Male',
    patientPhone: '+91 87091 55670',
    doctorId: 'DOC-102',
    doctorName: 'Dr. Ananya Roy',
    specialty: 'Pulmonologist & Respiratory Care',
    date: '2026-10-05',
    time: '10:45 AM',
    status: 'WAITING',
    priority: 'ROUTINE',
    reason: 'Mild shortness of breath upon exertion and seasonal rhinitis for past 10 days',
    waitingDurationMinutes: 40,
    createdAt: '2026-10-05T09:55:00Z'
  },
  {
    id: 'APT-1004',
    tokenNumber: 'TK-04',
    clinicId: 'ECLINIC-PATNA-01',
    clinicName: 'Patna Central Digital E-Clinic',
    patientId: 'PT-1004',
    patientName: 'Pooja Kumari',
    patientMrn: 'MRN-PAT-8804',
    patientAge: 29,
    patientGender: 'Female',
    patientPhone: '+91 79034 43219',
    doctorId: 'DOC-101',
    doctorName: 'Dr. Alexander Watson',
    specialty: 'General Physician & Critical Care',
    date: '2026-10-05',
    time: '11:00 AM',
    status: 'CHECKED_IN',
    priority: 'ROUTINE',
    reason: 'Abdominal pain and acute acid reflux post meals',
    waitingDurationMinutes: 10,
    createdAt: '2026-10-05T10:15:00Z'
  },
  {
    id: 'APT-1005',
    tokenNumber: 'TK-05',
    clinicId: 'ECLINIC-PATNA-01',
    clinicName: 'Patna Central Digital E-Clinic',
    patientId: 'PT-1005',
    patientName: 'Rameshwar Prasad',
    patientMrn: 'MRN-PAT-8805',
    patientAge: 68,
    patientGender: 'Male',
    patientPhone: '+91 91223 88123',
    doctorId: 'DOC-103',
    doctorName: 'Dr. Rajesh Vardhan',
    specialty: 'Cardiologist',
    date: '2026-10-05',
    time: '09:30 AM',
    status: 'COMPLETED',
    priority: 'ROUTINE',
    reason: 'Post-CABG routine cardiac evaluation and lipid titration',
    waitingDurationMinutes: 0,
    createdAt: '2026-10-05T09:00:00Z',
    vitals: {
      id: 'VIT-1005',
      patientId: 'PT-1005',
      appointmentId: 'APT-1005',
      systolicBp: 124,
      diastolicBp: 78,
      pulseRate: 72,
      spo2: 99,
      temperature: 36.6,
      bloodGlucose: 112,
      weightKg: 71,
      heightCm: 168,
      bmi: 25.2,
      warnings: [],
      recordedBy: 'Nurse Priya Sharma',
      recordedAt: '09:20 AM'
    }
  }
];

const E_CLINIC_STORAGE_KEY = 'naimify_eclinic_appointments';

export const getStoredAppointments = (): Appointment[] => {
  try {
    const raw = localStorage.getItem(E_CLINIC_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load appointments from storage', err);
  }
  return INITIAL_APPOINTMENTS;
};

export const saveAppointments = (appointments: Appointment[]) => {
  try {
    localStorage.setItem(E_CLINIC_STORAGE_KEY, JSON.stringify(appointments));
    window.dispatchEvent(new Event('eclinic_appointments_updated'));
  } catch (err) {
    console.error('Failed to save appointments to storage', err);
  }
};

export const getAppointmentById = (id: string): Appointment | undefined => {
  const all = getStoredAppointments();
  return all.find(a => a.id === id);
};

export const updateAppointmentStatus = (id: string, status: Appointment['status']): Appointment | undefined => {
  const all = getStoredAppointments();
  const index = all.findIndex(a => a.id === id);
  if (index !== -1) {
    all[index] = { ...all[index], status };
    saveAppointments(all);
    return all[index];
  }
  return undefined;
};

export const updateAppointmentVitals = (appointmentId: string, vitals: EClinicVitals): Appointment | undefined => {
  const all = getStoredAppointments();
  const index = all.findIndex(a => a.id === appointmentId);
  if (index !== -1) {
    all[index] = {
      ...all[index],
      vitals,
      status: all[index].status === 'WAITING' || all[index].status === 'CHECKED_IN' ? 'READY_FOR_DOCTOR' : all[index].status
    };
    saveAppointments(all);
    return all[index];
  }
  return undefined;
};

export const saveConsultationRecord = (
  appointmentId: string,
  soapNote?: any,
  prescription?: any,
  referral?: any
): Appointment | undefined => {
  const all = getStoredAppointments();
  const index = all.findIndex(a => a.id === appointmentId);
  if (index !== -1) {
    all[index] = {
      ...all[index],
      soapNote: soapNote || all[index].soapNote,
      prescription: prescription || all[index].prescription,
      referral: referral || all[index].referral,
      status: 'COMPLETED'
    };
    saveAppointments(all);
    return all[index];
  }
  return undefined;
};

export const resetMockData = () => {
  localStorage.setItem(E_CLINIC_STORAGE_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
  window.dispatchEvent(new Event('eclinic_appointments_updated'));
};
