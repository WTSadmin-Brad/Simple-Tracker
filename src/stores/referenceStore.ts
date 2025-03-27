/**
 * referenceStore.ts
 * Zustand store for managing reference data (trucks, jobsites)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Reference data interfaces
interface Truck {
  id: string;
  name: string;
  number: string;
  isActive: boolean;
}

interface Jobsite {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

// Reference data state interface
interface ReferenceState {
  // State
  trucks: Truck[];
  jobsites: Jobsite[];
  isLoading: boolean;
  lastUpdated: Date | null;
  error: string | null;
  
  // Actions
  fetchReferenceData: () => Promise<void>;
  clearError: () => void;
}

// Action creators
const fetchReferenceDataAction = () => 
  async (set: any) => {
    set({ isLoading: true, error: null });
    
    try {
      // In a real implementation, this would call an API
      // For now using a simulated delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Sample data - in a real implementation, we would fetch from the backend
      const trucks: Truck[] = [
        { id: 'truck-1', name: 'Truck 1', number: 'T-001', isActive: true },
        { id: 'truck-2', name: 'Truck 2', number: 'T-002', isActive: true },
        { id: 'truck-3', name: 'Truck 3', number: 'T-003', isActive: false },
      ];
      
      const jobsites: Jobsite[] = [
        { id: 'site-1', name: 'Main Site', location: '123 Main St', isActive: true },
        { id: 'site-2', name: 'Downtown', location: '456 Center Ave', isActive: true },
        { id: 'site-3', name: 'North Location', location: '789 North Rd', isActive: false },
      ];
      
      set({ 
        isLoading: false,
        trucks,
        jobsites,
        lastUpdated: new Date(),
        error: null
      });
    } catch (error) {
      console.error('Error fetching reference data:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch reference data'
      });
    }
  };

export const useReferenceStore = create<ReferenceState>()(
  persist(
    (set, get) => ({
      // Initial state
      trucks: [],
      jobsites: [],
      isLoading: false,
      lastUpdated: null,
      error: null,
      
      // Actions
      fetchReferenceData: () => fetchReferenceDataAction()(set, get),
      clearError: () => set({ error: null })
    }),
    {
      name: 'reference-data-storage',
      storage: createJSONStorage(() => localStorage),
      // Add expiration logic to ensure fresh data
      partialize: (state) => ({
        trucks: state.trucks,
        jobsites: state.jobsites,
        lastUpdated: state.lastUpdated
      }),
      // Custom merge function to handle data expiration
      merge: (persistedState: any, currentState: ReferenceState) => {
        // Check if data is older than 24 hours
        const lastUpdated = persistedState.lastUpdated ? new Date(persistedState.lastUpdated) : null;
        const now = new Date();
        const isExpired = lastUpdated 
          ? (now.getTime() - lastUpdated.getTime()) > 24 * 60 * 60 * 1000 
          : true;
        
        // If data is expired, use current state (empty arrays)
        if (isExpired) {
          return {
            ...currentState,
            lastUpdated: null
          };
        }
        
        // Otherwise use the persisted data
        return {
          ...currentState,
          trucks: persistedState.trucks || [],
          jobsites: persistedState.jobsites || [],
          lastUpdated: lastUpdated
        };
      }
    }
  )
);

// Selector hooks for optimized component rendering
export const useTrucks = () => 
  useReferenceStore(state => state.trucks);

export const useJobsites = () => 
  useReferenceStore(state => state.jobsites);

export const useActiveTrucks = () => 
  useReferenceStore(state => state.trucks.filter(truck => truck.isActive));

export const useActiveJobsites = () => 
  useReferenceStore(state => state.jobsites.filter(jobsite => jobsite.isActive));

export const useReferenceStatus = () => ({
  isLoading: useReferenceStore(state => state.isLoading),
  error: useReferenceStore(state => state.error),
  lastUpdated: useReferenceStore(state => state.lastUpdated),
  fetchReferenceData: useReferenceStore(state => state.fetchReferenceData),
  clearError: useReferenceStore(state => state.clearError)
});
