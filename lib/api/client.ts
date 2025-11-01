/**
 * @fileoverview API Client Configuration
 * @description Axios instance with interceptors for authentication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL } from '@/lib/constants/constant';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Important for cookie-based auth
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        // Cookies are automatically sent with withCredentials: true
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest?._retry) {
          if (originalRequest) {
            originalRequest._retry = true;
          }

          try {
            // Call refresh endpoint
            await this.instance.post('/v1/auth/refresh');

            // Retry original request
            return this.instance(originalRequest!);
          } catch (refreshError) {
            // Refresh failed, redirect to login or clear state
            if (typeof window !== 'undefined') {
              // Dispatch logout event
              window.dispatchEvent(new CustomEvent('auth:logout'));
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.instance;
  }

  public get<T = unknown>(url: string, config?: Record<string, unknown>) {
    return this.instance.get<T>(url, config);
  }

  public post<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>) {
    return this.instance.post<T>(url, data, config);
  }

  public put<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>) {
    return this.instance.put<T>(url, data, config);
  }

  public patch<T = unknown>(url: string, data?: unknown, config?: Record<string, unknown>) {
    return this.instance.patch<T>(url, data, config);
  }

  public delete<T = unknown>(url: string, config?: Record<string, unknown>) {
    return this.instance.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
