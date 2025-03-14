/**
 * Route definitions and helpers
 * 
 * @source directory-structure.md - "Shared Utilities" section
 */

/**
 * Employee route definitions
 */
export const EMPLOYEE_ROUTES = {
  // Main routes
  HOME: '/employee',
  CALENDAR: '/employee/calendar',
  TICKETS: '/employee/tickets',
  PROFILE: '/employee/profile',
  
  // Ticket routes
  NEW_TICKET: '/employee/tickets/new',
  TICKET_DETAILS: (id: string) => `/employee/tickets/${id}`,
  
  // Calendar routes
  CALENDAR_MONTH: (year: number, month: number) => 
    `/employee/calendar?year=${year}&month=${month}`,
  WORKDAY_DETAILS: (date: string) => 
    `/employee/calendar/${date}`,
};

/**
 * Admin route definitions
 */
export const ADMIN_ROUTES = {
  // Main routes
  DASHBOARD: '/admin/dashboard',
  JOBSITES: '/admin/jobsites',
  TRUCKS: '/admin/trucks',
  USERS: '/admin/users',
  REPORTS: '/admin/reports',
  
  // Detail routes
  JOBSITE_DETAILS: (id: string) => `/admin/jobsites/${id}`,
  TRUCK_DETAILS: (id: string) => `/admin/trucks/${id}`,
  USER_DETAILS: (id: string) => `/admin/users/${id}`,
};

/**
 * Authentication route definitions
 */
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
};

/**
 * API route definitions
 */
export const API_ROUTES = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    ME: '/api/auth/me',
  },
  
  // Ticket endpoints
  TICKETS: {
    BASE: '/api/tickets',
    DETAILS: (id: string) => `/api/tickets/${id}`,
    WIZARD: {
      BASE: '/api/tickets/wizard',
      STEP: (step: number) => `/api/tickets/wizard/${step}`,
      COMPLETE: '/api/tickets/wizard/complete',
    },
    IMAGES: {
      TEMP: '/api/tickets/images/temp',
      TEMP_DELETE: (id: string) => `/api/tickets/images/temp/${id}`,
    },
  },
  
  // Workday endpoints
  WORKDAYS: {
    BASE: '/api/workdays',
    DETAILS: (id: string) => `/api/workdays/${id}`,
    BY_DATE: (date: string) => `/api/workdays/date/${date}`,
  },
  
  // Reference data endpoints
  REFERENCES: {
    JOBSITES: '/api/references/jobsites',
    JOBSITES_SEARCH: '/api/references/jobsites/search',
    TRUCKS: '/api/references/trucks',
    TRUCKS_SEARCH: '/api/references/trucks/search',
    CATEGORIES: '/api/references/categories',
  },
};

/**
 * Check if a route is an admin route
 * 
 * @param path - Route path to check
 * @returns Whether the route is an admin route
 */
export function isAdminRoute(path: string): boolean {
  return path.startsWith('/admin');
}

/**
 * Check if a route is an employee route
 * 
 * @param path - Route path to check
 * @returns Whether the route is an employee route
 */
export function isEmployeeRoute(path: string): boolean {
  return path.startsWith('/employee');
}

/**
 * Check if a route is an auth route
 * 
 * @param path - Route path to check
 * @returns Whether the route is an auth route
 */
export function isAuthRoute(path: string): boolean {
  return path.startsWith('/auth');
}

/**
 * Get the role required for a route
 * 
 * @param path - Route path to check
 * @returns Role required for the route ('admin', 'employee', or null for public routes)
 */
export function getRouteRole(path: string): 'admin' | 'employee' | null {
  if (isAdminRoute(path)) return 'admin';
  if (isEmployeeRoute(path)) return 'employee';
  return null;
}
