/**
 * useWizardApi.ts
 * 
 * Custom hook for handling wizard API calls with structured error handling,
 * loading states, and retry capabilities.
 * 
 * Provides a consistent interface for all wizard-related API operations.
 */

import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { errorHandler, ErrorCodes, ValidationError } from '@/lib/errors';
import { 
  BasicInfoData,
  CategoriesData,
  ImageUploadData,
  CompleteWizardData
} from '@/lib/validation/wizardSchemas';

interface WizardStepResponse {
  success: boolean;
  message?: string;
  data?: unknown;
  stepId?: string;
  savedAt?: string;
}

interface CompleteWizardResponse {
  success: boolean;
  ticketId?: string;
  message?: string;
  redirectUrl?: string;
}

interface UseWizardApiReturn {
  isLoading: boolean;
  error: string | null;
  saveBasicInfo: (data: BasicInfoData) => Promise<boolean>;
  saveCategories: (data: CategoriesData) => Promise<boolean>;
  saveImageUpload: (data: ImageUploadData) => Promise<boolean>;
  completeWizard: (data: CompleteWizardData) => Promise<{ success: boolean; ticketId?: string; redirectUrl?: string }>;
  getWizardState: () => Promise<{ stepData?: any; currentStep?: number; lastUpdated?: string } | null>;
  clearWizardState: () => Promise<boolean>;
  clearError: () => void;
}

