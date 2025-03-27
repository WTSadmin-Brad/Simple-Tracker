/**
 * Jobsite validation schemas
 * 
 * Zod schemas for validating jobsite-related requests and data
 */

import { z } from 'zod';

/**
 * Base schema for jobsite properties
 */
export const jobsiteBaseSchema = z.object({
  name: z.string()
    .min(1, 'Jobsite name is required')
    .max(100, 'Jobsite name cannot exceed 100 characters'),
  location: z.string()
    .optional()
    .default(''),
  active: z.boolean()
    .optional()
    .default(true),
});

/**
 * Schema for creating a new jobsite
 */
export const createJobsiteSchema = jobsiteBaseSchema;

/**
 * Schema for updating an existing jobsite
 */
export const updateJobsiteSchema = jobsiteBaseSchema.partial();

/**
 * Schema for bulk updating jobsites
 */
export const bulkUpdateJobsitesSchema = z.object({
  jobsiteIds: z.array(z.string())
    .min(1, 'At least one jobsite ID is required'),
  updates: updateJobsiteSchema,
});

/**
 * Schema for jobsite filter parameters
 */
export const jobsiteFilterSchema = z.object({
  active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().max(100).optional(),
});

// Type definitions derived from schemas
export type JobsiteData = z.infer<typeof jobsiteBaseSchema>;
export type CreateJobsiteData = z.infer<typeof createJobsiteSchema>;
export type UpdateJobsiteData = z.infer<typeof updateJobsiteSchema>;
export type BulkUpdateJobsitesData = z.infer<typeof bulkUpdateJobsitesSchema>;
export type JobsiteFilterParams = z.infer<typeof jobsiteFilterSchema>;
