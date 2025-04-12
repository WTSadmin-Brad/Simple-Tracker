/**
 * Admin Trucks API Route
 * 
 * Handles admin operations for truck management:
 * - GET: Retrieve trucks with filtering and pagination
 * - POST: Create a new truck
 * - PUT: Update truck details
 * - DELETE: Remove a truck
 */

import { NextResponse } from 'next/server';
import { withAdminRole, handleApiError } from '@/lib/api/middleware'; // Changed import
import { AuthenticatedUser } from '@/types/api'; // Import AuthenticatedUser
import { createSuccessResponse, createPaginatedResponse } from '@/lib/api/responseUtils';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { 
  fetchTrucks, 
  createTruck, 
  truckNumberExists,
  TruckFilterParams,
  // Removed incorrect import: TRUCKS_COLLECTION
} from './helpers';
import { ValidationError, ErrorCodes, ForbiddenError, NotFoundError } from '@/lib/errors'; // Assuming index.ts exports these
import { z } from 'zod';

// Schema for creating/updating a truck
const truckSchema = z.object({
  number: z.string().min(1, { message: "Truck number is required" }),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  capacity: z.number().optional(),
  fuelType: z.string().optional(),
  isActive: z.boolean().default(true)
});

// Schema for batch updating trucks
const batchUpdateSchema = z.object({
  truckIds: z.array(z.string()).min(1, { message: "At least one truck ID is required" }),
  updates: truckSchema.partial()
});
// Define collection name locally
const TRUCKS_COLLECTION = 'trucks';

// Removed verifyAdminRole function (handled by wrapper)

/**
 * GET handler for retrieving trucks with filtering and pagination
 * 
 * @route GET /api/admin/trucks
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const GET = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Admin role is verified by the wrapper
    return await handleGetTrucks(request);
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve trucks');
  }
});

/**
 * POST handler for creating a new truck
 * 
 * @route POST /api/admin/trucks
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const POST = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Admin role is verified by the wrapper
    return await handleCreateTruck(user.uid, request); // Pass admin uid
  } catch (error) {
    return handleApiError(error, 'Failed to create truck');
  }
});

/**
 * PUT handler for updating trucks
 * 
 * @route PUT /api/admin/trucks
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const PUT = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Admin role is verified by the wrapper
    return await handleUpdateTrucks(user.uid, request); // Pass admin uid
  } catch (error) {
    return handleApiError(error, 'Failed to update trucks');
  }
});

/**
 * DELETE handler for removing a truck
 * 
 * @route DELETE /api/admin/trucks
 * @authentication Required with admin role
 */
// Updated to use withAdminRole and new handler signature
export const DELETE = withAdminRole(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Admin role is verified by the wrapper
    return await handleDeleteTruck(user.uid, request); // Pass admin uid
  } catch (error) {
    return handleApiError(error, 'Failed to delete truck');
  }
});

/**
 * Handle GET request for trucks with filtering
 * @param request - The HTTP request
 * @returns Response with trucks data
 */
async function handleGetTrucks(request: Request) {
  // Extract query parameters for filtering and pagination
  const url = new URL(request.url);
  
  // Build filter params from search parameters
  const filters: TruckFilterParams = {
    active: url.searchParams.has('active') ? url.searchParams.get('active') === 'true' : undefined,
    search: url.searchParams.get('search') || undefined,
    page: url.searchParams.get('page') ? parseInt(url.searchParams.get('page') || '1', 10) : undefined,
    pageSize: url.searchParams.get('pageSize') ? parseInt(url.searchParams.get('pageSize') || '10', 10) : undefined
  };
  
  // Use helper function to fetch trucks with filtering
  const { trucks, pagination } = await fetchTrucks(filters);
  
  // Return standardized response using utility function
  return createPaginatedResponse(
    'Trucks retrieved successfully',
    trucks,
    'trucks',
    {
      page: pagination.page || 1,
      pageSize: pagination.pageSize || 10,
      totalItems: pagination.total || 0, // Assuming helper returns 'total'
      totalPages: pagination.totalPages || 1
    }
  );
}

