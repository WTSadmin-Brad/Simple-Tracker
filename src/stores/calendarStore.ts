/**
 * Calendar Store
 * Zustand store for managing calendar state and workday data
 * 
 * Handles:
 * - Current month/date selection
 * - Workday data fetching and caching
 * - Workday editing functionality
 * - Filter and view preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { format, isWithinInterval, addDays, isSameDay } from 'date-fns';
import { Workday, WorkdayType, WorkdayWithTickets } from '@/types/workday';
import workdayService from '@/services/workdayService';

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
  return format(date, 'yyyy-MM');
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
      fetchMonthData: async (date: Date) => {
        const monthKey = getMonthKey(date);
        const { monthsData } = get();
        
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
          // Extract year and month from the date
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // JavaScript months are 0-indexed
          
          // Fetch workdays from the service
          const workdays = await workdayService.fetchWorkdaysForMonth(year, month);
          
          // Update the store with the fetched data
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
          
          // If we have a selected date, update the selected workday
          const { selectedDate } = get();
          if (selectedDate) {
            const selectedDateObj = new Date(selectedDate);
            const selectedMonthKey = getMonthKey(selectedDateObj);
            
            // Only update if the selected date is in the month we just fetched
            if (selectedMonthKey === monthKey) {
              const selectedWorkday = workdays.find(workday => 
                isSameDay(new Date(workday.date), selectedDateObj)
              );
              
              set({ selectedWorkday: selectedWorkday || null });
            }
          }
        } catch (error) {
          console.error('Error fetching month data:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to fetch calendar data' 
          });
        }
      },
      
      getWorkdayForDate: (date: Date) => {
        const { monthsData } = get();
        const monthKey = getMonthKey(date);
        
        // Check if we have data for this month
        if (!monthsData[monthKey]) {
          return undefined;
        }
        
        // Find the workday for this date
        return monthsData[monthKey].workdays.find(workday => 
          isSameDay(new Date(workday.date), date)
        );
      },
      
      getWorkdaysInRange: (startDate: Date, endDate: Date) => {
        const { monthsData } = get();
        const result: WorkdayWithTickets[] = [];
        
        // Get all month keys that might contain dates in the range
        const currentDate = new Date(startDate);
        const monthKeys: string[] = [];
        
        while (currentDate <= endDate) {
          const monthKey = getMonthKey(currentDate);
          if (!monthKeys.includes(monthKey)) {
            monthKeys.push(monthKey);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Collect workdays from all relevant months
        for (const monthKey of monthKeys) {
          if (monthsData[monthKey]) {
            const workdaysInRange = monthsData[monthKey].workdays.filter(workday => {
              const workdayDate = new Date(workday.date);
              return workdayDate >= startDate && workdayDate <= endDate;
            });
            
            result.push(...workdaysInRange);
          }
        }
        
        return result;
      },
      
      // Workday management actions
      createWorkday: async (workday) => {
        set({ isLoading: true, error: null });
        
        try {
          // Call the service to create the workday
          const newWorkday = await workdayService.createWorkday(workday);
          
          // Update the store with the new workday
          const { monthsData } = get();
          const monthKey = getMonthKey(new Date(newWorkday.date));
          
          // Check if we have data for this month
          if (monthsData[monthKey]) {
            // Add the new workday to the month data
            set({
              monthsData: {
                ...monthsData,
                [monthKey]: {
                  ...monthsData[monthKey],
                  workdays: [
                    ...monthsData[monthKey].workdays.filter(w => w.date !== newWorkday.date),
                    newWorkday
                  ]
                }
              },
              selectedWorkday: newWorkday,
              isLoading: false
            });
          } else {
            // If we don't have data for this month, fetch it
            await get().fetchMonthData(new Date(newWorkday.date));
            
            // Update the selected workday
            set({
              selectedWorkday: newWorkday,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error creating workday:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to create workday' 
          });
        }
      },
      
      updateWorkday: async (id, workday) => {
        set({ isLoading: true, error: null });
        
        try {
          // Get the current workday to update
          const { monthsData, selectedWorkday } = get();
          if (!selectedWorkday) {
            throw new Error('No workday selected for update');
          }
          
          // Call the service to update the workday
          const updatedWorkday = await workdayService.updateWorkday(id, workday);
          
          // Update the store with the updated workday
          const monthKey = getMonthKey(new Date(updatedWorkday.date));
          
          // Check if we have data for this month
          if (monthsData[monthKey]) {
            // Update the workday in the month data
            set({
              monthsData: {
                ...monthsData,
                [monthKey]: {
                  ...monthsData[monthKey],
                  workdays: monthsData[monthKey].workdays.map(w => 
                    w.id === id ? updatedWorkday : w
                  )
                }
              },
              selectedWorkday: updatedWorkday,
              isLoading: false
            });
          } else {
            // If we don't have data for this month, fetch it
            await get().fetchMonthData(new Date(updatedWorkday.date));
            
            // Update the selected workday
            set({
              selectedWorkday: updatedWorkday,
              isLoading: false
            });
          }
        } catch (error) {
          console.error('Error updating workday:', error);
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Failed to update workday' 
          });
        }
      },
      
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

export default useCalendarStore;
