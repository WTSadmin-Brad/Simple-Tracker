/**
 * Query utility functions for TanStack Query
 * Provides helper functions for common query patterns
 */

import { 
  MutationOptions, 
  QueryClient,
  QueryKey,
  UseMutationOptions,
  UseQueryOptions
} from '@tanstack/react-query';
import { errorHandler } from '@/lib/errors';
import { UseToastReturn } from '@/components/ui/use-toast';
import { ApiResponse } from '@/types/api';

/**
 * Standard stale times for different data types
 */
export const STALE_TIMES = {
  REFERENCE_DATA: 5 * 60 * 1000, // 5 minutes - reference data changes infrequently
  TICKET_LIST: 2 * 60 * 1000,    // 2 minutes - ticket lists may change more often
  TICKET_DETAIL: 5 * 60 * 1000,  // 5 minutes - individual tickets change less frequently
  WORKDAY_CALENDAR: 5 * 60 * 1000, // 5 minutes - calendar data doesn't change frequently
  WORKDAY_DETAIL: 3 * 60 * 1000, // 3 minutes
  STATS: 10 * 60 * 1000,         // 10 minutes - stats are computed and change infrequently
  WIZARD_DATA: 0,                // 0 minutes - always fetch fresh wizard data
};

/**
 * Adds standard error handling to mutation options
 * Logs errors consistently and integrates with the application's error handler
 * 
 * @param options Original mutation options
 * @param operationName Name of the operation for logging
 * @returns Enhanced mutation options with standardized error handling
 */
export function withErrorHandling<TData, TError, TVariables, TContext>(
  options: MutationOptions<TData, TError, TVariables, TContext>,
  operationName: string
): MutationOptions<TData, TError, TVariables, TContext> {
  return {
    ...options,
    onError: (error, variables, context) => {
      // Log the error with the error handler
      errorHandler.logError(error, { 
        operation: operationName,
        variables: JSON.stringify(variables).length > 1000 
          ? 'Variables too large to log' 
          : variables,
      });
      
      // Call the original onError if it exists
      if (options.onError) {
        options.onError(error, variables, context);
      }
    },
  };
}

/**
 * Updates a query in the cache optimistically
 * Provides a rollback function to restore the original data if the mutation fails
 * 
 * @param queryClient QueryClient instance
 * @param queryKey Query key to update
 * @param updateFn Function to update the data
 * @returns Object with updater function and rollback function
 */
export function optimisticUpdate<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updateFn: (oldData: T) => T
) {
  // Get the current data from the cache
  const oldData = queryClient.getQueryData<T>(queryKey);
  
  // Update the data in the cache
  if (oldData) {
    queryClient.setQueryData<T>(queryKey, updateFn(oldData));
  }
  
  // Return a rollback function
  return {
    rollback: () => {
      if (oldData) {
        queryClient.setQueryData<T>(queryKey, oldData);
      }
    }
  };
}

/**
 * Creates standard mutation options with toast notifications
 * @deprecated Use createMutationOptions from mutationUtils.ts instead
 * 
 * @param toast Toast function from useToast
 * @param options Additional notification options
 * @returns Mutation options with standard toast notifications
 */
export function createMutationOptions<TData, TError, TVariables>(
  toast: UseToastReturn['toast'],
  options: {
    loading?: string;
    success?: string | ((data: TData) => string);
    error?: string | ((error: unknown) => string);
    operationName: string;
    onSuccessCallback?: (data: TData, variables: TVariables) => void;
    onErrorCallback?: (error: unknown, variables: TVariables) => void;
  }
): UseMutationOptions<ApiResponse<TData>, unknown, TVariables, unknown> {
  const {
    loading,
    success,
    error,
    operationName,
    onSuccessCallback,
    onErrorCallback,
  } = options;

  return {
    onMutate: () => {
      if (loading) {
        toast({
          title: loading,
          duration: 3000,
        });
      }
    },
    onSuccess: (response, variables) => {
      if (success && response.success) {
        toast({
          title: typeof success === 'function' ? success(response.data) : success,
          variant: 'default',
        });
      }
      
      if (onSuccessCallback && response.success) {
        onSuccessCallback(response.data, variables);
      }
    },
    onError: (err, variables) => {
      const userMessage = error
        ? typeof error === 'function'
          ? error(err)
          : error
        : errorHandler.getUserFriendlyMessage(err);
      
      toast({
        title: 'Error',
        description: userMessage,
        variant: 'destructive',
      });
      
      errorHandler.logError(err, { operation: operationName });
      
      if (onErrorCallback) {
        onErrorCallback(err, variables);
      }
    },
  };
}

/**
 * Standardizes retry configuration with exponential backoff
 * 
 * @param maxRetries Maximum number of retries
 * @param baseDelay Base delay in milliseconds
 * @returns Retry configuration
 */
export function createRetryConfig(maxRetries = 3, baseDelay = 1000) {
  return {
    retry: (failureCount: number, error: any) => {
      // Don't retry if we've reached the max retries
      if (failureCount >= maxRetries) {
        return false;
      }
      
      // Don't retry for 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      
      // Retry for network errors and 5xx errors
      return true;
    },
    retryDelay: (attemptIndex: number) => {
      // Exponential backoff: 1s, 2s, 4s, etc.
      return Math.min(
        baseDelay * Math.pow(2, attemptIndex),
        30000 // Max 30 seconds
      );
    },
  };
}

/**
 * Creates standardized query options with consistent settings
 * 
 * @param staleTime Stale time in milliseconds
 * @param maxRetries Maximum number of retries
 * @returns Standardized query options
 */
export function createQueryOptions<TData>(
  staleTime = STALE_TIMES.REFERENCE_DATA,
  maxRetries = 2
): Partial<UseQueryOptions<unknown, unknown, TData, any>> {
  return {
    staleTime,
    ...createRetryConfig(maxRetries),
  };
}

/**
 * Extracts data from an API response
 * 
 * @param response API response
 * @returns Data from the response or null if unsuccessful
 */
export function extractResponseData<T>(response: ApiResponse<T>): T | null {
  return response.success ? response.data : null;
}

/**
 * Handles API errors by throwing them for React Query to catch
 * 
 * @param response API response
 * @returns Data from the response
 * @throws Error if the response is unsuccessful
 */
export function handleApiErrors<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || 'Unknown error occurred');
  }
  return response.data;
}
