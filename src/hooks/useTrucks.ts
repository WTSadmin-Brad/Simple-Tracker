/**
 * Hook for managing truck reference data
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Ticket Submission Wizard Flow" section
 */

import { useCallback, useState } from 'react';

/**
 * Truck data structure
 */
interface Truck {
  id: string;
  name: string;
  isActive: boolean;
}

/**
 * Hook for managing truck reference data
 * 
 * TODO: Implement actual truck data fetching with API integration
 */
export function useTrucks() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);

  /**
   * Fetch all active trucks
   */
  const fetchTrucks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Implement API call to fetch trucks
      // Return mock data for placeholder
      const mockTrucks: Truck[] = [
        { id: 'truck-1', name: 'Truck 101', isActive: true },
        { id: 'truck-2', name: 'Truck 102', isActive: true },
        { id: 'truck-3', name: 'Truck 103', isActive: true }
      ];
      
      setTrucks(mockTrucks);
      return mockTrucks;
    } catch (err) {
      setError('Failed to fetch trucks');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Search trucks by name
   */
  const searchTrucks = useCallback((query: string) => {
    if (!query) return trucks;
    
    const lowerQuery = query.toLowerCase();
    return trucks.filter(
      truck => truck.name.toLowerCase().includes(lowerQuery)
    );
  }, [trucks]);

  /**
   * Get a truck by ID
   */
  const getTruckById = useCallback((id: string) => {
    return trucks.find(truck => truck.id === id) || null;
  }, [trucks]);

  return {
    trucks,
    isLoading,
    error,
    fetchTrucks,
    searchTrucks,
    getTruckById
  };
}
