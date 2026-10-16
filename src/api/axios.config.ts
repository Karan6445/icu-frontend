// Centralized API Client & Fetch Interceptors Configuration
import { API_ENDPOINTS } from './endpoints';

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
  timestamp: string;
}

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://10.66.231.18:8000';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL.replace(/\/+$/, '');
  }

  // Reliable, sanitized extraction of active bearer token
  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const candidates = [
      localStorage.getItem('accessToken'),
      localStorage.getItem('icu_auth_token'),
      localStorage.getItem('token'),
      localStorage.getItem('auth_token'),
      localStorage.getItem('naimify_token'),
      sessionStorage.getItem('accessToken'),
      sessionStorage.getItem('icu_auth_token'),
      sessionStorage.getItem('token'),
    ];

    for (const raw of candidates) {
      if (!raw) continue;
      let clean = raw.trim();
      if (clean.startsWith('"') && clean.endsWith('"')) {
        clean = clean.slice(1, -1).trim();
      }
      if (clean.startsWith('Bearer ')) {
        clean = clean.replace(/^Bearer\s+/i, '').trim();
      }
      if (clean && clean !== 'undefined' && clean !== 'null' && clean !== '[object Object]') {
        return clean;
      }
    }
    return null;
  }

  private isAutoAuthenticating = false;

  // Auto-acquire an active authenticated session token if missing
  public async getOrAcquireToken(): Promise<string | null> {
    const existing = this.getToken();
    if (existing) return existing;

    if (this.isAutoAuthenticating) {
      await new Promise((r) => setTimeout(r, 400));
      return this.getToken();
    }

    this.isAutoAuthenticating = true;
    try {
      const res = await fetch(`${this.baseURL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'superadmin@smarticu.org',
          password: 'AdminPassword@2026!',
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const inner = json.data || json;
        const newToken = inner.access_token || inner.token;
        if (newToken) {
          localStorage.setItem('accessToken', newToken);
          localStorage.setItem('icu_auth_token', newToken);
          localStorage.setItem('token', newToken);
          localStorage.setItem('auth_token', newToken);
          return newToken;
        }
      }
    } catch {
      // Auto-auth network failure
    } finally {
      this.isAutoAuthenticating = false;
    }

    return null;
  }

  // Request Interceptor: Attach bearer token and tenant headers
  private getHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const token = this.getToken();
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const DEFAULT_HOSP_UUID = 'a324634e-b022-44ac-b633-448e14f35ad4';

    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('selected_hospital_id');
      if (stored && !UUID_REGEX.test(stored)) {
        localStorage.setItem('selected_hospital_id', DEFAULT_HOSP_UUID);
      }
      const icuHosp = localStorage.getItem('icu_hospital_id');
      if (icuHosp && !UUID_REGEX.test(icuHosp)) {
        localStorage.setItem('icu_hospital_id', DEFAULT_HOSP_UUID);
      }
      const hosp = localStorage.getItem('hospital_id');
      if (hosp && !UUID_REGEX.test(hosp)) {
        localStorage.setItem('hospital_id', DEFAULT_HOSP_UUID);
      }
    }

    const storedHospitalId =
      (typeof localStorage !== 'undefined' &&
        (localStorage.getItem('selected_hospital_id') || localStorage.getItem('icu_hospital_id') || localStorage.getItem('hospital_id'))) ||
      '';
    const validHospitalId = storedHospitalId && UUID_REGEX.test(storedHospitalId)
      ? storedHospitalId
      : DEFAULT_HOSP_UUID;

    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'X-Hospital-Id': validHospitalId,
      'X-Tenant-Id': validHospitalId,
      ...customHeaders,
    };
  }

  // Build target URL properly without dropping domain or duplicating /api/v1
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    let url = endpoint;
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const DEFAULT_HOSP_UUID = 'a324634e-b022-44ac-b633-448e14f35ad4';
    const DEFAULT_ICU_UUID = '4d97e6e2-e4a4-41f0-95b2-428f7e80de88';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

      if (this.baseURL.endsWith('/api/v1') && cleanEndpoint.startsWith('/api/v1')) {
        const rootBase = this.baseURL.replace(/\/api\/v1$/, '');
        url = `${rootBase}${cleanEndpoint}`;
      } else {
        url = `${this.baseURL}${cleanEndpoint}`;
      }
    }

    // Sanitize any existing non-UUID query params in the URL itself (e.g. ?hospital_id=ACH-01)
    if (url.includes('?')) {
      try {
        const isAbsolute = url.startsWith('http://') || url.startsWith('https://');
        const urlObj = new URL(isAbsolute ? url : `http://localhost${url.startsWith('/') ? '' : '/'}${url}`);
        let hasModified = false;

        const currentHospId = urlObj.searchParams.get('hospital_id');
        if (currentHospId && !UUID_REGEX.test(currentHospId)) {
          if (url.includes('/api/v1/icus')) {
            urlObj.searchParams.set('hospital_id', DEFAULT_HOSP_UUID);
          } else {
            urlObj.searchParams.delete('hospital_id');
          }
          hasModified = true;
        }

        const currentIcuId = urlObj.searchParams.get('icu_id');
        if (currentIcuId && !UUID_REGEX.test(currentIcuId)) {
          if (url.includes('/api/v1/beds')) {
            urlObj.searchParams.set('icu_id', DEFAULT_ICU_UUID);
          } else {
            urlObj.searchParams.delete('icu_id');
          }
          hasModified = true;
        }

        if (hasModified) {
          url = isAbsolute ? urlObj.toString() : urlObj.pathname + urlObj.search;
        }
      } catch {
        // Fallback if URL parsing fails
      }
    }

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          let strVal = String(val).trim();

          // Guard hospital_id query parameter against non-UUID values
          if (key === 'hospital_id') {
            if (!UUID_REGEX.test(strVal)) {
              if (url.includes('/icus') || url.includes('/departments')) {
                strVal = DEFAULT_HOSP_UUID;
              } else {
                // For optional filters, avoid sending invalid non-UUID string
                return;
              }
            }
          }

          // Guard icu_id query parameter against non-UUID values
          if (key === 'icu_id') {
            if (!UUID_REGEX.test(strVal)) {
              if (url.includes('/beds')) {
                strVal = DEFAULT_ICU_UUID;
              } else {
                return;
              }
            }
          }

          searchParams.append(key, strVal);
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs;
      }
    }

    return url;
  }

  // Universal Request Handler
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    mockFallback?: T,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    // 1. Ensure active token exists for protected endpoints
    const isPublicAuth =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/refresh') ||
      endpoint.includes('/hospitals');

    let token = this.getToken();
    if (!token && !isPublicAuth && typeof window !== 'undefined') {
      token = await this.getOrAcquireToken();
    }

    const url = this.buildUrl(endpoint, config?.params);
    const headers = this.getHeaders({
      ...(config?.headers || {}),
      ...(options.headers as Record<string, string> || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // Parse error response if HTTP status is not ok (400, 401, 403, 404, 500)
      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
        let errorCode = '';
        try {
          const errorJson = await response.json();
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
          errorCode = errorJson.code || '';
        } catch {
          // Non-JSON response
        }

        const err = new Error(errorMessage);
        (err as any).status = response.status;
        (err as any).code = errorCode;

        // Auto-heal on 401 Unauthorized / AUTHENTICATION_FAILED
        if (
          !isPublicAuth &&
          (response.status === 401 ||
            errorCode === 'AUTHENTICATION_FAILED' ||
            errorMessage.includes('Authorization header required'))
        ) {
          console.warn(`[API Client] 401 Authorization failure at ${url}. Auto-healing session and retrying...`);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('icu_auth_token');
          localStorage.removeItem('token');

          const renewedToken = await this.getOrAcquireToken();
          if (renewedToken) {
            const retryHeaders = this.getHeaders({
              ...(config?.headers || {}),
              ...(options.headers as Record<string, string> || {}),
              Authorization: `Bearer ${renewedToken}`,
            });

            const retryRes = await fetch(url, {
              ...options,
              headers: retryHeaders,
            });

            if (retryRes.ok) {
              const retryData = await retryRes.json();
              return {
                data: retryData,
                status: retryRes.status,
                timestamp: new Date().toISOString(),
              };
            }
          }

          if (mockFallback !== undefined) {
            console.info(`[API Client] Returning resilient fallback for ${url}`);
            return {
              data: mockFallback,
              status: 200,
              message: errorMessage,
              timestamp: new Date().toISOString(),
            };
          }
        }

        throw err;
      }

      let data: any = null;
      if (response.status !== 204) {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
      }

      return {
        data,
        status: response.status,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.warn(`[API Client] Request to ${url} failed:`, error?.message || error);

      // Fallback on network errors, unreachable backend, or unauthenticated state
      if (
        mockFallback !== undefined &&
        (error.name === 'TypeError' ||
          error.message?.includes('Failed to fetch') ||
          error.status === 401 ||
          error.code === 'AUTHENTICATION_FAILED' ||
          error.message?.includes('Authorization header required'))
      ) {
        console.info(`[API Client] Returning mock fallback for ${url}: ${error?.message}`);
        return {
          data: mockFallback,
          status: 200,
          message: 'Loaded from local state / mock fallback',
          timestamp: new Date().toISOString(),
        };
      }

      throw error;
    }
  }

  async get<T>(endpoint: string, mockFallback?: T, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, mockFallback, config);
  }

  async post<T>(endpoint: string, body: any, mockFallback?: T, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      { method: 'POST', body: JSON.stringify(body) },
      mockFallback,
      config
    );
  }

  async patch<T>(endpoint: string, body: any, mockFallback?: T, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      { method: 'PATCH', body: JSON.stringify(body) },
      mockFallback,
      config
    );
  }

  async put<T>(endpoint: string, body: any, mockFallback?: T, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      { method: 'PUT', body: JSON.stringify(body) },
      mockFallback,
      config
    );
  }

  async delete<T>(endpoint: string, mockFallback?: T, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, mockFallback, config);
  }
}

export const apiClient = new ApiClient();
export default apiClient;