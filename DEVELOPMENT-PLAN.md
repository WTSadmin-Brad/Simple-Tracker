# Simple Tracker Development Plan


## Overview

This document outlines the development plan for the Simple Tracker application, a mobile-first PWA for field workers to log workdays and submit tickets with images. Based on our current progress and priorities, we'll focus on completing employee-facing features first before moving on to admin functionality.


## Development Phases


### Phase 1: Complete Employee Ticket Submission Workflow 

#### Status: Completed on March 14, 2025


#### 1.1 Wizard Validation & State Management

- [x] Implement form validation for each wizard step using Zod schemas
- [x] Connect form validation to the UI with proper error messages
- [x] Enhance wizard state persistence with proper error handling
- [x] Add validation indicators to the wizard progress component


#### 1.2 API Integration

- [x] Implement the dynamic API route handlers for each wizard step
- [x] Create proper request validation middleware
- [x] Implement proper error handling and response formatting
- [x] Add loading states to the wizard UI during API calls


#### 1.3 Image Upload Functionality

- [x] Implement image upload functionality with proper validation
- [x] Implement image preview and deletion functionality
- [x] Add progress indicators for uploads
- [x] Optimize image loading with Next.js Image component


#### 1.4 Confirmation & Submission

- [x] Implement the final submission process
- [x] Create success and error states for submission
- [x] Add confirmation dialog before final submission
- [x] Implement redirect to success page after submission


### Phase 2: Enhance State Management & Persistence

#### Status: Completed on March 14, 2025


#### 2.1 Zustand Store Implementation

- [x] Design state structure with TypeScript interfaces for all wizard steps
- [x] Implement main wizard store with proper typing
- [x] Add action creators for updating each part of the state
- [x] Include metadata for tracking session creation and expiration
- [x] Implement localStorage persistence using Zustand middleware
- [x] Add 24-hour expiration logic for abandoned sessions


#### 2.2 Session Recovery

- [x] Implement session detection on application load
- [x] Create recovery dialog component with resume/discard options
- [x] Add detailed view for session information
- [x] Make sessions device-specific with local storage only
- [x] Create utility functions for managing storage limits


#### 2.3 Auto-Save Implementation

- [x] Implement debounced save on field changes
- [x] Add save on step transitions
- [x] Create visibility change detection for background saves
- [x] Implement regular interval saves during active editing
- [x] Create toast notification component for save confirmations
- [x] Add subtle status indicator in the wizard footer


#### 2.4 Image Handling Strategy

- [x] Implement reference-only storage for images (not the actual files)
- [x] Create re-upload mechanism for submission
- [x] Add progress tracking for uploads
- [x] Implement proper cleanup of temporary files


#### 2.5 Connection Status Handling

- [x] Create connection status detector component
- [x] Implement online/offline state indicators
- [x] Add reconnection notification
- [x] Disable submission functionality when offline
- [x] Allow continued form filling when offline
- [x] Cache reference data (trucks, jobsites) for offline use


#### 2.6 Testing & Refinement

- [x] Test store actions and reducers
- [x] Validate persistence logic and expiration handling
- [x] Test image reference storage and retrieval
- [x] Verify session recovery logic
- [x] Test the complete wizard flow with persistence
- [x] Create a test plan for common user flows and edge cases


### Phase 3: Employee Calendar Functionality

#### Status: In Progress - March 14, 2025


#### 3.1 Calendar Data Integration

- [x] Connect calendar to API endpoints for workday data
- [x] Implement proper loading states for calendar data
- [x] Add error handling for failed data fetching
- [x] Implement data caching for better performance


#### 3.2 Day Detail Functionality

- [x] Enhance day detail sheet with proper data binding
- [x] Implement workday type selection (full, half, off)
- [x] Add validation for the 7-day edit window
- [x] Implement save functionality for workday changes


#### 3.3 Calendar Navigation & Filtering

- [x] Implement month navigation with proper animations
- [ ] Add year selection functionality
- [x] Implement filtering options for calendar view
- [ ] Add search functionality for specific dates or events


### Phase 4: Admin Dashboard

#### Status: In Progress - March 14, 2025


#### 4.1 Ticket Management

- [x] Implement ticket listing with filtering and sorting
- [x] Create ticket detail view with all information
- [x] Add ticket status management functionality
- [x] Implement ticket archiving process
- [x] Clean up and standardize admin components
  - [x] Remove redundant components (AdminFilterBar, AdminDataTable, DataGrid placeholder)
  - [x] Standardize naming conventions for all admin components
  - [x] Fix lint errors in admin components
  - [x] Ensure proper UI component implementation with shadcn/ui
  - [x] Establish file naming and duplication check protocol to prevent future confusion
- [x] Implement configuration-based approach for admin data grids
  - [x] Create configuration files for each data type (tickets, workdays, trucks, jobsites, users)
  - [x] Define interfaces for columns, filters, actions, and detail fields
  - [x] Centralize configuration in a dedicated directory
  - [x] Add type definitions for all data models
