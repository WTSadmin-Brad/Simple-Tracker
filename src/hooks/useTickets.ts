/**
 * Hook for managing ticket operations
 * Provides a simplified interface for ticket-related functionality
 * with proper error handling, loading states, and data management.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Ticket_Submission.md - "Ticket Submission Flow" section
 */

import { useCallback, useMemo, useState } from 'react';
import { useTicketQueries } from './queries/useTicketQueries';
import { Ticket, WizardData } from '@/types/tickets';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { errorHandler } from '@/lib/errors';

/**
 * Return type for useTickets hook
 */
interface UseTicketsReturn {
  /** Loading state for any ticket operation */
  isLoading: boolean;
  /** Error message from any ticket operation */
  error: string | null;
  /** Submit a complete ticket */
  submitTicket: (wizardData: WizardData) => Promise<Ticket | null>;
  /** Save a wizard step */
  saveWizardStep: (step: 1 | 2 | 3, data: any) => Promise<boolean>;
  /** Get saved wizard data */
  getWizardData: () => Promise<WizardData | null>;
  /** Current wizard data */
  wizardData: WizardData | null;
  /** Clear any error messages */
  clearError: () => void;
}

/**
 * Hook for managing ticket operations
 * Wrapper around query hooks that provides a simplified API
 * for components that don't need full TanStack Query functionality
 * 
 * @returns Simplified ticket operations interface
 */
export function useTickets(): UseTicketsReturn {
  const { user } = useAuth();
  const userId = user?.id || '';
  const { toast } = useToast();
  const [localError, setLocalError] = useState<string | null>(null);
  
  const {
    // Wizard data
    wizardData,
    isLoadingWizardData,
    wizardDataError,
    refetchWizardData,
    
    // Ticket submission
    submitTicket,
    isSubmittingTicket,
    submitTicketError,
    
    // Wizard step save
    saveWizardStep,
    isSavingWizardStep,
  } = useTicketQueries();

  // Combine loading states
  const isLoading = useMemo(() => 
    isLoadingWizardData || 
    isSubmittingTicket || 
    isSavingWizardStep, 
  [
    isLoadingWizardData,
    isSubmittingTicket,
    isSavingWizardStep
  ]);

  // Combine error states
  const error = useMemo(() => 
    localError ||
    wizardDataError?.message || 
    submitTicketError?.message || 
    null, 
  [
    localError,
    wizardDataError,
    submitTicketError
  ]);

  /**
   * Clear any error messages
   */
  const clearError = useCallback((): void => {
    setLocalError(null);
  }, []);

  /**
   * Get saved wizard data with error handling
   * 
   * @returns Promise resolving to wizard data or null if error
   */
  const getWizardData = useCallback(async (): Promise<WizardData | null> => {
    try {
      await refetchWizardData();
      return wizardData;
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      setLocalError(userMessage);
      
      errorHandler.logError(err, { 
        operation: 'getWizardData',
      });
      
      return null;
    }
  }, [refetchWizardData, wizardData]);

  /**
   * Submit ticket with current user
   * 
   * @param wizardData Complete wizard data to submit
   * @returns Promise resolving to created ticket or null if error
   * @throws Error if user is not authenticated
   */
  const submitTicketWithUser = useCallback(async (wizardData: WizardData): Promise<Ticket | null> => {
    clearError();
    
    try {
      if (!userId) {
        const error = new Error('User must be authenticated to submit tickets');
        setLocalError(error.message);
        
        errorHandler.logError(error, { 
          operation: 'submitTicket',
          authenticated: false
        });
        
        toast({
          title: "Authentication Required",
          description: "Please log in to submit tickets.",
          variant: "destructive",
        });
        
        return null;
      }
      
      const result = await submitTicket(userId, wizardData);
      
      toast({
        title: "Ticket Submitted",
        description: "Your ticket has been submitted successfully.",
      });
      
      return result;
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      setLocalError(userMessage);
      
      errorHandler.logError(err, { 
        operation: 'submitTicket',
        userId
      });
      
      return null;
    }
  }, [submitTicket, userId, clearError, toast]);

  /**
   * Save wizard step with current user
   * 
   * @param step Wizard step number (1-3)
   * @param data Step data to save
   * @returns Promise resolving to success status
   */
  const saveWizardStepWithUser = useCallback(async (step: 1 | 2 | 3, data: any): Promise<boolean> => {
    clearError();
    
    try {
      if (!userId) {
        const error = new Error('User must be authenticated to save wizard data');
        setLocalError(error.message);
        
        errorHandler.logError(error, { 
          operation: 'saveWizardStep',
          step,
          authenticated: false
        });
        
        return false;
      }
      
      return await saveWizardStep(userId, step, data);
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      setLocalError(userMessage);
      
      errorHandler.logError(err, { 
        operation: 'saveWizardStep',
        step,
        userId
      });
      
      return false;
    }
  }, [saveWizardStep, userId, clearError]);

  return {
    isLoading,
    error,
    submitTicket: submitTicketWithUser,
    saveWizardStep: saveWizardStepWithUser,
    getWizardData,
    wizardData,
    clearError,
  };
}
