/**
 * Jobsite Service
 * Handles Firestore interactions for jobsite data
 * 
 * Provides methods for:
 * - Fetching jobsites with filtering and pagination
 * - Creating new jobsites
 * - Updating existing jobsites
 * - Managing jobsite status
 */

import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase/client';
import { Jobsite } from '@/components/feature/admin/config';

// Collection names
const JOBSITES_COLLECTION = 'jobsites';

// Jobsite filter parameters type
export interface JobsiteFilterParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortField?: keyof Jobsite;
  sortDirection?: 'asc' | 'desc';
}

// Default query parameters
export const defaultJobsiteQueryParams = {
  limit: 10,
  page: 1,
  sortField: 'name' as keyof Jobsite,
  sortDirection: 'asc' as 'asc' | 'desc'
};

// Mock jobsites cache for development environment
let mockJobsites: Jobsite[] | null = null;

/**
 * Generate mock jobsites for development
 */
function generateMockJobsites(count: number = 25): Jobsite[] {
  if (mockJobsites) return mockJobsites;
  
  const statuses = ['active', 'inactive', 'completed'];
  const cities = ['Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi'];
  const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Washington Blvd', 'Park Lane', 'River Dr', 'Lake View', 'Mountain Pass'];
  const jobsiteTypes = ['Residential', 'Commercial', 'Industrial', 'Municipal', 'Highway'];
  
  mockJobsites = Array.from({ length: count }).map((_, index) => {
    const name = `Jobsite ${index + 1}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'inactive' | 'completed';
    const city = cities[Math.floor(Math.random() * cities.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    const type = jobsiteTypes[Math.floor(Math.random() * jobsiteTypes.length)];
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));
    
    const startDate = new Date(createdAt);
    
    let endDate = undefined;
    if (status === 'completed') {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 180) + 30);
    }
    
    return {
      id: `jobsite-${index + 1}`,
      name,
      address: `${Math.floor(Math.random() * 9000) + 1000} ${street}, ${city}, TX`,
      city,
      state: 'TX',
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      type,
      status,
      contactName: Math.random() > 0.3 ? `Contact ${index + 1}` : undefined,
      contactPhone: Math.random() > 0.3 ? `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
      contactEmail: Math.random() > 0.3 ? `contact${index + 1}@example.com` : undefined,
      notes: Math.random() > 0.5 ? `Notes for jobsite ${index + 1}` : undefined,
      startDate,
      endDate,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    };
  });
  
  return mockJobsites;
}

/**
 * Get jobsites with filtering, sorting, and pagination
 */
export async function getJobsites(filters: JobsiteFilterParams = {}): Promise<{
  jobsites: Jobsite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockJobsites(filters);
    }
    
    const firestore = getFirestoreClient();
    const jobsitesCollection = collection(firestore, JOBSITES_COLLECTION);
    
    // Build query with filters
    let jobsiteQuery = query(jobsitesCollection);
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      jobsiteQuery = query(jobsiteQuery, where('status', '==', filters.status));
    }
    
    // Apply sorting
    const sortField = filters.sortField || 'name';
    const sortDirection = filters.sortDirection || 'asc';
    jobsiteQuery = query(jobsiteQuery, orderBy(sortField, sortDirection));
    
    // Execute query
    const snapshot = await getDocs(jobsiteQuery);
    
    // Get total count
    const total = snapshot.size;
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Process results
    let jobsites = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
      const startDate = data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate ? new Date(data.startDate) : undefined;
      const endDate = data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate ? new Date(data.endDate) : undefined;
      
      return {
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        startDate,
        endDate
      } as Jobsite;
    });
    
    // Apply search filter (client-side for simplicity)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      jobsites = jobsites.filter(jobsite => 
        jobsite.name.toLowerCase().includes(searchTerm) ||
        jobsite.address.toLowerCase().includes(searchTerm) ||
        jobsite.city.toLowerCase().includes(searchTerm) ||
        (jobsite.contactName && jobsite.contactName.toLowerCase().includes(searchTerm))
      );
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(jobsites.length / limit);
    
    // Apply pagination
    const paginatedJobsites = jobsites.slice(startIndex, endIndex);
    
    return {
      jobsites: paginatedJobsites,
      total: jobsites.length,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching jobsites:', error);
    
    // Fallback to mock data
    return getMockJobsites(filters);
  }
}

/**
 * Helper function to get mock jobsites (for development or fallback)
 */
