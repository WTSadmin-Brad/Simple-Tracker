/**
 * API endpoint constants
 * 
 * @source directory-structure.md - "Shared Utilities" section
 * @source directory-structure.md - "API Dynamic Routes Pattern" section
 */

/**
 * Base API URL
 */
export const API_BASE = '/api';

/**
 * Authentication endpoints
 */
export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE}/auth/login`,
  LOGOUT: `${API_BASE}/auth/logout`,
  REFRESH: `${API_BASE}/auth/refresh`,
  ME: `${API_BASE}/auth/me`,
};

/**
 * Ticket endpoints
 */
export const TICKET_ENDPOINTS = {
  BASE: `${API_BASE}/tickets`,
  DETAILS: (id: string) => `${API_BASE}/tickets/${id}`,
  
  // Wizard endpoints
  WIZARD: {
    BASE: `${API_BASE}/tickets/wizard`,
    STEP: (step: number) => `${API_BASE}/tickets/wizard/${step}`,
    COMPLETE: `${API_BASE}/tickets/wizard/complete`,
  },
  
  // Image endpoints
  IMAGES: {
    TEMP: `${API_BASE}/tickets/images/temp`,
    TEMP_DETAILS: (id: string) => `${API_BASE}/tickets/images/temp/${id}`,
  },
};

/**
 * Workday endpoints
 */
export const WORKDAY_ENDPOINTS = {
  BASE: `${API_BASE}/workdays`,
  DETAILS: (id: string) => `${API_BASE}/workdays/${id}`,
  BY_DATE: (date: string) => `${API_BASE}/workdays/date/${date}`,
  MONTH: (year: number, month: number) => 
    `${API_BASE}/workdays/month?year=${year}&month=${month}`,
};

/**
 * Reference data endpoints
 */
export const REFERENCE_ENDPOINTS = {
  BASE: `${API_BASE}/references`,
  
  // Dynamic type endpoint
  BY_TYPE: (type: 'jobsites' | 'trucks' | 'categories') => 
    `${API_BASE}/references/${type}`,
  
  // Specific endpoints
  JOBSITES: `${API_BASE}/references/jobsites`,
  JOBSITES_SEARCH: (query: string) => 
    `${API_BASE}/references/jobsites/search?q=${encodeURIComponent(query)}`,
  TRUCKS: `${API_BASE}/references/trucks`,
  TRUCKS_SEARCH: (query: string) => 
    `${API_BASE}/references/trucks/search?q=${encodeURIComponent(query)}`,
  CATEGORIES: `${API_BASE}/references/categories`,
};

/**
 * Admin endpoints
 */
export const ADMIN_ENDPOINTS = {
  BASE: `${API_BASE}/admin`,
  
  // Dynamic resource endpoint
  RESOURCE: (resource: 'users' | 'jobsites' | 'trucks') => 
    `${API_BASE}/admin/${resource}`,
  RESOURCE_DETAILS: (resource: 'users' | 'jobsites' | 'trucks', id: string) => 
    `${API_BASE}/admin/${resource}/${id}`,
  
  // Export endpoints
  EXPORT: {
    TICKETS: `${API_BASE}/admin/export/tickets`,
    WORKDAYS: `${API_BASE}/admin/export/workdays`,
  },
  
  // Archive endpoints
  ARCHIVE: {
    BASE: `${API_BASE}/admin/archive`,
    ACTION: (action: 'search' | 'images' | 'restore') => 
      `${API_BASE}/admin/archive/${action}`,
    SEARCH: (query: string) => 
      `${API_BASE}/admin/archive/search?q=${encodeURIComponent(query)}`,
    IMAGES: (id: string) => 
      `${API_BASE}/admin/archive/images/${id}`,
    RESTORE: (id: string) => 
      `${API_BASE}/admin/archive/restore/${id}`,
  },
};
