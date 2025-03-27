# Simple Tracker State Management

## Table of Contents

1. [Overview](#overview)
2. [State Management Layers](#state-management-layers)
3. [Client State Management (Zustand)](#client-state-management-zustand)
4. [Server State Management (TanStack Query)](#server-state-management-tanstack-query)
5. [Component State Management](#component-state-management)
6. [Data Flow Patterns](#data-flow-patterns)
7. [State Persistence](#state-persistence)
8. [Best Practices](#best-practices)

## Overview

Simple Tracker uses a hybrid state management approach that separates concerns between client state, server state, and component state. This document outlines the patterns and approaches used for state management throughout the application.

## State Management Layers

The application divides state management into three distinct layers:

1. **Client State**: UI state, user preferences, and client-side data managed with Zustand
2. **Server State**: Data from API calls managed with TanStack Query
3. **Component State**: Local component state managed with React's useState and useReducer hooks

This separation allows for clear responsibilities and optimized performance for each type of state.

## Client State Management (Zustand)

### Overview

Zustand is used for managing client-side state with the following benefits:
- Minimal boilerplate
- No context providers needed
- Immutable updates
- Middleware support for persistence

### Store Structure

Stores are organized by domain and located in the `/src/stores/` directory:

```
/src/stores/
  authStore.ts       # Authentication state
  calendarStore.ts   # Calendar view state
  dashboardStore.ts  # Admin dashboard state
  preferencesStore.ts # User preferences
  referenceStore.ts  # Reference data (trucks, jobsites)
  uiStore.ts         # UI state (modals, toasts, etc.)
  wizardStore.ts     # Wizard form state
  workdayStore.ts    # Workday tracking state
```

### Store Implementation Pattern

All stores follow a standardized implementation pattern with three main components:

1. **Action Creators**: Extracted logic for complex state updates
2. **Store Definition**: Core state and actions with persistence
3. **Selector Hooks**: Optimized component rendering

```typescript
// Example standardized store implementation

// 1. Imports
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 2. Type definitions
interface ExampleState {
  // State properties
  data: DataType[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchData: () => Promise<void>;
  addItem: (item: DataType) => void;
  removeItem: (id: string) => void;
  clearError: () => void;
}

// 3. Action creators - extract complex logic
const fetchDataAction = () => 
  async (set: any, get: any) => {
    set({ isLoading: true, error: null });
    
    try {
      // API call or complex logic
      const data = await apiService.getData();
      set({ data, isLoading: false });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  };

// 4. Store creation with persistence
export const useExampleStore = create<ExampleState>()(
  persist(
    (set, get) => ({
      // Initial state
      data: [],
      isLoading: false,
      error: null,
      
      // Actions - using action creators
      fetchData: () => fetchDataAction()(set, get),
      addItem: (item) => set(state => ({ 
        data: [...state.data, item] 
      })),
      removeItem: (id) => set(state => ({ 
        data: state.data.filter(item => item.id !== id) 
      })),
      clearError: () => set({ error: null })
    }),
    {
      name: 'example-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist specific parts of the state
        data: state.data
      })
    }
  )
);

// 5. Selector hooks for optimized component rendering
export const useExampleData = () => 
  useExampleStore(state => state.data);

export const useExampleActions = () => ({
  addItem: useExampleStore(state => state.addItem),
  removeItem: useExampleStore(state => state.removeItem)
});

export const useExampleStatus = () => ({
  isLoading: useExampleStore(state => state.isLoading),
  error: useExampleStore(state => state.error),
  clearError: useExampleStore(state => state.clearError)
});
```

### Store Usage Pattern

With the selector hooks pattern, components can subscribe only to the specific parts of the state they need, preventing unnecessary re-renders:

```tsx
// Example store usage with selector hooks
import { useExampleData, useExampleActions, useExampleStatus } from '@/stores/exampleStore';

function DataListComponent() {
  // Only subscribe to the data array
  const data = useExampleData();
  
  // Only subscribe to actions
  const { addItem, removeItem } = useExampleActions();
  
  // Only subscribe to loading/error state
  const { isLoading, error, clearError } = useExampleStatus();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onDismiss={clearError} />;
  
  return (
    <div>
      <h1>Data List</h1>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            {item.name}
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => addItem({ id: 'new-id', name: 'New Item' })}>
        Add Item
      </button>
    </div>
  );
}
```

## Server State Management (TanStack Query)

### Overview

TanStack Query (React Query) is used for managing server state with the following benefits:
- Automatic caching
- Background refetching
- Pagination and infinite scrolling
- Optimistic updates
- Mutation handling

### Query Client Configuration

The query client is configured in a provider component:

```tsx
// Query client configuration
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Query Keys

Query keys are structured for better cache management:

```typescript
// Query keys
export const queryKeys = {
  auth: {
    base: ['auth'] as const,
    user: (userId: string) => [...queryKeys.auth.base, 'user', userId] as const,
    currentUser: () => [...queryKeys.auth.base, 'currentUser'] as const,
  },
  tickets: {
    base: ['tickets'] as const,
    list: (filters?: TicketFilterParams) => [...queryKeys.tickets.base, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.tickets.base, 'detail', id] as const,
    stats: () => [...queryKeys.tickets.base, 'stats'] as const,
  },
  jobsites: {
    base: ['jobsites'] as const,
    list: (filters?: JobsiteFilterParams) => [...queryKeys.jobsites.base, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.jobsites.base, 'detail', id] as const,
  },
  trucks: {
    base: ['trucks'] as const,
    list: (filters?: TruckFilterParams) => [...queryKeys.trucks.base, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.trucks.base, 'detail', id] as const,
  },
  users: {
    base: ['users'] as const,
    list: (filters?: UserFilterParams) => [...queryKeys.users.base, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.users.base, 'detail', id] as const,
  },
} as const;
```

### Query Hooks

Query hooks abstract React Query implementation details:

```typescript
// Example query hook
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { ticketsApi } from '@/lib/api/tickets-api';

export function useTickets(filters: TicketFilterParams = {}) {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters),
    queryFn: () => ticketsApi.getTickets(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => ticketsApi.getTicketById(id),
    enabled: !!id,
  });
}
```

### Mutation Hooks

Mutation hooks handle data updates:

```typescript
// Example mutation hook
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query-keys';
import { ticketsApi } from '@/lib/api/tickets-api';
import { errorHandler } from '@/lib/errors';

export function useCreateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateTicketRequest) => ticketsApi.createTicket(data),
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.base });
      toast.success('Ticket created successfully');
    },
    onError: (error) => {
      // Handle error
      toast.error(errorHandler.getUserFriendlyMessage(error));
    }
  });
}
```

## Component State Management

### Local State

React's useState hook is used for component-specific state:

```tsx
// Example local state
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Complex State

