/**
 * Centralized API client with consistent error handling
 * Provides a unified interface for all API requests
 */

import { ApiResponse } from '@/types/api';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
}

/**
 * Make an API request with standardized error handling
 * 
 * @param endpoint API endpoint path
 * @param options Request options
 * @returns Promise with typed API response
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    params,
    cache,
  } = options;

  // Build URL with query parameters
  const url = new URL(endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache,
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `Request failed with status ${response.status}`,
          status: response.status,
        };
      }
      
      return {
        success: true,
        data,
      };
    } else {
      // Handle non-JSON responses (e.g., file downloads)
      if (!response.ok) {
        return {
          success: false,
          error: `Request failed with status ${response.status}`,
          status: response.status,
        };
      }
      
      const data = await response.text();
      return {
        success: true,
        data: data as unknown as T,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      isNetworkError: true,
    };
  }
}

/**
 * Make a multipart form data request (for file uploads)
 * 
 * @param endpoint API endpoint path
 * @param formData FormData object
 * @returns Promise with typed API response
 */
export async function apiFormRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `Request failed with status ${response.status}`,
        status: response.status,
      };
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return {
        success: true,
        data,
      };
    } else {
      const data = await response.text();
      return {
        success: true,
        data: data as unknown as T,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      isNetworkError: true,
    };
  }
}
