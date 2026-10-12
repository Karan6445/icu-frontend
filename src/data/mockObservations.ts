import { ChangeEvent, ClinicalEvent, LabResult } from '../types/clinical';
import { Infusion } from '../types/observation';

export const MOCK_CHANGE_EVENTS: ChangeEvent[] = [
  {
    id: 'chg-01',
    patientId: 'P-1024',
    parameterCode: 'SpO2',
    parameterName: 'Oxygen Saturation',
    beforeValue: 97,
    afterValue: 91,
    unit: '%',
    changeDelta: '-6%',
    direction: 'DOWN',
    durationMinutes: 8,
    timestamp: '12:41',
    sourceDevice: 'Mindray BeneVision N22 (Bedside Monitor 07)',
    quality: 'LIVE',
    isMeaningful: true,
    category: 'VITALS'
  },
  {
    id: 'chg-02',
    patientId: 'P-1024',
    parameterCode: 'HR',
    parameterName: 'Heart Rate',
    beforeValue: 82,
    afterValue: 104,
    unit: 'bpm',
    changeDelta: '+22 bpm',
    direction: 'UP',
    durationMinutes: 12,
    timestamp: '12:35',
    sourceDevice: 'Mindray BeneVision N22 (Bedside Monitor 07)',
    quality: 'LIVE',
    isMeaningful: true,
    category: 'VITALS'
  },
  {
    id: 'chg-03',
    patientId: 'P-1024',
    parameterCode: 'RR',
    parameterName: 'Respiratory Rate',
    beforeValue: 18,
    afterValue: 27,
    unit: '/min',
    changeDelta: '+9 /min',
    direction: 'UP',
    durationMinutes: 10,
    timestamp: '12:38',
    sourceDevice: 'Hamilton-G5 Ventilator 07',
    quality: 'LIVE',
    isMeaningful: true,
    category: 'VENTILATOR'
  },
  {
    id: 'chg-04',
    patientId: 'P-1024',
    parameterCode: 'PEEP',
    parameterName: 'Positive End-Expiratory Pressure',
    beforeValue: 8,
    afterValue: 10,
    unit: 'cmH2O',
    changeDelta: '+2 cmH2O',
    direction: 'UP',
    durationMinutes: 25,
    timestamp: '12:15',
    sourceDevice: 'Hamilton-G5 Ventilator 07',
    quality: 'LIVE',
    isMeaningful: true,
    category: 'VENTILATOR'
  },
  {
    id: 'chg-05',
    patientId: 'P-1024',
    parameterCode: 'FiO2',
    parameterName: 'Fraction of Inspired Oxygen',
    beforeValue: 45,
    afterValue: 60,
    unit: '%',
    changeDelta: '+15%',
    direction: 'UP',
    durationMinutes: 25,
    timestamp: '12:15',
    sourceDevice: 'Hamilton-G5 Ventilator 07',
    quality: 'LIVE',
    isMeaningful: true,
    category: 'VENTILATOR'
  },
  {
    id: 'chg-06',
    patientId: 'P-1024',
    parameterCode: 'NOREPI',
    parameterName: 'Norepinephrine Infusion',
    beforeValue: 0.04,
    afterValue: 0.08,
    unit: 'mcg/kg/min',
    changeDelta: '+0.04 mcg/kg/min',
    direction: 'UP',
    durationMinutes: 40,
    timestamp: '12:00',
    sourceDevice: 'B. Braun Spaceplus Pump 07A',
    quality: 'LIVE',
    isMeaningful: true,
    category: 'INFUSIONS'
  }
];

