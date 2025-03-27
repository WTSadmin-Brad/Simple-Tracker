/**
 * Archive Search Helpers
 * Utilities for searching archived data
 */

import { ArchiveSearchParams, ArchiveItem } from '@/lib/schemas/archiveSchemas';
import { searchArchive } from '@/lib/services/archiveService';
import { z } from 'zod';

// Schema for pagination
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  pageSize: z.number().int().min(1).max(100).optional().default(10)
});

// Interface for search parameters
export type ArchiveSearchOptions = ArchiveSearchParams & z.infer<typeof paginationSchema>;

// Interface for search results
export interface ArchiveSearchResult {
  items: ArchiveItem[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Search archived data with pagination
 * @param params Search parameters and pagination options
 * @returns Search results with pagination metadata
 */
export async function searchArchiveWithPagination(params: ArchiveSearchOptions): Promise<ArchiveSearchResult> {
  // Calculate offset from page and pageSize
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const offset = (page - 1) * pageSize;
  
  // Convert to service parameters
  const serviceParams: ArchiveSearchParams = {
    ...params,
    limit: pageSize,
    offset
  };
  
  // Call the archive service
  const result = await searchArchive(serviceParams);
  
  // Calculate total pages
  const totalPages = Math.ceil(result.total / pageSize);
  
  return {
    items: result.items,
    pagination: {
      total: result.total,
      page,
      pageSize,
      totalPages,
      hasMore: result.hasMore
    }
  };
}
