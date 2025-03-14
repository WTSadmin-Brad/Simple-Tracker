/**
 * Authentication API client functions
 * 
 * @source directory-structure.md - "API client functions" section
 * @source Employee_Flows.md - "Authentication Flow" section
 */

import { ApiResponse } from '../../types/api';
import { AuthResponse, LoginRequest, UserData } from '../../types/auth';

/**
 * Base URL for authentication API endpoints
 */
const AUTH_API_BASE = '/api/auth';

/**
 * Login with username and password
 * 
 * @param credentials - Login credentials (username, password)
 * @returns Promise with authentication response
 */
export async function login(
  credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(
      `${AUTH_API_BASE}/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      }
    );
    
    if (!response.ok) {
      throw new Error('Authentication failed');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}

/**
 * Logout the current user
 * 
 * @returns Promise with success status
 */
export async function logout(): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(
      `${AUTH_API_BASE}/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Logout failed');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed'
    };
  }
}

/**
 * Get the current authenticated user
 * 
 * @returns Promise with current user data
 */
export async function getCurrentUser(): Promise<ApiResponse<UserData>> {
  try {
    const response = await fetch(
      `${AUTH_API_BASE}/me`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get current user'
    };
  }
}

/**
 * Refresh the authentication token
 * 
 * @returns Promise with new authentication response
 */
export async function refreshToken(): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await fetch(
      `${AUTH_API_BASE}/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh token'
    };
  }
}
