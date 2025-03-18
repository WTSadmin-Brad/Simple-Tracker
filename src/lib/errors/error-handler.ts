/**
 * Error Handler
 * 
 * Centralized error handling utilities for consistent error management
 * across the application.
 */

import { ErrorCodes, AppError, NetworkError, AuthError, ValidationError, NotFoundError, ServiceError } from './error-types';

/**
 * Formats an error into a standardized structure for client consumption
 */
export function formatError(error: unknown): {
  message: string;
  code: string;
  status?: number;
  details?: Record<string, any>;
} {
  // Already formatted AppError
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details,
    };
  }

  // Standard Error object
  if (error instanceof Error) {
    // Check for common Firebase error patterns
    if (error.message.includes('Firebase') || error.message.includes('auth/')) {
      return formatFirebaseError(error);
    }

    // Network errors
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return {
        message: 'Network error occurred. Please check your connection.',
        code: ErrorCodes.NETWORK_OFFLINE,
        status: 503,
      };
    }

    // Generic Error
    return {
      message: error.message || 'An unexpected error occurred',
      code: ErrorCodes.UNKNOWN_ERROR,
      status: 500,
    };
  }

  // Unknown error type
  return {
    message: String(error) || 'An unexpected error occurred',
    code: ErrorCodes.UNKNOWN_ERROR,
    status: 500,
  };
}

/**
 * Formats Firebase-specific errors into our standardized format
 */
function formatFirebaseError(error: Error): {
  message: string;
  code: string;
  status?: number;
} {
  const message = error.message;
  
  // Extract Firebase error code if present
  const codeMatch = message.match(/\(([^)]+)\)/);
  const firebaseCode = codeMatch ? codeMatch[1] : 'unknown';
  
  // Map Firebase error codes to our application error codes
  switch (firebaseCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return {
        message: 'Invalid email or password',
        code: ErrorCodes.AUTH_INVALID_CREDENTIALS,
        status: 401,
      };
    
    case 'auth/email-already-in-use':
      return {
        message: 'Email is already in use',
        code: ErrorCodes.AUTH_EMAIL_IN_USE,
        status: 400,
      };
    
    case 'auth/weak-password':
      return {
        message: 'Password is too weak',
        code: ErrorCodes.AUTH_WEAK_PASSWORD,
        status: 400,
      };
    
    case 'auth/requires-recent-login':
      return {
        message: 'This action requires re-authentication. Please log in again.',
        code: ErrorCodes.AUTH_REQUIRES_RECENT_LOGIN,
        status: 401,
      };
    
    case 'auth/id-token-expired':
    case 'auth/session-expired':
      return {
        message: 'Your session has expired. Please log in again.',
        code: ErrorCodes.AUTH_TOKEN_EXPIRED,
        status: 401,
      };
    
    case 'permission-denied':
    case 'auth/insufficient-permission':
      return {
        message: 'You do not have permission to perform this action',
        code: ErrorCodes.AUTH_FORBIDDEN,
        status: 403,
      };
    
    case 'not-found':
      return {
        message: 'The requested resource was not found',
        code: ErrorCodes.DATA_NOT_FOUND,
        status: 404,
      };
    
    case 'resource-exhausted':
      return {
        message: 'Service temporarily unavailable. Please try again later.',
        code: ErrorCodes.SERVICE_RATE_LIMITED,
        status: 429,
      };
    
    default:
      return {
        message: message || 'An authentication error occurred',
        code: firebaseCode.startsWith('auth/') ? firebaseCode : ErrorCodes.UNKNOWN_ERROR,
        status: 500,
      };
  }
}

/**
 * Creates an appropriate error instance based on the error type
 */
export function createError(
  message: string,
  code: string,
  status?: number,
  details?: Record<string, any>
): AppError {
  // Determine the type of error based on the code or status
  if (code.startsWith('auth/')) {
    if (code === ErrorCodes.AUTH_FORBIDDEN) {
      return new NotFoundError(message, code, status, details);
    }
    return new AuthError(message, code, status, details);
  }
  
  if (code.startsWith('validation/')) {
    return new ValidationError(message, code, status, details);
  }
  
  if (code.startsWith('data/not-found') || status === 404) {
    return new NotFoundError(message, code, status, details);
  }
  
  if (code.startsWith('network/')) {
    return new NetworkError(message, code, status, details);
  }
  
  if (code.startsWith('service/')) {
    return new ServiceError(message, code.split('/')[1], code, status, details);
  }
  
  // Default to AppError for other cases
  return new AppError(message, code, status, details);
}

/**
 * Logs an error with appropriate level and details
 */
