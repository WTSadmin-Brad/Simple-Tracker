/**
 * Authentication hook for managing user authentication state
 * 
 * Provides a comprehensive interface for authentication operations 
 * with proper error handling, token refresh, and role-based permissions.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Authentication_Flow.md - "User Authentication" section
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AuthState, UserData, UserRole } from '../types/auth';
import { getFirebaseAuth, getFirestoreClient } from '@/lib/firebase/client';
import { useToast } from '@/components/ui/use-toast';
import { errorHandler, ErrorCodes, AuthError } from '@/lib/errors';
import { useAuthStore } from '@/stores/authStore';

// Token refresh buffer in milliseconds (5 minutes before expiration)
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;

// Minimum activity interval in milliseconds (15 minutes)
const MIN_ACTIVITY_INTERVAL = 15 * 60 * 1000;

/**
 * Return type for useAuth hook
 */
interface UseAuthReturn {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication is in progress */
  isLoading: boolean;
  /** Current user data */
  user: UserData | null;
  /** Authentication token */
  token: string | null;
  /** Token expiration timestamp */
  expiresAt: number | null;
  /** Authentication error message */
  error: string | null;
  /** Login with email and password */
  login: (email: string, password: string) => Promise<boolean>;
  /** Logout the current user */
  logout: () => Promise<boolean>;
  /** Check if user has specific role(s) */
  hasRole: (role: UserRole | UserRole[]) => boolean;
  /** Refresh the authentication token */
  refreshToken: () => Promise<boolean>;
}

/**
 * Hook for managing authentication state and operations
 * 
 * @returns Authentication methods and state
 */
