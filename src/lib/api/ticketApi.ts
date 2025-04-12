/**
 * Ticket API client functions
 * Provides a clean interface for ticket-related API operations
 */

import { apiRequest, apiFormRequest, StandardResponse } from './apiClient';
import { Ticket, WizardData, WizardStep1Data, WizardStep2Data, WizardStep3Data, TempImageUploadResponse, TicketFilterParams } from '@/types/tickets';
import { TicketResponse, TicketsResponse, WizardStepResponse } from '@/types/api';

/**
 * API endpoints for ticket operations
 */
const ENDPOINTS = {
  TICKETS: '/api/tickets',
  TICKET: (id: string) => `/api/tickets/${id}`,
  WIZARD: '/api/tickets/wizard',
  WIZARD_STEP1: '/api/tickets/wizard/step1',
  WIZARD_STEP2: '/api/tickets/wizard/step2',
  WIZARD_STEP3: '/api/tickets/wizard/step3',
  WIZARD_COMPLETE: '/api/tickets/wizard/complete',
  TEMP_IMAGES: '/api/tickets/temp-images',
  TEMP_IMAGE: (id: string) => `/api/tickets/temp-images/${id}`,
};

/**
 * Submit a complete ticket
 * 
 * @param wizardData - Complete wizard data with all steps
 * @returns Promise with standardized response containing submitted ticket
 */
export async function submitTicket(
  wizardData: WizardData
): Promise<StandardResponse<Ticket>> {
  return apiRequest<Ticket>(ENDPOINTS.WIZARD_COMPLETE, {
    method: 'POST',
    body: wizardData
  });
}

/**
 * Save wizard step 1 data (Basic Info)
 * 
 * @param data - Step 1 data (date, truck, jobsite)
 * @returns Promise with standardized response
 */
export async function saveWizardStep1(
  data: WizardStep1Data
): Promise<StandardResponse<WizardStepResponse>> {
  return apiRequest<WizardStepResponse>(ENDPOINTS.WIZARD_STEP1, {
    method: 'POST',
    body: data
  });
}

/**
 * Save wizard step 2 data (Categories)
 * 
 * @param data - Step 2 data (categories with counts)
 * @returns Promise with standardized response
 */
export async function saveWizardStep2(
  data: WizardStep2Data
): Promise<StandardResponse<WizardStepResponse>> {
  return apiRequest<WizardStepResponse>(ENDPOINTS.WIZARD_STEP2, {
    method: 'POST',
    body: data
  });
}

/**
 * Save wizard step 3 data (Image Upload)
 * 
 * @param data - Step 3 data (image references)
 * @returns Promise with standardized response
 */
export async function saveWizardStep3(
  data: WizardStep3Data
): Promise<StandardResponse<WizardStepResponse>> {
  return apiRequest<WizardStepResponse>(ENDPOINTS.WIZARD_STEP3, {
    method: 'POST',
    body: data
  });
}

/**
 * Get saved wizard data
 * 
 * @returns Promise with standardized response containing wizard data
 */
export async function getWizardData(): Promise<StandardResponse<WizardData>> {
  return apiRequest<WizardData>(ENDPOINTS.WIZARD);
}

/**
 * Upload a temporary image for the wizard
 * 
 * @param file - Image file to upload
 * @returns Promise with standardized response containing temporary image data
 */
export async function uploadTempImage(
  file: File
): Promise<StandardResponse<TempImageUploadResponse>> {
  const formData = new FormData();
  formData.append('image', file);
  
  return apiFormRequest<TempImageUploadResponse>(ENDPOINTS.TEMP_IMAGES, formData);
}

/**
 * Delete a temporary image
 * 
 * @param tempId - Temporary image ID
 * @returns Promise with standardized response
 */
export async function deleteTempImage(
  tempId: string
): Promise<StandardResponse> {
  return apiRequest(ENDPOINTS.TEMP_IMAGE(tempId), {
    method: 'DELETE'
  });
}

/**
 * Get tickets with optional filtering
 * 
 * @param filters - Optional filters for tickets
 * @returns Promise with standardized response containing list of tickets
 */
export async function getTickets(
  filters: TicketFilterParams = {}
): Promise<StandardResponse<TicketsResponse>> {
  return apiRequest<TicketsResponse>(ENDPOINTS.TICKETS, {
    params: filters as any
  });
}

/**
 * Get a single ticket by ID
 * 
 * @param id - Ticket ID
 * @returns Promise with standardized response containing ticket data
 */
export async function getTicketById(
  id: string
): Promise<StandardResponse<TicketResponse>> {
  return apiRequest<TicketResponse>(ENDPOINTS.TICKET(id));
}
