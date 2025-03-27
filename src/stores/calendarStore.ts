/**
 * Calendar Store
 * Zustand store for managing calendar state and workday data
 * 
 * Handles:
 * - Current month/date selection
 * - Workday data fetching and caching
 * - Workday editing functionality
 * - Filter and view preferences
 * 
 * @source Employee_Flows.md - "Workday Management" section
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { format, isWithinInterval, addDays, isSameDay } from 'date-fns';
import { Workday, WorkdayType, WorkdayWithTickets } from '@/types/workday';
import workdayService from '@/lib/services/workdayService';
import { DATE_FORMATS } from '@/lib/constants/dateFormats';

/**
 * Calendar view modes
 */
export type CalendarViewMode = 'month' | 'week' | 'list';

/**
 * Filter options for the calendar
 */
export interface CalendarFilters {
  workTypes: WorkdayType[];
  hasTickets?: boolean;
  jobsite?: string;
}

/**
 * Calendar month data with cached workdays
 */
export interface CalendarMonthData {
  monthKey: string; // Format: 'YYYY-MM'
  workdays: WorkdayWithTickets[];
  lastFetched: string;
}

/**
 * Calendar store state interface
 */
export interface CalendarState {
  // Current view state
  currentDate: string; // ISO date string
  selectedDate: string | null; // ISO date string
  viewMode: CalendarViewMode;
  
  // Data cache
  monthsData: Record<string, CalendarMonthData>;
  
  // UI state
  isDetailSheetOpen: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: CalendarFilters;
  
  // Selected workday data (for detail view)
  selectedWorkday: WorkdayWithTickets | null;
  
  // Connection status
  isOnline: boolean;
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  setDetailSheetOpen: (isOpen: boolean) => void;
  setFilters: (filters: Partial<CalendarFilters>) => void;
  resetFilters: () => void;
  setIsOnline: (isOnline: boolean) => void;
  
  // Data fetching
  fetchMonthData: (date: Date) => Promise<void>;
  getWorkdayForDate: (date: Date) => WorkdayWithTickets | undefined;
  getWorkdaysInRange: (startDate: Date, endDate: Date) => WorkdayWithTickets[];
  
  // Workday management
  createWorkday: (workday: Omit<Workday, 'id' | 'editableUntil' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateWorkday: (id: string, workday: Partial<Omit<Workday, 'id' | 'editableUntil' | 'userId' | 'createdAt' | 'updatedAt'>>) => Promise<void>;
  
  // Utility functions
  clearCache: () => void;
  isDateEditable: (date: Date) => boolean;
}

/**
 * Helper function to get month key from date
 */
const getMonthKey = (date: Date): string => {
  return format(date, DATE_FORMATS.MONTH_KEY || 'yyyy-MM');
};

/**
 * Helper function to check if a date is within the editable window (7 days)
 */
const isDateWithinEditWindow = (date: Date): boolean => {
  const today = new Date();
  const sevenDaysAgo = addDays(today, -7);
  
  return isWithinInterval(date, {
    start: sevenDaysAgo,
    end: today
  });
};

/**
 * Action creator for fetching month data
 */
const createFetchMonthDataAction = (date: Date) => async (set: any, get: any) => {
  const monthKey = getMonthKey(date);
  const { monthsData, isOnline } = get();
  
  // Check if we already have fresh data for this month
  if (monthsData[monthKey]) {
    const lastFetched = new Date(monthsData[monthKey].lastFetched);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    // If data is less than 1 hour old, don't refetch
    if (lastFetched > oneHourAgo) {
      return;
    }
  }
  
  // Start loading
  set({ isLoading: true, error: null });
  
  try {
    // Skip API call if offline and use cached data
    if (!isOnline) {
      set({ isLoading: false });
      return;
    }
    
    // Fetch workdays for the month
    const workdays = await workdayService.getWorkdaysForMonth(date);
    
    // Update the cache
    set({
      monthsData: {
        ...monthsData,
        [monthKey]: {
          monthKey,
          workdays,
          lastFetched: new Date().toISOString()
        }
      },
      isLoading: false
    });
  } catch (error) {
    console.error('Error fetching month data:', error);
    
    set({
      error: 'Failed to load workday data. Please try again.',
      isLoading: false
    });
  }
};

/**
 * Action creator for creating a new workday
 */
const createWorkdayAction = (workday: Omit<Workday, 'id' | 'editableUntil' | 'userId' | 'createdAt' | 'updatedAt'>) => 
  async (set: any, get: any) => {
    const { isOnline, monthsData } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      if (!isOnline) {
        throw new Error('Cannot create workday while offline');
      }
      
      // Create workday via API
      const newWorkday = await workdayService.createWorkday(workday);
      
      // Update local cache
      const date = new Date(newWorkday.date);
      const monthKey = getMonthKey(date);
      
      // If we have this month in cache, update it
      if (monthsData[monthKey]) {
        const updatedWorkdays = [...monthsData[monthKey].workdays];
        
        // Remove any existing workday for the same date
        const existingIndex = updatedWorkdays.findIndex(w => 
          isSameDay(new Date(w.date), date)
        );
        
        if (existingIndex >= 0) {
          updatedWorkdays.splice(existingIndex, 1);
        }
        
        // Add the new workday
        updatedWorkdays.push(newWorkday);
        
        // Update the store
        set({
          monthsData: {
            ...monthsData,
            [monthKey]: {
              ...monthsData[monthKey],
              workdays: updatedWorkdays,
              lastFetched: new Date().toISOString()
            }
          },
          isLoading: false
        });
      }
      
      // If the created workday is for the selected date, update selectedWorkday
      const { selectedDate } = get();
      if (selectedDate && isSameDay(new Date(selectedDate), date)) {
        set({ selectedWorkday: newWorkday });
      }
    } catch (error) {
      console.error('Error creating workday:', error);
      
      set({
        error: 'Failed to create workday. Please try again.',
        isLoading: false
      });
      
      throw error;
    }
  };

