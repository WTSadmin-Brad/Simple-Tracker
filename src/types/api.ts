/**
 * API request/response types
 * 
 * @source directory-structure.md - "TypeScript Types" section
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination response metadata
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
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
