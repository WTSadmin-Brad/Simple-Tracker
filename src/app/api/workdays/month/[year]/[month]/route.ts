/**
 * Workdays Month API
 * GET /api/workdays/month/[year]/[month] - Get workdays for a specific month
 */

import { NextResponse } from 'next/server';
import { handleApiError, authenticateRequest } from '@/lib/api/middleware';
import workdayService from '@/lib/services/workdayService';
import { ValidationError, ErrorCodes } from '@/lib/errors';

export const GET = authenticateRequest(async (
  userId,
  request,
  { params }: { params: { year: string; month: string } }
) => {
  try {
    // Get year and month from route params
    const { year, month } = params;
    
    // Validate year and month parameters
    if (!year || !month) {
      throw new ValidationError(
        'Year and month are required',
        ErrorCodes.VALIDATION_ERROR,
        400
      );
    }
    
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    
    // Validate year and month values
    if (
      isNaN(yearNum) || 
      isNaN(monthNum) || 
      monthNum < 1 || 
      monthNum > 12 || 
      yearNum < 2000 || 
      yearNum > 2100
    ) {
      throw new ValidationError(
        'Invalid year or month values',
        ErrorCodes.VALIDATION_ERROR,
        400
      );
    }
    
    // Get workdays for the specified month
    const workdays = await workdayService.fetchWorkdaysForMonth(yearNum, monthNum, userId);
    
    return NextResponse.json({
      success: true,
      workdays,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to fetch workdays for month');
  }
});
