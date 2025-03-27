# API Route Template

This document provides standardized templates for implementing API routes in the Simple Tracker application. Following these patterns ensures consistency across the codebase and simplifies maintenance.

## Table of Contents

1. [GET Route Template](#get-route-template)
2. [POST Route Template](#post-route-template)
3. [PUT/PATCH Route Template](#putpatch-route-template)
4. [DELETE Route Template](#delete-route-template)
5. [Authentication with Role Verification](#authentication-with-role-verification)
6. [Batch Operations Template](#batch-operations-template)
7. [Zod Schema Organization](#zod-schema-organization)
8. [Error Handling Best Practices](#error-handling-best-practices)
9. [Response Format Standards](#response-format-standards)

## GET Route Template

```typescript
import { NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { AuthorizationError } from '@/lib/errors/error-types';
import { ErrorCodes } from '@/lib/errors/error-codes';
import { ValidationError } from '@/lib/errors/error-types';
import { filterSchema } from './validation/schemas';

/**
 * GET handler for retrieving [resource description]
 * 
 * @route GET /api/[resource-path]
 * @authentication Required
 */
export const GET = authenticateRequest(async (userId, request) => {
  try {
    // Verify admin role if this is an admin-only endpoint
    const auth = getAuthAdmin();
    const user = await auth.getUser(userId);
    
    const customClaims = user.customClaims || {};
    if (!customClaims.role || customClaims.role !== 'admin') {
      throw new AuthorizationError(
        'Admin access required',
        ErrorCodes.ADMIN_ROLE_REQUIRED
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const filterParams = {
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.has('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
      sortField: searchParams.get('sortField') || undefined,
      sortDirection: searchParams.get('sortDirection') as 'asc' | 'desc' | undefined,
    };
    
    // Validate using Zod schema
    const validationResult = filterSchema.safeParse(filterParams);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid filter parameters',
        ErrorCodes.VALIDATION_FAILED,
        400,
        validationResult.error.format()
      );
    }
    
    // Call helper function to fetch data
    const result = await getResources(validationResult.data);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Resources retrieved successfully',
      resources: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.limit,
        totalPages: result.totalPages
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Handle errors consistently
    return handleApiError(error, 'Failed to retrieve resources');
  }
});
```

## POST Route Template

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { ValidationError, AuthorizationError } from '@/lib/errors/error-types';
import { ErrorCodes } from '@/lib/errors/error-codes';
import { createResourceSchema } from './validation/schemas';

/**
 * POST handler for creating [resource description]
 * 
 * @route POST /api/[resource-path]
 * @authentication Required
 */
export const POST = authenticateRequest(async (userId, request) => {
  try {
    // Verify admin role if this is an admin-only endpoint
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
    const validationResult = createResourceSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid resource data',
        ErrorCodes.VALIDATION_FAILED,
        400,
        validationResult.error.format()
      );
    }
    
    // Create resource using helper function
    const resource = await createResource(userId, validationResult.data);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Resource created successfully',
      resource,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'Failed to create resource');
  }
});
```

## PUT/PATCH Route Template

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { ValidationError, NotFoundError, AuthorizationError } from '@/lib/errors/error-types';
import { ErrorCodes } from '@/lib/errors/error-codes';
import { updateResourceSchema } from './validation/schemas';

/**
 * PUT handler for updating [resource description]
 * 
 * @route PUT /api/[resource-path]/[id]
 * @authentication Required
 */
export const PUT = authenticateRequest(async (userId, request, { params }) => {
  try {
    // Verify admin role if this is an admin-only endpoint
    const auth = getAuthAdmin();
    const user = await auth.getUser(userId);
    
    const customClaims = user.customClaims || {};
    if (!customClaims.role || customClaims.role !== 'admin') {
      throw new AuthorizationError(
        'Admin access required',
        ErrorCodes.ADMIN_ROLE_REQUIRED
      );
    }
    
    // Get ID from params
    const { id } = params;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateResourceSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid resource data',
        ErrorCodes.VALIDATION_FAILED,
        400,
        validationResult.error.format()
      );
    }
    
    // Update resource using helper function
    const resource = await updateResource(userId, id, validationResult.data);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Resource updated successfully',
      resource,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update resource');
  }
});
```

## DELETE Route Template

```typescript
import { NextResponse } from 'next/server';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { NotFoundError, AuthorizationError } from '@/lib/errors/error-types';
import { ErrorCodes } from '@/lib/errors/error-codes';

/**
 * DELETE handler for removing [resource description]
 * 
 * @route DELETE /api/[resource-path]/[id]
 * @authentication Required
 */
export const DELETE = authenticateRequest(async (userId, request, { params }) => {
  try {
    // Verify admin role if this is an admin-only endpoint
    const auth = getAuthAdmin();
    const user = await auth.getUser(userId);
    
    const customClaims = user.customClaims || {};
    if (!customClaims.role || customClaims.role !== 'admin') {
      throw new AuthorizationError(
        'Admin access required',
        ErrorCodes.ADMIN_ROLE_REQUIRED
      );
    }
    
    // Get ID from params
    const { id } = params;
    
    // Delete resource using helper function
    await deleteResource(userId, id);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
      id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete resource');
  }
});
```

## Authentication with Role Verification

All admin routes should include role verification:

```typescript
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
```

For employee-only routes:

```typescript
// Verify employee role
const auth = getAuthAdmin();
const user = await auth.getUser(userId);

const customClaims = user.customClaims || {};
if (!customClaims.role || !['admin', 'employee'].includes(customClaims.role)) {
  throw new AuthorizationError(
    'Employee access required',
    ErrorCodes.EMPLOYEE_ROLE_REQUIRED
  );
}
```

## Batch Operations Template

```typescript
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateRequest, handleApiError } from '@/lib/api/middleware';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { ValidationError, AuthorizationError } from '@/lib/errors/error-types';
import { ErrorCodes } from '@/lib/errors/error-codes';
import { batchOperationSchema } from './validation/schemas';

/**
 * POST handler for batch operations on [resource description]
 * 
 * @route POST /api/[resource-path]/batch
 * @authentication Required (Admin)
 */
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

/**
 * Handle batch update request
 * @param userId - The admin's user ID
 * @param operations - Array of batch operations
 * @returns Response with operation results
 */
async function processBatchOperations(
  userId: string, 
  operations: BatchOperation[]
): Promise<{ 
  success: { id: string; operation: string }[];
  errors: { id: string; operation: string; error: string }[];
}> {
  // 1. Get Firestore instance
  const db = getFirestoreAdmin();
  const batch = db.batch();
  
  // 2. Track successful and failed operations
  const results = {
    success: [] as { id: string; operation: string }[],
    errors: [] as { id: string; operation: string; error: string }[]
  };
  
  // 3. Process each operation in the batch
  for (const op of operations) {
    try {
      const { id, operation, data } = op;
      const resourceRef = db.collection('collectionName').doc(id);
      const resourceSnapshot = await resourceRef.get();
      
      if (!resourceSnapshot.exists) {
        results.errors.push({
          id,
          operation,
          error: 'Resource not found'
        });
        continue;
      }
      
      // 4. Process based on operation type
      switch (operation) {
        case 'update':
          if (!data) {
            results.errors.push({
              id,
              operation,
              error: 'Data is required for update operation'
            });
            continue;
          }
          
          batch.update(resourceRef, {
            ...data,
            updatedBy: userId,
            updatedAt: serverTimestamp()
          });
          break;
          
        case 'delete':
          batch.delete(resourceRef);
          break;
          
        case 'archive':
          batch.update(resourceRef, {
            status: 'archived',
            updatedBy: userId,
            updatedAt: serverTimestamp()
          });
          break;
          
        default:
          results.errors.push({
            id,
            operation,
            error: `Unknown operation: ${operation}`
          });
          continue;
      }
      
      results.success.push({ id, operation });
    } catch (error) {
      results.errors.push({
        id: op.id,
        operation: op.operation,
        error: error.message || 'Unknown error'
      });
    }
  }
  
  // 5. Commit the batch if there are any successful operations
  if (results.success.length > 0) {
    await batch.commit();
  }
  
  return results;
}
```

## Zod Schema Organization

Currently, we use a decentralized schema approach with validation defined near usage. The following patterns are recommended:

1. For widely used schemas, define them in a route-specific validation folder:
   ```
   /api/[resource]/validation/schemas.ts
   ```

2. For route-specific schemas, define them at the top of the route file

3. Use descriptive names that indicate purpose:
   ```typescript
   const createResourceSchema = z.object({...});
   const updateResourceSchema = z.object({...}).partial();
   const filterResourceSchema = z.object({...});
   const batchOperationSchema = z.object({...});
   ```

4. Use the .partial() method for update schemas to make all fields optional

5. Extend base schemas for derived operations:
   ```typescript
   // Base schema with common fields
   const resourceBaseSchema = z.object({
     name: z.string().min(1, 'Name is required'),
     description: z.string().optional(),
     status: z.enum(['active', 'inactive', 'archived']),
   });
   
   // Create schema uses all fields from base schema
   const createResourceSchema = resourceBaseSchema;
   
   // Update schema makes all fields optional
   const updateResourceSchema = resourceBaseSchema.partial();
   
   // Filter schema has different fields
   const filterResourceSchema = z.object({
     status: z.enum(['active', 'inactive', 'archived']).optional(),
     search: z.string().optional(),
     page: z.coerce.number().int().positive().optional().default(1),
     limit: z.coerce.number().int().positive().max(100).optional().default(20),
     sortField: z.string().optional(),
     sortDirection: z.enum(['asc', 'desc']).optional(),
   });
   ```

6. Use discriminated unions for operation-based schemas:
   ```typescript
   const changeRoleOperation = z.object({
     action: z.literal('changeRole'),
     uid: z.string(),
     data: z.object({
       role: z.enum(['admin', 'employee'])
     })
   });
   
   const setActiveStatusOperation = z.object({
     action: z.literal('setActiveStatus'),
     uid: z.string(),
     data: z.object({
       active: z.boolean()
     })
   });
   
   // Combined operation schema using discriminated union
   const userOperationSchema = z.discriminatedUnion('action', [
     changeRoleOperation,
     setActiveStatusOperation
   ]);
   ```

## Error Handling Best Practices

1. Use typed error classes for different error scenarios:
   ```typescript
   // From error-types.ts
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
   
   export class AuthorizationError extends BaseError {
     constructor(message: string, code: string) {
       super(message, code, 403);
     }
   }
   ```

2. Use the `handleApiError` function for consistent error handling:
   ```typescript
   try {
     // API logic
   } catch (error) {
     return handleApiError(error, 'Failed to [operation description]');
   }
   ```

3. Include validation error details:
   ```typescript
   if (!validationResult.success) {
     throw new ValidationError(
       'Invalid data',
       ErrorCodes.VALIDATION_FAILED,
       400,
       validationResult.error.format()
     );
   }
   ```

4. Use standard error codes from the `ErrorCodes` enum:
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
   }
   ```

## Response Format Standards

All API responses should follow a consistent format:

### Success Response

```typescript
{
  success: true,
  message: string,  // Human-readable success message
  [resourceName]: object | array,  // e.g., "resource" or "resources"
  pagination?: {  // For paginated responses
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  },
  timestamp: string  // ISO date string
}
```

Example:

```typescript
return NextResponse.json({
  success: true,
  message: 'Resources retrieved successfully',
  resources: result.items,
  pagination: {
    total: result.total,
    page: result.page,
    pageSize: result.limit,
    totalPages: result.totalPages
  },
  timestamp: new Date().toISOString()
});
```

### Error Response

```typescript
{
  success: false,
  message: string,  // Human-readable error message
  error: {
    code: string,   // Error code from ErrorCodes enum
    status: number, // HTTP status code
    details?: any   // Additional error context
  },
  timestamp: string  // ISO date string
}
```

Example:

```typescript
return NextResponse.json({
  success: false,
  message: 'Invalid request data',
  error: {
    code: ErrorCodes.VALIDATION_FAILED,
    status: 400,
    details: validationError.format()
  },
  timestamp: new Date().toISOString()
}, { status: 400 });
```

### Pagination Format

For paginated list endpoints, use this structure:

```typescript
{
  success: true,
  message: 'Resources retrieved successfully',
  resources: [
    { /* resource object */ },
    { /* resource object */ },
    // ...
  ],
  pagination: {
    total: 100,        // Total number of resources
    page: 2,           // Current page number
    pageSize: 20,      // Items per page
    totalPages: 5      // Total number of pages
  },
  timestamp: '2023-09-28T12:34:56.789Z'
}
```
