/**
 * Form validation helpers
 * 
 * @source directory-structure.md - "Shared Utilities" section
 */

/**
 * Validate email format
 * 
 * @param email - Email address to validate
 * @returns Whether the email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * 
 * @param password - Password to validate
 * @returns Validation result with success flag and error message if applicable
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      valid: false,
      error: 'Password must be at least 8 characters long',
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      valid: false,
      error: 'Password must contain at least one number',
    };
  }
  
  return { valid: true };
}

/**
 * Validate date format (YYYY-MM-DD)
 * 
 * @param date - Date string to validate
 * @returns Whether the date is valid
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  // Check if the date is valid
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Validate phone number format
 * 
 * @param phone - Phone number to validate
 * @returns Whether the phone number is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Check if the result has 10 digits (US phone number)
  return digitsOnly.length === 10;
}

/**
 * Format phone number for display (XXX-XXX-XXXX)
 * 
 * @param phone - Phone number to format
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Format as XXX-XXX-XXXX
  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  // Return original if not valid
  return phone;
}

/**
 * Validate counter value against min and max limits
 * 
 * @param value - Counter value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validation result with success flag and error message if applicable
 */
export function validateCounterValue(
  value: number,
  min = 0,
  max = 150
): {
  valid: boolean;
  error?: string;
} {
  if (value < min) {
    return {
      valid: false,
      error: `Value must be at least ${min}`,
    };
  }
  
  if (value > max) {
    return {
      valid: false,
      error: `Value must be at most ${max}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate required field
 * 
 * @param value - Field value to validate
 * @returns Validation result with success flag and error message if applicable
 */
export function validateRequired(value: any): {
  valid: boolean;
  error?: string;
} {
  if (value === undefined || value === null || value === '') {
    return {
      valid: false,
      error: 'This field is required',
    };
  }
  
  return { valid: true };
}
