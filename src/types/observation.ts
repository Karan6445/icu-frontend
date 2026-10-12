export type DataQuality = 'LIVE' | 'DELAYED' | 'STALE' | 'DISCONNECTED';
export type ClinicalStatus = 'STABLE' | 'ROUTINE' | 'HIGH' | 'CRITICAL';

export interface Observation {
  id: string;
  patientId: string;
  encounterId: string;
  bedId: string;
  deviceId: string;
  parameterCode: string;
  parameterName: string;
  value: number | string;
  unit: string;
  sourceTimestamp: string;
  receivedTimestamp: string;
  quality: DataQuality;
  status: ClinicalStatus;
  normalRange?: { min: number; max: number };
}

export interface VitalSet {
  hr: number; // Heart Rate (bpm)
  spo2: number; // SpO2 (%)
  bpSystolic: number; // Blood Pressure Systolic (mmHg)
  bpDiastolic: number; // Blood Pressure Diastolic (mmHg)
  map: number; // Mean Arterial Pressure (mmHg)
  rr: number; // Respiratory Rate (/min)
  temp: number; // Temperature (°C)
  quality: DataQuality;
  timestamp: string;
}

export interface VentilatorObservation {
  mode: string; // e.g. "SIMV-PC", "PRVC", "CPAP/PS"
  peep: number; // cmH2O
  fio2: number; // %
  tidalVolume: number; // mL
  pPeak: number; // cmH2O
  rrSet: number; // /min
  rrTotal: number; // /min
  ieRatio: string; // "1:2.0"
  quality: DataQuality;
  timestamp: string;
}

export interface Infusion {
  id: string;
  pumpId: string;
  medication: string;
  rate: number; // e.g., 5.0
  unit: string; // "mcg/kg/min", "mL/h", "mg/h"
  volumeDelivered: number; // mL
  bagVolume: number; // mL
  status: 'RUNNING' | 'PAUSED' | 'ALARM' | 'STOPPED';
  quality: DataQuality;
  lastUpdate: string;
}
