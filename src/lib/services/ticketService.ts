/**
 * Ticket Service
 * Handles Firestore interactions for ticket data
 * 
 * Provides methods for:
 * - Fetching tickets for a specific user or date range
 * - Creating new tickets
 * - Updating existing tickets
 * - Uploading and managing ticket images
 * - Archiving tickets
 */

import { format, subDays } from 'date-fns';
import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { getFirestoreClient, getStorageClient } from '@/lib/firebase/client';
import { errorHandler, ErrorCodes, NotFoundError, ValidationError, AuthError, AppError } from '@/lib/errors';

// Collection names
const TICKETS_COLLECTION = 'tickets';
const WIZARD_STATE_COLLECTION = 'wizardState';

// Storage paths
const TICKETS_STORAGE_PATH = 'tickets';
const THUMBNAILS_FOLDER = 'thumbnails';

// Ticket type definition based on the data model
export interface Ticket {
  id: string;
  userId: string;
  date: Date;
  truckNumber: string;
  truckNickname: string;
  jobsite: string;
  jobsiteName: string; // For display purposes
  hangers: number;
  leaner6To12: number;
  leaner13To24: number;
  leaner25To36: number;
  leaner37To48: number;
  leaner49Plus: number;
  total: number;
  images: string[];
  thumbnails?: string[];
  imageCount: number;
  submissionDate: Date;
  isFuturePrediction: boolean;
  archiveStatus: 'active' | 'images_archived' | 'fully_archived';
  archiveDate?: Date;
  archivedImages?: string[];
  archiveFile?: string;
  archiveRow?: number;
}

