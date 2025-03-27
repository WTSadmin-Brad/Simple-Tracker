/**
 * Authentication type definitions
 * 
 * @source Employee_Flows.md - "Authentication Flow" section
 * @source Admin_Flows.md - "Authentication Flow" section
 */

/**
 * User roles within the application
 */
export type UserRole = 'employee' | 'admin';

/**
 * Authentication request payload
 * 
 * Note: The API uses 'username' field for consistency, but it represents an email address
 */
export interface LoginRequest {
  username: string; // This is actually an email
  password: string;
  rememberMe?: boolean;
}

/**
 * Authentication response data
 */
export interface AuthResponse {
  token: string;
  user: UserData;
  expiresAt: number;
}

/**
 * User data structure
 */
export interface UserData {
  id: string;
  username: string; // This is actually an email
  displayName: string;
  role: UserRole;
  lastLogin: string;
}

/**
 * JWT token payload structure
 */
export interface TokenPayload {
  sub: string; // User ID
  username: string;
  role: UserRole;
  iat: number; // Issued at timestamp
  exp: number; // Expiration timestamp
}

/**
 * Auth state for the auth store
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  token: string | null;
  expiresAt: number | null;
  error: string | null;
}
