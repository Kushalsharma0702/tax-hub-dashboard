/**
 * API Module Exports
 * 
 * Central export point for all API-related functionality.
 */

export { 
  API_CONFIG, 
  API_ENDPOINTS, 
  buildUrl, 
  buildUrlWithParams,
  getDefaultHeaders,
  DOCUMENT_SECTION_KEYS,
  type DocumentSectionKey,
} from './config';

export { 
  apiClient,
  type ApiResponse,
  type ApiError,
} from './client';
