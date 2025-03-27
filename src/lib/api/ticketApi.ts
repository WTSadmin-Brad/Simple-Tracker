/**
 * Ticket API client functions
 * Provides a clean interface for ticket-related API operations
 */

import { apiRequest, apiFormRequest } from './apiClient';
import { ApiResponse } from '@/types/api';
import { Ticket, WizardData, WizardStep1Data, WizardStep2Data, WizardStep3Data, TempImageUploadResponse, TicketFilterParams } from '@/types/tickets';

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
 * @returns Promise with submitted ticket data
 */
export async function submitTicket(
  wizardData: WizardData
): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(ENDPOINTS.WIZARD_COMPLETE, {
    method: 'POST',
    body: wizardData
  });
}

/**
 * Save wizard step 1 data (Basic Info)
 * 
 * @param data - Step 1 data (date, truck, jobsite)
 * @returns Promise with success status
 */
export async function saveWizardStep1(
  data: WizardStep1Data
): Promise<ApiResponse<void>> {
  return apiRequest<void>(ENDPOINTS.WIZARD_STEP1, {
    method: 'POST',
    body: data
  });
}

/**
 * Save wizard step 2 data (Categories)
 * 
 * @param data - Step 2 data (categories with counts)
 * @returns Promise with success status
 */
export async function saveWizardStep2(
  data: WizardStep2Data
): Promise<ApiResponse<void>> {
  return apiRequest<void>(ENDPOINTS.WIZARD_STEP2, {
    method: 'POST',
    body: data
  });
}

/**
 * Save wizard step 3 data (Image Upload)
 * 
 * @param data - Step 3 data (image references)
 * @returns Promise with success status
 */
export async function saveWizardStep3(
  data: WizardStep3Data
): Promise<ApiResponse<void>> {
  return apiRequest<void>(ENDPOINTS.WIZARD_STEP3, {
    method: 'POST',
    body: data
  });
}

/**
 * Get saved wizard data
 * 
 * @returns Promise with saved wizard data or null if no data exists
 */
export async function getWizardData(): Promise<ApiResponse<WizardData>> {
  return apiRequest<WizardData>(ENDPOINTS.WIZARD);
}

/**
 * Upload a temporary image for the wizard
 * 
 * @param file - Image file to upload
 * @returns Promise with temporary image data
 */
export async function uploadTempImage(
  file: File
): Promise<ApiResponse<TempImageUploadResponse>> {
  const formData = new FormData();
  formData.append('image', file);
  
  return apiFormRequest<TempImageUploadResponse>(ENDPOINTS.TEMP_IMAGES, formData);
}

/**
 * Delete a temporary image
 * 
 * @param tempId - Temporary image ID
 * @returns Promise with success status
 */
export async function deleteTempImage(
  tempId: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(ENDPOINTS.TEMP_IMAGE(tempId), {
    method: 'DELETE'
  });
}

/**
 * Get tickets with optional filtering
 * 
 * @param filters - Optional filters for tickets
 * @returns Promise with list of tickets
 */
export async function getTickets(
  filters: TicketFilterParams = {}
): Promise<ApiResponse<Ticket[]>> {
  return apiRequest<Ticket[]>(ENDPOINTS.TICKETS, {
    params: filters as any
  });
}

/**
 * Get a single ticket by ID
 * 
 * @param id - Ticket ID
 * @returns Promise with ticket data
 */
export async function getTicketById(
  id: string
): Promise<ApiResponse<Ticket>> {
  return apiRequest<Ticket>(ENDPOINTS.TICKET(id));
}
