/**
 * Individual Workday API
 * GET /api/workdays/[id] - Get a specific workday
 * PUT /api/workdays/[id] - Update a specific workday
 * DELETE /api/workdays/[id] - Delete a specific workday
 */

import { NextResponse } from 'next/server';
import { handleApiError, authenticateRequest } from '@/lib/api/middleware';
import workdayService from '@/lib/services/workdayService';
import { z } from 'zod';
import { ValidationError, NotFoundError, ForbiddenError, ErrorCodes } from '@/lib/errors/error-types';

/**
 * Schema for updating a workday
 */
const updateWorkdaySchema = z.object({
  workType: z.string().optional(),
  jobsite: z.string().optional(),
  jobsiteName: z.string().optional(),
});

/**
 * GET handler for retrieving a specific workday
 * 
 * @route GET /api/workdays/[id]
 * @authentication Required
 */
export const GET = authenticateRequest(async (
  userId,
  request, 
  { params }: { params: { id: string } }
) => {
  try {
    // Get workday ID from route params
    const { id } = params;
    
    if (!id) {
      throw new ValidationError(
        'Workday ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400
      );
    }
    
    // Get workday by ID
    const workday = await workdayService.getWorkdayById(id, userId);
    
    if (!workday) {
      throw new NotFoundError(
        'Workday not found',
        ErrorCodes.DATA_NOT_FOUND
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Workday retrieved successfully',
      ...workday,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch workday');
  }
});

/**
 * PUT handler for updating a specific workday
 * 
 * @route PUT /api/workdays/[id]
 * @authentication Required
 */
export const PUT = authenticateRequest(async (
  userId,
  request,
  { params }: { params: { id: string } }
) => {
  try {
    // Get workday ID from route params
    const { id } = params;
    
    if (!id) {
      throw new ValidationError(
        'Workday ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400
      );
    }
    
    // Parse and validate request body
    const body = await request.json();
    
    try {
      const data = updateWorkdaySchema.parse(body);
      
      // Check if workday exists and belongs to the user
      const existingWorkday = await workdayService.getWorkdayById(id, userId);
      
      if (!existingWorkday) {
        throw new NotFoundError(
          'Workday not found',
          ErrorCodes.DATA_NOT_FOUND
        );
      }
      
      // Check if workday is still editable
      const currentDate = new Date().toISOString().split('T')[0];
      if (existingWorkday.editableUntil < currentDate) {
        throw new ForbiddenError(
          'Workday is no longer editable',
          ErrorCodes.DATA_NOT_EDITABLE
        );
      }
      
      // Update workday
      const updatedWorkday = await workdayService.updateWorkday(id, data);
      
      return NextResponse.json({
        success: true,
        message: 'Workday updated successfully',
        ...updatedWorkday,
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
    return handleApiError(error, 'Failed to update workday');
  }
});

/**
 * DELETE handler for removing a specific workday
 * 
 * @route DELETE /api/workdays/[id]
 * @authentication Required
 */
export const DELETE = authenticateRequest(async (
  userId,
  request,
  { params }: { params: { id: string } }
) => {
  try {
    // Get workday ID from route params
    const { id } = params;
    
    if (!id) {
      throw new ValidationError(
        'Workday ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400
      );
    }
    
    // Check if workday exists and belongs to the user
    const existingWorkday = await workdayService.getWorkdayById(id, userId);
    
    if (!existingWorkday) {
      throw new NotFoundError(
        'Workday not found',
        ErrorCodes.DATA_NOT_FOUND
      );
    }
    
    // Check if workday is still editable
    const currentDate = new Date().toISOString().split('T')[0];
    if (existingWorkday.editableUntil < currentDate) {
      throw new ForbiddenError(
        'Workday is no longer editable',
        ErrorCodes.DATA_NOT_EDITABLE
      );
    }
    
    // Delete workday
    await workdayService.deleteWorkday(id);
    
    return NextResponse.json({
      success: true,
      message: 'Workday deleted successfully',
      id
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete workday');
  }
});
