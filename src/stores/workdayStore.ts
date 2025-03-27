/**
 * workdayStore.ts
 * Zustand store for managing workday state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import workdayService from '@/lib/services/workdayService';

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
      // In a real implementation, this would call an API
      // For now using a simulated delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newWorkday = {
        ...workday,
        status: 'active' as const,
        endTime: null
      };
      
      // In a real implementation, we would save to the backend
      // const savedWorkday = await workdayService.startWorkday(newWorkday);
      
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
      // In a real implementation, this would call an API
      // For now using a simulated delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const completedWorkday = {
        ...currentWorkday,
        status: 'completed' as const,
        endTime: new Date().toISOString(),
        notes: notes || currentWorkday.notes
      };
      
      // In a real implementation, we would save to the backend
      // const savedWorkday = await workdayService.endWorkday(currentWorkday.id, completedWorkday);
      
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
      // In a real implementation, this would call an API
      // For now using a simulated delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - in a real implementation, we would fetch from the backend
      // const recentWorkdays = await workdayService.getRecentWorkdays();
      const recentWorkdays: Workday[] = [];
      
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