export function useAuth(): UseAuthReturn {
  const auth = getFirebaseAuth();
  const firestore = getFirestoreClient();
  const router = useRouter();
  const { toast } = useToast();
  
  // Access the auth store
  const {
    isAuthenticated,
    isLoading,
    user,
    token,
    expiresAt,
    error,
    setAuth,
    clearAuth,
    setLoading,
    setError,
    setToken
  } = useAuthStore();

  // Local state for tracking user activity
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  /**
   * Login function
   * 
   * @param email User email
   * @param password User password
   * @returns Promise resolving to success status
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!auth) {
      throw new AuthError(
        'Authentication service is not available',
        ErrorCodes.SERVICE_UNAVAILABLE,
        503
      );
    }

    setLoading(true);
    setError(null);
    
    try {
      // Sign in with Firebase auth
      const userCredential = await errorHandler.withRetry(
        () => signInWithEmailAndPassword(auth, email, password),
        {
          maxRetries: 2,
          retryDelay: 1000,
          shouldRetry: (error) => {
            // Only retry for network issues, not for invalid credentials
            const { code } = errorHandler.formatError(error);
            return code.startsWith('network/') || code === ErrorCodes.SERVICE_UNAVAILABLE;
          }
        }
      );
      
      // Get the Firebase user
      const firebaseUser = userCredential.user;
      
      // Get the user's custom claims (role)
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const role = idTokenResult.claims.role as UserRole || 'employee';
      
      // Get additional user data from Firestore
      let userData: Partial<UserData> = {
        id: firebaseUser.uid,
        email: firebaseUser.email || undefined,
        role
      };
      
      if (firestore) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const firestoreData = userDoc.data();
            userData = {
              ...userData,
              name: firestoreData.name,
              phone: firestoreData.phone,
              jobTitle: firestoreData.jobTitle,
              avatarUrl: firestoreData.avatarUrl,
              createdAt: firestoreData.createdAt?.toDate(),
              lastLogin: firestoreData.lastLogin?.toDate()
            };
          }
        } catch (error) {
          console.warn('Error fetching additional user data:', error);
          // Continue without the additional data
        }
      }
      
      // Get fresh token
      const newToken = await firebaseUser.getIdToken();
      
      // Calculate token expiration
      const decodedToken = JSON.parse(atob(newToken.split('.')[1]));
      const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
      
      // Store authentication in secure cookie (for server-side auth)
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: newToken })
      });
      
      // Update auth store
      setAuth({
        isAuthenticated: true,
        user: userData as UserData,
        token: newToken,
        expiresAt: expirationTime
      });
      
      setLastActivity(Date.now());
      
      // Show success toast
      toast({
        title: "Login successful",
        description: `Welcome${userData.name ? `, ${userData.name}` : ''}!`,
      });
      
      // Redirect based on role
      const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/employee/calendar';
      router.push(redirectUrl);
      
      return true;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      // Handle specific error cases
      if (formattedError.code === ErrorCodes.AUTH_INVALID_CREDENTIALS) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(userMessage);
      }
      
      toast({
        title: "Login failed",
        description: userMessage,
        variant: "destructive",
      });
      
      errorHandler.logError(err, { 
        operation: 'login',
        email // Don't log the password!
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [auth, firestore, router, setAuth, setLoading, setError, toast]);

  /**
   * Logout function
   * 
   * @returns Promise resolving to success status
   */
  const logout = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    
    try {
      if (auth) {
        await signOut(auth);
      }
      
      // Clear server-side session
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      
      // Clear auth store
      clearAuth();
      
      // Redirect to login
      router.push('/auth/login');
      
      return true;
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      toast({
        title: "Logout issue",
        description: userMessage,
        variant: "destructive",
      });
      
      errorHandler.logError(err, { 
        operation: 'logout'
      });
      
      // Force clear auth anyway
      clearAuth();
      router.push('/auth/login');
      
      return false;
    } finally {
      setLoading(false);
    }
  }, [auth, router, clearAuth, setLoading, toast]);

  /**
   * Check if the current user has a specific role
   * 
   * @param role Role or array of roles to check
   * @returns Boolean indicating if user has the specified role(s)
   */
  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }, [isAuthenticated, user]);

  /**
   * Refresh the authentication token
   * 
   * @returns Promise resolving to success status
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!auth?.currentUser || !token) {
      return false;
    }
    
    try {
      // Get fresh token
      const newToken = await auth.currentUser.getIdToken(true);
      
      // Calculate new expiration
      const decodedToken = JSON.parse(atob(newToken.split('.')[1]));
      const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
      
      // Update server-side session
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: newToken })
      });
      
      // Update token in store
      setToken(newToken, expirationTime);
      
      return true;
    } catch (err) {
      errorHandler.logError(err, { 
        operation: 'refreshToken'
      });
      
      // For refresh errors, don't show UI notifications unless they're critical
      if (errorHandler.formatError(err).status === 401) {
        // If unauthorized, force logout
        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
        
        logout();
      }
      
      return false;
    }
  }, [auth, token, setToken, logout, toast]);

  /**
   * Initialize auth state from server session (if available)
   * 
   * @returns Promise resolving when initialization is complete
   */
  const initializeAuthFromSession = useCallback(async (): Promise<void> => {
    if (isAuthenticated) {
      return; // Already authenticated
    }
    
    try {
      setLoading(true);
      
      // Try to get session from server
      const response = await fetch('/api/auth/session');
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      if (!data.token) {
        return;
      }
      
      // If we have a Firebase user, use it
      if (auth?.currentUser) {
        // Validate token from session
        const decodedToken = JSON.parse(atob(data.token.split('.')[1]));
        const expirationTime = decodedToken.exp * 1000;
        
        if (Date.now() >= expirationTime) {
          // Token is expired, refresh it
          await refreshToken();
        } else {
          // Token is valid, use it
          setToken(data.token, expirationTime);
          
          // Load user data
          if (decodedToken.uid && firestore) {
            try {
              const userDoc = await getDoc(doc(firestore, 'users', decodedToken.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setAuth({
                  isAuthenticated: true,
                  user: {
                    id: decodedToken.uid,
                    email: decodedToken.email,
                    role: decodedToken.role || 'employee',
                    name: userData.name,
                    phone: userData.phone,
                    jobTitle: userData.jobTitle,
                    avatarUrl: userData.avatarUrl,
                    createdAt: userData.createdAt?.toDate(),
                    lastLogin: userData.lastLogin?.toDate()
                  },
                  token: data.token,
                  expiresAt: expirationTime
                });
              }
            } catch (error) {
              console.warn('Error fetching user data from Firestore:', error);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error initializing auth from session:', err);
    } finally {
      setLoading(false);
    }
  }, [auth, firestore, isAuthenticated, refreshToken, setAuth, setLoading, setToken]);

  /**
   * Track user activity for token refresh
   */
  const trackActivity = useCallback((): void => {
    const now = Date.now();
    
    // Only update if significant time has passed to avoid unnecessary updates
    if (now - lastActivity > MIN_ACTIVITY_INTERVAL) {
      setLastActivity(now);
    }
  }, [lastActivity]);

  // Initialize auth from Firebase
  useEffect(() => {
    if (!auth) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !isAuthenticated) {
        try {
          // Get token and role
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = idTokenResult.claims.role as UserRole || 'employee';
          
          // Get additional user data
          let userData: Partial<UserData> = {
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            role
          };
          
          if (firestore) {
            try {
              const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
              if (userDoc.exists()) {
                const firestoreData = userDoc.data();
                userData = {
                  ...userData,
                  name: firestoreData.name,
                  phone: firestoreData.phone,
                  jobTitle: firestoreData.jobTitle,
                  avatarUrl: firestoreData.avatarUrl,
                  createdAt: firestoreData.createdAt?.toDate(),
                  lastLogin: firestoreData.lastLogin?.toDate()
                };
              }
            } catch (error) {
              console.warn('Error fetching additional user data:', error);
            }
          }
          
          // Get token
          const token = await firebaseUser.getIdToken();
          
          // Calculate token expiration
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          const expirationTime = decodedToken.exp * 1000;
          
          // Update auth store
          setAuth({
            isAuthenticated: true,
            user: userData as UserData,
            token,
            expiresAt: expirationTime
          });
        } catch (err) {
          console.error('Error setting up authenticated user:', err);
          clearAuth();
        } finally {
          setLoading(false);
        }
      } else if (!firebaseUser) {
        clearAuth();
        setLoading(false);
      }
    });
    
    // Try to initialize from session if no Firebase auth
    if (!isAuthenticated) {
      initializeAuthFromSession();
    }
    
    return () => unsubscribe();
  }, [auth, firestore, isAuthenticated, setAuth, clearAuth, setLoading, initializeAuthFromSession]);

  // Set up token refresh
  useEffect(() => {
    if (!isAuthenticated || !expiresAt || !token) return;
    
    // Check if token is already expired
    if (Date.now() >= expiresAt) {
      refreshToken();
      return;
    }
    
    // Set up refresh before expiration
    const refreshTime = expiresAt - TOKEN_REFRESH_BUFFER;
    const timeUntilRefresh = refreshTime - Date.now();
    
    if (timeUntilRefresh <= 0) {
      // Refresh immediately if we're already within the buffer zone
      refreshToken();
      return;
    }
    
    // Schedule refresh
    const refreshTimer = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);
    
    return () => clearTimeout(refreshTimer);
  }, [isAuthenticated, token, expiresAt, refreshToken]);

  // Set up activity tracking for user-triggered refresh
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Track activity on user interactions
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'click'];
    
    const handleActivity = () => {
      trackActivity();
      
      // If token is close to expiration, refresh it
      if (expiresAt && Date.now() > expiresAt - TOKEN_REFRESH_BUFFER) {
        refreshToken();
      }
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isAuthenticated, expiresAt, trackActivity, refreshToken]);

  return {
    isAuthenticated,
    isLoading,
    user,
    token,
    expiresAt,
    error,
    login,
    logout,
    hasRole,
    refreshToken
  };
}
