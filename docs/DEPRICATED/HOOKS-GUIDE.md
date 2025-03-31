# Custom React Hooks Guide for Simple Tracker

This document outlines the patterns, best practices, and organization of custom React hooks in the Simple Tracker application.

## Table of Contents

1. [Overview](#overview)
2. [Hook Organization](#hook-organization)
3. [Hook Patterns](#hook-patterns)
4. [TypeScript Integration](#typescript-integration)
5. [Error Handling](#error-handling)
6. [Testing Hooks](#testing-hooks)
7. [Migrating Legacy Hooks](#migrating-legacy-hooks)

## Overview

Custom React hooks are a fundamental part of the Simple Tracker architecture, providing reusable logic for:

- Data fetching and state management
- Authentication and authorization
- UI interactions and animations
- Device and performance optimization
- Form handling and validation

All hooks follow consistent patterns to ensure maintainability, type safety, and consistent error handling.

## Hook Organization

Hooks are organized by their purpose and domain:

```
/src
  /hooks
    index.ts                  # Central export file
    /queries                  # TanStack Query hooks
      useTicketQueries.ts
      useWorkdayQueries.ts
      ...
    useAuth.ts                # Authentication
    useImageUpload.ts         # Image upload functionality
    useJobsites.ts            # Jobsite data management
    useMediaQuery.ts          # Responsive design utilities
    useReducedMotion.ts       # Accessibility
    useTickets.ts             # Ticket data management
    useTrucks.ts              # Truck data management
    useWizardAnimations.ts    # Wizard animations
    useWizardApi.ts           # Wizard API integration
    useWorkdays.ts            # Workday data management
```

The `index.ts` file exports all hooks with categorized comments for easy imports:

```typescript
// Authentication hooks
export * from './useAuth';

// Data fetching hooks
export * from './queries';
export * from './useTickets';
// ...

// UI and responsive design hooks
export * from './useMediaQuery';
// ...
```

## Hook Patterns

### Basic Hook Structure

All hooks follow a consistent structure:

```typescript
/**
 * Hook description
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source related-document.md - "Related Section" section
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Return type for useExample hook
 */
interface UseExampleReturn {
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Main function provided by the hook */
  doSomething: (param: string) => Promise<boolean>;
  // Other properties...
}

/**
 * Hook for example functionality
 * 
 * @param initialValue - Initial value description
 * @returns Object containing example methods and state
 */
export function useExample(initialValue: string): UseExampleReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Main function description
   * 
   * @param param - Parameter description
   * @returns Promise resolving to success status
   */
  const doSomething = useCallback(async (param: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Implementation...
      
      return true;
    } catch (err) {
      setError('Error message');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [/* dependencies */]);
  
  return {
    isLoading,
    error,
    doSomething
  };
}
```

### Data Fetching Hooks

Data fetching hooks use TanStack Query for efficient caching and state management:

```typescript
export function useExampleQueries() {
  const useGetData = (id: string) => {
    return useQuery({
      queryKey: queryKeys.example.detail(id),
      queryFn: () => fetchData(id),
      select: extractResponseData,
    });
  };
  
  return {
    useGetData,
  };
}
```

### UI and Animation Hooks

UI hooks provide reusable UI logic and animations:

```typescript
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);
    
    const handleChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);
  
  return matches;
}
```

## TypeScript Integration

All hooks use TypeScript for type safety and better developer experience:

1. **Explicit Return Types**: Each hook has an interface describing its return value
2. **Generic Types**: Used for flexible, type-safe implementations
3. **Explicit Parameter Types**: All parameters have explicit types
4. **JSDoc Comments**: All hooks, parameters, and return values have JSDoc comments

Example:

```typescript
/**
 * Return type for useAuth hook
 */
interface UseAuthReturn {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Current user data */
  user: UserData | null;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<boolean>;
  // Other properties...
}

/**
 * Hook for managing authentication state and operations
 * 
 * @returns Authentication methods and state
 */
export function useAuth(): UseAuthReturn {
  // Implementation...
}
```

## Error Handling

Hooks follow consistent error handling patterns:

1. **Loading States**: All async hooks track loading state
2. **Error States**: All async hooks track error messages
3. **Centralized Error Handling**: Using the `errorHandler` utility
4. **Retry Logic**: For network operations
5. **User-Friendly Messages**: Formatted for display in the UI

Example:

```typescript
try {
  // Implementation...
} catch (err) {
  const formattedError = errorHandler.formatError(err);
  const userMessage = errorHandler.getUserFriendlyMessage(err);
  
  setError(userMessage);
  
  errorHandler.logError(err, { 
    operation: 'operationName',
    additionalContext: 'value'
  });
  
  return false;
}
```

## Testing Hooks

Hooks are tested using React Testing Library's `renderHook` utility:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useExample } from './useExample';

describe('useExample', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useExample('initial'));
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
  
  it('should handle doSomething correctly', async () => {
    const { result } = renderHook(() => useExample('initial'));
    
    await act(async () => {
      const success = await result.current.doSomething('param');
      expect(success).toBe(true);
    });
    
    expect(result.current.isLoading).toBe(false);
  });
});
```

## Migrating Legacy Hooks

Simple Tracker is migrating legacy hooks to use TanStack Query. The migration process:

1. **Create Query Hooks**: Implement new hooks using TanStack Query
2. **Maintain Legacy Hooks**: Keep existing hooks working during transition
3. **Update Components**: Gradually update components to use new hooks
4. **Remove Legacy Hooks**: Once all components are updated

Legacy hooks are marked with comments indicating their migration status:

```typescript
/**
 * @deprecated Use useTicketQueries from '@/hooks/queries/useTicketQueries' instead
 */
export function useTickets() {
  // Legacy implementation...
}
```

New query hooks follow the patterns described in the [API-TANSTACK-QUERY-GUIDE.md](./API-TANSTACK-QUERY-GUIDE.md) document.
