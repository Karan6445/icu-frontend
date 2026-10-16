export type AdmissionStatus = 'ACTIVE' | 'DISCHARGED' | 'TRANSFERRED' | 'EXPIRED' | 'PENDING';
export type AdmissionType = 'EMERGENCY' | 'ELECTIVE' | 'TRANSFER' | 'POST_OP' | 'STEP_DOWN';
export type AcuityLevel = 'CRITICAL' | 'SERIOUS' | 'STABLE' | 'STEP_DOWN';
export type DischargeDisposition =
  | 'HOME'
  | 'TRANSFERRED_TO_WARD'
  | 'TRANSFERRED_TO_HOSPITAL'
  | 'EXPIRED'
  | 'AMA'
  | 'HOSPICE'
  | 'REHAB';

export type CareTeamRole =
  | 'PRIMARY_INTENSIVIST'
  | 'ATTENDING_PHYSICIAN'
  | 'CHARGE_NURSE'
  | 'PRIMARY_NURSE'
  | 'PULMONOLOGIST'
  | 'CARDIOLOGIST'
  | 'NEUROLOGIST'
  | 'RESPIRATORY_THERAPIST'
  | 'CLINICAL_PHARMACIST'
  | 'DIETITIAN'
  | 'PHYSIOTHERAPIST';

export interface CareTeamMember {
  id: string;
  admission_id: string;
  user_id: string;
  name: string;
  clinician_name?: string;
  role: CareTeamRole | string;
  specialty?: string;
  phone?: string;
  contact_number?: string;
  email?: string;
  is_primary: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'OFF_DUTY';
  assigned_at: string;
  notes?: string;
}

export interface ICUAdmission {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_mrn?: string;
  age?: number;
  gender?: string;
  hospital_id: string;
  hospital_name?: string;
  icu_id: string;
  icu_name?: string;
  bed_id: string;
  bed_number: string;
  admitting_doctor_id?: string;
  admitting_doctor_name?: string;
  primary_nurse_id?: string;
  primary_nurse_name?: string;
  admitting_diagnosis: string;
  admission_type: AdmissionType | string;
  acuity_level: AcuityLevel | string;
  admission_notes?: string;
  status: AdmissionStatus;
  admitted_at: string;
  discharged_at?: string | null;
  discharge_disposition?: DischargeDisposition | string | null;
  discharge_summary?: string | null;
  follow_up_instructions?: string | null;
  care_team?: CareTeamMember[];
  care_team_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AdmitPatientPayload {
  patient_id: string;
  patient_name?: string;
  age?: number;
  gender?: string;
  bed_id: string;
  bed_number?: string;
  icu_id?: string;
  icu_name?: string;
  hospital_id?: string;
  admitting_diagnosis: string;
  admission_type?: AdmissionType | string;
  acuity_level?: AcuityLevel | string;
  admitting_doctor_id?: string;
  admitting_doctor_name?: string;
  primary_nurse_id?: string;
  primary_nurse_name?: string;
  admission_notes?: string;
  initial_vitals?: {
    hr?: number;
    spo2?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    temp?: number;
    rr?: number;
  };
}

export interface DischargePatientPayload {
  discharge_disposition: DischargeDisposition | string;
  discharge_summary: string;
  discharge_date?: string;
  follow_up_instructions?: string;
  release_bed?: boolean;
}

export interface AddCareTeamMemberPayload {
  user_id: string;
  name?: string;
  clinician_name?: string;
  role: CareTeamRole | string;
  specialty?: string;
  phone?: string;
  contact_number?: string;
  email?: string;
  is_primary?: boolean;
  notes?: string;
}

export interface AdmissionFilterParams {
  hospital_id?: string;
  icu_id?: string;
  status?: AdmissionStatus | 'ALL';
  acuity_level?: AcuityLevel | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}
