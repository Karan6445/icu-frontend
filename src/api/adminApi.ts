import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

export const adminApi = {
  async getHospitals(mockData: any[]): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.HOSPITALS, mockData);
  },

  async getDistricts(mockData: any[]): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.DISTRICTS, mockData);
  },

  async getIcuBeds(mockData: any[]): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.ICU_BEDS, mockData);
  },

  async getAuditLogs(mockData: any[]): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.ADMIN.AUDIT_LOGS, mockData);
  },
};

export default adminApi;
