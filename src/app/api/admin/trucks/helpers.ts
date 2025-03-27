/**
 * Admin Trucks Helpers
 * Utilities for truck management in the admin API
 */

import { FirestoreTruck } from '../../../../types/firebase';
import { queryTrucks, getTruckById, truckNumberExists as checkTruckNumberExists } from '../../../../lib/firebase/utils';
import { adminDb } from '../../../../lib/firebase/admin';

// Truck statistics structure
export interface TruckStats {
  ticketsSubmitted: number;
  lastUsed: string;
  assignedUsers: { username: string; name: string }[];
}

// Complete truck structure
export interface Truck {
  id: string;
  name: string;
  number: string;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  stats?: TruckStats;
}

// Filter parameters for truck queries
export interface TruckFilterParams {
  active?: boolean;
  search?: string; // For truck number or name search
  page?: number;
  pageSize?: number;
}

// Pagination structure
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Map FirestoreTruck to admin Truck interface with additional fields
function mapFirestoreTruckToAdminTruck(firestoreTruck: FirestoreTruck): Truck {
  return {
    id: firestoreTruck.id,
    name: firestoreTruck.name,
    number: firestoreTruck.truckId,
    active: firestoreTruck.isActive,
    createdAt: firestoreTruck.createdAt?.seconds 
      ? new Date(firestoreTruck.createdAt.seconds * 1000).toISOString()
      : new Date().toISOString(),
    updatedAt: firestoreTruck.updatedAt?.seconds
      ? new Date(firestoreTruck.updatedAt.seconds * 1000).toISOString()
      : null
  };
}

// Fetch trucks with filtering and pagination
export async function fetchTrucks(filters: TruckFilterParams): Promise<{ trucks: Truck[], pagination: Pagination }> {
  try {
    const { active, search = '', page = 1, pageSize = 10 } = filters;
    
    // Use the shared utility for basic querying
    const firestoreTrucks = await queryTrucks({
      activeOnly: active === true, // Only filter by active if explicitly true
      search,
      limit: pageSize * page, // Fetch all potential results up to the current page
      isAdmin: true // Use admin context
    });
    
    // Total count before pagination
    const total = firestoreTrucks.length;
    
    // Apply pagination manually (in a full implementation, this would be done in the Firestore query)
    const paginatedTrucks = firestoreTrucks.slice((page - 1) * pageSize, page * pageSize);
    
    // Map to admin Truck interface
    const trucks = paginatedTrucks.map(mapFirestoreTruckToAdminTruck);
    
    // Calculate pagination information
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      trucks,
      pagination: {
        total,
        page,
        pageSize,
        totalPages
      }
    };
  } catch (error) {
    console.error('Error fetching trucks:', error);
    // Return empty result in case of error
    return {
      trucks: [],
      pagination: {
        total: 0,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10,
        totalPages: 0
      }
    };
  }
}

// Fetch a specific truck by ID
export async function fetchTruckById(id: string): Promise<Truck | null> {
  try {
    // Use the shared utility
    const firestoreTruck = await getTruckById(id, true);
    
    if (!firestoreTruck) {
      return null;
    }
    
    // Map to admin Truck interface
    const truck = mapFirestoreTruckToAdminTruck(firestoreTruck);
    
    // In a real implementation, we would fetch additional statistics
    // For now, add some placeholder stats
    truck.stats = {
      ticketsSubmitted: 45,
      lastUsed: new Date().toISOString(),
      assignedUsers: [
        { username: 'johndoe', name: 'John Doe' },
        { username: 'janesmith', name: 'Jane Smith' }
      ]
    };
    
    return truck;
  } catch (error) {
    console.error('Error fetching truck by ID:', error);
    return null;
  }
}

// Create a new truck
export async function createTruck(truckData: Partial<Truck>): Promise<Truck> {
  // Validate truck data first
  const validation = validateTruckData(truckData);
  if (!validation.valid) {
    throw new Error(`Invalid truck data: ${validation.errors?.join(', ')}`);
  }
  
  // Check if truck number exists
  const exists = await truckNumberExists(truckData.number || '');
  if (exists) {
    throw new Error(`Truck number ${truckData.number} already exists`);
  }
  
  const now = new Date().toISOString();
  
  try {
    // Prepare the data for Firestore
    const newFirestoreTruck = {
      name: truckData.name || `Truck ${truckData.number || '???'}`,
      truckId: truckData.number || '',
      isActive: truckData.active ?? true,
      createdAt: adminDb.Timestamp.now(),
      updatedAt: null
    };
    
    // Add to Firestore
    const docRef = await adminDb.collection('trucks').add(newFirestoreTruck);
    
    // Get the new document with ID
    const doc = await docRef.get();
    
    // Return formatted truck
    return {
      id: doc.id,
      name: newFirestoreTruck.name,
      number: newFirestoreTruck.truckId,
      active: newFirestoreTruck.isActive,
      createdAt: now,
      updatedAt: null
    };
  } catch (error) {
    console.error('Error creating truck:', error);
    throw new Error('Failed to create truck');
  }
}

// Validate truck data
export function validateTruckData(data: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  // Name validation
  if (!data.name) {
    errors.push('Truck name is required');
  }
  
  // Number validation
  if (!data.number) {
    errors.push('Truck number is required');
  }
  
  return { 
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Check if truck number exists
export async function truckNumberExists(number: string): Promise<boolean> {
  try {
    // Use the shared utility
    return await checkTruckNumberExists(number, true);
  } catch (error) {
    console.error('Error checking truck number:', error);
    // Default to false to allow creation to proceed
    return false;
  }
}
