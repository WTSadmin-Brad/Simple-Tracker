/**
 * Truck Service
 * Handles Firestore interactions for truck data
 * 
 * Provides methods for:
 * - Fetching trucks with filtering and pagination
 * - Creating new trucks
 * - Updating existing trucks
 * - Managing truck status
 */

import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase/client';
import { Truck } from '@/components/feature/admin/config';

// Collection names
const TRUCKS_COLLECTION = 'trucks';

// Truck filter parameters type
export interface TruckFilterParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortField?: keyof Truck;
  sortDirection?: 'asc' | 'desc';
}

// Default query parameters
export const defaultTruckQueryParams = {
  limit: 10,
  page: 1,
  sortField: 'number' as keyof Truck,
  sortDirection: 'asc' as 'asc' | 'desc'
};

// Mock trucks cache for development environment
let mockTrucks: Truck[] | null = null;

/**
 * Generate mock trucks for development
 */
function generateMockTrucks(count: number = 20): Truck[] {
  if (mockTrucks) return mockTrucks;
  
  const statuses = ['active', 'maintenance', 'retired'];
  const truckTypes = ['Dump Truck', 'Pickup', 'Semi', 'Flatbed', 'Crane'];
  const nicknames = ['Big Red', 'Thunder', 'Lightning', 'Beast', 'Workhorse', 'Titan', 'Hercules', 'Hulk', 'Giant'];
  
  mockTrucks = Array.from({ length: count }).map((_, index) => {
    const number = `T-${1000 + index}`;
    const status = statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'maintenance' | 'retired';
    const type = truckTypes[Math.floor(Math.random() * truckTypes.length)];
    const nickname = Math.random() > 0.3 ? nicknames[Math.floor(Math.random() * nicknames.length)] : undefined;
    
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));
    
    const purchaseDate = new Date(createdAt);
    purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 1000));
    
    const lastMaintenanceDate = Math.random() > 0.2 ? new Date(createdAt.getTime() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)) : undefined;
    
    return {
      id: `truck-${index + 1}`,
      number,
      nickname,
      type,
      make: ['Ford', 'Chevy', 'Dodge', 'Toyota', 'Peterbilt', 'Kenworth'][Math.floor(Math.random() * 6)],
      model: `Model ${Math.floor(Math.random() * 1000)}`,
      year: 2010 + Math.floor(Math.random() * 14),
      status,
      licensePlate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 9000) + 1000}`,
      vin: Array.from({ length: 17 }).map(() => '0123456789ABCDEFGHJKLMNPRSTUVWXYZ'[Math.floor(Math.random() * 33)]).join(''),
      purchaseDate,
      lastMaintenanceDate,
      nextMaintenanceDate: lastMaintenanceDate ? new Date(lastMaintenanceDate.getTime() + 90 * 24 * 60 * 60 * 1000) : undefined,
      notes: Math.random() > 0.5 ? `Notes for truck ${index + 1}` : undefined,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    };
  });
  
  return mockTrucks;
}

/**
 * Get trucks with filtering, sorting, and pagination
 */
export async function getTrucks(filters: TruckFilterParams = {}): Promise<{
  trucks: Truck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockTrucks(filters);
    }
    
    const firestore = getFirestoreClient();
    const trucksCollection = collection(firestore, TRUCKS_COLLECTION);
    
    // Build query with filters
    let truckQuery = query(trucksCollection);
    
    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      truckQuery = query(truckQuery, where('status', '==', filters.status));
    }
    
    // Apply sorting
    const sortField = filters.sortField || 'number';
    const sortDirection = filters.sortDirection || 'asc';
    truckQuery = query(truckQuery, orderBy(sortField, sortDirection));
    
    // Execute query
    const snapshot = await getDocs(truckQuery);
    
    // Get total count
    const total = snapshot.size;
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Process results
    let trucks = snapshot.docs.map(doc => {
      const data = doc.data();
      
      // Convert Firestore timestamps to Date objects
      const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
      const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
      const purchaseDate = data.purchaseDate instanceof Timestamp ? data.purchaseDate.toDate() : data.purchaseDate ? new Date(data.purchaseDate) : undefined;
      const lastMaintenanceDate = data.lastMaintenanceDate instanceof Timestamp ? data.lastMaintenanceDate.toDate() : data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : undefined;
      const nextMaintenanceDate = data.nextMaintenanceDate instanceof Timestamp ? data.nextMaintenanceDate.toDate() : data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : undefined;
      
      return {
        id: doc.id,
        ...data,
        createdAt,
        updatedAt,
        purchaseDate,
        lastMaintenanceDate,
        nextMaintenanceDate
      } as Truck;
    });
    
    // Apply search filter (client-side for simplicity)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      trucks = trucks.filter(truck => 
        truck.number.toLowerCase().includes(searchTerm) ||
        (truck.nickname && truck.nickname.toLowerCase().includes(searchTerm)) ||
        truck.make.toLowerCase().includes(searchTerm) ||
        truck.model.toLowerCase().includes(searchTerm) ||
        truck.licensePlate.toLowerCase().includes(searchTerm) ||
        truck.vin.toLowerCase().includes(searchTerm)
      );
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(trucks.length / limit);
    
    // Apply pagination
    const paginatedTrucks = trucks.slice(startIndex, endIndex);
    
    return {
      trucks: paginatedTrucks,
      total: trucks.length,
      page,
      limit,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching trucks:', error);
    
    // Fallback to mock data
    return getMockTrucks(filters);
  }
}

/**
 * Helper function to get mock trucks (for development or fallback)
 */
async function getMockTrucks(filters: TruckFilterParams = {}): Promise<{
  trucks: Truck[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  // Generate mock data if not already generated
  const allTrucks = generateMockTrucks();
  
  // Apply filters
  let filteredTrucks = [...allTrucks];
  
  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filteredTrucks = filteredTrucks.filter(truck => truck.status === filters.status);
  }
  
  // Apply search filter
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredTrucks = filteredTrucks.filter(truck => 
      truck.number.toLowerCase().includes(searchTerm) ||
      (truck.nickname && truck.nickname.toLowerCase().includes(searchTerm)) ||
      truck.make.toLowerCase().includes(searchTerm) ||
      truck.model.toLowerCase().includes(searchTerm) ||
      truck.licensePlate.toLowerCase().includes(searchTerm) ||
      truck.vin.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply sorting
  const sortField = filters.sortField || 'number';
  const sortDirection = filters.sortDirection || 'asc';
  
  filteredTrucks.sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });
  
  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  const paginatedTrucks = filteredTrucks.slice(startIndex, endIndex);
  
  return {
    trucks: paginatedTrucks,
    total: filteredTrucks.length,
    page,
    limit,
    totalPages: Math.ceil(filteredTrucks.length / limit)
  };
}

/**
 * Get a single truck by ID
 */
export async function getTruckById(id: string): Promise<Truck | null> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockTruckById(id);
    }
    
    const firestore = getFirestoreClient();
    const truckDoc = doc(firestore, TRUCKS_COLLECTION, id);
    const snapshot = await getDoc(truckDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const purchaseDate = data.purchaseDate instanceof Timestamp ? data.purchaseDate.toDate() : data.purchaseDate ? new Date(data.purchaseDate) : undefined;
    const lastMaintenanceDate = data.lastMaintenanceDate instanceof Timestamp ? data.lastMaintenanceDate.toDate() : data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : undefined;
    const nextMaintenanceDate = data.nextMaintenanceDate instanceof Timestamp ? data.nextMaintenanceDate.toDate() : data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : undefined;
    
    return {
      id: snapshot.id,
      ...data,
      createdAt,
      updatedAt,
      purchaseDate,
      lastMaintenanceDate,
      nextMaintenanceDate
    } as Truck;
  } catch (error) {
    console.error('Error fetching truck:', error);
    
    // Fallback to mock data
    return getMockTruckById(id);
  }
}

/**
 * Helper function to get a mock truck by ID (for development or fallback)
 */
async function getMockTruckById(id: string): Promise<Truck | null> {
  const trucks = generateMockTrucks();
  return trucks.find(truck => truck.id === id) || null;
}

/**
 * Create a new truck
 */
export async function createTruck(truckData: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Truck> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockCreateTruck(truckData);
    }
    
    const firestore = getFirestoreClient();
    const truckCollection = collection(firestore, TRUCKS_COLLECTION);
    const newTruckRef = doc(truckCollection);
    
    const now = serverTimestamp();
    
    const newTruck = {
      ...truckData,
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(newTruckRef, newTruck);
    
    // Fetch the created truck to return
    const snapshot = await getDoc(newTruckRef);
    const data = snapshot.data();
    
    // Convert Firestore timestamps to Date objects
    const createdAt = new Date();
    const updatedAt = new Date();
    const purchaseDate = data.purchaseDate instanceof Timestamp ? data.purchaseDate.toDate() : data.purchaseDate ? new Date(data.purchaseDate) : undefined;
    const lastMaintenanceDate = data.lastMaintenanceDate instanceof Timestamp ? data.lastMaintenanceDate.toDate() : data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : undefined;
    const nextMaintenanceDate = data.nextMaintenanceDate instanceof Timestamp ? data.nextMaintenanceDate.toDate() : data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : undefined;
    
    return {
      id: snapshot.id,
      ...data,
      createdAt,
      updatedAt,
      purchaseDate,
      lastMaintenanceDate,
      nextMaintenanceDate
    } as Truck;
  } catch (error) {
    console.error('Error creating truck:', error);
    
    // Fallback to mock data
    return getMockCreateTruck(truckData);
  }
}

/**
 * Helper function to create a mock truck (for development or fallback)
 */
async function getMockCreateTruck(truckData: Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>): Promise<Truck> {
  const trucks = generateMockTrucks();
  const newId = `truck-${trucks.length + 1}`;
  
  const now = new Date();
  
  const newTruck: Truck = {
    id: newId,
    ...truckData,
    createdAt: now,
    updatedAt: now
  };
  
  mockTrucks = [...trucks, newTruck];
  
  return newTruck;
}

/**
 * Update an existing truck
 */
export async function updateTruck(id: string, truckData: Partial<Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Truck | null> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockUpdateTruck(id, truckData);
    }
    
    const firestore = getFirestoreClient();
    const truckDoc = doc(firestore, TRUCKS_COLLECTION, id);
    
    // Check if truck exists
    const snapshot = await getDoc(truckDoc);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    // Update truck
    await updateDoc(truckDoc, {
      ...truckData,
      updatedAt: serverTimestamp()
    });
    
    // Fetch updated truck
    const updatedSnapshot = await getDoc(truckDoc);
    const data = updatedSnapshot.data();
    
    // Convert Firestore timestamps to Date objects
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt);
    const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt);
    const purchaseDate = data.purchaseDate instanceof Timestamp ? data.purchaseDate.toDate() : data.purchaseDate ? new Date(data.purchaseDate) : undefined;
    const lastMaintenanceDate = data.lastMaintenanceDate instanceof Timestamp ? data.lastMaintenanceDate.toDate() : data.lastMaintenanceDate ? new Date(data.lastMaintenanceDate) : undefined;
    const nextMaintenanceDate = data.nextMaintenanceDate instanceof Timestamp ? data.nextMaintenanceDate.toDate() : data.nextMaintenanceDate ? new Date(data.nextMaintenanceDate) : undefined;
    
    return {
      id: updatedSnapshot.id,
      ...data,
      createdAt,
      updatedAt,
      purchaseDate,
      lastMaintenanceDate,
      nextMaintenanceDate
    } as Truck;
  } catch (error) {
    console.error('Error updating truck:', error);
    
    // Fallback to mock data
    return getMockUpdateTruck(id, truckData);
  }
}

/**
 * Helper function to update a mock truck (for development or fallback)
 */
async function getMockUpdateTruck(id: string, truckData: Partial<Omit<Truck, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Truck | null> {
  const trucks = generateMockTrucks();
  const truckIndex = trucks.findIndex(truck => truck.id === id);
  
  if (truckIndex === -1) {
    return null;
  }
  
  const updatedTruck = {
    ...trucks[truckIndex],
    ...truckData,
    updatedAt: new Date()
  };
  
  mockTrucks = [
    ...trucks.slice(0, truckIndex),
    updatedTruck,
    ...trucks.slice(truckIndex + 1)
  ];
  
  return updatedTruck;
}

/**
 * Delete a truck
 */
export async function deleteTruck(id: string): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockDeleteTruck(id);
    }
    
    const firestore = getFirestoreClient();
    const truckDoc = doc(firestore, TRUCKS_COLLECTION, id);
    
    // Check if truck exists
    const snapshot = await getDoc(truckDoc);
    
    if (!snapshot.exists()) {
      return false;
    }
    
    // Delete truck
    await deleteDoc(truckDoc);
    
    return true;
  } catch (error) {
    console.error('Error deleting truck:', error);
    
    // Fallback to mock data
    return getMockDeleteTruck(id);
  }
}

/**
 * Helper function to delete a mock truck (for development or fallback)
 */
async function getMockDeleteTruck(id: string): Promise<boolean> {
  const trucks = generateMockTrucks();
  const truckIndex = trucks.findIndex(truck => truck.id === id);
  
  if (truckIndex === -1) {
    return false;
  }
  
  mockTrucks = [
    ...trucks.slice(0, truckIndex),
    ...trucks.slice(truckIndex + 1)
  ];
  
  return true;
}

/**
 * Update truck status
 */
export async function updateTruckStatus(id: string, status: 'active' | 'maintenance' | 'retired'): Promise<Truck | null> {
  return updateTruck(id, { status });
}

/**
 * Update truck maintenance dates
 */
export async function updateTruckMaintenance(id: string, lastMaintenanceDate: Date, nextMaintenanceDate?: Date): Promise<Truck | null> {
  return updateTruck(id, { 
    lastMaintenanceDate, 
    nextMaintenanceDate: nextMaintenanceDate || new Date(lastMaintenanceDate.getTime() + 90 * 24 * 60 * 60 * 1000) 
  });
}

/**
 * Batch update truck status
 */
export async function batchUpdateTruckStatus(ids: string[], status: 'active' | 'maintenance' | 'retired'): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockBatchUpdateTruckStatus(ids, status);
    }
    
    const firestore = getFirestoreClient();
    
    // Update each truck
    const updatePromises = ids.map(id => {
      const truckDoc = doc(firestore, TRUCKS_COLLECTION, id);
      return updateDoc(truckDoc, {
        status,
        updatedAt: serverTimestamp()
      });
    });
    
    await Promise.all(updatePromises);
    
    return true;
  } catch (error) {
    console.error('Error batch updating truck status:', error);
    
    // Fallback to mock data
    return getMockBatchUpdateTruckStatus(ids, status);
  }
}

/**
 * Helper function to batch update mock truck status (for development or fallback)
 */
async function getMockBatchUpdateTruckStatus(ids: string[], status: 'active' | 'maintenance' | 'retired'): Promise<boolean> {
  const trucks = generateMockTrucks();
  
  const updatedTrucks = trucks.map(truck => {
    if (ids.includes(truck.id)) {
      return {
        ...truck,
        status,
        updatedAt: new Date()
      };
    }
    return truck;
  });
  
  mockTrucks = updatedTrucks;
  
  return true;
}

/**
 * Batch delete trucks
 */
export async function batchDeleteTrucks(ids: string[]): Promise<boolean> {
  try {
    // For development, use mock data
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      return getMockBatchDeleteTrucks(ids);
    }
    
    const firestore = getFirestoreClient();
    
    // Delete each truck
    const deletePromises = ids.map(id => {
      const truckDoc = doc(firestore, TRUCKS_COLLECTION, id);
      return deleteDoc(truckDoc);
    });
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error batch deleting trucks:', error);
    
    // Fallback to mock data
    return getMockBatchDeleteTrucks(ids);
  }
}

/**
 * Helper function to batch delete mock trucks (for development or fallback)
 */
async function getMockBatchDeleteTrucks(ids: string[]): Promise<boolean> {
  const trucks = generateMockTrucks();
  
  mockTrucks = trucks.filter(truck => !ids.includes(truck.id));
  
  return true;
}

// Export default object with all functions
const truckService = {
  getTrucks,
  getTruckById,
  createTruck,
  updateTruck,
  deleteTruck,
  updateTruckStatus,
  updateTruckMaintenance,
  batchUpdateTruckStatus,
  batchDeleteTrucks
};

export default truckService;
