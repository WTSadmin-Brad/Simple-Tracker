/**
 * Date manipulation helpers
 * 
 * @source directory-structure.md - "Shared Utilities" section
 */

/**
 * Format a date as YYYY-MM-DD
 * 
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format a date for display (MM/DD/YYYY)
 * 
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export function formatDateDisplay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format a date with day of week (Mon, 01/15/2025)
 * 
 * @param date - Date to format (Date object or ISO string)
 * @returns Formatted date string with day of week
 */
export function formatDateWithDay(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const formattedDate = formatDateDisplay(dateObj);
  return `${dayOfWeek}, ${formattedDate}`;
}

/**
 * Get the first day of a month
 * 
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Date object for the first day of the month
 */
export function getFirstDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/**
 * Get the last day of a month
 * 
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Date object for the last day of the month
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Get all days in a month as an array of Date objects
 * 
 * @param year - Year
 * @param month - Month (0-11)
 * @returns Array of Date objects for all days in the month
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);
  const days: Date[] = [];
  
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
}

/**
 * Check if a date is today
 * 
 * @param date - Date to check (Date object or ISO string)
 * @returns Whether the date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is in the past
 * 
 * @param date - Date to check (Date object or ISO string)
 * @returns Whether the date is in the past
 */
export function isPastDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dateObj < today;
}

/**
 * Check if a date is within the edit window (7 days)
 * 
 * @param date - Date to check (Date object or ISO string)
 * @param editWindowDays - Number of days in the edit window (default: 7)
 * @returns Whether the date is within the edit window
 */
export function isWithinEditWindow(
  date: Date | string,
  editWindowDays = 7
): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= editWindowDays;
}

/**
 * Calculate the expiration date for a wizard session
 * 
 * @param hours - Number of hours until expiration (default: 24)
 * @returns Expiration date
 */
export function calculateExpirationDate(hours = 24): Date {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + hours);
  return expirationDate;
}

/**
 * Check if a date has expired
 * 
 * @param expirationDate - Expiration date to check (Date object or ISO string)
 * @returns Whether the date has expired
 */
export function hasExpired(expirationDate: Date | string): boolean {
  const expDate = typeof expirationDate === 'string' 
    ? new Date(expirationDate) 
    : expirationDate;
  
  return new Date() > expDate;
}
