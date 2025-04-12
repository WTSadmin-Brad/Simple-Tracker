/**
 * API Response Utilities
 * 
 * Standardized functions for creating consistent API responses
 */

import { NextResponse } from 'next/server';
import { PaginationMeta } from '@/types/api';
import { ErrorCodes } from '../errors/error-types';

/**
 * Creates a standardized success response
 * 
 * @param message Human-readable success message
 * @param data Response data
 * @param resourceName Resource-specific property name
 * @param options Additional options (status code)
 * @returns NextResponse with standardized format
 */
export function createSuccessResponse<T>(
  message: string,
  data: T,
  resourceName: string,
  options?: { status?: number }
): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    [resourceName]: data,
    timestamp: new Date().toISOString()
  }, { status: options?.status || 200 });
}

/**
 * Creates a standardized paginated response
 * 
 * @param message Human-readable success message
 * @param items Array of items
 * @param resourceName Resource-specific property name (plural)
 * @param pagination Pagination metadata
 * @param options Additional options (status code)
 * @returns NextResponse with standardized format
 */
export function createPaginatedResponse<T>(
  message: string,
  items: T[],
  resourceName: string,
  pagination: PaginationMeta,
  options?: { status?: number }
): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    [resourceName]: items,
    pagination,
    timestamp: new Date().toISOString()
  }, { status: options?.status || 200 });
}

/**
 * Creates a wizard step response
 * 
 * @param message Human-readable success message
 * @param step Step number
 * @param data Step-specific data
 * @param options Additional options (status code)
 * @returns NextResponse with standardized format
 */
export function createWizardStepResponse<T extends Record<string, any>>(
  message: string,
  step: number,
  data: T,
  options?: { status?: number }
): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    step,
    ...data,
    timestamp: new Date().toISOString()
  }, { status: options?.status || 200 });
}

/**
 * Creates a standardized error response
 * 
 * @param message Human-readable error message
 * @param code Error code from ErrorCodes enum
 * @param status HTTP status code
 * @param details Optional additional error details
 * @returns NextResponse with standardized error format
 */
export function createErrorResponse(
  message: string,
  code: string = ErrorCodes.UNKNOWN_ERROR,
  status: number = 500,
  details?: any
): NextResponse {
  return NextResponse.json({
    success: false,
    message,
    error: {
      code,
      status,
      details
    },
    timestamp: new Date().toISOString()
  }, { status });
}
