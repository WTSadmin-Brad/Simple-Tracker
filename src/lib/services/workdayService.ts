/**
 * Workday Service
 * Handles interactions with Firestore for workday data
 * 
 * Provides methods for:
 * - Fetching workdays for a specific month
 * - Creating new workdays
 * - Updating existing workdays
 * - Validating edit permissions
 */

import { format, startOfMonth, endOfMonth } from 'date-fns';
import { collection, query, where, orderBy, getDocs, doc, getDoc, setDoc, updateDoc, Timestamp, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { getFirestoreClient } from '@/lib/firebase/client';
import { WorkdayType, WorkdayWithTickets } from '@/types/workday';

// Collection name in Firestore
const WORKDAYS_COLLECTION = 'workdays';

/**
 * Interface for creating a new workday
 */
interface CreateWorkdayData {
  date: string;
  jobsite: string;
  jobsiteName: string;
  workType: WorkdayType;
}

/**
 * Interface for updating an existing workday
 */
interface UpdateWorkdayData {
  workType?: WorkdayType;
  jobsite?: string;
  jobsiteName?: string;
}

/**
 * Fetch workdays for a specific month
 * @param year - Year to fetch
 * @param month - Month to fetch (1-12)
 * @param userId - User ID to fetch workdays for
 * @returns Promise with workday data
 */
export async function fetchWorkdaysForMonth(
  year: number, 
  month: number, 
  userId: string = 'current-user'
): Promise<WorkdayWithTickets[]> {
  try {
    const db = getFirestoreClient();
    
    if (!db) {
      console.warn('Firestore not available, using mock data');
      return generateMockWorkdays(year, month);
    }
    
    // Calculate start and end dates for the month
    const start = startOfMonth(new Date(year, month - 1));
    const end = endOfMonth(new Date(year, month - 1));
    
    // Query Firestore for workdays in the date range for the user
    const workdaysRef = collection(db, WORKDAYS_COLLECTION);
    const q = query(
      workdaysRef,
      where('userId', '==', userId),
      where('date', '>=', format(start, 'yyyy-MM-dd')),
      where('date', '<=', format(end, 'yyyy-MM-dd')),
      orderBy('date', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return generateMockWorkdays(year, month);
    }
    
    // Convert Firestore documents to WorkdayWithTickets objects
    const workdays: WorkdayWithTickets[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      workdays.push({
        id: doc.id,
        date: data.date,
        jobsite: data.jobsite,
        jobsiteName: data.jobsiteName,
        workType: data.workType,
        userId: data.userId,
        editableUntil: data.editableUntil,
        createdAt: data.createdAt?.toDate?.() 
          ? data.createdAt.toDate().toISOString() 
          : new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.() 
          ? data.updatedAt.toDate().toISOString() 
          : new Date().toISOString(),
        ticketSummary: data.ticketSummary
      });
    });
    
    return workdays;
  } catch (error) {
    console.error('Error fetching workdays:', error);
    throw new Error('Failed to fetch workdays for the month');
  }
}

/**
 * Create a new workday
 * @param workdayData - Data for the new workday
 * @param userId - User ID to create workday for
 * @returns Promise with the created workday
 */
export async function createWorkday(
  workdayData: CreateWorkdayData, 
  userId: string = 'current-user'
): Promise<WorkdayWithTickets> {
  try {
    const db = getFirestoreClient();
    
    if (!db) {
      console.warn('Firestore not available, using mock data');
      // Return mock data for development
      return createMockWorkday(workdayData);
    }
    
    const workdayId = uuidv4();
    const createdAt = serverTimestamp();
    const editableUntil = format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    
    // Create new workday document in Firestore
    const workdayRef = doc(db, WORKDAYS_COLLECTION, workdayId);
    
    const workdayDoc = {
      date: workdayData.date,
      jobsite: workdayData.jobsite,
      jobsiteName: workdayData.jobsiteName,
      workType: workdayData.workType,
      userId,
      editableUntil,
      createdAt,
      updatedAt: createdAt,
      ticketSummary: null
    };
    
    await setDoc(workdayRef, workdayDoc);
    
    // Return the created workday
    return {
      id: workdayId,
      date: workdayData.date,
      jobsite: workdayData.jobsite,
      jobsiteName: workdayData.jobsiteName,
      workType: workdayData.workType,
      userId,
      editableUntil,
      createdAt: new Date().toISOString(), // Use current date since serverTimestamp isn't available client-side
      updatedAt: new Date().toISOString(),
      ticketSummary: undefined
    };
  } catch (error) {
    console.error('Error creating workday:', error);
    throw new Error('Failed to create workday');
  }
}

/**
 * Update an existing workday
 * @param id - ID of the workday to update
 * @param workdayData - Updated workday data
 * @returns Promise with the updated workday
 */
export async function updateWorkday(
  id: string, 
  workdayData: UpdateWorkdayData
): Promise<WorkdayWithTickets> {
  try {
    const db = getFirestoreClient();
    
    if (!db) {
      console.warn('Firestore not available, using mock data');
      return updateMockWorkday(id, workdayData);
    }
    
    // Get the existing workday
    const workdayRef = doc(db, WORKDAYS_COLLECTION, id);
    const workdaySnap = await getDoc(workdayRef);
    
    if (!workdaySnap.exists()) {
      throw new Error(`Workday with ID ${id} not found`);
    }
    
    const existingWorkday = workdaySnap.data();
    const updatedAt = serverTimestamp();
    
    // Update only the fields that were provided
    const updateData: any = {
      updatedAt
    };
    
    if (workdayData.workType !== undefined) {
      updateData.workType = workdayData.workType;
    }
    
    if (workdayData.jobsite !== undefined) {
      updateData.jobsite = workdayData.jobsite;
    }
    
    if (workdayData.jobsiteName !== undefined) {
      updateData.jobsiteName = workdayData.jobsiteName;
    }
    
    // Update the workday in Firestore
    await updateDoc(workdayRef, updateData);
    
    // Return the updated workday
    return {
      id,
      date: existingWorkday.date,
      jobsite: workdayData.jobsite || existingWorkday.jobsite,
      jobsiteName: workdayData.jobsiteName || existingWorkday.jobsiteName,
      workType: workdayData.workType || existingWorkday.workType,
      userId: existingWorkday.userId,
      editableUntil: existingWorkday.editableUntil,
      createdAt: existingWorkday.createdAt?.toDate?.() 
        ? existingWorkday.createdAt.toDate().toISOString() 
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ticketSummary: existingWorkday.ticketSummary
    };
  } catch (error) {
    console.error('Error updating workday:', error);
    throw new Error('Failed to update workday');
  }
}

/**
 * Update ticket summary for a workday
 * @param workdayId - ID of the workday to update
 * @param ticketSummary - Summary of tickets for the workday
 */
export async function updateWorkdayTicketSummary(
  workdayId: string,
  ticketSummary: WorkdayWithTickets['ticketSummary']
): Promise<void> {
  try {
    const db = getFirestoreClient();
    
    if (!db) {
      console.warn('Firestore not available, cannot update ticket summary');
      return;
    }
    
    const workdayRef = doc(db, WORKDAYS_COLLECTION, workdayId);
    
    await updateDoc(workdayRef, {
      ticketSummary,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating workday ticket summary:', error);
    throw new Error('Failed to update workday ticket summary');
  }
}

/**
 * Helper function to create a mock workday for development
 */
function createMockWorkday(workdayData: CreateWorkdayData): WorkdayWithTickets {
  const createdAt = new Date().toISOString();
  
  return {
    id: `workday-${Date.now()}`,
    date: workdayData.date,
    jobsite: workdayData.jobsite,
    jobsiteName: workdayData.jobsiteName,
    workType: workdayData.workType,
    userId: 'current-user',
    editableUntil: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    createdAt,
    updatedAt: createdAt,
    ticketSummary: undefined
  };
}

/**
 * Helper function to update a mock workday for development
 */
function updateMockWorkday(id: string, workdayData: UpdateWorkdayData): WorkdayWithTickets {
  return {
    id,
    date: format(new Date(), 'yyyy-MM-dd'),
    jobsite: workdayData.jobsite || 'jobsite-1',
    jobsiteName: workdayData.jobsiteName || 'Main Construction Site',
    workType: workdayData.workType || 'full',
    userId: 'current-user',
    editableUntil: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ticketSummary: undefined
  };
}

/**
 * Generate mock workday data for testing
 * @param year - Year to generate data for
 * @param month - Month to generate data for (1-12)
 * @returns Array of mock workdays
 */
function generateMockWorkdays(year: number, month: number): WorkdayWithTickets[] {
  const workdays: WorkdayWithTickets[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Generate workdays for some days in the month
  for (let day = 1; day <= daysInMonth; day++) {
    // Only create workdays for weekdays (Monday-Friday)
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // 70% chance of having a workday
      if (Math.random() < 0.7) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const createdAt = new Date(date).toISOString();
        
        // Randomly assign work type
        const workTypes: WorkdayType[] = ['full', 'half', 'off'];
        const workType = workTypes[Math.floor(Math.random() * workTypes.length)];
        
        // 30% chance of having tickets
        const hasTickets = Math.random() < 0.3;
        
        workdays.push({
          id: `workday-${year}-${month}-${day}`,
          date: formattedDate,
          jobsite: 'jobsite-1',
          jobsiteName: 'Main Construction Site',
          workType,
          userId: 'current-user',
          editableUntil: format(new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          createdAt,
          updatedAt: createdAt,
          ticketSummary: hasTickets ? {
            totalTickets: Math.floor(Math.random() * 5) + 1,
            truckInfo: 'Truck #' + (Math.floor(Math.random() * 10) + 1),
            categories: [
              { name: 'Category A', count: Math.floor(Math.random() * 50) },
              { name: 'Category B', count: Math.floor(Math.random() * 30) },
              { name: 'Category C', count: Math.floor(Math.random() * 20) }
            ]
          } : undefined
        });
      }
    }
  }
  
  return workdays;
}

// Create a service object to export
const workdayService = {
  fetchWorkdaysForMonth,
  createWorkday,
  updateWorkday,
  updateWorkdayTicketSummary
};

export default workdayService;
