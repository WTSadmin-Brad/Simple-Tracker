/**
 * Hook for managing jobsite reference data
 * 
 * Provides a comprehensive interface for jobsite operations
 * with proper error handling, loading states, and caching.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { useCallback, useState, useEffect } from 'react';
import { errorHandler, ErrorCodes } from '@/lib/errors';
import { useToast } from '@/components/ui/use-toast';

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

// Cache expiry time in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Hook for managing jobsite reference data
 */
export function useJobsites() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobsites, setJobsites] = useState<Jobsite[]>([]);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const { toast } = useToast();

  /**
   * Fetch all jobsites with optional filters
   */
  const fetchJobsites = useCallback(async (filters?: JobsiteFilters, forceRefresh = false) => {
    // Return cached data if available and not expired
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_EXPIRY) {
      if (filters) {
        return filterJobsites(jobsites, filters);
      }
      return jobsites;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters?.includeInactive) {
        queryParams.append('includeInactive', 'true');
      }
      
      if (filters?.searchQuery) {
        queryParams.append('search', filters.searchQuery);
      }
      
      const queryString = queryParams.toString();
      const url = `/api/jobsites${queryString ? `?${queryString}` : ''}`;
      
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
      
      const fetchedJobsites = response.jobsites as Jobsite[];
      
      // Update state
      setJobsites(fetchedJobsites);
      setLastFetched(Date.now());
      
      // Return possibly filtered results
      if (filters?.searchQuery && !queryParams.has('search')) {
        // If we didn't use server-side search, filter locally
        return filterJobsites(fetchedJobsites, { searchQuery: filters.searchQuery });
      }
      
      return fetchedJobsites;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // Show toast notification for unexpected errors
      if (formattedError.status !== 404) {
        toast({
          title: "Failed to load jobsites",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'fetchJobsites',
        filters 
      });
      
      // If we have cached data, return it as a fallback
      if (jobsites.length > 0) {
        return filters ? filterJobsites(jobsites, filters) : jobsites;
      }
      
      // If no cached data, return mock data for development
      if (process.env.NODE_ENV !== 'production') {
        const mockJobsites: Jobsite[] = [
          { id: 'site-1', name: 'Downtown Project', isActive: true, city: 'Austin', state: 'TX' },
          { id: 'site-2', name: 'Highway Extension', isActive: true, city: 'Dallas', state: 'TX' },
          { id: 'site-3', name: 'North Bridge', isActive: true, city: 'San Antonio', state: 'TX' },
          { id: 'site-4', name: 'Old Factory Renovation', isActive: false, city: 'Houston', state: 'TX' }
        ];
        
        return filters ? filterJobsites(mockJobsites, filters) : mockJobsites;
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [jobsites, lastFetched, toast]);

  /**
   * Search jobsites by name (client-side filtering)
   */
  const searchJobsites = useCallback((query: string) => {
    if (!query) return jobsites;
    
    return filterJobsites(jobsites, { searchQuery: query });
  }, [jobsites]);

  /**
   * Get a jobsite by ID
   */
  const getJobsiteById = useCallback(async (id: string) => {
    // Check if we already have it in our local state
    const cachedJobsite = jobsites.find(jobsite => jobsite.id === id);
    
    // If we have it and it's not stale, return it
    if (cachedJobsite && lastFetched && Date.now() - lastFetched < CACHE_EXPIRY) {
      return cachedJobsite;
    }
    
    // Otherwise fetch it from the API
    setIsLoading(true);
    setError(null);
    
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
      });
      
      const fetchedJobsite = response.jobsite as Jobsite | null;
      
      // If we got a jobsite, update our cache with it
      if (fetchedJobsite) {
        // Update the specific jobsite in our local state
        setJobsites(prev => {
          const index = prev.findIndex(j => j.id === id);
          if (index >= 0) {
            // Replace the existing jobsite
            const newJobsites = [...prev];
            newJobsites[index] = fetchedJobsite;
            return newJobsites;
          } else {
            // Add the new jobsite
            return [...prev, fetchedJobsite];
          }
        });
      }
      
      return fetchedJobsite;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // Only show toast for unexpected errors, not for "not found"
      if (formattedError.status !== 404) {
        toast({
          title: "Failed to load jobsite details",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'getJobsiteById',
        jobsiteId: id 
      });
      
      // Return cached version if available, even if stale
      return cachedJobsite || null;
    } finally {
      setIsLoading(false);
    }
  }, [jobsites, lastFetched, toast]);

  /**
   * Initialize hook by fetching jobsites
   */
  useEffect(() => {
    // Only fetch if we haven't fetched before
    if (!lastFetched) {
      fetchJobsites();
    }
  }, [fetchJobsites, lastFetched]);

  return {
    jobsites,
    isLoading,
    error,
    fetchJobsites,
    searchJobsites,
    getJobsiteById,
    lastFetched,
  };
}

/**
 * Helper function to filter jobsites based on filters
 */
function filterJobsites(jobsites: Jobsite[], filters: JobsiteFilters): Jobsite[] {
  let filtered = [...jobsites];
  
  // Filter by active status
  if (!filters.includeInactive) {
    filtered = filtered.filter(jobsite => jobsite.isActive);
  }
  
  // Filter by search query
  if (filters.searchQuery) {
    const lowerQuery = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(jobsite => {
      // Search by name
      if (jobsite.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search by address
      if (jobsite.address && jobsite.address.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search by city
      if (jobsite.city && jobsite.city.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search by contact name
      if (jobsite.contactName && jobsite.contactName.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      return false;
    });
  }
  
  return filtered;
}
