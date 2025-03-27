# Jobsite API Documentation

This document outlines the standardized implementation of the Jobsite API in Simple Tracker. It serves as a practical example of our API standardization patterns.

## Overview

The Jobsite API handles jobsite data management for field operations. It follows our standardized patterns for authentication, validation, error handling, and response formatting.

## API Structure

```
/api/admin/jobsites
  ├── route.ts           # Main route handler (GET, POST)
  ├── helpers.ts         # Business logic functions
  ├── [id]/
  │   └── route.ts       # Dynamic route handler (GET, PUT, DELETE)
  ├── batch/
  │   └── route.ts       # Batch operations handler (POST)
  └── validation/
      └── jobsiteSchemas.ts  # Validation schemas
```

## Authentication and Authorization

All jobsite API endpoints require authentication with admin role verification:

```typescript
// From route.ts
export const GET = authenticateRequest(async (userId, request) => {
  try {
    // Verify admin role via CustomClaims
    const auth = getAuthAdmin();
    const user = await auth.getUser(userId);
    
    const customClaims = user.customClaims || {};
    if (!customClaims.role || customClaims.role !== 'admin') {
      throw new AuthorizationError(
        'Admin access required',
        ErrorCodes.ADMIN_ROLE_REQUIRED
      );
    }
    
    // Proceed with authorized request...
    const result = await getJobsites(parseQueryParams(request));
    
    return NextResponse.json({
      success: true,
      message: 'Jobsites retrieved successfully',
      jobsites: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.limit,
        totalPages: result.totalPages
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve jobsites');
  }
});
```

## Validation

Request validation is handled using centralized Zod schemas:

```typescript
// From jobsiteSchemas.ts
import { z } from 'zod';

export const jobsiteBaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(5, 'ZIP code is required'),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  notes: z.string().optional(),
});

export const createJobsiteSchema = jobsiteBaseSchema;
export const updateJobsiteSchema = jobsiteBaseSchema.partial();
export const filterJobsiteSchema = z.object({
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  sortField: z.string().optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

export const batchOperationSchema = z.object({
  operations: z.array(z.object({
    id: z.string(),
    operation: z.enum(['update', 'delete', 'archive']),
    data: z.record(z.any()).optional()
  })).min(1).max(100)
});
```

## Response Format

All API responses follow a standardized format:

