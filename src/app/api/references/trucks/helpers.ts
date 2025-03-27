/**
 * Trucks Reference Helpers
 * Bridge from the References API to shared Firebase utilities
 */

import { FirestoreTruck } from '../../../../types/firebase';
import { queryTrucks, getTruckById } from '../../../../lib/firebase/utils';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { NotFoundError, ErrorCodes } from '@/lib/errors/error-types';

// Firestore collection name
const TRUCKS_COLLECTION = 'trucks';

// Map from FirestoreTruck to the Truck interface expected by API consumers
export interface Truck {
  id: string;
  name: string;
  number: string;
  active: boolean;
}

/**
 * Convert FirestoreTruck to Truck interface
 * @param firestoreTruck - The Firestore truck document
 * @returns A truck object with standardized properties
 */
function mapFirestoreTruckToTruck(firestoreTruck: FirestoreTruck): Truck {
  return {
    id: firestoreTruck.id,
    name: firestoreTruck.name,
    number: firestoreTruck.truckId,
    active: firestoreTruck.isActive,
  };
}

/**
 * Fetch all trucks regardless of active status
 * @returns Array of truck objects
 * @throws Error if the database query fails
 */
export async function fetchAllTrucks(): Promise<Truck[]> {
  try {
    const trucks = await queryTrucks({ 
      activeOnly: false,
      isAdmin: false 
    });
    
    return trucks.map(mapFirestoreTruckToTruck);
  } catch (error) {
    console.error('Error fetching all trucks:', error);
    throw error;
  }
}

/**
 * Fetch only active trucks
 * @returns Array of active truck objects
 * @throws Error if the database query fails
 */
export async function fetchActiveTrucks(): Promise<Truck[]> {
  try {
    const trucks = await queryTrucks({ 
      activeOnly: true,
      isAdmin: false 
    });
    
    return trucks.map(mapFirestoreTruckToTruck);
  } catch (error) {
    console.error('Error fetching active trucks:', error);
    throw error;
  }
}

/**
 * Fetch a truck by its ID
 * @param id - The truck ID to fetch
 * @returns The truck object if found
 * @throws NotFoundError if the truck does not exist
 */
export async function fetchTruckById(id: string): Promise<Truck> {
  try {
    const truck = await getTruckById(id);
    
    if (!truck) {
      throw new NotFoundError(
        'Truck not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'truck', id }
      );
    }
    
    return mapFirestoreTruckToTruck(truck);
  } catch (error) {
    console.error(`Error fetching truck with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Check if a truck exists
 * @param id - The truck ID to check
 * @returns Boolean indicating whether the truck exists
 */
export async function truckExists(id: string): Promise<boolean> {
  try {
    const db = getFirestoreAdmin();
    const truckRef = db.collection(TRUCKS_COLLECTION).doc(id);
    const truckSnapshot = await truckRef.get();
    
    return truckSnapshot.exists;
  } catch (error) {
    console.error(`Error checking if truck with ID ${id} exists:`, error);
    return false;
  }
}

// TODO: Implement proper Firebase integration
// TODO: Add caching for frequently accessed truck data
// TODO: Implement pagination for large datasets
