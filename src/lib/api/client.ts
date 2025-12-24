/**
 * API Client
 * 
 * Centralized HTTP client for all API requests.
 * Uses the API configuration to ensure consistent request handling.
 */

import { API_CONFIG, buildUrl, getDefaultHeaders } from './config';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

class ApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw {
        message: errorData.message || `HTTP Error: ${response.status}`,
        code: errorData.code,
        status: response.status,
        details: errorData.details,
      } as ApiError;
    }

    const data = await response.json();
    return {
      data: data.data || data,
      success: true,
      message: data.message,
      meta: data.meta,
    };
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(this.authToken || undefined),
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'POST',
      headers: getDefaultHeaders(this.authToken || undefined),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'PUT',
      headers: getDefaultHeaders(this.authToken || undefined),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: getDefaultHeaders(this.authToken || undefined),
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getDefaultHeaders(this.authToken || undefined),
      ...options,
    });
    return this.handleResponse<T>(response);
  }

  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: HeadersInit = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

// Singleton instance
export const apiClient = new ApiClient();

export default apiClient;
