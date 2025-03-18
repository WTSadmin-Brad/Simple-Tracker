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
    isLoading, 
    checkAuthStatus 
  } = useAuthStore();
  
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check if the user is authenticated
        const isAuth = checkAuthStatus();
        
        if (!isAuth) {
          // Redirect to login page if not authenticated
          router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
          return;
        }
        
        // Check if the user has the required role
        if (requiredRole && user?.role !== requiredRole) {
          // Redirect to appropriate dashboard if user doesn't have required role
          const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/employee/calendar';
          router.push(redirectPath);
          return;
        }
        
        // User is authenticated and has the required role
        setIsChecking(false);
      } catch (error) {
        console.error('Auth verification error:', error);
        // Redirect to login page on error
        router.push('/auth/login');
      }
    };
    
    // Only verify if not currently loading
    if (!isLoading) {
      verifyAuth();
    }
  }, [pathname, router, requiredRole, user, isAuthenticated, isLoading, checkAuthStatus]);
  
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
