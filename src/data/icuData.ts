export interface ICUOption {
  id: string;
  name: string; // e.g. "MICU-01 (Medical)"
  code: string;
  type: string;
  fullName: string;
  floor: string;
  totalBeds: number;
  description: string;
  headDoctor?: string;
  headNurse?: string;
}

export const ALL_ICUS_18: ICUOption[] = [
  {
    id: 'MICU-01',
    name: 'MICU-01 (Medical)',
    code: 'MICU-01',
    type: 'Medical',
    fullName: 'Medical Intensive Care Unit 01',
    floor: '3rd Floor - Wing A',
    totalBeds: 16,
    description: 'Acute sepsis, multi-organ dysfunction & severe respiratory distress',
    headDoctor: 'Dr. Vikram Sethi',
    headNurse: 'Sunita Rao'
  },
  {
    id: 'MICU-02',
    name: 'MICU-02 (Medical)',
    code: 'MICU-02',
    type: 'Medical',
    fullName: 'Medical Intensive Care Unit 02',
    floor: '3rd Floor - Wing B',
    totalBeds: 14,
    description: 'Metabolic crises, severe renal emergencies & toxicological ICU',
    headDoctor: 'Dr. Ananya Roy',
    headNurse: 'Aarti Gupta'
  },
  {
    id: 'SICU-01',
    name: 'SICU-01 (Surgical)',
    code: 'SICU-01',
    type: 'Surgical',
    fullName: 'Surgical Intensive Care Unit 01',
    floor: '4th Floor - Wing A',
    totalBeds: 16,
    description: 'High-risk post-operative, abdominal & trauma surgery recovery',
    headDoctor: 'Dr. Karthik Raman',
    headNurse: 'Rajesh Sharma'
  },
  {
    id: 'SICU-02',
    name: 'SICU-02 (Surgical)',
    code: 'SICU-02',
    type: 'Surgical',
    fullName: 'Surgical Intensive Care Unit 02',
    floor: '4th Floor - Wing B',
    totalBeds: 12,
    description: 'Vascular, orthopedic & general polytrauma postoperative unit',
    headDoctor: 'Dr. Meera Nambiar',
    headNurse: 'Bhavna Sen'
  },
  {
    id: 'CICU-01',
    name: 'CICU-01 (Cardiac)',
    code: 'CICU-01',
    type: 'Cardiac',
    fullName: 'Cardiac Intensive Care Unit 01',
    floor: '2nd Floor - Wing C',
    totalBeds: 14,
    description: 'Acute coronary syndrome, post-angioplasty & cardiogenic shock',
    headDoctor: 'Dr. Sunil Kulkarni',
    headNurse: 'Priya Nair'
  },
  {
    id: 'CICU-02',
    name: 'CICU-02 (Cardiothoracic)',
    code: 'CICU-02',
    type: 'Cardiothoracic',
    fullName: 'Cardiothoracic Surgical ICU 02 (CTVS)',
    floor: '2nd Floor - Wing D',
    totalBeds: 10,
    description: 'Post-CABG, valve replacement & thoracic aortic reconstructions',
    headDoctor: 'Dr. Sangeeta Mathur',
    headNurse: 'Devika Menon'
  },
  {
    id: 'NICU-01',
    name: 'NICU-01 (Neuro)',
    code: 'NICU-01',
    type: 'Neuro',
    fullName: 'Neuro Intensive Care Unit 01',
    floor: '5th Floor - Wing A',
    totalBeds: 12,
    description: 'Acute stroke, subarachnoid hemorrhage & traumatic brain injury',
    headDoctor: 'Dr. Suresh Nair',
    headNurse: 'Kavita Das'
  },
  {
    id: 'NICU-02',
    name: 'NICU-02 (Neuro)',
    code: 'NICU-02',
    type: 'Neuro',
    fullName: 'Neuro-Surgical ICU 02',
    floor: '5th Floor - Wing B',
    totalBeds: 10,
    description: 'Post-craniotomy, spinal trauma & continuous ICP monitoring',
    headDoctor: 'Dr. Rohan Banerjee',
    headNurse: 'Chitra Pillai'
  },
  {
    id: 'PICU-01',
    name: 'PICU-01 (Pediatric)',
    code: 'PICU-01',
    type: 'Pediatric',
    fullName: 'Pediatric Intensive Care Unit 01',
    floor: '1st Floor - Wing A',
    totalBeds: 12,
    description: 'Pediatric critical care, severe asthma, sepsis & post-surgical',
    headDoctor: 'Dr. Amitav Ghosh',
    headNurse: 'Ananya Das'
  },
  {
    id: 'PICU-02',
    name: 'PICU-02 (Pediatric)',
    code: 'PICU-02',
    type: 'Pediatric',
    fullName: 'Pediatric Cardiac & Surgical ICU 02',
    floor: '1st Floor - Wing B',
    totalBeds: 10,
    description: 'Congenital heart defect recovery & advanced pediatric telemetry',
    headDoctor: 'Dr. Sneha Paul',
    headNurse: 'Mitali Roy'
  },
  {
    id: 'NNICU-01',
    name: 'NNICU-01 (Neonatal)',
    code: 'NNICU-01',
    type: 'Neonatal',
    fullName: 'Neonatal Intensive Care Unit (Level III)',
    floor: '1st Floor - Mother & Child Pavilion',
    totalBeds: 16,
    description: 'Premature newborns, neonatal respiratory distress & phototherapy',
    headDoctor: 'Dr. Shalini Deshmukh',
    headNurse: 'Farida Khan'
  },
  {
    id: 'TICU-01',
    name: 'TICU-01 (Trauma)',
    code: 'TICU-01',
    type: 'Trauma',
    fullName: 'Trauma & Emergency Resuscitation ICU 01',
    floor: 'Ground Floor - Emergency Apex',
    totalBeds: 14,
    description: 'Mass casualty, severe polytrauma & high-velocity crash stabilization',
    headDoctor: 'Dr. Alok Verma',
    headNurse: 'Girish Chandra'
  },
  {
    id: 'RICU-01',
    name: 'RICU-01 (Respiratory)',
    code: 'RICU-01',
    type: 'Respiratory',
    fullName: 'Respiratory Intensive Care Unit 01',
    floor: '3rd Floor - Wing C',
    totalBeds: 12,
    description: 'Severe COPD, refractory hypoxemia & non-invasive/invasive ventilation',
    headDoctor: 'Dr. Deepa Iyer',
    headNurse: 'Manoj Tiwari'
  },
  {
    id: 'CCU-01',
    name: 'CCU-01 (Coronary)',
    code: 'CCU-01',
    type: 'Coronary',
    fullName: 'Coronary Care Unit 01',
    floor: '2nd Floor - Wing A',
    totalBeds: 10,
    description: 'Unstable angina, lethal arrhythmias & temporary pacemaker support',
    headDoctor: 'Dr. Rahul Mehta',
    headNurse: 'Bina Roy'
  },
  {
    id: 'BURNS-01',
    name: 'BURNS-01 (Burns)',
    code: 'BURNS-01',
    type: 'Burns',
    fullName: 'Burns Intensive Care Unit 01',
    floor: '6th Floor - Sterile Wing',
    totalBeds: 8,
    description: 'Thermal injuries, fluid resuscitation & ultra-sterile laminar air care',
    headDoctor: 'Dr. Sanjeev Kapoor',
    headNurse: 'Nandini Sen'
  },
  {
    id: 'TXICU-01',
    name: 'TXICU-01 (Transplant)',
    code: 'TXICU-01',
    type: 'Transplant',
    fullName: 'Organ Transplant Intensive Care Unit 01',
    floor: '4th Floor - Clean Zone',
    totalBeds: 8,
    description: 'Liver, renal & heart transplant immunosuppression & recovery',
    headDoctor: 'Dr. Tarun Saxena',
    headNurse: 'Meenakshi Iyer'
  },
  {
    id: 'OICU-01',
    name: 'OICU-01 (Oncology)',
    code: 'OICU-01',
    type: 'Oncology',
    fullName: 'Oncology Critical Care & Hematology ICU 01',
    floor: '6th Floor - Oncology Block',
    totalBeds: 10,
    description: 'Neutropenic sepsis, CAR-T cytokine storm & tumor lysis syndrome',
    headDoctor: 'Dr. Pradeep Narang',
    headNurse: 'Suman Lata'
  },
  {
    id: 'ECMO-01',
    name: 'ECMO-01 (Advanced)',
    code: 'ECMO-01',
    type: 'Advanced',
    fullName: 'Advanced ECMO & Life Support Unit 01',
    floor: '3rd Floor - Central Core',
    totalBeds: 8,
    description: 'Veno-arterial & veno-venous extracorporeal membrane oxygenation',
    headDoctor: 'Dr. Vikramaditya Sen',
    headNurse: 'Sunita Rao'
  }
];
