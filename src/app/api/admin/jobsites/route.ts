/**
 * Admin Jobsites API Route
 * 
 * Handles admin operations for jobsite management:
 * - GET: Retrieve jobsites with filtering and pagination
 * - POST: Create a new jobsite
 * - PUT: Update jobsite details
 * - DELETE: Remove a jobsite
 */

import { NextResponse } from 'next/server';
import { 
  withAdminRole, // Changed import
  handleApiError
} from '@/lib/api/middleware';
import { AuthenticatedUser } from '@/types/api'; // Import AuthenticatedUser
import { 
  createSuccessResponse, 
  createPaginatedResponse 
} from '@/lib/api/responseUtils';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { 
  fetchJobsites, 
  createJobsite, 
  jobsiteNameExists,
  // Removed incorrect import: JOBSITES_COLLECTION
} from './helpers';
import { 
  createJobsiteSchema, 
  updateJobsiteSchema, 
  bulkUpdateJobsitesSchema, 
  jobsiteFilterSchema 
} from '@/lib/validation/jobsiteSchemas';
import { ForbiddenError, ValidationError, NotFoundError, ErrorCodes } from '@/lib/errors'; // Assuming index.ts exports these
// Define collection name locally
const JOBSITES_COLLECTION = 'jobsites';

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
      ErrorCodes.AUTH_FORBIDDEN, // Correct Error Code
      403, // Add missing status code
      { // Details object
        requiredRole: 'admin',
        userRole: customClaims.role || 'none'
      }
    );
  }
  
  return user;
}

/**
 * GET handler for retrieving jobsites with filtering and pagination
 * 
 * @route GET /api/admin/jobsites
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const GET = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Admin role is verified by the wrapper
    return await handleGetJobsites(request);
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve jobsites');
  }
});

/**
 * POST handler for creating a new jobsite
 * 
 * @route POST /api/admin/jobsites
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const POST = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Admin role is verified by the wrapper
    return await handleCreateJobsite(user.uid, request); // Pass admin uid
  } catch (error) {
    return handleApiError(error, 'Failed to create jobsite');
  }
});

/**
 * PUT handler for updating jobsites
 * 
 * @route PUT /api/admin/jobsites
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const PUT = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Admin role is verified by the wrapper
    return await handleUpdateJobsites(user.uid, request); // Pass admin uid
  } catch (error) {
    return handleApiError(error, 'Failed to update jobsites');
  }
});

/**
 * DELETE handler for removing a jobsite
 * 
 * @route DELETE /api/admin/jobsites
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const DELETE = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Admin role is verified by the wrapper
    return await handleDeleteJobsite(user.uid, request); // Pass admin uid
  } catch (error) {
    return handleApiError(error, 'Failed to delete jobsite');
  }
});

/**
 * Handle GET request for jobsites with filtering
 * @param request - The HTTP request
 * @returns Response with jobsites data
 */
async function handleGetJobsites(request: Request) {
  // 1. Extract query parameters for filtering and pagination
  const searchParams = new URL(request.url).searchParams;
  
  // 2. Build filter params from search parameters
  const filters = {
    active: searchParams.has('active') ? searchParams.get('active') === 'true' : undefined,
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') ? parseInt(searchParams.get('page') || '1', 10) : undefined,
    pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize') || '10', 10) : undefined
  };
  
  // 3. Validate filter parameters
  const validatedFilters = jobsiteFilterSchema.parse(filters);
  
  // 4. Use helper function to fetch jobsites with filtering
  const { jobsites, pagination } = await fetchJobsites(validatedFilters);
  
  // 5. Return successful response using utility function
  return createPaginatedResponse(
    'Jobsites retrieved successfully',
    jobsites,
    'jobsites',
    {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
      totalItems: pagination.total || 0, // Use 'total' property if that's what fetchJobsites returns
      totalPages: pagination.totalPages || 1
    }
  );
}

/**
 * Handle POST request for creating a new jobsite
 * @param userId - The admin's user ID
 * @param request - The HTTP request
 * @returns Response with created jobsite data
 */
