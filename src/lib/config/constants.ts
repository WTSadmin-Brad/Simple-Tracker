/**
 * Application-wide constants
 * 
 * @source directory-structure.md - "Shared Utilities" section
 */

/**
 * API base URL
 */
export const API_BASE_URL = '/api';

/**
 * Authentication constants
 */
export const AUTH = {
  TOKEN_KEY: 'auth-token',
  REFRESH_INTERVAL: 1000 * 60 * 30, // 30 minutes
  SESSION_EXPIRY: 1000 * 60 * 60 * 24, // 24 hours
};

/**
 * Ticket wizard constants
 */
export const WIZARD = {
  STORAGE_KEY: 'ticket-wizard-state',
  EXPIRATION_HOURS: 24, // 24-hour expiration for abandoned sessions
  MAX_IMAGES: 10, // Maximum number of images per ticket
  STEPS: ['basic-info', 'categories', 'images', 'confirmation'],
};

/**
 * Ticket category constants
 */
export const TICKET_CATEGORIES = [
  'Hangers',
  'Leaners',
  'Downs',
  'Broken',
  'Damaged',
  'Other',
];

/**
 * Counter value ranges for color transitions
 * Red(0) → Yellow(1-84) → Green(85-124) → Gold(125-150)
 */
export const COUNTER_RANGES = {
  RED: { min: 0, max: 0 },
  YELLOW: { min: 1, max: 84 },
  GREEN: { min: 85, max: 124 },
  GOLD: { min: 125, max: 150 },
  MAX_VALUE: 150,
};

/**
 * Workday constants
 */
export const WORKDAY = {
  EDIT_WINDOW_DAYS: 7, // 7-day edit window
  MAX_FUTURE_DAYS: 5, // Can't create workdays more than 5 days in the future
};

/**
 * Animation constants
 */
export const ANIMATION = {
  REDUCED_MOTION_QUERY: '(prefers-reduced-motion: reduce)',
};

/**
 * Breakpoints for responsive design
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * Firebase collection names
 */
export const COLLECTIONS = {
  WORKDAYS: 'workdays',
  TICKETS: 'tickets',
  USERS: 'users',
  JOBSITES: 'jobsites',
  TRUCKS: 'trucks',
  WIZARD_STATES: 'wizard-states',
};
