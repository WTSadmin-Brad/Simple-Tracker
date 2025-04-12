/**
 * Centralized API client with consistent error handling
 * Provides a unified interface for all API requests
 */

import { ErrorCodes } from '../errors/error-types';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
}

/**
 * Standardized API response type that follows our unified format
 */
export type StandardResponse<T = any> = SuccessResponse<T> | ErrorResponseType;

interface SuccessResponse<T> {
  success: true;
  message: string;
  timestamp: string;
  [key: string]: any; // For resource-specific data properties
}

interface ErrorResponseType {
  success: false;
  message: string;
  error: {
    code: string;
    status: number;
    details?: any;
  };
  timestamp: string;
}

/**
 * Make an API request with standardized error handling
 * 
 * @param endpoint API endpoint path
 * @param options Request options
 * @returns Promise with standardized API response
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<StandardResponse<T>> {
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

    // Parse response as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Our API now standardizes all responses, so we can just return the data
      return data;
    } else {
      // Handle non-JSON responses (e.g., file downloads)
      if (!response.ok) {
        return {
          success: false,
          message: `Request failed with status ${response.status}`,
          error: {
            code: ErrorCodes.NETWORK_SERVER_ERROR,
            status: response.status,
          },
          timestamp: new Date().toISOString()
        };
      }
      
      // For successful non-JSON responses (like file downloads), create a custom success response
      return {
        success: true,
        message: 'Resource retrieved successfully',
        rawData: await response.text(), // Store raw text data
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    // Handle network or other errors
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred',
      error: {
        code: ErrorCodes.NETWORK_OFFLINE,
        status: 0,
        details: error instanceof Error ? { name: error.name } : undefined
      },
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Make a multipart form data request (for file uploads)
 * 
 * @param endpoint API endpoint path
 * @param formData FormData object
 * @returns Promise with standardized API response
 */
export async function apiFormRequest<T>(
  endpoint: string,
  formData: FormData
): Promise<StandardResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    // Parse JSON response if available
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } 
    
    // If not a JSON response
    if (!response.ok) {
      return {
        success: false,
        message: `Request failed with status ${response.status}`,
        error: {
          code: ErrorCodes.NETWORK_SERVER_ERROR,
          status: response.status,
        },
        timestamp: new Date().toISOString()
      };
    }
    
    // For successful non-JSON responses
    return {
      success: true,
      message: 'File uploaded successfully',
      rawData: await response.text(),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Handle network or other errors
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred',
      error: {
        code: ErrorCodes.NETWORK_OFFLINE,
        status: 0,
        details: error instanceof Error ? { name: error.name } : undefined
      },
      timestamp: new Date().toISOString()
    };
  }
}
