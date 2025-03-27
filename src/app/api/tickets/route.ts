/**
 * Tickets API - Main tickets endpoint
 * GET /api/tickets - Get all tickets (with filtering options)
 * POST /api/tickets - Create a new ticket directly (bypassing wizard)
 */

import { NextResponse } from 'next/server';
import { handleApiError, authenticateRequest } from '@/lib/api/middleware';
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
  sortField: z.string().optional(),
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
  truckNickname: z.string().optional(),
  jobsite: z.string({
    required_error: "Jobsite is required"
  }),
  jobsiteName: z.string().optional(),
  categories: z.object({
    hangers: z.number().int().min(0),
    leaner6To12: z.number().int().min(0),
    leaner13To24: z.number().int().min(0),
    leaner25To36: z.number().int().min(0),
    leaner37To48: z.number().int().min(0),
    leaner49Plus: z.number().int().min(0),
  }),
  images: z.array(z.any()).optional(),
});

/**
 * GET handler for retrieving tickets with filtering
 * 
 * @route GET /api/tickets
 * @authentication Required
 */
export const GET = authenticateRequest(async (
  userId, 
  request: Request
) => {
  try {
    return await handleGetTickets(userId, request);
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
export const POST = authenticateRequest(async (
  userId, 
  request: Request
) => {
  try {
    return await handleCreateTicket(userId, request);
  } catch (error) {
    return handleApiError(error, 'Failed to create ticket');
  }
});

/**
 * Handle GET request for tickets with filtering
 * @param userId - The authenticated user ID
 * @param request - The HTTP request
 * @returns Response with tickets data
 */
async function handleGetTickets(userId: string, request: Request) {
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
    
    // Get tickets with filtering from ticket service
    const result = await ticketService.getTickets({
      ...filters,
      // Include user ID to filter by user
      userId,
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Tickets retrieved successfully',
      count: result.tickets?.length || 0,
      totalCount: result.totalCount,
      page: filters.page || 1,
      limit: filters.limit || 20,
      tickets: result.tickets || []
    });
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
 * @param userId - The authenticated user ID
 * @param request - The HTTP request
 * @returns Response with created ticket data
 */
async function handleCreateTicket(userId: string, request: Request) {
  // Parse and validate request body
  const body = await request.json();
  
  try {
    const data = createTicketSchema.parse(body);
    
    // Create ticket with validated data
    const ticket = await ticketService.createTicket({
      ...data,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'submitted',
      imageCount: data.images ? data.images.length : 0,
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'Ticket created successfully',
      id: ticket.id || ticket.ticketId,
      ticket: {
        ...ticket,
        id: ticket.id || ticket.ticketId
      }
    });
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