export function useWizardApi(): UseWizardApiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const clearError = useCallback(() => setError(null), []);
  
  /**
   * Generic API call handler with error handling and retries
   */
  const handleApiCall = useCallback(async <T, R>(
    url: string, 
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST',
    data?: T,
    options?: {
      showSuccessToast?: boolean;
      successMessage?: string;
      showErrorToast?: boolean;
      maxRetries?: number;
      silent?: boolean;
    }
  ): Promise<R> => {
    const { 
      showSuccessToast = false, 
      successMessage = 'Operation successful',
      showErrorToast = true,
      maxRetries = 3,
      silent = false
    } = options || {};
    
    if (!silent) {
      setIsLoading(true);
      clearError();
    }
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const fetchOptions: RequestInit = {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: data ? JSON.stringify(data) : undefined,
        };
        
        const response = await fetch(url, fetchOptions);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw errorHandler.createError(
            errorData.message || 'An error occurred',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            response.status,
            errorData.errors
          );
        }
        
        return response.json();
      }, {
        maxRetries,
        retryDelay: 1000,
        shouldRetry: (error) => {
          const { code, status } = errorHandler.formatError(error);
          // Only retry network or server errors, not validation errors
          return (
            code.startsWith('network/') || 
            (status && status >= 500 && status < 600) ||
            code === ErrorCodes.SERVICE_UNAVAILABLE
          );
        },
        onRetry: (error, attempt) => {
          if (!silent && attempt === maxRetries) {
            toast({
              title: "Connection issue",
              description: "Having trouble connecting to the server. Please check your connection.",
              variant: "destructive",
            });
          }
        }
      });
      
      if (showSuccessToast) {
        toast({
          title: "Success",
          description: successMessage,
        });
      }
      
      return response as R;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      if (!silent) {
        setError(userMessage);
        
        if (showErrorToast) {
          toast({
            title: "Error",
            description: userMessage,
            variant: "destructive",
          });
        }
      }
      
      errorHandler.logError(err, { 
        operation: 'wizardApi',
        url,
        method,
        data: data ? { ...data, files: data.hasOwnProperty('files') ? '[files omitted]' : undefined } : undefined
      });
      
      throw err;
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [clearError, toast]);

  /**
   * Save basic info (step 1)
   */
  const saveBasicInfo = useCallback(async (data: BasicInfoData): Promise<boolean> => {
    try {
      await handleApiCall<BasicInfoData, WizardStepResponse>(
        '/api/tickets/wizard/step1', 
        'POST', 
        data,
        { 
          showSuccessToast: false, 
          silent: true // Auto-save shouldn't show loading state
        }
      );
      return true;
    } catch (err) {
      // For validation errors, rethrow to let form handle them
      if (err instanceof ValidationError) {
        throw err;
      }
      return false;
    }
  }, [handleApiCall]);
  
  /**
   * Save categories (step 2)
   */
  const saveCategories = useCallback(async (data: CategoriesData): Promise<boolean> => {
    try {
      await handleApiCall<CategoriesData, WizardStepResponse>(
        '/api/tickets/wizard/step2', 
        'POST', 
        data,
        { 
          showSuccessToast: false,
          silent: true // Auto-save shouldn't show loading state
        }
      );
      return true;
    } catch (err) {
      // For validation errors, rethrow to let form handle them
      if (err instanceof ValidationError) {
        throw err;
      }
      return false;
    }
  }, [handleApiCall]);
  
  /**
   * Save image upload (step 3)
   */
  const saveImageUpload = useCallback(async (data: ImageUploadData): Promise<boolean> => {
    try {
      await handleApiCall<ImageUploadData, WizardStepResponse>(
        '/api/tickets/wizard/step3', 
        'POST', 
        data,
        { 
          showSuccessToast: false,
          maxRetries: 2 // Fewer retries for image operations
        }
      );
      return true;
    } catch (err) {
      // For validation errors, rethrow to let form handle them
      if (err instanceof ValidationError) {
        throw err;
      }
      return false;
    }
  }, [handleApiCall]);
  
  /**
   * Complete wizard and create ticket
   */
  const completeWizard = useCallback(async (
    data: CompleteWizardData
  ): Promise<{ success: boolean; ticketId?: string; redirectUrl?: string }> => {
    try {
      setIsLoading(true);
      const result = await handleApiCall<CompleteWizardData, CompleteWizardResponse>(
        '/api/tickets/wizard/complete', 
        'POST', 
        data,
        { 
          showSuccessToast: true,
          successMessage: 'Ticket submitted successfully!',
          maxRetries: 2 // Fewer retries for final submission
        }
      );
      
      return { 
        success: true, 
        ticketId: result.ticketId,
        redirectUrl: result.redirectUrl
      };
    } catch (err) {
      // For validation errors, rethrow to let form handle them
      if (err instanceof ValidationError) {
        throw err;
      }
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, [handleApiCall]);

  /**
   * Get current wizard state
   */
  const getWizardState = useCallback(async (): Promise<{ stepData?: any; currentStep?: number; lastUpdated?: string } | null> => {
    try {
      const response = await handleApiCall<void, { 
        success: boolean; 
        data?: { 
          stepData: any; 
          currentStep: number;
          lastUpdated: string;
        }
      }>(
        '/api/tickets/wizard', 
        'GET',
        undefined,
        { 
          showErrorToast: false,
          silent: true
        }
      );
      
      if (response.success && response.data) {
        return {
          stepData: response.data.stepData,
          currentStep: response.data.currentStep,
          lastUpdated: response.data.lastUpdated
        };
      }
      
      return null;
    } catch (err) {
      // For 404 (no saved state), return null without error
      const { status } = errorHandler.formatError(err);
      if (status === 404) {
        return null;
      }
      
      // Otherwise log error but don't display to user
      errorHandler.logError(err, { 
        operation: 'getWizardState'
      });
      
      return null;
    }
  }, [handleApiCall]);

  /**
   * Clear wizard state
   */
  const clearWizardState = useCallback(async (): Promise<boolean> => {
    try {
      await handleApiCall<void, { success: boolean }>(
        '/api/tickets/wizard', 
        'DELETE',
        undefined,
        { 
          showErrorToast: false,
          silent: true
        }
      );
      
      return true;
    } catch (err) {
      // Log error but don't fail the operation for the user
      errorHandler.logError(err, { 
        operation: 'clearWizardState'
      });
      
      return false;
    }
  }, [handleApiCall]);
  
  return {
    isLoading,
    error,
    saveBasicInfo,
    saveCategories,
    saveImageUpload,
    completeWizard,
    getWizardState,
    clearWizardState,
    clearError
  };
}
