/**
 * Admin Jobsite Detail API Route
 * 
 * Handles operations for a specific jobsite:
 * - GET: Retrieve detailed jobsite information
 * - PUT: Update jobsite details
 * - DELETE: Remove a specific jobsite
 */

import { NextResponse } from 'next/server';
import { 
  authenticateRequest, 
  validateRequest, 
  handleApiError 
} from '@/lib/api/middleware';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { fetchJobsiteById, jobsiteNameExists } from '../helpers';
import { updateJobsiteSchema } from '@/lib/validation/jobsiteSchemas';
import { ForbiddenError, NotFoundError, ErrorCodes } from '@/lib/errors/error-types';

/**
 * GET handler for retrieving detailed jobsite information
 * 
 * @route GET /api/admin/jobsites/:id
 * @authentication Required with admin role
 */
export const GET = authenticateRequest(async (userId, request, { params }: { params: { id: string } }) => {
  try {
    // 1. Verify admin role
    const auth = getAuthAdmin();
    const user = await auth.getUser(userId);
    
    const customClaims = user.customClaims || {};
    if (!customClaims.role || customClaims.role !== 'admin') {
      throw new ForbiddenError('Admin access required', ErrorCodes.AUTH_FORBIDDEN);
    }
    
    const { id } = params;
    
    // 2. Use helper function to fetch jobsite by ID
    const jobsite = await fetchJobsiteById(id);
    
    // 3. Return successful response
    return NextResponse.json({
      success: true,
      message: 'Jobsite retrieved successfully',
      ...jobsite
    });
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve jobsite details');
  }
});

/**
 * PUT handler for updating a specific jobsite
 * 
 * @route PUT /api/admin/jobsites/:id
 * @authentication Required with admin role
 */
export const PUT = authenticateRequest(async (userId, request, { params }: { params: { id: string } }) => {
  return validateRequest(updateJobsiteSchema, async (data) => {
    try {
      // 1. Verify admin role
      const auth = getAuthAdmin();
      const user = await auth.getUser(userId);
      
      const customClaims = user.customClaims || {};
      if (!customClaims.role || customClaims.role !== 'admin') {
        throw new ForbiddenError('Admin access required', ErrorCodes.AUTH_FORBIDDEN);
      }
      
      const { id } = params;
      
      // 2. Verify jobsite exists
      const jobsite = await fetchJobsiteById(id);
      
      // 3. Check if updating name and if it already exists (except for this jobsite)
      if (data.name && jobsite.name !== data.name && await jobsiteNameExists(data.name)) {
        throw new ForbiddenError(
          'Jobsite name already exists', 
          ErrorCodes.DATA_ALREADY_EXISTS, 
          409
        );
      }
      
      // 4. TODO: Implement jobsite update with Firestore
      // This is a placeholder until implementation is completed
      const firestore = getFirestoreAdmin();
      
      // 5. Return successful response
      return NextResponse.json({
        success: true,
        message: 'Jobsite updated successfully',
        id,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      return handleApiError(error, 'Failed to update jobsite');
    }
  })(request);
});

/**
 * DELETE handler for removing a specific jobsite
 * 
 * @route DELETE /api/admin/jobsites/:id
 * @authentication Required with admin role
 */
export const DELETE = authenticateRequest(async (userId, request, { params }: { params: { id: string } }) => {
  try {
    // 1. Verify admin role
    const auth = getAuthAdmin();
    const user = await auth.getUser(userId);
    
    const customClaims = user.customClaims || {};
    if (!customClaims.role || customClaims.role !== 'admin') {
      throw new ForbiddenError('Admin access required', ErrorCodes.AUTH_FORBIDDEN);
    }
    
    const { id } = params;
    
    // 2. Verify jobsite exists
    await fetchJobsiteById(id);
    
    // 3. TODO: Implement jobsite deletion with Firestore
    // This is a placeholder until implementation is completed
    // Consider soft-delete by setting active=false instead
    
    // 4. Return successful response
    return NextResponse.json({
      success: true,
      message: 'Jobsite deleted successfully',
      id,
      deletedAt: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete jobsite');
  }
});
