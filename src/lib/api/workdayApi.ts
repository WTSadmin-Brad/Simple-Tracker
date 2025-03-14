/**
 * Workday API client functions
 * 
 * @source directory-structure.md - "API client functions" section
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { ApiResponse, PaginatedResponse } from '../../types/api';
import { Workday, WorkdayType, WorkdayWithTickets } from '../../types/workday';

/**
 * Base URL for workday API endpoints
 */
const WORKDAY_API_BASE = '/api/workdays';

/**
 * Get workdays for a specific month
 * 
 * @param year - Year to fetch workdays for
 * @param month - Month to fetch workdays for (0-11)
 * @returns Promise with workday data
 */
export async function getMonthWorkdays(
  year: number,
  month: number
): Promise<ApiResponse<Workday[]>> {
  try {
    const response = await fetch(
      `${WORKDAY_API_BASE}?year=${year}&month=${month}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch workdays');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch workdays'
    };
  }
}

/**
 * Get workday details for a specific date
 * 
 * @param date - ISO date string
 * @returns Promise with workday details including ticket summary if available
 */
export async function getWorkdayDetails(
  date: string
): Promise<ApiResponse<WorkdayWithTickets>> {
  try {
    const response = await fetch(
      `${WORKDAY_API_BASE}/${date}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch workday details');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch workday details'
    };
  }
}

/**
 * Create a new workday entry
 * 
 * @param date - ISO date string
 * @param jobsite - Jobsite ID
 * @param workType - Work type (full, half, off)
 * @returns Promise with created workday data
 */
export async function createWorkday(
  date: string,
  jobsite: string,
  workType: WorkdayType
): Promise<ApiResponse<Workday>> {
  try {
    const response = await fetch(
      WORKDAY_API_BASE,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          jobsite,
          workType
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to create workday');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create workday'
    };
  }
}

/**
 * Update an existing workday entry
 * 
 * @param id - Workday ID
 * @param jobsite - Jobsite ID
 * @param workType - Work type (full, half, off)
 * @returns Promise with updated workday data
 */
export async function updateWorkday(
  id: string,
  jobsite: string,
  workType: WorkdayType
): Promise<ApiResponse<Workday>> {
  try {
    const response = await fetch(
      `${WORKDAY_API_BASE}/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobsite,
          workType
        })
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to update workday');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update workday'
    };
  }
}
