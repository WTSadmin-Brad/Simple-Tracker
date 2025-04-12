/**
 * Workdays API - Workday management
 * GET /api/workdays - Get workdays (with filtering options)
 * POST /api/workdays - Create a new workday
 * PUT /api/workdays - Update a workday (not used - use PUT /api/workdays/[id] instead)
 */

import { NextResponse } from 'next/server';
import { handleApiError, withAuthentication } from '@/lib/api/middleware'; // Changed import
import { AuthenticatedUser } from '@/types/api'; // Import AuthenticatedUser
import { createSuccessResponse, createPaginatedResponse } from '@/lib/api/responseUtils';
import workdayService from '@/lib/services/workdayService';
import { z } from 'zod';
import { ValidationError, ErrorCodes } from '@/lib/errors'; // Assuming index.ts exports these

/**
 * Schema for filtering workdays in GET requests
 */
const getWorkdaysSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  jobsite: z.string().optional(),
  workType: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortField: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema for creating a new workday in POST requests
 */
const createWorkdaySchema = z.object({
  date: z.string({
    required_error: "Date is required"
  }),
  jobsite: z.string({
    required_error: "Jobsite is required"
  }),
  jobsiteName: z.string({ // Make required to match CreateWorkdayData in service
    required_error: "Jobsite name is required"
  }),
  workType: z.enum(['full', 'half', 'off'], { // Use enum to match WorkdayType
    required_error: "Work type is required",
    errorMap: () => ({ message: "Work type must be 'full', 'half', or 'off'" })
  }),
});

/**
 * GET handler for retrieving workdays with filtering
 * 
 * @route GET /api/workdays
 * @authentication Required
 */
// Updated to use withAuthentication and new handler signature
export const GET = withAuthentication(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Parse URL parameters for filtering
    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Parse and validate filter parameters
    try {
      const filters = getWorkdaysSchema.parse({
        ...params,
        page: params.page ? parseInt(params.page) : undefined,
        limit: params.limit ? parseInt(params.limit) : undefined,
      });
      
      // Get all filtered workdays from the service
      const allWorkdays = await workdayService.getWorkdays({
        ...filters,
        userId: user.uid, // Pass validated filters and user ID
      });

      // Perform pagination on the results here in the route handler
      const page = filters.page || 1;
      const limit = filters.limit || 10; // Default page size
      const totalItems = allWorkdays.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedWorkdays = allWorkdays.slice(startIndex, endIndex);
      
      // Return standardized paginated response
      return createPaginatedResponse(
        'Workdays retrieved successfully',
        paginatedWorkdays, // Send only the slice for the current page
        'workdays',
        {
          page: page,
          pageSize: limit,
          totalItems: totalItems,
          totalPages: totalPages
        }
      );
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid filter parameters',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors // Keep original error details
        );
      }
      throw validationError;
    }
  } catch (error) {
    return handleApiError(error, 'Failed to fetch workdays');
  }
});

/**
 * POST handler for creating a new workday
 * 
 * @route POST /api/workdays
 * @authentication Required
 */
// Updated to use withAuthentication and new handler signature
export const POST = withAuthentication(async (request: Request, user: AuthenticatedUser) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    try {
      const data = createWorkdaySchema.parse(body);
      
      // Create workday with validated data
      // Pass userId from user context
      const workday = await workdayService.createWorkday(data, user.uid);
      
      // Return standardized response using our utility function
      return createSuccessResponse(
        'Workday created successfully',
        workday,
        'workday',
        { status: 201 }
      );
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid workday data',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors // Keep original error details
        );
      }
      throw validationError;
    }
  } catch (error) {
    return handleApiError(error, 'Failed to create workday');
  }
});

/**
 * PUT handler (preserved for backward compatibility)
 * 
 * @route PUT /api/workdays
 * @authentication Required
 * @deprecated Use PUT /api/workdays/[id] instead
 */
// Updated to use withAuthentication and new handler signature
export const PUT = withAuthentication(async (request: Request, user: AuthenticatedUser) => {
  try {
    throw new ValidationError(
      'Use PUT /api/workdays/[id] to update a specific workday',
      ErrorCodes.VALIDATION_INVALID_INPUT, // Use a more general validation code? Or define INVALID_ENDPOINT
      400
    );
  } catch (error) {
    return handleApiError(error, 'Failed to process request');
  }
});