/**
 * Action creator for updating an existing workday
 */
const updateWorkdayAction = (id: string, workday: Partial<Omit<Workday, 'id' | 'editableUntil' | 'userId' | 'createdAt' | 'updatedAt'>>) => 
  async (set: any, get: any) => {
    const { isOnline, monthsData } = get();
    
    set({ isLoading: true, error: null });
    
    try {
      if (!isOnline) {
        throw new Error('Cannot update workday while offline');
      }
      
      // Update workday via API
      const updatedWorkday = await workdayService.updateWorkday(id, workday);
      
      // Update local cache
      const date = new Date(updatedWorkday.date);
      const monthKey = getMonthKey(date);
      
      // If we have this month in cache, update it
      if (monthsData[monthKey]) {
        const updatedWorkdays = [...monthsData[monthKey].workdays];
        
        // Find and replace the updated workday
        const existingIndex = updatedWorkdays.findIndex(w => w.id === id);
        
        if (existingIndex >= 0) {
          updatedWorkdays[existingIndex] = updatedWorkday;
        } else {
          // If not found (rare case), add it
          updatedWorkdays.push(updatedWorkday);
        }
        
        // Update the store
        set({
          monthsData: {
            ...monthsData,
            [monthKey]: {
              ...monthsData[monthKey],
              workdays: updatedWorkdays,
              lastFetched: new Date().toISOString()
            }
          },
          isLoading: false
        });
      }
      
      // If the updated workday is the selected workday, update it
      const { selectedWorkday } = get();
      if (selectedWorkday && selectedWorkday.id === id) {
        set({ selectedWorkday: updatedWorkday });
      }
    } catch (error) {
      console.error('Error updating workday:', error);
      
      set({
        error: 'Failed to update workday. Please try again.',
        isLoading: false
      });
      
      throw error;
    }
  };

/**
 * Calendar store implementation
 */
