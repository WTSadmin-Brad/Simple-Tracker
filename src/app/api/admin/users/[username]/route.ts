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
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve user details' 
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid update data',
          details: validationResult.errors
        },
        { status: 400 }
      );
    }
    
    // Use helper function to check if user exists
    const existingUser = await fetchUserByUsername(username);
    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not found' 
        },
        { status: 404 }
      );
    }
    
    // TODO: Implement user update with Firestore
    // 1. Update allowed fields based on request body
    // 2. Add updatedAt and updatedBy metadata
    
    return NextResponse.json({
      success: true,
      message: `User ${username} updated successfully`,
      data: {
        username,
        ...body,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current-admin' // Would come from auth context
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update user' 
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to delete user'
        },
        { status: result.error === 'User not found' ? 404 : 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `User ${username} deleted successfully`,
      data: {
        username,
        deletedAt: result.deletedAt
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete user' 
      },
      { status: 500 }
    );
  }
}
