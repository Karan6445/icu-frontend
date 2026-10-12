import { DataQuality } from './observation';

export interface ChangeEvent {
  id: string;
  patientId: string;
  parameterCode: string;
  parameterName: string;
  beforeValue: string | number;
  afterValue: string | number;
  unit: string;
  changeDelta: string;
  direction: 'UP' | 'DOWN' | 'STABLE';
  durationMinutes: number;
  timestamp: string;
  sourceDevice: string;
  quality: DataQuality;
  isMeaningful: boolean;
  category: 'VITALS' | 'VENTILATOR' | 'LABS' | 'INFUSIONS' | 'EVENTS';
}

export interface ClinicalEvent {
  id: string;
  patientId: string;
  eventType: 'VITAL_ALERT' | 'LAB_RESULT' | 'VENT_CHANGE' | 'INFUSION_START' | 'PROCEDURE' | 'CLINICAL_NOTE' | 'HANDOFF';
  title: string;
  description: string;
  timestamp: string;
  sourceDevice?: string;
  author?: string;
  dataQuality: DataQuality;
  metadata?: Record<string, any>;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  flag: 'NORMAL' | 'HIGH' | 'LOW' | 'CRITICAL';
  specimenTime: string;
  resultTime: string;
}

export interface CopilotCitation {
  id: string;
  timestamp: string;
  source: string;
  parameterName: string;
  value: string;
  quality: DataQuality;
}

export interface CopilotMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  text: string;
  timestamp: string;
  citations?: CopilotCitation[];
  isThinking?: boolean;
}
