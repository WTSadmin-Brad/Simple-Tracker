/**
 * Authentication API - Session management endpoint
 * POST /api/auth/session - Create a new session with ID token
 * DELETE /api/auth/session - End the current session
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { getAuthAdmin } from '@/lib/firebase/admin';
import { handleApiError, validateRequest } from '@/lib/api/middleware';
import { ApiResponse } from '@/types/api';

// Cookie configuration
const COOKIE_CONFIG = {
  AUTH_COOKIE: '__session',
  OPTIONS: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
  },
};

// Define validation schema for session creation
const sessionSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
  rememberMe: z.boolean().optional().default(false),
});

// Session expiration times
const SESSION_EXPIRES_IN = {
  // 5 days for "remember me"
  LONG: 60 * 60 * 24 * 5 * 1000,
  // 1 day for standard session
  SHORT: 60 * 60 * 24 * 1 * 1000,
};

/**
 * Create a new session from an ID token
 */
async function createSessionHandler(data: { idToken: string; rememberMe?: boolean }) {
  try {
    const { idToken, rememberMe = false } = data;
    const auth = getAuthAdmin();
    
    // Determine session expiration
    const expiresIn = rememberMe ? SESSION_EXPIRES_IN.LONG : SESSION_EXPIRES_IN.SHORT;
    
    // Create a session cookie using the ID token
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn,
    });
    
    // Set session cookie
    cookies().set(COOKIE_CONFIG.AUTH_COOKIE, sessionCookie, {
      ...COOKIE_CONFIG.OPTIONS,
      maxAge: expiresIn / 1000, // Convert to seconds
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        expiresAt: Date.now() + expiresIn,
      },
    });
  } catch (error) {
    console.error('Session creation error:', error);
    
    // Clear any existing session cookie
    cookies().delete(COOKIE_CONFIG.AUTH_COOKIE);
    
    return handleApiError(error, 'Failed to create session');
  }
}

/**
 * End the current session (logout)
 */
async function endSessionHandler() {
  try {
    const sessionCookie = cookies().get(COOKIE_CONFIG.AUTH_COOKIE)?.value;
    
    if (sessionCookie) {
      try {
        // Verify and revoke the session
        const auth = getAuthAdmin();
        const decodedClaims = await auth.verifySessionCookie(sessionCookie);
        await auth.revokeRefreshTokens(decodedClaims.sub);
      } catch (error) {
        console.error('Error revoking session:', error);
        // Continue with cookie deletion even if verification fails
      }
      
      // Delete the session cookie
      cookies().delete(COOKIE_CONFIG.AUTH_COOKIE);
    }
    
    return NextResponse.json({
      success: true,
      data: null,
    });
  } catch (error) {
    console.error('Session end error:', error);
    
    // Attempt to delete the cookie anyway
    cookies().delete(COOKIE_CONFIG.AUTH_COOKIE);
    
    return handleApiError(error, 'Failed to end session');
  }
}

// Export POST handler with validation
export const POST = validateRequest(sessionSchema, createSessionHandler);

// Export DELETE handler
export async function DELETE() {
  return endSessionHandler();
}
