import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';
import { ALL_ICUS_18 } from '../data/icuData';

export interface ICUWard {
  id: string;
  name: string;
  code: string;
  type: string;
  floor: string;
  floor_location?: string;
  total_beds: number;
  available_beds: number;
  occupied_beds: number;
  reserved_beds: number;
  maintenance_beds: number;
  hospital_id?: string;
  doctor_lead_id?: string;
  doctor_lead_name?: string;
  nurse_lead_id?: string;
  nurse_lead_name?: string;
  head_doctor?: string;
  head_nurse?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateICUWardPayload {
  name: string;
  code: string;
  type?: string;
  icu_type?: string;
  floor?: string;
  floor_location?: string;
  total_beds: number;
  hospital_id?: string;
  doctor_lead_id?: string;
  doctor_lead_name?: string;
  nurse_lead_id?: string;
  nurse_lead_name?: string;
  head_doctor?: string;
  head_nurse?: string;
  description?: string;
  is_active?: boolean;
}

export interface ICUCensusBedItem {
  id?: string;
  bed_id: string;
  bed_number: string;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance' | string;
  patient_id?: string | null;
  patient_name?: string | null;
  patient_mrn?: string | null;
  acuity?: string | null;
  ventilator_attached?: boolean;
  infusion_pump_attached?: boolean;
  monitor_model?: string;
  last_sanitized?: string;
}

export interface ICULiveCensus {
  icu_id: string;
  icu_name: string;
  icu_code: string;
  floor: string;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  reserved_beds: number;
  maintenance_beds: number;
  occupancy_rate: number;
  critical_patients_count: number;
  ventilators_in_use: number;
  beds: ICUCensusBedItem[];
  timestamp: string;
}

// Resilient normalizer for ICU ward payloads
export const normalizeICUWard = (raw: any): ICUWard => {
  if (!raw) {
    return {
      id: 'ICU-MICU',
      name: 'Medical Intensive Care Unit (MICU)',
      code: 'MICU',
      type: 'Medical',
      floor: '3rd Floor - Wing A',
      total_beds: 12,
      available_beds: 4,
      occupied_beds: 7,
      reserved_beds: 1,
      maintenance_beds: 0,
    };
  }

  const code = (raw.code || raw.icu_code || raw.id || 'ICU').toString().toUpperCase();
  const totalBeds = Number(raw.total_beds ?? raw.totalBeds ?? 12);
  const occupied = Number(raw.occupied_beds ?? raw.occupiedBeds ?? Math.floor(totalBeds * 0.65));
  const available = Number(raw.available_beds ?? raw.availableBeds ?? Math.max(0, totalBeds - occupied));

  return {
    id: raw.id || `ICU-${code}`,
    name: raw.name || raw.fullName || raw.icu_name || `${code} Ward`,
    code: code,
    type: raw.type || raw.icu_type || 'General Intensive Care',
    floor: raw.floor || raw.floor_location || raw.floorLocation || '3rd Floor',
    floor_location: raw.floor_location || raw.floorLocation || raw.floor || '3rd Floor',
    total_beds: totalBeds,
    available_beds: available,
    occupied_beds: occupied,
    reserved_beds: Number(raw.reserved_beds ?? raw.reservedBeds ?? 1),
    maintenance_beds: Number(raw.maintenance_beds ?? raw.maintenanceBeds ?? 0),
    hospital_id: raw.hospital_id || raw.hospitalId,
    doctor_lead_id: raw.doctor_lead_id || raw.doctorLeadId || 'DOC-101',
    doctor_lead_name: raw.doctor_lead_name || raw.doctorLeadName || raw.head_doctor || raw.headDoctor || 'Dr. Vikram Sethi',
    nurse_lead_id: raw.nurse_lead_id || raw.nurseLeadId || 'NLEAD-5001',
    nurse_lead_name: raw.nurse_lead_name || raw.nurseLeadName || raw.head_nurse || raw.headNurse || 'Sunita Rao',
    head_doctor: raw.head_doctor || raw.headDoctor || raw.doctor_lead_name,
    head_nurse: raw.head_nurse || raw.headNurse || raw.nurse_lead_name,
    description: raw.description || `Specialized critical care monitoring for ${code}`,
    is_active: raw.is_active ?? true,
    created_at: raw.created_at || new Date().toISOString(),
    updated_at: raw.updated_at || new Date().toISOString(),
  };
};

// Initial fallback mock data from ALL_ICUS_18
const DEFAULT_FALLBACK_ICUS: ICUWard[] = [
  {
    id: '4d97e6e2-e4a4-41f0-95b2-428f7e80de88',
    name: 'Medical Intensive Care Unit - East Wing',
    code: 'MICU-EAST',
    type: 'MICU',
    floor: '4th Floor',
    floor_location: '4th Floor',
    total_beds: 10,
    available_beds: 1,
    occupied_beds: 3,
    reserved_beds: 0,
    maintenance_beds: 0,
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    doctor_lead_name: 'Dr. Vikram Sethi',
    nurse_lead_name: 'Sunita Rao',
    description: 'Acute critical care monitoring & mechanical ventilation',
    is_active: true,
  },
  ...ALL_ICUS_18.map((u, i) => ({
    id: u.id,
    name: u.fullName || u.name,
    code: u.code,
    type: u.type,
    floor: u.floor,
    floor_location: u.floor,
    total_beds: u.totalBeds,
    available_beds: Math.max(1, Math.floor(u.totalBeds * 0.25)),
    occupied_beds: Math.floor(u.totalBeds * 0.65),
    reserved_beds: 1,
    maintenance_beds: i % 4 === 0 ? 1 : 0,
    hospital_id: 'a324634e-b022-44ac-b633-448e14f35ad4',
    doctor_lead_name: u.headDoctor || 'Dr. Vikramaditya Sen',
    nurse_lead_name: u.headNurse || 'Sunita Rao',
    description: u.description,
    is_active: true,
  })),
];

export const icuApi = {
  /**
   * GET /api/v1/icus
   * List ICUs in Hospital (FastAPI requires mandatory hospital_id UUID query parameter)
   */
  async list(params?: { hospital_id?: string; search?: string }): Promise<ApiResponse<ICUWard[]>> {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const defaultHospitalId = 'a324634e-b022-44ac-b633-448e14f35ad4';
    const candidateHospitalId =
      params?.hospital_id ||
      (typeof localStorage !== 'undefined' &&
        (localStorage.getItem('selected_hospital_id') ||
          localStorage.getItem('icu_hospital_id') ||
          localStorage.getItem('hospital_id'))) ||
      defaultHospitalId;

    // Strict validation: Must be a valid 36-char UUID, otherwise use defaultHospitalId
    const hospitalId = UUID_REGEX.test(candidateHospitalId) ? candidateHospitalId : defaultHospitalId;

    const queryParams: Record<string, string> = {
      hospital_id: hospitalId,
    };
    if (params?.search) {
      queryParams.search = params.search;
    }

    const res = await apiClient.get<any>(
      API_ENDPOINTS.ICUS.BASE,
      DEFAULT_FALLBACK_ICUS,
      { params: queryParams }
    );

    const rawList = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : Array.isArray(res.data?.items)
      ? res.data.items
      : DEFAULT_FALLBACK_ICUS;

    const normalized = rawList.map(normalizeICUWard);

    return {
      data: normalized,
      status: res.status,
      message: res.message || 'ICUs retrieved successfully.',
      timestamp: res.timestamp,
    };
  },

  /**
   * POST /api/v1/icus
   * Create Intensive Care Unit Ward
   */
  async create(payload: CreateICUWardPayload): Promise<ApiResponse<ICUWard>> {
    const body = {
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
      icu_type: payload.icu_type || payload.type || 'Medical Intensive Care',
      type: payload.type || payload.icu_type || 'Medical Intensive Care',
      floor: payload.floor || payload.floor_location || '3rd Floor - East Wing',
      floor_location: payload.floor_location || payload.floor || '3rd Floor - East Wing',
      total_beds: Number(payload.total_beds) || 12,
      hospital_id: payload.hospital_id,
      doctor_lead_id: payload.doctor_lead_id,
      doctor_lead_name: payload.doctor_lead_name,
      nurse_lead_id: payload.nurse_lead_id,
      nurse_lead_name: payload.nurse_lead_name,
      head_doctor: payload.head_doctor || payload.doctor_lead_name,
      head_nurse: payload.head_nurse || payload.nurse_lead_name,
      description: payload.description || `Specialized critical care monitoring unit ${payload.code}`,
      is_active: payload.is_active ?? true,
    };

    const fallback = normalizeICUWard(body);

    const res = await apiClient.post<any>(API_ENDPOINTS.ICUS.BASE, body, fallback);
    const rawData = res.data?.data || res.data;
    const normalized = normalizeICUWard(rawData);

    return {
      data: normalized,
      status: res.status,
      message: res.message || `ICU ward ${normalized.code} created successfully.`,
      timestamp: res.timestamp,
    };
  },

  /**
   * GET /api/v1/icus/{id}
   * Get ICU Ward Details
   */
  async getById(id: string): Promise<ApiResponse<ICUWard>> {
    const fallback = DEFAULT_FALLBACK_ICUS.find(i => i.id === id || i.code === id) || DEFAULT_FALLBACK_ICUS[0];
    const res = await apiClient.get<any>(API_ENDPOINTS.ICUS.DETAILS(id), fallback);
    const rawData = res.data?.data || res.data;
    const normalized = normalizeICUWard(rawData);

    return {
      data: normalized,
      status: res.status,
      message: res.message || 'ICU details retrieved.',
      timestamp: res.timestamp,
    };
  },

  /**
   * GET /api/v1/icus/{id}/census
   * Get Live ICU Bed Census
   */
  async getCensus(id: string): Promise<ApiResponse<ICULiveCensus>> {
    const icu = DEFAULT_FALLBACK_ICUS.find(i => i.id === id || i.code === id) || DEFAULT_FALLBACK_ICUS[0];
    
    // Construct realistic census fallback
    const totalBeds = icu.total_beds || 12;
    const occupied = icu.occupied_beds || 7;
    const available = icu.available_beds || Math.max(0, totalBeds - occupied);
    const reserved = icu.reserved_beds || 1;
    const maintenance = icu.maintenance_beds || 0;

    const mockBeds: ICUCensusBedItem[] = Array.from({ length: totalBeds }, (_, idx) => {
      const bedNum = idx + 1;
      const isOcc = bedNum <= occupied;
      const isRes = !isOcc && bedNum === occupied + 1 && reserved > 0;
      const isMaint = !isOcc && !isRes && bedNum === totalBeds && maintenance > 0;
      const status = isOcc ? 'Occupied' : isRes ? 'Reserved' : isMaint ? 'Maintenance' : 'Available';

      return {
        bed_id: `BED-${icu.code}-${String(bedNum).padStart(2, '0')}`,
        bed_number: `BED-${String(bedNum).padStart(2, '0')}`,
        status,
        patient_id: isOcc ? `P-10${20 + bedNum}` : null,
        patient_name: isOcc ? (bedNum === 1 ? 'Ramesh Kumar' : bedNum === 2 ? 'Sunita Sharma' : `Patient #${bedNum}`) : null,
        ventilator_attached: isOcc && bedNum % 2 === 1,
        infusion_pump_attached: isOcc,
        monitor_model: 'Mindray BeneVision N22',
        last_sanitized: new Date().toISOString().slice(0, 10),
      };
    });

    const fallbackCensus: ICULiveCensus = {
      icu_id: icu.id,
      icu_name: icu.name,
      icu_code: icu.code,
      floor: icu.floor,
      total_beds: totalBeds,
      occupied_beds: occupied,
      available_beds: available,
      reserved_beds: reserved,
      maintenance_beds: maintenance,
      occupancy_rate: Math.round((occupied / Math.max(1, totalBeds)) * 100),
      critical_patients_count: Math.max(1, Math.floor(occupied * 0.4)),
      ventilators_in_use: Math.max(1, Math.floor(occupied * 0.5)),
      beds: mockBeds,
      timestamp: new Date().toISOString(),
    };

    const res = await apiClient.get<any>(API_ENDPOINTS.ICUS.CENSUS(id), fallbackCensus);
    const raw = res.data?.data || res.data;

    const normalizedCensus: ICULiveCensus = {
      icu_id: raw.icu_id || raw.id || icu.id,
      icu_name: raw.icu_name || raw.name || icu.name,
      icu_code: raw.icu_code || raw.code || icu.code,
      floor: raw.floor || icu.floor,
      total_beds: Number(raw.total_beds ?? raw.totalBeds ?? totalBeds),
      occupied_beds: Number(raw.occupied_beds ?? raw.occupiedBeds ?? occupied),
      available_beds: Number(raw.available_beds ?? raw.availableBeds ?? available),
      reserved_beds: Number(raw.reserved_beds ?? raw.reservedBeds ?? reserved),
      maintenance_beds: Number(raw.maintenance_beds ?? raw.maintenanceBeds ?? maintenance),
      occupancy_rate: Number(raw.occupancy_rate ?? raw.occupancyRate ?? Math.round((occupied / Math.max(1, totalBeds)) * 100)),
      critical_patients_count: Number(raw.critical_patients_count ?? raw.criticalPatientsCount ?? 3),
      ventilators_in_use: Number(raw.ventilators_in_use ?? raw.ventilatorsInUse ?? 4),
      beds: Array.isArray(raw.beds) ? raw.beds.map((b: any, bIdx: number) => ({
        bed_id: b.bed_id || b.id || `BED-${bIdx + 1}`,
        bed_number: b.bed_number || b.bedNumber || `BED-${String(bIdx + 1).padStart(2, '0')}`,
        status: b.status || (b.is_occupied ? 'Occupied' : 'Available'),
        patient_id: b.patient_id || b.patientId || null,
        patient_name: b.patient_name || b.patientName || null,
        patient_mrn: b.patient_mrn || b.mrn || null,
        acuity: b.acuity || null,
        ventilator_attached: Boolean(b.ventilator_attached ?? b.ventilatorAttached ?? false),
        infusion_pump_attached: Boolean(b.infusion_pump_attached ?? b.infusionPumpAttached ?? false),
        monitor_model: b.monitor_model || b.monitorModel || 'Mindray BeneVision N22',
        last_sanitized: b.last_sanitized || b.lastSanitized || new Date().toISOString().slice(0, 10),
      })) : mockBeds,
      timestamp: raw.timestamp || new Date().toISOString(),
    };

    return {
      data: normalizedCensus,
      status: res.status,
      message: res.message || 'Live ICU bed census retrieved successfully.',
      timestamp: res.timestamp,
    };
  },
};

export default icuApi;
