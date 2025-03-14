/**
 * Categories Step Validators
 * Validates the 6 counters with specific ranges
 */
import { z } from 'zod';

// Categories validation schema
export const categoriesSchema = z.object({
  counter1: z.number().int().min(0).max(150),
  counter2: z.number().int().min(0).max(150),
  counter3: z.number().int().min(0).max(150),
  counter4: z.number().int().min(0).max(150),
  counter5: z.number().int().min(0).max(150),
  counter6: z.number().int().min(0).max(150),
});

// Type for validated data
export type CategoriesData = z.infer<typeof categoriesSchema>;

// Validator function
export async function validateCategories(data: unknown): Promise<CategoriesData> {
  return categoriesSchema.parseAsync(data);
}

// Helper to determine counter color based on value
export function getCounterColor(value: number): string {
  if (value === 0) return 'red';
  if (value >= 1 && value <= 84) return 'yellow';
  if (value >= 85 && value <= 124) return 'green';
  return 'gold'; // 125-150
}

// TODO: Add validation for total counts across all categories
// TODO: Implement integration with Firebase for data persistence
