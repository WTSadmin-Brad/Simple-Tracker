/**
 * wizardSchemas.ts
 * Zod validation schemas for the ticket submission wizard
 */

import { z } from 'zod';
import { COLOR_THRESHOLDS } from '../constants/ticketCategories';

// Basic Info Step Schema
export const basicInfoSchema = z.object({
  date: z.string({
    required_error: "Date is required",
    invalid_type_error: "Date must be a string",
  }).refine((val) => {
    // Validate date format (YYYY-MM-DD)
    return /^\d{4}-\d{2}-\d{2}$/.test(val);
  }, {
    message: "Invalid date format. Use YYYY-MM-DD",
  }),
  
  truckId: z.string({
    required_error: "Truck is required",
    invalid_type_error: "Truck ID must be a string",
  }).min(1, "Please select a truck"),
  
  jobsiteId: z.string({
    required_error: "Jobsite is required",
    invalid_type_error: "Jobsite ID must be a string",
  }).min(1, "Please select a jobsite"),
});

// Categories Step Schema
export const categoriesSchema = z.record(
  z.string(),
  z.number({
    required_error: "Value is required",
    invalid_type_error: "Value must be a number",
  })
  .int("Value must be a whole number")
  .min(0, "Value cannot be negative")
  .max(COLOR_THRESHOLDS.MAX, `Value cannot exceed ${COLOR_THRESHOLDS.MAX}`)
).refine((data) => {
  // At least one category must have a value greater than 0
  return Object.values(data).some(value => value > 0);
}, {
  message: "At least one category must have a value greater than 0",
});

// Image Upload Schema
export const imageSchema = z.object({
  id: z.string(),
  url: z.string().url("Invalid image URL"),
  name: z.string().min(1, "Image name is required"),
  size: z.number().positive("Image size must be positive"),
  type: z.string().refine((val) => {
    // Validate image mime types
    return /^image\/(jpeg|png|gif|webp|heic|heif)$/.test(val);
  }, {
    message: "Invalid image type. Supported formats: JPEG, PNG, GIF, WebP, HEIC, HEIF",
  }),
  uploadedAt: z.string().datetime("Invalid upload timestamp"),
});

export const imageUploadSchema = z.object({
  images: z.array(imageSchema)
    .max(10, "Maximum 10 images allowed")
});

// Complete Wizard Schema (combines all steps)
export const completeWizardSchema = z.object({
  basicInfo: basicInfoSchema,
  categories: categoriesSchema,
  imageUpload: imageUploadSchema,
});

// Type definitions based on schemas
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type CategoriesData = z.infer<typeof categoriesSchema>;
export type ImageData = z.infer<typeof imageSchema>;
export type ImageUploadData = z.infer<typeof imageUploadSchema>;
export type CompleteWizardData = z.infer<typeof completeWizardSchema>;
