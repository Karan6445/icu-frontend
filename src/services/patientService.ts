import { Patient, Bed } from '../types/icu';
import { MOCK_PATIENTS, MOCK_BEDS } from '../data/mockData';

export class PatientService {
  private static patients: Patient[] = [...MOCK_PATIENTS];
  private static beds: Bed[] = [...MOCK_BEDS];

  static getAllPatients(): Patient[] {
    return this.patients;
  }

  static getPatientById(id: string): Patient | undefined {
    return this.patients.find(p => p.id === id || p.mrn === id);
  }

  static getPatientsByDoctor(doctorId: string): Patient[] {
    return this.patients.filter(p => p.assignedClinicianId === doctorId || p.assignedClinician.includes(doctorId));
  }

  static getPatientsByNurse(nurseId: string): Patient[] {
    return this.patients.filter(p => p.assignedNurseId === nurseId || p.assignedNurse.includes(nurseId));
  }

  static getBeds(): Bed[] {
    return this.beds.map(b => {
      const patient = this.patients.find(p => p.bedNumber === b.number);
      return {
        ...b,
        occupied: !!patient,
        patientId: patient?.id,
        patient
      };
    });
  }

  static addPatient(newPatientData: Partial<Patient>): Patient {
    const id = newPatientData.id || `P-${1024 + this.patients.length + 1}`;
    const defaultMrn = `MRN-${Math.floor(88491000 + Math.random() * 9000)}`;

    const fullPatient: Patient = {
      id,
      mrn: newPatientData.mrn || defaultMrn,
      name: newPatientData.name || 'New Patient',
      age: newPatientData.age || 45,
      gender: newPatientData.gender || 'M',
      bedNumber: newPatientData.bedNumber || 'ICU-18',
      unitName: newPatientData.unitName || 'MICU-01',
      status: newPatientData.status || 'STABLE',
      reviewPriority: newPatientData.reviewPriority || 'ROUTINE',
      admissionTime: newPatientData.admissionTime || new Date().toISOString(),
      admittingDiagnosis: newPatientData.admittingDiagnosis || 'ICU Observation & Monitoring',
      assignedClinicianId: newPatientData.assignedClinicianId || 'DR-104',
      assignedClinician: newPatientData.assignedClinician || 'Dr. Rahul Sharma',
      assignedNurseId: newPatientData.assignedNurseId || 'RN-204',
      assignedNurse: newPatientData.assignedNurse || 'Priya Singh',
      assignedNurseRole: newPatientData.assignedNurseRole || 'RN',
      codeStatus: newPatientData.codeStatus || 'FULL CODE',
      vitals: newPatientData.vitals || {
        hr: { value: 80, unit: 'bpm', timestamp: 'Just Now', source: 'Philips MX800', quality: 'LIVE' },
        spo2: { value: 98, unit: '%', timestamp: 'Just Now', source: 'Pulse Ox', quality: 'LIVE' },
        bpSystolic: { value: 120, unit: 'mmHg', timestamp: 'Just Now', source: 'NIBP Cuff', quality: 'LIVE' },
        bpDiastolic: { value: 78, unit: 'mmHg', timestamp: 'Just Now', source: 'NIBP Cuff', quality: 'LIVE' },
        map: { value: 92, unit: 'mmHg', timestamp: 'Just Now', source: 'NIBP Cuff', quality: 'LIVE' },
        rr: { value: 16, unit: 'bpm', timestamp: 'Just Now', source: 'Resp Sensor', quality: 'LIVE' },
        temp: { value: 36.8, unit: '°C', timestamp: 'Just Now', source: 'Oral Temp', quality: 'LIVE' }
      },
      infusions: newPatientData.infusions || [],
      deviceConnectivity: 100,
      lastReviewTime: 'Just Now',
      unreadChangesCount: 0
    };

    this.patients.unshift(fullPatient);
    MOCK_PATIENTS.unshift(fullPatient);
    return fullPatient;
  }

  static updatePatientVitals(patientId: string, updatedVitals: Partial<Patient['vitals']>): Patient | undefined {
    const patient = this.getPatientById(patientId);
    if (!patient) return undefined;
    patient.vitals = { ...patient.vitals, ...updatedVitals };
    return patient;
  }
}