export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentDate: new Date().toISOString(),
      selectedDate: null,
      viewMode: 'month',
      monthsData: {},
      isDetailSheetOpen: false,
      isLoading: false,
      error: null,
      filters: {
        workTypes: ['full', 'half', 'off'],
        hasTickets: false,
        jobsite: undefined
      },
      selectedWorkday: null,
      isOnline: true,
      
      // Actions for updating view state
      setCurrentDate: (date: Date) => {
        set({
          currentDate: date.toISOString()
        });
        
        // Fetch data for the new month if needed
        get().fetchMonthData(date);
      },
      
      setSelectedDate: (date: Date | null) => {
        const selectedDate = date ? date.toISOString() : null;
        const selectedWorkday = date ? get().getWorkdayForDate(date) : null;
        
        set({
          selectedDate,
          selectedWorkday,
          isDetailSheetOpen: !!date
        });
      },
      
      setViewMode: (mode: CalendarViewMode) => {
        set({ viewMode: mode });
      },
      
      setDetailSheetOpen: (isOpen: boolean) => {
        set({ isDetailSheetOpen: isOpen });
        
        // Clear selected date/workday when closing the sheet
        if (!isOpen) {
          set({ selectedDate: null, selectedWorkday: null });
        }
      },
      
      setFilters: (filters: Partial<CalendarFilters>) => {
        set({ filters: { ...get().filters, ...filters } });
      },
      
      resetFilters: () => {
        set({
          filters: {
            workTypes: ['full', 'half', 'off'],
            hasTickets: false,
            jobsite: undefined
          }
        });
      },
      
      setIsOnline: (isOnline: boolean) => {
        set({ isOnline });
      },
      
      // Data fetching actions
      fetchMonthData: (date: Date) => createFetchMonthDataAction(date)(set, get),
      
      // Workday retrieval methods
      getWorkdayForDate: (date: Date) => {
        const monthKey = getMonthKey(date);
        const { monthsData } = get();
        
        // Check if we have data for this month
        if (!monthsData[monthKey]) {
          return undefined;
        }
        
        // Find workday for the specific date
        return monthsData[monthKey].workdays.find(workday => 
          isSameDay(new Date(workday.date), date)
        );
      },
      
      getWorkdaysInRange: (startDate: Date, endDate: Date) => {
        const { monthsData } = get();
        const result: WorkdayWithTickets[] = [];
        
        // Get all months that might contain dates in the range
        const startMonthKey = getMonthKey(startDate);
        const endMonthKey = getMonthKey(endDate);
        
        // If months are the same, just filter one month
        if (startMonthKey === endMonthKey) {
          if (monthsData[startMonthKey]) {
            return monthsData[startMonthKey].workdays.filter(workday => {
              const workdayDate = new Date(workday.date);
              return (
                workdayDate >= startDate && 
                workdayDate <= endDate
              );
            });
          }
          return [];
        }
        
        // Otherwise, collect from all relevant months
        Object.values(monthsData).forEach(monthData => {
          monthData.workdays.forEach(workday => {
            const workdayDate = new Date(workday.date);
            if (workdayDate >= startDate && workdayDate <= endDate) {
              result.push(workday);
            }
          });
        });
        
        return result;
      },
      
      // Workday management actions
      createWorkday: (workday) => createWorkdayAction(workday)(set, get),
      updateWorkday: (id, workday) => updateWorkdayAction(id, workday)(set, get),
      
      // Utility functions
      clearCache: () => {
        set({ monthsData: {} });
      },
      
      isDateEditable: (date: Date) => {
        return isDateWithinEditWindow(date);
      }
    }),
    {
      name: 'simple-tracker-calendar',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        currentDate: state.currentDate,
        viewMode: state.viewMode,
        filters: state.filters,
        monthsData: state.monthsData
      })
    }
  )
);

/**
 * Selector hook for calendar view state properties
 * Used by components that need access to the current date, selected date, 
 * or view mode, and related setter functions.
 */
export const useCalendarViewState = () => ({
  currentDate: useCalendarStore(state => state.currentDate),
  selectedDate: useCalendarStore(state => state.selectedDate),
  viewMode: useCalendarStore(state => state.viewMode),
  setCurrentDate: useCalendarStore(state => state.setCurrentDate),
  setSelectedDate: useCalendarStore(state => state.setSelectedDate),
  setViewMode: useCalendarStore(state => state.setViewMode),
  filters: useCalendarStore(state => state.filters)
});

/**
 * Selector hook for calendar filter properties
 * Used by filter components for accessing and updating filter settings.
 */
export const useCalendarFilters = () => ({
  filters: useCalendarStore(state => state.filters),
  setFilters: useCalendarStore(state => state.setFilters),
  resetFilters: useCalendarStore(state => state.resetFilters)
});

/**
 * Selector hook for day detail sheet properties
 * Used by the day detail sheet component to access the selected workday
 * and control the sheet's open state.
 */
export const useCalendarDetailSheet = () => ({
  isDetailSheetOpen: useCalendarStore(state => state.isDetailSheetOpen),
  selectedWorkday: useCalendarStore(state => state.selectedWorkday),
  selectedDate: useCalendarStore(state => state.selectedDate),
  setDetailSheetOpen: useCalendarStore(state => state.setDetailSheetOpen)
});

/**
 * Selector hook for workday management actions
 * Used by components that need to create, update, or check editability of workdays.
 */
export const useCalendarWorkdayActions = () => ({
  createWorkday: useCalendarStore(state => state.createWorkday),
  updateWorkday: useCalendarStore(state => state.updateWorkday),
  isDateEditable: useCalendarStore(state => state.isDateEditable),
  isLoading: useCalendarStore(state => state.isLoading),
  error: useCalendarStore(state => state.error)
});

/**
 * Selector hook for data fetching properties and actions
 * Used by components that need to fetch or access workday data.
 */
export const useCalendarDataFetching = () => ({
  isLoading: useCalendarStore(state => state.isLoading),
  error: useCalendarStore(state => state.error),
  fetchMonthData: useCalendarStore(state => state.fetchMonthData),
  getWorkdayForDate: useCalendarStore(state => state.getWorkdayForDate),
  getWorkdaysInRange: useCalendarStore(state => state.getWorkdaysInRange),
  clearCache: useCalendarStore(state => state.clearCache),
  // Include these for components that need them but don't want to use multiple hooks
  currentDate: useCalendarStore(state => state.currentDate),
  filters: useCalendarStore(state => state.filters),
  setSelectedDate: useCalendarStore(state => state.setSelectedDate)
});

export default useCalendarStore;