/**
 * Workday Service
 * Handles API interactions for workday data
 * 
 * Provides methods for:
 * - Fetching workdays for a specific month
 * - Creating new workdays
 * - Updating existing workdays
 * - Validating edit permissions
 */

import { format } from 'date-fns';
import { WorkdayType, WorkdayWithTickets } from '@/types/workday';

// This will be used in the actual API implementation
// const API_BASE_URL = '/api/workdays';

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
 * @returns Promise with workday data
 */
export async function fetchWorkdaysForMonth(year: number, month: number): Promise<WorkdayWithTickets[]> {
  try {
    // In a real implementation, this would call an actual API
    // For now, we'll simulate the API with mock data
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate some mock data for the month
    const mockData = generateMockWorkdays(year, month);
    
    return mockData;
  } catch (error) {
    console.error('Error fetching workdays:', error);
    throw new Error('Failed to fetch workdays for the month');
  }
}

/**
 * Create a new workday
 * @param workdayData - Data for the new workday
 * @returns Promise with the created workday
 */
export async function createWorkday(workdayData: CreateWorkdayData): Promise<WorkdayWithTickets> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would call an actual API
    // For now, we'll simulate the API response
    
    const createdAt = new Date().toISOString();
    
    // Create mock workday
    const newWorkday: WorkdayWithTickets = {
      id: `workday-${Date.now()}`,
      date: workdayData.date,
      jobsite: workdayData.jobsite,
      jobsiteName: workdayData.jobsiteName,
      workType: workdayData.workType,
      userId: 'current-user',
      editableUntil: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      createdAt,
      updatedAt: createdAt,
      ticketSummary: undefined // New workdays don't have tickets yet
    };
    
    return newWorkday;
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
export async function updateWorkday(id: string, workdayData: UpdateWorkdayData): Promise<WorkdayWithTickets> {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real implementation, this would call an actual API
    // For now, we'll simulate the API response
    
    // Create mock updated workday
    const updatedWorkday: WorkdayWithTickets = {
      id,
      date: format(new Date(), 'yyyy-MM-dd'), // This would come from the existing workday
      jobsite: workdayData.jobsite || 'jobsite-1',
      jobsiteName: workdayData.jobsiteName || 'Main Construction Site',
      workType: workdayData.workType || 'full',
      userId: 'current-user',
      editableUntil: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ticketSummary: undefined // This would be preserved from the existing workday
    };
    
    return updatedWorkday;
  } catch (error) {
    console.error('Error updating workday:', error);
    throw new Error('Failed to update workday');
  }
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
  updateWorkday
};

export default workdayService;
