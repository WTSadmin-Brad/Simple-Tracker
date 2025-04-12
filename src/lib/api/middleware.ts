/**
 * middleware.ts
 * API middleware functions for request validation and error handling
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyIdToken } from '../firebase/admin';
import { 
  AppError, 
  ValidationError, 
  ErrorCodes 
} from '../errors/error-types';
import { createErrorResponse } from './responseUtils';
import { AuthenticatedUser } from '@/types/api'; // Import the new type

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
        
        // Return validation errors using the utility function
        return createErrorResponse(
          'Validation failed',
          ErrorCodes.VALIDATION_INVALID_INPUT,
          400,
          formattedErrors
        );
      }
      
      // Call handler with validated data
      return handler(result.data, request);
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        console.error('JSON parsing error:', error.message);
        return createErrorResponse(
          'Invalid JSON in request body',
          ErrorCodes.VALIDATION_INVALID_FORMAT,
          400,
          error.message
        );
      }
      
      // Handle other errors
      return handleApiError(error, 'Request validation error');
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
  
  // Determine status and code based on error type
  let status = 500;
  let code = ErrorCodes.UNKNOWN_ERROR;
  let details: any = undefined;
  let message = customMessage || 'An unknown error occurred';
  
  // Extract error information based on error type
  if (error instanceof AppError) {
    status = error.status || 500;
    code = error.code;
    details = error.details;
    message = customMessage || error.message;
  } else if (error instanceof Error) {
    // Handle standard Error objects
    if (error.name === 'ValidationError' || error.name === 'BadRequestError') {
      status = 400;
      code = ErrorCodes.VALIDATION_INVALID_INPUT;
    }
    message = customMessage || error.message;
  }
  
  // Include details in development but not production
  if (process.env.NODE_ENV !== 'development') {
    details = undefined;
  }
  
  // Return standardized error response using the utility function
  return createErrorResponse(message, code, status, details);
}

/**
 * Authenticates a request using Firebase Auth
 * Extracts the token from the Authorization header and verifies it
 * 
 * @param handler Request handler function to call if authentication passes
 * @returns A handler function that includes authentication
 */
// Renaming for clarity and updated signature
export function withAuthentication<T>(
  // Handler now receives the full AuthenticatedUser object
  handler: (request: Request, user: AuthenticatedUser) => Promise<NextResponse<T>>
) {
  return async (request: Request) => {
    try {
      // Get auth token from header
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return createErrorResponse(
          'Authentication required',
          ErrorCodes.AUTH_INVALID_TOKEN,
          401
        );
      }
      
      const token = authHeader.split('Bearer ')[1];
      
      try {
        // Verify token using the updated function (checks revocation)
        const decodedToken = await verifyIdToken(token);
        
        // Extract UID and Role from verified claims
        const uid = decodedToken.uid;
        // Roles are typically stored in custom claims. Adjust if stored differently.
        const role = decodedToken.role || 'employee'; // Default to 'employee' if role claim is missing

        if (!uid) {
           console.error('Auth error: UID missing from decoded token', decodedToken);
           return createErrorResponse('Invalid authentication token: Missing user identifier.', ErrorCodes.AUTH_INVALID_TOKEN, 401);
        }

        // Construct the AuthenticatedUser object
        const user: AuthenticatedUser = {
          uid,
          role
        };

        
        // Call the original handler with the request and the authenticated user context
        return handler(request, user);

      } catch (error: any) {
        // Log the specific error from verifyIdToken
        console.error('Authentication error during token verification:', error.message || error);
        // Use the error message from verifyIdToken which might be more specific (e.g., revoked, expired)
        return createErrorResponse(
          error.message || 'Invalid authentication token',
          ErrorCodes.AUTH_INVALID_TOKEN, // Keep generic code for client handling simplicity? Or map specific codes?
          401
        );
      }
    } catch (error) {
      // Handle other errors
      return handleApiError(error, 'Authentication failed');
    }
  };
}
/**
 * Authenticates a request and ensures the user has the 'admin' role.
 * Uses withAuthentication internally.
 *
 * @param handler Request handler function to call if authentication and authorization pass
 * @returns A handler function that includes authentication and admin role check
 */
export function withAdminRole<T>(
  handler: (request: Request, user: AuthenticatedUser) => Promise<NextResponse<T>>
) {
  return withAuthentication(async (request, user) => {
    // Check for admin role from the verified user context
    if (user.role !== 'admin') {
      console.warn(`Forbidden access attempt: User ${user.uid} with role ${user.role} tried to access admin route.`);
      return createErrorResponse(
        'Forbidden: Admin role required',
        ErrorCodes.AUTH_FORBIDDEN,
        403
      );
    }
    // If role is admin, proceed with the original handler
    return handler(request, user);
  });
}
