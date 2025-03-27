'use client';

/**
 * Standardized utilities for TanStack Query mutations
 * Provides consistent patterns for error handling, success messaging,
 * and query invalidation.
 */

import { QueryClient } from '@tanstack/react-query';
import { ToastAction } from '@/components/ui/toast';
import { errorHandler } from '@/lib/errors';

type ToastApi = {
  toast: (props: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
    variant?: 'default' | 'destructive';
  }) => void;
};

interface MutationOptionsConfig {
  loading?: string;
  success?: string;
  error?: string;
  operationName: string;
  onSuccessCallback?: (data: any) => void;
  onErrorCallback?: (error: unknown) => void;
  showLoadingToast?: boolean;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
}

/**
 * Creates standardized mutation options with consistent error handling and toasts
 */
export function createMutationOptions(
  toastApi: ToastApi,
  config: MutationOptionsConfig
) {
  const {
    loading,
    success,
    error = 'An error occurred',
    operationName,
    onSuccessCallback,
    onErrorCallback,
    showLoadingToast = !!loading,
    showSuccessToast = !!success,
    showErrorToast = true,
  } = config;

  return {
    onMutate: () => {
      if (showLoadingToast && loading) {
        toastApi.toast({
          title: loading,
        });
      }
    },
    onSuccess: (data: any) => {
      if (showSuccessToast && success) {
        toastApi.toast({
          title: success,
        });
      }
      
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (err: unknown) => {
      if (showErrorToast) {
        const userMessage = errorHandler.getUserFriendlyMessage(err);
        toastApi.toast({
          title: error,
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { operation: operationName });
      
      if (onErrorCallback) {
        onErrorCallback(err);
      }
    },
  };
}

/**
 * Creates standardized mutation options with query invalidation
 */
export function createMutationOptionsWithInvalidation(
  queryClient: QueryClient,
  toastApi: ToastApi,
  config: MutationOptionsConfig & {
    invalidateQueries?: string[][];
    removeQueries?: string[][];
  }
) {
  const { invalidateQueries, removeQueries, onSuccessCallback, ...restConfig } = config;
  
  return createMutationOptions(toastApi, {
    ...restConfig,
    onSuccessCallback: (data) => {
      // Invalidate relevant queries
      if (invalidateQueries) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Remove queries if specified
      if (removeQueries) {
        removeQueries.forEach(queryKey => {
          queryClient.removeQueries({ queryKey });
        });
      }
      
      // Call the original success callback
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
  });
}

/**
 * Creates standardized retry configuration for queries
 */
export function createRetryConfig(maxRetries = 3) {
  return {
    retry: maxRetries,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  };
}