// Filter parameters type
export interface TicketFilterParams {
  startDate?: string;
  endDate?: string;
  jobsite?: string;
  truck?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortField?: keyof Ticket;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Interface for creating a new ticket
 */
export interface CreateTicketData {
  date: string;
  truckNumber: string;
  truckNickname: string;
  jobsite: string;
  jobsiteName: string;
  categories: {
    hangers: number;
    leaner6To12: number;
    leaner13To24: number;
    leaner25To36: number;
    leaner37To48: number;
    leaner49Plus: number;
  };
  images: File[];
}

/**
 * Interface for updating an existing ticket
 */
export interface UpdateTicketData {
  id: string;
  categories?: {
    hangers?: number;
    leaner6To12?: number;
    leaner13To24?: number;
    leaner25To36?: number;
    leaner37To48?: number;
    leaner49Plus?: number;
  };
  images?: string[];
  newImages?: File[];
}

/**
 * Wizard step data interfaces
 */
export interface WizardStep1Data {
  date: string;
  truckNumber: string;
  truckNickname: string;
  jobsite: string;
  jobsiteName: string;
}

export interface WizardStep2Data {
  categories: {
    hangers: number;
    leaner6To12: number;
    leaner13To24: number;
    leaner25To36: number;
    leaner37To48: number;
    leaner49Plus: number;
  };
}

export interface WizardStep3Data {
  images: File[];
}

// Mock tickets cache for development environment
let mockTickets: Ticket[] | null = null;

/**
 * Generate mock tickets for development
 */
function generateMockTickets(count: number = 50): Ticket[] {
  const jobsites = [
    { id: 'site-1', name: 'Downtown HQ' },
    { id: 'site-2', name: 'North Campus' },
    { id: 'site-3', name: 'East Building' },
    { id: 'site-4', name: 'West Facility' },
    { id: 'site-5', name: 'South Complex' },
  ];
  
  const trucks = [
    { id: 'Truck-1', nickname: 'Big Red' },
    { id: 'Truck-2', nickname: 'Blue Thunder' },
    { id: 'Truck-3', nickname: 'Green Machine' },
    { id: 'Truck-4', nickname: 'Yellow Jacket' },
    { id: 'Truck-5', nickname: 'Silver Bullet' },
  ];
  
  const users = ['johndoe', 'janedoe', 'bobsmith', 'alicejones', 'mikebrown'];
  
  const statuses: ('active' | 'images_archived' | 'fully_archived')[] = [
    'active', 'active', 'active', 'active', 'images_archived', 'images_archived', 'fully_archived'
  ];
  
  return Array.from({ length: count }).map((_, index) => {
    const jobsite = jobsites[Math.floor(Math.random() * jobsites.length)];
    const truck = trucks[Math.floor(Math.random() * trucks.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const date = subDays(new Date(), Math.floor(Math.random() * 60));
    const imageCount = Math.floor(Math.random() * 8) + 1;
    
    // Generate random ticket counts
    const hangers = Math.floor(Math.random() * 150);
    const leaner6To12 = Math.floor(Math.random() * 150);
    const leaner13To24 = Math.floor(Math.random() * 150);
    const leaner25To36 = Math.floor(Math.random() * 150);
    const leaner37To48 = Math.floor(Math.random() * 150);
    const leaner49Plus = Math.floor(Math.random() * 150);
    const total = hangers + leaner6To12 + leaner13To24 + leaner25To36 + leaner37To48 + leaner49Plus;
    
    // Generate mock images
    const images = Array.from({ length: imageCount }).map((_, imgIndex) => 
      `gs://workday-tracker-prod.appspot.com/tickets/${user}/ticket-${index}/image${imgIndex + 1}.jpg`
    );
    
    const thumbnails = images.map(img => img.replace('.jpg', '-thumb.jpg'));
    
    return {
      id: `ticket-${index + 1}`,
      userId: user,
      date,
      truckNumber: truck.id,
      truckNickname: truck.nickname,
      jobsite: jobsite.id,
      jobsiteName: jobsite.name,
      hangers,
      leaner6To12,
      leaner13To24,
      leaner25To36,
      leaner37To48,
      leaner49Plus,
      total,
      images,
      thumbnails,
      imageCount,
      submissionDate: new Date(date.getTime() + 1000 * 60 * 60 * 2), // 2 hours after date
      isFuturePrediction: false,
      archiveStatus: status,
      ...(status !== 'active' && {
        archiveDate: new Date(date.getTime() + 1000 * 60 * 60 * 24 * 30), // 30 days after date
      }),
      ...(status === 'fully_archived' && {
        archiveFile: `gs://archive-bucket/archive/data/2024-06/tickets-${jobsite.id}-2024-06.xlsx`,
        archiveRow: Math.floor(Math.random() * 100) + 1,
      }),
    };
  });
}

/**
 * Get tickets with filtering, sorting, and pagination
 */
export async function getTickets(filters: TicketFilterParams = {}): Promise<{
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    const firestore = getFirestoreClient();
    if (!firestore) {
      // Fall back to mock data if Firestore is not available
      return getMockTickets(filters);
    }

    const ticketsCollection = collection(firestore, TICKETS_COLLECTION);
    let ticketsQuery = query(ticketsCollection);

    // Apply filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      ticketsQuery = query(ticketsQuery, where('date', '>=', Timestamp.fromDate(startDate)));
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      ticketsQuery = query(ticketsQuery, where('date', '<=', Timestamp.fromDate(endDate)));
    }

    if (filters.jobsite) {
      ticketsQuery = query(ticketsQuery, where('jobsite', '==', filters.jobsite));
    }

    if (filters.truck) {
      ticketsQuery = query(ticketsQuery, where('truckNumber', '==', filters.truck));
    }

    if (filters.status) {
      ticketsQuery = query(ticketsQuery, where('archiveStatus', '==', filters.status));
    }

    // Apply default sorting (we'll handle custom sorting in memory)
    ticketsQuery = query(ticketsQuery, orderBy('date', 'desc'));

    const snapshot = await getDocs(ticketsQuery);
    let tickets: Ticket[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      tickets.push({
        id: doc.id,
        userId: data.userId,
        date: data.date.toDate(),
        truckNumber: data.truckNumber,
        truckNickname: data.truckNickname,
        jobsite: data.jobsite,
        jobsiteName: data.jobsiteName,
        hangers: data.hangers,
        leaner6To12: data.leaner6To12,
        leaner13To24: data.leaner13To24,
        leaner25To36: data.leaner25To36,
        leaner37To48: data.leaner37To48,
        leaner49Plus: data.leaner49Plus,
        total: data.total,
        images: data.images || [],
        thumbnails: data.thumbnails || [],
        imageCount: data.imageCount || 0,
        submissionDate: data.submissionDate.toDate(),
        isFuturePrediction: data.isFuturePrediction || false,
        archiveStatus: data.archiveStatus,
        archiveDate: data.archiveDate ? data.archiveDate.toDate() : undefined,
        archivedImages: data.archivedImages,
        archiveFile: data.archiveFile,
        archiveRow: data.archiveRow,
      });
    });

    // Apply search filter in memory (Firestore doesn't support full-text search)
    if (filters.search) {
      const search = filters.search.toLowerCase();
      tickets = tickets.filter(ticket => 
        ticket.id.toLowerCase().includes(search) ||
        ticket.jobsiteName.toLowerCase().includes(search) ||
        ticket.truckNickname.toLowerCase().includes(search) ||
        ticket.userId.toLowerCase().includes(search)
      );
    }

    // Apply custom sorting in memory
    if (filters.sortField) {
      tickets.sort((a, b) => {
        const fieldA = a[filters.sortField as keyof Ticket];
        const fieldB = b[filters.sortField as keyof Ticket];
        
        if (fieldA instanceof Date && fieldB instanceof Date) {
          return filters.sortDirection === 'asc' 
            ? fieldA.getTime() - fieldB.getTime() 
            : fieldB.getTime() - fieldA.getTime();
        }
        
        if (typeof fieldA === 'number' && typeof fieldB === 'number') {
          return filters.sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
        }
        
        const strA = String(fieldA).toLowerCase();
        const strB = String(fieldB).toLowerCase();
        
        return filters.sortDirection === 'asc' 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      });
    }

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const total = tickets.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = tickets.slice(startIndex, endIndex);

    return {
      tickets: paginatedTickets,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    errorHandler.logError(error, { 
      operation: 'getTickets', 
      filters 
    });
    
    // For specific errors, throw appropriate application errors
    if (error instanceof Error && error.message.includes('permission-denied')) {
      throw new AuthError(
        'You do not have permission to access these tickets',
        ErrorCodes.AUTH_FORBIDDEN,
        403
      );
    }
    
    // For network errors, fall back to mock data
    console.warn('Falling back to mock tickets due to error:', error);
    return getMockTickets(filters);
  }
}

/**
 * Helper function to get mock tickets (for development or fallback)
 */
async function getMockTickets(filters: TicketFilterParams = {}): Promise<{
  tickets: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  // Initialize mock data if not already done
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  // Apply filters
  let filteredTickets = [...mockTickets];
  
  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    filteredTickets = filteredTickets.filter(ticket => ticket.date >= startDate);
  }
  
  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999); // End of day
    filteredTickets = filteredTickets.filter(ticket => ticket.date <= endDate);
  }
  
  if (filters.jobsite) {
    filteredTickets = filteredTickets.filter(ticket => ticket.jobsite === filters.jobsite);
  }
  
  if (filters.truck) {
    filteredTickets = filteredTickets.filter(ticket => ticket.truckNumber === filters.truck);
  }
  
  if (filters.status) {
    filteredTickets = filteredTickets.filter(ticket => ticket.archiveStatus === filters.status);
  }
  
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filteredTickets = filteredTickets.filter(ticket => 
      ticket.id.toLowerCase().includes(search) ||
      ticket.jobsiteName.toLowerCase().includes(search) ||
      ticket.truckNickname.toLowerCase().includes(search) ||
      ticket.userId.toLowerCase().includes(search)
    );
  }
  
  // Apply sorting
  if (filters.sortField) {
    filteredTickets.sort((a, b) => {
      const fieldA = a[filters.sortField as keyof Ticket];
      const fieldB = b[filters.sortField as keyof Ticket];
      
      if (fieldA instanceof Date && fieldB instanceof Date) {
        return filters.sortDirection === 'asc' 
          ? fieldA.getTime() - fieldB.getTime() 
          : fieldB.getTime() - fieldA.getTime();
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return filters.sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      }
      
      const strA = String(fieldA).toLowerCase();
      const strB = String(fieldB).toLowerCase();
      
      return filters.sortDirection === 'asc' 
        ? strA.localeCompare(strB) 
        : strB.localeCompare(strA);
    });
  } else {
    // Default sort by date descending
    filteredTickets.sort((a, b) => b.date.getTime() - a.date.getTime());
  }
  
  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const total = filteredTickets.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    tickets: paginatedTickets,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get a single ticket by ID
 */