React's useReducer hook is used for complex state logic:

```tsx
// Example complex state
import { useReducer } from 'react';

type State = {
  count: number;
  step: number;
  min: number;
  max: number;
};

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return {
        ...state,
        count: Math.min(state.count + state.step, state.max),
      };
    case 'decrement':
      return {
        ...state,
        count: Math.max(state.count - state.step, state.min),
      };
    case 'setStep':
      return {
        ...state,
        step: action.payload,
      };
    case 'reset':
      return {
        ...state,
        count: 0,
      };
    default:
      return state;
  }
}

function AdvancedCounter() {
  const [state, dispatch] = useReducer(reducer, {
    count: 0,
    step: 1,
    min: 0,
    max: 100,
  });
  
  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
      <select
        value={state.step}
        onChange={(e) => dispatch({ type: 'setStep', payload: Number(e.target.value) })}
      >
        <option value="1">1</option>
        <option value="5">5</option>
        <option value="10">10</option>
      </select>
    </div>
  );
}
```

### Derived State

Derived state is calculated from existing state:

```tsx
// Example derived state
function TicketSummary({ ticket }) {
  // Derived state
  const total = useMemo(() => {
    return (
      ticket.hangers +
      ticket.leaner6To12 +
      ticket.leaner13To24 +
      ticket.leaner25To36 +
      ticket.leaner37To48 +
      ticket.leaner49Plus
    );
  }, [
    ticket.hangers,
    ticket.leaner6To12,
    ticket.leaner13To24,
    ticket.leaner25To36,
    ticket.leaner37To48,
    ticket.leaner49Plus,
  ]);
  
  // Derived state for color
  const getCounterColor = useMemo(() => {
    if (total === 0) return 'counter-red';
    if (total >= 1 && total <= 84) return 'counter-yellow';
    if (total >= 85 && total <= 124) return 'counter-green';
    return 'counter-gold';
  }, [total]);
  
  return (
    <div className={getCounterColor}>
      <h2>Total: {total}</h2>
      {/* Other content */}
    </div>
  );
}
```

## Data Flow Patterns

### Unidirectional Data Flow

The application follows a unidirectional data flow pattern:

1. **State**: Application state is stored in Zustand stores or React Query cache
2. **View**: Components render based on the current state
3. **Actions**: User interactions trigger actions (store updates or mutations)
4. **State Update**: State is updated, causing components to re-render

### Component Data Flow

Components follow a clear data flow pattern:

1. **Props Down**: Data flows down from parent to child components via props
2. **Events Up**: Events flow up from child to parent components via callbacks
3. **Global State**: Global state is accessed directly from stores or query hooks

## State Persistence

### Local Storage Persistence

Zustand's persist middleware is used for local storage persistence:

```typescript
// Example persistence configuration
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Store implementation
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist specific parts of the state
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### Expiration Handling

Persistence includes expiration handling for sensitive or temporary data:

```typescript
// Example expiration handling
export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      // Store implementation
    }),
    {
      name: 'wizard-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        stepData: state.stepData,
        timestamp: Date.now(), // Add timestamp for expiration check
      }),
      onRehydrateStorage: () => (state) => {
        // Check for expiration (24 hours)
        if (state && state.timestamp) {
          const now = Date.now();
          const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
          
          if (now - state.timestamp > expirationTime) {
            // Reset if expired
            state.resetWizard();
          }
        }
      },
    }
  )
);
```

## Best Practices

### State Management Best Practices

1. **State Separation**: Separate client state, server state, and component state
2. **Single Source of Truth**: Maintain a single source of truth for each piece of state
3. **Minimal State**: Store only the minimal required state and derive the rest
4. **Immutable Updates**: Always update state immutably
5. **Type Safety**: Use TypeScript for type-safe state management

### Zustand Best Practices

1. **Atomic Stores**: Create small, focused stores for specific domains
2. **Selective Persistence**: Only persist necessary state
3. **Expiration Handling**: Add expiration for sensitive or temporary data
4. **Selective Subscription**: Subscribe only to the parts of the state that are needed
5. **Action Creators**: Extract complex logic into action creator functions
6. **Selector Hooks**: Create dedicated selector hooks for optimized component rendering
7. **Error Handling**: Implement consistent error handling in all stores
8. **Immutable Updates**: Always update state immutably using spread operators or immer
9. **Standardized Patterns**: Follow the standardized store implementation pattern across all stores

### React Query Best Practices

1. **Structured Query Keys**: Use structured query keys for better cache management
2. **Appropriate Stale Times**: Configure appropriate stale times based on data freshness requirements
3. **Prefetching**: Prefetch data when appropriate for better performance
4. **Error Handling**: Implement consistent error handling
5. **Optimistic Updates**: Use optimistic updates for better user experience