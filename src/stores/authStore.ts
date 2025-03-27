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
  FirebaseError
} from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase/client';
import { doc, getDoc } from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase/client';
import { login as apiLogin, logout as apiLogout, refreshToken as apiRefreshToken } from '@/lib/api/authApi';

// Types for user roles
type UserRole = 'employee' | 'admin';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  preferences?: Record<string, unknown>;
}

// Auth state interface
interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  tokenExpiration: number | null;
  
  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: (force?: boolean) => Promise<number | null>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  checkAuthStatus: () => boolean;
}

// Helper to check if token is expired
const isTokenExpired = (expiry: number | null): boolean => {
  if (!expiry) return true;
  return Date.now() > expiry;
};

// Helper to convert Firebase user to app User
const createUserFromFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const firestore = getFirestoreClient();
  
  // Get user claims from token
  const tokenResult = await getIdTokenResult(firebaseUser);
  const role = tokenResult.claims.role as UserRole || 'employee';
  
  try {
    // Try to get additional user data from Firestore
    const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        name: userData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        role: userData.role || role,
        preferences: userData.preferences || {}
      };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
  
  // Fallback if Firestore data is not available
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    role: role
  };
};

// Create login action
const createLoginAction = () => async (email: string, password: string, rememberMe: boolean = false, set: any, get: any) => {
  set({ isLoading: true, error: null });
  
  try {
    // Try to login with the API, which handles the session cookie
    const response = await apiLogin({
      username: email, // API expects username but we use email
      password,
      rememberMe
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Authentication failed');
    }
    
    const { token, user, expiresAt } = response.data;
    
    // Update store state with authenticated user
    set({
      user: {
        id: user.id,
        email: user.username, // API returns username but we store as email
        name: user.displayName,
        role: user.role
      },
      isAuthenticated: true,
      isLoading: false,
      token,
      tokenExpiration: expiresAt,
      error: null
    });
  } catch (error) {
    console.error('Login error:', error);
    
    set({
      isLoading: false,
      error: error instanceof Error ? error.message : 'Authentication failed',
      isAuthenticated: false,
      user: null,
      token: null,
      tokenExpiration: null
    });
    
    throw error;
  }
};

// Action creators
const createLogoutAction = () => async (set: any) => {
  set({ isLoading: true });
  
  try {
    // Call the logout API to clear the session cookie
    await apiLogout();
    
    // Sign out with Firebase Auth client side
    const auth = getAuthClient();
    await signOut(auth);
    
    set({ 
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      tokenExpiration: null,
      error: null
    });
  } catch (error) {
    console.error('Logout error:', error);
    set({ 
      error: 'An error occurred during logout',
      isLoading: false
    });
  }
};

const createRefreshTokenAction = (force = false) => async (set: any, get: any) => {
  const state = get();
  
  // Skip if not authenticated
  if (!state.user) {
    return null;
  }
  
  // Skip if token is still valid and force is false
  if (!force && state.tokenExpiration && !isTokenExpired(state.tokenExpiration)) {
    return state.tokenExpiration;
  }
  
  try {
    // Call refresh token API
    const response = await apiRefreshToken();
    
    if (!response.success || !response.data) {
      // Force logout if refresh fails
      await get().logout();
      return null;
    }
    
    const { token, user, expiresAt } = response.data;
    
    // Update store with refreshed token and user data
    set({
      user: {
        id: user.id,
        email: user.username,
        name: user.displayName,
        role: user.role
      },
      token,
      tokenExpiration: expiresAt,
      error: null
    });
    
    return expiresAt;
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Force logout on refresh error
    await get().logout();
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      tokenExpiration: null,
      
      // Actions
      login: (email, password, rememberMe = false) => 
        createLoginAction()(email, password, rememberMe, set, get),
      
      logout: () => createLogoutAction()(set, get),
      
      refreshToken: (force = false) => 
        createRefreshTokenAction(force)(set, get),
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      
      clearError: () => set({ error: null }),
      
      checkAuthStatus: () => {
        const state = get();
        
        // Check if user is authenticated and token is valid
        if (state.user && state.token && state.tokenExpiration) {
          // Check if token is expired
          if (isTokenExpired(state.tokenExpiration)) {
            // Try to refresh token
            get().refreshToken();
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
        tokenExpiration: state.tokenExpiration
      })
    }
  )
);

// Selector hooks for optimized component rendering
export const useUser = () => useAuthStore(state => state.user);
export const useIsAuthenticated = () => useAuthStore(state => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore(state => state.isLoading);
export const useAuthError = () => useAuthStore(state => state.error);
export const useAuthActions = () => useAuthStore(state => ({
  login: state.login,
  logout: state.logout,
  refreshToken: state.refreshToken,
  updateUser: state.updateUser,
  clearError: state.clearError,
  checkAuthStatus: state.checkAuthStatus
}));
