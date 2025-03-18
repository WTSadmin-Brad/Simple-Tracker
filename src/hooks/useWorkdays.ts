/**
 * Hook for managing workday operations
 * 
 * Provides a comprehensive interface for workday operations
 * with proper error handling, loading states, and retry capabilities.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { useCallback, useState } from 'react';
import { addDays, format, parseISO, differenceInDays } from 'date-fns';
import { Workday, WorkdayType, WorkdayWithTickets } from '../types/workday';
import { errorHandler, ErrorCodes } from '@/lib/errors';
import { useToast } from '@/components/ui/use-toast';

// Editable window in days (7 days from current date)
const EDITABLE_WINDOW_DAYS = 7;

// Cache configuration
interface WorkdayCache {
  [key: string]: {
    data: Workday[];
    timestamp: number;
  };
}

// Cache object for month workdays
const workdayCache: WorkdayCache = {};

// Cache expiry time in milliseconds (30 minutes)
const CACHE_EXPIRY = 30 * 60 * 1000;

/**
 * Hook for managing workday operations
 */
export function useWorkdays() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Get workdays for a specific month
   * 
   * @param year The year
   * @param month The month (1-12)
   * @param forceRefresh Whether to bypass cache
   */
  const getMonthWorkdays = useCallback(async (
    year: number, 
    month: number, 
    forceRefresh = false
  ) => {
    // Create cache key
    const cacheKey = `${year}-${month}`;
    
    // Check cache if not forcing refresh
    if (!forceRefresh && 
        workdayCache[cacheKey] && 
        Date.now() - workdayCache[cacheKey].timestamp < CACHE_EXPIRY) {
      return workdayCache[cacheKey].data;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        // Format month to ensure two digits (e.g., 01, 02, etc.)
        const formattedMonth = month.toString().padStart(2, '0');
        
        const result = await fetch(`/api/workdays/${year}/${formattedMonth}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || `Failed to fetch workdays for ${year}-${formattedMonth}`,
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
      
      const workdays = response.workdays as Workday[];
      
      // Cache the result
      workdayCache[cacheKey] = {
        data: workdays,
        timestamp: Date.now(),
      };
      
      return workdays;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // Show toast notification for unexpected errors
      if (formattedError.status !== 404) {
        toast({
          title: "Failed to load workdays",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'getMonthWorkdays',
        year,
        month,
      });
      
      // Return cached data if available
      if (workdayCache[cacheKey]) {
        return workdayCache[cacheKey].data;
      }
      
      // Return empty array if no cached data
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Get workday details for a specific date
   * 
   * @param date The date in ISO format (YYYY-MM-DD)
   */
  const getWorkdayDetails = useCallback(async (date: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch(`/api/workdays/detail/${date}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!result.ok) {
          // If workday doesn't exist, return null without error
          if (result.status === 404) {
            return { workday: null };
          }
          
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || `Failed to fetch workday details for ${date}`,
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      });
      
      return response.workday as WorkdayWithTickets | null;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // Only show toast for unexpected errors, not for "not found"
      if (formattedError.status !== 404) {
        toast({
          title: "Failed to load workday details",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'getWorkdayDetails',
        date 
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Create a new workday entry
   * 
   * @param date The date in ISO format (YYYY-MM-DD)
   * @param jobsite The jobsite ID
   * @param workType The type of workday (FULL_DAY, HALF_DAY, OFF_DAY)
   */
  const createWorkday = useCallback(async (
    date: string,
    jobsite: string,
    workType: WorkdayType
  ) => {
    setIsLoading(true);
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
      
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch('/api/workdays', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date,
            jobsite,
            workType,
          }),
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to create workday',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      });
      
      // Clear the cache for the affected month to ensure fresh data
      const yearMonth = date.substring(0, 7);
      const [year, month] = yearMonth.split('-').map(Number);
      const cacheKey = `${year}-${month}`;
      
      if (workdayCache[cacheKey]) {
        delete workdayCache[cacheKey];
      }
      
      // Show success toast
      toast({
        title: "Workday created",
        description: `Your workday for ${format(parseISO(date), 'MMM d, yyyy')} has been saved.`,
      });
      
      return response.workday as Workday;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      toast({
        title: "Failed to create workday",
        description: userMessage,
        variant: "destructive",
      });
      
      errorHandler.logError(err, { 
        operation: 'createWorkday',
        date,
        jobsite,
        workType
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Update an existing workday entry
   * 
   * @param id The workday ID
   * @param jobsite The jobsite ID
   * @param workType The type of workday (FULL_DAY, HALF_DAY, OFF_DAY)
   */
  const updateWorkday = useCallback(async (
    id: string,
    jobsite: string,
    workType: WorkdayType
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch(`/api/workdays/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobsite,
            workType,
          }),
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to update workday',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      });
      
      const updatedWorkday = response.workday as Workday;
      
      // Clear the cache for the affected month to ensure fresh data
      if (updatedWorkday.date) {
        const date = typeof updatedWorkday.date === 'string' 
          ? updatedWorkday.date 
          : format(updatedWorkday.date, 'yyyy-MM-dd');
          
        const yearMonth = date.substring(0, 7);
        const [year, month] = yearMonth.split('-').map(Number);
        const cacheKey = `${year}-${month}`;
        
        if (workdayCache[cacheKey]) {
          delete workdayCache[cacheKey];
        }
      }
      
      // Show success toast
      toast({
        title: "Workday updated",
        description: "Your workday has been updated successfully.",
      });
      
      return updatedWorkday;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      toast({
        title: "Failed to update workday",
        description: userMessage,
        variant: "destructive",
      });
      
      errorHandler.logError(err, { 
        operation: 'updateWorkday',
        id,
        jobsite,
        workType
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Delete a workday entry
   * 
   * @param id The workday ID
   */
  const deleteWorkday = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, get the workday to determine its date (for cache invalidation)
      let workdayDate: string | null = null;
      
      try {
        const getResult = await fetch(`/api/workdays/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (getResult.ok) {
          const data = await getResult.json();
          workdayDate = data.workday.date;
        }
      } catch (e) {
        // Ignore error, we'll proceed with deletion anyway
      }
      
      // Delete the workday
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch(`/api/workdays/${id}`, {
          method: 'DELETE',
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to delete workday',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      });
      
      // Clear the cache for the affected month to ensure fresh data
      if (workdayDate) {
        const yearMonth = workdayDate.substring(0, 7);
        const [year, month] = yearMonth.split('-').map(Number);
        const cacheKey = `${year}-${month}`;
        
        if (workdayCache[cacheKey]) {
          delete workdayCache[cacheKey];
        }
      } else {
        // If we couldn't determine the date, clear all cache
        Object.keys(workdayCache).forEach(key => {
          delete workdayCache[key];
        });
      }
      
      // Show success toast
      toast({
        title: "Workday deleted",
        description: "The workday has been deleted successfully.",
      });
      
      return response.success as boolean;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      toast({
        title: "Failed to delete workday",
        description: userMessage,
        variant: "destructive",
      });
      
      errorHandler.logError(err, { 
        operation: 'deleteWorkday',
        id
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Check if a workday is within the editable window (7 days)
   * 
   * @param workday The workday to check
   */
  const isWorkdayEditable = useCallback((workday: Workday): boolean => {
    if (!workday.date) return false;
    
    const workdayDate = typeof workday.date === 'string' 
      ? parseISO(workday.date)
      : new Date(workday.date);
      
    return isDateEditable(format(workdayDate, 'yyyy-MM-dd'));
  }, []);

  /**
   * Helper function to check if a date is within the editable window
   * 
   * @param dateString The date in ISO format (YYYY-MM-DD)
   */
  function isDateEditable(dateString: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const date = parseISO(dateString);
    date.setHours(0, 0, 0, 0);
    
    const pastLimit = addDays(today, -EDITABLE_WINDOW_DAYS);
    const futureLimit = addDays(today, EDITABLE_WINDOW_DAYS);
    
    return date >= pastLimit && date <= futureLimit;
  }

  return {
    isLoading,
    error,
    getMonthWorkdays,
    getWorkdayDetails,
    createWorkday,
    updateWorkday,
    deleteWorkday,
    isWorkdayEditable
  };
}
