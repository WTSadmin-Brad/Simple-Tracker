/**
 * Workday type definitions
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

/**
 * Types of workdays an employee can log
 * - full: Full workday
 * - half: Half workday
 * - off: Day off
 */
export type WorkdayType = 'full' | 'half' | 'off';

/**
 * Workday data structure
 */
export interface Workday {
  id: string;
  date: string;
  jobsite: string;
  jobsiteName: string;
  workType: WorkdayType;
  editableUntil: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Workday with optional ticket summary information
 */
export interface WorkdayWithTickets extends Workday {
  ticketSummary?: {
    totalTickets: number;
    categories: {
      name: string;
      count: number;
    }[];
    truckInfo?: string;
  };
}
