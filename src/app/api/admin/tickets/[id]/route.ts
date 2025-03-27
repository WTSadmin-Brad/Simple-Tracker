/**
 * Admin Ticket Detail API Route
 * 
 * Handles operations for a specific ticket:
 * - GET: Retrieve detailed ticket information
 * - PUT: Update ticket status or details
 * - DELETE: Archive a specific ticket
 */

import { NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { fetchTicketById, validateTicketUpdate, archiveTicket } from '../helpers';
import { ForbiddenError, NotFoundError, ValidationError, ErrorCodes } from '@/lib/errors/error-types';
import { z } from 'zod';

// Firestore collection name
const TICKETS_COLLECTION = 'tickets';

// Schema for ticket updates
const ticketUpdateSchema = z.object({
  status: z.enum(['pending', 'in-progress', 'completed', 'rejected']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

/**
 * Verifies the user has admin role
 * @param userId User ID to verify
 * @throws ForbiddenError if user is not an admin
 */
async function verifyAdminRole(userId: string) {
  const auth = getAuthAdmin();
  const user = await auth.getUser(userId);
  
  const customClaims = user.customClaims || {};
  if (!customClaims.role || customClaims.role !== 'admin') {
    throw new ForbiddenError(
      'Admin access required',
      ErrorCodes.AUTH_INSUFFICIENT_PERMISSIONS,
      { 
        requiredRole: 'admin',
        userRole: customClaims.role || 'none'
      }
    );
  }
  
  return user;
}

/**
 * GET handler for retrieving detailed ticket information
 * 
 * @route GET /api/admin/tickets/:id
 * @authentication Required with admin role
 */
export const GET = authenticateRequest(async (
  userId,
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    // 1. Verify admin role
    await verifyAdminRole(userId);
    
    const { id } = params;
    
    // 2. Use helper function to fetch ticket by ID
    const ticket = await fetchTicketById(id);
    
    // 3. Return 404 if ticket not found
    if (!ticket) {
      throw new NotFoundError(
        'Ticket not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'ticket', id }
      );
    }
    
    // 4. Return successful response
    return NextResponse.json({
      success: true,
      message: 'Ticket retrieved successfully',
      ticket
    });
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve ticket details');
  }
});

/**
 * PUT handler for updating ticket status or details
 * 
 * @route PUT /api/admin/tickets/:id
 * @authentication Required with admin role
 */
export const PUT = authenticateRequest(async (
  userId,
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    // 1. Verify admin role
    const adminUser = await verifyAdminRole(userId);
    
    const { id } = params;
    
    // 2. Parse and validate request body
    const body = await request.json();
    
    try {
      ticketUpdateSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid update data',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors
        );
      }
      throw validationError;
    }
    
    // 3. Get Firestore instance
    const db = getFirestoreAdmin();
    
    // 4. Verify ticket exists
    const ticketRef = db.collection(TICKETS_COLLECTION).doc(id);
    const ticketSnapshot = await ticketRef.get();
    
    if (!ticketSnapshot.exists) {
      throw new NotFoundError(
        'Ticket not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'ticket', id }
      );
    }
    
    // 5. Prepare update data with history
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: {
        id: userId,
        email: adminUser.email || 'unknown',
        displayName: adminUser.displayName || 'Admin User'
      },
      history: [
        ...(ticketSnapshot.data()?.history || []),
        {
          action: 'update',
          timestamp: new Date().toISOString(),
          userId,
          changes: body
        }
      ]
    };
    
    // 6. Update the ticket
    await ticketRef.update(updateData);
    
    // 7. Return successful response
    return NextResponse.json({
      success: true,
      message: `Ticket ${id} updated successfully`,
      id,
      updatedAt: updateData.updatedAt,
      changes: body
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update ticket');
  }
});

/**
 * DELETE handler for archiving a specific ticket
 * 
 * @route DELETE /api/admin/tickets/:id
 * @authentication Required with admin role
 */
export const DELETE = authenticateRequest(async (
  userId,
  request: Request,
  { params }: { params: { id: string } }
) => {
  try {
    // 1. Verify admin role
    await verifyAdminRole(userId);
    
    const { id } = params;
    
    // 2. Use helper function to archive ticket
    const result = await archiveTicket(id);
    
    // 3. Handle unsuccessful archiving
    if (!result.success) {
      throw new NotFoundError(
        'Failed to archive ticket',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'ticket', id }
      );
    }
    
    // 4. Return successful response
    return NextResponse.json({
      success: true,
      message: `Ticket ${id} archived successfully`,
      id,
      archivedAt: result.archivedAt
    });
  } catch (error) {
    return handleApiError(error, 'Failed to archive ticket');
  }
});
