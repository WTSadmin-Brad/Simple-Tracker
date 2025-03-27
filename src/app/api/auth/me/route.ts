/**
 * Authentication API - Current User endpoint
 * GET /api/auth/me
 * 
 * Returns the current authenticated user from the session cookie
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin';
import { handleApiError } from '@/lib/api/middleware';
import { ApiResponse } from '@/types/api';
import { UserData } from '@/types/auth';

// Cookie configuration
const AUTH_COOKIE = '__session';

/**
 * GET handler for current user information
 */
export async function GET(request: Request): Promise<NextResponse<ApiResponse<UserData>>> {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get(AUTH_COOKIE)?.value;
    
    // Return unauthenticated if no cookie is present
    if (!sessionCookie) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not authenticated'
        },
        { status: 401 }
      );
    }
    
    // Verify the session cookie
    try {
      const auth = getAuthAdmin();
      const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
      
      // Get the user record from Firebase Auth
      const userRecord = await auth.getUser(decodedClaims.uid);
      
      // Get user claims/role
      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'employee';
      
      // Get additional user data from Firestore
      const db = getFirestoreAdmin();
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      
      // Prepare user data response
      const user: UserData = {
        id: userRecord.uid,
        username: userRecord.email || '',
        displayName: userRecord.displayName || userData?.name || userRecord.email?.split('@')[0] || 'User',
        role,
        lastLogin: userData?.lastLogin || new Date().toISOString()
      };
      
      // Return success response with user data
      return NextResponse.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Session validation error:', error);
      
      // Clear the invalid session cookie
      cookies().delete(AUTH_COOKIE);
      
      // Return unauthenticated
      return NextResponse.json(
        {
          success: false,
          error: 'Session expired'
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return handleApiError(error, 'Failed to get user information');
  }
}
