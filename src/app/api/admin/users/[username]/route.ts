/**
 * Admin User Detail API Route
 * 
 * Handles operations for a specific user:
 * - GET: Retrieve detailed user information
 * - PUT: Update user details
 * - DELETE: Remove a specific user
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchUserByUsername, validateUserData, deleteUser } from '../helpers';
import { createSuccessResponse } from '@/lib/api/responseUtils';
import { handleApiError } from '@/lib/api/middleware';
import { NotFoundError, ValidationError, ErrorCodes } from '@/lib/errors/error-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    
    // Use helper function to fetch user by username
    const user = await fetchUserByUsername(username);
    
    // Return 404 if user not found
    if (!user) {
      throw new NotFoundError(
        'User not found',
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { username }
      );
    }
    
    // Return standardized success response
    return createSuccessResponse(
      'User retrieved successfully',
      user,
      'user'
    );
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve user details');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const body = await request.json();
    
    // Validate update data
    const validationResult = validateUserData(body);
    if (!validationResult.valid) {
      throw new ValidationError(
        'Invalid update data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        validationResult.errors
      );
    }
    
    // Use helper function to check if user exists
    const existingUser = await fetchUserByUsername(username);
    if (!existingUser) {
      throw new NotFoundError(
        'User not found',
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { username }
      );
    }
    
    // TODO: Implement user update with Firestore
    // 1. Update allowed fields based on request body
    // 2. Add updatedAt and updatedBy metadata
    
    // Return standardized success response
    return createSuccessResponse(
      `User updated successfully`,
      {
        username,
        ...body,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current-admin' // Would come from auth context
      },
      'user'
    );
  } catch (error) {
    return handleApiError(error, 'Failed to update user');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    
    // Use helper function to delete user
    const result = await deleteUser(username);
    
    if (!result.success) {
      if (result.error === 'User not found') {
        throw new NotFoundError(
          'User not found',
          ErrorCodes.DATA_NOT_FOUND,
          404,
          { username }
        );
      } else {
        throw new Error(result.error || 'Failed to delete user');
      }
    }
    
    // Return standardized success response
    return createSuccessResponse(
      `User deleted successfully`,
      {
        username,
        deletedAt: result.deletedAt
      },
      'user'
    );
  } catch (error) {
    return handleApiError(error, 'Failed to delete user');
  }
}