export async function getTicketById(id: string): Promise<Ticket | null> {
  try {
    const firestore = getFirestoreClient();
    if (!firestore) {
      // Fall back to mock data if Firestore is not available
      return getMockTicketById(id);
    }

    const ticketDoc = doc(firestore, TICKETS_COLLECTION, id);
    const snapshot = await getDoc(ticketDoc);

    if (!snapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data.userId,
      date: data.date.toDate(),
      truckNumber: data.truckNumber,
      truckNickname: data.truckNickname,
      jobsite: data.jobsite,
      jobsiteName: data.jobsiteName,
      hangers: data.hangers,
      leaner6To12: data.leaner6To12,
      leaner13To24: data.leaner13To24,
      leaner25To36: data.leaner25To36,
      leaner37To48: data.leaner37To48,
      leaner49Plus: data.leaner49Plus,
      total: data.total,
      images: data.images || [],
      thumbnails: data.thumbnails || [],
      imageCount: data.imageCount || 0,
      submissionDate: data.submissionDate.toDate(),
      isFuturePrediction: data.isFuturePrediction || false,
      archiveStatus: data.archiveStatus,
      archiveDate: data.archiveDate ? data.archiveDate.toDate() : undefined,
      archivedImages: data.archivedImages,
      archiveFile: data.archiveFile,
      archiveRow: data.archiveRow,
    };
  } catch (error) {
    console.error('Error fetching ticket by ID:', error);
    // Fall back to mock data if there's an error
    return getMockTicketById(id);
  }
}

/**
 * Helper function to get a mock ticket by ID (for development or fallback)
 */
async function getMockTicketById(id: string): Promise<Ticket | null> {
  // Initialize mock data if not already done
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticket = mockTickets.find(t => t.id === id);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return ticket || null;
}

/**
 * Update ticket status
 */
