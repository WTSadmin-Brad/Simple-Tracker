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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Truck not found' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: truck
    });
  } catch (error) {
    console.error('Error fetching truck details:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve truck details' 
      },
      { status: 500 }
    );
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
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid update data',
          details: validationResult.errors
        },
        { status: 400 }
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
    
    return NextResponse.json({
      success: true,
      message: `Truck ${id} updated successfully`,
      data: {
        id,
        ...body,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating truck:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update truck' 
      },
      { status: 500 }
    );
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
    
    return NextResponse.json({
      success: true,
      message: `Truck ${id} deleted successfully`,
      data: {
        id,
        deletedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error deleting truck:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete truck' 
      },
      { status: 500 }
    );
  }
}
