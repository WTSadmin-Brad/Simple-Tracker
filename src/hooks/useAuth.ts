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
import { signInWithCustomToken, signOut, onAuthStateChanged, User } from 'firebase/auth'; 
import { UserData, UserRole } from '../types/auth'; 
import { getAuthClient, getFirestoreClient } from '@/lib/firebase/client'; 
import { toast } from 'sonner'; 
import { errorHandler, ErrorCodes, AuthError } from '@/lib/errors';
// Import the helper function from the store file
import { createUserFromFirebaseUser } from '@/stores/authStore'; 
// Import store and selectors/actions
import {
  useAuthStore,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError
} from '@/stores/authStore';

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
  /** Authentication error message */
  error: string | null;
  /** Login with username and password */
  login: (username: string, password: string) => Promise<boolean>;
  /** Logout the current user */
  logout: () => Promise<boolean>;
  /** Check if user has specific role(s) */
  hasRole: (role: UserRole | UserRole[]) => boolean;
  /** Refresh the authentication token */
  // refreshToken: (force?: boolean) => Promise<boolean>; // Exposing might depend on final strategy
}

/**
 * Hook for managing authentication state and operations
 * 
 * @returns Authentication methods and state
 */
export function useAuth(): UseAuthReturn {
  const auth = getAuthClient(); 
  const firestore = getFirestoreClient(); // Keep for potential future use in onAuthStateChanged if needed
  const router = useRouter();
  
  // Use selectors to get state
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const user = useUser(); // This user is of type UserData | null
  const error = useAuthError();
  
  // Get actions directly from the store instance for internal use in the hook
  const { _setLoading, _setError, _clearAuth, _setToken, _setUser } = useAuthStore.getState();

  // Local state for tracking user activity
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Rewritten login function for username/password -> custom token flow
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (!auth) { 
      _setError('Authentication service unavailable.'); 
      return false;
    }

    _setLoading(true); 
    _setError(null);   

    try {
      // 1. Call the custom backend login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || 'Invalid username or password.';
        console.error('Login API error:', data);
        _setError(errorMessage); 
        toast.error("Login failed", { 
          description: errorMessage,
        });
        return false;
      }

      // 2. Get the custom token from the response
      const customToken = data.customToken;
      if (!customToken) {
        console.error('Login error: Custom token missing from API response.');
        _setError('Login failed: Authentication response invalid.'); 
        toast.error("Login failed", { 
          description: "Received an invalid response from the server.",
        });
        return false;
      }

      // 3. Sign in with the custom token using Firebase Client SDK
      const userCredential = await signInWithCustomToken(auth, customToken);
      const firebaseUser = userCredential.user;

      // 4. Get ID token result to access custom claims (role)
      // Note: Role check here is primarily for immediate redirect logic.
      // The onAuthStateChanged listener is the source of truth for the store state.
      const idTokenResult = await firebaseUser.getIdTokenResult(true); 
      const role = idTokenResult.claims.role as UserRole || 'employee';

      setLastActivity(Date.now());

      toast.success("Login successful", { 
        description: `Welcome! Redirecting...`, 
      });

      // Redirect based on role derived from claims
      const redirectUrl = role === 'admin' ? '/admin/dashboard' : '/employee/calendar';
      router.push(redirectUrl);
      
      return true;
    } catch (err) {
      const formattedError = errorHandler.formatError(err);
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      // Use store action to set error
      if (formattedError.code === ErrorCodes.AUTH_INVALID_CREDENTIALS) {
        _setError('Invalid username or password. Please try again.'); 
      } else {
        _setError(userMessage);
      }
      
      toast.error("Login failed", { 
        description: userMessage,
      });
      
      errorHandler.logError(err, {
        operation: 'login',
        username // Log username instead of email
      });
      
      return false;
    } finally {
      _setLoading(false); // Use store action
    }
  }, [auth, router, _setLoading, _setError, toast]); // Updated dependencies

  const logout = useCallback(async (): Promise<boolean> => {
    _setLoading(true); 
    
    try {
      if (auth) {
        await signOut(auth);
      }
      
      // Clear auth store using action
      _clearAuth(); 
      
      // Redirect to login
      router.push('/auth/login');
      
      return true;
    } catch (err) {
      const userMessage = errorHandler.getUserFriendlyMessage(err);
      
      toast.error("Logout issue", { 
        description: userMessage,
      });
      
      errorHandler.logError(err, { 
        operation: 'logout'
      });
      
      // Force clear auth anyway
      _clearAuth(); 
      router.push('/auth/login');
      
      return false;
    } finally {
      _setLoading(false); 
    }
  }, [auth, router, _clearAuth, _setLoading, toast]); // Updated dependencies

  const hasRole = useCallback((role: UserRole | UserRole[]): boolean => {
    if (!isAuthenticated || !user) {
      return false;
    }
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  }, [isAuthenticated, user]);

  // Internal refresh function, might not need to be exposed via UseAuthReturn
  const refreshToken = useCallback(async (force: boolean = false): Promise<boolean> => {
    const currentToken = useAuthStore.getState().token; 
    if (!auth?.currentUser || (!force && !currentToken)) { // Adjusted condition slightly
      return false;
    }
    
    try {
      const newToken = await auth.currentUser.getIdToken(true); // Force refresh
      const decodedToken = JSON.parse(atob(newToken.split('.')[1]));
      const expirationTime = decodedToken.exp * 1000; 
      
      _setToken(newToken, expirationTime); 
      
      return true;
    } catch (err) {
      errorHandler.logError(err, { 
        operation: 'refreshToken'
      });
      
      const errorCode = (err as any)?.code;
      if (errorCode === 'auth/user-token-expired' || errorCode === 'auth/invalid-id-token') {
        toast.error("Session expired", { 
          description: "Your session has expired or is invalid. Please log in again.",
        });
        await logout(); // Use await here
      }
      
      return false;
    }
  }, [auth, _setToken, logout, toast]); // Updated dependencies

  const trackActivity = useCallback((): void => {
    const now = Date.now();
    if (now - lastActivity > MIN_ACTIVITY_INTERVAL) {
      setLastActivity(now);
    }
  }, [lastActivity]);

  // Initialize auth from Firebase on mount
  useEffect(() => {
    if (!auth) return; 
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      _setLoading(true); 
      if (firebaseUser) {
        // Only update store if not already authenticated by this hook instance
        // This prevents potential loops if onAuthStateChanged fires multiple times rapidly
        if (!useAuthStore.getState().isAuthenticated) { 
          try {
            // Call the imported helper function to get UserData
            const appUser: UserData | null = await createUserFromFirebaseUser(firebaseUser); 
            const token = await firebaseUser.getIdToken();
            const idTokenResult = await firebaseUser.getIdTokenResult(); // Don't need to force refresh here
            const expirationTime = new Date(idTokenResult.expirationTime).getTime();

            if (appUser) {
              _setUser(appUser);
              _setToken(token, expirationTime);
              _setError(null);
            } else {
              console.error("Failed to create app user data from Firebase user.");
              _clearAuth(); 
              _setError("Failed to load user profile.");
            }
          } catch (err) {
            console.error('Error processing authenticated user state:', err);
            _clearAuth(); 
            _setError("Error processing login.");
          } finally {
            _setLoading(false);
          }
        } else {
           // Already authenticated, likely just a token refresh event, ensure loading is false
           _setLoading(false); 
        }
      } else {
        // No Firebase user, clear auth state
        _clearAuth();
        _setLoading(false);
      }
    });
    
    return () => unsubscribe();
  // Dependencies: Only run on mount/unmount
  }, [auth, firestore, _setUser, _setToken, _clearAuth, _setLoading, _setError]); 

  // Set up token refresh timer
  useEffect(() => {
    const { expiresAt: currentExpiresAt, isAuthenticated: isAuthNow } = useAuthStore.getState(); 
    if (!isAuthNow || !currentExpiresAt) return; 

    const now = Date.now();
    let refreshTimer: NodeJS.Timeout | undefined;

    if (now >= currentExpiresAt) {
      refreshToken(true); // Force refresh if already expired
    } else {
      const timeUntilRefresh = currentExpiresAt - TOKEN_REFRESH_BUFFER - now;
      if (timeUntilRefresh > 0) {
        refreshTimer = setTimeout(() => {
          refreshToken(true); // Force refresh when buffer time is reached
        }, timeUntilRefresh);
      } else {
         // Already within buffer, maybe refresh soon? Or rely on activity?
         // For simplicity, let's rely on activity or next request needing token
      }
    }
    
    return () => clearTimeout(refreshTimer);
  // Rerun when isAuthenticated changes or refreshToken function reference changes
  }, [isAuthenticated, refreshToken]); 

  // Set up activity tracking for potential proactive refresh
  useEffect(() => {
    const { expiresAt: currentExpiresAt } = useAuthStore.getState(); 
    if (!isAuthenticated) return; 

    const handleActivity = () => {
      trackActivity();
      // Optional: Proactively refresh if near expiry on activity
      if (currentExpiresAt && Date.now() > currentExpiresAt - TOKEN_REFRESH_BUFFER) {
         refreshToken(true); // Force refresh on activity near expiry
      }
    };
    
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'click'];
    activityEvents.forEach(event => window.addEventListener(event, handleActivity));
    
    return () => {
      activityEvents.forEach(event => window.removeEventListener(event, handleActivity));
    };
  // Rerun when isAuthenticated changes or callbacks change
  }, [isAuthenticated, trackActivity, refreshToken]); 

  return {
    isAuthenticated,
    isLoading,
    user, // UserData | null from selector
    error, // Error string | null from selector
    login, // The refactored login action
    logout,
    hasRole,
    // refreshToken // Not exposing refreshToken directly for now
  };
}