```typescript
// Success Response
{
  success: true,
  message: string,  // Human-readable success message
  [resourceName]: object | array,  // e.g., "jobsite" or "jobsites"
  pagination?: {  // For paginated responses
    total: number,
    page: number,
    pageSize: number,
    totalPages: number
  },
  timestamp: string  // ISO date string
}

// Error Response
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

## API Implementation

### GET /api/admin/jobsites

Fetches jobsites with filtering, sorting, and pagination:

```typescript
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
    
    // Parse and validate query parameters
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
    const validationResult = filterJobsiteSchema.safeParse(filterParams);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid filter parameters',
        ErrorCodes.VALIDATION_FAILED,
        400,
        validationResult.error.format()
      );
    }
    
    // Call helper to fetch data
    const result = await getJobsites(validationResult.data);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Jobsites retrieved successfully',
      jobsites: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        pageSize: result.limit,
        totalPages: result.totalPages
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to retrieve jobsites');
  }
});
```

### POST /api/admin/jobsites

Creates a new jobsite:

```typescript
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
    const validationResult = createJobsiteSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid jobsite data',
        ErrorCodes.VALIDATION_FAILED,
        400,
        validationResult.error.format()
      );
    }
    
    // Create jobsite using helper
    const jobsite = await createJobsite(userId, validationResult.data);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Jobsite created successfully',
      jobsite,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'Failed to create jobsite');
  }
});
```

### PUT /api/admin/jobsites/[id]

Updates an existing jobsite:

```typescript
export const PUT = authenticateRequest(async (userId, request, { params }) => {
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
    
    // Get ID from params
    const { id } = params;
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateJobsiteSchema.safeParse(body);
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid jobsite data',
        ErrorCodes.VALIDATION_FAILED,
        400,
        validationResult.error.format()
      );
    }
    
    // Update jobsite using helper
    const jobsite = await updateJobsite(userId, id, validationResult.data);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Jobsite updated successfully',
      jobsite,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to update jobsite');
  }
});
```

### DELETE /api/admin/jobsites/[id]

Deletes a jobsite:

```typescript
export const DELETE = authenticateRequest(async (userId, request, { params }) => {
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
    
    // Get ID from params
    const { id } = params;
    
    // Delete jobsite using helper
    await deleteJobsite(userId, id);
    
    // Return standardized response
    return NextResponse.json({
      success: true,
      message: 'Jobsite deleted successfully',
      id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete jobsite');
  }
});
```

### POST /api/admin/jobsites/batch

Handles batch operations on jobsites:

```typescript
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

## Helper Implementation

Business logic is separated into helper functions:

```typescript
// From helpers.ts
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { NotFoundError, ValidationError } from '@/lib/errors/error-types';
import { ErrorCodes } from '@/lib/errors/error-codes';
import type { 
  Jobsite, 
  JobsiteFilter, 
  CreateJobsiteData, 
  UpdateJobsiteData,
  BatchOperation
} from '@/types/jobsite';
import { serverTimestamp, query, where, orderBy, limit, startAfter } from 'firebase/firestore';

/**
 * Fetch jobsites with filtering and pagination
 */
export async function getJobsites(
  filterParams: JobsiteFilter
): Promise<{
  items: Jobsite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  const db = getFirestoreAdmin();
  const jobsitesRef = db.collection('jobsites');
  
  // Build query based on filter params
  let queryRef = jobsitesRef;
  
  if (filterParams.status) {
    queryRef = queryRef.where('status', '==', filterParams.status);
  }
  
  if (filterParams.search) {
    // Note: This is a simplified search - in production use Firestore search or a search service
    queryRef = queryRef.where('name', '>=', filterParams.search)
      .where('name', '<=', filterParams.search + '\uf8ff');
  }
  
  // Get total count (simplified - production would use a more efficient approach)
  const countSnapshot = await queryRef.count().get();
  const total = countSnapshot.data().count;
  
  // Apply sorting
  const sortField = filterParams.sortField || 'name';
  const sortDirection = filterParams.sortDirection || 'asc';
  queryRef = queryRef.orderBy(sortField, sortDirection);
  
  // Apply pagination
  const page = filterParams.page || 1;
  const pageSize = filterParams.limit || 20;
  const offset = (page - 1) * pageSize;
  
  // For pagination, use limit and startAfter
  if (offset > 0) {
    const paginationSnapshot = await queryRef.limit(offset).get();
    const lastDoc = paginationSnapshot.docs[paginationSnapshot.docs.length - 1];
    queryRef = queryRef.startAfter(lastDoc);
  }
  
  queryRef = queryRef.limit(pageSize);
  
  // Execute query
  const snapshot = await queryRef.get();
  
  const jobsites = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString(),
    updatedAt: doc.data().updatedAt?.toDate().toISOString()
  })) as Jobsite[];
  
  return {
    items: jobsites,
    total,
    page,
    limit: pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}

/**
 * Create a new jobsite
 */
export async function createJobsite(
  userId: string, 
  data: CreateJobsiteData
): Promise<Jobsite> {
  const db = getFirestoreAdmin();
  
  const jobsiteData = {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await db.collection('jobsites').add(jobsiteData);
  
  // Get the created document
  const doc = await docRef.get();
  
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data()?.createdAt?.toDate().toISOString(),
    updatedAt: doc.data()?.updatedAt?.toDate().toISOString()
  } as Jobsite;
}

/**
 * Update an existing jobsite
 */
export async function updateJobsite(
  userId: string, 
  id: string, 
  data: UpdateJobsiteData
): Promise<Jobsite> {
  const db = getFirestoreAdmin();
  const docRef = db.collection('jobsites').doc(id);
  
  // Verify jobsite exists
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new NotFoundError(
      `Jobsite with ID ${id} not found`,
      ErrorCodes.RESOURCE_NOT_FOUND
    );
  }
  
  // Update the document
  const updateData = {
    ...data,
    updatedBy: userId,
    updatedAt: serverTimestamp()
  };
  
  await docRef.update(updateData);
  
  // Get the updated document
  const updatedDoc = await docRef.get();
  
  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
    createdAt: updatedDoc.data()?.createdAt?.toDate().toISOString(),
    updatedAt: updatedDoc.data()?.updatedAt?.toDate().toISOString()
  } as Jobsite;
}

/**
 * Delete a jobsite
 */
export async function deleteJobsite(
  userId: string, 
  id: string
): Promise<void> {
  const db = getFirestoreAdmin();
  const docRef = db.collection('jobsites').doc(id);
  
  // Verify jobsite exists
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new NotFoundError(
      `Jobsite with ID ${id} not found`,
      ErrorCodes.RESOURCE_NOT_FOUND
    );
  }
  
  // Check if jobsite is in use by any tickets
  const ticketsRef = db.collection('tickets');
  const ticketsSnapshot = await ticketsRef.where('jobsiteId', '==', id).limit(1).get();
  
  if (!ticketsSnapshot.empty) {
    throw new ValidationError(
      'Cannot delete jobsite that is referenced by existing tickets',
      ErrorCodes.RESOURCE_IN_USE,
      400
    );
  }
  
  // Delete the document
  await docRef.delete();
}

/**
 * Process batch operations on jobsites
 */
export async function processBatchOperations(
  userId: string,
  operations: BatchOperation[]
): Promise<{ 
  success: { id: string; operation: string }[];
  errors: { id: string; operation: string; error: string }[];
}> {
  const db = getFirestoreAdmin();
  const batch = db.batch();
  
  const results = {
    success: [] as { id: string; operation: string }[],
    errors: [] as { id: string; operation: string; error: string }[]
  };
  
  // Process each operation
  for (const op of operations) {
    try {
      const { id, operation, data } = op;
      const docRef = db.collection('jobsites').doc(id);
      
      // Check if document exists
      const doc = await docRef.get();
      if (!doc.exists) {
        results.errors.push({
          id,
          operation,
          error: `Jobsite with ID ${id} not found`
        });
        continue;
      }
      
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
          
          batch.update(docRef, {
            ...data,
            updatedBy: userId,
            updatedAt: serverTimestamp()
          });
          break;
          
        case 'delete':
          // Check if jobsite is in use
          const ticketsRef = db.collection('tickets');
          const ticketsSnapshot = await ticketsRef.where('jobsiteId', '==', id).limit(1).get();
          
          if (!ticketsSnapshot.empty) {
            results.errors.push({
              id,
              operation,
              error: 'Cannot delete jobsite that is referenced by existing tickets'
            });
            continue;
          }
          
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
  
  // Commit the batch if there are any successful operations
  if (results.success.length > 0) {
    await batch.commit();
  }
  
  return results;
}
```

## Client-Side Integration

Integration with TanStack Query for client-side data fetching:

```typescript
// From jobsiteApi.ts
export const ENDPOINTS = {
  JOBSITES: '/api/admin/jobsites',
  JOBSITE_DETAIL: (id: string) => `/api/admin/jobsites/${id}`,
  JOBSITES_BATCH: '/api/admin/jobsites/batch',
};

export async function getJobsites(filters: JobsiteFilterParams = {}): Promise<ApiResponse<JobsitesResponse>> {
  return apiRequest<JobsitesResponse>(ENDPOINTS.JOBSITES, {
    params: filters,
  });
}

export async function getJobsiteById(id: string): Promise<ApiResponse<JobsiteResponse>> {
  return apiRequest<JobsiteResponse>(ENDPOINTS.JOBSITE_DETAIL(id));
}

export async function createJobsite(data: CreateJobsiteData): Promise<ApiResponse<JobsiteResponse>> {
  return apiRequest<JobsiteResponse>(ENDPOINTS.JOBSITES, {
    method: 'POST',
    data,
  });
}

export async function updateJobsite(id: string, data: UpdateJobsiteData): Promise<ApiResponse<JobsiteResponse>> {
  return apiRequest<JobsiteResponse>(ENDPOINTS.JOBSITE_DETAIL(id), {
    method: 'PUT',
    data,
  });
}

export async function deleteJobsite(id: string): Promise<ApiResponse<{ id: string }>> {
  return apiRequest<{ id: string }>(ENDPOINTS.JOBSITE_DETAIL(id), {
    method: 'DELETE',
  });
}

export async function batchUpdateJobsites(operations: BatchOperation[]): Promise<ApiResponse<BatchOperationResult>> {
  return apiRequest<BatchOperationResult>(ENDPOINTS.JOBSITES_BATCH, {
    method: 'POST',
    data: { operations },
  });
}

// Response Types
interface JobsitesResponse {
  jobsites: Jobsite[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

interface JobsiteResponse {
  jobsite: Jobsite;
}

interface BatchOperationResult {
  results: {
    success: { id: string; operation: string }[];
    errors: { id: string; operation: string; error: string }[];
  };
}
```

## Query Hooks

```typescript
// From useJobsiteQueries.ts
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
```

## Mutation Hooks

```typescript
// From useJobsiteMutations.ts
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
  
  const useUpdateJobsite = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: UpdateJobsiteData }) => 
        updateJobsite(id, data),
      ...createMutationOptions(toast, {
        loading: 'Updating jobsite...',
        success: 'Jobsite updated successfully!',
        error: 'Failed to update jobsite',
        operationName: 'updateJobsite',
        onSuccessCallback: (_, variables) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.jobsites.lists() });
          queryClient.invalidateQueries({ queryKey: queryKeys.jobsites.detail(variables.id) });
        },
      }),
    });
  };
  
  const useDeleteJobsite = () => {
    return useMutation({
      mutationFn: deleteJobsite,
      ...createMutationOptions(toast, {
        loading: 'Deleting jobsite...',
        success: 'Jobsite deleted successfully!',
        error: 'Failed to delete jobsite',
        operationName: 'deleteJobsite',
        onSuccessCallback: (_, id) => {
          queryClient.invalidateQueries({ queryKey: queryKeys.jobsites.lists() });
          queryClient.removeQueries({ queryKey: queryKeys.jobsites.detail(id) });
        },
      }),
    });
  };
  
  const useBatchUpdateJobsites = () => {
    return useMutation({
      mutationFn: batchUpdateJobsites,
      ...createMutationOptions(toast, {
        loading: 'Processing jobsite operations...',
        success: 'Jobsite operations completed successfully!',
        error: 'Failed to process jobsite operations',
        operationName: 'batchUpdateJobsites',
        onSuccessCallback: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.jobsites.lists() });
        },
      }),
    });
  };
  
  return {
    useCreateJobsite,
    useUpdateJobsite,
    useDeleteJobsite,
    useBatchUpdateJobsites,
  };
}
