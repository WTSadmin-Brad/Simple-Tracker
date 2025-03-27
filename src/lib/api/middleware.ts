/**
 * middleware.ts
 * API middleware functions for request validation and error handling
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyIdToken } from '../firebase/admin';
import { ValidationError } from '../../types/errors';
import { ErrorCodes } from '../../types/errorCodes';

/**
 * Validates request body against a Zod schema
 * @param schema Zod schema to validate against
 * @param handler Request handler function to call if validation passes
 */
export function validateRequest<T>(
  schema: z.ZodType<T>,
  handler: (data: T, request: Request) => Promise<NextResponse>
) {
  return async (request: Request) => {
    try {
      // Parse request body as JSON
      const body = await request.json();
      
      // Validate body against schema
      const result = schema.safeParse(body);
      
      if (!result.success) {
        // Format validation errors for better readability
        const formattedErrors = formatZodErrors(result.error);
        
        // Log validation errors
        console.warn('Validation failed:', formattedErrors);
        
        // Return validation errors
        return NextResponse.json(
          {
            success: false,
            message: 'Validation failed',
            errors: formattedErrors
          },
          { status: 400 }
        );
      }
      
      // Call handler with validated data
      return handler(result.data, request);
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        console.error('JSON parsing error:', error.message);
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid JSON in request body',
            detail: error.message
          },
          { status: 400 }
        );
      }
      
      // Handle other errors
      console.error('Request validation error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'An error occurred while processing your request',
          error: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Formats Zod validation errors into a more readable structure
 * @param error Zod validation error
 */
function formatZodErrors(error: z.ZodError) {
  const formattedErrors: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(issue.message);
  }
  
  return formattedErrors;
}

/**
 * Error handler for API routes
 * @param error Error object
 * @param customMessage Optional custom error message
 */
export function handleApiError(error: unknown, customMessage?: string): NextResponse {
  // Log detailed error information
  console.error('API Error:', {
    message: customMessage || 'Unknown error',
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : String(error)
  });
  
  // Determine appropriate error message
  const message = customMessage || 'An error occurred while processing your request';
  
  // Determine if this is a client error (4xx) or server error (5xx)
  const isClientError = error instanceof Error && 
    (error.name === 'ValidationError' || error.name === 'BadRequestError');
  
  // Return error response
  return NextResponse.json(
    {
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error))
        : undefined
    },
    { status: isClientError ? 400 : 500 }
  );
}

/**
 * Authenticates a request using Firebase Auth
 * Extracts the token from the Authorization header and verifies it
 * 
 * @param handler Request handler function to call if authentication passes
 * @returns A handler function that includes authentication
 */
export function authenticateRequest<T>(
  handler: (userId: string, request: Request) => Promise<NextResponse<T>>
) {
  return async (request: Request) => {
    try {
      // Get auth token from header
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          {
            success: false,
            message: 'Authentication required',
            error: {
              code: ErrorCodes.AUTH_REQUIRED
            }
          },
          { status: 401 }
        );
      }
      
      const token = authHeader.split('Bearer ')[1];
      
      try {
        // Verify token and get user ID
        const decodedToken = await verifyIdToken(token);
        const userId = decodedToken.uid;
        
        // Call handler with validated userId
        return handler(userId, request);
      } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid authentication token',
            error: {
              code: ErrorCodes.AUTH_INVALID_TOKEN
            }
          },
          { status: 401 }
        );
      }
    } catch (error) {
      // Handle other errors
      return handleApiError(error, 'Authentication failed');
    }
  };
}
