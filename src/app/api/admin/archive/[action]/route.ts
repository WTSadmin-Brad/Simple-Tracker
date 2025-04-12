/**
 * Admin API - Archive Dynamic Handler
 * Various endpoints for archive management
 */

import { NextResponse } from 'next/server';
import { withAdminRole, handleApiError } from '@/lib/api/middleware'; // Changed import
import { AuthenticatedUser } from '@/types/api'; // Import AuthenticatedUser
import { createSuccessResponse, createPaginatedResponse } from '@/lib/api/responseUtils';
import { z } from 'zod';
import { 
  searchArchiveWithPagination, 
  paginationSchema 
} from '@/app/api/admin/archive/search/helpers';
import { 
  restoreArchivedData 
} from '@/app/api/admin/archive/restore/helpers';
import { 
  archiveImages, 
  fetchArchivedImageMetadata, 
  fetchArchivedImagesByTicket 
} from '@/app/api/admin/archive/images/helpers';
// Corrected schema import names to camelCase
import {
  archiveRestoreSchema,
  archiveImagesSchema,
  archiveSearchSchema
} from '@/lib/schemas/archiveSchemas';
// Removed: import { verifyAdminRole } from '@/app/api/admin/users/route';
import { ValidationError, ErrorCodes } from '@/lib/errors/error-types';

// GET handler for archive routes - mainly for search
// Updated to use withAdminRole and new handler signature
export const GET = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  const { searchParams } = new URL(request.url);
  // Extract action from pathname instead of full URL to avoid query params
  const pathname = new URL(request.url).pathname;
  const action = pathname.split('/').pop();
  
  try {
    // Admin role is verified by the wrapper
    // 2. Process the request based on action
    switch (action) {
      case 'search':
        return handleArchiveSearch(user.uid, searchParams); // Pass uid if needed by handler
        
      case 'images':
        const imageId = searchParams.get('imageId');
        const ticketId = searchParams.get('ticketId');
        
        if (imageId) {
          return handleGetArchivedImage(imageId);
        } else if (ticketId) {
          return handleGetArchivedTicketImages(ticketId);
        } else {
          throw new ValidationError(
            'Either imageId or ticketId is required',
            ErrorCodes.VALIDATION_REQUIRED_FIELD,
            400,
            { requiredParams: ['imageId', 'ticketId'] }
          );
        }
        
      default:
        throw new ValidationError(
          `Invalid archive action for GET: ${action}`,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400
        );
    }
  } catch (error) {
    return handleApiError(error, `Failed to process archive ${action}`);
  }
});

// POST handler for archive routes - restore and archive operations
// Updated to use withAdminRole and new handler signature
export const POST = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  // Extract action from pathname
  const pathname = new URL(request.url).pathname;
  const action = pathname.split('/').pop();

  try {
    // Admin role is verified by the wrapper
    // 2. Process the request based on action
    switch (action) {
      case 'images':
        return handleArchiveImagesRequest(request);
        
      case 'restore':
        return handleRestoreRequest(request);
        
      default:
        throw new ValidationError(
          `Invalid archive action for POST: ${action}`,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400
        );
    }
  } catch (error) {
    return handleApiError(error, `Failed to process archive ${action}`);
  }
});

// Archive search handler
async function handleArchiveSearch(userId: string, searchParams: URLSearchParams) {
  try {
    // Extract and validate query parameters
    const type = searchParams.get('type') || 'all';
    const query = searchParams.get('query') || '';
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    
    // Validate parameters
    const searchParamsData = archiveSearchSchema.merge(paginationSchema).parse({ // Use correct schema name
      type,
      query,
      dateFrom,
      dateTo,
      page,
      pageSize
    });
    
    // Call helper to perform search
    const results = await searchArchiveWithPagination(searchParamsData);
    
    // Return standardized paginated response
    return createPaginatedResponse(
      'Archive search completed successfully',
      results.items || [],
      'archiveItems',
      {
        page: results.pagination.page,
        pageSize: results.pagination.pageSize,
        totalItems: results.pagination.total, // Use 'total' property
        totalPages: results.pagination.totalPages
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid search parameters',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        error.format()
      );
    }
    throw error;
  }
}

// Archive images handler
async function handleArchiveImagesRequest(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate parameters
    const imagesData = archiveImagesSchema.parse(body); // Use correct schema name
    
    // Call helper to archive images
    const result = await archiveImages(imagesData);
    
    // Return standardized success response
    return createSuccessResponse(
      'Images archived successfully',
      result,
      'archiveResult'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid archive parameters',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        error.format()
      );
    }
    throw error;
  }
}

// Archive restore handler
async function handleRestoreRequest(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate parameters
    const restoreData = archiveRestoreSchema.parse(body); // Use correct schema name
    
    // Call helper to restore item
    const result = await restoreArchivedData(restoreData);
    
    // Return standardized success response
    return createSuccessResponse(
      'Archive item restored successfully',
      result,
      'restoreResult'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid restore parameters',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        error.format()
      );
    }
    throw error;
  }
}

// Get archived image metadata
async function handleGetArchivedImage(imageId: string) {
  try {
    const imageMetadata = await fetchArchivedImageMetadata(imageId);
    
    // Return standardized success response
    return createSuccessResponse(
      'Archived image retrieved successfully',
      imageMetadata,
      'image'
    );
  } catch (error) {
    throw error;
  }
}

// Get all archived images for a ticket
async function handleGetArchivedTicketImages(ticketId: string) {
  try {
    const images = await fetchArchivedImagesByTicket(ticketId);
    
    // Return standardized success response
    return createSuccessResponse(
      'Archived ticket images retrieved successfully',
      {
        images,
        count: images.length
      },
      'ticketImages'
    );
  } catch (error) {
    throw error;
  }
}