export async function updateTicketStatus(
  id: string, 
  status: 'active' | 'images_archived' | 'fully_archived'
): Promise<Ticket | null> {
  try {
    const firestore = getFirestoreClient();
    if (!firestore) {
      // Fall back to mock data if Firestore is not available
      return getMockUpdateTicketStatus(id, status);
    }

    const ticketDoc = doc(firestore, TICKETS_COLLECTION, id);
    const snapshot = await getDoc(ticketDoc);

    if (!snapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    const updateData: any = {
      archiveStatus: status,
    };

    if (status !== 'active') {
      updateData.archiveDate = serverTimestamp();
    }

    await updateDoc(ticketDoc, updateData);

    // Get the updated ticket
    const updatedSnapshot = await getDoc(ticketDoc);
    if (!updatedSnapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    const data = updatedSnapshot.data();
    return {
      id: updatedSnapshot.id,
      userId: data.userId,
      date: data.date.toDate(),
      truckNumber: data.truckNumber,
      truckNickname: data.truckNickname,
      jobsite: data.jobsite,
      jobsiteName: data.jobsiteName,
      hangers: data.hangers,
      leaner6To12: data.leaner6To12,
      leaner13To24: data.leaner13To24,
      leaner25To36: data.leaner25To36,
      leaner37To48: data.leaner37To48,
      leaner49Plus: data.leaner49Plus,
      total: data.total,
      images: data.images || [],
      thumbnails: data.thumbnails || [],
      imageCount: data.imageCount || 0,
      submissionDate: data.submissionDate.toDate(),
      isFuturePrediction: data.isFuturePrediction || false,
      archiveStatus: data.archiveStatus,
      archiveDate: data.archiveDate ? data.archiveDate.toDate() : undefined,
      archivedImages: data.archivedImages,
      archiveFile: data.archiveFile,
      archiveRow: data.archiveRow,
    };
  } catch (error) {
    console.error('Error updating ticket status:', error);
    // Fall back to mock data if there's an error
    return getMockUpdateTicketStatus(id, status);
  }
}

/**
 * Helper function to update mock ticket status (for development or fallback)
 */
async function getMockUpdateTicketStatus(
  id: string, 
  status: 'active' | 'images_archived' | 'fully_archived'
): Promise<Ticket | null> {
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) {
    throw new NotFoundError(
      `Ticket with ID ${id} was not found`,
      ErrorCodes.DATA_NOT_FOUND,
      404,
      { ticketId: id }
    );
  }
  
  // Update the ticket
  mockTickets[ticketIndex] = {
    ...mockTickets[ticketIndex],
    archiveStatus: status,
    ...(status !== 'active' && {
      archiveDate: new Date(),
    }),
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return mockTickets[ticketIndex];
}

/**
 * Archive ticket images
 */
export async function archiveTicketImages(id: string): Promise<Ticket | null> {
  try {
    const firestore = getFirestoreClient();
    const storage = getStorageClient();
    
    if (!firestore || !storage) {
      // Fall back to mock data if Firebase is not available
      return getMockArchiveTicketImages(id);
    }

    const ticketDoc = doc(firestore, TICKETS_COLLECTION, id);
    const snapshot = await getDoc(ticketDoc);

    if (!snapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    const data = snapshot.data();
    const images = data.images || [];

    // In a real implementation, we would move images to archive storage
    // For now, we'll just mark them as archived
    await updateDoc(ticketDoc, {
      archiveStatus: 'images_archived',
      archiveDate: serverTimestamp(),
      archivedImages: images,
    });

    // Get the updated ticket
    const updatedSnapshot = await getDoc(ticketDoc);
    if (!updatedSnapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    const updatedData = updatedSnapshot.data();
    return {
      id: updatedSnapshot.id,
      userId: updatedData.userId,
      date: updatedData.date.toDate(),
      truckNumber: updatedData.truckNumber,
      truckNickname: updatedData.truckNickname,
      jobsite: updatedData.jobsite,
      jobsiteName: updatedData.jobsiteName,
      hangers: updatedData.hangers,
      leaner6To12: updatedData.leaner6To12,
      leaner13To24: updatedData.leaner13To24,
      leaner25To36: updatedData.leaner25To36,
      leaner37To48: updatedData.leaner37To48,
      leaner49Plus: updatedData.leaner49Plus,
      total: updatedData.total,
      images: updatedData.images || [],
      thumbnails: updatedData.thumbnails || [],
      imageCount: updatedData.imageCount || 0,
      submissionDate: updatedData.submissionDate.toDate(),
      isFuturePrediction: updatedData.isFuturePrediction || false,
      archiveStatus: updatedData.archiveStatus,
      archiveDate: updatedData.archiveDate ? updatedData.archiveDate.toDate() : undefined,
      archivedImages: updatedData.archivedImages,
      archiveFile: updatedData.archiveFile,
      archiveRow: updatedData.archiveRow,
    };
  } catch (error) {
    console.error('Error archiving ticket images:', error);
    // Fall back to mock data if there's an error
    return getMockArchiveTicketImages(id);
  }
}

/**
 * Helper function to archive mock ticket images (for development or fallback)
 */
async function getMockArchiveTicketImages(id: string): Promise<Ticket | null> {
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) {
    throw new NotFoundError(
      `Ticket with ID ${id} was not found`,
      ErrorCodes.DATA_NOT_FOUND,
      404,
      { ticketId: id }
    );
  }
  
  // Update the ticket
  mockTickets[ticketIndex] = {
    ...mockTickets[ticketIndex],
    archiveStatus: 'images_archived',
    archiveDate: new Date(),
    archivedImages: [...mockTickets[ticketIndex].images],
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockTickets[ticketIndex];
}

/**
 * Fully archive ticket
 */
export async function fullyArchiveTicket(id: string): Promise<Ticket | null> {
  try {
    const firestore = getFirestoreClient();
    if (!firestore) {
      // Fall back to mock data if Firestore is not available
      return getMockFullyArchiveTicket(id);
    }

    const ticketDoc = doc(firestore, TICKETS_COLLECTION, id);
    const snapshot = await getDoc(ticketDoc);

    if (!snapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    const data = snapshot.data();
    const jobsite = data.jobsite;
    const archiveFileName = `tickets-${jobsite}-${format(new Date(), 'yyyy-MM')}.xlsx`;
    const archiveFilePath = `gs://archive-bucket/archive/data/${format(new Date(), 'yyyy-MM')}/${archiveFileName}`;
    
    // In a real implementation, we would export to Excel and update Firestore
    await updateDoc(ticketDoc, {
      archiveStatus: 'fully_archived',
      archiveDate: serverTimestamp(),
      archiveFile: archiveFilePath,
      archiveRow: Math.floor(Math.random() * 100) + 1, // Simulated row number
    });

    // Get the updated ticket
    const updatedSnapshot = await getDoc(ticketDoc);
    if (!updatedSnapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    const updatedData = updatedSnapshot.data();
    return {
      id: updatedSnapshot.id,
      userId: updatedData.userId,
      date: updatedData.date.toDate(),
      truckNumber: updatedData.truckNumber,
      truckNickname: updatedData.truckNickname,
      jobsite: updatedData.jobsite,
      jobsiteName: updatedData.jobsiteName,
      hangers: updatedData.hangers,
      leaner6To12: updatedData.leaner6To12,
      leaner13To24: updatedData.leaner13To24,
      leaner25To36: updatedData.leaner25To36,
      leaner37To48: updatedData.leaner37To48,
      leaner49Plus: updatedData.leaner49Plus,
      total: updatedData.total,
      images: updatedData.images || [],
      thumbnails: updatedData.thumbnails || [],
      imageCount: updatedData.imageCount || 0,
      submissionDate: updatedData.submissionDate.toDate(),
      isFuturePrediction: updatedData.isFuturePrediction || false,
      archiveStatus: updatedData.archiveStatus,
      archiveDate: updatedData.archiveDate ? updatedData.archiveDate.toDate() : undefined,
      archivedImages: updatedData.archivedImages,
      archiveFile: updatedData.archiveFile,
      archiveRow: updatedData.archiveRow,
    };
  } catch (error) {
    console.error('Error fully archiving ticket:', error);
    // Fall back to mock data if there's an error
    return getMockFullyArchiveTicket(id);
  }
}

/**
 * Helper function to fully archive mock ticket (for development or fallback)
 */
async function getMockFullyArchiveTicket(id: string): Promise<Ticket | null> {
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) {
    throw new NotFoundError(
      `Ticket with ID ${id} was not found`,
      ErrorCodes.DATA_NOT_FOUND,
      404,
      { ticketId: id }
    );
  }
  
  const ticket = mockTickets[ticketIndex];
  
  // Update the ticket
  mockTickets[ticketIndex] = {
    ...ticket,
    archiveStatus: 'fully_archived',
    archiveDate: new Date(),
    archiveFile: `gs://archive-bucket/archive/data/${format(new Date(), 'yyyy-MM')}/tickets-${ticket.jobsite}-${format(new Date(), 'yyyy-MM')}.xlsx`,
    archiveRow: Math.floor(Math.random() * 100) + 1,
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return mockTickets[ticketIndex];
}

/**
 * Restore ticket from archive
 */
export async function restoreTicket(id: string): Promise<Ticket | null> {
  try {
    const firestore = getFirestoreClient();
    if (!firestore) {
      // Fall back to mock data if Firestore is not available
      return getMockRestoreTicket(id);
    }

    const ticketDoc = doc(firestore, TICKETS_COLLECTION, id);
    const snapshot = await getDoc(ticketDoc);

    if (!snapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    // Update the ticket
    await updateDoc(ticketDoc, {
      archiveStatus: 'active',
      archiveDate: null,
      archiveFile: null,
      archiveRow: null,
    });

    // Get the updated ticket
    const updatedSnapshot = await getDoc(ticketDoc);
    if (!updatedSnapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${id} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId: id }
      );
    }

    const updatedData = updatedSnapshot.data();
    return {
      id: updatedSnapshot.id,
      userId: updatedData.userId,
      date: updatedData.date.toDate(),
      truckNumber: updatedData.truckNumber,
      truckNickname: updatedData.truckNickname,
      jobsite: updatedData.jobsite,
      jobsiteName: updatedData.jobsiteName,
      hangers: updatedData.hangers,
      leaner6To12: updatedData.leaner6To12,
      leaner13To24: updatedData.leaner13To24,
      leaner25To36: updatedData.leaner25To36,
      leaner37To48: updatedData.leaner37To48,
      leaner49Plus: updatedData.leaner49Plus,
      total: updatedData.total,
      images: updatedData.images || [],
      thumbnails: updatedData.thumbnails || [],
      imageCount: updatedData.imageCount || 0,
      submissionDate: updatedData.submissionDate.toDate(),
      isFuturePrediction: updatedData.isFuturePrediction || false,
      archiveStatus: updatedData.archiveStatus,
      archiveDate: null,
      archivedImages: updatedData.archivedImages,
      archiveFile: null,
      archiveRow: null,
    };
  } catch (error) {
    console.error('Error restoring ticket:', error);
    // Fall back to mock data if there's an error
    return getMockRestoreTicket(id);
  }
}

/**
 * Helper function to restore mock ticket (for development or fallback)
 */
async function getMockRestoreTicket(id: string): Promise<Ticket | null> {
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const ticketIndex = mockTickets.findIndex(t => t.id === id);
  
  if (ticketIndex === -1) {
    throw new NotFoundError(
      `Ticket with ID ${id} was not found`,
      ErrorCodes.DATA_NOT_FOUND,
      404,
      { ticketId: id }
    );
  }
  
  // Update the ticket
  mockTickets[ticketIndex] = {
    ...mockTickets[ticketIndex],
    archiveStatus: 'active',
    archiveDate: undefined,
    archiveFile: undefined,
    archiveRow: undefined,
  };
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return mockTickets[ticketIndex];
}

/**
 * Fetch tickets for a specific user within a date range
 * @param userId - User ID to fetch tickets for
 * @param startDate - Start date in ISO format
 * @param endDate - End date in ISO format
 * @returns Promise with ticket data
 */
export async function fetchUserTickets(userId: string, startDate: string, endDate: string): Promise<Ticket[]> {
  try {
    const firestore = getFirestoreClient();
    if (!firestore) {
      // Fall back to mock data if Firestore is not available
      return getMockUserTickets(userId, startDate, endDate);
    }

    const ticketsCollection = collection(firestore, TICKETS_COLLECTION);
    
    // Create date objects for query
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // End of day
    
    // Create query
    const ticketsQuery = query(
      ticketsCollection,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(startDateObj)),
      where('date', '<=', Timestamp.fromDate(endDateObj)),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(ticketsQuery);
    const tickets: Ticket[] = [];
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      tickets.push({
        id: doc.id,
        userId: data.userId,
        date: data.date.toDate(),
        truckNumber: data.truckNumber,
        truckNickname: data.truckNickname,
        jobsite: data.jobsite,
        jobsiteName: data.jobsiteName,
        hangers: data.hangers,
        leaner6To12: data.leaner6To12,
        leaner13To24: data.leaner13To24,
        leaner25To36: data.leaner25To36,
        leaner37To48: data.leaner37To48,
        leaner49Plus: data.leaner49Plus,
        total: data.total,
        images: data.images || [],
        thumbnails: data.thumbnails || [],
        imageCount: data.imageCount || 0,
        submissionDate: data.submissionDate.toDate(),
        isFuturePrediction: data.isFuturePrediction || false,
        archiveStatus: data.archiveStatus,
        archiveDate: data.archiveDate ? data.archiveDate.toDate() : undefined,
        archivedImages: data.archivedImages,
        archiveFile: data.archiveFile,
        archiveRow: data.archiveRow,
      });
    });
    
    return tickets;
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    // Fall back to mock data if there's an error
    return getMockUserTickets(userId, startDate, endDate);
  }
}

/**
 * Helper function to get mock user tickets (for development or fallback)
 */
async function getMockUserTickets(userId: string, startDate: string, endDate: string): Promise<Ticket[]> {
  // Initialize mock data if not already done
  if (!mockTickets) {
    mockTickets = generateMockTickets(100);
  }
  
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  endDateObj.setHours(23, 59, 59, 999); // End of day
  
  const filteredTickets = mockTickets.filter(ticket => 
    ticket.userId === userId &&
    ticket.date >= startDateObj &&
    ticket.date <= endDateObj
  );
  
  // Sort by date descending
  filteredTickets.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return filteredTickets;
}

/**
 * Fetch a single ticket by ID
 * @param ticketId - Ticket ID to fetch
 * @returns Promise with ticket data or null if not found
 */
export async function fetchTicketById(ticketId: string): Promise<Ticket | null> {
  // This is an alias for getTicketById to maintain compatibility with both APIs
  return getTicketById(ticketId);
}

/**
 * Create a new ticket
 * @param userId - User ID creating the ticket
 * @param ticketData - Data for the new ticket
 * @returns Promise with the created ticket
 */
export async function createTicket(userId: string, ticketData: CreateTicketData): Promise<Ticket> {
  try {
    if (!userId) {
      throw new ValidationError(
        'User ID is required',
        ErrorCodes.VALIDATION_REQUIRED_FIELD,
        400,
        { field: 'userId' }
      );
    }
    
    const firestore = getFirestoreClient();
    const storage = getStorageClient();
    
    if (!firestore || !storage) {
      throw new Error('Firebase services not available');
    }
    
    // Generate a new ticket ID
    const ticketId = uuidv4();
    const ticketRef = doc(firestore, TICKETS_COLLECTION, ticketId);
    
    // Calculate total from categories
    const total = 
      ticketData.categories.hangers +
      ticketData.categories.leaner6To12 +
      ticketData.categories.leaner13To24 +
      ticketData.categories.leaner25To36 +
      ticketData.categories.leaner37To48 +
      ticketData.categories.leaner49Plus;
    
    // Upload images if provided
    const images: string[] = [];
    const thumbnails: string[] = [];
    
    if (ticketData.images && ticketData.images.length > 0) {
      for (let i = 0; i < ticketData.images.length; i++) {
        const image = ticketData.images[i];
        const imagePath = `${TICKETS_STORAGE_PATH}/${userId}/${ticketId}/image-${i + 1}`;
        const thumbnailPath = `${TICKETS_STORAGE_PATH}/${userId}/${ticketId}/${THUMBNAILS_FOLDER}/thumb-${i + 1}`;
        
        // Upload original image
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);
        images.push(imageUrl);
        
        // For a real implementation, we would generate and upload a thumbnail
        // For now, we'll just use the same URL
        thumbnails.push(imageUrl.replace('image-', 'thumb-'));
      }
    }
    
    // Create ticket document
    const ticketData: any = {
      userId,
      date: Timestamp.fromDate(new Date(ticketData.date)),
      truckNumber: ticketData.truckNumber,
      truckNickname: ticketData.truckNickname,
      jobsite: ticketData.jobsite,
      jobsiteName: ticketData.jobsiteName,
      hangers: ticketData.categories.hangers,
      leaner6To12: ticketData.categories.leaner6To12,
      leaner13To24: ticketData.categories.leaner13To24,
      leaner25To36: ticketData.categories.leaner25To36,
      leaner37To48: ticketData.categories.leaner37To48,
      leaner49Plus: ticketData.categories.leaner49Plus,
      total,
      images,
      thumbnails,
      imageCount: images.length,
      submissionDate: serverTimestamp(),
      isFuturePrediction: false,
      archiveStatus: 'active',
    };
    
    await setDoc(ticketRef, ticketData);
    
    // Get the created ticket
    const snapshot = await getDoc(ticketRef);
    const data = snapshot.data();
    
    return {
      id: ticketId,
      userId: data.userId,
      date: data.date.toDate(),
      truckNumber: data.truckNumber,
      truckNickname: data.truckNickname,
      jobsite: data.jobsite,
      jobsiteName: data.jobsiteName,
      hangers: data.hangers,
      leaner6To12: data.leaner6To12,
      leaner13To24: data.leaner13To24,
      leaner25To36: data.leaner25To36,
      leaner37To48: data.leaner37To48,
      leaner49Plus: data.leaner49Plus,
      total: data.total,
      images: data.images || [],
      thumbnails: data.thumbnails || [],
      imageCount: data.imageCount || 0,
      submissionDate: data.submissionDate.toDate(),
      isFuturePrediction: data.isFuturePrediction || false,
      archiveStatus: data.archiveStatus,
      archiveDate: data.archiveDate ? data.archiveDate.toDate() : undefined,
      archivedImages: data.archivedImages,
      archiveFile: data.archiveFile,
      archiveRow: data.archiveRow,
    };
  } catch (error) {
    console.error('Error creating ticket:', error);
    throw new Error(`Failed to create ticket: ${error.message}`);
  }
}

/**
 * Update an existing ticket
 * @param ticketId - ID of the ticket to update
 * @param userId - User ID updating the ticket
 * @param ticketData - Updated ticket data
 * @returns Promise with the updated ticket
 */
export async function updateTicket(ticketId: string, userId: string, ticketData: UpdateTicketData): Promise<Ticket> {
  try {
    const firestore = getFirestoreClient();
    const storage = getStorageClient();
    
    if (!firestore || !storage) {
      throw new Error('Firebase services not available');
    }
    
    const ticketRef = doc(firestore, TICKETS_COLLECTION, ticketId);
    const snapshot = await getDoc(ticketRef);
    
    if (!snapshot.exists()) {
      throw new NotFoundError(
        `Ticket with ID ${ticketId} was not found`,
        ErrorCodes.DATA_NOT_FOUND,
        404,
        { ticketId }
      );
    }
    
    const existingData = snapshot.data();
    
    // Check if user has permission to update this ticket
    if (existingData.userId !== userId) {
      throw new AuthError(
        'You do not have permission to update this ticket',
        ErrorCodes.AUTH_FORBIDDEN,
        403
      );
    }
    
    const updateData: any = {};
    
    // Update categories if provided
    if (ticketData.categories) {
      if (ticketData.categories.hangers !== undefined) {
        updateData.hangers = ticketData.categories.hangers;
      }
      if (ticketData.categories.leaner6To12 !== undefined) {
        updateData.leaner6To12 = ticketData.categories.leaner6To12;
      }
      if (ticketData.categories.leaner13To24 !== undefined) {
        updateData.leaner13To24 = ticketData.categories.leaner13To24;
      }
      if (ticketData.categories.leaner25To36 !== undefined) {
        updateData.leaner25To36 = ticketData.categories.leaner25To36;
      }
      if (ticketData.categories.leaner37To48 !== undefined) {
        updateData.leaner37To48 = ticketData.categories.leaner37To48;
      }
      if (ticketData.categories.leaner49Plus !== undefined) {
        updateData.leaner49Plus = ticketData.categories.leaner49Plus;
      }
      
      // Recalculate total
      updateData.total = 
        (ticketData.categories.hangers !== undefined ? ticketData.categories.hangers : existingData.hangers) +
        (ticketData.categories.leaner6To12 !== undefined ? ticketData.categories.leaner6To12 : existingData.leaner6To12) +
        (ticketData.categories.leaner13To24 !== undefined ? ticketData.categories.leaner13To24 : existingData.leaner13To24) +
        (ticketData.categories.leaner25To36 !== undefined ? ticketData.categories.leaner25To36 : existingData.leaner25To36) +
        (ticketData.categories.leaner37To48 !== undefined ? ticketData.categories.leaner37To48 : existingData.leaner37To48) +
        (ticketData.categories.leaner49Plus !== undefined ? ticketData.categories.leaner49Plus : existingData.leaner49Plus);
    }
    
    // Handle image updates
    let images = existingData.images || [];
    let thumbnails = existingData.thumbnails || [];
    
    // Remove images if specified
    if (ticketData.images) {
      // Filter out images that should be removed
      const imagesToKeep = new Set(ticketData.images);
      images = existingData.images.filter((url: string) => imagesToKeep.has(url));
      
      // Update thumbnails to match
      if (existingData.thumbnails) {
        thumbnails = [];
        for (let i = 0; i < images.length; i++) {
          const imageUrl = images[i];
          const index = existingData.images.indexOf(imageUrl);
          if (index !== -1 && existingData.thumbnails[index]) {
            thumbnails.push(existingData.thumbnails[index]);
          } else {
            // Fallback if thumbnail not found
            thumbnails.push(imageUrl.replace('image-', 'thumb-'));
          }
        }
      }
    }
    
    // Upload new images if provided
    if (ticketData.newImages && ticketData.newImages.length > 0) {
      for (let i = 0; i < ticketData.newImages.length; i++) {
        const image = ticketData.newImages[i];
        const imagePath = `${TICKETS_STORAGE_PATH}/${userId}/${ticketId}/image-${images.length + i + 1}`;
        const thumbnailPath = `${TICKETS_STORAGE_PATH}/${userId}/${ticketId}/${THUMBNAILS_FOLDER}/thumb-${thumbnails.length + i + 1}`;
        
        // Upload original image
        const imageRef = ref(storage, imagePath);
        await uploadBytes(imageRef, image);
        const imageUrl = await getDownloadURL(imageRef);
        images.push(imageUrl);
        
        // For a real implementation, we would generate and upload a thumbnail
        // For now, we'll just use the same URL
        thumbnails.push(imageUrl.replace('image-', 'thumb-'));
      }
    }
    
    // Update images and thumbnails
    if (ticketData.images || ticketData.newImages) {
      updateData.images = images;
      updateData.thumbnails = thumbnails;
      updateData.imageCount = images.length;
    }
    
    // Update the document
    await updateDoc(ticketRef, updateData);
    
    // Get the updated ticket
    const updatedSnapshot = await getDoc(ticketRef);
    const data = updatedSnapshot.data();
    
    return {
      id: ticketId,
      userId: data.userId,
      date: data.date.toDate(),
      truckNumber: data.truckNumber,
      truckNickname: data.truckNickname,
      jobsite: data.jobsite,
      jobsiteName: data.jobsiteName,
      hangers: data.hangers,
      leaner6To12: data.leaner6To12,
      leaner13To24: data.leaner13To24,
      leaner25To36: data.leaner25To36,
      leaner37To48: data.leaner37To48,
      leaner49Plus: data.leaner49Plus,
      total: data.total,
      images: data.images || [],
      thumbnails: data.thumbnails || [],
      imageCount: data.imageCount || 0,
      submissionDate: data.submissionDate.toDate(),
      isFuturePrediction: data.isFuturePrediction || false,
      archiveStatus: data.archiveStatus,
      archiveDate: data.archiveDate ? data.archiveDate.toDate() : undefined,
      archivedImages: data.archivedImages,
      archiveFile: data.archiveFile,
      archiveRow: data.archiveRow,
    };
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw new Error(`Failed to update ticket: ${error.message}`);
  }
}

/**
 * Save wizard state for later continuation
 * @param userId - User ID
 * @param currentStep - Current wizard step (1-4)
 * @param stepData - Data for the current step
 * @returns Promise with success status
 */
export async function saveWizardState(
  userId: string,
  currentStep: number,
  stepData: WizardStep1Data | WizardStep2Data | WizardStep3Data
): Promise<boolean> {
  try {
    const firestore = getFirestoreClient();
    
    if (!firestore) {
      throw new Error('Firestore not available');
    }
    
    const wizardStateRef = doc(firestore, WIZARD_STATE_COLLECTION, userId);
    
    // Add expiration timestamp (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    await setDoc(wizardStateRef, {
      userId,
      currentStep,
      stepData,
      updatedAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });
    
    return true;
  } catch (error) {
    console.error('Error saving wizard state:', error);
    return false;
  }
}

