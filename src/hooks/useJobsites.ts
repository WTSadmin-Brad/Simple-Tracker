/**
 * Hook for managing jobsite reference data
 * 
 * Provides a comprehensive interface for jobsite operations
 * with proper error handling, loading states, and caching.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { errorHandler, ErrorCodes } from '@/lib/errors';
import { useToast } from '@/components/ui/use-toast';
import { STALE_TIMES, createQueryOptions } from '@/lib/query/queryUtils';

/**
 * Jobsite data structure
 */
export interface Jobsite {
  id: string;
  name: string;
  isActive: boolean;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  contactName?: string;
  contactPhone?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

/**
 * Jobsite filter options
 */
export interface JobsiteFilters {
  includeInactive?: boolean;
  searchQuery?: string;
}

/**
 * Query keys for jobsite queries
 */
export const jobsiteKeys = {
  all: ['jobsites'] as const,
  lists: () => [...jobsiteKeys.all, 'list'] as const,
  list: (filters: JobsiteFilters = {}) => [...jobsiteKeys.lists(), filters] as const,
  details: () => [...jobsiteKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobsiteKeys.details(), id] as const,
};

/**
 * Hook for managing jobsite reference data
 * 
 * @returns Jobsite operations and data
 */
export function useJobsites() {
  const { toast } = useToast();

  /**
   * Fetch jobsites from the API
   * 
   * @param filters Optional filters to apply
   * @returns Promise resolving to jobsites array
   */
  const fetchJobsitesFromApi = useCallback(async (filters?: JobsiteFilters): Promise<Jobsite[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters?.includeInactive) {
      queryParams.append('includeInactive', 'true');
    }
    
    if (filters?.searchQuery) {
      queryParams.append('search', filters.searchQuery);
    }
    
    const queryString = queryParams.toString();
    const url = `/api/jobsites${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to fetch jobsites',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
      
      return response.jobsites as Jobsite[];
    } catch (err) {
      // Log the error
      errorHandler.logError(err, { 
        operation: 'fetchJobsites',
        filters 
      });
      
      // If in development, return mock data
      if (process.env.NODE_ENV !== 'production') {
        return [
          { id: 'site-1', name: 'Downtown Project', isActive: true, city: 'Austin', state: 'TX' },
          { id: 'site-2', name: 'Highway Extension', isActive: true, city: 'Dallas', state: 'TX' },
          { id: 'site-3', name: 'North Bridge', isActive: true, city: 'San Antonio', state: 'TX' },
          { id: 'site-4', name: 'Old Factory Renovation', isActive: false, city: 'Houston', state: 'TX' }
        ];
      }
      
      throw err;
    }
  }, []);

  /**
   * Fetch a single jobsite by ID from the API
   * 
   * @param id Jobsite ID
   * @returns Promise resolving to jobsite or null if not found
   */
  const fetchJobsiteByIdFromApi = useCallback(async (id: string): Promise<Jobsite | null> => {
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch(`/api/jobsites/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!result.ok) {
          if (result.status === 404) {
            return { jobsite: null };
          }
          
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || `Failed to fetch jobsite with ID ${id}`,
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
      
      return response.jobsite as Jobsite | null;
    } catch (err) {
      // Log the error
      errorHandler.logError(err, { 
        operation: 'fetchJobsiteById',
        jobsiteId: id 
      });
      
      throw err;
    }
  }, []);

  /**
   * Query hook for fetching jobsites
   * 
   * @param filters Optional filters to apply
   * @returns Query result with jobsites data
   */
  const useJobsiteQuery = (filters?: JobsiteFilters) => {
    return useQuery({
      queryKey: jobsiteKeys.list(filters),
      queryFn: () => fetchJobsitesFromApi(filters),
      ...createQueryOptions<Jobsite[]>(STALE_TIMES.REFERENCE_DATA),
      onError: (err) => {
        const userMessage = errorHandler.getUserFriendlyMessage(err);
        toast({
          title: "Failed to load jobsites",
          description: userMessage,
          variant: "destructive",
        });
      }
    });
  };

  /**
   * Query hook for fetching a single jobsite by ID
   * 
   * @param id Jobsite ID
   * @returns Query result with jobsite data
   */
  const useJobsiteByIdQuery = (id: string) => {
    return useQuery({
      queryKey: jobsiteKeys.detail(id),
      queryFn: () => fetchJobsiteByIdFromApi(id),
      ...createQueryOptions<Jobsite | null>(STALE_TIMES.REFERENCE_DATA),
      onError: (err) => {
        const userMessage = errorHandler.getUserFriendlyMessage(err);
        toast({
          title: "Failed to load jobsite details",
          description: userMessage,
          variant: "destructive",
        });
      }
    });
  };

  /**
   * Filter jobsites based on provided filters
   * 
   * @param jobsites Array of jobsites to filter
   * @param filters Filters to apply
   * @returns Filtered jobsites array
   */
  const filterJobsites = (jobsites: Jobsite[], filters: JobsiteFilters): Jobsite[] => {
    let filtered = [...jobsites];
    
    // Filter by active status
    if (!filters.includeInactive) {
      filtered = filtered.filter(jobsite => jobsite.isActive);
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(jobsite => 
        jobsite.name.toLowerCase().includes(query) ||
        jobsite.city?.toLowerCase().includes(query) ||
        jobsite.state?.toLowerCase().includes(query) ||
        jobsite.address?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  /**
   * Search jobsites by name (client-side filtering)
   * 
   * @param jobsites Array of jobsites to search
   * @param query Search query
   * @returns Filtered jobsites array
   */
  const searchJobsites = (jobsites: Jobsite[], query: string): Jobsite[] => {
    if (!query) return jobsites;
    
    return filterJobsites(jobsites, { searchQuery: query });
  };

  return {
    // Query hooks
    useJobsiteQuery,
    useJobsiteByIdQuery,
    
    // Utility functions
    filterJobsites,
    searchJobsites,
    
    // Direct API functions (for imperative calls)
    fetchJobsites: fetchJobsitesFromApi,
    fetchJobsiteById: fetchJobsiteByIdFromApi,
    
    // Query keys for manual cache operations
    jobsiteKeys,
  };
}
