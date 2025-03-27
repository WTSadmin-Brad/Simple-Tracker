/**
 * Firebase Jobsite Utilities
 * 
 * Shared utility functions for jobsite operations that can be used by both
 * admin and references APIs. These functions provide a consistent way to
 * access jobsite data while maintaining separation of concerns.
 */

import { FirestoreJobsite } from '../../../types/firebase';
import { db } from '../client'; // For client-side operations
import { adminDb } from '../admin'; // For admin operations

/**
 * Base function to query jobsites with filters
 * 
 * @param options Query options including active status filter
 * @param isAdmin Whether this is being called from an admin context
 * @returns Promise with array of jobsite data
 */
export async function queryJobsites({ 
  activeOnly = true,
  search = '',
  limit = 100,
  isAdmin = false
}: {
  activeOnly?: boolean;
  search?: string;
  limit?: number;
  isAdmin?: boolean;
}): Promise<FirestoreJobsite[]> {
  // Use the appropriate Firestore instance based on context
  const firestore = isAdmin ? adminDb : db;
  
  // Start building the query
  let query = firestore.collection('jobsites');
  
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
  
  // Format results as FirestoreJobsite objects
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as FirestoreJobsite));
}

/**
 * Get a jobsite by ID
 * 
 * @param id Jobsite ID
 * @param isAdmin Whether this is being called from an admin context
 * @returns Promise with jobsite data or null if not found
 */
export async function getJobsiteById(
  id: string,
  isAdmin = false
): Promise<FirestoreJobsite | null> {
  const firestore = isAdmin ? adminDb : db;
  
  const doc = await firestore.collection('jobsites').doc(id).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return {
    id: doc.id,
    ...doc.data(),
  } as FirestoreJobsite;
}

/**
 * Check if a jobsite exists by site ID
 * 
 * @param siteId Jobsite site ID
 * @param isAdmin Whether this is being called from an admin context
 * @returns Promise with boolean indicating existence
 */
export async function jobsiteSiteIdExists(
  siteId: string,
  isAdmin = false
): Promise<boolean> {
  const firestore = isAdmin ? adminDb : db;
  
  const snapshot = await firestore
    .collection('jobsites')
    .where('siteId', '==', siteId)
    .limit(1)
    .get();
  
  return !snapshot.empty;
}
