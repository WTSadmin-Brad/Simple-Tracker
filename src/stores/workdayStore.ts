/**
 * workdayStore.ts
 * Zustand store for managing workday state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  getWorkdays, 
  createWorkday, 
  updateWorkday, 
  getWorkdayById, 
  deleteWorkday 
} from '@/lib/api/workdayApi';

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

// Action creators
const startWorkdayAction = (workday: Omit<Workday, 'id' | 'status' | 'endTime'>) => 
  async (set: any) => {
    set({ isLoading: true, error: null });
    
    try {
      // Call the API to create a new workday
      const response = await createWorkday({
        ...workday,
        status: 'active',
        endTime: null
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to start workday');
      }
      
      // Use workday property (resource-specific) instead of generic data property
      const newWorkday = response.workday;
      
      set({ 
        isLoading: false,
        currentWorkday: newWorkday,
        error: null
      });
    } catch (error) {
      console.error('Error starting workday:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to start workday'
      });
    }
  };

const endWorkdayAction = (notes: string) => 
  async (set: any, get: any) => {
    const { currentWorkday } = get();
    
    if (!currentWorkday) {
      set({ error: 'No active workday found' });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // Call the API to update the workday
      const response = await updateWorkday(currentWorkday.id!, {
        ...currentWorkday,
        status: 'completed',
        endTime: new Date().toISOString(),
        notes: notes || currentWorkday.notes
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to end workday');
      }
      
      // Use workday property (resource-specific) instead of generic data property
      const completedWorkday = response.workday;
      
      set({ 
        isLoading: false,
        currentWorkday: completedWorkday,
        recentWorkdays: [completedWorkday, ...get().recentWorkdays].slice(0, 10),
        error: null
      });
    } catch (error) {
      console.error('Error ending workday:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to end workday'
      });
    }
  };

const fetchRecentWorkdaysAction = () => 
  async (set: any) => {
    set({ isLoading: true, error: null });
    
    try {
      // Call the API to get recent workdays
      const response = await getWorkdays({ 
        limit: 10, 
        sortField: 'date', 
        sortDirection: 'desc' 
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch recent workdays');
      }
      
      // Use workdays property (resource-specific) instead of generic data property
      const recentWorkdays = response.workdays || [];
      
      set({ 
        isLoading: false,
        recentWorkdays,
        error: null
      });
    } catch (error) {
      console.error('Error fetching recent workdays:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch recent workdays'
      });
    }
  };

export const useWorkdayStore = create<WorkdayState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentWorkday: null,
      recentWorkdays: [],
      isLoading: false,
      error: null,
      
      // Actions
      startWorkday: (workday) => startWorkdayAction(workday)(set, get),
      endWorkday: (notes) => endWorkdayAction(notes)(set, get),
      fetchRecentWorkdays: () => fetchRecentWorkdaysAction()(set, get),
      clearError: () => set({ error: null })
    }),
    {
      name: 'workday-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        currentWorkday: state.currentWorkday,
        recentWorkdays: state.recentWorkdays
      })
    }
  )
);

// Selector hooks for optimized component rendering
export const useCurrentWorkday = () => ({
  currentWorkday: useWorkdayStore(state => state.currentWorkday),
  startWorkday: useWorkdayStore(state => state.startWorkday),
  endWorkday: useWorkdayStore(state => state.endWorkday)
});

export const useRecentWorkdays = () => ({
  recentWorkdays: useWorkdayStore(state => state.recentWorkdays),
  fetchRecentWorkdays: useWorkdayStore(state => state.fetchRecentWorkdays)
});

export const useWorkdayStatus = () => ({
  isLoading: useWorkdayStore(state => state.isLoading),
  error: useWorkdayStore(state => state.error),
  clearError: useWorkdayStore(state => state.clearError)
});