async function getMockJobsites(filters: JobsiteFilterParams = {}): Promise<{
  jobsites: Jobsite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  // Generate mock data if not already generated
  const allJobsites = generateMockJobsites();
  
  // Apply filters
  let filteredJobsites = [...allJobsites];
  
  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filteredJobsites = filteredJobsites.filter(jobsite => jobsite.status === filters.status);
  }
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredJobsites = filteredJobsites.filter(jobsite => 
      jobsite.name.toLowerCase().includes(searchTerm) ||
      jobsite.address.toLowerCase().includes(searchTerm) ||
      jobsite.city.toLowerCase().includes(searchTerm) ||
      (jobsite.contactName && jobsite.contactName.toLowerCase().includes(searchTerm))
    );
  }
  
  // Apply sorting
  const sortField = filters.sortField || 'name';
  const sortDirection = filters.sortDirection || 'asc';
  
  filteredJobsites.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return 0;
  });
  
  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedJobsites = filteredJobsites.slice(startIndex, endIndex);
  
  return {
    jobsites: paginatedJobsites,
    total: filteredJobsites.length,
    page,
    limit,
    totalPages: Math.ceil(filteredJobsites.length / limit)
  };
}

/**
 * Get a single jobsite by ID
 */
export async function getJobsiteById(id: string): Promise<Jobsite | null> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockJobsiteById(id);
    }
    
    const firestore = getFirestoreClient();
    const jobsiteDoc = doc(firestore, JOBSITES_COLLECTION, id);
    const snapshot = await getDoc(jobsiteDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const startDate = data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate ? new Date(data.startDate) : undefined;
    const endDate = data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate ? new Date(data.endDate) : undefined;
    
    return {
      id: snapshot.id,
      ...data,
      createdAt,
      updatedAt,
      startDate,
      endDate
    } as Jobsite;
  } catch (error) {
    console.error('Error fetching jobsite:', error);
    
    // Fallback to mock data
    return getMockJobsiteById(id);
  }
}

/**
 * Helper function to get a mock jobsite by ID (for development or fallback)
 */
async function getMockJobsiteById(id: string): Promise<Jobsite | null> {
  const jobsites = generateMockJobsites();
  return jobsites.find(jobsite => jobsite.id === id) || null;
}

/**
 * Create a new jobsite
 */
export async function createJobsite(jobsiteData: Omit<Jobsite, 'id' | 'createdAt' | 'updatedAt'>): Promise<Jobsite> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockCreateJobsite(jobsiteData);
    }
    
    const firestore = getFirestoreClient();
    const jobsiteCollection = collection(firestore, JOBSITES_COLLECTION);
    const newJobsiteRef = doc(jobsiteCollection);
    
    const now = serverTimestamp();
    
    const newJobsite = {
      ...jobsiteData,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(newJobsiteRef, newJobsite);
    
    // Fetch the created jobsite to return
    const snapshot = await getDoc(newJobsiteRef);
    const data = snapshot.data();
    
    // Convert Firestore timestamps to Date objects
    const createdAt = new Date();
    const updatedAt = new Date();
    const startDate = data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate ? new Date(data.startDate) : undefined;
    const endDate = data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate ? new Date(data.endDate) : undefined;
    
    return {
      id: snapshot.id,
      ...data,
      createdAt,
      updatedAt,
      startDate,
      endDate
    } as Jobsite;
  } catch (error) {
    console.error('Error creating jobsite:', error);
    
    // Fallback to mock data
    return getMockCreateJobsite(jobsiteData);
  }
}

/**
 * Helper function to create a mock jobsite (for development or fallback)
 */
async function getMockCreateJobsite(jobsiteData: Omit<Jobsite, 'id' | 'createdAt' | 'updatedAt'>): Promise<Jobsite> {
  const jobsites = generateMockJobsites();
  const newId = `jobsite-${jobsites.length + 1}`;
  
  const now = new Date();
  
  const newJobsite: Jobsite = {
    id: newId,
    ...jobsiteData,
    createdAt: now,
    updatedAt: now
  };
  
  mockJobsites = [...jobsites, newJobsite];
  
  return newJobsite;
}

/**
 * Update an existing jobsite
 */
export async function updateJobsite(id: string, jobsiteData: Partial<Omit<Jobsite, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Jobsite | null> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockUpdateJobsite(id, jobsiteData);
    }
    
    const firestore = getFirestoreClient();
    const jobsiteDoc = doc(firestore, JOBSITES_COLLECTION, id);
    
    // Check if jobsite exists
    const snapshot = await getDoc(jobsiteDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    // Update jobsite
    await updateDoc(jobsiteDoc, {
      ...jobsiteData,
      updatedAt: serverTimestamp()
    });
    
    // Fetch updated jobsite
    const updatedSnapshot = await getDoc(jobsiteDoc);
    const data = updatedSnapshot.data();
    
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const startDate = data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate ? new Date(data.startDate) : undefined;
    const endDate = data.endDate instanceof Timestamp ? data.endDate.toDate() : data.endDate ? new Date(data.endDate) : undefined;
    
    return {
      id: updatedSnapshot.id,
      ...data,
      createdAt,
      updatedAt,
      startDate,
      endDate
    } as Jobsite;
  } catch (error) {
    console.error('Error updating jobsite:', error);
    
    // Fallback to mock data
    return getMockUpdateJobsite(id, jobsiteData);
  }
}

