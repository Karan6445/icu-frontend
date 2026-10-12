import { apiClient, ApiResponse } from './axios.config';
import { API_ENDPOINTS } from './endpoints';

export const deviceApi = {
  async getDevices(mockData: any[]): Promise<ApiResponse<any[]>> {
    return apiClient.get(API_ENDPOINTS.DEVICES.BASE, mockData);
  },

  async getTelemetry(deviceId: string, mockData?: any): Promise<ApiResponse<any>> {
    return apiClient.get(API_ENDPOINTS.DEVICES.TELEMETRY(deviceId), mockData);
  },

  async updatePtzConfig(deviceId: string, config: any): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.put(API_ENDPOINTS.DEVICES.PTZ_CONFIG(deviceId), config, { success: true });
  },
};

export default deviceApi;
