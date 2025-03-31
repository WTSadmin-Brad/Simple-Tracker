# API and TanStack Query Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [API Client Architecture](#api-client-architecture)
3. [Authentication Integration](#authentication-integration)
4. [Query Keys](#query-keys)
5. [Query Hooks](#query-hooks)
6. [Mutation Hooks](#mutation-hooks)
7. [Error Handling](#error-handling)
8. [Batch Operations](#batch-operations)
9. [Best Practices](#best-practices)
10. [Hook Patterns](#hook-patterns)
11. [Examples](#examples)

## Overview

Simple Tracker uses a centralized API client with TanStack Query v5 for data fetching and state management. This guide explains the patterns and best practices for working with APIs and queries in the application.

> **Note:** For detailed information about API route patterns and Firebase implementation, please refer to the [FIREBASE-IMPLEMENTATION.md](./FIREBASE-IMPLEMENTATION.md) document.

## API Client Architecture

### Directory Structure

```
/src
  /lib
    /api
      apiClient.ts        # Centralized API client with error handling
      ticketApi.ts        # Ticket-related API functions
      workdayApi.ts       # Workday-related API functions
      referencesApi.ts    # Reference data API functions
    /query
      queryKeys.ts        # Query key definitions
      queryUtils.ts       # Query utility functions
    /errors
      apiErrors.ts        # API-specific error types
      errorHandler.ts     # Error handling utilities
      errorCodes.ts       # Standardized error codes
  /hooks
    /queries
      useTicketQueries.ts # Ticket query hooks
      useWorkdayQueries.ts # Workday query hooks
```

### API Client

The API client provides a consistent interface for making API requests with standardized error handling:

- `apiRequest<T>` - For JSON requests
- `apiFormRequest<T>` - For multipart form data (file uploads)

All API functions return an `ApiResponse<T>` type:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    status: number;
    details?: Record<string, any>;
  };
  status?: number;
  isNetworkError?: boolean;
  timestamp: string; // ISO date string
}
```

### Domain-Specific API Modules

Each domain has its own API module with functions for specific operations:

- Clear function names that describe the operation
- Consistent error handling
- Type-safe parameters and return values
- Organized endpoint constants
- Pagination support for list operations
- Batch operation support for bulk modifications

```typescript
// Example from ticketApi.ts
export const ENDPOINTS = {
  TICKETS: '/api/tickets',
  TICKET_DETAIL: (id: string) => `/api/tickets/${id}`,
  TICKETS_BATCH: '/api/tickets/batch',
  WIZARD_DATA: '/api/tickets/wizard',
  TEMP_IMAGES: '/api/tickets/temp-images',
};

export async function getTickets(filters: TicketFilterParams = {}): Promise<ApiResponse<PaginatedResponse<Ticket[]>>> {
  return apiRequest<PaginatedResponse<Ticket[]>>(ENDPOINTS.TICKETS, {
    params: filters,
  });
}
```

## Authentication Integration

The application's authentication is integrated with TanStack Query and the API architecture through multiple layers:

### Server-Side Authentication Middleware

API routes use a centralized `authenticateRequest` middleware that:
- Extracts and verifies tokens from request headers
- Provides authenticated user IDs to route handlers
- Ensures consistent error handling for authentication failures

```typescript
// Example of authenticateRequest middleware in API routes
export const GET = authenticateRequest(async (userId, request, params, context) => {
  // Implementation with authenticated userId and full auth context
  // context.auth contains the decoded token information
});
```

### Client-Side Authentication

Query and mutation hooks integrate with authentication through:

1. **Auth Headers**: The API client automatically includes auth tokens in requests
2. **Error Handling**: Authentication errors are handled consistently
3. **Retry Logic**: Expired tokens can trigger automatic refresh and retry

```typescript
// Example of API client with auth headers
export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  try {
    const token = await getAuthToken();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };
    
    // Rest of implementation...
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'An error occurred',
        code: error.code || ErrorCodes.UNKNOWN_ERROR,
        status: error.status || 500
      },
      timestamp: new Date().toISOString()
    };
  }
}
```

### Benefits for Query Implementation

The centralized authentication approach offers several advantages for TanStack Query implementation:

1. **Simplified Query Functions**: Query functions don't need to handle authentication logic
2. **Consistent Error Handling**: Authentication errors are handled uniformly
3. **Cleaner Query Hooks**: Hooks can focus on data fetching without auth concerns
4. **Automatic Retries**: Query retry logic works well with token refresh patterns

This separation of concerns follows the DRY principle and creates a cleaner architecture that's easier to maintain and extend.

## Query Keys

Query keys are structured to enable efficient invalidation and organized by domain:

```typescript
export const queryKeys = {
  tickets: {
    all: ['tickets'] as const,
    lists: () => [...queryKeys.tickets.all, 'list'] as const,
    list: (filters: TicketFilterParams) => [...queryKeys.tickets.lists(), { filters }] as const,
    details: () => [...queryKeys.tickets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tickets.details(), id] as const,
    wizardState: (userId: string) => [...queryKeys.tickets.all, 'wizard', userId] as const,
  },
  // Other domains...
};
```

### Key Features

- Hierarchical structure for partial invalidation
- Type-safe with const assertions
- Parameterized keys for filtering and pagination
- Helper type for extracting query key types

## Query Hooks

Query hooks are organized by domain and follow a consistent pattern:

```typescript
export function useTicketQueries() {
  const useTickets = (filters = {}) => {
    return useQuery({
      queryKey: queryKeys.tickets.list(filters),
      queryFn: () => getTickets(filters),
      select: (response) => response.success ? response.data : undefined,
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

### Key Features

- Separation of concerns (queries vs mutations)
- Consistent error handling
- Data transformation with `select`
- Standardized retry configuration
- Type-safe return values
- Support for paginated data

## Mutation Hooks

Mutation hooks follow a similar pattern to query hooks:

```typescript
export function useTicketMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const useSubmitTicket = () => {
    return useMutation({
      mutationFn: (data) => createTicket(data),
      ...createMutationOptions(toast, {
        loading: 'Submitting ticket...',
        success: 'Ticket submitted successfully!',
        error: 'Failed to submit ticket',
        operationName: 'submitTicket',
        onSuccessCallback: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
        },
      }),
    });
  };
  
  // Other mutation hooks...
  
  return {
    useSubmitTicket,
    // Other hooks...
  };
}
```

### Key Features

- Standardized toast notifications
- Automatic query invalidation
- Consistent error handling
- Optimistic updates where appropriate
- Support for batch operations

## Error Handling

Error handling is centralized and consistent across the application:

- API errors are captured in the `ApiResponse` type with detailed error information
- Query errors are handled with standardized retry logic
- Mutation errors trigger toast notifications with appropriate error messages
- All errors are logged for debugging and include error codes for client-side handling

### Utility Functions

- `extractResponseData<T>` - Safely extracts data from API responses
- `extractErrorDetails` - Extracts detailed error information for display and handling
- `createRetryConfig` - Standardizes retry behavior based on error types
- `createMutationOptions` - Standardizes mutation behavior and error handling

```typescript
// Example of error extraction utility
export function extractErrorDetails(response: ApiResponse<any>): {
  message: string;
  code: string;
  details?: Record<string, any>;
} {
  if (response.success) {
    return null;
  }
  
  return {
    message: response.error?.message || 'An unknown error occurred',
    code: response.error?.code || ErrorCodes.UNKNOWN_ERROR,
    details: response.error?.details
  };
}
```

## Batch Operations

The application supports batch operations for efficient bulk modifications:

```typescript
// Example batch mutation hook
export function useTicketBatchMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const useBatchUpdateTickets = () => {
    return useMutation({
      mutationFn: (operations: BatchOperation[]) => batchUpdateTickets(operations),
      ...createMutationOptions(toast, {
        loading: 'Updating tickets...',
        success: 'Tickets updated successfully!',
        error: 'Failed to update tickets',
        operationName: 'batchUpdateTickets',
        onSuccessCallback: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.tickets.lists() });
        },
      }),
    });
  };
  
  // Usage example
  const { mutate, isPending } = useBatchUpdateTickets();
  
  const handleBatchUpdate = () => {
    mutate([
      { id: 'ticket1', operation: 'update', data: { status: 'archived' } },
      { id: 'ticket2', operation: 'update', data: { status: 'archived' } }
    ]);
  };
  
  return {
    useBatchUpdateTickets,
    // Other batch operations...
  };
}
```

### Key Features

- Efficient processing of multiple operations in a single request
- Consistent error handling for batch operations
- Support for different operation types (update, delete, archive)
- Proper invalidation of affected queries

## Best Practices

### 1. Keep API Functions Simple

API functions should:
- Focus on a single responsibility
- Have clear names that describe the operation
- Return consistent response types
- Handle errors consistently

### 2. Organize Query Keys Hierarchically

- Group related keys under a common parent
- Use functions for parameterized keys
- Structure keys to enable efficient invalidation

### 3. Separate Queries and Mutations

- Split query and mutation hooks for better organization
- Keep related operations together
- Return hook functions rather than using them directly

### 4. Handle Loading and Error States

- Always handle loading states with appropriate UI feedback
- Provide user-friendly error messages based on error codes
- Use the `status` property to handle different states

### 5. Use TypeScript Effectively

- Define explicit return types for all hooks
- Use generics for type-safe data handling
- Document parameters and return values with JSDoc comments

### 6. Implement Batch Operations for Efficiency

- Use batch operations for bulk modifications
- Validate batch requests properly
- Handle partial failures gracefully

## Hook Patterns

All hooks in Simple Tracker follow a standardized pattern for consistency and maintainability. For more detailed information, see the [HOOKS-GUIDE.md](./HOOKS-GUIDE.md) document.

### Standard Hook Structure

```typescript
/**
 * Hook description with source documentation references
 */
import { useState, useCallback } from 'react';

/**
 * Return type for the hook
 */
interface UseExampleReturn {
  /** Property description */
  isLoading: boolean;
  /** Method description */
  fetchData: (id: string) => Promise<boolean>;
  // Other properties...
}

/**
 * Hook implementation with JSDoc comment
 */
export function useExample(): UseExampleReturn {
  // Implementation...
  
  return {
    // Return object with properties and methods
  };
}
```

### Key Features of Our Hook Pattern

1. **Explicit TypeScript Types**: All hooks have explicit return type interfaces
2. **Comprehensive JSDoc Comments**: All hooks, methods, and properties are documented
3. **Consistent Error Handling**: Using the centralized error handler
4. **Loading and Error States**: All async hooks track loading and error states
5. **Callback Memoization**: All methods use `useCallback` with proper dependencies

## Examples

### Basic Query Hook

```typescript
// src/hooks/queries/useJobsiteQueries.ts
export function useJobsiteQueries() {
  const useJobsites = (filters = {}) => {
    return useQuery({
      queryKey: queryKeys.jobsites.list(filters),
      queryFn: () => getJobsites(filters),
      select: (response) => response.success ? response.data : undefined,
      ...createRetryConfig(2),
    });
  };
  
  const useJobsite = (id: string) => {
    return useQuery({
      queryKey: queryKeys.jobsites.detail(id),
      queryFn: () => getJobsite(id),
      select: (response) => response.success ? response.data : undefined,
      ...createRetryConfig(2),
      enabled: !!id,
    });
  };
  
  return {
    useJobsites,
    useJobsite,
  };
}

// Usage in a component
function JobsiteList() {
  const { useJobsites } = useJobsiteQueries();
  const { data, isLoading, error } = useJobsites({ active: true });
  
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <ul>
      {data?.items.map(jobsite => (
        <li key={jobsite.id}>{jobsite.name}</li>
      ))}
    </ul>
  );
}
```

### Mutation with Optimistic Updates

```typescript
// src/hooks/mutations/useJobsiteMutations.ts
export function useJobsiteMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const useUpdateJobsite = () => {
    return useMutation({
      mutationFn: updateJobsite,
      ...createMutationOptions(toast, {
        loading: 'Updating jobsite...',
        success: 'Jobsite updated!',
        error: 'Failed to update jobsite',
        operationName: 'updateJobsite',
        onSuccessCallback: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.jobsites.lists() });
        },
      }),
      onMutate: async (updatedJobsite) => {
        // Cancel outgoing queries
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.jobsites.detail(updatedJobsite.id) 
        });
        
        // Get previous data
        const previousData = queryClient.getQueryData(
          queryKeys.jobsites.detail(updatedJobsite.id)
        );
        
        // Optimistically update the cache
        queryClient.setQueryData(
          queryKeys.jobsites.detail(updatedJobsite.id),
          {
            success: true,
            data: updatedJobsite,
            timestamp: new Date().toISOString()
          }
        );
        
        // Return context for onError
        return { previousData };
      },
      onError: (error, variables, context) => {
        // Revert to previous data on error
        if (context?.previousData) {
          queryClient.setQueryData(
            queryKeys.jobsites.detail(variables.id),
            context.previousData
          );
        }
      }
    });
  };
  
  return {
    useUpdateJobsite,
    // Other mutations...
  };
}
