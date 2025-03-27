/**
 * Firebase Truck Utilities
 * 
 * Shared utility functions for truck operations that can be used by both
 * admin and references APIs. These functions provide a consistent way to
 * access truck data while maintaining separation of concerns.
 */

import { FirestoreTruck } from '../../../types/firebase';
import { db } from '../client'; // For client-side operations
import { adminDb } from '../admin'; // For admin operations

/**
 * Base function to query trucks with filters
 * 
 * @param options Query options including active status filter
 * @param isAdmin Whether this is being called from an admin context
 * @returns Promise with array of truck data
 */
export async function queryTrucks({ 
  activeOnly = true,
  search = '',
  limit = 100,
  isAdmin = false
}: {
  activeOnly?: boolean;
  search?: string;
  limit?: number;
  isAdmin?: boolean;
}): Promise<FirestoreTruck[]> {
  // Use the appropriate Firestore instance based on context
  const firestore = isAdmin ? adminDb : db;
  
  // Start building the query
  let query = firestore.collection('trucks');
  
  // Apply filters
  if (activeOnly) {
    query = query.where('isActive', '==', true);
  }
  
  if (search) {
    // Simple contains search - in a real implementation, this would use
    // more sophisticated methods like Firestore composite queries or a search service
    query = query.orderBy('name').startAt(search).endAt(search + '\uf8ff');
  }
  
  // Apply limit
  query = query.limit(limit);
  
  // Execute query
  const snapshot = await query.get();
  
  // Format results as FirestoreTruck objects
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as FirestoreTruck));
}

/**
 * Get a truck by ID
 * 
 * @param id Truck ID
 * @param isAdmin Whether this is being called from an admin context
 * @returns Promise with truck data or null if not found
 */
export async function getTruckById(
  id: string,
  isAdmin = false
): Promise<FirestoreTruck | null> {
  const firestore = isAdmin ? adminDb : db;
  
  const doc = await firestore.collection('trucks').doc(id).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return {
    id: doc.id,
    ...doc.data(),
  } as FirestoreTruck;
}

/**
 * Check if a truck exists by number
 * 
 * @param number Truck number
 * @param isAdmin Whether this is being called from an admin context
 * @returns Promise with boolean indicating existence
 */
export async function truckNumberExists(
  number: string,
  isAdmin = false
): Promise<boolean> {
  const firestore = isAdmin ? adminDb : db;
  
  const snapshot = await firestore
    .collection('trucks')
    .where('truckId', '==', number)
    .limit(1)
    .get();
  
  return !snapshot.empty;
}