/**
 * Handle POST request for creating a new truck
 * @param userId - The admin's user ID
 * @param request - The HTTP request
 * @returns Response with created truck data
 */
async function handleCreateTruck(userId: string, request: Request) {
  // Parse request body
  const body = await request.json();
  
  try {
    // Validate truck data with Zod
    const validatedData = truckSchema.parse(body);
    
    // Check if truck number already exists
    if (await truckNumberExists(validatedData.number)) {
      throw new ValidationError(
        'Truck number already exists',
        ErrorCodes.DATA_ALREADY_EXISTS, // Correct Error Code
        409,
        { field: 'number', value: validatedData.number }
      );
    }
    
    // Add audit fields
    const truckData = {
      ...validatedData,
      createdAt: new Date().toISOString(),
      createdBy: userId,
      updatedAt: new Date().toISOString(),
      updatedBy: userId
    };
    
    // Use helper to create new truck
    const newTruck = await createTruck(truckData);
    
    // Return standardized response using utility function
    return createSuccessResponse(
      'Truck created successfully',
      newTruck,
      'truck',
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid truck data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: 'invalid_field'
        }))
      );
    }
    
    throw error;
  }
}

/**
 * Handle PUT request for updating trucks
 * @param userId - The admin's user ID
 * @param request - The HTTP request
 * @returns Response with update confirmation
 */
async function handleUpdateTrucks(userId: string, request: Request) {
  // Parse request body
  const body = await request.json();
  
  try {
    // Validate with Zod schema
    const validatedData = batchUpdateSchema.parse(body);
    const { truckIds, updates } = validatedData;
    
    // Get Firestore instance
    const db = getFirestoreAdmin();
    const batch = db.batch();
    
    // Track successful and failed updates
    const results = {
      successful: [] as string[],
      failed: [] as {id: string, reason: string}[]
    };
    
    // Process each truck in the batch
    for (const truckId of truckIds) {
      const truckRef = db.collection(TRUCKS_COLLECTION).doc(truckId);
      const truckSnapshot = await truckRef.get();
      
      if (!truckSnapshot.exists) {
        results.failed.push({
          id: truckId,
          reason: 'Truck not found'
        });
        continue;
      }
      
      // Prepare update data
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: userId
      };
      
      // Add to batch
      batch.update(truckRef, updateData);
      results.successful.push(truckId);
    }
    
    // Execute the batch
    await batch.commit();
    
    // Return standardized response using utility function
    return createSuccessResponse(
      `${results.successful.length} trucks updated successfully`,
      {
        updated: results.successful,
        failed: results.failed.length > 0 ? results.failed : undefined
      },
      'results'
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid update data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: 'invalid_field'
        }))
      );
    }
    
    throw error;
  }
}

/**
 * Handle DELETE request for removing a truck
 * @param userId - The admin's user ID
 * @param request - The HTTP request
 * @returns Response with deletion confirmation
 */
async function handleDeleteTruck(userId: string, request: Request) {
  const url = new URL(request.url);
  const truckId = url.searchParams.get('id');
  
  if (!truckId) {
    throw new ValidationError(
      'Truck ID is required',
      ErrorCodes.VALIDATION_REQUIRED_FIELD,
      400,
      { field: 'id' }
    );
  }
  
  // Get Firestore instance
  const db = getFirestoreAdmin();
  const truckRef = db.collection(TRUCKS_COLLECTION).doc(truckId);
  const truckSnapshot = await truckRef.get();
  
  if (!truckSnapshot.exists) {
    throw new NotFoundError(
      'Truck not found',
      ErrorCodes.DATA_NOT_FOUND, // Correct Error Code
      404, // Add missing status code
      { resourceType: 'truck', id: truckId } // Details object
    );
  }
  
  // Instead of deleting, we'll update to mark as deleted
  await truckRef.update({
    isActive: false,
    deletedAt: new Date().toISOString(),
    deletedBy: userId
  });
  
  // Return standardized response using utility function
  return createSuccessResponse(
    'Truck deleted successfully',
    {
      id: truckId,
      deletedAt: new Date().toISOString()
    },
    'truck'
  );
}
