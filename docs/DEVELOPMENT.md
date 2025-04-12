---
title: Simple Tracker Development Guide
date: 2025-03-28
tags: [development, testing, workflow, environment, contribution]
status: official
author: Development Team
---

# Simple Tracker Development Guide

## Table of Contents

1. [Overview](#overview)
2. [Development Environment Setup](#development-environment-setup)
3. [Development Workflow](#development-workflow)
4. [Testing Strategy](#testing-strategy)
5. [Quality Assurance](#quality-assurance)
6. [Debugging and Troubleshooting](#debugging-and-troubleshooting)
7. [Contribution Guidelines](#contribution-guidelines)
8. [Deployment](#deployment)
9. [Best Practices](#best-practices)

## Overview

### Purpose

This document provides comprehensive guidance for developers working on the Simple Tracker application. It covers environment setup, development workflows, testing approaches, and contribution guidelines to ensure consistent quality and maintainability.

### Development Philosophy

Simple Tracker's development is guided by these core principles:

1. **Quality First**: Prioritizing robust, well-tested code over rapid development
2. **User-Centric**: Development decisions prioritize user experience
3. **Maintainability**: Code organization, documentation, and patterns that support long-term maintenance
4. **Consistency**: Following established patterns across the codebase
5. **Progressive Enhancement**: Building core functionality first, then enhancing it

### Technology Stack

- **Frontend Framework**: Next.js 15.3.0 (App Router)
- **UI Library**: React 19 with TypeScript 5.8.2
- **Styling**: Tailwind CSS 4.0.13 with shadcn/ui 0.9.5
- **State Management**: Zustand 5.0.3 for client state, TanStack Query 5.67.3 for server state
- **Form Management**: React Hook Form 7.54.2 with Zod 3.24.2 for validation
- **Backend**: Firebase (Firestore + Storage)
- **Testing**: Jest, React Testing Library, Cypress

## Development Environment Setup

### Prerequisites

To develop for Simple Tracker, you need:

- Node.js (v18.17.0 or later)
- npm (v9.6.7 or later)
- Git
- Firebase CLI (for emulator usage)
- A text editor or IDE (VS Code recommended)

### Local Development Environment

#### Initial Setup

1. Clone the repository:
   ```
   git clone https://github.com/simple-tracker/simple-tracker.git
   cd simple-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in required Firebase configuration values

4. Start the development server:
   ```
   npm run dev
   ```

### Environment Variables

The application uses these environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`: Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`: Firebase measurement ID (Optional)

**Admin SDK (Server-Side):** These should be handled securely (e.g., via environment variables in your hosting environment, not committed to `.env.local`):
- `FIREBASE_PROJECT_ID`: Firebase project ID (for admin SDK)
- `FIREBASE_CLIENT_EMAIL`: Service account email (for admin SDK)
- `FIREBASE_PRIVATE_KEY`: Service account private key (for admin SDK)
- `FIREBASE_STORAGE_BUCKET`: Firebase storage bucket (for admin SDK, often same as public)
- `BCRYPT_SALT_ROUNDS`: Number of salt rounds for bcrypt password hashing (server-side)

### Firebase Emulators

For local development without affecting production data:

1. Install Firebase emulators:
   ```
   npm install -g firebase-tools
   firebase login
   firebase init emulators
   ```

2. Configure emulators (`firebase.json`) for Firestore and Authentication. This is crucial for testing the custom username/password login flow (`/api/auth/login`), user creation, and token verification locally without impacting live data.

3. Start emulators:
   ```
   npm run emulators
   ```

4. Configure the application to use emulators by setting:
   ```
   NEXT_PUBLIC_FIREBASE_USE_EMULATOR=true
   ```

### Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run test`: Run Jest tests
- `npm run test:watch`: Run Jest in watch mode
- `npm run cypress`: Open Cypress test runner
- `npm run cypress:headless`: Run Cypress tests headlessly
- `npm run emulators`: Start Firebase emulators

### IDE Configuration

#### VS Code Setup

Recommended extensions:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Jest Runner
- Firebase Explorer

Workspace settings:
- Enable format on save
- Use ESLint for JavaScript/TypeScript
- Set tab size to 2 spaces

## Development Workflow

### Git Workflow

Simple Tracker follows a trunk-based development approach:

1. All feature development happens in short-lived feature branches
2. Pull requests are used for code review before merging
3. The `main` branch is the source of truth and is always deployable
4. Release branches are created for specific releases

### Branching Strategy

- `main`: Main development branch, always deployable
- `feature/[feature-name]`: Feature development branches
- `bugfix/[bug-description]`: Bug fix branches
- `release/[version]`: Release branches
- `hotfix/[description]`: Emergency fixes to production

### Code Review Process

All code changes require review:

1. Create a pull request with a clear description
2. Request review from at least one team member
3. Automated checks must pass (linting, tests, build)
4. Address all review comments
5. Merge after approval

### Release Process

1. Create a release branch from `main`
2. Perform final testing
3. Bump version numbers
4. Create release notes
5. Deploy application code and Firebase configuration (rules, indexes, storage) via CI/CD pipeline or Firebase CLI (`firebase deploy --only ...`). See `Firebase_Codebase_Deployment.md`.
6. Tag the release
7. Merge back to `main`

### Feature Flagging

For features that need to be deployed but not immediately exposed:

1. Define feature flags in `src/lib/features/feature-flags.ts`
2. Use conditional rendering based on flags
3. Control flags through environment variables or admin dashboard

### Continuous Integration

The CI pipeline runs on each pull request and includes:

1. Linting
2. Type checking
3. Unit tests
4. Component tests
5. Integration tests
6. Build verification

## Testing Strategy

### Testing Philosophy

Simple Tracker follows a comprehensive testing approach:

1. **Test Pyramid**: More unit tests than integration tests, and more integration tests than E2E tests
2. **Test Coverage**: Aim for 80%+ code coverage
3. **Behavior Testing**: Test behavior, not implementation details
4. **Realistic Testing**: Test with realistic data and scenarios

### Unit Testing

For testing individual functions and utilities:

- Use Jest as the test runner
- Focus on pure functions and business logic
- Isolate dependencies through mocking
- Aim for high coverage of utility functions

### Component Testing

For testing React components:

- Use React Testing Library
- Test from a user perspective
- Focus on accessibility and user interactions
- Avoid testing implementation details
- Mock authentication state based on verified claims obtained via Firebase Client SDK (`getIdTokenResult`), reflecting the new auth flow.

### Integration Testing

For testing component interactions and data flow:

- Test components with their dependencies
- Use mock server responses for API calls
- Verify that components work together correctly
- Test common user flows, including those involving the new username/password login API.
- Mock authentication state based on verified claims for components requiring specific roles or user IDs.

### End-to-End Testing

For testing complete user flows:

- Use Cypress for browser-based testing
- Test critical user journeys
- Verify application behavior in a realistic environment
- Use real backends when possible (e.g., Firebase emulators), mocks when necessary.
- Specifically test the full username/password login flow and subsequent actions requiring authenticated state or specific roles.

### Testing Hooks

For testing custom React hooks:

```
// Use renderHook from React Testing Library
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

*Note:* When testing hooks like `useAuth`, ensure mocks reflect interactions with the new `/api/auth/login` endpoint and the `signInWithCustomToken` client-side flow.

### Testing Query Hooks

For testing TanStack Query hooks:

```
// Create a wrapper with QueryClient
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

// Test with the wrapper
describe('useTicketQueries', () => {
  it('should fetch tickets successfully', async () => {
    // Mock API response using standardized format with resource-specific property
    (getTickets as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Tickets retrieved successfully',
      tickets: [{ id: '1', date: new Date(), truckNumber: 'T-01', categories: { test: 1 } }], // Example ticket data
      timestamp: new Date().toISOString(),
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
    expect(result.current.data).toEqual([{ id: '1', date: expect.any(Date), truckNumber: 'T-01', categories: { test: 1 } }]);
  });
});
```

### Testing API Routes (Updated for New Auth)

For testing Next.js API routes:

```typescript
// Example API route test (using Jest and mocking the new auth wrappers)
import { POST } from '@/app/api/tickets/route'; // Adjust path as needed
import { createTicketHelper } from '@/app/api/tickets/helpers'; // Adjust path/name as needed
import * as apiMiddleware from '@/lib/api/middleware'; // Import the middleware module
import { NextRequest } from 'next/server';
import { Ticket } from '@/types/tickets'; // Import Ticket type
import { DecodedIdToken } from 'firebase-admin/auth'; // Type for mocked token

// Mock the specific middleware wrappers (withAuthentication, withAdminRole, etc.)
// This example mocks withAuthentication
jest.mock('@/lib/api/middleware', () => {
  const originalModule = jest.requireActual('@/lib/api/middleware');
  return {
    ...originalModule, // Keep other exports if needed
    withAuthentication: jest.fn((handler) => {
      // This mock simulates the wrapper successfully verifying a token
      // and passing the decoded token (or just userId) to the handler.
      return async (request: NextRequest, params: any) => {
        // Simulate successful authentication - provide mock user data
        const mockUser: Partial<DecodedIdToken> = { uid: 'test-user-id', role: 'employee' }; // Add claims as needed
        // Pass the mock user context (adjust based on what your handler expects)
        return handler(mockUser as DecodedIdToken, request, params);
      };
    }),
    // Mock withAdminRole similarly if testing admin routes
    // withAdminRole: jest.fn((handler) => ... ),
  };
});

// Mock the business logic helper
jest.mock('@/app/api/tickets/helpers', () => ({
  createTicketHelper: jest.fn(),
}));

describe('POST /api/tickets', () => {
  it('should create a ticket successfully when authenticated and return standardized response', async () => {
      // Mock the result from the business logic helper
      const mockCreatedTicketData: Partial<Ticket> = {
        id: 'new-ticket-123',
        date: new Date('2025-04-06'),
        truckNumber: 'T-05',
        jobsite: 'site-abc',
        categories: { 'hangers': 50, 'leaners': 20 },
        imageUrls: ['url1'],
        userId: 'test-user-id', // Should match the mock user context
        total: 70,
        imageCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // Mock the helper to return the expected data structure for the API response
      (createTicketHelper as jest.Mock).mockResolvedValue(mockCreatedTicketData);

    // Create mock request with valid data matching schema
    const mockRequestBody = {
      date: '2025-04-06',
      truckId: 'T-05', // Assuming truckId is used in request
      jobsiteId: 'site-abc', // Assuming jobsiteId is used in request
      categories: { 'hangers': 50, 'leaners': 20 },
      images: ['url1'], // Assuming image URLs/refs are passed
    };
    const request = new NextRequest('http://localhost/api/tickets', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token', // The token itself is less important now as the wrapper mock handles verification logic
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mockRequestBody)
    });

    // Call the actual route handler (which is now wrapped by our mocked withAuthentication)
    const response = await POST(request);
    const body = await response.json();

    // Verify response status and standardized structure
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.message).toBe('Ticket created successfully');
    expect(body.ticket).toBeDefined();
    expect(body.ticket.id).toBe('new-ticket-123');
    expect(body.ticket.truckNumber).toBe('T-05');
    expect(body.ticket.total).toBe(70);
    expect(body.timestamp).toBeDefined();

    // Verify the helper was called correctly with the user context from the mocked wrapper
    expect(createTicketHelper).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'test-user-id', role: 'employee' }), // Verify user context passed by mock wrapper
      expect.objectContaining(mockRequestBody)
    );
  });

  // Add tests for validation errors, permission errors (e.g., mocking withAdminRole and calling as non-admin), etc.
  // Test cases where the auth wrapper mock simulates failure (e.g., no token, invalid token).
});
```

### Mock Data Implementation

For development and testing with mock data:

```typescript
// Mock API response generator reflecting standardized format
// (Note: This is an example; actual implementation might vary)

// Define the structure based on API.md
interface MockSuccessResponse<T> {
  success: true;
  message: string;
  [key: string]: any; // Holds the resource-specific data (e.g., tickets: T)
  timestamp: string;
}

interface MockErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    status: number;
    details?: any;
  };
  timestamp: string;
}

type MockApiResponse<T> = MockSuccessResponse<T> | MockErrorResponse;

export function createMockApiResponse<T>(
  resourceName: string, // e.g., 'tickets', 'ticket', 'workday'
  data: T,
  options?: {
    success?: boolean;
    message?: string;
    status?: number; // HTTP status for error responses
    errorCode?: string; // Error code for error responses
    errorDetails?: any; // Details for error responses
    delay?: number;
  }
): Promise<MockApiResponse<T>> {
  const isSuccess = options?.success ?? true;
  const timestamp = new Date().toISOString();

  let response: MockApiResponse<T>;

  if (isSuccess) {
    response = {
      success: true,
      message: options?.message ?? 'Operation completed successfully',
      [resourceName]: data, // Use the provided resource name as the key
      timestamp: timestamp,
    };
  } else {
    response = {
      success: false,
      message: options?.message ?? 'An error occurred',
      error: {
        code: options?.errorCode ?? 'mock/error',
        status: options?.status ?? 400,
        details: options?.errorDetails ?? null,
      },
      timestamp: timestamp,
    };
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(response);
    }, options?.delay ?? 0); // Default delay 0 for tests
  });
}

