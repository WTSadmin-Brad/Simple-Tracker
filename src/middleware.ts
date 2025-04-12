/**
 * Simple Tracker - Server-Side Authentication Middleware
 * 
 * This middleware provides server-side route protection for the application by:
 * 1. Validating authentication tokens from cookies
 * 2. Enforcing role-based access control for admin routes
 * 3. Forwarding user information to API routes
 * 4. Redirecting unauthorized users to the login page
 * 
 * Implementation follows the Next.js middleware pattern:
 * https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Removed: import { jwtDecode } from 'jwt-decode';
// Import verifyIdToken - assumes admin SDK is initialized elsewhere or handles it.
// NOTE: Direct Admin SDK usage in Edge middleware can be tricky.
// If issues arise, consider an internal API route for verification.
import { verifyIdToken } from '@/lib/firebase/admin';

// Paths that should be accessible without authentication
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth',
  '/_next', // Next.js assets
  '/favicon.ico',
  '/static',
  '/images',
];

// Paths that require admin role
const ADMIN_PATHS = [
  '/admin',
  '/api/admin',
];

// JWT payload interface
interface JwtPayload {
  sub: string; // User ID
  role: 'admin' | 'employee'; // User role
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}

/**
 * Main middleware function that processes each request
 */
export async function middleware(request: NextRequest) { // Added async
  const { pathname } = request.nextUrl;
  
  // Allow public paths without authentication
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get auth token from Authorization header
  const authHeader = request.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1];
  }
  
  // If no token is present, redirect to login
  if (!token) {
    console.log('Middleware: No token found, redirecting to login.');
    return redirectToLogin(request, pathname, 'unauthorized');
  }
  
  // Validate the token
  // Validate the token using Firebase Admin SDK
  try {
    const decodedToken = await verifyIdToken(token);
    
    // Extract role from verified claims
    const role = decodedToken.role || 'employee'; // Default if claim missing

    // Check role for admin routes
    if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
      if (role !== 'admin') {
        // User doesn't have admin privileges, redirect to 403 page
        console.warn(`Middleware: Forbidden access attempt by user ${decodedToken.uid} (role: ${role}) to ${pathname}`);
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }
    
    // Token is valid and role check (if applicable) passed.
    // Do NOT forward user info via headers. API routes will verify the token themselves.
    return NextResponse.next();

  } catch (error: any) {
    // Handle verification errors (expired, revoked, invalid signature etc.)
    // verifyIdToken should throw a descriptive error
    console.error(`Middleware token verification failed for path ${pathname}:`, error.message || error);
    // Redirect to login, potentially passing the reason
    let reason = 'invalid';
    if (error.message?.includes('expired')) {
      reason = 'expired';
    } else if (error.message?.includes('revoked')) {
      reason = 'revoked';
    }
    return redirectToLogin(request, pathname, reason);
  }
}

/**
 * Helper function to redirect to login with appropriate parameters
 */
function redirectToLogin(request: NextRequest, pathname: string, reason: string) {
  const url = new URL('/auth/login', request.url);
  url.searchParams.set('redirectUrl', pathname);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url);
}

/**
 * Define which paths the middleware should run on
 * Excludes static files, images, and other assets
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - Static files (css, js, images, etc.)
     * - API routes used for public access
     * - Login and authentication routes
     */
    '/((?!_next/static|_next/image|favicon.ico|static|images|auth/login|auth/register|auth/forgot-password).*)',
  ],
};
