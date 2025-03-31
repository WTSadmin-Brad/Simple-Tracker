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
): Promise<ApiResponse<T>> {
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
    if (options?.data) {
      config.body = JSON.stringify(options.data);
    }

    // Execute request with error handling
    const response = await fetch(url, config);
    const data = await response.json();
    
    return {
      ...data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || 'Unknown error occurred',
        code: 'NETWORK_ERROR',
        status: 0
      },
      isNetworkError: true,
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

export async function getTickets(filters: TicketFilterParams = {}): Promise<ApiResponse<TicketsResponse>> {
  return apiRequest<TicketsResponse>(ENDPOINTS.TICKETS, {
    params: filters,
  });
}

export async function getTicketById(id: string): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>(ENDPOINTS.TICKET_DETAIL(id));
}

export async function createTicket(data: CreateTicketData): Promise<ApiResponse<TicketResponse>> {
  return apiRequest<TicketResponse>(ENDPOINTS.TICKETS, {
    method: 'POST',
    data,
  });
}
```

## API Route Patterns

### Standard Route Structure

All API routes follow a consistent pattern:

```typescript
// Standard structure for API routes
import { NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api/middleware';
import { handleApiError } from '@/lib/errors/error-handler';
import { ValidationError } from '@/lib/errors/error-types';
import { createResourceSchema } from './validation';

export const POST = authenticateRequest(async (userId, request) => {
  try {
    // 1. Verify permissions if needed
    await verifyPermissions(userId);
    
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
    const result = await createResource(userId, validationResult.data);
    
    // 4. Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      [resourceName]: result,
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
// route.ts - Route handler
export const GET = authenticateRequest(async (userId, request, { params }) => {
  try {
    const { id } = params;
    const resource = await getResourceById(userId, id);
    
    return NextResponse.json({
      success: true,
      message: 'Resource retrieved successfully',
      [resourceName]: resource,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve resource');
  }
});

// helpers.ts - Business logic
export async function getResourceById(userId: string, id: string) {
  const db = getFirestoreAdmin();
  const docRef = db.collection(COLLECTION_NAME).doc(id);
  const doc = await docRef.get();
  
  if (!doc.exists) {
    throw new NotFoundError(
      `Resource with ID ${id} not found`,
      'RESOURCE_NOT_FOUND'
    );
  }
  
  // Verify access
  const data = doc.data();
  if (data.ownerId !== userId) {
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
```

## Authentication Architecture

### Authentication Flow

Simple Tracker uses Firebase Authentication with a multi-level authentication approach:

1. **Client-Side Authentication**
   - User submits credentials
   - Firebase authenticates and returns tokens
   - Tokens stored in cookies and memory

2. **Token Management**
   - Automatic token refresh before expiration
   - Session cookies for server-side authentication

3. **API Authentication Middleware**
   - Extracts and verifies tokens from headers
   - Provides authenticated user ID to route handlers

### Authentication Middleware

All API routes are protected by authentication middleware that:

1. Extracts and verifies Firebase ID tokens
2. Provides the authenticated user ID to handlers
3. Handles authentication errors consistently

```typescript
// Authentication middleware
export function authenticateRequest<Params extends {} = {}>(
  handler: (userId: string, request: Request, params: Params) => Promise<Response>
) {
  return async (request: Request, params: Params): Promise<Response> => {
    try {
      // Extract token from header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError(
          'Missing or invalid authentication token',
          'MISSING_AUTH_TOKEN'
        );
      }
      
      const token = authHeader.split('Bearer ')[1];
      
      // Verify token
      const auth = getAuthAdmin();
      const decodedToken = await auth.verifyIdToken(token);
      
      // Extract user ID
      const userId = decodedToken.uid;
      
      // Call handler with authenticated user ID
      return handler(userId, request, params);
    } catch (error) {
      return handleApiError(error, 'Authentication failed');
    }
  };
}
```

### Role Verification

Role verification happens in separate functions within route handlers:

```typescript
// Role verification in route handler
export const GET = authenticateRequest(async (userId, request) => {
  try {
    // Verify admin role
    await verifyAdminRole(userId);
    
    // Process the admin-only request
    // ...
  } catch (error) {
    return handleApiError(error, 'Operation failed');
  }
});

// Utility function for role verification
async function verifyAdminRole(userId: string) {
  const auth = getAuthAdmin();
  const user = await auth.getUser(userId);
  
  const customClaims = user.customClaims || {};
  if (!customClaims.role || customClaims.role !== 'admin') {
    throw new ForbiddenError(
      'Admin access required',
      'ADMIN_ROLE_REQUIRED'
    );
  }
  
  return user;
}
```

This separation of token verification (middleware) and role verification (route handlers) provides flexibility for different role requirements per route.

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
  categories: z.object({
    hangers: z.number().int().min(0).max(150),
    leaner6To12: z.number().int().min(0).max(150),
    leaner13To24: z.number().int().min(0).max(150),
    leaner25To36: z.number().int().min(0).max(150),
    leaner37To48: z.number().int().min(0).max(150),
    leaner49Plus: z.number().int().min(0).max(150),
  }),
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
  [resourceName]: object | array, // Resource-specific property (e.g., "ticket", "tickets")
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
      "categories": {
        "hangers": 120,
        "leaner6To12": 45
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

// Batch operation handler
export const POST = authenticateRequest(async (userId, request) => {
  try {
    // Verify admin role
    await verifyAdminRole(userId);
    
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
      userId,
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
  userId: string,
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
            updatedBy: userId,
            updatedAt: serverTimestamp()
          });
          break;
          
        case 'delete':
          batch.delete(docRef);
          break;
          
        case 'archive':
          batch.update(docRef, {
            status: 'archived',
            updatedBy: userId,
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
import { POST } from './route';
import { createTicket } from './helpers';
import { NextRequest } from 'next/server';

// Mock dependencies
jest.mock('@/lib/firebase/admin', () => ({
  getAuthAdmin: jest.fn().mockReturnValue({
    verifyIdToken: jest.fn().mockResolvedValue({ uid: 'test-user-id' }),
    getUser: jest.fn().mockResolvedValue({
      customClaims: { role: 'admin' }
    })
  }),
  getFirestoreAdmin: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      add: jest.fn().mockResolvedValue({ id: 'new-ticket-id' }),
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ /* mock data */ }),
          id: 'test-id'
        })
      })
    })
  })
}));

// Mock helper functions
jest.mock('./helpers', () => ({
  createTicket: jest.fn().mockResolvedValue({
    id: 'new-ticket-id',
    date: '2025-03-15',
    // other ticket properties
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
        categories: {
          hangers: 120,
          leaner6To12: 45,
          leaner13To24: 30,
          leaner25To36: 15,
          leaner37To48: 5,
          leaner49Plus: 0
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
    expect(body.ticket.id).toBe('new-ticket-id');
    
    // Verify helper function was called with correct arguments
    expect(createTicket).toHaveBeenCalledWith(
      'test-user-id',
      expect.objectContaining({
        date: '2025-03-15',
        jobsiteId: 'site-1',
        // other properties
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
