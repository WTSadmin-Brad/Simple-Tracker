/**
 * Categories Step Validators
 * Validates the 6 counters with specific ranges
 */
import { z } from 'zod';
import { categoriesSchema, CategoriesData } from '@/lib/validation/wizardSchemas';

// Constants for category validation
export const TOTAL_COUNT_MIN = 1;
export const TOTAL_COUNT_MAX = 900;

// Validator function
export async function validateCategories(data: unknown): Promise<CategoriesData> {
  const validatedData = await categoriesSchema.parseAsync(data);
  
  // Additional validation for total counts
  const totalCount = calculateTotalCount(validatedData);
  
  if (totalCount < TOTAL_COUNT_MIN) {
    throw new Error('Total count must be at least 1 across all categories');
  }
  
  if (totalCount > TOTAL_COUNT_MAX) {
    throw new Error(`Total count cannot exceed ${TOTAL_COUNT_MAX}`);
  }
  
  return validatedData;
}

// Helper to calculate total count across all categories
export function calculateTotalCount(categories: CategoriesData): number {
  return Object.values(categories).reduce((sum, value) => sum + value, 0);
}

// Helper to determine counter color based on value
export function getCounterColor(value: number): string {
  if (value === 0) return 'red';
  if (value >= 1 && value <= 84) return 'yellow';
  if (value >= 85 && value <= 124) return 'green';
  return 'gold'; // 125-150
}
