/**
 * useWizardApi.ts
 * Custom hook for handling wizard API calls with loading states and error handling
 */

import { useState } from 'react';
import { 
  BasicInfoData,
  CategoriesData,
  ImageUploadData,
  CompleteWizardData
} from '@/lib/validation/wizardSchemas';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
  ticketId?: string;
  errors?: Record<string, string>;
}

interface UseWizardApiReturn {
  isLoading: boolean;
  error: string | null;
  saveBasicInfo: (data: BasicInfoData) => Promise<boolean>;
  saveCategories: (data: CategoriesData) => Promise<boolean>;
  saveImageUpload: (data: ImageUploadData) => Promise<boolean>;
  completeWizard: (data: CompleteWizardData) => Promise<{ success: boolean; ticketId?: string }>;
  clearError: () => void;
}

export function useWizardApi(): UseWizardApiReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clearError = () => setError(null);
  
  const handleApiCall = async <T>(
    url: string, 
    data: T
  ): Promise<ApiResponse> => {
    setIsLoading(true);
    clearError();
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'An error occurred');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveBasicInfo = async (data: BasicInfoData): Promise<boolean> => {
    try {
      await handleApiCall('/api/tickets/wizard/step1', data);
      return true;
    } catch (error) {
      console.error('Failed to save basic info:', error);
      return false;
    }
  };
  
  const saveCategories = async (data: CategoriesData): Promise<boolean> => {
    try {
      await handleApiCall('/api/tickets/wizard/step2', data);
      return true;
    } catch (error) {
      console.error('Failed to save categories:', error);
      return false;
    }
  };
  
  const saveImageUpload = async (data: ImageUploadData): Promise<boolean> => {
    try {
      await handleApiCall('/api/tickets/wizard/step3', data);
      return true;
    } catch (error) {
      console.error('Failed to save image upload:', error);
      return false;
    }
  };
  
  const completeWizard = async (data: CompleteWizardData): Promise<{ success: boolean; ticketId?: string }> => {
    try {
      setIsLoading(true);
      const result = await handleApiCall('/api/tickets/wizard/complete', data);
      return { 
        success: true, 
        ticketId: result.ticketId 
      };
    } catch (error) {
      console.error('Failed to complete wizard:', error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    saveBasicInfo,
    saveCategories,
    saveImageUpload,
    completeWizard,
    clearError
  };
}
