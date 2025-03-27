/**
 * Basic Info Step Validators
 * Validates date, jobsite, and truck selection
 */
import { z } from 'zod';
import { basicInfoSchema, BasicInfoData } from '@/lib/validation/wizardSchemas';
import { isPastDate } from '@/lib/helpers/dateHelpers';

// Validator function
export async function validateBasicInfo(data: unknown): Promise<BasicInfoData> {
  const validatedData = await basicInfoSchema.parseAsync(data);
  
  // Additional validation for date range - can't be in the future
  if (!isPastDate(validatedData.date) && !isToday(validatedData.date)) {
    throw new Error('Date cannot be in the future');
  }
  
  return validatedData;
}

// Utility function to check if date is today
function isToday(dateString: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const inputDate = new Date(dateString);
  inputDate.setHours(0, 0, 0, 0);
  
  return inputDate.getTime() === today.getTime();
}

// Helper function to check if jobsite is active
export async function isActiveJobsite(jobsiteId: string): Promise<boolean> {
  // In a real implementation, this would check against Firestore
  // For now, we assume all IDs are valid
  return jobsiteId.length > 0;
}

// Helper function to check if truck is active
export async function isActiveTruck(truckId: string): Promise<boolean> {
  // In a real implementation, this would check against Firestore
  // For now, we assume all IDs are valid
  return truckId.length > 0;
}
