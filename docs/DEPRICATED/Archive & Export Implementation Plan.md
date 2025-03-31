# Simple Tracker Archive & Export Implementation Plan

This document outlines the implementation plan for archive and export functionality in Simple Tracker, including the current implementation status and established patterns.

## Implementation Status

### Archive Functionality
✅ Implemented with dynamic route handlers and helper modules.
- `/api/admin/archive/[action]/route.ts` - Dynamic route handler supporting search, restore, and image operations
- Separate helper modules for different operations (search, restore, images)
- Zod validation schemas implemented in `/lib/schemas/archiveSchemas.ts`

### Export Functionality
✅ Implemented with a unified approach to different data formats.
- `/api/admin/export/[type]/route.ts` - Dynamic route handler for different export types (tickets, workdays)
- Separate helper modules for ticket and workday exports
- Shared utilities for format generation in `/lib/utils/exportUtils.ts`
- Zod validation schemas implemented in `/lib/schemas/exportSchemas.ts`

## Architecture Overview

### Archive Architecture

1. **API Structure**
   - Dynamic route handler with action parameter (`/api/admin/archive/[action]/route.ts`)
   - Specialized helper modules for different operations
   - Zod schemas for request validation

2. **Action Handlers**
   - `search`: Search archived data with filtering and pagination
   - `restore`: Restore archived data back to active collections
   - `images`: Archive and manage ticket images

3. **Data Flow**
   - Authentication → Authorization → Validation → Operation → Response
   - Each operation has its own handler function for clear separation of concerns

### Export Architecture

1. **API Structure**
   - Dynamic route handler with type parameter (`/api/admin/export/[type]/route.ts`)
   - Type-specific helper modules (`tickets/exportHelpers.ts`, `workdays/exportHelpers.ts`)
   - Shared utility functions (`/lib/utils/exportUtils.ts`)
   - Zod schemas for request validation

2. **Export Types**
   - `tickets`: Export ticket data with category counts
   - `workdays`: Export workday data with optional employee/jobsite summaries

3. **Format Support**
   - CSV: Simple comma-separated format
   - Excel: Multi-sheet workbooks with formatting
   - JSON: Complete data export in JSON format

4. **Data Flow**
   - Authentication → Authorization → Validation → Data Retrieval → Format Generation → Storage Upload → Response

## Implementation Patterns

### Code Organization

1. **Route Handlers**
   - Separate route handlers from business logic
   - Use middleware for authentication and error handling
   - Validate input parameters using Zod schemas

2. **Helper Functions**
   - Domain-specific helpers organized by functionality
   - Shared utilities for common operations
   - Clear function signatures with TypeScript types

3. **Schema Definitions**
   - Centralized schemas in `/lib/schemas/`
   - Schema-derived TypeScript types
   - Common schemas for shared parameters

### Best Practices Applied

1. **Separation of Concerns**
   - Route handlers only manage requests and responses
   - Business logic encapsulated in helper functions
   - Data formatting separated from data retrieval

2. **DRY (Don't Repeat Yourself)**
   - Shared utilities for common operations
   - Consistent patterns across different domains
   - Reusable validation schemas

3. **KISS (Keep It Simple, Stupid)**
   - Clear, direct implementations
   - Consistent function signatures
   - Minimal dependencies

4. **Type Safety**
   - Comprehensive TypeScript types
   - Schema-derived types for validation
   - Consistent error handling

## Common Patterns

### Export Generation

```typescript
export async function generateExport(params) {
  // 1. Build filter parameters from export params
  const filters = mapExportParamsToFilters(params);
  
  // 2. Fetch data based on filters
  const { data } = await fetchData(filters);
  
  // 3. Generate export file based on format
  const filename = generateFilename(params);
  const storagePath = generateStoragePath(params);
  let fileBuffer = generateFileByFormat(data, params.format);
  
  // 4. Upload the file to Firebase Storage
  const url = await uploadAndGetUrl(fileBuffer, storagePath);
  
  // 5. Return export metadata
  return {
    success: true,
    url,
    filename,
    format: params.format,
    recordCount: data.length,
    generatedAt: new Date().toISOString(),
    expiresAt: calculateExpirationDate(),
    storagePath,
  };
}
```

### Archive Operations

```typescript
export async function handleArchiveAction(params) {
  // 1. Validate input parameters
  const validatedParams = validateParams(params);
  
  // 2. Perform the archive operation
  const result = await performOperation(validatedParams);
  
  // 3. Update metadata and indexes
  await updateArchiveIndexes(result);
  
  // 4. Return operation result
  return {
    success: true,
    id: result.id,
    type: validatedParams.type,
    timestamp: new Date().toISOString(),
  };
}
