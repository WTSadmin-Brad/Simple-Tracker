/**
 * Authentication API - Login endpoint
 * POST /api/auth/login
 * 
 * This endpoint handles user authentication against Firebase
 * and creates a session for the authenticated user.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getAuthAdmin } from '@/lib/firebase/admin';
import { getAuthClient } from '@/lib/firebase/client';
import { handleApiError, validateRequest } from '@/lib/api/middleware';
import { ApiResponse } from '@/types/api';
import { AuthResponse, LoginRequest, UserData } from '@/types/auth';
import { cookies } from 'next/headers';

// Define validation schema for login requests
const loginSchema = z.object({
  username: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional().default(false),
});

// Session expiration times
const SESSION_EXPIRES_IN = {
  // 5 days for "remember me"
  LONG: 60 * 60 * 24 * 5 * 1000,
  // 1 day for standard session
  SHORT: 60 * 60 * 24 * 1 * 1000,
};

// Cookie configuration
const AUTH_COOKIE = '__session';

/**
 * Process login request and create authenticated session
 */
async function loginHandler(
  data: LoginRequest,
  request: Request
): Promise<NextResponse<ApiResponse<AuthResponse>>> {
  try {
    const { username: email, password, rememberMe = false } = data;
    const auth = getAuthAdmin();
    
    try {
      // Try to find user by email first
      const userRecord = await auth.getUserByEmail(email);
      
      // Check if user is disabled
      if (userRecord.disabled) {
        return NextResponse.json(
          {
            success: false,
            error: 'This account has been disabled. Please contact an administrator.'
          },
          { status: 403 }
        );
      }

      // Use Firebase client SDK for password validation
      // This is a secure approach as it's happening server-side
      const clientAuth = getAuthClient();
      const userCredential = await signInWithEmailAndPassword(
        clientAuth, 
        email, 
        password
      );
      
      if (!userCredential || !userCredential.user) {
        throw new Error('Authentication failed');
      }
      
      // Get Firebase ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Create a session cookie
      const expiresIn = rememberMe ? SESSION_EXPIRES_IN.LONG : SESSION_EXPIRES_IN.SHORT;
      const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
      
      // Set the session cookie
      cookies().set(AUTH_COOKIE, sessionCookie, {
        maxAge: expiresIn / 1000, // Convert to seconds
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
      });
      
      // Get user claims
      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'employee';
      
      // Prepare response with user data
      const userData: UserData = {
        id: userRecord.uid,
        username: email,
        displayName: userRecord.displayName || email.split('@')[0],
        role,
        lastLogin: new Date().toISOString()
      };
      
      // Update last login time in Firestore (async, don't await)
      // This helps track user activity without slowing down the login response
      updateLastLogin(userRecord.uid, userData.lastLogin).catch(error => {
        console.error('Error updating last login:', error);
      });
      
      // Return authentication response
      return NextResponse.json({
        success: true,
        data: {
          token: idToken,
          user: userData,
          expiresAt: Date.now() + expiresIn
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle credential errors
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid username or password'
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return handleApiError(error, 'Login failed');
  }
}

/**
 * Updates the user's last login timestamp in Firestore
 */
async function updateLastLogin(userId: string, timestamp: string) {
  const { getFirestoreAdmin } = await import('@/lib/firebase/admin');
  const db = getFirestoreAdmin();
  
  try {
    await db.collection('users').doc(userId).update({
      lastLogin: timestamp,
      lastActive: timestamp
    });
  } catch (error) {
    // Don't throw, just log the error
    console.error('Error updating last login in Firestore:', error);
  }
}

// Export POST handler with validation
export const POST = validateRequest(loginSchema, loginHandler);
