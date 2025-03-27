/**
 * References API - Dynamic Handler
 * GET /api/references/[type] - Get reference data by type
 * POST /api/references/[type] - Update reference data for supported types
 */

import { NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
import { fetchActiveTrucks, fetchAllTrucks } from '../trucks/helpers';
import { fetchActiveJobsites, fetchAllJobsites } from '../jobsites/helpers';
import { ForbiddenError, NotFoundError, ValidationError, ErrorCodes } from '@/lib/errors/error-types';
import { z } from 'zod';
import { getUserPreferences, updateUserPreferences } from '../user-preferences/helpers';

// Supported reference types
const REFERENCE_TYPES = ['trucks', 'jobsites', 'user-preferences'];

// User preferences update schema
const userPreferencesSchema = z.object({
  defaultTruck: z.string().optional(),
  defaultJobsite: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.boolean().optional()
});

/**
 * GET handler for retrieving reference data by type
 * 
 * @route GET /api/references/[type]
 * @authentication Required
 */
export const GET = authenticateRequest(async (
  userId, 
  request: Request, 
  { params }: { params: { type: string } }
) => {
  try {
    const { type } = params;
    
    // Validate reference type
    if (!REFERENCE_TYPES.includes(type)) {
      throw new NotFoundError(
        `Invalid reference type: ${type}`,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { 
          resourceType: 'reference',
          requestedType: type,
          supportedTypes: REFERENCE_TYPES
        }
      );
    }
    
    // Extract query parameters
    const url = new URL(request.url);
    const includeInactive = url.searchParams.get('includeInactive') === 'true';
    
    // Handle different reference types based on the dynamic parameter
    switch (type) {
      case 'trucks':
        return handleTrucks(includeInactive);
      case 'jobsites':
        return handleJobsites(includeInactive);
      case 'user-preferences':
        return handleUserPreferencesGet(userId);
      default:
        // This should never happen due to the validation above
        throw new NotFoundError(
          `Reference type not implemented: ${type}`,
          ErrorCodes.RESOURCE_NOT_FOUND
        );
    }
  } catch (error) {
    return handleApiError(error, `Failed to fetch reference data`);
  }
});

/**
 * POST handler for updating reference data (currently only for user preferences)
 * 
 * @route POST /api/references/[type]
 * @authentication Required
 */
export const POST = authenticateRequest(async (
  userId, 
  request: Request, 
  { params }: { params: { type: string } }
) => {
  try {
    const { type } = params;
    
    // Validate reference type
    if (!REFERENCE_TYPES.includes(type)) {
      throw new NotFoundError(
        `Invalid reference type: ${type}`,
        ErrorCodes.RESOURCE_NOT_FOUND,
        { 
          resourceType: 'reference',
          requestedType: type,
          supportedTypes: REFERENCE_TYPES
        }
      );
    }
    
    if (type === 'user-preferences') {
      return handleUserPreferencesPost(userId, request);
    }
    
    throw new ForbiddenError(
      `POST not supported for reference type: ${type}`,
      ErrorCodes.OPERATION_NOT_SUPPORTED,
      { 
        resourceType: 'reference',
        requestedType: type,
        supportedMethods: ['GET'],
        requestedMethod: 'POST'
      }
    );
  } catch (error) {
    return handleApiError(error, `Failed to update reference data`);
  }
});

/**
 * Handles truck reference data requests
 * @param includeInactive - Whether to include inactive trucks
 * @returns NextResponse with truck data
 */
async function handleTrucks(includeInactive: boolean) {
  try {
    // Use the appropriate helper function based on the includeInactive flag
    const trucks = includeInactive 
      ? await fetchAllTrucks()
      : await fetchActiveTrucks();
      
    return NextResponse.json({ 
      success: true,
      message: 'Trucks fetched successfully',
      count: trucks.length,
      trucks
    });
  } catch (error) {
    throw error; // Will be caught by the main try/catch
  }
}

/**
 * Handles jobsite reference data requests
 * @param includeInactive - Whether to include inactive jobsites
 * @returns NextResponse with jobsite data
 */
async function handleJobsites(includeInactive: boolean) {
  try {
    // Use the appropriate helper function based on the includeInactive flag
    const jobsites = includeInactive
      ? await fetchAllJobsites()
      : await fetchActiveJobsites();
      
    return NextResponse.json({ 
      success: true,
      message: 'Jobsites fetched successfully',
      count: jobsites.length,
      jobsites
    });
  } catch (error) {
    throw error; // Will be caught by the main try/catch
  }
}

/**
 * Handles GET requests for user preferences
 * @param userId - The ID of the authenticated user
 * @returns NextResponse with user preferences data
 */
async function handleUserPreferencesGet(userId: string) {
  try {
    const preferences = await getUserPreferences(userId);
    
    return NextResponse.json({ 
      success: true,
      message: 'User preferences fetched successfully',
      preferences
    });
  } catch (error) {
    throw error; // Will be caught by the main try/catch
  }
}

/**
 * Handles POST requests for updating user preferences
 * @param userId - The ID of the authenticated user
 * @param request - The request object containing preference data
 * @returns NextResponse with updated preferences
 */
async function handleUserPreferencesPost(userId: string, request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body against the schema
    try {
      userPreferencesSchema.parse(body);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid user preferences data',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors
        );
      }
      throw validationError;
    }
    
    // Update user preferences
    const updatedPreferences = await updateUserPreferences(userId, body);
    
    return NextResponse.json({ 
      success: true,
      message: 'User preferences updated successfully',
      preferences: updatedPreferences
    });
  } catch (error) {
    throw error; // Will be caught by the main try/catch
  }
}
