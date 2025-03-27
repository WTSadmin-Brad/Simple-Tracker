/**
 * Admin Jobsites Helpers
 * Utilities for jobsite management in the admin API
 */

import { FirestoreJobsite } from '@/types/firebase';
import { queryJobsites, getJobsiteById } from '@/lib/firebase/utils/jobsites';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { ValidationError, NotFoundError, ErrorCodes } from '@/lib/errors/error-types';

// Jobsite statistics structure
export interface JobsiteStats {
  ticketsSubmitted: number;
  lastActivity: string;
  associatedTrucks: { id: string; name: string; number: string }[];
}

// Complete jobsite structure
export interface Jobsite {
  id: string;
  name: string;
  location: string;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  stats?: JobsiteStats;
}

// Filter parameters for jobsite queries
export interface JobsiteFilterParams {
  active?: boolean;
  search?: string; // For jobsite name search
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

/**
 * Map FirestoreJobsite to admin Jobsite interface with additional fields
 * 
 * @param firestoreJobsite Firestore jobsite document
 * @returns Formatted jobsite for admin API
 */
function mapFirestoreJobsiteToAdminJobsite(firestoreJobsite: FirestoreJobsite): Jobsite {
  return {
    id: firestoreJobsite.id,
    name: firestoreJobsite.name,
    // Note: If FirestoreJobsite doesn't have location in the type definition,
    // this would need to be adjusted. Assuming it does or using empty string.
    location: firestoreJobsite.location || '',
    active: firestoreJobsite.isActive,
    createdAt: firestoreJobsite.createdAt?.seconds 
      ? new Date(firestoreJobsite.createdAt.seconds * 1000).toISOString()
      : new Date().toISOString(),
    updatedAt: firestoreJobsite.updatedAt?.seconds
      ? new Date(firestoreJobsite.updatedAt.seconds * 1000).toISOString()
      : null
  };
}

/**
 * Fetch jobsites with filtering and pagination
 * 
 * @param filters Filter parameters for the query
 * @returns Jobsites array and pagination information
 */
export async function fetchJobsites(filters: JobsiteFilterParams): Promise<{ jobsites: Jobsite[], pagination: Pagination }> {
  try {
    const { active, search = '', page = 1, pageSize = 10 } = filters;
    
    // Use the shared utility for basic querying
    const firestoreJobsites = await queryJobsites({
      activeOnly: active === true, // Only filter by active if explicitly true
      search,
      limit: pageSize * page, // Fetch all potential results up to the current page
      isAdmin: true // Use admin context
    });
    
    // Total count before pagination
    const total = firestoreJobsites.length;
    
    // Apply pagination manually (in a full implementation, this would be done in the Firestore query)
    const paginatedJobsites = firestoreJobsites.slice((page - 1) * pageSize, page * pageSize);
    
    // Map to admin Jobsite interface
    const jobsites = paginatedJobsites.map(mapFirestoreJobsiteToAdminJobsite);
    
    // Calculate pagination information
    const totalPages = Math.ceil(total / pageSize);
    
    return {
      jobsites,
      pagination: {
        total,
        page,
        pageSize,
        totalPages
      }
    };
  } catch (error) {
    throw new Error(`Error fetching jobsites: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch a specific jobsite by ID
 * 
 * @param id Jobsite ID
 * @returns Jobsite or null if not found
 */
export async function fetchJobsiteById(id: string): Promise<Jobsite> {
  try {
    // Use the shared utility
    const firestoreJobsite = await getJobsiteById(id, true);
    
    if (!firestoreJobsite) {
      throw new NotFoundError('Jobsite not found', ErrorCodes.DATA_NOT_FOUND);
    }
    
    // Map to admin Jobsite interface
    const jobsite = mapFirestoreJobsiteToAdminJobsite(firestoreJobsite);
    
    // In a real implementation, we would fetch additional statistics
    // For now, add some placeholder stats
    jobsite.stats = {
      ticketsSubmitted: 32,
      lastActivity: new Date().toISOString(),
      associatedTrucks: [
        { id: 'truck1', name: 'Truck 101', number: '101' },
        { id: 'truck2', name: 'Truck 102', number: '102' }
      ]
    };
    
    return jobsite;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`Error fetching jobsite by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Create a new jobsite
 * 
 * @param jobsiteData Validated jobsite data
 * @returns Created jobsite
 */
export async function createJobsite(jobsiteData: Partial<Jobsite>): Promise<Jobsite> {
  const now = new Date();
  const firestore = getFirestoreAdmin();
  
  try {
    // Prepare the data for Firestore
    const newFirestoreJobsite = {
      name: jobsiteData.name || '',
      location: jobsiteData.location || '',
      isActive: jobsiteData.active ?? true,
      siteId: `SITE-${Date.now().toString(36).toUpperCase()}`, // Generate a unique site ID
      createdAt: firestore.Timestamp.fromDate(now),
      updatedAt: null,
      createdBy: jobsiteData.createdBy || null
    };
    
    // Add to Firestore
    const docRef = await firestore.collection('jobsites').add(newFirestoreJobsite);
    
    // Get the new document with ID
    const doc = await docRef.get();
    
    // Return formatted jobsite
    return {
      id: doc.id,
      name: newFirestoreJobsite.name,
      location: newFirestoreJobsite.location,
      active: newFirestoreJobsite.isActive,
      createdAt: now.toISOString(),
      updatedAt: null
    };
  } catch (error) {
    throw new Error(`Failed to create jobsite: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if jobsite name already exists
 * 
 * @param name Jobsite name to check
 * @returns Boolean indicating if the name exists
 */
export async function jobsiteNameExists(name: string): Promise<boolean> {
  try {
    const firestore = getFirestoreAdmin();
    
    const snapshot = await firestore
      .collection('jobsites')
      .where('name', '==', name)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  } catch (error) {
    throw new Error(`Error checking jobsite name: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
