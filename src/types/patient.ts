import { ClinicalStatus, DataQuality, VitalSet, VentilatorObservation } from './observation';

export interface Bed {
  id: string;
  number: string; // e.g. "BED-07"
  unitId: string;
  unitName: string;
  occupied: boolean;
  patientId?: string;
  x?: number; // Floorplan grid X coordinate
  y?: number; // Floorplan grid Y coordinate
}

export interface Encounter {
  id: string;
  patientId: string;
  admissionDate: string;
  admittingDiagnosis: string;
  attendingPhysician: string;
  assignedClinician: string;
  assignedNurse: string;
  isolation: boolean;
  isolationType?: string;
  codeStatus: 'FULL CODE' | 'DNR' | 'DNI';
}

export interface Patient {
  id: string; // e.g. "P-1024"
  mrn: string; // Medical Record Number
  name: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  bedNumber: string;
  unitName: string;
  status: ClinicalStatus;
  reviewPriority: 'CRITICAL' | 'HIGH' | 'ROUTINE' | 'STABLE';
  admissionTime: string;
  admittingDiagnosis: string;
  assignedClinician: string;
  assignedNurse: string;
  codeStatus?: 'FULL CODE' | 'DNR' | 'DNI';
  vitals: VitalSet;
  ventilator?: VentilatorObservation;
  deviceConnectivity: number; // percentage, e.g. 100
  lastReviewTime: string;
  unreadChangesCount: number;
}
