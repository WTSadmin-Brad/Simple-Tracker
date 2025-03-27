'use client';

/**
 * Ticket queries and mutations using TanStack Query v5
 * Provides data fetching, caching, and mutation capabilities for tickets
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import { queryKeys } from '@/lib/query/queryKeys';
import { createMutationOptionsWithInvalidation, createRetryConfig } from '@/lib/query/mutationUtils';
import { 
  getTickets, 
  getTicketById, 
  getWizardData, 
  submitTicket, 
  saveWizardStep1, 
  saveWizardStep2, 
  saveWizardStep3, 
  uploadTempImage, 
  deleteTempImage 
} from '@/lib/api/ticketApi';
import { 
  WizardData, 
  Ticket, 
  WizardStep1Data, 
  WizardStep2Data, 
  WizardStep3Data,
  TicketFilterParams
} from '@/types/tickets';

// Standard stale times for different data types
const TICKET_LIST_STALE_TIME = 2 * 60 * 1000; // 2 minutes
const TICKET_DETAIL_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const WIZARD_DATA_STALE_TIME = 0; // Always fetch fresh wizard data

/**
 * Hook for ticket queries
 * Provides queries for fetching ticket data
 */
export function useTicketQueries() {
  // Get tickets with filtering
  const useTickets = (filters: TicketFilterParams = {}) => {
    return useQuery({
      queryKey: queryKeys.tickets.list(filters),
      queryFn: () => getTickets(filters),
      staleTime: TICKET_LIST_STALE_TIME,
      ...createRetryConfig(2),
    });
  };

  // Get a single ticket by ID
  const useTicket = (id: string | null) => {
    return useQuery({
      queryKey: queryKeys.tickets.detail(id || ''),
      queryFn: () => getTicketById(id || ''),
      enabled: !!id, // Only run the query if an ID is provided
      staleTime: TICKET_DETAIL_STALE_TIME,
      ...createRetryConfig(2),
    });
  };

  // Get wizard data
  const useWizardData = () => {
    return useQuery({
      queryKey: queryKeys.tickets.wizard.data(),
      queryFn: () => getWizardData(),
      staleTime: WIZARD_DATA_STALE_TIME,
      refetchOnWindowFocus: false,
      ...createRetryConfig(1),
    });
  };

  return {
    useTickets,
    useTicket,
    useWizardData,
  };
}

/**
 * Hook for ticket mutations
 * Provides mutations for modifying ticket data
 */
export function useTicketMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Submit ticket mutation
  const useSubmitTicket = () => {
    return useMutation({
      mutationFn: (data: WizardData) => submitTicket(data),
      ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
        loading: 'Submitting ticket...',
        success: 'Ticket submitted successfully!',
        error: 'Failed to submit ticket',
        operationName: 'submitTicket',
        invalidateQueries: [queryKeys.tickets.lists()],
        removeQueries: [queryKeys.tickets.wizard.all()],
      }),
    });
  };

  // Save wizard step 1 mutation
  const useSaveWizardStep1 = () => {
    return useMutation({
      mutationFn: (data: WizardStep1Data) => saveWizardStep1(data),
      ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
        success: 'Basic info saved',
        error: 'Failed to save basic info',
        operationName: 'saveWizardStep1',
        invalidateQueries: [queryKeys.tickets.wizard.data()],
        showLoadingToast: false,
      }),
    });
  };

  // Save wizard step 2 mutation
  const useSaveWizardStep2 = () => {
    return useMutation({
      mutationFn: (data: WizardStep2Data) => saveWizardStep2(data),
      ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
        success: 'Categories saved',
        error: 'Failed to save categories',
        operationName: 'saveWizardStep2',
        invalidateQueries: [queryKeys.tickets.wizard.data()],
        showLoadingToast: false,
      }),
    });
  };

  // Save wizard step 3 mutation
  const useSaveWizardStep3 = () => {
    return useMutation({
      mutationFn: (data: WizardStep3Data) => saveWizardStep3(data),
      ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
        success: 'Images saved',
        error: 'Failed to save images',
        operationName: 'saveWizardStep3',
        invalidateQueries: [queryKeys.tickets.wizard.data()],
        showLoadingToast: false,
      }),
    });
  };

  // Upload temporary image mutation
  const useUploadTempImage = () => {
    return useMutation({
      mutationFn: (file: File) => uploadTempImage(file),
      ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
        loading: 'Uploading image...',
        success: 'Image uploaded',
        error: 'Failed to upload image',
        operationName: 'uploadTempImage',
      }),
    });
  };

  // Delete temporary image mutation
  const useDeleteTempImage = () => {
    return useMutation({
      mutationFn: (tempId: string) => deleteTempImage(tempId),
      ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
        success: 'Image removed',
        error: 'Failed to remove image',
        operationName: 'deleteTempImage',
        showLoadingToast: false,
      }),
    });
  };

  return {
    useSubmitTicket,
    useSaveWizardStep1,
    useSaveWizardStep2,
    useSaveWizardStep3,
    useUploadTempImage,
    useDeleteTempImage,
  };
}