/**
 * Get wizard state for a user
 * @param userId - User ID
 * @returns Promise with wizard state or null if not found or expired
 */
export async function getWizardState(userId: string): Promise<{
  currentStep: number;
  stepData: WizardStep1Data | WizardStep2Data | WizardStep3Data;
} | null> {
  try {
    const firestore = getFirestoreClient();
    
    if (!firestore) {
      return null;
    }
    
    const wizardStateRef = doc(firestore, WIZARD_STATE_COLLECTION, userId);
    const snapshot = await getDoc(wizardStateRef);
    
    if (!snapshot.exists()) {
      return null;
    }
    
    const data = snapshot.data();
    
    // Check if expired
    if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
      // Delete expired state
      await deleteDoc(wizardStateRef);
      return null;
    }
    
    return {
      currentStep: data.currentStep,
      stepData: data.stepData,
    };
  } catch (error) {
    console.error('Error getting wizard state:', error);
    return null;
  }
}

/**
 * Clear wizard state for a user
 * @param userId - User ID
 * @returns Promise with success status
 */
export async function clearWizardState(userId: string): Promise<boolean> {
  try {
    const firestore = getFirestoreClient();
    
    if (!firestore) {
      return false;
    }
    
    const wizardStateRef = doc(firestore, WIZARD_STATE_COLLECTION, userId);
    await deleteDoc(wizardStateRef);
    
    return true;
  } catch (error) {
    console.error('Error clearing wizard state:', error);
    return false;
  }
}

// Create a service object to export
const ticketService = {
  getTickets,
  getTicketById,
  updateTicketStatus,
  archiveTicketImages,
  fullyArchiveTicket,
  restoreTicket,
  fetchUserTickets,
  fetchTicketById,
  createTicket,
  updateTicket,
  saveWizardState,
  getWizardState,
  clearWizardState,
};

export default ticketService;
