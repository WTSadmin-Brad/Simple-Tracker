/**
 * Jobsites Reference Helpers
 * Bridge from the References API to shared Firebase utilities
 */

import { FirestoreJobsite } from '../../../../types/firebase';
import { queryJobsites, getJobsiteById } from '../../../../lib/firebase/utils';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { NotFoundError, ErrorCodes } from '@/lib/errors/error-types';

// Firestore collection name
const JOBSITES_COLLECTION = 'jobsites';

// Map from FirestoreJobsite to the Jobsite interface expected by API consumers
export interface Jobsite {
  id: string;
  name: string;
  address?: string;
  active: boolean;
}

/**
 * Convert FirestoreJobsite to Jobsite interface
 * @param firestoreJobsite - The Firestore jobsite document
 * @returns A jobsite object with standardized properties
 */
function mapFirestoreJobsiteToJobsite(firestoreJobsite: FirestoreJobsite): Jobsite {
  return {
    id: firestoreJobsite.id,
    name: firestoreJobsite.name,
    // Note: FirestoreJobsite doesn't have address in the type definition we saw
    // If it's needed, it would need to be added to the FirestoreJobsite type
    active: firestoreJobsite.isActive,
  };
}

/**
 * Fetch all jobsites regardless of active status
 * @returns Array of jobsite objects
 * @throws Error if the database query fails
 */
export async function fetchAllJobsites(): Promise<Jobsite[]> {
  try {
    const jobsites = await queryJobsites({ 
      activeOnly: false,
      isAdmin: false 
    });
    
    return jobsites.map(mapFirestoreJobsiteToJobsite);
  } catch (error) {
    console.error('Error fetching all jobsites:', error);
    throw error;
  }
}

/**
 * Fetch only active jobsites
 * @returns Array of active jobsite objects
 * @throws Error if the database query fails
 */
export async function fetchActiveJobsites(): Promise<Jobsite[]> {
  try {
    const jobsites = await queryJobsites({ 
      activeOnly: true,
      isAdmin: false 
    });
    
    return jobsites.map(mapFirestoreJobsiteToJobsite);
  } catch (error) {
    console.error('Error fetching active jobsites:', error);
    throw error;
  }
}

/**
 * Fetch a jobsite by its ID
 * @param id - The jobsite ID to fetch
 * @returns The jobsite object if found
 * @throws NotFoundError if the jobsite does not exist
 */
export async function fetchJobsiteById(id: string): Promise<Jobsite> {
  try {
    const jobsite = await getJobsiteById(id);
    
    if (!jobsite) {
      throw new NotFoundError(
        'Jobsite not found',
        ErrorCodes.RESOURCE_NOT_FOUND,
        { resourceType: 'jobsite', id }
      );
    }
    
    return mapFirestoreJobsiteToJobsite(jobsite);
  } catch (error) {
    console.error(`Error fetching jobsite with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Check if a jobsite exists
 * @param id - The jobsite ID to check
 * @returns Boolean indicating whether the jobsite exists
 */
export async function jobsiteExists(id: string): Promise<boolean> {
  try {
    const db = getFirestoreAdmin();
    const jobsiteRef = db.collection(JOBSITES_COLLECTION).doc(id);
    const jobsiteSnapshot = await jobsiteRef.get();
    
    return jobsiteSnapshot.exists;
  } catch (error) {
    console.error(`Error checking if jobsite with ID ${id} exists:`, error);
    return false;
  }
}
