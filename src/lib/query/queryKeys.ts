/**
 * Query keys factory for TanStack Query
 * Ensures consistent and type-safe query keys across the application
 * Following the recommended pattern from TanStack Query documentation
 * 
 * Query keys are structured as arrays to enable partial matching for invalidation
 */

import { TicketFilterParams } from '@/types/tickets';

/**
 * Type-safe query key extraction helper
 * Allows extracting the type of a query key from a query key factory function
 */
export type QueryKeyFromFn<T extends (...args: any[]) => any> = ReturnType<T>;

/**
 * Query keys for all resources in the application
 * Organized by domain to match service structure
 */
export const queryKeys = {
  tickets: {
    all: ['tickets'] as const,
    lists: () => [...queryKeys.tickets.all, 'list'] as const,
    list: (filters: TicketFilterParams) => [...queryKeys.tickets.lists(), { filters }] as const,
    details: () => [...queryKeys.tickets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tickets.details(), id] as const,
    wizard: {
      all: [...queryKeys.tickets.all, 'wizard'] as const,
      data: () => [...queryKeys.tickets.wizard.all, 'data'] as const,
      step: (step: number) => [...queryKeys.tickets.wizard.all, 'step', step] as const,
    },
    tempImage: {
      all: [...queryKeys.tickets.all, 'tempImage'] as const,
      upload: () => [...queryKeys.tickets.tempImage.all, 'upload'] as const,
      delete: (tempId: string) => [...queryKeys.tickets.tempImage.all, 'delete', tempId] as const,
    },
  },
  
  workdays: {
    all: ['workdays'] as const,
    calendar: {
      all: [...queryKeys.workdays.all, 'calendar'] as const,
      month: (year: number, month: number) => 
        [...queryKeys.workdays.calendar.all, year, month] as const,
      day: (dateString: string) => 
        [...queryKeys.workdays.calendar.all, 'day', dateString] as const,
    },
    detail: (id: string) => [...queryKeys.workdays.all, 'detail', id] as const,
    stats: {
      all: [...queryKeys.workdays.all, 'stats'] as const,
      monthly: (year: number, month: number) => 
        [...queryKeys.workdays.stats.all, 'monthly', year, month] as const,
      yearly: (year: number) => 
        [...queryKeys.workdays.stats.all, 'yearly', year] as const,
    },
  },
  
  jobsites: {
    all: ['jobsites'] as const,
    lists: () => [...queryKeys.jobsites.all, 'list'] as const,
    list: (filters: object | string) => [...queryKeys.jobsites.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.jobsites.all, 'detail', id] as const,
  },
  
  trucks: {
    all: ['trucks'] as const,
    lists: () => [...queryKeys.trucks.all, 'list'] as const,
    list: (filters: object | string) => [...queryKeys.trucks.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.trucks.all, 'detail', id] as const,
  },
  
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    notifications: () => [...queryKeys.user.all, 'notifications'] as const,
  },
  
  admin: {
    all: ['admin'] as const,
    dashboard: {
      all: [...queryKeys.admin.all, 'dashboard'] as const,
      metrics: () => [...queryKeys.admin.dashboard.all, 'metrics'] as const,
      stats: (timeframe: string) => [...queryKeys.admin.dashboard.all, 'stats', timeframe] as const,
      activity: () => [...queryKeys.admin.dashboard.all, 'activity'] as const,
    },
    users: {
      all: [...queryKeys.admin.all, 'users'] as const,
      list: (filters: object | string) => [...queryKeys.admin.users.all, 'list', { filters }] as const,
      detail: (id: string) => [...queryKeys.admin.users.all, 'detail', id] as const,
    },
  },
};
