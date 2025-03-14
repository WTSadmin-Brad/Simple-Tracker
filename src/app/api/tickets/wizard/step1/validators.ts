/**
 * Basic Info Step Validators
 * Validates date, jobsite, and truck selection
 */
import { z } from 'zod';

// Basic Info validation schema
export const basicInfoSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  jobsiteId: z.string().min(1, 'Jobsite is required'),
  truckId: z.string().min(1, 'Truck is required'),
});

// Type for validated data
export type BasicInfoData = z.infer<typeof basicInfoSchema>;

// Validator function
export async function validateBasicInfo(data: unknown): Promise<BasicInfoData> {
  return basicInfoSchema.parseAsync(data);
}

// TODO: Implement integration with Firebase for data persistence
// TODO: Add validation for date range (can't be in the future)
// TODO: Add validation for active jobsites and trucks only
