---
title: Simple Tracker Data Management
date: 2025-03-26
tags: [data, tanstack-query, state-management, patterns, reference]
status: official
author: Development Team
---

# Simple Tracker Data Management

## Table of Contents

1. [Overview](#overview)
2. [TanStack Query Architecture](#tanstack-query-architecture)
3. [Query Keys](#query-keys)
4. [Query Hooks](#query-hooks)
5. [Mutation Hooks](#mutation-hooks)
6. [Integration with Zustand](#integration-with-zustand)
7. [Caching Strategy](#caching-strategy)
8. [Error Handling](#error-handling)
9. [Testing Query Hooks](#testing-query-hooks)
10. [Migration from Legacy Hooks](#migration-from-legacy-hooks)
11. [Best Practices and Patterns](#best-practices-and-patterns)

## Overview

This document describes the data management approach in Simple Tracker, focusing on TanStack Query implementation, data fetching patterns, caching strategy, and integration with other state management solutions. It serves as a reference for consistent implementation of data fetching and state management across the application.

### Core Principles

Simple Tracker's data management is built on these core principles:

1. **Separation of Concerns**: Clear separation between server state and client state
2. **Type Safety**: Comprehensive TypeScript types for all data operations
3. **Consistent Patterns**: Standardized patterns for queries, mutations, and error handling
4. **Performance**: Optimized data fetching and caching for better user experience
5. **Maintainability**: Organized code structure for easier maintenance

## TanStack Query Architecture

### Directory Structure

```
/src
  /lib
    /query
      queryKeys.ts        # Query key definitions
      queryUtils.ts       # Query utility functions
      mutationUtils.ts    # Mutation utility functions
  /hooks
    /queries
      useTicketQueries.ts # Ticket query hooks
      useWorkdayQueries.ts # Workday query hooks
  /components
    /providers
      query-client-provider.client.tsx # Query client configuration
```

### Query Client Configuration

The application uses a centralized query client configuration with standardized defaults for stale time, garbage collection, retry logic, and more.

## Query Keys

Query keys are structured in a hierarchical way to enable efficient invalidation. They are organized by domain to match the service structure.

### Key Structure Pattern

```tsx
// src/lib/query/queryKeys.ts
export const queryKeys = {
  tickets: {
    all: ['tickets'] as const,
    lists: () => [...queryKeys.tickets.all, 'list'] as const,
    list: (filters: TicketFilterParams) => [...queryKeys.tickets.lists(), { filters }] as const,
    details: () => [...queryKeys.tickets.all, 'detail'] as const, 
    detail: (id: string) => [...queryKeys.tickets.details(), id] as const,
    // ...
  },
  // Other domains...
};
```

> **Note:** The hierarchical structure shown above is the standard pattern to follow. This enables precise cache invalidation at different levels of granularity.

### Key Characteristics

1. **Hierarchical Structure**: Parent-child relationships for efficient invalidation
2. **Type Safety**: Using `as const` assertions for type inference
3. **Parameterized Keys**: Functions for creating keys with parameters
4. **Domain Organization**: Grouped by domain (tickets, workdays, etc.)

## Query Hooks

Query hooks provide a standardized way to fetch data from APIs. They are organized by domain to match the service structure.

### Domain-Based Organization

Each domain has its own set of query hooks organized in a dedicated file:

```
/src/hooks/queries/
  useTicketQueries.ts     # Ticket-related queries
  useWorkdayQueries.ts    # Workday-related queries
  useReferenceQueries.ts  # Reference data queries
```

This pattern aligns with the decision noted in the changelog to use domain-based organization rather than a more granular approach.

### Standard Hook Pattern

Query hooks for each domain are grouped in a single function that returns an object of hooks:

```tsx
/**
 * Return type for ticket queries
 */
interface UseTicketQueriesReturn {
  useTickets: (filters?: TicketFilterParams) => UseQueryResult<Ticket[], Error>;
  useTicket: (id: string) => UseQueryResult<Ticket | null, Error>;
  // Other queries...
}

/**
 * Ticket queries hook
 * @returns Object containing ticket query hooks
 */
export function useTicketQueries(): UseTicketQueriesReturn {
  const useTickets = (filters: TicketFilterParams = {}) => {
    return useQuery({
      queryKey: queryKeys.tickets.list(filters),
      queryFn: () => getTickets(filters),
      staleTime: TICKET_LIST_STALE_TIME,
      ...createRetryConfig(2),
    });
  };

  // Other query hooks...
  
  return {
    useTickets,
    // Other hooks...
  };
}
```

### Error Handling in Queries

The standardized pattern for error handling in queries is to throw errors from query functions:

```tsx
// The standard pattern in src/lib/query/queryUtils.ts
export function handleApiErrors<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || 'Unknown error occurred');
  }
  return response.data;
}

// Example usage in a query function
const useTicket = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: async () => {
      const response = await getTicketById(id);
      return handleApiErrors(response);
    },
    ...createRetryConfig(2),
  });
};
```

This throw-and-catch approach allows TanStack Query to handle errors consistently with its built-in retry and error state management.

## Mutation Hooks

Mutation hooks follow a similar pattern to query hooks but are focused on modifying data.

### Standard Mutation Pattern

```tsx
/**
 * Return type for ticket mutations
 */
interface UseTicketMutationsReturn {
  useSubmitTicket: () => UseMutationResult<ApiResponse<Ticket>, Error, WizardData, unknown>;
  // Other mutations...
}

/**
 * Ticket mutations hook
 * @returns Object containing ticket mutation hooks
 */
export function useTicketMutations(): UseTicketMutationsReturn {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const useSubmitTicket = () => {
    return useMutation({
      mutationFn: (data: WizardData) => submitTicket(data),
      ...createMutationOptionsWithInvalidation(queryClient, { toast }, {
        loading: 'Submitting ticket...',
        success: 'Ticket submitted successfully!',
        error: 'Failed to submit ticket',
        operationName: 'submitTicket',
        invalidateQueries: [queryKeys.tickets.lists()],
      }),
    });
  };
  
  // Other mutations...
  
  return {
    useSubmitTicket,
    // Other mutations...
  };
}
```

### Optimistic Updates

For a better user experience, mutations can implement optimistic updates:

```tsx
const useUpdateJobsite = () => {
  // Implementation with optimistic update pattern...
};
```

## Integration with Zustand

The application uses Zustand for client-side state and TanStack Query for server state.

### Responsibility Separation

- **TanStack Query**: Manages server state (data fetching, caching, synchronization)
- **Zustand**: Manages client state (UI state, user preferences, local state)

### Integration Example

Business logic hooks can combine TanStack Query for data fetching with Zustand for UI state:

```tsx
export function useTickets() {
  // Use query hook from TanStack Query
  const { useTickets } = useTicketQueries();
  
  // Use store from Zustand
  const { filters, setFilters } = useTicketFiltersStore();
  
  // Query with store state
  const ticketsQuery = useTickets(filters);
  
  // Actions that update store
  const updateFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, [setFilters]);
  
  return {
    ...ticketsQuery,
    filters,
    updateFilters,
  };
}
```

## Caching Strategy

TanStack Query's caching system is configured to optimize performance and user experience.

### Stale Times

Different data types have different stale times based on how frequently they change:

```tsx
// Standard stale times for different data types
export const STALE_TIMES = {
  REFERENCE_DATA: 5 * 60 * 1000, // 5 minutes - reference data changes infrequently
  TICKET_LIST: 2 * 60 * 1000,    // 2 minutes - ticket lists may change more often
  TICKET_DETAIL: 5 * 60 * 1000,  // 5 minutes - individual tickets change less frequently
  WORKDAY_CALENDAR: 5 * 60 * 1000, // 5 minutes - calendar data doesn't change frequently
  WORKDAY_DETAIL: 3 * 60 * 1000, // 3 minutes
  STATS: 10 * 60 * 1000,         // 10 minutes - stats are computed and change infrequently
  WIZARD_DATA: 0,                // 0 minutes - always fetch fresh wizard data
};
```

### Retry Configuration

The application uses a standardized retry configuration for dealing with transient errors:

```tsx
export function createRetryConfig(maxRetries = 3, baseDelay = 1000) {
  return {
    retry: (failureCount: number, error: any) => {
      // Don't retry if we've reached the max retries
      if (failureCount >= maxRetries) {
        return false;
      }
      
      // Don't retry for 4xx errors (client errors)
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      
      // Retry for network errors and 5xx errors
      return true;
    },
    retryDelay: (attemptIndex: number) => {
      // Exponential backoff: 1s, 2s, 4s, etc.
      return Math.min(
        baseDelay * Math.pow(2, attemptIndex),
        30000 // Max 30 seconds
      );
    },
  };
}
```

## Error Handling

Error handling in data operations follows a consistent pattern across the application.

### API Response Structure

All API responses follow a standard structure:

```tsx
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  timestamp: string;
}
```

### Error Handling Pattern

The standard error handling pattern is to throw errors in query functions and let TanStack Query handle them:

```tsx
// src/lib/query/queryUtils.ts
export function handleApiErrors<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || 'Unknown error occurred');
  }
  return response.data;
}
```

This is the recommended approach rather than using conditional checks with `select`, as it provides better error handling and integration with TanStack Query's retry system.

### Error Display

Errors are displayed to users through toast notifications for mutations:

```tsx
export function createMutationOptions(toast, options) {
  const { loading, success, error, operationName, onSuccessCallback } = options;
  
  return {
    onMutate: () => {
      toast({
        title: loading,
        variant: 'default',
      });
    },
    onSuccess: (data) => {
      toast({
        title: success,
        variant: 'success',
      });
      
      if (onSuccessCallback) {
        onSuccessCallback(data);
      }
    },
    onError: (err) => {
      toast({
        title: error,
        description: err.message,
        variant: 'destructive',
      });
      
      errorHandler.logError(err, { operation: operationName });
    },
  };
}
```

## Testing Query Hooks

Testing query hooks requires setting up a test environment with a QueryClient provider.

### Testing Setup

```tsx
// src/test/utils.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Testing Query Hooks

```tsx
// Example test for a query hook
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '@/test/utils';
import { useTicketQueries } from '@/hooks/queries/useTicketQueries';
import { getTickets } from '@/lib/api/ticketApi';

// Mock the API function
jest.mock('@/lib/api/ticketApi');

describe('useTicketQueries', () => {
  it('should fetch tickets successfully', async () => {
    // Mock API response
    (getTickets as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ id: '1', title: 'Test Ticket' }],
    });
    
    // Render the hook with query client wrapper
    const { result } = renderHook(() => {
      const { useTickets } = useTicketQueries();
      return useTickets({});
    }, { wrapper: createWrapper() });
    
    // Initially loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for query to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // Check data
    expect(result.current.data).toEqual([{ id: '1', title: 'Test Ticket' }]);
  });
});
```

## Migration from Legacy Hooks

Simple Tracker is transitioning from legacy hook patterns to TanStack Query hooks. This section outlines the migration strategy.

### Migration Strategy

1. **Create New Query Hooks**: Implement new hooks using TanStack Query
2. **Maintain Legacy Hooks**: Keep existing hooks working during transition
3. **Update Components**: Gradually update components to use new hooks
4. **Remove Legacy Hooks**: Once all components are updated

### Legacy Hook Compatibility

To ease migration, legacy hooks can be implemented on top of the new query hooks:

```tsx
/**
 * @deprecated Use useTicketQueries from '@/hooks/queries/useTicketQueries' instead
 */
export function useTickets(filters = {}) {
  const { useTickets: useTicketsQuery } = useTicketQueries();
  const query = useTicketsQuery(filters);
  
  return {
    tickets: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
```

## Best Practices and Patterns

### 1. Use Domain-Based Organization

Organize query hooks by domain to match the service structure:

```
useTicketQueries.ts
useWorkdayQueries.ts
useReferenceQueries.ts
```

### 2. Follow Hierarchical Query Keys

Use the standardized hierarchical query key structure:

```tsx
const queryKeys = {
  domain: {
    all: ['domain'] as const,
    lists: () => [...queryKeys.domain.all, 'list'] as const,
    list: (filters) => [...queryKeys.domain.lists(), { filters }] as const,
    detail: (id) => [...queryKeys.domain.all, 'detail', id] as const,
  },
};
```

### 3. Use the Throw-and-Catch Pattern for Error Handling

Follow the standard error handling pattern:

```tsx
// In query function
const data = await api.getData();
return handleApiErrors(data);

// handleApiErrors implementation
function handleApiErrors(response) {
  if (!response.success) {
    throw new Error(response.error);
  }
  return response.data;
}
```

### 4. Define Explicit TypeScript Interfaces

All hooks should have explicit TypeScript interfaces:

```tsx
/**
 * Return type for useTicketQueries
 */
interface UseTicketQueriesReturn {
  useTickets: (filters?: TicketFilterParams) => UseQueryResult<Ticket[], Error>;
  useTicket: (id: string) => UseQueryResult<Ticket | null, Error>;
}

/**
 * Ticket queries hook
 */
export function useTicketQueries(): UseTicketQueriesReturn {
  // Implementation...
}
```

### 5. Use Appropriate Stale Times

Configure stale times based on data change frequency:

```tsx
// Reference data (changes infrequently)
staleTime: 5 * 60 * 1000, // 5 minutes

// User-specific data (changes more frequently)
staleTime: 2 * 60 * 1000, // 2 minutes

// Wizard data (always fresh)
staleTime: 0,
```

### 6. Follow Domain-Specific Response Properties

API responses should use domain-specific properties instead of generic `data`:

```tsx
// Good
{
  success: true,
  tickets: [...], // Domain-specific property
  timestamp: '2025-03-26T12:34:56Z'
}

// Avoid
{
  success: true,
  data: [...], // Generic property
  timestamp: '2025-03-26T12:34:56Z'
}
```
