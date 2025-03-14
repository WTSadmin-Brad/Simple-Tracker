/**
 * Ticket API client functions
 * 
 * @source directory-structure.md - "API client functions" section
 * @source Employee_Flows.md - "Ticket Submission Wizard Flow" section
 */

import { ApiResponse } from '../../types/api';
import { Ticket, WizardData, WizardStep1Data, WizardStep2Data, WizardStep3Data, TempImageUploadResponse } from '../../types/tickets';

/**
 * Base URL for ticket API endpoints
 */
const TICKET_API_BASE = '/api/tickets';
const WIZARD_API_BASE = '/api/tickets/wizard';

/**
 * Submit a complete ticket
 * 
 * @param wizardData - Complete wizard data with all steps
 * @returns Promise with submitted ticket data
 */
export async function submitTicket(
  wizardData: WizardData
): Promise<ApiResponse<Ticket>> {
  try {
    const response = await fetch(
      `${WIZARD_API_BASE}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(wizardData)
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to submit ticket');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit ticket'
    };
  }
}

/**
 * Save wizard step 1 data (Basic Info)
 * 
 * @param data - Step 1 data (date, jobsite, truck)
 * @returns Promise with success status
 */
export async function saveWizardStep1(
  data: WizardStep1Data
): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(
      `${WIZARD_API_BASE}/1`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to save step 1 data');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save step 1 data'
    };
  }
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
  try {
    const response = await fetch(
      `${WIZARD_API_BASE}/2`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to save step 2 data');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save step 2 data'
    };
  }
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
  try {
    const response = await fetch(
      `${WIZARD_API_BASE}/3`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to save step 3 data');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save step 3 data'
    };
  }
}

/**
 * Get saved wizard data
 * 
 * @returns Promise with saved wizard data or null if no data exists
 */
export async function getWizardData(): Promise<ApiResponse<WizardData>> {
  try {
    const response = await fetch(
      WIZARD_API_BASE,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to get wizard data');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get wizard data'
    };
  }
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
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(
      `${TICKET_API_BASE}/images/temp`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image'
    };
  }
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
  try {
    const response = await fetch(
      `${TICKET_API_BASE}/images/temp/${tempId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to delete image');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image'
    };
  }
}