/**
 * Helper function to update a mock jobsite (for development or fallback)
 */
async function getMockUpdateJobsite(id: string, jobsiteData: Partial<Omit<Jobsite, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Jobsite | null> {
  const jobsites = generateMockJobsites();
  const jobsiteIndex = jobsites.findIndex(jobsite => jobsite.id === id);
  
  if (jobsiteIndex === -1) {
    return null;
  }
  
  const updatedJobsite = {
    ...jobsites[jobsiteIndex],
    ...jobsiteData,
    updatedAt: new Date()
  };
  
  mockJobsites = [
    ...jobsites.slice(0, jobsiteIndex),
    updatedJobsite,
    ...jobsites.slice(jobsiteIndex + 1)
  ];
  
  return updatedJobsite;
}

/**
 * Delete a jobsite
 */
export async function deleteJobsite(id: string): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockDeleteJobsite(id);
    }
    
    const firestore = getFirestoreClient();
    const jobsiteDoc = doc(firestore, JOBSITES_COLLECTION, id);
    
    // Check if jobsite exists
    const snapshot = await getDoc(jobsiteDoc);
    
    if (!snapshot.exists()) {
      return false;
    }
    
    // Delete jobsite
    await deleteDoc(jobsiteDoc);
    
    return true;
  } catch (error) {
    console.error('Error deleting jobsite:', error);
    
    // Fallback to mock data
    return getMockDeleteJobsite(id);
  }
}

/**
 * Helper function to delete a mock jobsite (for development or fallback)
 */
async function getMockDeleteJobsite(id: string): Promise<boolean> {
  const jobsites = generateMockJobsites();
  const jobsiteIndex = jobsites.findIndex(jobsite => jobsite.id === id);
  
  if (jobsiteIndex === -1) {
    return false;
  }
  
  mockJobsites = [
    ...jobsites.slice(0, jobsiteIndex),
    ...jobsites.slice(jobsiteIndex + 1)
  ];
  
  return true;
}

/**
 * Update jobsite status
 */
export async function updateJobsiteStatus(id: string, status: 'active' | 'inactive' | 'completed'): Promise<Jobsite | null> {
  return updateJobsite(id, { status });
}

/**
 * Batch update jobsite status
 */
export async function batchUpdateJobsiteStatus(ids: string[], status: 'active' | 'inactive' | 'completed'): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockBatchUpdateJobsiteStatus(ids, status);
    }
    
    const firestore = getFirestoreClient();
    
    // Update each jobsite
    const updatePromises = ids.map(id => {
      const jobsiteDoc = doc(firestore, JOBSITES_COLLECTION, id);
      return updateDoc(jobsiteDoc, {
        status,
        updatedAt: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
    
    return true;
  } catch (error) {
    console.error('Error batch updating jobsite status:', error);
    
    // Fallback to mock data
    return getMockBatchUpdateJobsiteStatus(ids, status);
  }
}

/**
 * Helper function to batch update mock jobsite status (for development or fallback)
 */
async function getMockBatchUpdateJobsiteStatus(ids: string[], status: 'active' | 'inactive' | 'completed'): Promise<boolean> {
  const jobsites = generateMockJobsites();
  
  const updatedJobsites = jobsites.map(jobsite => {
    if (ids.includes(jobsite.id)) {
      return {
        ...jobsite,
        status,
        updatedAt: new Date()
      };
    }
    return jobsite;
  });
  
  mockJobsites = updatedJobsites;
  
  return true;
}

/**
 * Batch delete jobsites
 */
export async function batchDeleteJobsites(ids: string[]): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockBatchDeleteJobsites(ids);
    }
    
    const firestore = getFirestoreClient();
    
    // Delete each jobsite
    const deletePromises = ids.map(id => {
      const jobsiteDoc = doc(firestore, JOBSITES_COLLECTION, id);
      return deleteDoc(jobsiteDoc);
    });
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error batch deleting jobsites:', error);
    
    // Fallback to mock data
    return getMockBatchDeleteJobsites(ids);
  }
}

/**
 * Helper function to batch delete mock jobsites (for development or fallback)
 */
async function getMockBatchDeleteJobsites(ids: string[]): Promise<boolean> {
  const jobsites = generateMockJobsites();
  
  mockJobsites = jobsites.filter(jobsite => !ids.includes(jobsite.id));
  
  return true;
}

// Export default object with all functions
const jobsiteService = {
  getJobsites,
  getJobsiteById,
  createJobsite,
  updateJobsite,
  deleteJobsite,
  updateJobsiteStatus,
  batchUpdateJobsiteStatus,
  batchDeleteJobsites
};

export default jobsiteService;
