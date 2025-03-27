/**
 * Workdays API - Workday management
 * GET /api/workdays - Get workdays (with filtering options)
 * POST /api/workdays - Create a new workday
 * PUT /api/workdays - Update a workday (not used - use PUT /api/workdays/[id] instead)
 */

import { NextResponse } from 'next/server';
import { handleApiError, authenticateRequest } from '@/lib/api/middleware';
import workdayService from '@/lib/services/workdayService';
import { z } from 'zod';
import { ValidationError, ErrorCodes } from '@/lib/errors/error-types';

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
  jobsiteName: z.string().optional(),
  workType: z.string({
    required_error: "Work type is required"
  }),
});

/**
 * GET handler for retrieving workdays with filtering
 * 
 * @route GET /api/workdays
 * @authentication Required
 */
export const GET = authenticateRequest(async (userId, request) => {
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
      
      // Get workdays with filtering from workday service
      const { workdays, pagination } = await workdayService.getWorkdays({
        ...filters,
        // Include user ID to filter by user
        userId,
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Workdays retrieved successfully',
        workdays,
        pagination
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid filter parameters',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors
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
export const POST = authenticateRequest(async (userId, request) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    
    try {
      const data = createWorkdaySchema.parse(body);
      
      // Create workday with validated data
      const workday = await workdayService.createWorkday(data, userId);
      
      return NextResponse.json({ 
        success: true,
        message: 'Workday created successfully',
        id: workday.id,
        ...workday
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        throw new ValidationError(
          'Invalid workday data',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          validationError.errors
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
export const PUT = authenticateRequest(async (userId, request) => {
  try {
    throw new ValidationError(
      'Use PUT /api/workdays/[id] to update a specific workday',
      ErrorCodes.VALIDATION_INVALID_ENDPOINT,
      400
    );
  } catch (error) {
    return handleApiError(error, 'Failed to process request');
  }
});
