# Simple Tracker Architecture & Design Patterns

## Table of Contents

1. [Overview](#overview)
2. [Application Architecture](#application-architecture)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Data Flow](#data-flow)
6. [API Integration](#api-integration)
7. [Error Handling](#error-handling)
8. [Form Management](#form-management)
9. [Animation Patterns](#animation-patterns)
10. [Responsive Design](#responsive-design)

## Overview

Simple Tracker is a mobile-first Progressive Web Application (PWA) built with Next.js 15.3.0 using the App Router. The application follows a layered architecture with clear separation of concerns between UI components, business logic, and data access.

### Technology Stack

- **Frontend Framework**: Next.js 15.3.0 (App Router)
- **UI Library**: React 19 with TypeScript 5.8.2
- **Styling**: Tailwind CSS 4.0.13 with shadcn/ui 0.9.5
- **Animation**: Framer Motion 12.5.0
- **State Management**: Zustand 5.0.3 for client state, TanStack Query 5.67.3 for server state
- **Form Management**: React Hook Form 7.54.2 with Zod 3.24.2 for validation
- **Backend**: Firebase (Firestore + Storage)

## Application Architecture

The application follows a feature-based architecture with clear separation between different layers:

### Directory Structure

```markdown
/src
  /app                 # Next.js App Router pages and API routes
  /components          # Reusable React components
  /hooks               # Custom React hooks
  /lib                 # Utilities, services, and helpers
  /stores              # Zustand stores
  /types               # TypeScript type definitions
```

### Key Architectural Patterns

1. **Feature-Based Organization**
   - Features are organized into self-contained modules
   - Each feature has its own components, hooks, and services
   - Common functionality is extracted into shared utilities

2. **Server/Client Component Separation**
   - Server Components (`.tsx`) for static content and data fetching
   - Client Components (`.client.tsx`) for interactive elements
   - Clear separation of concerns between server and client rendering

3. **API Layer Separation**
   - API routes in `/app/api/` handle server-side logic
   - Service layer in `/lib/services/` handles client-side API integration
   - Clear separation between data access and business logic

## Component Architecture

The component architecture follows a layered approach with clear responsibilities for each layer:

### Component Layer Hierarchy

1. **UI Primitives** (`/src/components/ui/`)
   - Basic building blocks (buttons, inputs, cards)
   - Based on shadcn/ui components with consistent styling
   - Examples: `button.tsx`, `card.tsx`, `dialog.tsx`

2. **Common Components** (`/src/components/common/`)
   - Shared UI patterns used across features
   - Composed from UI primitives with specific styling/behavior
   - Examples: `error-message.tsx`, `loading-spinner.tsx`, `bottom-sheet.tsx`

3. **Feature Components** (`/src/components/feature/`)
   - Domain-specific components organized by feature area
   - Encapsulate business logic for specific domains
   - Examples: `tickets/counter.client.tsx`, `calendar/month-view.tsx`

4. **Route-Specific Components** (`/src/app/*/_components/`)
   - Components used only within a specific route
   - Colocated with their routes in `_components` directories
   - Examples: `app/employee/tickets/new/_components/wizard-container.client.tsx`

### Component Composition Strategy

1. **Composition Over Inheritance**
   - Components are composed from smaller pieces
   - Higher-order components are used sparingly
   - Props are used for configuration and customization

2. **Single Responsibility Principle**
   - Each component has a clear, focused purpose
   - Complex components are broken down into smaller, manageable pieces
   - Business logic is separated from presentation

3. **Compound Component Pattern**
   - Used for complex UI patterns like the Wizard
   - Related components work together through context or props
   - Clear parent-child relationships

### Client vs. Server Component Separation

- **Server Components** (`.tsx`)
  - Render on the server
  - Cannot use hooks or browser APIs
  - Used for static content and data fetching
  - Default unless specified otherwise

- **Client Components** (`.client.tsx`)
  - Run in the browser
  - Can use React hooks and browser APIs
  - Used for interactive components
  - Explicitly marked with `.client.tsx` suffix

## State Management

The application uses a hybrid state management approach:

### Client State Management (Zustand)

- **Purpose**: Manage UI state, user preferences, and client-side data
- **Implementation**: Zustand stores in `/src/stores/`
- **Key Stores**:
  - `authStore.ts`: Manages authentication state
  - `calendarStore.ts`: Manages calendar view state
  - `dashboardStore.ts`: Manages admin dashboard state
  - `preferencesStore.ts`: Manages user preferences
  - `referenceStore.ts`: Manages reference data (trucks, jobsites)
  - `uiStore.ts`: Manages UI state (modals, toasts, etc.)
  - `wizardStore.ts`: Manages wizard state with persistence
  - `workdayStore.ts`: Manages workday tracking state
- **Standardized Pattern**:
  - Action creators for complex logic extraction
  - Selector hooks for optimized component rendering
  - Consistent persistence configuration
  - Proper error handling and logging

### Server State Management (TanStack Query)

- **Purpose**: Manage server data fetching, caching, and mutations
- **Implementation**: Query hooks in `/src/hooks/queries/`
- **Key Patterns**:
  - Centralized query client configuration in `query-client-provider.client.tsx`
  - Structured query keys in `queryKeys.ts`
  - Domain-specific query hooks (e.g., `useTicketQueries.ts`)

### Local Component State

- **Purpose**: Manage component-specific state
- **Implementation**: React's `useState` and `useEffect` hooks
- **When to Use**: For state that doesn't need to be shared between components

## Data Flow

The application follows a unidirectional data flow pattern:

### Data Flow Layers

1. **UI Layer** (Components)
   - Renders data and captures user input
   - Dispatches actions or calls mutations
   - Subscribes to state changes

2. **State Management Layer** (Zustand/TanStack Query)
   - Manages application state
   - Handles state updates
   - Provides state to components

3. **Service Layer** (`/src/lib/services/`)
   - Handles API calls
   - Transforms data
   - Manages error handling

4. **API Layer** (Firebase)
   - Stores and retrieves data
   - Handles authentication
   - Manages file storage

### Data Flow Patterns

1. **Read Flow**
   - Component uses query hook (e.g., `useTickets`)
   - Query hook uses TanStack Query
   - TanStack Query calls service function
   - Service function calls Firebase API
   - Data flows back up the chain with transformations

2. **Write Flow**
   - Component calls mutation function
   - Mutation function calls service function
   - Service function calls Firebase API
   - Success/error flows back up the chain
   - TanStack Query invalidates related queries

## API Integration

The application uses a service-based architecture for API integration:

### Service Layer Architecture

- **Location**: `/src/lib/services/`
- **Pattern**: Domain-specific services for each entity type
- **Examples**: `ticketService.ts`, `jobsiteService.ts`, `truckService.ts`

### Service Implementation Pattern

- **Firebase Integration**: Direct integration with Firebase Firestore and Storage
- **Mock Data**: Development environment uses mock data with similar interfaces
- **Error Handling**: Centralized error handling through the `errorHandler` utility
- **Method Structure**: Each service provides CRUD operations and domain-specific methods

### Data Flow Pattern

1. **Component Layer**: Uses React Query hooks to interact with data
2. **Query Hooks**: Abstract React Query implementation details
3. **Service Layer**: Handles API calls and data transformation
4. **Firebase Integration**: Direct interaction with Firebase services

## Error Handling

The application uses a centralized error handling approach:

### Error Handling Architecture

- **Location**: `/src/lib/errors/`
- **Key Components**:
  - `error-types.ts`: Defines custom error classes
  - `error-handler.ts`: Provides error handling utilities

### Error Handling Patterns

1. **Custom Error Types**
   - `AppError`: Base error class
   - Domain-specific errors (e.g., `AuthError`, `ValidationError`)
   - Standardized error format

2. **Error Handling Flow**
   - Service functions throw typed errors
   - Query hooks catch and format errors
   - Components display user-friendly error messages
   - Error logging for monitoring

3. **Retry Mechanism**
   - Built-in retry capabilities for network failures
   - Configurable retry policies
   - Exponential backoff strategy

## Form Management

The application uses React Hook Form with Zod for form management:

### Form Architecture

- **Location**: `/src/components/forms/`
- **Key Components**:
  - Form components for specific use cases
  - Form field components for different input types
  - Zod schemas for validation

### Form Patterns

1. **Form Validation**
   - Zod schemas define validation rules
   - Client-side validation before submission
   - Server-side validation in API routes

2. **Form Submission**
   - React Query mutations for form submission
   - Loading states during submission
   - Error handling for failed submissions

3. **Form State Management**
   - React Hook Form for form state
   - Controlled vs. uncontrolled inputs
   - Form reset and initialization

## Animation Patterns

The application uses Framer Motion for animations:

### Animation Architecture

- **Location**: `/src/lib/animations/` and component-specific animations
- **Key Patterns**:
  - Consistent animation configurations
  - Accessibility considerations (reduced motion)
  - Performance optimizations

### Animation Types

1. **Transition Animations**
   - Page transitions
   - Component mount/unmount animations
   - State change animations

2. **Interactive Animations**
   - Button hover/press animations
   - Drag and drop interactions
   - Gesture-based animations

3. **Micro-Interactions**
   - Form field focus/blur animations
   - Success/error feedback animations
   - Loading state animations

## Responsive Design

The application follows a mobile-first responsive design approach:

### Responsive Design Patterns

1. **Viewport-Based Layouts**
   - Mobile-first design
   - Breakpoint-based adaptations
   - Flexible layouts

2. **Touch-Optimized Interactions**
   - Large touch targets
   - Swipe gestures
   - Bottom sheets for mobile

3. **Progressive Enhancement**
   - Core functionality works on all devices
   - Enhanced experiences on capable devices
   - Fallbacks for older browsers
