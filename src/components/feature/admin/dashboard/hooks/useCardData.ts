/**
 * useCardData.ts
 * Shared hook for dashboard card data fetching with loading, error handling, and refresh functionality
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for dashboard card data fetching
 * Handles loading states, error handling, and refresh intervals
 * 
 * @param fetchFn - Function that returns a Promise with the data
 * @param refreshInterval - Optional interval in seconds to refresh data (0 = no refresh)
 * @param dependencies - Optional array of dependencies that should trigger a refetch
 */
export function useCardData<T>(
  fetchFn: () => Promise<T>,
  refreshInterval: number = 0,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch data function
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, ...dependencies]);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchData, refreshInterval * 1000);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdated,
    refreshData: fetchData
  };
}
