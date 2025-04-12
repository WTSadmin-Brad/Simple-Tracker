/**
 * Auth Guard Component
 * 
 * This client component protects routes that require authentication.
 * It redirects unauthenticated users to the login page.
 * 
 * @source Project Requirements - Authentication Section
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'employee';
}

export default function AuthGuard({ 
  children, 
  requiredRole 
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  
  // Use the Zustand auth store
  const { 
    user, 
    isAuthenticated, 
    isLoading
    // Removed checkAuthStatus as direct store check might be less reliable than hook's state
  } = useAuthStore();
  
  useEffect(() => {
    // Simplified effect: rely on isLoading and isAuthenticated from the store
    // which are managed by the useAuth hook and onAuthStateChanged listener.
    if (!isLoading) { // Only check when initial loading is done
      if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        console.log('AuthGuard: User not authenticated, redirecting to login.');
        router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
      } else if (requiredRole && user?.role !== requiredRole) {
        // Redirect if authenticated but role doesn't match
        console.log(`AuthGuard: User role (${user?.role}) does not match required role (${requiredRole}), redirecting.`);
        const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/employee/calendar';
        router.push(redirectPath);
      } else {
        // User is authenticated and has the required role (or no role required)
        setIsChecking(false);
      }
    }
    
    // Removed verifyAuth call
  // Dependencies: Check auth state whenever loading, auth status, user, or path changes
  }, [isLoading, isAuthenticated, user, requiredRole, pathname, router]);
  
  // Show loading state while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render children if authenticated and authorized
  return <>{children}</>;
}
