/**
 * Hook for managing ticket operations
 * 
 * Provides a comprehensive interface for all ticket-related operations
 * with proper error handling, loading states, and retry capabilities.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Employee_Flows.md - "Ticket Submission Wizard Flow" section
 */

import { useCallback, useState } from 'react';
import { Ticket, WizardData, TempImageUploadResponse } from '../types/tickets';
import { errorHandler, ErrorCodes } from '@/lib/errors';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook for managing ticket operations
 */
export function useTickets() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Submit a complete ticket
   */
  const submitTicket = useCallback(async (wizardData: WizardData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch('/api/tickets/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(wizardData),
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to submit ticket',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      }, {
        maxRetries: 3,
        retryDelay: 1000,
        onRetry: (error, attempt) => {
          toast({
            title: "Connection issue",
            description: `Retrying to submit ticket (Attempt ${attempt}/3)...`,
            variant: "destructive",
          });
        }
      });
      
      return response.ticket as Ticket;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      toast({
        title: "Failed to submit ticket",
        description: userMessage,
        variant: "destructive",
      });
      
      errorHandler.logError(err, { 
        operation: 'submitTicket',
        wizardData: { ...wizardData, images: `[${wizardData.images?.length || 0} images]` } 
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Upload a temporary image for the wizard
   */
  const uploadTempImage = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a FormData object to upload the file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch('/api/tickets/upload-temp', {
          method: 'POST',
          body: formData,
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to upload image',
            errorData.code || ErrorCodes.UPLOAD_FAILED,
            result.status
          );
        }
        
        return result.json();
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
      
      return response as TempImageUploadResponse;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      toast({
        title: "Failed to upload image",
        description: userMessage,
        variant: "destructive",
      });
      
      errorHandler.logError(err, { 
        operation: 'uploadTempImage',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Delete a temporary image
   */
  const deleteTempImage = useCallback(async (tempId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch(`/api/tickets/delete-temp/${tempId}`, {
          method: 'DELETE',
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to delete image',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      });
      
      return response.success as boolean;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // For image deletion, we don't want to show a toast for every failure
      // as it might be a background operation
      if (formattedError.status !== 404) {
        toast({
          title: "Failed to delete image",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'deleteTempImage',
        tempId 
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Save wizard step data
   */
  const saveWizardStep = useCallback(async (
    step: 1 | 2 | 3,
    data: any
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch(`/api/tickets/wizard/${step}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || `Failed to save step ${step}`,
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      }, {
        // More aggressive retry for auto-save operations
        maxRetries: 5,
        retryDelay: 500,
        // Only show UI notifications on final failure
        onRetry: (error, attempt, maxRetries) => {
          if (attempt === maxRetries) {
            toast({
              title: "Auto-save issue",
              description: "Having trouble saving your progress. Please check your connection.",
              variant: "destructive",
            });
          }
        }
      });
      
      return response.success as boolean;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      toast({
        title: "Failed to save progress",
        description: userMessage,
        variant: "destructive",
      });
      
      errorHandler.logError(err, { 
        operation: 'saveWizardStep',
        step,
        data: { ...data, images: data.images ? `[${data.images.length} images]` : undefined }
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Get saved wizard data
   */
  const getWizardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch('/api/tickets/wizard', {
          method: 'GET',
        });
        
        if (!result.ok) {
          // For 404 (no saved data), just return null without error
          if (result.status === 404) {
            return { data: null };
          }
          
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to retrieve wizard data',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      });
      
      return response.data as WizardData | null;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // Don't show toast for no saved data
      if (formattedError.status !== 404) {
        toast({
          title: "Failed to retrieve saved progress",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'getWizardData' 
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Clear saved wizard data
   */
  const clearWizardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await errorHandler.withRetry(async () => {
        const result = await fetch('/api/tickets/wizard', {
          method: 'DELETE',
        });
        
        if (!result.ok) {
          const errorData = await result.json();
          throw errorHandler.createError(
            errorData.message || 'Failed to clear wizard data',
            errorData.code || ErrorCodes.UNKNOWN_ERROR,
            result.status
          );
        }
        
        return result.json();
      });
      
      return response.success as boolean;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      setError(userMessage);
      
      // For this background operation, only show toast for more serious errors
      if (formattedError.status && formattedError.status >= 500) {
        toast({
          title: "Failed to clear saved progress",
          description: userMessage,
          variant: "destructive",
        });
      }
      
      errorHandler.logError(err, { 
        operation: 'clearWizardData' 
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    error,
    submitTicket,
    uploadTempImage,
    deleteTempImage,
    saveWizardStep,
    getWizardData,
    clearWizardData,
  };
}
