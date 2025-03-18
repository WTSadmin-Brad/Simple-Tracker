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
import { jwtDecode } from 'jwt-decode';

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
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public paths without authentication
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get auth token from cookies
  const token = request.cookies.get('auth-token')?.value;
  
  // If no token is present, redirect to login
  if (!token) {
    return redirectToLogin(request, pathname, 'unauthorized');
  }
  
  // Validate the token
  try {
    // Decode JWT to get payload
    const payload = jwtDecode<JwtPayload>(token);
    
    // Check if token is expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (payload.exp <= currentTimestamp) {
      return redirectToLogin(request, pathname, 'expired');
    }
    
    // Check role for admin routes
    if (ADMIN_PATHS.some(path => pathname.startsWith(path))) {
      if (payload.role !== 'admin') {
        // User doesn't have admin privileges
        return NextResponse.redirect(new URL('/403', request.url));
      }
    }
    
    // Token is valid, add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-role', payload.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    // Invalid token format or other error
    console.error('Middleware token validation error:', error);
    return redirectToLogin(request, pathname, 'invalid');
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
