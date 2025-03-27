# TanStack Query (React Query) v5 Guide for Simple Tracker

This document provides guidelines and best practices for using TanStack Query v5 in the Simple Tracker application.

> **Note:** For a comprehensive guide on our API and TanStack Query implementation, please refer to the [API-TANSTACK-QUERY-GUIDE.md](./API-TANSTACK-QUERY-GUIDE.md) document.
>
> **New:** For detailed information on our custom React hooks patterns and implementation, see the [HOOKS-GUIDE.md](./HOOKS-GUIDE.md) document.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Query Keys](#query-keys)
4. [Data Fetching](#data-fetching)
5. [Mutations](#mutations)
6. [Error Handling](#error-handling)
7. [Integration with Zustand](#integration-with-zustand)
8. [Server-Side Rendering](#server-side-rendering)
9. [Testing](#testing)
10. [Migrating Existing Code](#migrating-existing-code)

## Overview

TanStack Query v5 provides a powerful data fetching and caching layer for the Simple Tracker application. It handles:

- Data fetching, caching, and synchronization
- Background updates and refetching
- Error handling and retry logic
- Pagination and infinite scrolling
- Optimistic updates for mutations

## Architecture

### Directory Structure

```
/src
  /lib
    /query
      queryKeys.ts        # Query key definitions
      queryUtils.ts       # Query utility functions
  /hooks
    /queries
      useTicketQueries.ts # Ticket query hooks
      useWorkdayQueries.ts # Workday query hooks
  /components
    /providers
      query-client-provider.client.tsx # Query client configuration
```

### Query Client Configuration

The application uses a centralized query client configuration:

```tsx
// src/components/providers/query-client-provider.client.tsx
export default function QueryClientProvider({ children }: QueryClientProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            refetchOnReconnect: true,
          },
          mutations: {
            onError: (error) => {
              // Log all mutation errors by default
              errorHandler.logError(error, { source: 'mutation' });
            },
          },
        },
      })
  );

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </TanStackQueryClientProvider>
  );
}
```

## Query Keys

Query keys are structured to enable efficient invalidation and organized by domain:

```typescript
// src/lib/query/queryKeys.ts
export const queryKeys = {
  tickets: {
    all: ['tickets'] as const,
    lists: () => [...queryKeys.tickets.all, 'list'] as const,
    list: (filters: TicketFilterParams) => [...queryKeys.tickets.lists(), { filters }] as const,
    detail: (id: string) => [...queryKeys.tickets.all, 'detail', id] as const,
    // ...
  },
  // Other domains...
};
```

### Key Features

- Hierarchical structure for partial invalidation
- Type-safe with const assertions
- Parameterized keys for filtering and pagination
- Helper type for extracting query key types:

```typescript
export type QueryKeyFromFn<T extends (...args: any[]) => any> = ReturnType<T>;
```

## Data Fetching

### Query Hooks

Query hooks are organized by domain and follow a consistent pattern:

```typescript
// src/hooks/queries/useTicketQueries.ts
/**
 * Ticket query hooks for data fetching
 * 
 * @returns Object containing ticket query hooks
 */
export function useTicketQueries() {
  /**
   * Hook for fetching tickets with optional filters
   * 
   * @param filters - Optional filters to apply to the query
   * @returns Query result with ticket data
   */
  const useTickets = (filters = {}) => {
    return useQuery({
      queryKey: queryKeys.tickets.list(filters),
      queryFn: () => getTickets(filters),
      select: extractResponseData,
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

### Using Query Hooks in Components

```tsx
import { useTicketQueries } from '@/hooks/queries/useTicketQueries';

function TicketList() {
  const { useTickets } = useTicketQueries();
  const { data, isLoading, error } = useTickets({ status: 'open' });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <ul>
      {data?.map(ticket => (
        <li key={ticket.id}>{ticket.title}</li>
      ))}
    </ul>
  );
}
```

## Mutations

### Mutation Hooks

Mutation hooks follow a similar pattern to query hooks:

```typescript
// src/hooks/queries/useTicketQueries.ts
/**
 * Ticket mutation hooks for data modification
 * 
 * @returns Object containing ticket mutation hooks
 */
export function useTicketMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Hook for submitting a new ticket
   * 
   * @returns Mutation object for submitting tickets
   */
  const useSubmitTicket = () => {
    return useMutation({
      mutationFn: (data: WizardData) => submitTicket(data),
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

### Using Mutation Hooks in Components

```tsx
import { useTicketMutations } from '@/hooks/queries/useTicketMutations';

function SubmitTicketForm() {
  const { useSubmitTicket } = useTicketMutations();
  const { mutate, isPending, error } = useSubmitTicket();
  
  const handleSubmit = (data) => {
    mutate(data);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit Ticket'}
      </Button>
      {error && <ErrorMessage error={error} />}
    </form>
  );
}
```

## Error Handling

Error handling is centralized and consistent across the application:

### API Error Handling

```typescript
// src/lib/api/apiClient.ts
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      return {
        success: false,
        error: `API Error: ${response.status} ${response.statusText}`,
        status: response.status,
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      isNetworkError: error instanceof TypeError && error.message === 'Failed to fetch',
    };
  }
}
```

### Query Error Handling

```typescript
// src/lib/query/queryUtils.ts
export function extractResponseData<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.error || 'Unknown error');
  }
  
  return response.data as T;
}

export function createRetryConfig(maxRetries = 1) {
  return {
    retry: maxRetries,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  };
}
```

### Mutation Error Handling

```typescript
// src/lib/query/queryUtils.ts
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

## Integration with Zustand

TanStack Query works alongside Zustand for state management:

### Query State vs. UI State

- **TanStack Query**: Server state, data fetching, caching
- **Zustand**: UI state, user preferences, wizard state

### Example Integration

```typescript
// src/hooks/useTickets.ts
export function useTickets() {
  const { useTickets } = useTicketQueries();
  const { filters, setFilters } = useTicketFiltersStore();
  
  const ticketsQuery = useTickets(filters);
  
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

## Server-Side Rendering

TanStack Query supports Next.js App Router with React Server Components:

### Hydration Strategy

1. **Server Components**: Use direct data fetching
2. **Client Components**: Use TanStack Query with hydration

### Example with Next.js App Router

```tsx
// src/app/tickets/page.tsx
import { Suspense } from 'react';
import { getTickets } from '@/lib/api/ticketApi';
import TicketList from '@/components/feature/tickets/TicketList.client';
import TicketListSkeleton from '@/components/feature/tickets/TicketListSkeleton';

export default async function TicketsPage() {
  // Server-side data fetching
  const initialTickets = await getTickets({});
  
  return (
    <div>
      <h1>Tickets</h1>
      <Suspense fallback={<TicketListSkeleton />}>
        {/* Pass initial data to client component */}
        <TicketList initialData={initialTickets.data} />
      </Suspense>
    </div>
  );
}

// src/components/feature/tickets/TicketList.client.tsx
'use client';

import { useTicketQueries } from '@/hooks/queries/useTicketQueries';

export default function TicketList({ initialData }) {
  const { useTickets } = useTicketQueries();
  const { data, isLoading, error } = useTickets({}, { initialData });
  
  // Render with data...
}
```

## Testing

### Testing Query Hooks

```tsx
// Example of testing a query hook
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

### Testing Mutation Hooks

```tsx
// Example of testing a mutation hook
import { renderHook, waitFor, act } from '@testing-library/react';
import { createWrapper } from '@/test/utils';
import { useTicketMutations } from '@/hooks/queries/useTicketMutations';
import { submitTicket } from '@/lib/api/ticketApi';

// Mock the API function
jest.mock('@/lib/api/ticketApi');

describe('useTicketMutations', () => {
  it('should submit a ticket successfully', async () => {
    // Mock API response
    (submitTicket as jest.Mock).mockResolvedValue({
      success: true,
      data: { id: '1', title: 'New Ticket' },
    });
    
    // Render the hook with query client wrapper
    const { result } = renderHook(() => {
      const { useSubmitTicket } = useTicketMutations();
      return useSubmitTicket();
    }, { wrapper: createWrapper() });
    
    // Submit the ticket
    act(() => {
      result.current.mutate({ title: 'New Ticket' });
    });
    
    // Initially pending
    expect(result.current.isPending).toBe(true);
    
    // Wait for mutation to complete
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    
    // Check data
    expect(result.current.data).toEqual({ id: '1', title: 'New Ticket' });
  });
});
```

## Migrating Existing Code

Simple Tracker is migrating legacy hooks to use TanStack Query. For detailed information on our hook patterns and migration strategy, see the [HOOKS-GUIDE.md](./HOOKS-GUIDE.md) document.

### Migration Steps

1. **Create Query Hooks**: Implement new hooks using TanStack Query
2. **Maintain Legacy Hooks**: Keep existing hooks working during transition
3. **Update Components**: Gradually update components to use new hooks
4. **Remove Legacy Hooks**: Once all components are updated

### Example Migration

```typescript
// Before: src/hooks/useTickets.ts
export function useTickets() {
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tickets');
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);
  
  return { tickets, isLoading, error, refetch: fetchTickets };
}

// After: src/hooks/queries/useTicketQueries.ts
export function useTicketQueries() {
  const useTickets = (filters = {}) => {
    return useQuery({
      queryKey: queryKeys.tickets.list(filters),
      queryFn: () => getTickets(filters),
      select: extractResponseData,
    });
  };
  
  return { useTickets };
}

// Compatibility layer: src/hooks/useTickets.ts
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

## Resources

- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [TanStack Query Examples](https://tanstack.com/query/latest/docs/react/examples/simple)
- [Simple Tracker Query Hooks Documentation](./query-hooks.md)
