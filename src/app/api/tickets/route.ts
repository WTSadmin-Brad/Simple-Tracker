/**
 * Tickets API - Main tickets endpoint
 * GET /api/tickets - Get all tickets (with filtering options)
 * POST /api/tickets - Create a new ticket directly (bypassing wizard)
 */

import { NextResponse } from 'next/server';
import { handleApiError, withAuthentication } from '@/lib/api/middleware'; // Changed import
import { AuthenticatedUser } from '@/types/api'; // Import AuthenticatedUser
import { createSuccessResponse, createPaginatedResponse } from '@/lib/api/responseUtils';
import ticketService from '@/lib/services/ticketService';
import { z } from 'zod';
import { ValidationError, ErrorCodes } from '@/lib/errors/error-types';

/**
 * Schema for filtering tickets in GET requests
 */
const getTicketsSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  jobsite: z.string().optional(),
  truck: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  sortField: z.string().optional(), // Will validate if it's keyof Ticket later
  sortDirection: z.enum(['asc', 'desc']).optional(),
});

/**
 * Schema for creating a ticket directly (bypassing wizard)
 */
const createTicketSchema = z.object({
  date: z.string({
    required_error: "Date is required"
  }),
  truckNumber: z.string({
    required_error: "Truck number is required"
  }),
  truckNickname: z.string({ // Make required to match CreateTicketData
    required_error: "Truck nickname is required"
  }),
  jobsite: z.string({
    required_error: "Jobsite is required"
  }),
  jobsiteName: z.string({ // Make required to match CreateTicketData
    required_error: "Jobsite name is required"
  }),
  categories: z.object({
    hangers: z.number().int().min(0),
    leaner6To12: z.number().int().min(0),
    leaner13To24: z.number().int().min(0),
    leaner25To36: z.number().int().min(0),
    leaner37To48: z.number().int().min(0),
    leaner49Plus: z.number().int().min(0),
  }),
  images: z.array(z.instanceof(File)), // Expect an array of File objects, make non-optional
});

/**
 * GET handler for retrieving tickets with filtering
 * 
 * @route GET /api/tickets
 * @authentication Required
 */
// Updated to use withAuthentication and new handler signature
export const GET = withAuthentication(async (
  request: Request,
  user: AuthenticatedUser // Use AuthenticatedUser context
) => {
  try {
    // Pass user context (specifically user.uid) to the handler logic
    return await handleGetTickets(user, request);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch tickets');
  }
});

/**
 * POST handler for creating a new ticket directly
 * 
 * @route POST /api/tickets
 * @authentication Required
 */
// Updated to use withAuthentication and new handler signature
export const POST = withAuthentication(async (
  request: Request,
  user: AuthenticatedUser // Use AuthenticatedUser context
) => {
  try {
    // Pass user context (specifically user.uid) to the handler logic
    return await handleCreateTicket(user, request);
  } catch (error) {
    return handleApiError(error, 'Failed to create ticket');
  }
});

/**
 * Handle GET request for tickets with filtering
 * @param user - The authenticated user context
 * @param request - The HTTP request
 * @returns Response with tickets data
 */
async function handleGetTickets(user: AuthenticatedUser, request: Request) { // Updated signature
  // Parse URL parameters for filtering
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  
  try {
    // Parse and validate filter parameters
    const filters = getTicketsSchema.parse({
      ...params,
      page: params.page ? parseInt(params.page) : undefined,
      limit: params.limit ? parseInt(params.limit) : undefined,
    });
    
    const page = filters.page || 1;
    const pageSize = filters.limit || 20;
    
    // Validate sortField before passing to service
    const validSortFields: (keyof import('@/lib/services/ticketService').Ticket)[] = [
      'id', 'userId', 'date', 'truckNumber', 'truckNickname', 'jobsite', 'jobsiteName',
      'hangers', 'leaner6To12', 'leaner13To24', 'leaner25To36', 'leaner37To48',
      'leaner49Plus', 'total', 'imageCount', 'submissionDate', 'archiveStatus', 'archiveDate'
    ];
    
    let validatedSortField: keyof import('@/lib/services/ticketService').Ticket | undefined = undefined;
    if (filters.sortField && validSortFields.includes(filters.sortField as any)) {
      validatedSortField = filters.sortField as keyof import('@/lib/services/ticketService').Ticket;
    }

    // Get tickets with filtering from ticket service
    const result = await ticketService.getTickets({
      ...filters,
      sortField: validatedSortField, // Pass validated sortField
    });
    
    // Calculate total pages
    const totalPages = Math.ceil((result.total || 0) / pageSize); // Use 'total'
    
    // Return paginated response using utility function
    return createPaginatedResponse(
      'Tickets retrieved successfully',
      result.tickets, // No need for || [] if service guarantees array
      'tickets',
      {
        page: page,
        pageSize: pageSize,
        totalItems: result.total || 0, // Corrected property name
        totalPages: totalPages
      }
    );
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid filter parameters',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        validationError.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          code: 'invalid_parameter'
        }))
      );
    }
    throw validationError;
  }
}

/**
 * Handle POST request for creating a ticket
 * @param user - The authenticated user context
 * @param request - The HTTP request
 * @returns Response with created ticket data
 */
async function handleCreateTicket(user: AuthenticatedUser, request: Request) { // Updated signature
  // Parse and validate request body
  const body = await request.json();
  
  try {
    const data = createTicketSchema.parse(body);
    
    // Create ticket with validated data
    // Pass userId and data as separate arguments to createTicket
    const ticket = await ticketService.createTicket(user.uid, {
      ...data,
      // createdAt, updatedAt, status, imageCount are likely handled within the service now
      // Ensure CreateTicketData in service matches expected fields from 'data'
    });
    
    // Ensure id is consistent
    const ticketWithId = {
      ...ticket,
      id: ticket.id // Use only 'id' property from Ticket type
    };
    
    // Return success response using utility function
    return createSuccessResponse(
      'Ticket created successfully',
      ticketWithId,
      'ticket',
      { status: 201 }
    );
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      throw new ValidationError(
        'Invalid ticket data',
        ErrorCodes.VALIDATION_INVALID_INPUT,
        400,
        validationError.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message,
          field: err.path.join('.'),
          code: 'invalid_field'
        }))
      );
    }
    throw validationError;
  }
}
