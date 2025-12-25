/**
 * API Client
 * 
 * Centralized HTTP client for all API requests.
 * Uses the API configuration to ensure consistent request handling.
 * Includes CORS support for cross-origin requests to the backend.
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

/**
 * Default fetch options for CORS support
 */
const getCorsOptions = (): RequestInit => ({
  mode: 'cors',
  credentials: 'include', // Include cookies for cross-origin requests
});

class ApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string | null): void {
    this.authToken = token;
    // Persist token for page refresh
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getAuthToken(): string | null {
    if (!this.authToken) {
      // Try to recover from localStorage
      this.authToken = localStorage.getItem('auth_token');
    }
    return this.authToken;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Handle network errors
    if (!response.ok) {
      let errorData: Record<string, unknown> = {};
      
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch {
        // Response wasn't JSON, use status text
      }

      const error: ApiError = {
        message: (errorData.message as string) || (errorData.error as string) || `HTTP Error: ${response.status} ${response.statusText}`,
        code: (errorData.code as string) || response.status.toString(),
        status: response.status,
        details: errorData.details as Record<string, unknown>,
      };

      // Handle specific status codes
      if (response.status === 401) {
        // Clear auth token on unauthorized
        this.setAuthToken(null);
        error.message = 'Session expired. Please log in again.';
      } else if (response.status === 403) {
        error.message = 'You do not have permission to perform this action.';
      } else if (response.status === 404) {
        error.message = (errorData.message as string) || 'Resource not found.';
      } else if (response.status >= 500) {
        error.message = 'Server error. Please try again later.';
      }

      throw error;
    }

    // Handle empty responses (e.g., 204 No Content)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        data: {} as T,
        success: true,
      };
    }

    const text = await response.text();
    if (!text) {
      return {
        data: {} as T,
        success: true,
      };
    }

    const data = JSON.parse(text);
    return {
      data: data.data !== undefined ? data.data : data,
      success: true,
      message: data.message,
      meta: data.meta,
    };
  }

  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    try {
      const response = await fetch(url, {
        ...getCorsOptions(),
        ...options,
        signal: controller.signal,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            message: 'Request timed out. Please check your connection and try again.',
            code: 'TIMEOUT',
            status: 408,
          } as ApiError;
        }
        
        // Network errors (CORS, offline, etc.)
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          throw {
            message: 'Unable to connect to server. Please check your internet connection or try again later.',
            code: 'NETWORK_ERROR',
            status: 0,
          } as ApiError;
        }
      }
      
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    return this.fetchWithTimeout<T>(url, {
      method: 'GET',
      ...options,
    });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    return this.fetchWithTimeout<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    return this.fetchWithTimeout<T>(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    return this.fetchWithTimeout<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    return this.fetchWithTimeout<T>(url, {
      method: 'DELETE',
      ...options,
    });
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

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - browser sets it with boundary
    return this.fetchWithTimeout<T>(url, {
      method: 'POST',
      headers,
      body: formData,
    });
  }

  /**
   * Health check to verify backend connectivity
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient();

export default apiClient;
