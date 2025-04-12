/**
 * API request/response types
 */

import { Ticket } from './tickets';
import { Workday } from './workday';
import { UserData as User } from './auth';

// Missing type declarations for entities not yet defined in their own files
interface Jobsite {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Truck {
  id: string;
  number: string;
  nickname: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


/**
 * Represents the verified user context passed to authenticated API handlers.
 */
export interface AuthenticatedUser {
  uid: string;
  role: 'admin' | 'employee' | string; // Allow string for potential future roles
  // Add other verified claims if needed in the future
}

/**
 * Base response for all API endpoints
 */
export interface BaseResponse {
  success: boolean;
  message: string;
  timestamp: string;
}

/**
 * Error response structure
 */
export interface ErrorResponse extends BaseResponse {
  success: false;
  error: {
    code: string;      // Error code from ErrorCodes enum
    status: number;    // HTTP status code
    details?: any;     // Additional error context
  };
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;         // Current page number
  pageSize: number;     // Items per page
  totalItems: number;   // Total number of items
  totalPages: number;   // Total number of pages
}

/**
 * Tickets response
 */
export interface TicketsResponse extends BaseResponse {
  success: true;
  tickets: Ticket[];
  pagination?: PaginationMeta;
}

/**
 * Single ticket response
 */
export interface TicketResponse extends BaseResponse {
  success: true;
  ticket: Ticket;
}

/**
 * Workdays response
 */
export interface WorkdaysResponse extends BaseResponse {
  success: true;
  workdays: Workday[];
  pagination?: PaginationMeta;
}

/**
 * Single workday response
 */
export interface WorkdayResponse extends BaseResponse {
  success: true;
  workday: Workday;
}

/**
 * Users response
 */
export interface UsersResponse extends BaseResponse {
  success: true;
  users: User[];
  pagination?: PaginationMeta;
}

/**
 * Single user response
 */
export interface UserResponse extends BaseResponse {
  success: true;
  user: User;
}

/**
 * Jobsites response
 */
export interface JobsitesResponse extends BaseResponse {
  success: true;
  jobsites: Jobsite[];
  pagination?: PaginationMeta;
}

/**
 * Single jobsite response
 */
export interface JobsiteResponse extends BaseResponse {
  success: true;
  jobsite: Jobsite;
}

/**
 * Trucks response
 */
export interface TrucksResponse extends BaseResponse {
  success: true;
  trucks: Truck[];
  pagination?: PaginationMeta;
}

/**
 * Single truck response
 */
export interface TruckResponse extends BaseResponse {
  success: true;
  truck: Truck;
}

/**
 * Base wizard step response
 */
export interface WizardStepResponse extends BaseResponse {
  success: true;
  step: number;      // Current step number
}

/**
 * Wizard step 1 (Basic Info) response
 */
export interface WizardStep1Response extends WizardStepResponse {
  date: string;
  jobsiteId: string;
  truckId: string;
}

/**
 * Wizard step 2 (Categories) response
 */
export interface WizardStep2Response extends WizardStepResponse {
  categories: {
    hangers: number;
    leaner6To12: number;
    leaner13To24: number;
    leaner25To36: number;
    leaner37To48: number;
    leaner49Plus: number;
  };
  totalCount: number;
}

/**
 * Wizard step 3 (Images) response
 */
export interface WizardStep3Response extends WizardStepResponse {
  images: {
    id: string;
    url: string;
  }[];
  imageCount: number;
}

/**
 * Wizard completion response
 */
export interface WizardCompleteResponse extends BaseResponse {
  success: true;
  id: string;        // Created ticket ID
  submittedAt: string;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Filter parameters for admin data tables
 */
export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  [key: string]: any; // Additional filter parameters
}

/**
 * Export options for admin exports
 */
export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  columns?: string[];
  filters?: FilterParams;
  includeHeaders?: boolean;
}
