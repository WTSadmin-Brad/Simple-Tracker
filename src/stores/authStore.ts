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
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  FirebaseError
} from 'firebase/auth';
import { getAuthClient } from '@/lib/firebase/client';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestoreClient } from '@/lib/firebase/client';

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
  sessionType: 'persistent' | 'temporary';
  
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
  const auth = getAuthClient();
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
      sessionType: 'temporary',
      
      // Actions
      login: async (email: string, password: string, rememberMe = false) => {
        set({ isLoading: true, error: null });
        
        try {
          const auth = getAuthClient();
          
          // Sign in with Firebase Auth
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Get the ID token and expiration
          const tokenResult = await getIdTokenResult(firebaseUser);
          const token = tokenResult.token;
          
          // Calculate token expiration (Firebase tokens expire in 1 hour)
          const tokenExpiration = new Date(tokenResult.expirationTime).getTime();
          
          // Convert Firebase user to our User model
          const user = await createUserFromFirebaseUser(firebaseUser);
          
          // Set session type based on rememberMe option
          const sessionType = rememberMe ? 'persistent' : 'temporary';
          
          // Update auth state
          set({
            user,
            token,
            tokenExpiration,
            isAuthenticated: true,
            isLoading: false,
            sessionType,
          });
          
          // Configure Firebase persistence based on rememberMe
          if (rememberMe) {
            // Set persistence to LOCAL (survives browser restarts)
            await setPersistence(auth, browserLocalPersistence);
          } else {
            // Set persistence to SESSION (cleared when browser is closed)
            await setPersistence(auth, browserSessionPersistence);
          }
          
        } catch (error) {
          console.error('Login error:', error);
          
          // Handle specific Firebase Auth errors
          if (error instanceof FirebaseError) {
            let errorMessage = 'Invalid email or password';
            
            switch (error.code) {
              case 'auth/user-not-found':
              case 'auth/wrong-password':
                errorMessage = 'Invalid email or password';
                break;
              case 'auth/too-many-requests':
                errorMessage = 'Too many failed login attempts. Please try again later.';
                break;
              case 'auth/user-disabled':
                errorMessage = 'This account has been disabled. Please contact support.';
                break;
              default:
                errorMessage = 'An error occurred during login. Please try again.';
            }
            
            set({ error: errorMessage, isLoading: false });
          } else {
            set({ error: 'An unexpected error occurred', isLoading: false });
          }
          
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          const auth = getAuthClient();
          
          // Sign out with Firebase Auth
          await signOut(auth);
          
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,
            tokenExpiration: null,
            sessionType: 'temporary'
          });
        } catch (error) {
          set({ 
            isLoading: false,
            error: 'Failed to logout. Please try again.'
          });
          throw error;
        }
      },
      
      refreshToken: async (force = false) => {
        const { token, tokenExpiration } = get();
        
        // Refresh if forced OR if token is about to expire (within 30 minutes)
        if (force || !token || !tokenExpiration || Date.now() > tokenExpiration - (30 * 60 * 1000)) {
          set({ isLoading: true });
          
          try {
            const auth = getAuthClient();
            const currentUser = auth.currentUser;
            
            if (!currentUser) {
              throw new Error('No authenticated user found');
            }
            
            // Force token refresh
            const newToken = await getIdToken(currentUser, true);
            const tokenResult = await getIdTokenResult(currentUser);
            const newTokenExpiration = new Date(tokenResult.expirationTime).getTime();
            
            set({ 
              isLoading: false,
              token: newToken,
              tokenExpiration: newTokenExpiration,
              error: null // Clear any prior auth errors
            });
            
            // Return the new expiration for scheduling the next refresh
            return newTokenExpiration;
          } catch (error) {
            console.error('Token refresh error:', error);
            
            // If refresh fails, log the user out
            set({ 
              isLoading: false,
              error: 'Your session has expired. Please login again.',
              user: null,
              isAuthenticated: false,
              token: null,
              tokenExpiration: null,
              sessionType: 'temporary'
            });
            throw error;
          }
        }
        
        // Return current expiration if no refresh was needed
        return tokenExpiration;
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },
      
      clearError: () => set({ error: null }),
      
      checkAuthStatus: () => {
        const { token, tokenExpiration, isAuthenticated } = get();
        
        if (!token || !tokenExpiration || !isAuthenticated) {
          return false;
        }
        
        // Check if token is expired
        if (isTokenExpired(tokenExpiration)) {
          // Clear auth state if token is expired
          set({ 
            user: null,
            isAuthenticated: false,
            token: null,
            tokenExpiration: null,
            sessionType: 'temporary'
          });
          return false;
        }
        
        return true;
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        tokenExpiration: state.tokenExpiration,
        isAuthenticated: state.isAuthenticated,
        sessionType: state.sessionType
      })
    }
  )
);
