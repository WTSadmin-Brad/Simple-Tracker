# Simple Tracker API Integration

## Table of Contents

1. [Overview](#overview)
2. [API Client Architecture](#api-client-architecture)
3. [Domain-Specific API Modules](#domain-specific-api-modules)
4. [Firebase Integration](#firebase-integration)
5. [API Authentication Middleware](#api-authentication-middleware)
6. [Error Handling](#error-handling)
7. [Batch Operations](#batch-operations)
8. [Mock Data Implementation](#mock-data-implementation)
9. [TanStack Query Integration](#tanstack-query-integration)
10. [API Implementation Examples](#api-implementation-examples)
11. [Best Practices](#best-practices)
12. [Migration Guide](#migration-guide)
13. [Export and Archive API Implementation](#export-and-archive-api-implementation)

## Overview

Simple Tracker uses a centralized API client architecture to interact with Firebase Firestore and Storage. This document outlines the patterns and approaches used for API integration throughout the application.

> **Note:** For detailed information about TanStack Query integration, please refer to the [API-TANSTACK-QUERY-GUIDE.md](./API-TANSTACK-QUERY-GUIDE.md) document.
> 
> For detailed information about standardized API route patterns, please refer to the [API-ROUTE-TEMPLATE.md](./API-ROUTE-TEMPLATE.md) document.
> 
> For Firebase implementation details, see [FIREBASE-IMPLEMENTATION.md](./FIREBASE-IMPLEMENTATION.md).

## API Client Architecture

### Directory Structure

```
/src
  /lib
    /api
      /middleware        # API middleware (auth, error handling)
      apiClient.ts       # Centralized API client with error handling
      endpoints.ts       # Centralized endpoint definitions
    /firebase
      admin.ts           # Firebase Admin SDK initialization
      client.ts          # Firebase Client SDK initialization
    /errors
      error-types.ts     # API-specific error types
      error-handler.ts   # Error handling utilities
      error-codes.ts     # Standardized error codes
  /app
    /api                 # Next.js API routes
      /[resource]        # Resource-specific API routes
        /route.ts        # Route handlers
        /helpers.ts      # Business logic helpers
        /[id]/route.ts   # Dynamic route handlers
```

### Centralized API Client

The application uses a centralized API client in `apiClient.ts` that provides:

- Consistent error handling across all API calls
- Standardized response format
- Support for both JSON and form data requests
- Automatic retry logic for transient errors

```typescript
// Example of the API client functions
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

    // Add URL parameters if provided
    let url = endpoint;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      url = `${url}?${searchParams.toString()}`;
    }

    // Execute request
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

All API responses follow a consistent format:

```typescript
// Success response
{
  success: true,
  message: string, // Human-readable success message
  [resourceName]: object | array, // Resource-specific data (e.g., "jobsite", "users")
  pagination?: { // For paginated responses
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  },
  timestamp: string // ISO date string
}

// Error response
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

## Domain-Specific API Modules

Each domain has its own API module with functions for specific operations:

```typescript
// Example from ticketApi.ts
export const ENDPOINTS = {
  TICKETS: '/api/tickets',
  TICKET_DETAIL: (id: string) => `/api/tickets/${id}`,
  TICKETS_BATCH: '/api/tickets/batch',
  WIZARD_DATA: '/api/tickets/wizard',
  TEMP_IMAGES: '/api/tickets/images/temp',
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

// Response types for better type safety
interface TicketsResponse {
  tickets: Ticket[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface TicketResponse {
  ticket: Ticket;
}
```

## Firebase Integration

The application uses Firebase for both authentication and data storage:

### Authentication

- Firebase Authentication for user identity management
- Custom claims for role-based access control
- Admin-managed user accounts (no self-registration)

```typescript
// Authentication middleware example
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
          ErrorCodes.MISSING_AUTH_TOKEN
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

### Data Storage

- Firestore for structured data
- Cloud Storage for file storage

#### Firestore Structure

The application uses a collection-based structure:

```
- users: User profiles and preferences
- tickets: Ticket submissions from field workers
- jobsites: Information about work locations
- trucks: Equipment information
- workdays: Daily work records
- tempImages: Temporary image storage before ticket submission
```

#### Storage Structure

- **tickets/{ticketId}/images/**: Stores ticket images
- **tickets/{ticketId}/thumbnails/**: Stores image thumbnails
- **temp-images/{userId}/**: Stores temporary images during ticket creation

## API Authentication Middleware

All API routes are protected by authentication middleware that:

1. Extracts and verifies Firebase ID tokens
2. Provides the authenticated user ID to handlers
3. Handles authentication errors consistently

```typescript
// API route with authentication
export const GET = authenticateRequest(async (userId, request) => {
  try {
    // Verify admin role
    const auth = getAuthAdmin();
    const user = await auth.getUser(userId);
    
    const customClaims = user.customClaims || {};
    if (!customClaims.role || customClaims.role !== 'admin') {
      throw new AuthorizationError(
        'Admin access required',
        ErrorCodes.ADMIN_ROLE_REQUIRED
      );
    }
    
    // Process the request...
    
    return NextResponse.json({
      success: true,
      message: 'Operation successful',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Operation failed');
  }
});
```

## Error Handling

The application uses a standardized error handling approach:

### Error Types

```typescript
// From error-types.ts
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

export class AuthorizationError extends BaseError {
  constructor(message: string, code: string) {
    super(message, code, 403);
  }
}
```

### Error Codes

```typescript
// From error-codes.ts
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

```typescript
// From middleware.ts
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

## Batch Operations

The application supports batch operations for efficient updates:

```typescript
// Example batch operation endpoint from API-ROUTE-TEMPLATE.md
export const POST = authenticateRequest(async (userId, request) => {
  try {
    // Verify admin role
    const auth = getAuthAdmin();
    const user = await auth.getUser(userId);
    
    const customClaims = user.customClaims || {};
    if (!customClaims.role || customClaims.role !== 'admin') {
      throw new AuthorizationError(
        'Admin access required',
        ErrorCodes.ADMIN_ROLE_REQUIRED
      );
    }
    
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

## Mock Data Implementation

For development and testing, the application includes mock data implementations:

```typescript
// Mock API helper example
export function createMockApiResponse<T>(
  data: T,
  options?: {
    success?: boolean;
    message?: string;
    status?: number;
    delay?: number;
  }
): Promise<ApiResponse<T>> {
  const response = {
    success: options?.success ?? true,
    message: options?.message ?? 'Operation completed successfully',
    ...(options?.success === false
      ? {
          error: {
            code: 'mock/error',
            status: options?.status ?? 400,
            details: null,
          },
        }
      : data),
    timestamp: new Date().toISOString(),
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(response);
    }, options?.delay ?? 500);
  });
}
```

## TanStack Query Integration

The API client is designed to work seamlessly with TanStack Query:

```typescript
// Example query hooks
export function useJobsiteQueries() {
  const useJobsites = (filters = {}) => {
    return useQuery({
      queryKey: queryKeys.jobsites.list(filters),
      queryFn: () => getJobsites(filters),
      select: (response) => response.success ? response : undefined,
      ...createRetryConfig(2),
    });
  };
  
  const useJobsite = (id: string) => {
    return useQuery({
      queryKey: queryKeys.jobsites.detail(id),
      queryFn: () => getJobsiteById(id),
      select: (response) => response.success ? response : undefined,
      ...createRetryConfig(2),
      enabled: !!id,
    });
  };
  
  return {
    useJobsites,
    useJobsite,
  };
}

// Mutation hook example
export function useJobsiteMutations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const useCreateJobsite = () => {
    return useMutation({
      mutationFn: createJobsite,
      ...createMutationOptions(toast, {
        loading: 'Creating jobsite...',
        success: 'Jobsite created successfully!',
        error: 'Failed to create jobsite',
        operationName: 'createJobsite',
        onSuccessCallback: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.jobsites.lists() });
        },
      }),
    });
  };
  
  return {
    useCreateJobsite,
    // Other mutation hooks...
  };
}
```

## API Implementation Examples

See the following resource-specific API documentation:

- [Jobsite API Documentation](./JOBSITE-API.md)
- [Ticket API Documentation](./TICKET-API.md)
- [User API Documentation](./USER-API.md)
- [Workday API Documentation](./WORKDAY-API.md)

## Best Practices

### API Design

1. **Resource-Based Routes**: Organize endpoints around resources (e.g., `/api/tickets`)
2. **Consistent Naming**: Use consistent naming patterns for endpoints
3. **Validation**: Validate all inputs using Zod schemas
4. **Error Handling**: Use standardized error types and codes
5. **Response Format**: Follow the standardized response format

### Code Organization

1. **Route Handler Logic**: Keep route handlers thin, delegate business logic to helpers
2. **Reusable Validation**: Use shared validation schemas
3. **Consistent Patterns**: Follow the same patterns across all API implementations
4. **Type Safety**: Use TypeScript interfaces for request/response typing

## Migration Guide

When migrating existing code to follow these patterns:

1. Update response format to use resource names instead of generic `data` property
2. Implement consistent error handling with typed error responses
3. Add appropriate validation using Zod schemas
4. Separate business logic into helper functions
5. Implement resource-specific API modules
6. Update client-side code to use the new API client

## Export and Archive API Implementation

### Core Resources

The application has several domain-specific API modules:

- **Tickets API**: Ticket creation, management, and status updates
- **Workdays API**: Workday logging and management
- **Jobsites API**: Jobsite management and association
- **Trucks API**: Truck inventory and management
- **Users API**: User management and permissions
- **Export API**: Data export in various formats
- **Archive API**: Archive management for historical data

Each domain has its own dedicated module with standardized CRUD operations and special actions.

### Export API

The Export API provides functionality for exporting data in various formats (CSV, Excel, JSON). It follows a consistent pattern for different data types:

#### Export Architecture

1. **Route Structure**:
   - Dynamic route handler: `/api/admin/export/[type]/route.ts`
   - Type-specific helpers: `/tickets/exportHelpers.ts`, `/workdays/exportHelpers.ts`
   - Shared utilities: `/lib/utils/exportUtils.ts`

2. **Endpoints**:
   - `GET /api/admin/export/[type]` - Generate an export based on query parameters
   - `POST /api/admin/export/[type]` - Create an asynchronous export task
   - `GET /api/admin/export/list` - List available exports
   - `DELETE /api/admin/export/delete` - Delete an export

3. **Supported Types**:
   - `tickets`: Export ticket data with category counts
   - `workdays`: Export workday data with optional summaries

4. **Supported Formats**:
   - `csv`: Simple comma-separated values
   - `excel`: Excel workbook with multiple sheets
   - `json`: Complete data in JSON format

5. **Implementation Pattern**:
```typescript
// Example export function pattern
export async function generateExport(params) {
  // 1. Fetch data based on filters
  const { data } = await fetchData(filters);
  
  // 2. Generate export in requested format
  const fileBuffer = generateFileByFormat(data, params.format);
  
  // 3. Upload to storage and return metadata
  return {
    url: await uploadAndGetUrl(fileBuffer),
    filename, format, recordCount,
    generatedAt, expiresAt
  };
}
```

### Archive API

The Archive API provides functionality for archiving and retrieving historical data:

#### Archive Architecture

1. **Route Structure**:
   - Dynamic route handler: `/api/admin/archive/[action]/route.ts`
   - Action-specific helpers: `/search/helpers.ts`, `/restore/helpers.ts`, `/images/helpers.ts`

2. **Endpoints**:
   - `GET /api/admin/archive/search` - Search archived data with filters
   - `POST /api/admin/archive/restore` - Restore archived data
   - `POST /api/admin/archive/images` - Archive images from tickets
   - `GET /api/admin/archive/images` - Retrieve archived images

3. **Implementation Pattern**:
```typescript
// Example archive handler pattern
export async function handleArchiveAction(params) {
  // 1. Validate parameters
  const validatedParams = validateParams(params);
  
  // 2. Perform archive operation
  const result = await performOperation(validatedParams);
  
  // 3. Return operation result
  return { success: true, ...result };
}
```