// Example Usage:
// const mockSuccessTickets = await createMockApiResponse('tickets', [{ id: '1' }], { success: true });
// const mockError = await createMockApiResponse('ticket', null, { success: false, status: 404, message: 'Not Found' });
```

## Quality Assurance

### Code Quality Tools

The project uses these tools for code quality:

- ESLint for static code analysis
- Prettier for code formatting
- TypeScript for type checking
- Husky for pre-commit hooks
- lint-staged for running linters on staged files

### TypeScript Best Practices

1. **Strict Mode**: Use TypeScript's strict mode
2. **Explicit Return Types**: Define return types for functions
3. **Interface-Driven Development**: Define interfaces before implementation
4. **Type Inference**: Use type inference when appropriate
5. **No Any**: Avoid using `any` type
6. **Union Types**: Use union types for variables with multiple possible types
7. **Generic Types**: Use generic types for reusable components and functions
8. **Utility Types**: Leverage TypeScript's utility types

### Performance Optimization

1. **Component Memoization**: Memoize expensive components with React.memo
2. **Hook Dependencies**: Optimize hook dependencies to prevent unnecessary renders
3. **Bundle Analysis**: Regularly analyze bundle size
4. **Code Splitting**: Use dynamic imports for code splitting
5. **Image Optimization**: Use Next.js Image component
6. **Virtualization**: Use virtualization for long lists

### Accessibility Testing

1. **Automated Testing**: Use axe-core for automated accessibility testing
2. **Manual Testing**: Perform keyboard navigation testing
3. **Screen Reader Testing**: Test with screen readers
4. **Color Contrast**: Verify color contrast meets WCAG AA standards
5. **Focus Management**: Ensure proper focus management for modals and dialogs

### Cross-browser Testing

1. **Browser Matrix**: Test on Chrome, Firefox, Safari, and Edge
2. **Responsive Testing**: Test on multiple screen sizes
3. **Mobile Testing**: Test on iOS and Android devices

### Code Analysis Tools

1. **SonarQube**: Code quality and security analysis
2. **Lighthouse**: Performance, accessibility, SEO, and best practices
3. **Bundle Analyzer**: Analyze bundle size and composition

## Debugging and Troubleshooting

### Common Issues

1. **Authentication Issues**: Problems with the custom username/password login API (`/api/auth/login`), bcrypt verification failures, Firebase Admin SDK credential issues, custom token creation/signing errors, ID token verification failures (middleware/API), incorrect or missing custom claims (`role`), Bearer token transport issues.
2. **API Error Handling**: Inconsistent error formats, missing error handling
3. **State Management**: Zustand store updates not reflecting in UI
4. **Form Validation**: Zod schema errors, form submission issues
5. **React Query**: Cache invalidation issues, stale data
6. **Rendering Issues**: Server vs. client component confusion

### Debugging Tools

1. **React DevTools**: Inspect component tree and props
2. **Redux DevTools**: Inspect Zustand store (with middleware)
3. **Network Tab**: Inspect API calls and responses
4. **Console**: Use structured logging
5. **Debugger**: Use browser debugger or IDE debugger (including server-side debugging for API routes/middleware)

### Logging

The application uses a centralized logging system:

1. **Development Logging**: Detailed logs in development
2. **Production Logging**: Filtered logs in production
3. **Error Logging**: Automatic error logging
4. **Activity Logging**: User activity logging
5. **Server-Side Auth Logs**: Check server logs (e.g., Vercel functions logs) for details from middleware token verification and custom login API execution (`/api/auth/login`).
5. **Performance Logging**: Performance metric logging

### Error Tracking

1. **Client-Side Errors**: Captured and reported to monitoring service
2. **Server-Side Errors**: Logged to server logs
3. **API Errors**: Structured error responses

### Performance Profiling

1. **React Profiler**: Identify slow component renders
2. **Lighthouse**: Measure performance metrics
3. **Chrome Performance Tab**: Detailed performance profiling
4. **Core Web Vitals**: Track key performance metrics

## Contribution Guidelines

### Code Style and Formatting

The project follows these style guidelines:

1. **Prettier**: For code formatting
2. **ESLint**: For code style and quality
3. **File Names**: kebab-case for files, PascalCase for components
4. **Component Structure**: Props interface, then component export
5. **Import Order**: External packages, then internal imports

### Documentation Requirements

All code should be documented:

1. **JSDoc Comments**: For functions, methods, and classes
2. **Component Props**: Document all props with JSDoc
3. **Hook Documentation**: Describe hook behavior and parameters
4. **README Files**: Maintain up-to-date README files
5. **Inline Comments**: Explain complex logic

### Pull Request Process

1. **Branch Naming**: Follow branching strategy
2. **PR Title**: Clear, descriptive title
3. **PR Description**: Detailed description with context
4. **Linked Issues**: Link related issues
5. **Self-Review**: Review your own code before requesting reviews
6. **CI Checks**: Ensure all checks pass
7. **Code Reviews**: Address review comments
8. **Approval**: Merge after approval

### Commit Message Conventions

Follow conventional commits format:

1. **Type**: feat, fix, docs, style, refactor, test, chore
2. **Scope**: Optional, in parentheses
3. **Description**: Imperative mood
4. **Body**: Optional, detailed description
5. **Footer**: Optional, breaking changes and issue references

Example: `feat(auth): implement role-based access control`

### Feature Development Process

1. **Issue Creation**: Create an issue describing the feature
2. **Design Discussion**: Discuss approach and requirements
3. **Implementation**: Create a feature branch and implement
4. **Testing**: Write tests for the feature
5. **Documentation**: Update documentation
6. **Review**: Submit for code review
7. **Merge**: Merge to main after approval

### Bug Fix Process

1. **Issue Creation**: Create an issue describing the bug
2. **Reproduction**: Create a minimal reproduction case
3. **Analysis**: Determine the root cause
4. **Fix**: Create a bugfix branch and implement the fix
5. **Testing**: Add tests to prevent regression
6. **Review**: Submit for code review
7. **Merge**: Merge to main after approval

## Deployment

### Deployment Environments

1. **Development**: For development and testing
2. **Staging**: For pre-production testing
3. **Production**: For live application

### CI/CD Pipeline

The application uses GitHub Actions for CI/CD:

1. **Pull Request Checks**: Run on all PRs
2. **Main Branch Checks**: Run on all pushes to main
3. **Staging Deployment**: Automatic deployment to staging
4. **Production Deployment**: Manual approval for production

### Environment-Specific Configuration

1. **Environment Variables**: Different values per environment
2. **Feature Flags**: Enable features per environment
3. **API Endpoints**: Different endpoints per environment
4. **Error Handling**: More detailed errors in non-production environments

### Monitoring and Alerting

1. **Application Monitoring**: Track application health
2. **Error Monitoring**: Track and alert on errors
3. **Performance Monitoring**: Track performance metrics
4. **Usage Monitoring**: Track application usage
5. **Alert Thresholds**: Define alert thresholds

### Rollback Procedures

If a deployment causes issues:

1. **Immediate Rollback**: Revert to the previous stable version
2. **Root Cause Analysis**: Determine what caused the issue
3. **Fix Implementation**: Implement a fix
4. **Verification**: Verify the fix in non-production environments
5. **Redeployment**: Deploy the fixed version

## Best Practices

### Development Best Practices

1. **Write Self-Documenting Code**: Clear names and structure
2. **Keep it Simple**: Avoid unnecessary complexity
3. **Optimize Maintainability**: Write code that's easy to understand
4. **Follow Established Patterns**: Consistency across the codebase
5. **Don't Repeat Yourself**: Extract reusable code
6. **Single Responsibility**: Each function or component should do one thing
7. **Test-Driven Development**: Write tests before implementation
8. **Continuous Refactoring**: Regularly improve existing code
9. **Progressive Enhancement**: Build core functionality first
10. **Performance Considerations**: Consider performance implications

### Testing Best Practices

1. **Test Behavior, Not Implementation**: Focus on what, not how
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Use Realistic Test Data**: Test with realistic data
4. **Isolate Tests**: Tests should be independent
5. **One Assertion Per Test**: Focus on testing one thing
6. **Mock External Dependencies**: Isolate unit tests
7. **Test Edge Cases**: Consider boundary conditions
8. **Keep Tests Simple**: Tests should be easy to understand
9. **Maintain Test Quality**: Refactor tests as needed
10. **Write Failing Tests First**: Ensure tests catch issues

### Code Review Best Practices

1. **Focus on Code, Not People**: Be constructive
2. **Ask Questions**: Seek to understand
3. **Be Specific**: Provide clear feedback
4. **Look for Edge Cases**: Consider unexpected scenarios
5. **Check for Security Issues**: Be security-conscious
6. **Verify Test Coverage**: Ensure adequate testing
7. **Suggest Alternatives**: Offer better approaches
8. **Praise Good Code**: Recognize good practices
9. **Review Documentation**: Check documentation quality
10. **Consider Performance**: Watch for performance issues

### Documentation Best Practices

1. **Keep Documentation Updated**: Update with code changes
2. **Focus on Why, Not What**: Explain rationale
3. **Use Examples**: Illustrate with examples
4. **Consider the Audience**: Write for the intended reader
5. **Be Concise**: Keep documentation focused
6. **Use Consistent Formatting**: Follow markdown conventions
7. **Link Related Documents**: Provide context
8. **Document Assumptions**: State what's assumed
9. **Include Diagrams**: Visual explanations where helpful
10. **Review Documentation**: Check quality and accuracy
