/**
 * Admin API - Export Dynamic Handler
 * 
 * Dynamic route handler for export operations based on type parameter.
 * 
 * Endpoints:
 * - GET /api/admin/export/[type] - Generate an export based on query parameters
 * - POST /api/admin/export/[type] - Create a new asynchronous export task
 * 
 * Supported export types:
 * - tickets: Exports ticket data with category counts
 * - workdays: Exports workday data with optional employee/jobsite summaries
 */

import { NextResponse } from 'next/server';
// Removed incorrect auth imports
// TODO: Verify paths for exportHelpers - assuming they exist relative to 'api/admin'
import { generateTicketExport } from '../../tickets/exportHelpers';
import { generateWorkdayExport } from '../../workdays/exportHelpers';
import { getFirestoreAdmin } from '@/lib/firebase/admin'; // Import admin firestore
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { 
  getExportQuerySchema, 
  createExportSchema, 
  TicketExportParams, 
  WorkdayExportParams 
} from '@/lib/schemas/exportSchemas';
import { createSuccessResponse } from '@/lib/api/responseUtils';
import { handleApiError, withAdminRole } from '@/lib/api/middleware';
import { AuthenticatedUser } from '@/types/api'; // Import AuthenticatedUser type
import { ValidationError, ForbiddenError, ErrorCodes } from '@/lib/errors/error-types';

// GET handler for direct exports (smaller exports)
// Wrap GET handler with authentication and admin role check
export const GET = withAdminRole(async (
  request: Request,
  context: { params: { type: string } },
  user: AuthenticatedUser
) => {
  const { type } = context.params;
  
  try {
    // Authentication and admin role are already verified by withAdminRole wrapper
    // const session = await auth(); // Removed
    // ... verification logic removed ...
    
    // Extract and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      format: url.searchParams.get('format') || 'csv',
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
    };
    
    const validationResult = getExportQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid query parameters',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        { errors: validationResult.error.errors }
      );
    }
    
    const { format, startDate, endDate } = validationResult.data;
    
    // Handle different export types based on the dynamic parameter
    switch (type) {
      case 'tickets':
        return handleTicketsExport(format, startDate ?? null, endDate ?? null, user.uid);
      case 'workdays':
        return handleWorkdaysExport(format, startDate ?? null, endDate ?? null, user.uid);
      default:
        throw new ValidationError(
          `Invalid export type: ${type}`,
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400
        );
    }
  } catch (error) {
    console.error(`Error in ${type} export:`, error);
    return handleApiError(error, `Failed to export ${type}`);
  }
});

// POST handler for creating export tasks (larger exports)
// Wrap POST handler with authentication and admin role check
export const POST = withAdminRole(async (
  request: Request,
  context: { params: { type: string } },
  user: AuthenticatedUser
) => {
  const { type } = context.params;
  
  try {
    // Authentication and admin role are already verified by withAdminRole wrapper
    // const session = await auth(); // Removed
    // ... verification logic removed ...
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createExportSchema.safeParse({
      ...body,
      type, // Add type from URL params
    });
    
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid request data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        { errors: validationResult.error.errors }
      );
    }
    
    const exportParams = validationResult.data;
    
    // Create an export record in Firestore
    const db = getFirestoreAdmin();
    const exportRef = await addDoc(collection(db, 'exports'), {
      type: exportParams.type,
      format: exportParams.format,
      dateFrom: exportParams.dateFrom,
      dateTo: exportParams.dateTo,
      includeImages: exportParams.includeImages || false,
      includeNotes: exportParams.includeNotes || true,
      includeSummary: exportParams.includeSummary || false,
      jobsiteId: exportParams.jobsiteId || null,
      employeeId: exportParams.employeeId || null,
      status: 'processing',
      userId: user.uid, // Use user.uid
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });
    
    // Start the export process asynchronously
    // In a production app, this would be handled by a background job/worker
    // For now, we'll simulate this with a local async function
    processExportInBackground(exportRef.id, exportParams, user.uid); // Use user.uid
    
    return createSuccessResponse(
      'Export task created successfully',
      {
        exportId: exportRef.id,
        status: 'processing',
        type: exportParams.type
      },
      'export',
      { status: 201 }
    );
  } catch (error) {
    console.error(`Error creating ${type} export task:`, error);
    return handleApiError(error, `Failed to create export task`);
  }
});

