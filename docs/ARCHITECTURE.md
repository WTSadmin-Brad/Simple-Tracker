---
title: Simple Tracker Architecture
date: 2025-03-26
tags: [architecture, documentation, reference, design, patterns]
status: official
author: Development Team
---

# Simple Tracker Architecture

## Table of Contents

1. [Introduction](#introduction)
2. [Core Architecture](#core-architecture)
3. [Component Architecture](#component-architecture)
4. [State Management Strategy](#state-management-strategy)
5. [Data Flow Patterns](#data-flow-patterns)
6. [Authentication Architecture](#authentication-architecture)
7. [Error Handling Architecture](#error-handling-architecture)
8. [Integration Patterns](#integration-patterns)
9. [Performance Considerations](#performance-considerations)
10. [Development Workflow](#development-workflow)

## Introduction

### Purpose

This document describes the architectural patterns, design decisions, and organizational structures of the Simple Tracker application. It serves as a guide for developers to understand how the application is structured and the reasoning behind key design decisions.

### Application Overview

Simple Tracker is a web application for tracking work activities with:

- Employee ticket submissions
- Workday tracking and management
- Admin dashboard for data oversight
- Reporting and export capabilities

### Technology Stack

- **Frontend Framework**: Next.js 13.4.12 (App Router)
- **UI Library**: React 18.2.0 with TypeScript 5.1.6
- **Styling/Components**: Tailwind CSS 3.3.3 and `shadcn/ui` (built on Radix UI primitives).
- **State Management**: Zustand 4.3.9 for client state, TanStack Query 5.69.0 for server state
- **Form Management**: React Hook Form 7.45.2 with Zod 3.21.4 for validation
- **Backend**: Firebase (Firestore + Storage - Client SDK 10.7.1, Admin SDK used server-side)

## Core Architecture

### Architectural Approach

Simple Tracker follows a hybrid architecture that combines aspects of both layered and feature-based organization:

- **Layered organization** for fundamental UI components and utilities
- **Feature-based organization** for business logic and domain-specific code

This hybrid approach balances reusability of common components with cohesion of related business logic.

### Directory Structure

```
/src
  /app                 # Next.js App Router pages and API routes
    /api               # API endpoints organized by resource
    /auth              # Authentication pages
    /admin             # Admin-specific pages
    /employee          # Employee-specific pages
  /components          # Reusable React components
    /ui                # UI primitives (buttons, inputs, etc.)
    /common            # Shared components used across features
    /feature           # Feature-specific components
  /hooks               # Custom React hooks
    /queries           # TanStack Query hooks organized by domain
  /lib                 # Utilities, services, and helpers
    /api               # API client functions
    /firebase          # Firebase configuration and helpers
    /errors            # Error handling utilities
    /query             # TanStack Query utilities
    /schemas           # Zod validation schemas
  /stores              # Zustand stores
  /types               # TypeScript type definitions
```

### Key Design Principles

1. **Separation of Concerns**
   - Clear separation between UI components, business logic, and data access
   - Server-side vs. client-side code separation

2. **Type Safety**
   - Comprehensive TypeScript interfaces for all data structures
   - Zod schemas for runtime validation

3. **Error Handling**
   - Centralized error handling with consistent patterns
   - User-friendly error messages with detailed logging

4. **Feature Cohesion**
   - Related code is kept together by feature/domain
   - Minimizes context switching when working on a specific feature

## Component Architecture

### Component Hierarchy

Simple Tracker uses a layered component approach:

1. **UI Primitives** (`/src/components/ui/`)
   - Basic building blocks (buttons, inputs, cards)
   - Based on `shadcn/ui` components (which use Radix UI primitives) with consistent styling via Tailwind CSS.

2. **Common Components** (`/src/components/common/`)
   - Shared UI patterns used across features
   - Composed from UI primitives with specific styling/behavior

3. **Feature Components** (`/src/components/feature/`)
   - Domain-specific components organized by feature area
   - Encapsulate business logic for specific domains

4. **Page Components** (`/src/app/*/page.tsx` and `/src/app/*/_components/`)
   - Components specific to a single page or route
   - Combine feature components into full pages

### Server vs. Client Components

Next.js App Router distinguishes between server and client components:

- **Server Components** (`.tsx`)
  - Render on the server
  - Cannot use hooks or browser APIs
  - Used for static content and data fetching
  - Default unless specified otherwise

- **Client Components** (`'use client'`)
  - Run in the browser
  - Can use React hooks and browser APIs
  - Used for interactive components
  - Explicitly marked with the `"use client";` directive at the top of the file.

> **Note:** Always consider whether a component needs interactivity before making it a client component, as server components offer better performance.

### Component Composition

Simple Tracker follows these component composition patterns:

1. **Composition Over Inheritance**
   - Components are composed from smaller pieces
   - Higher-order components are used sparingly

2. **Prop Drilling Minimization**
   - Context or state management for deeply nested data
   - Compound components for related UI elements

3. **Container/Presentation Pattern**
   - Container components handle data and logic
   - Presentation components focus on rendering

## State Management Strategy

### State Types

Simple Tracker distinguishes between different types of state:

1. **UI State** (Zustand)
   - Temporary UI states (open/closed dialogs, active tabs)
   - User preferences
   - Multi-step form state (wizard)

2. **Server State** (TanStack Query)
   - Data from API/Firebase
   - Caching and revalidation
   - Loading and error states

3. **Form State** (React Hook Form)
   - Form values
   - Validation state
   - Submission state

### Zustand for Client State

Zustand manages client-side state with these patterns:

- **Store Organization**: One store per feature/domain
- **State Updates**: Atomic updates using actions
- **Persistence**: Selective persistence for user preferences
- **Minimalism**: Keep stores small and focused

Example stores:

- `authStore.ts`: User authentication state
- `wizardStore.ts`: Ticket submission wizard state
- `uiStore.ts`: Global UI state (theme, sidebar state)

### TanStack Query for Server State

TanStack Query manages all server data with these patterns:

- **Query Organization**: Hooks organized by domain
- **Caching Strategy**: Appropriate stale times for different data types
- **Automatic Invalidation**: Structured query keys for precise invalidation
- **Error Handling**: Consistent error handling for all queries

## Data Flow Patterns

### Request/Response Flow

Data flows through the application in this pattern:

1. **User Interface**
   - User interactions trigger data requests
   - Loading states show while data is fetched

2. **Query/Mutation Hooks**
   - Manage data fetching and caching
   - Handle loading and error states

3. **API Client**
   - Makes HTTP requests to API endpoints
   - Formats requests and handles responses

4. **API Routes**
   - Process requests on the server
   - Validate inputs and handle authentication

5. **Firebase Interaction**
   - Server-side interaction with Firebase
   - Data retrieval and manipulation

6. **Response Processing**
   - Data transformation for client consumption
   - Error handling and formatting

### Data Transformation Layers

Simple Tracker uses these data transformation patterns:

1. **API Response Formatting**
   - Consistent structure with `success`, `message`, and resource-specific data
   - Standardized error formatting

2. **Type Conversion**
   - Firestore timestamps to JavaScript dates
   - Consistent string formats for dates

3. **Data Enrichment**
   - Adding derived properties
   - Combining data from multiple sources

### API Response Format

The application uses a standardized API response format across all endpoints:

```
// Success response
{
  success: true,
  message: string,
  [resourceName]: resource-specific data, // e.g., tickets, workday, user
  timestamp: string (ISO date)
}

// Error response
{
  success: false,
  message: string,
  error: {
    code: string,
    status: number,
    details?: any
  },
  timestamp: string (ISO date)
}
```

This standardized format uses resource-specific properties (like `tickets` or `workday`) rather than a generic `data` property, providing better type safety and more intuitive client usage.

## Authentication Architecture

### Authentication Flow

Simple Tracker uses a custom authentication flow integrated with Firebase Authentication:

1.  **Login (Username/Password):**
    *   User submits username and password via the client-side login form.
    *   The client sends credentials to the custom API endpoint `/api/auth/login`.
2.  **Server-Side Verification & Custom Token:**
    *   The `/api/auth/login` endpoint verifies credentials (e.g., username and hashed password stored in Firestore).
    *   Upon successful verification, the server uses the Firebase Admin SDK (`createCustomToken`) to mint a Firebase Custom Token for the user's UID.
    *   This Custom Token is returned to the client.
3.  **Client-Side Firebase Sign-In:**
    *   The client receives the Custom Token.
    *   The client uses the Firebase Client SDK (`signInWithCustomToken`) to exchange the Custom Token for a standard Firebase ID Token and Refresh Token.
    *   The Firebase Client SDK automatically manages the ID Token lifecycle (including refresh).
4.  **Authenticated Requests:**
    *   For subsequent requests to protected API routes or during page navigation checks, the client sends the current Firebase ID Token in the `Authorization: Bearer <ID_token>` header.
5.  **Logout:**
    *   The client calls the Firebase Client SDK's sign-out method.
    *   Client-side tokens and authentication state are cleared.

### Access Control Architecture

Access control is implemented server-side using verified Firebase ID Tokens:

1.  **Page-Level Protection (Next.js Middleware):**
    *   Located in `src/middleware.ts`.
    *   Intercepts requests for protected pages.
    *   Extracts the ID Token from the `Authorization: Bearer` header.
    *   Uses the Firebase Admin SDK (`verifyIdToken`) to verify the token's validity and signature *on the server*.
    *   Redirects unauthenticated users (invalid/missing token) to the login page.
    *   Checks *verified* custom claims (e.g., `role: 'admin'`) within the decoded token for role-specific routes (like `/admin`).

2.  **API Route Protection (API Middleware Helpers):**
    *   Helper functions (e.g., `withAuthentication`, `withAdminRole`) located in `src/lib/api/middleware.ts`.
    *   These helpers wrap API route handlers.
    *   They extract and verify the ID Token from the `Authorization: Bearer` header using the Firebase Admin SDK (`verifyIdToken`).
    *   They enforce authentication and, where necessary, specific roles by checking *verified* custom claims from the token.
    *   The verified user UID and claims are made available to the route handler.

3.  **Role Verification (Server-Side Custom Claims):**
    *   Role-Based Access Control (RBAC) relies *exclusively* on verified custom claims embedded within the Firebase ID Token.
    *   Claims (e.g., `{ role: 'admin' }` or `{ role: 'employee' }`) are set securely on the server using the Firebase Admin SDK (e.g., during user creation or role update).
    *   Both the Next.js middleware and API route protection helpers inspect these *verified* claims after successful token verification to make authorization decisions.
    *   This approach eliminates insecure methods like relying on client-sent headers (`x-user-role`), insecurely decoded tokens (`jwt-decode`), or unverified token data.
### User Roles

Simple Tracker supports these roles:

- **Employee**: Regular users who submit tickets and track workdays
- **Admin**: Administrators who manage users, view reports, and configure settings

## Error Handling Architecture

### Error Taxonomy

Simple Tracker uses these error types:

1. **Application Errors**
   - `AppError`: Base error class
   - `ValidationError`: Input validation failures
   - `AuthError`: Authentication issues
   - `NotFoundError`: Resource not found
   - `ForbiddenError`: Permission issues
   - `NetworkError`: Communication problems

2. **Error Codes**
   - Standardized error codes in `ErrorCodes` enum
   - Categorized by domain (auth/, validation/, etc.)
   - Used for consistent error handling

### Error Handling Philosophy

The error handling approach follows these principles:

1. **Developer Context**
   - Detailed error information for debugging
   - Stack traces in development

2. **User Experience**
   - User-friendly messages without technical details
   - Actionable error messages when possible

3. **Logging**
   - Centralized error logging
   - Error categorization by severity

### Error Handler Implementation

The central error handler in `src/lib/errors/error-handler.ts` provides:

1. **Error Formatting**
   - Converts all error types to a consistent format
   - Extracts relevant details from different error sources

2. **User-Friendly Messaging**
   - Maps technical errors to user-friendly messages
   - Considers error context for message generation

3. **Response Generation**
   - Standardized error responses using `createErrorResponse` utility
   - Consistent structure for client consumption

4. **Retry Capabilities**
   - Automatic retry for transient errors
   - Exponential backoff for network issues

## Integration Patterns

### Firebase Integration

Firebase integration follows these patterns:

1. **Client vs. Admin SDK**
   - `src/lib/firebase/client.ts`: Browser-side operations
   - `src/lib/firebase/admin.ts`: Server-side operations

2. **Firebase Service Access**
   - Getter functions for service instances
   - Consistent error handling

3. **Data Modeling**
   - Consistent document structure
   - Field naming conventions
   - Timestamp handling

### API Integration

API integration follows these patterns:

1. **API Client**
   - `src/lib/api/apiClient.ts`: Core request functions with standardized response handling
   - Domain-specific API modules (ticketApi.ts, etc.)

2. **Request Formatting**
   - Consistent parameter handling
   - Type-safe request building

3. **Response Processing**
   - Standardized response structure across all endpoints 
   - Resource-specific properties for type-safe data access
   - Consistent error extraction and handling

### Third-Party Service Integration

For external service integration:

1. **Service Encapsulation**
   - Wrap third-party APIs in service modules
   - Hide implementation details

2. **Fallback Mechanisms**
   - Graceful degradation when services are unavailable
   - Appropriate error handling

## Performance Considerations

### Rendering Strategy

Simple Tracker optimizes rendering with:

1. **Server Components**
   - Server-side rendering for initial page load
   - Static generation where appropriate

2. **Component Splitting**
   - Client components only where needed
   - Dynamic imports for code splitting

### Data Fetching Optimization

Data fetching is optimized with:

1. **Caching Strategy**
   - Appropriate cache times for different data types
   - Selective refetching based on staleness

2. **Query Optimization**
   - Fetch only needed data
   - Pagination for large datasets

3. **Parallel Queries**
   - Fetch independent data in parallel
   - Sequential fetching for dependent data

### Bundle Optimization

Bundle size is managed with:

1. **Code Splitting**
   - Route-based splitting
   - Component-level lazy loading

2. **Tree Shaking**
   - Import only what's needed
   - Avoid large libraries where possible

## Development Workflow

### Development Environment

The development environment includes:

1. **Local Setup**
   - Next.js development server
   - Firebase emulators (optional)

2. **Environment Variables**
   - `.env.local` for local configuration
   - Firebase configuration variables

### Testing Strategy

The testing approach includes:

1. **Component Testing**
   - React Testing Library for component tests
   - Mock providers for context and state

2. **Hook Testing**
   - Custom testing utilities for hooks
   - Mocking external dependencies

3. **Integration Testing**
   - API route testing
   - End-to-end testing for critical flows

### Recommended Practices

Development should follow these practices:

1. **TypeScript Usage**
   - Explicit return types for functions
   - Interface-driven development
   - Minimize `any` types

2. **Component Development**
   - Clear component boundaries
   - Explicit prop interfaces
   - Documentation with JSDoc

3. **State Management**
   - Keep state close to where it's used
   - Minimize global state
   - Use appropriate state types

## Code Patterns Requiring Updates

The following areas in the codebase should be updated to follow established patterns:

1. **Role Verification**
   - Admin route handlers repeat role verification code
   - Consider extracting into a shared utility function

2. **Type Definitions**
   - Some components lack explicit return type interfaces
   - Add interfaces for consistent typing

3. **Query Key Structure**
   - Some newer query keys don't follow the established pattern
   - Update to match the nested structure in `src/lib/query/queryKeys.ts`