- [x] Update admin pages to use the new configuration-based approach
  - [x] Refactor tickets admin page to use generic components with configurations
  - [x] Refactor jobsites admin page to use generic components with configurations
  - [x] Refactor trucks admin page to use generic components with configurations
  - [x] Refactor users admin page to use generic components with configurations
  - [ ] Implement client-side handlers for filters, actions, and row selection

- [x] Complete dashboard layout implementation


#### 4.2 Dashboard Layout & Configuration

- [x] Implement drag-and-drop functionality for dashboard cards
- [x] Create card configuration panel with all options
- [x] Add layout persistence with user preferences
- [x] Implement responsive layout for different screen sizes


#### 4.3 Data Visualization

- [x] Connect chart components to data sources
- [x] Implement filtering options for data visualization
- [x] Add date range selection for charts
- [x] Create export functionality for reports


### Phase 5: Authentication & User Management

#### Estimated Timeline: 1 Week

#### 5.1 Authentication Flow

- [ ] Implement login functionality with proper validation
- [ ] Add session management with token refresh
- [ ] Implement protected routes with authentication guards
- [ ] Add remember me functionality


## Testing Strategy

Given our AI-assisted development approach, we'll implement a pragmatic testing strategy that focuses on critical paths and user experiences:

### Unit Testing

- Focus on critical utility functions and helpers
- Test complex business logic components
- Validate form schemas and validation rules

### Integration Testing

- Test key user flows (ticket submission, calendar interaction)
- Validate API integration points
- Test state management across components

### End-to-End Testing

- Test complete user journeys for primary features
- Validate mobile responsiveness and interactions
- Test accessibility features and reduced motion support


## Deployment Strategy

### Development Environment

- Continuous deployment from main branch
- Feature flags for work-in-progress features
- Automated linting and type checking

### Staging Environment

- Manual promotion from development
- Full integration testing before promotion
- User acceptance testing with stakeholders

### Production Environment

- Manual promotion from staging
- Phased rollout with monitoring
- Rollback capability for critical issues


## Next Steps (Immediate Actions)

1. Implement calendar data integration
2. Create day detail sheet with proper data binding
3. Add calendar navigation and filtering options
4. Test calendar functionality
5. Implement authentication flow


## Technical Considerations

### State Management

- Use Zustand for global state management
- Implement proper persistence with localStorage
- Add session expiration for abandoned sessions (24 hours)
- Store image references only, not actual files
- Make sessions device-specific

### Animation & Interaction

- Use Framer Motion for all animations
- Implement proper reduced motion support
- Use spring physics for natural motion
- Add haptic feedback for mobile interactions

### API Design

- Follow the dynamic routing pattern for all API endpoints
- Implement proper request validation
- Use consistent response formatting
- Add proper error handling and status codes

### Mobile Optimization

- Ensure all touch targets are at least 44×44px
- Implement swipe gestures for navigation
- Use bottom sheets for selection interfaces
- Optimize for various screen sizes and orientations


## Phase 1 Completion Summary

We've successfully completed Phase 1 of the Simple Tracker project by implementing:

1. The complete ticket submission wizard with all four steps:
   - Basic Info Step: Date, truck, and jobsite selection
   - Categories Step: Counter implementation with color transitions
   - Image Upload Step: Drag-and-drop, preview, and deletion
   - Confirmation Step: Summary review and submission dialog

2. Key features implemented:
   - Drag-and-drop image upload with preview grid
   - Image deletion with confirmation
   - Color-coded category badges based on value ranges
   - Confirmation dialog before final submission
   - Error handling throughout the wizard flow
   - Mobile-optimized UI with proper touch targets
   - Animations with reduced motion support

3. UI Components:
   - Simplified UI components without external dependencies
   - Maintained accessibility features and styling
   - Followed shadcn/ui patterns for consistency


## Phase 2 Implementation Plan

For Phase 2, we'll focus on enhancing the state management system with the following approach:

### Week 1: Foundation (Days 1-3)

- Implement core Zustand store with persistence
- Create session management utilities
- Add basic auto-save functionality

### Week 2: UI Components (Days 4-7)

- Build recovery dialog component
- Implement auto-save indicators
- Create connection status components
- Integrate with wizard flow

### Week 3: Testing & Refinement (Days 8-10)

- Implement test cases
- Refine user experience
- Optimize performance
- Document implementation details

### Key Decisions for Phase 2

- Store image references only, not actual files
- Show recovery dialog immediately on application load
- Make sessions device-specific
- Defer Firebase integration for now
- Implement best practice testing approach with unit, integration, and manual testing

### Admin Section
- [x] Implement admin dashboard with overview metrics
- [x] Create admin navigation with proper access controls
- [x] Implement admin pages using configuration-based approach:
  - [x] Tickets admin page
  - [x] Jobsites admin page
  - [x] Trucks admin page
  - [x] Users admin page
- [x] Implement consistent detail pages for all admin entities:
  - [x] Ticket detail page
  - [x] Jobsite detail page
  - [x] Truck detail page
  - [x] User detail page
- [ ] Add admin settings page
