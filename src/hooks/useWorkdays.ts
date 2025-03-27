/**
 * Hook for managing workday operations
 * 
 * Provides a comprehensive interface for workday operations
 * with proper error handling, loading states, and retry capabilities.
 * This updated version uses TanStack Query for data fetching and state management.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { useCallback, useState, useMemo } from 'react';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';
import { Workday, WorkdayType, WorkdayWithTickets } from '../types/workday';
import { errorHandler, ErrorCodes } from '@/lib/errors';
import { useToast } from '@/components/ui/use-toast';
import { useWorkdayQueries } from './queries/useWorkdayQueries';

// Editable window in days (7 days from current date)
const EDITABLE_WINDOW_DAYS = 7;

/**
 * Return type for useWorkdays hook
 */
interface UseWorkdaysReturn {
  /** Loading state for any workday operation */
  isLoading: boolean;
  /** Error message from any workday operation */
  error: string | null;
  /** Get workdays for a specific month */
  getMonthWorkdays: (year: number, month: number, forceRefresh?: boolean) => Promise<Workday[]>;
  /** Get workday details for a specific date */
  getWorkdayDetails: (date: string) => Promise<WorkdayWithTickets | null>;
  /** Create a new workday entry */
  createWorkday: (date: string, jobsite: string, workType: WorkdayType) => Promise<Workday | null>;
  /** Update an existing workday entry */
  updateWorkday: (id: string, jobsite: string, workType: WorkdayType, date?: string) => Promise<Workday | null>;
  /** Check if a date is within the editable window */
  isDateEditable: (date: string) => boolean;
  /** Get the current editable window start date */
  getEditableWindowStart: () => string;
}

/**
 * Hook for managing workday operations
 * Wrapper around useWorkdayQueries that provides a simplified API
 * for components that don't need full TanStack Query functionality
 * 
 * @returns Simplified workday operations interface
 */
export function useWorkdays(): UseWorkdaysReturn {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    // Workday queries
    useMonthWorkdaysQuery,
    useWorkdayDetailsQuery,
    
    // Workday mutations
    createWorkday: createWorkdayMutation,
    isCreatingWorkday,
    createWorkdayError,
    
    updateWorkday: updateWorkdayMutation,
    isUpdatingWorkday,
    updateWorkdayError,
  } = useWorkdayQueries();

  // Combined loading state
  const isLoading = useMemo(() => 
    isCreatingWorkday || isUpdatingWorkday, 
  [isCreatingWorkday, isUpdatingWorkday]);

  // Combined error state
  const combinedError = useMemo(() => 
    error || createWorkdayError?.message || updateWorkdayError?.message || null, 
  [error, createWorkdayError, updateWorkdayError]);

  /**
   * Get workdays for a specific month
   * 
   * @param year The year
   * @param month The month (1-12)
   * @param forceRefresh Whether to bypass cache
   * @returns Promise resolving to array of workdays
   */
  const getMonthWorkdays = useCallback(async (
    year: number, 
    month: number, 
    forceRefresh = false
  ): Promise<Workday[]> => {
    try {
      // Using the query hook directly
      const query = useMonthWorkdaysQuery(year, month);
      
      // If force refresh is requested, refetch the data
      if (forceRefresh) {
        await query.refetch();
      }
      
      return query.data || [];
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      setError(userMessage);
      
      errorHandler.logError(err, { 
        operation: 'getMonthWorkdays',
        year,
        month,
      });
      
      return [];
    }
  }, [useMonthWorkdaysQuery]);

  /**
   * Get workday details for a specific date
   * 
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns Promise resolving to workday details or null if not found
   */
  const getWorkdayDetails = useCallback(async (date: string): Promise<WorkdayWithTickets | null> => {
    try {
      // Using the query hook directly
      const query = useWorkdayDetailsQuery(date);
      
      // Force a refetch to ensure fresh data
      await query.refetch();
      
      return query.data || null;
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      setError(userMessage);
      
      errorHandler.logError(err, { 
        operation: 'getWorkdayDetails',
        date 
      });
      
      return null;
    }
  }, [useWorkdayDetailsQuery]);

  /**
   * Create a new workday entry
   * 
   * @param date The date in ISO format (YYYY-MM-DD)
   * @param jobsite The jobsite ID
   * @param workType The type of workday (FULL_DAY, HALF_DAY, OFF_DAY)
   * @returns Promise resolving to created workday or null if error
   */
  const createWorkday = useCallback(async (
    date: string,
    jobsite: string,
    workType: WorkdayType
  ): Promise<Workday | null> => {
    setError(null);
    
    try {
      // Check if date is within editable window
      if (!isDateEditable(date)) {
        throw errorHandler.createError(
          `Workdays can only be created within ${EDITABLE_WINDOW_DAYS} days of the current date`,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          { date, editable: false }
        );
      }
      
      const result = await createWorkdayMutation({ date, jobsite, workType });
      
      // Show success toast
      toast({
        title: "Workday created",
        description: `Your workday for ${format(parseISO(date), 'MMM d, yyyy')} has been saved.`,
      });
      
      return result;
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      setError(userMessage);
      
      errorHandler.logError(err, { 
        operation: 'createWorkday',
        date,
        jobsite,
        workType
      });
      
      return null;
    }
  }, [createWorkdayMutation, toast]);

  /**
   * Update an existing workday entry
   * 
   * @param id The workday ID
   * @param jobsite The jobsite ID
   * @param workType The type of workday (FULL_DAY, HALF_DAY, OFF_DAY)
   * @param date The date in ISO format (YYYY-MM-DD) - for cache invalidation
   * @returns Promise resolving to updated workday or null if error
   */
  const updateWorkday = useCallback(async (
    id: string,
    jobsite: string,
    workType: WorkdayType,
    date?: string
  ): Promise<Workday | null> => {
    setError(null);
    
    try {
      const result = await updateWorkdayMutation({ id, jobsite, workType, date });
      
      // Show success toast
      toast({
        title: "Workday updated",
        description: "Your workday has been updated successfully.",
      });
      
      return result;
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      setError(userMessage);
      
      errorHandler.logError(err, { 
        operation: 'updateWorkday',
        id,
        jobsite,
        workType
      });
      
      return null;
    }
  }, [updateWorkdayMutation, toast]);

  /**
   * Check if a date is within the editable window
   * 
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns Boolean indicating if the date is editable
   */
  const isDateEditable = useCallback((date: string): boolean => {
    const today = new Date();
    const dateObj = parseISO(date);
    const daysDifference = Math.abs(differenceInDays(today, dateObj));
    
    return daysDifference <= EDITABLE_WINDOW_DAYS;
  }, []);

  /**
   * Get the current editable window start date
   * 
   * @returns The start date of the editable window in ISO format (YYYY-MM-DD)
   */
  const getEditableWindowStart = useCallback((): string => {
    const today = new Date();
    const windowStart = addDays(today, -EDITABLE_WINDOW_DAYS);
    return format(windowStart, 'yyyy-MM-dd');
  }, []);

  return {
    isLoading,
    error: combinedError,
    getMonthWorkdays,
    getWorkdayDetails,
    createWorkday,
    updateWorkday,
    isDateEditable,
    getEditableWindowStart,
  };
}
