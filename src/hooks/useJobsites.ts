/**
 * Hook for managing jobsite reference data
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { useCallback, useState } from 'react';

/**
 * Jobsite data structure
 */
interface Jobsite {
  id: string;
  name: string;
  isActive: boolean;
}

/**
 * Hook for managing jobsite reference data
 * 
 * TODO: Implement actual jobsite data fetching with API integration
 */
export function useJobsites() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobsites, setJobsites] = useState<Jobsite[]>([]);

  /**
   * Fetch all active jobsites
   */
  const fetchJobsites = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement API call to fetch jobsites
      // Return mock data for placeholder
      const mockJobsites: Jobsite[] = [
        { id: 'site-1', name: 'Downtown Project', isActive: true },
        { id: 'site-2', name: 'Highway Extension', isActive: true },
        { id: 'site-3', name: 'North Bridge', isActive: true }
      ];
      
      setJobsites(mockJobsites);
      return mockJobsites;
    } catch (err) {
      setError('Failed to fetch jobsites');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search jobsites by name
   */
  const searchJobsites = useCallback((query: string) => {
    if (!query) return jobsites;
    
    const lowerQuery = query.toLowerCase();
    return jobsites.filter(
      jobsite => jobsite.name.toLowerCase().includes(lowerQuery)
    );
  }, [jobsites]);

  /**
   * Get a jobsite by ID
   */
  const getJobsiteById = useCallback((id: string) => {
    return jobsites.find(jobsite => jobsite.id === id) || null;
  }, [jobsites]);

  return {
    jobsites,
    isLoading,
    error,
    fetchJobsites,
    searchJobsites,
    getJobsiteById
  };
}
