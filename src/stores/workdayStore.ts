/**
 * workdayStore.ts
 * Zustand store for managing workday state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Workday interface
interface Workday {
  id?: string;
  date: Date;
  truckId: string;
  jobsiteId: string;
  startTime: string;
  endTime: string | null;
  status: 'active' | 'completed' | 'pending';
  notes: string;
}

// Workday state interface
interface WorkdayState {
  // State
  currentWorkday: Workday | null;
  recentWorkdays: Workday[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  startWorkday: (workday: Omit<Workday, 'id' | 'status' | 'endTime'>) => Promise<void>;
  endWorkday: (notes: string) => Promise<void>;
  fetchRecentWorkdays: () => Promise<void>;
  clearError: () => void;
}

// Placeholder for the actual store implementation
export const useWorkdayStore = create<WorkdayState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWorkday: null,
      recentWorkdays: [],
      isLoading: false,
      error: null,
      
      // Actions - placeholders to be implemented
      startWorkday: async (workday) => {
        set({ isLoading: true, error: null });
        // Placeholder for actual implementation
        set({ 
          isLoading: false,
          currentWorkday: {
            ...workday,
            status: 'active',
            endTime: null
          }
        });
      },
      endWorkday: async (notes) => {
        set({ isLoading: true, error: null });
        // Placeholder for actual implementation
        const { currentWorkday } = get();
        if (currentWorkday) {
          set({
            isLoading: false,
            currentWorkday: {
              ...currentWorkday,
              status: 'completed',
              endTime: new Date().toISOString(),
              notes
            }
          });
        } else {
          set({
            isLoading: false,
            error: 'No active workday found'
          });
        }
      },
      fetchRecentWorkdays: async () => {
        set({ isLoading: true, error: null });
        // Placeholder for actual implementation
        set({ isLoading: false, recentWorkdays: [] });
      },
      clearError: () => set({ error: null })
    }),
    {
      name: 'workday-storage',
    }
  )
);
