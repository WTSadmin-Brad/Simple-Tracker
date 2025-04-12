/**
 * referenceStore.ts
 * Zustand store for managing reference data (trucks, jobsites)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getTrucks, getJobsites } from '@/lib/api/referenceApi';

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
      // Fetch truck data and jobsite data in parallel
      const [trucksResponse, jobsitesResponse] = await Promise.all([
        getTrucks(),
        getJobsites()
      ]);
      
      // Handle error responses
      if (!trucksResponse.success) {
        throw new Error(trucksResponse.message || 'Failed to fetch trucks');
      }
      
      if (!jobsitesResponse.success) {
        throw new Error(jobsitesResponse.message || 'Failed to fetch jobsites');
      }
      
      set({ 
        isLoading: false,
        // Use resource-specific properties (trucks, jobsites) instead of generic data property
        trucks: trucksResponse.trucks || [],
        jobsites: jobsitesResponse.jobsites || [],
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
