/**
 * Archive Schemas
 * 
 * Zod schemas for validating archive-related operations
 */

import { z } from 'zod';

// Schema for archive search parameters
export const archiveSearchSchema = z.object({
  type: z.enum(['all', 'tickets', 'workdays', 'images'], {
    errorMap: () => ({ message: "Type must be one of: all, tickets, workdays, images" })
  }),
  startDate: z.string().optional()
    .refine(
      (date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 
      { message: "Start date must be in YYYY-MM-DD format" }
    ),
  endDate: z.string().optional()
    .refine(
      (date) => !date || /^\d{4}-\d{2}-\d{2}$/.test(date), 
      { message: "End date must be in YYYY-MM-DD format" }
    ),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
  query: z.string().optional(),
  metadataFilters: z.record(z.string()).optional()
});

// Schema for archive restore operation
export const archiveRestoreSchema = z.object({
  id: z.string().min(1, { message: "Archive ID is required" }),
  type: z.enum(['ticket', 'workday', 'image'], {
    errorMap: () => ({ message: "Type must be one of: ticket, workday, image" })
  }),
  destinationCollection: z.string().optional()
});

// Schema for archive image operation
export const archiveImagesSchema = z.object({
  ids: z.array(z.string()).min(1, { message: "At least one image ID is required" }),
  ticketId: z.string().min(1, { message: "Ticket ID is required" }),
  retentionPeriod: z.number().int().min(1).optional().default(365) // Default to 1 year
});

// Export type definitions based on schemas
export type ArchiveSearchParams = z.infer<typeof archiveSearchSchema>;
export type ArchiveRestoreParams = z.infer<typeof archiveRestoreSchema>;
export type ArchiveImagesParams = z.infer<typeof archiveImagesSchema>;

// Common archive item structure
export const archiveItemSchema = z.object({
  id: z.string(),
  type: z.enum(['ticket', 'workday', 'image']),
  originalId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  date: z.string(), // ISO date string
  archivedAt: z.string(), // ISO date string
  archivedBy: z.string(), // User ID
  metadata: z.record(z.any()).optional(),
  status: z.enum(['archived', 'restored']).default('archived')
});

export type ArchiveItem = z.infer<typeof archiveItemSchema>;
