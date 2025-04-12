/**
 * Authentication API client functions
 */

import { apiRequest, StandardResponse } from './apiClient';
import { AuthResponse, LoginRequest, UserData } from '@/types/auth';
import { BaseResponse, ErrorResponse } from '@/types/api';
import { ErrorCodes } from '@/lib/errors/error-types';

/**
 * API endpoints for authentication operations
 */
const ENDPOINTS = {
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  REFRESH: '/api/auth/refresh',
  SESSION: '/api/auth/session',
};

/**
 * Login with username and password
 * 
 * @param credentials - Login credentials (username, password)
 * @returns Promise with standardized authentication response
 */
export async function login(
  credentials: LoginRequest
): Promise<StandardResponse<AuthResponse>> {
  return apiRequest<AuthResponse>(ENDPOINTS.LOGIN, {
    method: 'POST',
    body: credentials
  });
}

/**
 * Logout the current user
 * 
 * @returns Promise with standardized response
 */
export async function logout(): Promise<StandardResponse> {
  return apiRequest(ENDPOINTS.LOGOUT, {
    method: 'POST'
  });
}

/**
 * Get the current authenticated user
 * 
 * @returns Promise with standardized response containing current user data
 */
export async function getCurrentUser(): Promise<StandardResponse<UserData>> {
  return apiRequest<UserData>(ENDPOINTS.ME);
}

/**
 * Refresh the authentication token
 * 
 * @returns Promise with standardized response containing new authentication data
 */
export async function refreshToken(): Promise<StandardResponse<AuthResponse>> {
  return apiRequest<AuthResponse>(ENDPOINTS.REFRESH, {
    method: 'POST'
  });
}

/**
 * Check if the user has an active session
 * 
 * @returns Promise with standardized response containing session status
 */
export async function checkSession(): Promise<StandardResponse<{ active: boolean, user?: UserData }>> {
  return apiRequest<{ active: boolean, user?: UserData }>(ENDPOINTS.SESSION);
}
