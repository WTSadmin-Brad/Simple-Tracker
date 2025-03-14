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
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // TODO: Implement actual authentication check
    // This is a placeholder for the authentication check
    
    const checkAuth = async () => {
      try {
        // Simulate API call to check authentication status
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // TODO: Get actual authentication status from API or local storage
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        const userRole = localStorage.getItem('userRole') || 'employee';
        
        if (!isAuthenticated) {
          // Redirect to login page if not authenticated
          router.push(`/auth/login?returnUrl=${encodeURIComponent(pathname)}`);
          return;
        }
        
        if (requiredRole && userRole !== requiredRole) {
          // Redirect to appropriate dashboard if user doesn't have required role
          const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/employee/calendar';
          router.push(redirectPath);
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        // Redirect to login page on error
        router.push('/auth/login');
      }
    };
    
    checkAuth();
  }, [pathname, router, requiredRole]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render children if authenticated and authorized
  return <>{children}</>;
}
