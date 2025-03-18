/**
 * Error Types
 * 
 * Standardized error types for consistent error handling across the application.
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  /** Error code for categorization and handling */
  code: string;
  /** HTTP status code (if applicable) */
  status?: number;
  /** Additional error details for debugging */
  details?: Record<string, any>;

  constructor(message: string, code: string, status?: number, details?: Record<string, any>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
    // This is necessary for proper instanceof checks with extended Error classes
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Authentication-related errors
 */
export class AuthError extends AppError {
  constructor(message: string, code = 'auth/unknown', status = 401, details?: Record<string, any>) {
    super(message, code, status, details);
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Authorization-related errors (permission issues)
 */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action', code = 'auth/forbidden', status = 403, details?: Record<string, any>) {
    super(message, code, status, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
 * Not found errors
 */
export class NotFoundError extends AppError {
  constructor(message: string, code = 'data/not-found', status = 404, details?: Record<string, any>) {
    super(message, code, status, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Validation errors (invalid input)
 */
export class ValidationError extends AppError {
  constructor(message: string, code = 'validation/invalid', status = 400, details?: Record<string, any>) {
    super(message, code, status, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Network-related errors
 */
export class NetworkError extends AppError {
  constructor(message = 'Network error occurred', code = 'network/error', status = 500, details?: Record<string, any>) {
    super(message, code, status, details);
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Timeout errors
 */
export class TimeoutError extends NetworkError {
  constructor(message = 'Request timed out', code = 'network/timeout', status = 408, details?: Record<string, any>) {
    super(message, code, status, details);
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Service-specific errors
 */
export class ServiceError extends AppError {
  /** The service that generated the error */
  service: string;

  constructor(message: string, service: string, code = 'service/error', status = 500, details?: Record<string, any>) {
    super(message, code, status, details);
    this.service = service;
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

/**
 * Application-specific error codes
 */
export const ErrorCodes = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'auth/invalid-credentials',
  AUTH_USER_NOT_FOUND: 'auth/user-not-found',
  AUTH_TOKEN_EXPIRED: 'auth/token-expired',
  AUTH_INVALID_TOKEN: 'auth/invalid-token',
  AUTH_EMAIL_IN_USE: 'auth/email-in-use',
  AUTH_WEAK_PASSWORD: 'auth/weak-password',
  AUTH_REQUIRES_RECENT_LOGIN: 'auth/requires-recent-login',
  AUTH_FORBIDDEN: 'auth/forbidden',
  
  // Validation errors
  VALIDATION_INVALID_INPUT: 'validation/invalid-input',
  VALIDATION_REQUIRED_FIELD: 'validation/required-field',
  VALIDATION_INVALID_FORMAT: 'validation/invalid-format',
  
  // Data errors
  DATA_NOT_FOUND: 'data/not-found',
  DATA_ALREADY_EXISTS: 'data/already-exists',
  DATA_INVALID: 'data/invalid',
  DATA_STALE: 'data/stale',
  
  // Network errors
  NETWORK_OFFLINE: 'network/offline',
  NETWORK_TIMEOUT: 'network/timeout',
  NETWORK_SERVER_ERROR: 'network/server-error',
  
  // Service errors
  SERVICE_UNAVAILABLE: 'service/unavailable',
  SERVICE_RATE_LIMITED: 'service/rate-limited',
  
  // File upload errors
  UPLOAD_TOO_LARGE: 'upload/too-large',
  UPLOAD_INVALID_TYPE: 'upload/invalid-type',
  UPLOAD_FAILED: 'upload/failed',
  
  // General errors
  UNKNOWN_ERROR: 'unknown/error',
};
