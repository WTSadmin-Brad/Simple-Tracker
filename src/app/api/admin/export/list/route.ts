/**
 * Admin API - Export List Handler
 * GET /api/admin/export/list - Get a list of available exports
 */

import { NextResponse } from 'next/server';
// Removed old auth imports
import { getFirestoreAdmin, verifyIdToken } from '@/lib/firebase/admin'; // Corrected Firebase admin import + verifyIdToken
import { collection, query, where, orderBy, getDocs, limit } from 'firebase-admin/firestore'; // Use admin SDK for Firestore functions
import { exportItemSchema } from '@/lib/schemas/exportSchemas';
import { createSuccessResponse } from '@/lib/api/responseUtils';
import { handleApiError } from '@/lib/api/middleware'; // Keep handleApiError
import { AuthError } from '@/lib/errors/error-types'; // Import AuthError
import { ValidationError, ForbiddenError, ErrorCodes } from '@/lib/errors/error-types';

export async function GET(request: Request) {
  try {
    // Authenticate user and verify admin role using verifyIdToken
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthError('Authentication required', ErrorCodes.AUTH_INVALID_TOKEN, 401);
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyIdToken(token); // Throws on invalid/expired token

    // Check for admin role
    if (decodedToken.role !== 'admin') {
      throw new ForbiddenError('Admin access required', ErrorCodes.AUTH_FORBIDDEN, 403);
    }
    
    // Use decodedToken.uid instead of session.user.id
    const userId = decodedToken.uid;
    
    // Extract query parameters
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const maxResults = limitParam ? parseInt(limitParam, 10) : 20;
    
    // Query exports from Firestore using getFirestoreAdmin()
    const db = getFirestoreAdmin();
    const exportsCollection = collection(db, 'exports');
    const exportsQuery = query(
      exportsCollection,
      where('userId', '==', userId), // Use userId from decodedToken
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );
    
    const exportsSnapshot = await getDocs(exportsQuery);
    
    // Format the response data
    const exports = exportsSnapshot.docs.map(doc => {
      const data = doc.data();
      
      // Parse and format dates
      const createdAt = data.createdAt?.toDate?.() 
        ? data.createdAt.toDate().toISOString() 
        : new Date(data.createdAt).toISOString();
      
      const expiresAt = data.expiresAt?.toDate?.() 
        ? data.expiresAt.toDate().toISOString() 
        : new Date(data.expiresAt).toISOString();
      
      return {
        id: doc.id,
        type: data.type,
        format: data.format,
        url: data.url,
        filename: data.filename,
        createdAt,
        expiresAt,
        recordCount: data.recordCount,
        status: data.status || 'completed',
        errorMessage: data.errorMessage,
        userId: data.userId,
      };
    });
    
    // Validate response data
    const validExports = exports.filter(item => {
      try {
        exportItemSchema.parse(item);
        return true;
      } catch (error) {
        console.error(`Invalid export item data:`, error);
        return false;
      }
    });
    
    // Return standardized success response
    return createSuccessResponse(
      'Exports retrieved successfully',
      validExports,
      'exports'
    );
  } catch (error) {
    return handleApiError(error, 'Failed to fetch exports');
  }
}
