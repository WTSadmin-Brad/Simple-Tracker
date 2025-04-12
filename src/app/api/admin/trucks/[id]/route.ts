/**
 * Admin Truck Detail API Route
 * 
 * Handles operations for a specific truck:
 * - GET: Retrieve detailed truck information
 * - PUT: Update truck details
 * - DELETE: Remove a specific truck
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchTruckById, validateTruckData, truckNumberExists } from '../helpers';
import { createSuccessResponse } from '@/lib/api/responseUtils';
import { handleApiError } from '@/lib/api/middleware';
import { NotFoundError, ValidationError, ErrorCodes } from '@/lib/errors/error-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Use helper function to fetch truck by ID
    const truck = await fetchTruckById(id);
    
    // Return 404 if truck not found
    if (!truck) {
      throw new NotFoundError(
        'Truck not found',
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { id }
      );
    }
    
    // Return standardized success response
    return createSuccessResponse(
      'Truck retrieved successfully',
      truck,
      'truck'
    );
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve truck details');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate update data
    const validationResult = validateTruckData(body);
    if (!validationResult.valid) {
      throw new ValidationError(
        'Invalid update data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        validationResult.errors
      );
    }
    
    // Check if updating number and if it already exists (except for this truck)
    if (body.number && await truckNumberExists(body.number)) {
      // TODO: Check if the number belongs to a different truck
      // For now, we'll just warn about potential conflict
      console.warn(`Truck number ${body.number} may already be in use by another truck`);
    }
    
    // TODO: Implement truck update with Firestore
    // 1. Query Firestore for the specific truck
    // 2. Update allowed fields
    // 3. Add updatedAt timestamp
    
    // Return standardized success response
    return createSuccessResponse(
      `Truck updated successfully`,
      {
        id,
        ...body,
        updatedAt: new Date().toISOString()
      },
      'truck'
    );
  } catch (error) {
    return handleApiError(error, 'Failed to update truck');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // TODO: Implement truck deletion with Firestore
    // 1. Check if truck exists before attempting to delete
    // 2. Consider soft-delete by setting active=false instead
    
    // Return standardized success response
    return createSuccessResponse(
      `Truck deleted successfully`,
      {
        id,
        deletedAt: new Date().toISOString()
      },
      'truck'
    );
  } catch (error) {
    return handleApiError(error, 'Failed to delete truck');
  }
}
