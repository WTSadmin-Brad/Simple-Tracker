/**
 * Workday API client functions
 */

import { apiRequest } from './apiClient';
import { StandardResponse } from './apiClient';
import { Workday, WorkdayType, WorkdayWithTickets } from '@/types/workday';
import { WorkdayResponse, WorkdaysResponse } from '@/types/api';
import { ErrorCodes } from '@/lib/errors/error-types';

/**
 * API endpoints for workday operations
 */
const ENDPOINTS = {
  WORKDAYS: '/api/workdays',
  WORKDAY: (id: string) => `/api/workdays/${id}`,
  WORKDAY_DATE: (date: string) => `/api/workdays/date/${date}`,
  WORKDAY_MONTH: (year: number, month: number) => `/api/workdays/month/${year}/${month}`,
};

/**
 * Get workdays for a specific month
 * 
 * @param year - Year to fetch workdays for
 * @param month - Month to fetch workdays for (0-11)
 * @returns Promise with standardized response containing workday data
 */
export async function getMonthWorkdays(
  year: number,
  month: number
): Promise<StandardResponse<WorkdaysResponse>> {
  return apiRequest<WorkdaysResponse>(ENDPOINTS.WORKDAY_MONTH(year, month));
}

/**
 * Get workday details for a specific date
 * 
 * @param date - ISO date string
 * @returns Promise with standardized response containing workday details
 */
export async function getWorkdayDetails(
  date: string
): Promise<StandardResponse<WorkdayResponse>> {
  return apiRequest<WorkdayResponse>(ENDPOINTS.WORKDAY_DATE(date));
}

/**
 * Create a new workday entry
 * 
 * @param date - ISO date string
 * @param jobsite - Jobsite ID
 * @param workType - Work type (full, half, off)
 * @returns Promise with standardized response containing created workday
 */
export async function createWorkday(
  date: string,
  jobsite: string,
  workType: WorkdayType
): Promise<StandardResponse<WorkdayResponse>> {
  return apiRequest<WorkdayResponse>(ENDPOINTS.WORKDAYS, {
    method: 'POST',
    body: {
      date,
      jobsite,
      workType
    }
  });
}

/**
 * Update an existing workday entry
 * 
 * @param id - Workday ID
 * @param jobsite - Jobsite ID
 * @param workType - Work type (full, half, off)
 * @returns Promise with standardized response containing updated workday
 */
export async function updateWorkday(
  id: string,
  jobsite: string,
  workType: WorkdayType
): Promise<StandardResponse<WorkdayResponse>> {
  return apiRequest<WorkdayResponse>(ENDPOINTS.WORKDAY(id), {
    method: 'PUT',
    body: {
      jobsite,
      workType
    }
  });
}

/**
 * Delete a workday entry
 * 
 * @param id - Workday ID
 * @returns Promise with standardized response
 */
export async function deleteWorkday(
  id: string
): Promise<StandardResponse> {
  return apiRequest(ENDPOINTS.WORKDAY(id), {
    method: 'DELETE'
  });
}
