// API Service Abstraction Layer (Delegates to centralized src/api/axios.config.ts)
import { apiClient, ApiResponse } from '../api/axios.config';

export type { ApiResponse };

export class ApiService {
  static async get<T>(endpoint: string, mockFallback: T): Promise<ApiResponse<T>> {
    return apiClient.get<T>(endpoint, mockFallback);
  }

  static async post<T>(endpoint: string, payload: any, mockFallback: T): Promise<ApiResponse<T>> {
    return apiClient.post<T>(endpoint, payload, mockFallback);
  }

  static async put<T>(endpoint: string, payload: any, mockFallback: T): Promise<ApiResponse<T>> {
    return apiClient.put<T>(endpoint, payload, mockFallback);
  }

  static async delete<T>(endpoint: string, mockFallback: T): Promise<ApiResponse<T>> {
    return apiClient.delete<T>(endpoint, mockFallback);
  }
}

export default apiClient;
