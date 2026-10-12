import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';
import { Patient } from '../types/icu';

export const patientApi = {
  async getPatients(mockPatients: Patient[]): Promise<ApiResponse<Patient[]>> {
    return apiClient.get(API_ENDPOINTS.PATIENTS.BASE, mockPatients);
  },

  async getPatientById(id: string, mockPatient?: Patient): Promise<ApiResponse<Patient | undefined>> {
    return apiClient.get(API_ENDPOINTS.PATIENTS.DETAILS(id), mockPatient);
  },

  async updateVitals(patientId: string, vitalsData: any): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put(API_ENDPOINTS.PATIENTS.VITALS(patientId), vitalsData, { success: true });
  },
};

export default patientApi;