export const MOCK_CLINICAL_EVENTS: ClinicalEvent[] = [
  {
    id: 'evt-101',
    patientId: 'P-1024',
    eventType: 'VITAL_ALERT',
    title: 'SpO2 Sustained Desaturation Alert',
    description: 'SpO2 dropped from 97% to 91% over 8 minutes. Sustained below 92% threshold.',
    timestamp: '2026-09-17 12:41:32',
    sourceDevice: 'Mindray BeneVision N22 (Bedside Monitor 07)',
    dataQuality: 'LIVE',
    metadata: { initialValue: 97, currentValue: 91, threshold: 92 }
  },
  {
    id: 'evt-102',
    patientId: 'P-1024',
    eventType: 'VENT_CHANGE',
    title: 'PEEP & FiO2 Titration',
    description: 'PEEP increased from 8 to 10 cmH2O, FiO2 increased from 45% to 60% by Dr. Ananya Roy.',
    timestamp: '2026-09-17 12:15:00',
    sourceDevice: 'Hamilton-G5 Ventilator 07',
    author: 'Dr. Ananya Roy',
    dataQuality: 'LIVE'
  },
  {
    id: 'evt-103',
    patientId: 'P-1024',
    eventType: 'LAB_RESULT',
    title: 'Arterial Blood Gas (ABG) Verified',
    description: 'pH 7.31, PaO2 64 mmHg, PaCO2 48 mmHg, HCO3- 23.4 mEq/L, Lactate 2.4 mmol/L.',
    timestamp: '2026-09-17 11:30:00',
    sourceDevice: 'Roche cobas b 221 ABG Analyzer',
    dataQuality: 'LIVE',
    metadata: { pao2: 64, paco2: 48, ph: 7.31, lactate: 2.4 }
  },
  {
    id: 'evt-104',
    patientId: 'P-1024',
    eventType: 'INFUSION_START',
    title: 'Norepinephrine Dose Increased',
    description: 'Norepinephrine rate increased from 0.04 to 0.08 mcg/kg/min to maintain MAP > 65 mmHg.',
    timestamp: '2026-09-17 12:00:00',
    sourceDevice: 'B. Braun Spaceplus Pump 07A',
    author: 'Nurse Vikram Singh',
    dataQuality: 'LIVE'
  },
  {
    id: 'evt-105',
    patientId: 'P-1024',
    eventType: 'PROCEDURE',
    title: 'Bedside Chest X-Ray Performed',
    description: 'AP view shows bilateral lower zone patchy infiltrates, consistent with ARDS evolution.',
    timestamp: '2026-09-17 09:15:00',
    author: 'Dr. S. Kulkarni (Radiology)',
    dataQuality: 'LIVE'
  },
  {
    id: 'evt-106',
    patientId: 'P-1024',
    eventType: 'CLINICAL_NOTE',
    title: 'Morning Multidisciplinary Rounds Note',
    description: 'Patient remains intubated. Plan: Continue lung-protective ventilation (6 mL/kg PBW), maintain sedation score RASS -2, attempt weaning if PaO2/FiO2 ratio improves > 200.',
    timestamp: '2026-09-17 08:30:00',
    author: 'Dr. Ananya Roy (Intensivist)',
    dataQuality: 'LIVE'
  }
];

export const MOCK_INFUSIONS: Infusion[] = [
  {
    id: 'inf-01',
    pumpId: 'dev-pump-07a',
    medication: 'Norepinephrine (4mg/250mL D5W)',
    rate: 0.08,
    unit: 'mcg/kg/min',
    volumeDelivered: 42.5,
    bagVolume: 250,
    status: 'RUNNING',
    quality: 'LIVE',
    lastUpdate: '12:41:30'
  },
  {
    id: 'inf-02',
    pumpId: 'dev-pump-07b',
    medication: 'Propofol 1% (10mg/mL)',
    rate: 25.0,
    unit: 'mcg/kg/min',
    volumeDelivered: 180.0,
    bagVolume: 500,
    status: 'RUNNING',
    quality: 'LIVE',
    lastUpdate: '12:41:28'
  },
  {
    id: 'inf-03',
    pumpId: 'dev-pump-07c',
    medication: 'Fentanyl (1000mcg/100mL NS)',
    rate: 50.0,
    unit: 'mcg/h',
    volumeDelivered: 85.0,
    bagVolume: 100,
    status: 'RUNNING',
    quality: 'LIVE',
    lastUpdate: '12:41:26'
  }
];

export const MOCK_LABS: LabResult[] = [
  {
    id: 'lab-01',
    patientId: 'P-1024',
    testName: 'Arterial PaO2',
    value: 64,
    unit: 'mmHg',
    referenceRange: '80 - 100',
    flag: 'LOW',
    specimenTime: '11:15',
    resultTime: '11:30'
  },
  {
    id: 'lab-02',
    patientId: 'P-1024',
    testName: 'Arterial PaCO2',
    value: 48,
    unit: 'mmHg',
    referenceRange: '35 - 45',
    flag: 'HIGH',
    specimenTime: '11:15',
    resultTime: '11:30'
  },
  {
    id: 'lab-03',
    patientId: 'P-1024',
    testName: 'Arterial pH',
    value: 7.31,
    unit: '',
    referenceRange: '7.35 - 7.45',
    flag: 'LOW',
    specimenTime: '11:15',
    resultTime: '11:30'
  },
  {
    id: 'lab-04',
    patientId: 'P-1024',
    testName: 'Blood Lactate',
    value: 2.4,
    unit: 'mmol/L',
    referenceRange: '0.5 - 1.6',
    flag: 'HIGH',
    specimenTime: '11:15',
    resultTime: '11:30'
  },
  {
    id: 'lab-05',
    patientId: 'P-1024',
    testName: 'White Blood Cell (WBC)',
    value: 16.8,
    unit: '10^3/µL',
    referenceRange: '4.5 - 11.0',
    flag: 'HIGH',
    specimenTime: '06:30',
    resultTime: '07:45'
  },
  {
    id: 'lab-06',
    patientId: 'P-1024',
    testName: 'Serum Creatinine',
    value: 1.4,
    unit: 'mg/dL',
    referenceRange: '0.7 - 1.2',
    flag: 'HIGH',
    specimenTime: '06:30',
    resultTime: '07:45'
  }
];
