/**
 * Admin API - Archive Dynamic Handler
 * Various endpoints for archive management
 */

import { NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
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
import { 
  ArchiveRestoreSchema,
  ArchiveImagesSchema, 
  ArchiveSearchSchema 
} from '@/lib/schemas/archiveSchemas';
import { verifyAdminRole } from '@/app/api/admin/users/route';

// GET handler for archive routes - mainly for search
export const GET = authenticateRequest(async (userId, request) => {
  const { searchParams } = new URL(request.url);
  const action = request.url.split('/').pop()?.split('?')[0];
  
  try {
    // 1. Verify admin role
    await verifyAdminRole(userId);
    
    // 2. Process the request based on action
    switch (action) {
      case 'search':
        return handleArchiveSearch(userId, searchParams);
        
      case 'images':
        const imageId = searchParams.get('imageId');
        const ticketId = searchParams.get('ticketId');
        
        if (imageId) {
          return handleGetArchivedImage(imageId);
        } else if (ticketId) {
          return handleGetArchivedTicketImages(ticketId);
        } else {
          return NextResponse.json(
            { success: false, message: 'Either imageId or ticketId is required' },
            { status: 400 }
          );
        }
        
      default:
        return NextResponse.json(
          { success: false, message: `Invalid archive action for GET: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    return handleApiError(error, `Failed to process archive ${action}`);
  }
});

// POST handler for archive routes - restore and archive operations
export const POST = authenticateRequest(async (userId, request) => {
  const action = request.url.split('/').pop()?.split('?')[0];
  
  try {
    // 1. Verify admin role
    await verifyAdminRole(userId);
    
    // 2. Process the request based on action
    switch (action) {
      case 'images':
        return handleArchiveImagesRequest(request);
        
      case 'restore':
        return handleRestoreRequest(request);
        
      default:
        return NextResponse.json(
          { success: false, message: `Invalid archive action for POST: ${action}` },
          { status: 400 }
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
    const searchParamsData = ArchiveSearchSchema.merge(paginationSchema).parse({
      type,
      query,
      dateFrom,
      dateTo,
      page,
      pageSize
    });
    
    // Call helper to perform search
    const results = await searchArchiveWithPagination(searchParamsData);
    
    return NextResponse.json({ 
      success: true,
      ...results
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid search parameters', errors: error.format() },
        { status: 400 }
      );
    }
    return handleApiError(error, 'Failed to search archives');
  }
}

// Archive images handler
async function handleArchiveImagesRequest(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate parameters
    const imagesData = ArchiveImagesSchema.parse(body);
    
    // Call helper to archive images
    const result = await archiveImages(imagesData);
    
    return NextResponse.json({ 
      success: true,
      ...result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid archive parameters', errors: error.format() },
        { status: 400 }
      );
    }
    return handleApiError(error, 'Failed to archive images');
  }
}

// Archive restore handler
async function handleRestoreRequest(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate parameters
    const restoreData = ArchiveRestoreSchema.parse(body);
    
    // Call helper to restore item
    const result = await restoreArchivedData(restoreData);
    
    return NextResponse.json({ 
      success: true,
      ...result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid restore parameters', errors: error.format() },
        { status: 400 }
      );
    }
    return handleApiError(error, 'Failed to restore archived item');
  }
}

// Get archived image metadata
async function handleGetArchivedImage(imageId: string) {
  try {
    const imageMetadata = await fetchArchivedImageMetadata(imageId);
    
    return NextResponse.json({ 
      success: true,
      image: imageMetadata
    });
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve archived image');
  }
}

// Get all archived images for a ticket
async function handleGetArchivedTicketImages(ticketId: string) {
  try {
    const images = await fetchArchivedImagesByTicket(ticketId);
    
    return NextResponse.json({ 
      success: true,
      images,
      count: images.length
    });
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve archived ticket images');
  }
}
