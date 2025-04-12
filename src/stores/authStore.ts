/**
 * authStore.ts
 * Zustand store for managing authentication state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  getIdToken,
  getIdTokenResult,
  signInWithCustomToken,
  // Removed FirebaseError import as it might not be directly exported
} from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase/client';
// Removed: import { login as apiLogin, logout as apiLogout, refreshToken as apiRefreshToken } from '@/lib/api/authApi'; // API calls will be handled by useAuth hook now
import { UserData, UserRole, AuthState as ExternalAuthState } from '@/types/auth'; // Import UserData and AuthState

// Types for user roles
// Removed local UserRole and User interface, will use imports from types/auth.ts

// Auth state interface
// Use AuthState from types/auth.ts and add actions
interface AuthStore extends ExternalAuthState {
  // Actions - Define setters and potentially other actions needed by the hook
  _setUser: (user: UserData | null) => void;
  _setLoading: (loading: boolean) => void;
  _setError: (error: string | null) => void;
  _setToken: (token: string | null, expiresAt: number | null) => void;
  _clearAuth: () => void;
  // Keep checkAuthStatus if still needed, but token refresh logic might move to useAuth
  checkAuthStatus: () => boolean;
}

// Helper to check if token is expired
const isTokenExpired = (expiry: number | null): boolean => {
  // Add a buffer (e.g., 60 seconds) to consider token expired slightly early
  const buffer = 60 * 1000;
  if (!expiry) return true;
  return Date.now() > expiry - buffer;
};

// Helper to convert Firebase user to app User
// Updated helper to return UserData type from types/auth.ts
// Export the helper function
export const createUserFromFirebaseUser = async (firebaseUser: FirebaseUser): Promise<UserData | null> => {
  if (!firebaseUser) return null;
  const firestore = getFirestoreClient();
  
  try {
    // Get user claims from token
    const tokenResult = await getIdTokenResult(firebaseUser, true); // Force refresh for latest claims
    const role = tokenResult.claims.role as UserRole || 'employee';
    
    // Try to get additional user data from Firestore
    const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
    
    let firestoreData: any = {};
    if (userDoc.exists()) {
      firestoreData = userDoc.data();
    } else {
      console.warn(`Firestore document not found for user ${firebaseUser.uid}`);
    }

    // Construct UserData object
    return {
      id: firebaseUser.uid,
      // Use username from Firestore if available, fallback carefully as email is placeholder
      username: firestoreData.username || firebaseUser.email || '', // Prioritize Firestore username
      displayName: firestoreData.displayName || firebaseUser.displayName || 'User',
      role: firestoreData.role || role, // Prioritize Firestore role, fallback to claim
      // Use Firestore timestamp if available, otherwise fallback or leave null/undefined
      lastLogin: firestoreData.lastLogin?.toDate?.()?.toISOString() || new Date().toISOString(),
    };

  } catch (error) {
    console.error(`Error creating UserData for ${firebaseUser.uid}:`, error);
    // Fallback with basic info from FirebaseUser if claims/Firestore fail
    return {
      id: firebaseUser.uid,
      username: firebaseUser.email || '', // Placeholder email might be only option
      displayName: firebaseUser.displayName || 'User',
      role: 'employee', // Default role on error
      lastLogin: new Date().toISOString(),
    };
  }
};

// Removed action creators for login, logout, refreshToken as these are handled in useAuth now

// Update create call to use the extended AuthStore interface
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      expiresAt: null, // Changed from tokenExpiration
      
      // Actions
      // Internal setters - not typically called directly from components
      _setUser: (user) => set({ user: user ? { ...user } : null, isAuthenticated: !!user }),
      _setLoading: (loading) => set({ isLoading: loading }),
      _setError: (error) => set({ error }),
      _setToken: (token, expiresAt) => set({ token, expiresAt }), // Changed from tokenExpiration
      _clearAuth: () => set({
        user: null,
        isAuthenticated: false,
        token: null,
        expiresAt: null, // Changed from tokenExpiration
        error: null,
        isLoading: false
      }),
      
      checkAuthStatus: () => {
        const state = get();
        
        // Check if user is authenticated and token is valid
        if (state.user && state.token && state.expiresAt) { // Changed from tokenExpiration
          // Check if token is expired
          if (isTokenExpired(state.expiresAt)) { // Changed from tokenExpiration
            // Refresh logic might move entirely to useAuth hook
            // console.warn("Token expired, refresh needed.");
            // get().refreshToken(); // Refresh logic likely moved
            return false;
          }
          
          return true;
        }
        
        return false;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        expiresAt: state.expiresAt // Changed from tokenExpiration
      })
    }
  )
);

// Selector hooks for optimized component rendering
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
// Removed useAuthActions as actions are now primarily exposed via useAuth hook
