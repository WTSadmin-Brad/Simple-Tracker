/**
 * Authentication API - Login endpoint
 * POST /api/auth/login
 * 
 * This endpoint handles user authentication against Firebase
 * and creates a session for the authenticated user.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
// Removed: import { signInWithEmailAndPassword } from 'firebase/auth';
// Removed: import { getAuthClient } from '@/lib/firebase/client';
// Removed: import { cookies } from 'next/headers';
import { getAuthAdmin, getFirestoreAdmin } from '@/lib/firebase/admin'; // Added getFirestoreAdmin
import { handleApiError, validateRequest } from '@/lib/api/middleware';
import { createSuccessResponse, createErrorResponse } from '@/lib/api/responseUtils';
import { LoginRequest } from '@/types/auth'; // Removed AuthResponse, UserData
import { ErrorCodes } from '@/lib/errors/error-types';
import bcrypt from 'bcrypt'; // Added bcrypt

// Define validation schema for login requests
// Updated schema for username/password login
const loginSchema = z.object({
  username: z.string().min(3, 'Username is required'), // Changed from email
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Removed rememberMe
});

// Removed Session expiration times and Cookie configuration

/**
 * Process login request and create authenticated session
 */
// Rewritten handler for username/password + custom token flow
async function loginHandler(
  data: z.infer<typeof loginSchema>, // Use inferred type from schema
  request: Request // Keep request parameter if needed by validateRequest or future use
): Promise<NextResponse> {
  try {
    const { username, password } = data;
    const db = getFirestoreAdmin();
    const authAdmin = getAuthAdmin();

    // 1. Find user by username in Firestore
    const usersRef = db.collection('users');
    const userQuery = await usersRef.where('username', '==', username).limit(1).get();

    if (userQuery.empty) {
      console.warn(`Login attempt failed: Username not found - ${username}`);
      return createErrorResponse('Invalid username or password', ErrorCodes.AUTH_INVALID_CREDENTIALS, 401);
    }

    // 2. Get user data and UID
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    // 3. Check if account is active
    if (!userData.isActive) {
      console.warn(`Login attempt failed: Account deactivated - ${username} (UID: ${uid})`);
      return createErrorResponse('Account deactivated', 'auth/account-disabled', 403); // Consider adding specific error code
    }

    // 4. Verify password hash
    const storedHash = userData.passwordHash;
    if (!storedHash) {
       console.error(`Login attempt failed: Missing password hash for user ${username} (UID: ${uid})`);
       // This indicates a problem during user creation/update
       return createErrorResponse('Authentication error. Please contact support.', 'auth/internal-error', 500);
    }

    const passwordMatch = await bcrypt.compare(password, storedHash);

    if (!passwordMatch) {
      console.warn(`Login attempt failed: Invalid password for user ${username} (UID: ${uid})`);
      return createErrorResponse('Invalid username or password', ErrorCodes.AUTH_INVALID_CREDENTIALS, 401);
    }

    // 5. Create Custom Token
    console.log(`Password verified for user: ${username} (UID: ${uid}). Creating custom token.`);
    const customToken = await authAdmin.createCustomToken(uid);

    // 6. Return custom token to client
    // Client will use signInWithCustomToken to get ID token
    return NextResponse.json({ customToken });
    // Optionally use createSuccessResponse:
    // return createSuccessResponse('Custom token generated', { customToken }, 'auth');

  } catch (error) {
    // Log the error properly before handling
    console.error(`Unexpected error during login for user ${data.username}:`, error);
    return handleApiError(error, 'Login failed due to an unexpected error');
  }
}

// Removed updateLastLogin function (no longer needed here, session logic removed)

// Export POST handler with validation
export const POST = validateRequest(loginSchema, loginHandler);
