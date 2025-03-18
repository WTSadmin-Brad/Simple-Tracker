/**
 * Hook for managing truck reference data
 * 
 * Provides a comprehensive interface for truck operations
 * with proper error handling, loading states, and caching.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Ticket Submission Wizard Flow" section
 */

import { useCallback, useState, useEffect } from 'react';
import { errorHandler, ErrorCodes } from '@/lib/errors';
import { useToast } from '@/components/ui/use-toast';

/**
 * Truck data structure
 */
export interface Truck {
  id: string;
  name: string;
  nickname?: string;
  isActive: boolean;
  licensePlate?: string;
  vin?: string;
  make?: string;
  model?: string;
  year?: number;
  lastServiceDate?: string;
  nextServiceDate?: string;
  assignedDriver?: string;
}

/**
 * Truck filter options
 */
export interface TruckFilters {
  includeInactive?: boolean;
  searchQuery?: string;
  assignedDriverOnly?: boolean;
}

// Cache expiry time in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

/**
 * Hook for managing truck reference data
 */
export function useTrucks() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const { toast } = useToast();

  /**
   * Fetch all trucks with optional filters
   */
  const fetchTrucks = useCallback(async (filters?: TruckFilters, forceRefresh = false) => {
    // Return cached data if available and not expired
    if (!forceRefresh && lastFetched && Date.now() - lastFetched < CACHE_EXPIRY) {
      if (filters) {
        return filterTrucks(trucks, filters);
      }
      return trucks;
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
      
      if (filters?.assignedDriverOnly) {
        queryParams.append('assignedDriverOnly', 'true');
      }
      
      const queryString = queryParams.toString();
      const url = `/api/trucks${queryString ? `?${queryString}` : ''}`;
      
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
            errorData.message || 'Failed to fetch trucks',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
      
      const fetchedTrucks = response.trucks as Truck[];
      
      // Update state
      setTrucks(fetchedTrucks);
      setLastFetched(Date.now());
      
      // Return possibly filtered results
      if (filters?.searchQuery && !queryParams.has('search')) {
        // If we didn't use server-side search, filter locally
        return filterTrucks(fetchedTrucks, { searchQuery: filters.searchQuery });
      }
      
      return fetchedTrucks;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // Show toast notification for unexpected errors
      if (formattedError.status !== 404) {
        toast({
          title: "Failed to load trucks",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'fetchTrucks',
        filters 
      });
      
      // If we have cached data, return it as a fallback
      if (trucks.length > 0) {
        return filters ? filterTrucks(trucks, filters) : trucks;
      }
      
      // If no cached data, return mock data for development
      if (process.env.NODE_ENV !== 'production') {
        const mockTrucks: Truck[] = [
          { id: 'truck-1', name: 'Truck 101', nickname: 'Big Red', isActive: true, make: 'Ford', model: 'F-150', year: 2022 },
          { id: 'truck-2', name: 'Truck 102', nickname: 'Blue Thunder', isActive: true, make: 'Chevrolet', model: 'Silverado', year: 2021 },
          { id: 'truck-3', name: 'Truck 103', nickname: 'Silver Streak', isActive: true, make: 'RAM', model: '1500', year: 2023 },
          { id: 'truck-4', name: 'Truck 104', nickname: 'Green Machine', isActive: false, make: 'GMC', model: 'Sierra', year: 2020 }
        ];
        
        return filters ? filterTrucks(mockTrucks, filters) : mockTrucks;
      }
      
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [trucks, lastFetched, toast]);

  /**
   * Search trucks by name or nickname (client-side filtering)
   */
  const searchTrucks = useCallback((query: string) => {
    if (!query) return trucks;
    
    return filterTrucks(trucks, { searchQuery: query });
  }, [trucks]);

  /**
   * Get a truck by ID
   */
  const getTruckById = useCallback(async (id: string) => {
    // Check if we already have it in our local state
    const cachedTruck = trucks.find(truck => truck.id === id);
    
    // If we have it and it's not stale, return it
    if (cachedTruck && lastFetched && Date.now() - lastFetched < CACHE_EXPIRY) {
      return cachedTruck;
    }
    
    // Otherwise fetch it from the API
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch(`/api/trucks/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!result.ok) {
          if (result.status === 404) {
            return { truck: null };
          }
          
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || `Failed to fetch truck with ID ${id}`,
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      });
      
      const fetchedTruck = response.truck as Truck | null;
      
      // If we got a truck, update our cache with it
      if (fetchedTruck) {
        // Update the specific truck in our local state
        setTrucks(prev => {
          const index = prev.findIndex(t => t.id === id);
          if (index >= 0) {
            // Replace the existing truck
            const newTrucks = [...prev];
            newTrucks[index] = fetchedTruck;
            return newTrucks;
          } else {
            // Add the new truck
            return [...prev, fetchedTruck];
          }
        });
      }
      
      return fetchedTruck;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // Only show toast for unexpected errors, not for "not found"
      if (formattedError.status !== 404) {
        toast({
          title: "Failed to load truck details",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'getTruckById',
        truckId: id 
      });
      
      // Return cached version if available, even if stale
      return cachedTruck || null;
    } finally {
      setIsLoading(false);
    }
  }, [trucks, lastFetched, toast]);

  /**
   * Initialize hook by fetching trucks
   */
  useEffect(() => {
    // Only fetch if we haven't fetched before
    if (!lastFetched) {
      fetchTrucks();
    }
  }, [fetchTrucks, lastFetched]);

  return {
    trucks,
    isLoading,
    error,
    fetchTrucks,
    searchTrucks,
    getTruckById,
    lastFetched,
  };
}

/**
 * Helper function to filter trucks based on filters
 */
function filterTrucks(trucks: Truck[], filters: TruckFilters): Truck[] {
  let filtered = [...trucks];
  
  // Filter by active status
  if (!filters.includeInactive) {
    filtered = filtered.filter(truck => truck.isActive);
  }
  
  // Filter by assigned driver
  if (filters.assignedDriverOnly) {
    filtered = filtered.filter(truck => Boolean(truck.assignedDriver));
  }
  
  // Filter by search query
  if (filters.searchQuery) {
    const lowerQuery = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(truck => {
      // Search by name
      if (truck.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search by nickname
      if (truck.nickname && truck.nickname.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search by license plate
      if (truck.licensePlate && truck.licensePlate.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      // Search by make/model
      if (truck.make && truck.make.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      if (truck.model && truck.model.toLowerCase().includes(lowerQuery)) {
        return true;
      }
      
      return false;
    });
  }
  
  return filtered;
}
