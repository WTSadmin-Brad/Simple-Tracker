'use client';

/**
 * Workday query hooks using TanStack Query v5
 * Designed for direct use in components
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import workdayService from '@/lib/services/workdayService';
import { useToast } from '@/components/ui/use-toast';
import { errorHandler } from '@/lib/errors';
import { queryKeys } from '@/lib/query/queryKeys';
import { createMutationOptionsWithInvalidation, createRetryConfig } from '@/lib/query/mutationUtils';
import { Workday, WorkdayFormData } from '@/types/workday';

// Standard stale times for workday data
const WORKDAY_CALENDAR_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const WORKDAY_DETAIL_STALE_TIME = 3 * 60 * 1000; // 3 minutes
const WORKDAY_STATS_STALE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Get workdays for a specific month
 */
export function useGetMonthWorkdays(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.workdays.calendar.month(year, month),
    queryFn: () => workdayService.getMonthWorkdays(year, month),
    staleTime: WORKDAY_CALENDAR_STALE_TIME,
    ...createRetryConfig(2),
  });
}

/**
 * Get workday details by ID
 */
export function useGetWorkdayById(id: string | null) {
  return useQuery({
    queryKey: queryKeys.workdays.detail(id || ''),
    queryFn: () => workdayService.getWorkdayById(id || ''),
    enabled: !!id, // Only run the query if an ID is provided
    staleTime: WORKDAY_DETAIL_STALE_TIME,
    ...createRetryConfig(2),
  });
}

/**
 * Get workday details by date
 */
export function useGetWorkdayByDate(date: string | null) {
  return useQuery({
    queryKey: queryKeys.workdays.calendar.day(date || ''),
    queryFn: () => workdayService.getWorkdayByDate(date || ''),
    enabled: !!date, // Only run the query if a date is provided
    staleTime: WORKDAY_DETAIL_STALE_TIME,
    ...createRetryConfig(2),
  });
}

/**
 * Create a new workday
 */
export function useCreateWorkday() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: WorkdayFormData) => workdayService.createWorkday(data),
    ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
      success: "Workday created successfully",
      error: "Failed to create workday",
      operationName: 'createWorkday',
      onSuccessCallback: (newWorkday) => {
        // Extract year and month from the workday date
        const date = new Date(newWorkday.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // Invalidate month data that includes this workday
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workdays.calendar.month(year, month)
        });
        
        // Invalidate day query for this specific date
        const dateString = newWorkday.date.toISOString().split('T')[0];
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workdays.calendar.day(dateString)
        });
      },
    }),
  });
}

/**
 * Update an existing workday
 */
export function useUpdateWorkday() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string, workday: Partial<WorkdayFormData> }) => 
      workdayService.updateWorkday(data.id, data.workday),
    ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
      success: "Workday updated successfully",
      error: "Failed to update workday",
      operationName: 'updateWorkday',
      onSuccessCallback: (updatedWorkday) => {
        // Extract year and month from the workday date
        const date = new Date(updatedWorkday.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // Invalidate month data that includes this workday
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workdays.calendar.month(year, month)
        });
        
        // Invalidate day query for this specific date
        const dateString = updatedWorkday.date.toISOString().split('T')[0];
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workdays.calendar.day(dateString)
        });
        
        // Invalidate detail query for this workday
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workdays.detail(updatedWorkday.id)
        });
      },
    }),
  });
}

/**
 * Delete a workday
 */
export function useDeleteWorkday() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string, date: Date }) => workdayService.deleteWorkday(data.id),
    ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
      success: "Workday deleted successfully",
      error: "Failed to delete workday",
      operationName: 'deleteWorkday',
      onSuccessCallback: (_, variables) => {
        // Extract year and month from the workday date
        const date = new Date(variables.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        
        // Invalidate month data that includes this workday
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workdays.calendar.month(year, month)
        });
        
        // Invalidate day query for this specific date
        const dateString = variables.date.toISOString().split('T')[0];
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workdays.calendar.day(dateString)
        });
        
        // Invalidate detail query for this workday
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workdays.detail(variables.id)
        });
      },
    }),
  });
}

/**
 * Get monthly stats
 */
export function useGetMonthlyStats(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.workdays.stats.monthly(year, month),
    queryFn: () => workdayService.getMonthlyStats(year, month),
    staleTime: WORKDAY_STATS_STALE_TIME,
    ...createRetryConfig(1),
  });
}

/**
 * Get yearly stats
 */
export function useGetYearlyStats(year: number) {
  return useQuery({
    queryKey: queryKeys.workdays.stats.yearly(year),
    queryFn: () => workdayService.getYearlyStats(year),
    staleTime: WORKDAY_STATS_STALE_TIME,
    ...createRetryConfig(1),
  });
}
