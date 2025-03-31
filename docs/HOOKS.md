---
title: Simple Tracker Custom Hooks Guide
date: 2025-03-28
tags: [hooks, react, typescript, tanstack-query, state-management, documentation, reference, patterns]
status: official
author: Development Team
---

# Simple Tracker Custom Hooks Guide

## Table of Contents

1. [Overview](#overview)
2. [Hook Architecture](#hook-architecture)
3. [Standard Hook Patterns](#standard-hook-patterns)
4. [Custom Hooks Implementation](#custom-hooks-implementation)
5. [TanStack Query Hooks](#tanstack-query-hooks)
6. [State Management in Hooks](#state-management-in-hooks)
7. [Error Handling](#error-handling)
8. [TypeScript Integration](#typescript-integration)
9. [Testing Hooks](#testing-hooks)
10. [Hook Migration Strategy](#hook-migration-strategy)
11. [Best Practices](#best-practices)

## Overview

### Purpose

This document outlines the patterns, best practices, and organization of custom React hooks in the Simple Tracker application. It serves as a reference for developers to understand hook structure, implementation details, and the reasoning behind key design decisions.

### Hook Taxonomy

Simple Tracker uses several types of hooks for different purposes:

1. **Data Fetching Hooks**: Based on TanStack Query for efficient server state management
2. **UI Interaction Hooks**: For user interface behavior and animations
3. **Form Management Hooks**: For form state and validation
4. **Utility Hooks**: For browser APIs, responsive design, and accessibility
5. **Business Logic Hooks**: For domain-specific functionality

### Core Principles

Our hook implementation follows these core principles:

1. **Consistent Structure**: Standard patterns for all hooks
2. **Explicit TypeScript Types**: Strong typing for safety and developer experience
3. **Separation of Concerns**: Each hook with a focused purpose
4. **Composability**: Hooks composed from simpler hooks
5. **Error Handling**: Consistent error handling across all async hooks

## Hook Architecture

### Directory Structure

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

### Organization Principles

1. **Domain-Based Organization**: Query hooks organized by domain
2. **Focused Purpose**: Each hook serves a specific, well-defined purpose
3. **Central Exports**: All hooks exported from a central index.ts
4. **Query Separation**: TanStack Query hooks in dedicated directory
5. **Naming Conventions**: Consistent 'use' prefix for all hooks

### Hook Types and Responsibilities

The application distinguishes between different hook types with clear responsibilities:

1. **Query Hooks**: Manage server state with TanStack Query
   - Consistent caching and refetching
   - Type-safe data fetching
   - Standardized error handling

2. **Mutation Hooks**: Handle data modification operations
   - Form submissions
   - Data updates
   - Batch operations

3. **Composed Business Logic Hooks**: Combine multiple hooks for specific features
   - Wizard state management
   - Complex forms
   - Multi-step processes

4. **UI Utility Hooks**: Support UI behaviors and interactions
   - Animation states
   - Responsive design
   - Accessibility features

## Standard Hook Patterns

### Base Hook Template

All hooks follow a consistent structure with:

1. **JSDoc Documentation**: Comprehensive comments
2. **Explicit Interface**: Return type interface
3. **Standard Function Pattern**: useState, useEffect, useCallback
4. **Explicit Error Handling**: Loading and error states
5. **Memoized Return Object**: Consistent return pattern

### State Management Patterns

Hooks follow these state management patterns:

1. **Loading State Tracking**: `isLoading` state for async operations
2. **Error State Management**: `error` state with appropriate typing
3. **Data State**: Typed data state appropriate to the hook's purpose
4. **State Initialization**: Sensible default values
5. **State Updates**: Atomic updates for related state

### Callback Patterns

All action callbacks follow these patterns:

1. **useCallback Wrapping**: Performance optimization
2. **Explicit Dependency Arrays**: Prevent infinite loops
3. **Async/Await Pattern**: For asynchronous operations
4. **Error Handling**: try/catch with standardized patterns
5. **Return Values**: Boolean success indicators or specific return types

### Hook Composition

Hooks can be composed from simpler hooks:

1. **Hook Reuse**: Extract common patterns into reusable hooks
2. **State Sharing**: Share state between hooks when appropriate
3. **Feature Hooks**: Compose domain-specific hooks from general hooks
4. **Progressive Complexity**: Build complex hooks from simpler building blocks

## Custom Hooks Implementation

### UI and Interaction Hooks

These hooks handle user interface behavior:

1. **useMediaQuery**: For responsive design adaptations
2. **useReducedMotion**: Respects user preference for reduced motion
3. **useHapticFeedback**: Provides tactile feedback on mobile
4. **useBottomSheet**: Manages bottom sheet UI component
5. **useModal**: Controls modal dialog behavior

### Form Hooks

Hooks for form management with React Hook Form and Zod:

1. **useForm**: Wrapper around React Hook Form with custom defaults
2. **useWizardForm**: Multi-step form management
3. **useFormValidation**: Complex form validation logic
4. **useFormState**: Form state persistence
5. **useFormSubmission**: Form submission with error handling

### Utility Hooks

General-purpose utility hooks:

1. **useLocalStorage**: Wrapper for localStorage with type safety
2. **useDebounce**: Delays execution for performance optimization
3. **useClickOutside**: Detects clicks outside an element
4. **usePrevious**: Tracks previous value of a state
5. **useIsMounted**: Prevents updates on unmounted components

### Business Logic Hooks

Domain-specific hooks for application features:

1. **useTickets**: Ticket management
2. **useWorkdays**: Workday tracking
3. **useJobsites**: Jobsite management
4. **useTrucks**: Truck inventory management
5. **useWizard**: Wizard state and navigation

## TanStack Query Hooks

### Query Hook Patterns

Query hooks follow these patterns:

1. **Domain-Based Organization**: Hooks grouped by domain
2. **Hook Factory Functions**: Functions that return hooks
3. **Parameterized Queries**: Support for filtering and pagination
4. **Standardized Options**: Consistent query options
5. **Explicit Return Types**: Typed query results

### Mutation Hook Patterns

Mutation hooks follow these patterns:

1. **Standardized Toast Notifications**: Consistent feedback
2. **Cache Invalidation**: Automatic query invalidation
3. **Optimistic Updates**: Better user experience
4. **Error Handling**: Standardized error handling
5. **Success Callbacks**: Support for success actions

### Integration with API Client

Query hooks integrate with the API client:

1. **API Function Integration**: Direct use of API client functions
2. **Error Handling Integration**: Throw-and-catch pattern
3. **Response Transformation**: Consistent data extraction
4. **Typesafe Parameters**: Type-safe inputs to API functions

### State Derivation

Complex state is derived from query results:

1. **Computed Properties**: Calculated from query results
2. **Dependent Queries**: Queries that depend on other query results
3. **Conditional Fetching**: Queries that run conditionally
4. **Parallel Queries**: Multiple queries running in parallel
5. **Sequential Queries**: Queries that depend on previous results

## State Management in Hooks

### Local State Management

Hooks use React's useState for local state:

1. **Atomic State Design**: One state variable per concern
2. **Initial State Computation**: Lazy initialization for expensive computations
3. **State Updates**: Functional updates for previous state
4. **Derived State**: Computed from other state
5. **State Resetting**: Clear patterns for state reset

### Integration with Zustand

Hooks integrate with Zustand for global state:

1. **Store Access Patterns**: Consistent access to Zustand stores
2. **Selector Patterns**: Optimized selectors for performance
3. **Action Integration**: Using store actions within hooks
4. **State Synchronization**: Keeping local and global state in sync
5. **Persistence Integration**: Working with persisted state

### Integration with TanStack Query

Hooks integrate with TanStack Query for server state:

1. **Cache Utilization**: Leverage query cache for performance
2. **Invalidation Patterns**: Consistent query invalidation
3. **Query Key Structure**: Hierarchical key structure
4. **Background Updates**: Managing background refetching
5. **Stale Time Configuration**: Appropriate stale times

### State Synchronization Patterns

Hooks synchronize state between different sources:

1. **API to Local Sync**: Syncing API data to local state
2. **Form to Store Sync**: Syncing form state to global store
3. **Cross-Component Sync**: Sharing state between components
4. **Optimistic Updates**: Immediate UI updates with background sync
5. **Error Recovery**: Rolling back state on error

## Error Handling

### Standard Error Handling Patterns

All hooks handle errors consistently:

1. **Error State Management**: Storing error messages
2. **Error Classification**: Classifying error types
3. **User-Friendly Messages**: Converting technical errors to user messages
4. **Error Clearing**: Patterns for clearing errors
5. **Error Context**: Providing context with errors

### Retry Logic

Asynchronous operations implement retry logic:

1. **Exponential Backoff**: Increasing delay between retries
2. **Max Retries**: Limiting retry attempts
3. **Error Classification**: Retrying only retriable errors
4. **User Feedback**: Keeping users informed of retries
5. **Fallback Mechanisms**: Graceful degradation on failure

### Error Reporting

Errors are reported through a centralized system:

1. **Error Logging**: Centralized error logging
2. **Error Categorization**: Classifying errors for analysis
3. **Context Collection**: Gathering context for debugging
4. **User Impact Assessment**: Determining user impact
5. **Critical Error Handling**: Special handling for critical errors

### Error Recovery

Hooks implement error recovery mechanisms:

1. **State Rollback**: Restoring previous state on error
2. **Retry Prompts**: Allowing users to retry operations
3. **Alternative Paths**: Providing alternatives on failure
4. **Graceful Degradation**: Maintaining functionality
5. **Recovery Actions**: Specific actions for error recovery

## TypeScript Integration

### Type Definitions and Interfaces

Hooks use comprehensive TypeScript types:

1. **Explicit Return Types**: Interface for hook return values
2. **State Type Definitions**: Explicit types for state variables
3. **Parameter Types**: Type definitions for hook parameters
4. **Event Types**: Proper typing for event handlers
5. **API Response Types**: Integration with API response types

### Generic Hooks

Reusable hooks use generics for flexibility:

1. **Generic Type Parameters**: Parameterized types
2. **Constraints**: Type constraints where appropriate
3. **Default Types**: Sensible defaults for type parameters
4. **Type Inference**: Leveraging TypeScript's inference
5. **Generic Utility Types**: Reusable utility types

### Return Type Patterns

Hook return types follow consistent patterns:

1. **Named Interfaces**: Explicit interfaces for return types
2. **Property Documentation**: JSDoc comments for properties
3. **Response Structure**: Consistent structure across hooks
4. **Optional Properties**: Proper use of optional types
5. **Union Types**: Appropriate use of union types

### Type Safety Practices

Hooks ensure type safety through:

1. **Exhaustive Checks**: Type narrowing with exhaustive checks
2. **Type Guards**: Custom type guards for runtime checking
3. **Strong Types**: Avoiding 'any' and unsafe types
4. **Discriminated Unions**: Type-safe handling of different states
5. **Exact Types**: Preventing excess properties

## Testing Hooks

### Testing Setup

Hook tests use a consistent setup:

1. **Testing Utilities**: Custom testing utilities
2. **Provider Wrappers**: Context providers for testing
3. **Mock Data**: Standardized mock data
4. **Testing Environment**: Consistent environment setup
5. **Assertion Patterns**: Standardized assertions

### Standard Test Patterns

Hook tests follow these patterns:

1. **Initial State Tests**: Verify initial hook state
2. **Action Tests**: Test actions and state changes
3. **Async Tests**: Test asynchronous behavior
4. **Error Tests**: Verify error handling
5. **Edge Case Tests**: Test boundary conditions

### Mocking Dependencies

Tests mock external dependencies:

1. **API Mocking**: Mock API responses
2. **Store Mocking**: Mock Zustand stores
3. **Context Mocking**: Mock React context
4. **Browser API Mocking**: Mock browser APIs
5. **Service Mocking**: Mock application services

### Testing Different Hook Types

Different hook types have specific testing approaches:

1. **Query Hook Testing**: Test with QueryClient provider
2. **UI Hook Testing**: Test with DOM interactions
3. **Form Hook Testing**: Test with form submissions
4. **Business Logic Hook Testing**: Test complex state transitions
5. **Composed Hook Testing**: Test hook composition

## Hook Migration Strategy

### Legacy Hook Patterns

The application is transitioning from legacy hooks:

1. **Direct API Calls**: Hooks with embedded API calls
2. **Local State Only**: Hooks without query caching
3. **Manual Loading State**: Manually tracking loading state
4. **Inconsistent Error Handling**: Varied error handling approaches
5. **Limited TypeScript Integration**: Incomplete typing

### Migration Approach

The migration strategy follows these steps:

1. **Create New Hooks**: Implement new hooks with TanStack Query
2. **Maintain Legacy Hooks**: Keep existing hooks working during transition
3. **Update Components**: Gradually update components to use new hooks
4. **Remove Legacy Hooks**: Once all components are updated

### Compatibility Layers

During migration, compatibility layers enable smooth transition:

1. **Legacy Hook Wrappers**: New hook implementation with legacy interface
2. **Feature Flags**: Toggle between implementations
3. **Gradual Adoption**: Component-by-component migration
4. **Data Consistency**: Ensuring consistent data across implementations
5. **Performance Monitoring**: Tracking performance impacts

### Deprecation Process

Legacy hooks are being deprecated:

1. **Deprecation Comments**: Mark hooks as deprecated
2. **Migration Documentation**: Guide for updating to new hooks
3. **Warning Logs**: Runtime warnings for deprecated hooks
4. **Usage Tracking**: Monitor usage of deprecated hooks
5. **Removal Timeline**: Schedule for removing deprecated hooks

## Best Practices

### Development Guidelines

Follow these guidelines when developing hooks:

1. **Single Responsibility**: Each hook should have one clear purpose
2. **Explicit Dependencies**: All dependencies listed in dependency arrays
3. **Consistent Naming**: Follow established naming conventions
4. **Clear Documentation**: Comprehensive JSDoc comments
5. **Error Handling**: Handle all possible errors

### Performance Considerations

Optimize hook performance with:

1. **Memoization**: Use useMemo and useCallback appropriately
2. **Dependency Management**: Minimize dependency array items
3. **Selective Rendering**: Prevent unnecessary renders
4. **Batched Updates**: Group related state updates
5. **Lazy Initialization**: Initialize expensive state lazily

### Maintainability Patterns

Keep hooks maintainable with:

1. **Size Limitation**: Keep hooks focused and small
2. **Clear Abstractions**: Well-defined responsibilities
3. **Consistent Structure**: Follow standard patterns
4. **Thorough Documentation**: Document purpose and usage
5. **Comprehensive Testing**: Test all behaviors

### Hook Composition Guidelines

Compose hooks effectively:

1. **Progressive Composition**: Build complex hooks gradually
2. **Clear Dependencies**: Explicit dependencies between hooks
3. **State Isolation**: Avoid unexpected state sharing
4. **Explicit Interfaces**: Clear interfaces between hooks
5. **Reuse Over Repetition**: Extract common patterns into reusable hooks

