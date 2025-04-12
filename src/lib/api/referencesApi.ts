/**
 * Reference data API client functions
 */

import { apiRequest, StandardResponse } from './apiClient';
import { JobsitesResponse, TrucksResponse } from '@/types/api';
import { Jobsite, Truck } from '@/types/firebase';

/**
 * API endpoints for reference data operations
 */
const ENDPOINTS = {
  JOBSITES: '/api/references/jobsites',
  JOBSITES_SEARCH: (query: string) => `/api/references/jobsites/search?q=${encodeURIComponent(query)}`,
  TRUCKS: '/api/references/trucks',
  TRUCKS_SEARCH: (query: string) => `/api/references/trucks/search?q=${encodeURIComponent(query)}`,
  CATEGORIES: '/api/references/categories',
  USER_PREFERENCES: '/api/references/user-preferences',
};

/**
 * Get all jobsites
 * 
 * @returns Promise with standardized response containing jobsite data
 */
export async function getJobsites(): Promise<StandardResponse<JobsitesResponse>> {
  return apiRequest<JobsitesResponse>(ENDPOINTS.JOBSITES);
}

/**
 * Search jobsites by name
 * 
 * @param query - Search query string
 * @returns Promise with standardized response containing matching jobsite data
 */
export async function searchJobsites(query: string): Promise<StandardResponse<JobsitesResponse>> {
  return apiRequest<JobsitesResponse>(ENDPOINTS.JOBSITES_SEARCH(query));
}

/**
 * Get all trucks
 * 
 * @returns Promise with standardized response containing truck data
 */
export async function getTrucks(): Promise<StandardResponse<TrucksResponse>> {
  return apiRequest<TrucksResponse>(ENDPOINTS.TRUCKS);
}

/**
 * Search trucks by number
 * 
 * @param query - Search query string
 * @returns Promise with standardized response containing matching truck data
 */
export async function searchTrucks(query: string): Promise<StandardResponse<TrucksResponse>> {
  return apiRequest<TrucksResponse>(ENDPOINTS.TRUCKS_SEARCH(query));
}

/**
 * Get ticket categories
 * 
 * @returns Promise with standardized response containing category data
 */
export async function getTicketCategories(): Promise<StandardResponse<{ categories: string[] }>> {
  return apiRequest<{ categories: string[] }>(ENDPOINTS.CATEGORIES);
}

/**
 * Get user preferences
 * 
 * @returns Promise with standardized response containing user preferences
 */
export async function getUserPreferences(): Promise<StandardResponse<{ preferences: any }>> {
  return apiRequest<{ preferences: any }>(ENDPOINTS.USER_PREFERENCES);
}

/**
 * Update user preferences
 * 
 * @param preferences - Updated user preferences
 * @returns Promise with standardized response containing updated preferences
 */
export async function updateUserPreferences(preferences: any): Promise<StandardResponse<{ preferences: any }>> {
  return apiRequest<{ preferences: any }>(ENDPOINTS.USER_PREFERENCES, {
    method: 'PUT',
    body: preferences
  });
}
