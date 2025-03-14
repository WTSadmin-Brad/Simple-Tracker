/**
 * Reference data API client functions
 * 
 * @source directory-structure.md - "API client functions" section
 * @source Employee_Flows.md - "Reference Data" section
 */

import { ApiResponse } from '../../types/api';
import { Jobsite } from '../../types/firebase';
import { Truck } from '../../types/firebase';

/**
 * Base URL for reference data API endpoints
 */
const REFERENCES_API_BASE = '/api/references';

/**
 * Get all jobsites
 * 
 * @returns Promise with jobsite data
 */
export async function getJobsites(): Promise<ApiResponse<Jobsite[]>> {
  try {
    const response = await fetch(
      `${REFERENCES_API_BASE}/jobsites`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobsites');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch jobsites'
    };
  }
}

/**
 * Search jobsites by name
 * 
 * @param query - Search query string
 * @returns Promise with matching jobsite data
 */
export async function searchJobsites(query: string): Promise<ApiResponse<Jobsite[]>> {
  try {
    const response = await fetch(
      `${REFERENCES_API_BASE}/jobsites/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to search jobsites');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search jobsites'
    };
  }
}

/**
 * Get all trucks
 * 
 * @returns Promise with truck data
 */
export async function getTrucks(): Promise<ApiResponse<Truck[]>> {
  try {
    const response = await fetch(
      `${REFERENCES_API_BASE}/trucks`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch trucks');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch trucks'
    };
  }
}

/**
 * Search trucks by number
 * 
 * @param query - Search query string
 * @returns Promise with matching truck data
 */
export async function searchTrucks(query: string): Promise<ApiResponse<Truck[]>> {
  try {
    const response = await fetch(
      `${REFERENCES_API_BASE}/trucks/search?q=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to search trucks');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search trucks'
    };
  }
}

/**
 * Get ticket categories
 * 
 * @returns Promise with category data
 */
export async function getTicketCategories(): Promise<ApiResponse<string[]>> {
  try {
    const response = await fetch(
      `${REFERENCES_API_BASE}/categories`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch categories'
    };
  }
}
