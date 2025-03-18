/**
 * Auth Provider Component
 * 
 * This client component provides authentication context for the application.
 * It manages user authentication state and provides authentication methods.
 * 
 * @source Project Requirements - Authentication Section
 */

'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase/client';
import { getIdToken, getIdTokenResult } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

// User type is now imported from the store
type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  preferences?: Record<string, unknown>;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  
  // Use the Zustand auth store instead of local state
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    error,
    login, 
    logout, 
    refreshToken,
    updateUser,
    clearError,
    tokenExpiration
  } = useAuthStore();
  
  // Set up Firebase auth state listener
  useEffect(() => {
    const auth = getAuthClient();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get token and check if it needs refresh
          await refreshToken();
        } catch (error) {
          console.error('Error refreshing token:', error);
          // Token refresh failed, user will need to login again
          await logout();
        }
      }
    });
    
    // Clean up the listener on unmount
    return () => unsubscribe();
  }, [refreshToken, logout]);
  
  // Proactive token refresh scheduler
  useEffect(() => {
    // Only schedule if user is authenticated and has a token
    if (isAuthenticated && user && tokenExpiration) {
      // Calculate time until refresh (75% of remaining time)
      const timeUntilExpiry = tokenExpiration - Date.now();
      const refreshTime = Math.max(Math.floor(timeUntilExpiry * 0.75), 0);
      
      console.log(`Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`);
      
      // Schedule the refresh
      const refreshTimerId = setTimeout(async () => {
        try {
          await refreshToken();
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Handle refresh failure - typically by logging out the user
          await logout();
        }
      }, refreshTime);
      
      // Clean up the timer on unmount or when auth state changes
      return () => clearTimeout(refreshTimerId);
    }
  }, [isAuthenticated, user, tokenExpiration, refreshToken, logout]);
  
  // Refresh-on-activity mechanism
  useEffect(() => {
    if (isAuthenticated) {
      // Define events to listen for (user activity)
      const activityEvents = ['mousedown', 'keydown', 'touchstart', 'click'];
      let activityTimeout: NodeJS.Timeout | null = null;
      
      // Activity handler with debouncing
      const handleActivity = () => {
        if (activityTimeout) {
          clearTimeout(activityTimeout);
        }
        
        activityTimeout = setTimeout(async () => {
          // Check if token needs refresh (within 10 minutes of expiry)
          const timeUntilExpiry = tokenExpiration ? tokenExpiration - Date.now() : 0;
          if (timeUntilExpiry < 10 * 60 * 1000) {
            try {
              await refreshToken();
              console.log('Token refreshed on user activity');
            } catch (error) {
              console.error('Failed to refresh token on activity:', error);
            }
          }
        }, 1000); // Debounce for 1 second
      };
      
      // Add activity event listeners
      activityEvents.forEach(event => {
        window.addEventListener(event, handleActivity);
      });
      
      // Clean up
      return () => {
        if (activityTimeout) {
          clearTimeout(activityTimeout);
        }
        activityEvents.forEach(event => {
          window.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [isAuthenticated, tokenExpiration, refreshToken]);
  
  // Background refresh for long sessions
  useEffect(() => {
    if (isAuthenticated) {
      // Set up a background interval to check token (every 15 minutes)
      const backgroundCheckInterval = setInterval(async () => {
        // Check if token needs refresh (within 20 minutes of expiry)
        const timeUntilExpiry = tokenExpiration ? tokenExpiration - Date.now() : 0;
        if (timeUntilExpiry < 20 * 60 * 1000) {
          try {
            await refreshToken();
            console.log('Token refreshed in background check');
          } catch (error) {
            console.error('Failed to refresh token in background check:', error);
          }
        }
      }, 15 * 60 * 1000); // 15 minutes
      
      return () => clearInterval(backgroundCheckInterval);
    }
  }, [isAuthenticated, tokenExpiration, refreshToken]);
  
  // Visual feedback on session expiry
  useEffect(() => {
    // Session expiry detection
    if (error && error.includes('session has expired')) {
      // Show toast notification
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
      });
      
      // Redirect to login page after a short delay
      const redirectTimer = setTimeout(() => {
        router.push('/login');
      }, 2000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [error, router]);
  
  const value = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    logout,
    clearError
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