export function logError(error: unknown, context: Record<string, any> = {}): void {
  const formattedError = formatError(error);
  
  // Add context to details
  const details = {
    ...formattedError.details,
    ...context,
  };
  
  // Determine log level based on error type/code
  const isServerError = formattedError.status ? formattedError.status >= 500 : true;
  
  if (isServerError) {
    console.error('ERROR:', {
      message: formattedError.message,
      code: formattedError.code,
      status: formattedError.status,
      details,
      stack: error instanceof Error ? error.stack : undefined,
    });
  } else {
    console.warn('WARNING:', {
      message: formattedError.message,
      code: formattedError.code,
      status: formattedError.status,
      details,
    });
  }
}

/**
 * Gets a user-friendly error message based on error code
 */
export function getUserFriendlyMessage(error: unknown): string {
  const formattedError = formatError(error);
  
  // Common user-friendly messages
  switch (formattedError.code) {
    case ErrorCodes.NETWORK_OFFLINE:
      return 'You appear to be offline. Please check your internet connection and try again.';
    
    case ErrorCodes.NETWORK_TIMEOUT:
      return 'The request timed out. Please try again.';
    
    case ErrorCodes.SERVICE_UNAVAILABLE:
    case ErrorCodes.NETWORK_SERVER_ERROR:
      return 'The service is temporarily unavailable. Please try again later.';
    
    case ErrorCodes.AUTH_TOKEN_EXPIRED:
      return 'Your session has expired. Please log in again.';
    
    case ErrorCodes.AUTH_INVALID_CREDENTIALS:
      return 'Invalid email or password. Please check your credentials and try again.';
    
    case ErrorCodes.DATA_NOT_FOUND:
      return 'The requested information could not be found.';
    
    case ErrorCodes.UPLOAD_TOO_LARGE:
      return 'The file is too large. Please upload a smaller file.';
    
    case ErrorCodes.UPLOAD_INVALID_TYPE:
      return 'The file type is not supported. Please upload a different file.';
    
    default:
      // Use the error message if it's user-friendly, otherwise use a generic message
      return isUserFriendlyMessage(formattedError.message)
        ? formattedError.message
        : 'An unexpected error occurred. Please try again later.';
  }
}

/**
 * Determines if an error message is user-friendly
 */
function isUserFriendlyMessage(message: string): boolean {
  // Error messages that are not user-friendly typically:
  // - Contain technical terms or stack traces
  // - Contain references to code or libraries
  // - Are very long
  
  // Check for technical indicators
  const technicalIndicators = [
    'Error:', 'Exception:', 'TypeError:', 'SyntaxError:',
    'undefined is not', 'null is not', 'NaN',
    'stack', 'trace', 'firebase', 'firestore',
    'promise', 'async', 'function',
    'unexpected token', 'unexpected identifier',
  ];
  
  if (technicalIndicators.some(indicator => message.toLowerCase().includes(indicator.toLowerCase()))) {
    return false;
  }
  
  // Check if message is too long to be user-friendly
  if (message.length > 150) {
    return false;
  }
  
  // Check if message contains a complete sentence (first letter capitalized, ends with punctuation)
  const hasSentenceStructure = /^[A-Z].*[.!?]$/.test(message);
  
  return hasSentenceStructure;
}

/**
 * Handle network failures with retry capabilities
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    retryMultiplier?: number;
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    onRetry?: (error: unknown, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryMultiplier = 1.5,
    shouldRetry = defaultShouldRetry,
    onRetry = (error, attempt) => console.warn(`Retrying (${attempt}/${maxRetries}) after error:`, error),
  } = options;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      attempt += 1;

      // If we've used all retries or shouldn't retry this error, throw
      if (attempt > maxRetries || !shouldRetry(error, attempt)) {
        throw error;
      }

      // Call onRetry callback
      onRetry(error, attempt);

      // Wait before retrying
      const delay = retryDelay * Math.pow(retryMultiplier, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should never reach here due to the throw in the loop, but TypeScript needs it
  throw lastError;
}

/**
 * Default function to determine if an error should be retried
 */
function defaultShouldRetry(error: unknown, attempt: number): boolean {
  const formattedError = formatError(error);
  
  // Network/connectivity issues should be retried
  if (
    formattedError.code === ErrorCodes.NETWORK_OFFLINE ||
    formattedError.code === ErrorCodes.NETWORK_TIMEOUT ||
    formattedError.code === ErrorCodes.SERVICE_UNAVAILABLE
  ) {
    return true;
  }
  
  // Server errors (5xx) should be retried
  if (formattedError.status && formattedError.status >= 500 && formattedError.status < 600) {
    return true;
  }
  
  // Rate limiting should be retried
  if (formattedError.code === ErrorCodes.SERVICE_RATE_LIMITED) {
    return true;
  }
  
  // Don't retry client errors (4xx) except for specific cases
  if (formattedError.status && formattedError.status >= 400 && formattedError.status < 500) {
    return formattedError.status === 429; // Only retry rate limit errors
  }
  
  return false;
}

/**
 * Return a set of utility functions for error handling
 */
export const errorHandler = {
  formatError,
  createError,
  logError,
  getUserFriendlyMessage,
  withRetry,
  ErrorCodes,
};

export default errorHandler;
