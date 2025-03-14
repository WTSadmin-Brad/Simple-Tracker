/**
 * Error message constants
 * 
 * @source directory-structure.md - "Shared Utilities" section
 */

/**
 * Authentication error messages
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid username or password',
  SESSION_EXPIRED: 'Your session has expired. Please log in again',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  TOKEN_EXPIRED: 'Authentication token has expired',
  MISSING_TOKEN: 'Authentication token is missing',
};

/**
 * Ticket wizard error messages
 */
export const WIZARD_ERRORS = {
  INVALID_STEP: 'Invalid wizard step',
  MISSING_DATA: 'Required data is missing',
  VALIDATION_FAILED: 'Validation failed for the current step',
  SESSION_EXPIRED: 'Your wizard session has expired',
  SUBMISSION_FAILED: 'Failed to submit ticket',
  IMAGE_UPLOAD_FAILED: 'Failed to upload image',
  IMAGE_DELETE_FAILED: 'Failed to delete image',
  MAX_IMAGES_EXCEEDED: 'Maximum number of images exceeded',
};

/**
 * Workday error messages
 */
export const WORKDAY_ERRORS = {
  CREATION_FAILED: 'Failed to create workday',
  UPDATE_FAILED: 'Failed to update workday',
  FETCH_FAILED: 'Failed to fetch workday data',
  INVALID_DATE: 'Invalid date selected',
  FUTURE_DATE_LIMIT: 'Cannot create workdays more than 5 days in the future',
  EDIT_WINDOW_EXPIRED: 'Edit window has expired for this workday',
};

/**
 * API error messages
 */
export const API_ERRORS = {
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request. Please check your input',
  TIMEOUT: 'Request timed out. Please try again',
};

/**
 * Form validation error messages
 */
export const VALIDATION_ERRORS = {
  REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be at most ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must be at most ${max}`,
  INVALID_DATE: 'Invalid date',
  INVALID_EMAIL: 'Invalid email address',
  PASSWORD_MISMATCH: 'Passwords do not match',
};
