/**
 * Authentication API - Logout endpoint
 * POST /api/auth/logout
 * 
 * This endpoint handles user logout by:
 * 1. Clearing the session cookie
 * 2. Revoking the Firebase refresh tokens
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAuthAdmin } from '@/lib/firebase/admin';
import { handleApiError } from '@/lib/api/middleware';

// Cookie configuration
const AUTH_COOKIE = '__session';

/**
 * POST handler for logout
 */
export async function POST(request: Request) {
  try {
    // Get the session cookie
    const sessionCookie = cookies().get(AUTH_COOKIE)?.value;
    
    if (sessionCookie) {
      try {
        // Verify and revoke the session
        const auth = getAuthAdmin();
        const decodedClaims = await auth.verifySessionCookie(sessionCookie);
        
        // Revoke refresh tokens, effectively logging the user out
        await auth.revokeRefreshTokens(decodedClaims.sub);
      } catch (error) {
        // Continue even if verification fails, as we'll delete the cookie anyway
        console.error('Error revoking session:', error);
      }
    }
    
    // Delete the session cookie
    cookies().delete(AUTH_COOKIE);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    return handleApiError(error, 'Logout failed');
  }
}
