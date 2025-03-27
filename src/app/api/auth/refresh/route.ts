/**
 * Authentication API - Refresh Token endpoint
 * POST /api/auth/refresh
 * 
 * This endpoint refreshes an existing session by:
 * 1. Verifying the current session cookie
 * 2. Creating a new session with extended expiration
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthAdmin } from '@/lib/firebase/admin';
import { handleApiError } from '@/lib/api/middleware';
import { ApiResponse } from '@/types/api';
import { AuthResponse, UserData } from '@/types/auth';

// Cookie configuration
const AUTH_COOKIE = '__session';

// Session expiration times
const SESSION_EXPIRES_IN = {
  // 5 days for "remember me"
  LONG: 60 * 60 * 24 * 5 * 1000,
  // 1 day for standard session
  SHORT: 60 * 60 * 24 * 1 * 1000,
};

/**
 * POST handler for refreshing auth token
 */
export async function POST(request: Request): Promise<NextResponse<ApiResponse<AuthResponse>>> {
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
      
      // Verify existing session
      const decodedClaims = await auth.verifySessionCookie(sessionCookie);
      const userId = decodedClaims.sub;
      
      // Check if user still exists and is enabled
      const userRecord = await auth.getUser(userId);
      
      if (userRecord.disabled) {
        // Delete the session cookie for disabled users
        cookies().delete(AUTH_COOKIE);
        
        return NextResponse.json(
          {
            success: false,
            error: 'Account has been disabled'
          },
          { status: 403 }
        );
      }
      
      // Create a custom token that can be exchanged for a new ID token
      const customToken = await auth.createCustomToken(userId);
      
      // Get user claims/role
      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'employee';
      
      // Prepare user data
      const userData: UserData = {
        id: userRecord.uid,
        username: userRecord.email || '',
        displayName: userRecord.displayName || userRecord.email?.split('@')[0] || 'User',
        role,
        lastLogin: new Date().toISOString()
      };
      
      // Determine session expiration (maintain previous setting if available)
      const longSession = decodedClaims.long_session === true;
      const expiresIn = longSession ? SESSION_EXPIRES_IN.LONG : SESSION_EXPIRES_IN.SHORT;
      
      // Create a new session cookie that will be exchanged client-side
      // The custom token will be used client-side to get a fresh ID token
      
      // Return auth response with custom token
      return NextResponse.json({
        success: true,
        data: {
          token: customToken,
          user: userData,
          expiresAt: Date.now() + expiresIn
        }
      });
    } catch (error) {
      console.error('Session refresh error:', error);
      
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
    return handleApiError(error, 'Failed to refresh token');
  }
}
