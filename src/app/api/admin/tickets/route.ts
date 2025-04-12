/**
 * Admin Tickets API Route
 * 
 * Handles admin operations for ticket management:
 * - GET: Retrieve tickets with filtering and pagination
 * - PUT: Update ticket status or details
 * - DELETE: Archive a ticket
 */

import { NextResponse } from 'next/server';
import { withAdminRole, handleApiError } from '@/lib/api/middleware'; // Changed import
import { AuthenticatedUser } from '@/types/api'; // Import AuthenticatedUser
import { createSuccessResponse, createPaginatedResponse } from '@/lib/api/responseUtils';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { 
  fetchTickets, 
  validateTicketUpdate, 
  archiveTicket,
  TicketFilterParams
} from './helpers';
import { ForbiddenError, ValidationError, NotFoundError, ErrorCodes } from '@/lib/errors'; // Assuming index.ts exports these
import { z } from 'zod';

// Collections
const TICKETS_COLLECTION = 'tickets';

// Ticket update schema
const ticketUpdateSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'completed', 'rejected']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

// Batch update schema
const batchUpdateSchema = z.object({
  ticketIds: z.array(z.string()).min(1, { message: "At least one ticket ID is required" }),
  updates: ticketUpdateSchema
});

// Removed verifyAdminRole function (handled by wrapper)
/**
 * GET handler for retrieving tickets with filtering and pagination
 * 
 * @route GET /api/admin/tickets
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const GET = withAdminRole(async (
  request: Request,
  user: AuthenticatedUser // Use AuthenticatedUser context
) => {
  try {
    // Admin role is verified by the wrapper
    return await handleGetTickets(request);
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve tickets');
  }
});

/**
 * PUT handler for batch updating tickets
 * 
 * @route PUT /api/admin/tickets
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const PUT = withAdminRole(async (
  request: Request,
  user: AuthenticatedUser // Use AuthenticatedUser context
) => {
  try {
    // Admin role is verified by the wrapper
    // Note: handleBatchUpdateTickets needs the full admin user record,
    // but our wrapper only provides uid/role. We might need to fetch the user record here
    // or modify handleBatchUpdateTickets to only require uid/role.
    // For now, passing the limited user object. This might require further adjustment.
    const adminUserInfo = { id: user.uid, email: '', displayName: 'Admin' }; // Placeholder for now
    return await handleBatchUpdateTickets(user.uid, adminUserInfo, request);
  } catch (error) {
    return handleApiError(error, 'Failed to update tickets');
  }
});

/**
 * DELETE handler for archiving a ticket
 * 
 * @route DELETE /api/admin/tickets
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const DELETE = withAdminRole(async (
  request: Request,
  user: AuthenticatedUser // Use AuthenticatedUser context
) => {
  try {
    // Admin role is verified by the wrapper
    return await handleDeleteTicket(request);
  } catch (error) {
    return handleApiError(error, 'Failed to archive ticket');
  }
});

/**
 * Handle GET request for tickets with filtering
 * @param request - The HTTP request
 * @returns Response with tickets data
 */
async function handleGetTickets(request: Request) {
  // 1. Extract query parameters for filtering and pagination
  const url = new URL(request.url);
  
  // 2. Build filter params from search parameters
  const filters: TicketFilterParams = {
    status: url.searchParams.get('status') || undefined,
    jobsite: url.searchParams.get('jobsite') || undefined,
    truck: url.searchParams.get('truck') || undefined,
    startDate: url.searchParams.get('startDate') || undefined,
    endDate: url.searchParams.get('endDate') || undefined,
    userId: url.searchParams.get('userId') || undefined,
    page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page') || '1', 10) : undefined,
    pageSize: url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize') || '10', 10) : undefined
  };
  
  // 3. Use helper function to fetch tickets with filtering
  const { tickets, pagination } = await fetchTickets(filters);
  
  // 4. Return standardized response using utility function
  return createPaginatedResponse(
    'Tickets retrieved successfully',
    tickets,
    'tickets',
    {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
      totalItems: pagination.total || 0, // Assuming helper returns 'total'
      totalPages: pagination.totalPages || 1
    }
  );
}

/**
 * Handle PUT request for batch updating tickets
 * @param userId - The authenticated user ID
 * @param adminUser - The admin user object
 * @param request - The HTTP request
 * @returns Response with update confirmation
 */
async function handleBatchUpdateTickets(userId: string, adminUser: any, request: Request) {
  // 1. Parse request body
  const body = await request.json();
  
  // 2. Validate the body against the schema
  try {
    const validatedData = batchUpdateSchema.parse(body);
    const { ticketIds, updates } = validatedData;
    
    // 3. Get Firestore instance
    const db = getFirestoreAdmin();
    const batch = db.batch();
    
    // 4. Track successful and failed updates
    const results = {
      successful: [] as string[],
      failed: [] as {id: string, reason: string}[]
    };
    
    // 5. Process each ticket in the batch
    for (const ticketId of ticketIds) {
      const ticketRef = db.collection(TICKETS_COLLECTION).doc(ticketId);
      const ticketSnapshot = await ticketRef.get();
      
      if (!ticketSnapshot.exists) {
        results.failed.push({
          id: ticketId,
          reason: 'Ticket not found'
        });
        continue;
      }
      
      // 6. Prepare update data with history
      const ticketData = ticketSnapshot.data() || {};
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: {
          id: userId,
          email: adminUser.email || 'unknown',
          displayName: adminUser.displayName || 'Admin User'
        },
        history: [
          ...(ticketData.history || []),
          {
            action: 'update',
            timestamp: new Date().toISOString(),
            userId,
            changes: updates
          }
        ]
      };
      
      // 7. Add to batch
      batch.update(ticketRef, updateData);
      results.successful.push(ticketId);
    }
    
    // 8. Execute the batch
    await batch.commit();
    
    // 9. Return standardized response using utility function
    return createSuccessResponse(
      `${results.successful.length} tickets updated successfully`,
      {
        updated: results.successful,
        failed: results.failed.length > 0 ? results.failed : undefined
      },
      'results'
    );
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid update data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        validationError.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: 'invalid_field'
        }))
      );
    }
    throw validationError;
  }
}

/**
 * Handle DELETE request for archiving a ticket
 * @param request - The HTTP request
 * @returns Response with archiving confirmation
 */
async function handleDeleteTicket(request: Request) {
  // 1. Extract query parameters
  const url = new URL(request.url);
  const ticketId = url.searchParams.get('id');
  
  if (!ticketId) {
    throw new ValidationError(
      'Ticket ID is required',
      ErrorCodes.VALIDATION_REQUIRED_FIELD,
      400,
      { field: 'id' }
    );
  }
  
  // 2. Use helper function to archive ticket
  const result = await archiveTicket(ticketId);
  
  if (!result.success) {
    throw new NotFoundError(
      'Failed to archive ticket',
      ErrorCodes.DATA_NOT_FOUND, // Correct Error Code
      404, // Add missing status code
      { resourceType: 'ticket', id: ticketId } // Details object
    );
  }
  
  // 3. Return standardized response using utility function
  return createSuccessResponse(
    'Ticket archived successfully',
    {
      id: ticketId,
      archivedAt: result.archivedAt
    },
    'ticket'
  );
}
