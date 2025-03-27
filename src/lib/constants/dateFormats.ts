/**
 * dateFormats.ts
 * Centralized date format constants for consistent date formatting across the application
 */

export const DATE_FORMATS = {
  // API and data storage formats
  API_DATE: 'yyyy-MM-dd',
  MONTH_KEY: 'yyyy-MM',
  ISO_DATE: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  
  // Display formats
  DAY_NUMBER: 'd',
  WEEKDAY_SHORT: 'EEE',
  MONTH_YEAR: 'MMMM yyyy',
  FULL_DATE: 'MMMM d, yyyy',
  FULL_DATETIME: 'MMMM d, yyyy h:mm a',
  SHORT_DATE: 'MM/dd/yyyy',
  DAY_MONTH: 'MMM d',
  TIME: 'h:mm a',
  
  // Accessibility formats
  ARIA_DATE: 'MMMM d, yyyy',
  ARIA_TIME: 'h:mm a',
  ARIA_DATETIME: 'MMMM d, yyyy, h:mm a'
};
