/**
 * referenceStore.ts
 * Zustand store for managing reference data (trucks, jobsites)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

// Placeholder for the actual store implementation
export const useReferenceStore = create<ReferenceState>()(
  persist(
    (set, get) => ({
      // Initial state
      trucks: [],
      jobsites: [],
      isLoading: false,
      lastUpdated: null,
      error: null,
      
      // Actions - placeholders to be implemented
      fetchReferenceData: async () => {
        set({ isLoading: true, error: null });
        try {
          // Placeholder for actual API call implementation
          // This would fetch trucks and jobsites from the API
          
          // Simulate successful fetch with sample data
          set({
            isLoading: false,
            trucks: [],
            jobsites: [],
            lastUpdated: new Date()
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to fetch reference data'
          });
        }
      },
      clearError: () => set({ error: null })
    }),
    {
      name: 'reference-data-storage',
      // Only persist for 24 hours to ensure fresh data
    }
  )
);
