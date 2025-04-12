/**
 * API Module
 * 
 * Exports all API-related functionality for easy importing throughout the application.
 */

// Export API utilities
export * from './responseUtils';
export * from './middleware';

// Export API client and domain-specific APIs
export * from './apiClient';
export * from './authApi';
export * from './ticketApi';
export * from './workdayApi';
export * from './referencesApi';
