/**
 * Export Schemas
 * 
 * Centralized validation schemas for export functionality in Simple Tracker.
 * These schemas ensure consistent data validation across the application for
 * all export-related operations including:
 * - Parameter validation for export requests
 * - Format validation for export results
 * - Storage validation for export items
 */

import { z } from 'zod';

/**
 * Base export parameters schema
 * 
 * Common parameters shared across all export types
 */
const baseExportParamsSchema = z.object({
  format: z.enum(['csv', 'excel', 'json']),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  includeNotes: z.boolean().optional().default(true),
});

/**
 * Ticket export parameters schema
 * 
 * Parameters specific to ticket exports including
 * jobsite filtering and image inclusion options
 */
export const ticketExportParamsSchema = baseExportParamsSchema.extend({
  includeImages: z.boolean().optional().default(false),
  jobsiteId: z.string().optional(),
});

/**
 * Workday export parameters schema
 * 
 * Parameters specific to workday exports including
 * summary generation and employee/jobsite filtering
 */
export const workdayExportParamsSchema = baseExportParamsSchema.extend({
  includeSummary: z.boolean().optional().default(true),
  employeeId: z.string().optional(),
  jobsiteId: z.string().optional(),
});

/**
 * Create export request schema
 * 
 * Used for validating POST requests to create new export tasks
 * Combines parameters from both ticket and workday exports
 */
export const createExportSchema = z.object({
  type: z.enum(['tickets', 'workdays']),
  format: z.enum(['csv', 'excel', 'json']),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  includeImages: z.boolean().optional(),
  includeNotes: z.boolean().optional(),
  includeSummary: z.boolean().optional(),
  jobsiteId: z.string().optional(),
  employeeId: z.string().optional(),
});

/**
 * Export result schema
 * 
 * Used for validating the response when an export is generated
 * Contains the URL, filename, and metadata about the export
 */
export const exportResultSchema = z.object({
  success: z.boolean(),
  url: z.string().url().optional(),
  filename: z.string(),
  recordCount: z.number(),
  format: z.enum(['csv', 'excel', 'json']),
  generatedAt: z.string(),
  expiresAt: z.string(),
  storagePath: z.string().optional(),
});

/**
 * Export item schema
 * 
 * Used for validating stored export records in the database
 * Extends export result with additional fields for tracking status
 */
export const exportItemSchema = z.object({
  id: z.string(),
  type: z.enum(['tickets', 'workdays']),
  format: z.enum(['csv', 'excel', 'json']),
  url: z.string().url(),
  filename: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  recordCount: z.number(),
  status: z.enum(['completed', 'processing', 'error']),
  errorMessage: z.string().optional(),
  userId: z.string(),
  storagePath: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

// Types derived from schemas
export type TicketExportParams = z.infer<typeof ticketExportParamsSchema>;
export type WorkdayExportParams = z.infer<typeof workdayExportParamsSchema>;
export type CreateExportRequest = z.infer<typeof createExportSchema>;
export type ExportResult = z.infer<typeof exportResultSchema>;
export type ExportItem = z.infer<typeof exportItemSchema>;

/**
 * Schema for GET export query params
 * 
 * Used for validating query parameters when listing exports
 */
export const getExportQuerySchema = z.object({
  format: z.enum(['csv', 'excel', 'json']).default('csv'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

/**
 * Schema for export deletion requests
 * 
 * Used for validating DELETE requests to remove exports
 */
export const deleteExportSchema = z.object({
  id: z.string().min(1, 'Export ID is required'),
});