// Tickets export handler
async function handleTicketsExport(
  format: string, 
  startDate: string | null, 
  endDate: string | null,
  userId: string
) {
  // Call the ticket export helper
  const result = await generateTicketExport({
    format: format as 'csv' | 'excel' | 'json',
    dateFrom: startDate || undefined,
    dateTo: endDate || undefined,
    includeImages: false,
  });
  
  // Create a record in the exports collection
  const db = getFirestoreAdmin(); // Get Firestore instance
  await addDoc(collection(db, 'exports'), {
    type: 'tickets',
    format,
    dateFrom: startDate,
    dateTo: endDate,
    url: result.url,
    filename: result.filename,
    recordCount: result.recordCount,
    status: 'completed',
    userId,
    createdAt: serverTimestamp(),
    expiresAt: new Date(result.expiresAt),
    storagePath: result.storagePath,
  });
  
  return createSuccessResponse(
    `Tickets exported successfully in ${format} format`,
    {
      url: result.url,
      filename: result.filename,
      recordCount: result.recordCount,
      expiresAt: result.expiresAt,
      format
    },
    'export'
  );
}

// Workdays export handler
async function handleWorkdaysExport(
  format: string, 
  startDate: string | null, 
  endDate: string | null,
  userId: string
) {
  // Call the workday export helper
  const result = await generateWorkdayExport({
    format: format as 'csv' | 'excel' | 'json',
    dateFrom: startDate || undefined,
    dateTo: endDate || undefined,
  });
  
  // Create a record in the exports collection
  const db = getFirestoreAdmin(); // Get Firestore instance
  await addDoc(collection(db, 'exports'), {
    type: 'workdays',
    format,
    dateFrom: startDate,
    dateTo: endDate,
    url: result.url,
    filename: result.filename,
    recordCount: result.recordCount,
    status: 'completed',
    userId,
    createdAt: serverTimestamp(),
    expiresAt: new Date(result.expiresAt),
    storagePath: result.storagePath,
  });
  
  return createSuccessResponse(
    `Workdays exported successfully in ${format} format`,
    {
      url: result.url,
      filename: result.filename,
      recordCount: result.recordCount,
      expiresAt: result.expiresAt,
      format
    },
    'export'
  );
}

// Helper function to process exports in background
// In a production app, this would be handled by a background worker/Cloud Function
async function processExportInBackground(
  exportId: string,
  params: typeof createExportSchema._type,
  userId: string
) {
  const { type } = params;
  
  try {
    let result;
    
    // Generate the export based on type
    if (type === 'tickets') {
      result = await generateTicketExport({
        format: params.format,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        includeImages: params.includeImages || false,
        jobsiteId: params.jobsiteId,
      });
    } else if (type === 'workdays') {
      result = await generateWorkdayExport({
        format: params.format,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        employeeId: params.employeeId,
        jobsiteId: params.jobsiteId,
      });
    } else {
      throw new Error(`Invalid export type: ${type}`);
    }
    
    // Update the export record with the result
    const db = getFirestoreAdmin();
    const exportDocRef = doc(db, 'exports', exportId);
    await updateDoc(exportDocRef, {
      status: 'completed',
      url: result.url,
      filename: result.filename,
      recordCount: result.recordCount,
      expiresAt: new Date(result.expiresAt),
      storagePath: result.storagePath,
      completedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error processing export ${exportId}:`, error);
    
    // Update the export record with the error
    const db = getFirestoreAdmin(); // Get Firestore instance
    const exportDocRef = doc(db, 'exports', exportId);
    await updateDoc(exportDocRef, {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: serverTimestamp(),
    });
  }
}
