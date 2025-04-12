---
title: Simple Tracker API Architecture
date: 2025-03-27
tags: [api, architecture, documentation, reference, patterns]
status: official
author: Development Team
---

# Simple Tracker API Architecture

## Table of Contents

1. [Overview](#overview)
2. [API Client Architecture](#api-client-architecture)
3. [API Route Patterns](#api-route-patterns)
4. [Authentication Architecture](#authentication-architecture)
5. [Error Handling](#error-handling)
6. [Request Validation](#request-validation)
7. [Response Format](#response-format)
8. [Batch Operations](#batch-operations)
9. [API Testing](#api-testing)
10. [Best Practices](#best-practices)

## Overview

This document describes the API architecture, patterns, and best practices for the Simple Tracker application. It serves as a guide for developers to understand how the API layer is structured and the reasoning behind key design decisions.

### Purpose

The API layer in Simple Tracker serves as the communication bridge between the frontend client and backend services (primarily Firebase). It provides:

- Consistent interfaces for data access
- Standardized error handling
- Authentication and authorization
- Data validation
- Structured responses

### Core Principles

1. **Resource-Based Design**: APIs are organized around resources
2. **Consistent Patterns**: Standard patterns for routes, requests, and responses
3. **Type Safety**: Comprehensive TypeScript types and runtime validation
4. **Error Handling**: Centralized error handling with standardized responses
5. **Security**: Authentication and authorization at multiple levels

## API Client Architecture

### Directory Structure

```
/src
  /lib
    /api
      apiClient.ts        # Centralized API client with error handling
      ticketApi.ts        # Ticket-related API functions
      workdayApi.ts       # Workday-related API functions
      /middleware         # API middleware (auth, error handling)
      endpoints.ts        # Centralized endpoint definitions
    /firebase
      admin.ts            # Firebase Admin SDK initialization
      client.ts           # Firebase Client SDK initialization
    /errors
      error-types.ts      # API-specific error types
      error-handler.ts    # Error handling utilities
      error-codes.ts      # Standardized error codes
  /app
    /api                  # Next.js API routes
      /[resource]         # Resource-specific API routes
        /route.ts         # Route handlers
        /helpers.ts       # Business logic helpers
        /[id]/route.ts    # Dynamic route handlers
```

### Centralized API Client

The application uses a centralized API client in `apiClient.ts` that provides:

- Consistent error handling across all API calls
- Standardized response format
- Support for both JSON and form data requests
- Automatic retry logic for transient errors

```typescript
// Example of the API client structure
export async function apiRequest<T>(
  endpoint: string, 
  options?: RequestOptions
): Promise<StandardResponse<T>> {
  try {
    // Build request configuration
    const config: RequestInit = {
      method: options?.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    };

    // Add body if provided
    if (options?.body) {
      config.body = JSON.stringify(options.body);
    }

    // Execute request with error handling
    const response = await fetch(url, config);
    
    // Parse response as JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Our API now standardizes all responses, so we can just return the data
      return data;
    } else {
      // Handle non-JSON responses
      if (!response.ok) {
        return {
          success: false,
          message: `Request failed with status ${response.status}`,
          error: {
            code: ErrorCodes.NETWORK_SERVER_ERROR,
            status: response.status,
          },
          timestamp: new Date().toISOString()
        };
      }
      
      // For successful non-JSON responses
      return {
        success: true,
        message: 'Resource retrieved successfully',
        rawData: await response.text(), // Store raw text data
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    // Handle network or other errors
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error occurred',
      error: {
        code: ErrorCodes.NETWORK_OFFLINE,
        status: 0,
        details: error instanceof Error ? { name: error.name } : undefined
      },
      timestamp: new Date().toISOString()
    };
  }
}
```

### Domain-Specific API Modules

Each domain has its own API module with functions for specific operations:

```typescript
// Example from ticketApi.ts
export const ENDPOINTS = {
  TICKETS: '/api/tickets',
  TICKET_DETAIL: (id: string) => `/api/tickets/${id}`,
  TICKETS_BATCH: '/api/tickets/batch',
  WIZARD_DATA: '/api/tickets/wizard',
};

export async function getTickets(filters: TicketFilterParams = {}): Promise<StandardResponse<Ticket[]>> {
  return apiRequest<Ticket[]>(ENDPOINTS.TICKETS, {
    params: filters,
  });
}

export async function getTicketById(id: string): Promise<StandardResponse<Ticket>> {
  return apiRequest<Ticket>(ENDPOINTS.TICKET_DETAIL(id));
}

export async function createTicket(data: CreateTicketData): Promise<StandardResponse<Ticket>> {
  return apiRequest<Ticket>(ENDPOINTS.TICKETS, {
    method: 'POST',
    body: data,
  });
}
```

## API Route Patterns

### Standard Route Structure

All API routes follow a consistent pattern:

```typescript
// Standard structure for API routes
import { NextResponse } from 'next/server';
import { NextResponse } from 'next/server';
import { withAuthentication, AuthenticatedUser } from '@/lib/api/middleware'; // Updated import
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/error-types';
import { createResourceSchema } from './validation'; // Assuming validation schema exists

// Example using withAuthentication wrapper
export const POST = withAuthentication(async (user: AuthenticatedUser, request: Request) => {
  try {
    // 1. Verify permissions if needed
    // Permissions might be checked via user.role or specific claims if needed
    // Example: if (user.role !== 'admin') throw new ForbiddenError(...);
    
    // 2. Parse and validate request data
    const body = await request.json();
    const validationResult = createResourceSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid data',
        'VALIDATION_ERROR',
        400,
        validationResult.error.format()
      );
    }
    
    // 3. Execute business logic
    const result = await createResource(user.uid, validationResult.data); // Use user.uid
    
    // 4. Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      resource: result, // Use a consistent property name like 'resource' or specific name
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    // 5. Handle errors consistently
    return handleApiError(error, 'Failed to create resource');
  }
});
```

### Business Logic Separation

API routes delegate business logic to helper functions for better separation of concerns:

```typescript
// Example of business logic separation
// route.ts - Route handler using withAuthentication
export const GET = withAuthentication(async (user: AuthenticatedUser, request: Request, { params }: { params: { id: string } }) => {
  try {
    const { id } = params;
    // Pass the authenticated user object or specific details like UID
    const resource = await getResourceById(user, id);
    
    return NextResponse.json({
      success: true,
      message: 'Resource retrieved successfully',
      resource: resource, // Use consistent property name
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve resource');
  }
});

// helpers.ts - Business logic accepting AuthenticatedUser
import { getFirestoreAdmin } from '@/lib/firebase/admin'; // Ensure correct import
import { NotFoundError, ForbiddenError } from '@/lib/errors/error-types';
import { AuthenticatedUser } from '@/lib/api/middleware'; // Import user type

const COLLECTION_NAME = 'your_collection_name'; // Replace with actual collection name

export async function getResourceById(user: AuthenticatedUser, id: string) {
  const db = getFirestoreAdmin();
  const docRef = db.collection(COLLECTION_NAME).doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new NotFoundError(
      `Resource with ID ${id} not found`,
      'RESOURCE_NOT_FOUND'
    );
  }

  const data = doc.data() as { ownerId?: string; /* other fields */ }; // Type assertion

  // Verify access based on user ID or role from the verified token
  // Example: Check ownership or admin role
  if (data.ownerId !== user.uid && user.role !== 'admin') {
    throw new ForbiddenError(
      'You do not have access to this resource',
      'ACCESS_DENIED'
    );
  }
  
  return {
    id: doc.id,
    ...data
  };
}

}
```

## Authentication Architecture

### Authentication Flow

Simple Tracker now uses a server-centric authentication flow leveraging Firebase Authentication and the Firebase Admin SDK:

1.  **User Login:**
    *   The user submits their **username and password** to a custom API endpoint (`/api/auth/login`).
    *   The server verifies the credentials against stored user data (including a hashed password) in Firestore.
    *   Upon successful verification, the server uses the **Firebase Admin SDK** to mint a **Firebase Custom Token** (`createCustomToken`).
    *   This custom token is returned to the client.

2.  **Client-Side Session Establishment:**
    *   The client receives the custom token.
    *   The client uses the **Firebase Client SDK** method `signInWithCustomToken(customToken)` to exchange the custom token for a standard Firebase **ID Token** and Refresh Token.
    *   The Firebase Client SDK automatically manages the ID token, including refreshing it before expiration.

3.  **API Request Authentication:**
    *   For subsequent requests to protected API endpoints, the client retrieves the current **ID Token**.
    *   The client sends the ID Token in the `Authorization` header as a **Bearer token**: `Authorization: Bearer <ID_token>`.

4.  **Server-Side Verification (Middleware):**
    *   API routes and Next.js middleware (`src/middleware.ts`) intercept incoming requests.
    *   They extract the Bearer token from the `Authorization` header.
    *   The **Firebase Admin SDK** (`verifyIdToken(token)`) is used on the server to verify the ID token's signature, expiration, and claims.
    *   If valid, the decoded token payload (including `uid` and custom claims like `role`) is made available to the route handler.

### API Authentication Middleware & Wrappers

API routes are protected using higher-order functions (wrappers) located in `src/lib/api/middleware.ts`. These wrappers ensure consistent authentication and authorization:

1.  **Token Extraction & Verification:**
    *   They expect the Firebase ID Token to be sent in the `Authorization: Bearer <ID_token>` header.
    *   They use the **Firebase Admin SDK** (`verifyIdToken`) to securely verify the token on the server-side.
    *   Authentication errors (missing token, invalid token, expired token) are handled centrally.

2.  **User Context Injection:**
    *   Upon successful verification, the decoded token payload, including `uid`, `email` (if available), and **verified custom claims** (like `role`), is packaged into an `AuthenticatedUser` object.
    *   This `AuthenticatedUser` object is passed as the first argument to the protected route handler, providing type-safe access to user information.

3.  **Role-Based Access Control (RBAC):**
    *   Specific wrappers like `withAdminRole` incorporate role checks directly within the wrapper logic. They verify the `role` claim extracted from the *verified* token.
    *   This eliminates the need for separate role verification calls within each route handler and prevents reliance on potentially insecure client-provided headers or unverified token data.

```typescript
// src/lib/api/middleware.ts (Conceptual Example)

import { getAuthAdmin } from '@/lib/firebase/admin';
import { handleApiError } from '@/lib/errors/error-handler';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors/error-types';
import { DecodedIdToken } from 'firebase-admin/auth';

// Type for the authenticated user object passed to handlers
export interface AuthenticatedUser extends DecodedIdToken {
  // Add specific role type if defined, e.g., role?: 'admin' | 'employee';
  role?: string;
}

type ApiHandler<TParams = {}> =
  (user: AuthenticatedUser, request: Request, context: { params: TParams }) => Promise<Response>;

// Wrapper for basic authentication
export function withAuthentication<TParams = {}>(handler: ApiHandler<TParams>) {
  return async (request: Request, context: { params: TParams }): Promise<Response> => {
    try {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Missing or invalid Bearer token', 'MISSING_AUTH_TOKEN');
      }
      const token = authHeader.split('Bearer ')[1];
      
      const auth = getAuthAdmin();
      const decodedToken = await auth.verifyIdToken(token);
      
      // Attach custom claims if they exist
      const user: AuthenticatedUser = {
        ...decodedToken,
        role: decodedToken.role // Assuming 'role' is the custom claim name
      };

      return handler(user, request, context);
    } catch (error) {
      // Handle specific Firebase auth errors (e.g., token expired)
      return handleApiError(error, 'Authentication failed');
    }
  };
}

// Wrapper for admin-only routes
export function withAdminRole<TParams = {}>(handler: ApiHandler<TParams>) {
  return withAuthentication<TParams>(async (user, request, context) => {
    // Role check using verified claims from the token
    if (user.role !== 'admin') {
      throw new ForbiddenError('Admin access required', 'ADMIN_ROLE_REQUIRED');
    }
    return handler(user, request, context);
  });
}
```

Route handlers now receive the `AuthenticatedUser` object directly:

```typescript
// Example usage in /api/some-resource/route.ts
import { withAuthentication, AuthenticatedUser } from '@/lib/api/middleware';

export const GET = withAuthentication(async (user: AuthenticatedUser, request: Request) => {
  // Access user details securely: user.uid, user.role, etc.
  const data = await getSomeResourceForUser(user.uid);
  return NextResponse.json({ success: true, data });
});

// Example usage in /api/admin/users/route.ts
import { withAdminRole, AuthenticatedUser } from '@/lib/api/middleware';

export const POST = withAdminRole(async (adminUser: AuthenticatedUser, request: Request) => {
  // This code only runs if the user has the 'admin' role in their verified token
  const newUserDetails = await request.json();
  const result = await createNewUser(newUserDetails, adminUser.uid); // Pass admin UID if needed for logging
  return NextResponse.json({ success: true, user: result }, { status: 201 });
});
```

### Role Verification (Integrated into Middleware)

As described above, role verification is now primarily handled **within the authentication wrappers** (like `withAdminRole`) using **verified custom claims** from the Firebase ID Token.

This approach offers several advantages:

*   **Security:** Roles are based on server-verified information, preventing tampering or reliance on insecure client-side data or headers (like the old `x-user-role`).
*   **Consistency:** Authorization logic is centralized within the middleware, reducing boilerplate code in individual route handlers.
*   **Simplicity:** Route handlers can focus on business logic, assuming the user context provided by the wrapper already meets the required authentication and authorization level.

There is no longer a need for separate `verifyAdminRole(userId)` utility functions called within each handler, as this check is performed by the wrapper itself using the `user.role` claim.

## Error Handling

### Error Taxonomy

Simple Tracker uses a hierarchical error structure:

```typescript
// Base error class
export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Specific error types
export class ValidationError extends BaseError {
  constructor(message: string, code: string, status: number = 400, details?: any) {
    super(message, code, status, details);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string, code: string) {
    super(message, code, 404);
  }
}

export class UnauthorizedError extends BaseError {
  constructor(message: string, code: string) {
    super(message, code, 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message: string, code: string) {
    super(message, code, 403);
  }
}
```

### Error Codes

Error codes are categorized by domain:

```typescript
// Example error codes
export enum ErrorCodes {
  // Authentication errors
  MISSING_AUTH_TOKEN = 'auth/missing-token',
  INVALID_AUTH_TOKEN = 'auth/invalid-token',
  ADMIN_ROLE_REQUIRED = 'auth/admin-role-required',
  
  // Validation errors
  VALIDATION_FAILED = 'validation/failed',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'resource/not-found',
  RESOURCE_ALREADY_EXISTS = 'resource/already-exists',
  RESOURCE_IN_USE = 'resource/in-use',
  
  // Operation errors
  OPERATION_FAILED = 'operation/failed',
  OPERATION_NOT_ALLOWED = 'operation/not-allowed',
  
  // Network errors
  NETWORK_ERROR = 'network/error',
}
```

### Error Handler

The central error handler converts various error types into a consistent response format:

```typescript
// Error handler middleware
export function handleApiError(error: any, defaultMessage: string): Response {
  console.error('API Error:', error);
  
  if (error instanceof BaseError) {
    return NextResponse.json({
      success: false,
      message: error.message,
      error: {
        code: error.code,
        status: error.status,
        details: error.details
      },
      timestamp: new Date().toISOString()
    }, { status: error.status });
  }
  
  return NextResponse.json({
    success: false,
    message: defaultMessage,
    error: {
      code: ErrorCodes.OPERATION_FAILED,
      status: 500,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    },
    timestamp: new Date().toISOString()
  }, { status: 500 });
}
```

## Request Validation

### Zod Schema Organization

Validation schemas are organized by resource and operation:

```typescript
// src/app/api/tickets/validation/ticketSchemas.ts

// Base schema with common fields
export const ticketBaseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  jobsiteId: z.string().min(1, 'Jobsite is required'),
  truckId: z.string().min(1, 'Truck is required'),
  // Categories represent a dynamic map of category names/IDs to counts
  categories: z.record(z.string(), z.number().int().min(0).max(999), {
    required_error: "Categories map is required",
    invalid_type_error: "Categories must be an object mapping strings to numbers",
  }).refine(val => Object.keys(val).length > 0, {
    message: "At least one category entry is required",
  }).refine(val => Object.values(val).every(count => count >= 0), {
    message: "All category counts must be non-negative",
  }),
  // Note: The refine checks ensure the map is not empty and counts are valid.
});

// Create operation schema
export const createTicketSchema = ticketBaseSchema.extend({
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
});

// Update operation schema (all fields optional)
export const updateTicketSchema = ticketBaseSchema.partial();

// Filter schema for list operations
export const filterTicketSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  jobsiteId: z.string().optional(),
  truckId: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
});
```

### Validation in Route Handlers

Validation is performed consistently in route handlers:

```typescript
// Example validation in a route handler
export const POST = authenticateRequest(async (userId, request) => {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate with Zod schema
    const validationResult = createTicketSchema.safeParse(body);
    
    // Handle validation errors
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid ticket data',
        ErrorCodes.VALIDATION_FAILED,
        400,
        validationResult.error.format()
      );
    }
    
    // Proceed with validated data
    const result = await createTicket(userId, validationResult.data);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Ticket created successfully',
      ticket: result,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'Failed to create ticket');
  }
});
```

## Response Format

### Standardized Response Structure

All API responses follow a consistent format with resource-specific properties instead of a generic `data` property:

#### Success Response

```typescript
// Success response format
{
  success: true,
  message: string, // Human-readable success message
  [resourceName]?: object | array, // Resource-specific property (e.g., "ticket", "tickets"), optional for simple success messages
  pagination?: { // Optional pagination information
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  },
  timestamp: string // ISO date string
}
```

Example:

```json
{
  "success": true,
  "message": "Tickets retrieved successfully",
  "tickets": [
    {
      "id": "ticket-123",
      "date": "2025-03-15",
      "jobsiteId": "site-1",
      "categories": { // Example map structure
        "hangers": 120,
        "leaners_short": 45,
        "leaners_medium": 30
      }
    }
  ],
  "pagination": {
    "total": 157,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  },
  "timestamp": "2025-03-27T14:35:12.456Z"
}
```

#### Error Response

```typescript
// Error response format
{
  success: false,
  message: string, // Human-readable error message
  error: {
    code: string, // Error code from ErrorCodes enum
    status: number, // HTTP status code
    details?: any // Additional error context
  },
  timestamp: string // ISO date string
}
```

Example:

```json
{
  "success": false,
  "message": "Invalid ticket data",
  "error": {
    "code": "validation/failed",
    "status": 400,
    "details": {
      "jobsiteId": ["Required"],
      "categories.hangers": ["Must be between 0 and 150"]
    }
  },
  "timestamp": "2025-03-27T14:35:12.456Z"
}
```

## Batch Operations

### Batch Operation Pattern

Batch operations allow multiple actions in a single request:

```typescript
// Batch operation schema
export const batchOperationSchema = z.object({
  operations: z.array(z.object({
    id: z.string(),
    operation: z.enum(['update', 'delete', 'archive']),
    data: z.record(z.any()).optional()
  })).min(1).max(100)
});

// Batch operation handler (using admin wrapper)
import { withAdminRole, AuthenticatedUser } from '@/lib/api/middleware';

export const POST = withAdminRole(async (adminUser: AuthenticatedUser, request: Request) => {
  try {
    // Admin role is already verified by the wrapper
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = batchOperationSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid batch operation',
        ErrorCodes.VALIDATION_FAILED,
        400,
        validationResult.error.format()
      );
    }
    
    // Process batch operations
    const results = await processBatchOperations(
      adminUser, // Pass the authenticated admin user object
      validationResult.data.operations
    );
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Batch operations processed successfully',
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to process batch operations');
  }
});
```

### Batch Operation Implementation

```typescript
// Process batch operations
async function processBatchOperations(
  adminUser: AuthenticatedUser, // Accept the user object
  operations: BatchOperation[]
): Promise<BatchOperationResults> {
  const db = getFirestoreAdmin();
  const batch = db.batch();
  
  // Track results
  const results = {
    successful: [] as { id: string; operation: string }[],
    failed: [] as { id: string; operation: string; error: string }[]
  };
  
  // Process each operation
  for (const op of operations) {
    try {
      const { id, operation, data } = op;
      const docRef = db.collection(COLLECTION_NAME).doc(id);
      
      // Check if document exists
      const doc = await docRef.get();
      if (!doc.exists) {
        results.failed.push({
          id,
          operation,
          error: `Resource with ID ${id} not found`
        });
        continue;
      }
      
      // Process based on operation type
      switch (operation) {
        case 'update':
          if (!data) {
            results.failed.push({
              id,
              operation,
              error: 'Data is required for update operation'
            });
            continue;
          }
          
          batch.update(docRef, {
            ...data,
            updatedBy: adminUser.uid, // Use UID from authenticated user
            updatedAt: serverTimestamp() // Ensure serverTimestamp is imported/available
          });
          break;
          
        case 'delete':
          batch.delete(docRef);
          break;
          
        case 'archive':
          batch.update(docRef, {
            status: 'archived',
            updatedBy: adminUser.uid, // Use UID from authenticated user
            updatedAt: serverTimestamp()
          });
          break;
          
        default:
          results.failed.push({
            id,
            operation,
            error: `Unknown operation: ${operation}`
          });
          continue;
      }
      
      results.successful.push({ id, operation });
    } catch (error) {
      results.failed.push({
        id: op.id,
        operation: op.operation,
        error: error.message || 'Unknown error'
      });
    }
  }
  
  // Commit the batch if there are any successful operations
  if (results.successful.length > 0) {
    await batch.commit();
  }

  return results;
}
```

## API Testing

### Testing Approach

API routes are tested with Next.js route handlers testing:

```typescript
// Example API route test
import { POST } from './route'; // Assuming this is the route using withAuthentication/withAdminRole
// import { createTicket } from './helpers'; // Mock the actual helper used by the route
import { NextRequest } from 'next/server';
import { AuthenticatedUser } from '@/lib/api/middleware'; // Import user type

// Mock the middleware directly or its underlying dependencies (Firebase Admin SDK)
jest.mock('@/lib/api/middleware', () => {
  const originalModule = jest.requireActual('@/lib/api/middleware');
  return {
    ...originalModule,
    // Mock the specific wrapper used by the route (e.g., withAuthentication)
    withAuthentication: jest.fn((handler) => async (request, context) => {
      // Simulate successful authentication and provide a mock user
      const mockUser: AuthenticatedUser = {
        uid: 'test-user-id',
        email: 'test@example.com',
        role: 'employee', // Or 'admin' if testing admin routes
        // Add other necessary fields from DecodedIdToken if used by the handler
        aud: '', iss: '', sub: '', auth_time: 0, iat: 0, exp: 0, email_verified: false, firebase: { identities: {}, sign_in_provider: '' }
      };
      return handler(mockUser, request, context);
    }),
    // Mock withAdminRole similarly if needed, ensuring mockUser has role: 'admin'
    withAdminRole: jest.fn((handler) => async (request, context) => {
       const mockUser: AuthenticatedUser = {
        uid: 'test-admin-id',
        email: 'admin@example.com',
        role: 'admin',
        aud: '', iss: '', sub: '', auth_time: 0, iat: 0, exp: 0, email_verified: false, firebase: { identities: {}, sign_in_provider: '' }
      };
       // Simulate role check passing
       return handler(mockUser, request, context);
    }),
  };
});

// Mock other dependencies like Firestore if needed by the handler/helpers
jest.mock('@/lib/firebase/admin', () => ({
  // Keep mocks for Firestore if helpers still use it directly
  getFirestoreAdmin: jest.fn().mockReturnValue({
     collection: jest.fn().mockReturnValue({
       add: jest.fn().mockResolvedValue({ id: 'new-ticket-id' }),
       // ... other Firestore mocks
     })
  }),
  // getAuthAdmin might not be needed directly if middleware is mocked,
  // but keep if other parts of the code use it.
  getAuthAdmin: jest.fn(),
}));

// Mock the specific helper function called by your route handler
// Adjust the path and function name accordingly
jest.mock('./helpers', () => ({
  createResource: jest.fn().mockResolvedValue({ // Assuming createResource is the helper
    id: 'new-resource-id',
    // other resource properties
  })
}));

describe('POST /api/tickets', () => {
  it('should create a ticket successfully', async () => {
    // Create mock request
    const request = new NextRequest('http://localhost/api/tickets', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: '2025-03-15',
        jobsiteId: 'site-1',
        truckId: 'truck-1',
        categories: { // Example map structure
          "hangers": 120,
          "leaners_short": 45,
          "leaners_medium": 30,
          "leaners_long": 15
        },
        images: ['https://example.com/image1.jpg']
      })
    });
    
    // Call route handler
    const response = await POST(request);
    const body = await response.json();
    
    // Verify response
    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.ticket).toBeDefined();
    expect(body.resource).toBeDefined(); // Check the resource property used in the response
    expect(body.resource.id).toBe('new-resource-id');

    // Verify helper function was called with UID from the mock user
    expect(require('./helpers').createResource).toHaveBeenCalledWith( // Access mocked helper
      'test-user-id', // UID from the mockUser in withAuthentication mock
      expect.objectContaining({
        date: '2025-03-15',
        jobsiteId: 'site-1',
        // other properties...
      })
    );
  });
  
  it('should return validation error for invalid data', async () => {
    // Create mock request with invalid data
    const request = new NextRequest('http://localhost/api/tickets', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        // Missing required fields
        date: '2025-03-15'
      })
    });
    
    // Call route handler
    const response = await POST(request);
    const body = await response.json();
    
    // Verify error response
    expect(response.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('validation/failed');

    expect(body.error.details).toBeDefined();
  });
});
```

## Best Practices

### 1. API Route Organization

- **Resource-Based Routes**: Organize endpoints around resources (e.g., `/api/tickets`)
- **Consistent Naming**: Use consistent naming patterns for endpoints
- **Thin Route Handlers**: Keep route handlers thin, delegate business logic to helpers
- **Clear Separation**: Separate authentication, validation, and business logic

### 2. Error Handling

- **Custom Error Types**: Use appropriate error types for different scenarios
- **Consistent Format**: Follow the standardized error response format
- **User-Friendly Messages**: Provide clear, actionable error messages
- **Detailed Logging**: Log errors with context for debugging

### 3. Validation

- **Schema Reuse**: Extract common validation logic into base schemas
- **Comprehensive Validation**: Validate all inputs with appropriate constraints
- **Detailed Error Messages**: Provide specific error messages for each validation rule
- **Custom Validators**: Implement custom validators for complex business rules

### 4. Response Formatting

- **Resource-Specific Properties**: Use resource-specific properties instead of generic `data`
- **Consistent Structure**: Follow the standardized response format
- **Appropriate Status Codes**: Use correct HTTP status codes
- **Pagination**: Include pagination information for list endpoints

### 5. Security

- **Authentication**: Always use authentication middleware
- **Authorization**: Verify appropriate permissions for each operation
- **Input Validation**: Validate all inputs to prevent injection attacks
- **Rate Limiting**: Implement rate limiting for sensitive endpoints

### 6. Performance

- **Batch Operations**: Use batch operations for multiple updates
- **Pagination**: Paginate large result sets
- **Query Optimization**: Optimize database queries with proper indexes
- **Caching**: Implement caching for frequently accessed resources
