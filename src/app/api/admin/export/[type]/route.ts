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
import { auth } from '@/lib/auth/auth';
import { verifyAdminRole } from '@/lib/auth/verify-admin';
import { generateTicketExport } from '../tickets/exportHelpers';
import { generateWorkdayExport } from '../workdays/exportHelpers';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { 
  getExportQuerySchema, 
  createExportSchema, 
  TicketExportParams, 
  WorkdayExportParams 
} from '@/lib/schemas/exportSchemas';

// GET handler for direct exports (smaller exports)
export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify admin role
    const isAdmin = await verifyAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    // Extract and validate query parameters
    const url = new URL(request.url);
    const queryParams = {
      format: url.searchParams.get('format') || 'csv',
      startDate: url.searchParams.get('startDate'),
      endDate: url.searchParams.get('endDate'),
    };
    
    const validationResult = getExportQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid query parameters',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    
    const { format, startDate, endDate } = validationResult.data;
    
    // Handle different export types based on the dynamic parameter
    switch (type) {
      case 'tickets':
        return handleTicketsExport(format, startDate, endDate, session.user.id);
      case 'workdays':
        return handleWorkdaysExport(format, startDate, endDate, session.user.id);
      default:
        return NextResponse.json(
          { success: false, message: `Invalid export type: ${type}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error(`Error in ${type} export:`, error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Failed to export ${type}`
      },
      { status: 500 }
    );
  }
}

// POST handler for creating export tasks (larger exports)
export async function POST(
  request: Request,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  
  try {
    // Authenticate user
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify admin role
    const isAdmin = await verifyAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    
    // Parse and validate request body
    const body = await request.json();
    const validationResult = createExportSchema.safeParse({
      ...body,
      type, // Add type from URL params
    });
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid request data',
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }
    
    const exportParams = validationResult.data;
    
    // Create an export record in Firestore
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
      userId: session.user.id,
      createdAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });
    
    // Start the export process asynchronously
    // In a production app, this would be handled by a background job/worker
    // For now, we'll simulate this with a local async function
    processExportInBackground(exportRef.id, exportParams, session.user.id);
    
    return NextResponse.json({ 
      success: true, 
      message: `Export task created successfully`,
      exportId: exportRef.id,
    });
  } catch (error) {
    console.error(`Error creating ${type} export task:`, error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Failed to create export task`
      },
      { status: 500 }
    );
  }
}

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
  
  return NextResponse.json({ 
    success: true,
    message: `Tickets exported successfully in ${format} format`,
    ...result,
  });
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
  
  return NextResponse.json({ 
    success: true,
    message: `Workdays exported successfully in ${format} format`,
    ...result,
  });
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
    const exportDocRef = doc(db, 'exports', exportId);
    await updateDoc(exportDocRef, {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      updatedAt: serverTimestamp(),
    });
  }
}
