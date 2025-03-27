/**
 * Hook for managing truck reference data
 * 
 * Provides a comprehensive interface for truck operations
 * with proper error handling, loading states, and caching.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Ticket Submission Wizard Flow" section
 */

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { errorHandler, ErrorCodes } from '@/lib/errors';
import { useToast } from '@/components/ui/use-toast';
import { STALE_TIMES, createQueryOptions } from '@/lib/query/queryUtils';

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

/**
 * Query keys for truck queries
 */
export const truckKeys = {
  all: ['trucks'] as const,
  lists: () => [...truckKeys.all, 'list'] as const,
  list: (filters: TruckFilters = {}) => [...truckKeys.lists(), filters] as const,
  details: () => [...truckKeys.all, 'detail'] as const,
  detail: (id: string) => [...truckKeys.details(), id] as const,
};

/**
 * Hook for managing truck reference data
 * 
 * @returns Truck operations and data
 */
export function useTrucks() {
  const { toast } = useToast();

  /**
   * Fetch trucks from the API
   * 
   * @param filters Optional filters to apply
   * @returns Promise resolving to trucks array
   */
  const fetchTrucksFromApi = useCallback(async (filters?: TruckFilters): Promise<Truck[]> => {
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
      
      return response.trucks as Truck[];
    } catch (err) {
      // Log the error
      errorHandler.logError(err, { 
        operation: 'fetchTrucks',
        filters 
      });
      
      // If in development, return mock data
      if (process.env.NODE_ENV !== 'production') {
        return [
          { id: 'truck-1', name: 'Truck 101', nickname: 'Big Red', isActive: true, make: 'Ford', model: 'F-150', year: 2022 },
          { id: 'truck-2', name: 'Truck 102', nickname: 'Blue Thunder', isActive: true, make: 'Chevrolet', model: 'Silverado', year: 2021 },
          { id: 'truck-3', name: 'Truck 103', nickname: 'Silver Streak', isActive: true, make: 'RAM', model: '1500', year: 2023 },
          { id: 'truck-4', name: 'Truck 104', nickname: 'Green Machine', isActive: false, make: 'GMC', model: 'Sierra', year: 2020 }
        ];
      }
      
      throw err;
    }
  }, []);

  /**
   * Fetch a single truck by ID from the API
   * 
   * @param id Truck ID
   * @returns Promise resolving to truck or null if not found
   */
  const fetchTruckByIdFromApi = useCallback(async (id: string): Promise<Truck | null> => {
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
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
      
      return response.truck as Truck | null;
    } catch (err) {
      // Log the error
      errorHandler.logError(err, { 
        operation: 'fetchTruckById',
        truckId: id 
      });
      
      throw err;
    }
  }, []);

  /**
   * Query hook for fetching trucks
   * 
   * @param filters Optional filters to apply
   * @returns Query result with trucks data
   */
  const useTruckQuery = (filters?: TruckFilters) => {
    return useQuery({
      queryKey: truckKeys.list(filters),
      queryFn: () => fetchTrucksFromApi(filters),
      ...createQueryOptions<Truck[]>(STALE_TIMES.REFERENCE_DATA),
      onError: (err) => {
        const userMessage = errorHandler.getUserFriendlyMessage(err);
        toast({
          title: "Failed to load trucks",
          description: userMessage,
          variant: "destructive",
        });
      }
    });
  };

  /**
   * Query hook for fetching a single truck by ID
   * 
   * @param id Truck ID
   * @returns Query result with truck data
   */
  const useTruckByIdQuery = (id: string) => {
    return useQuery({
      queryKey: truckKeys.detail(id),
      queryFn: () => fetchTruckByIdFromApi(id),
      ...createQueryOptions<Truck | null>(STALE_TIMES.REFERENCE_DATA),
      onError: (err) => {
        const userMessage = errorHandler.getUserFriendlyMessage(err);
        toast({
          title: "Failed to load truck details",
          description: userMessage,
          variant: "destructive",
        });
      }
    });
  };

  /**
   * Filter trucks based on provided filters
   * 
   * @param trucks Array of trucks to filter
   * @param filters Filters to apply
   * @returns Filtered trucks array
   */
  const filterTrucks = (trucks: Truck[], filters: TruckFilters): Truck[] => {
    let filtered = [...trucks];
    
    // Filter by active status
    if (!filters.includeInactive) {
      filtered = filtered.filter(truck => truck.isActive);
    }
    
    // Filter by assigned driver
    if (filters.assignedDriverOnly) {
      filtered = filtered.filter(truck => !!truck.assignedDriver);
    }
    
    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(truck => 
        truck.name.toLowerCase().includes(query) ||
        (truck.nickname && truck.nickname.toLowerCase().includes(query)) ||
        (truck.licensePlate && truck.licensePlate.toLowerCase().includes(query)) ||
        (truck.make && truck.make.toLowerCase().includes(query)) ||
        (truck.model && truck.model.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  };

  /**
   * Search trucks by name or nickname (client-side filtering)
   * 
   * @param trucks Array of trucks to search
   * @param query Search query
   * @returns Filtered trucks array
   */
  const searchTrucks = (trucks: Truck[], query: string): Truck[] => {
    if (!query) return trucks;
    
    return filterTrucks(trucks, { searchQuery: query });
  };

  return {
    // Query hooks
    useTruckQuery,
    useTruckByIdQuery,
    
    // Utility functions
    filterTrucks,
    searchTrucks,
    
    // Direct API functions (for imperative calls)
    fetchTrucks: fetchTrucksFromApi,
    fetchTruckById: fetchTruckByIdFromApi,
    
    // Query keys for manual cache operations
    truckKeys,
  };
}