async function handleCreateJobsite(userId: string, request: Request) {
  // 1. Parse and validate request body
  const body = await request.json();
  const data = createJobsiteSchema.parse(body);
  
  // 2. Check if jobsite name already exists
  const { name } = data;
  
  if (await jobsiteNameExists(name)) {
    throw new ValidationError(
      'Jobsite name already exists',
      ErrorCodes.DATA_ALREADY_EXISTS, // Correct Error Code
      409,
      { field: 'name', value: name }
    );
  }
  
  // 3. Add audit fields
  const jobsiteData = {
    ...data,
    createdAt: new Date().toISOString(),
    createdBy: userId,
    updatedAt: new Date().toISOString(),
    updatedBy: userId
  };
  
  // 4. Use helper to create new jobsite
  const newJobsite = await createJobsite(jobsiteData);
  
  // 5. Return successful response using utility function
  return createSuccessResponse(
    'Jobsite created successfully',
    newJobsite,
    'jobsite',
    { status: 201 }
  );
}

/**
 * Handle PUT request for updating jobsites
 * @param userId - The admin's user ID
 * @param request - The HTTP request
 * @returns Response with update confirmation
 */
async function handleUpdateJobsites(userId: string, request: Request) {
  // 1. Parse and validate request body
  const body = await request.json();
  const data = bulkUpdateJobsitesSchema.parse(body);
  
  // 2. Destructure fields from validated data
  const { jobsiteIds, updates } = data;
  
  // 3. Get Firestore instance
  const db = getFirestoreAdmin();
  const batch = db.batch();
  
  // 4. Track successful and failed updates
  const results = {
    successful: [] as string[],
    failed: [] as {id: string, reason: string}[]
  };
  
  // 5. Process each jobsite in the batch
  for (const jobsiteId of jobsiteIds) {
    const jobsiteRef = db.collection(JOBSITES_COLLECTION).doc(jobsiteId);
    const jobsiteSnapshot = await jobsiteRef.get();
    
    if (!jobsiteSnapshot.exists) {
      results.failed.push({
        id: jobsiteId,
        reason: 'Jobsite not found'
      });
      continue;
    }
    
    // 6. Prepare update data
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };
    
    // 7. Add to batch
    batch.update(jobsiteRef, updateData);
    results.successful.push(jobsiteId);
  }
  
  // 8. Execute the batch
  await batch.commit();
  
  // 9. Return successful response using utility function
  return createSuccessResponse(
    `${results.successful.length} jobsites updated successfully`,
    {
      updated: results.successful,
      failed: results.failed.length > 0 ? results.failed : undefined
    },
    'results'
  );
}

/**
 * Handle DELETE request for removing a jobsite
 * @param userId - The admin's user ID
 * @param request - The HTTP request
 * @returns Response with deletion confirmation
 */
async function handleDeleteJobsite(userId: string, request: Request) {
  // 1. Extract jobsite ID from query parameters
  const searchParams = new URL(request.url).searchParams;
  const jobsiteId = searchParams.get('id');
  
  if (!jobsiteId) {
    throw new ValidationError(
      'Jobsite ID is required',
      ErrorCodes.VALIDATION_REQUIRED_FIELD,
      400,
      { field: 'id' }
    );
  }
  
  // 2. Get Firestore instance
  const db = getFirestoreAdmin();
  const jobsiteRef = db.collection(JOBSITES_COLLECTION).doc(jobsiteId);
  const jobsiteSnapshot = await jobsiteRef.get();
  
  if (!jobsiteSnapshot.exists) {
    throw new NotFoundError(
      'Jobsite not found',
      ErrorCodes.DATA_NOT_FOUND, // Correct Error Code
      404, // Add missing status code
      { resourceType: 'jobsite', id: jobsiteId } // Details object
    );
  }
  
  // 3. Instead of deleting, we'll update to mark as inactive/deleted
  await jobsiteRef.update({
    isActive: false,
    deletedAt: new Date().toISOString(),
    deletedBy: userId
  });
  
  // 4. Return successful response using utility function
  return createSuccessResponse(
    'Jobsite deleted successfully',
    {
      id: jobsiteId,
      deletedAt: new Date().toISOString()
    },
    'jobsite'
  );
}
