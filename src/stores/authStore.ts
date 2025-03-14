/**
 * authStore.ts
 * Zustand store for managing authentication state
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  tokenExpiry: number | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  clearError: () => void;
  checkAuthStatus: () => boolean;
}

// Helper to check if token is expired
const isTokenExpired = (expiry: number | null): boolean => {
  if (!expiry) return true;
  return Date.now() > expiry;
};

// Placeholder for the actual store implementation
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      tokenExpiry: null,
      
      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        try {
          // TODO: Implement actual API call to /api/auth/login
          // This is a placeholder for the actual login implementation
          // Using password in a real implementation but not in this mock
          // NOTE: The password parameter is not used in this mock implementation.
          // In a real implementation, this would be used to authenticate the user.
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login for development
          const mockUser: User = {
            id: '1',
            name: email.split('@')[0],
            email,
            role: email.includes('admin') ? 'admin' : 'employee',
          };
          
          // Mock token with 8-hour expiry
          const tokenExpiry = Date.now() + (8 * 60 * 60 * 1000);
          
          set({ 
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            token: 'mock-jwt-token',
            tokenExpiry
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: 'Invalid email or password. Please try again.',
            isAuthenticated: false,
            user: null,
            token: null,
            tokenExpiry: null
          });
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          // TODO: Implement actual API call to logout endpoint
          // This is a placeholder for the actual logout implementation
          
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 500));
          
          set({ 
            user: null,
            isAuthenticated: false,
            isLoading: false,
            token: null,
            tokenExpiry: null
          });
        } catch (error) {
          set({ 
            isLoading: false,
            error: 'Failed to logout. Please try again.'
          });
          throw error;
        }
      },
      
      refreshToken: async () => {
        const { token, tokenExpiry } = get();
        
        // Only refresh if we have a token and it's close to expiring (within 30 minutes)
        if (!token || !tokenExpiry || Date.now() > tokenExpiry - (30 * 60 * 1000)) {
          set({ isLoading: true });
          
          try {
            // TODO: Implement actual API call to refresh token
            // This is a placeholder for the actual refresh implementation
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mock new token with 8-hour expiry
            const newTokenExpiry = Date.now() + (8 * 60 * 60 * 1000);
            
            set({ 
              isLoading: false,
              token: 'new-mock-jwt-token',
              tokenExpiry: newTokenExpiry
            });
          } catch (error) {
            // If refresh fails, log the user out
            set({ 
              isLoading: false,
              error: 'Your session has expired. Please login again.',
              user: null,
              isAuthenticated: false,
              token: null,
              tokenExpiry: null
            });
            throw error;
          }
        }
      },
      
      updateUser: (userData) => {
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : null
        }));
      },
      
      clearError: () => set({ error: null }),
      
      checkAuthStatus: () => {
        const { token, tokenExpiry, isAuthenticated } = get();
        
        if (!token || !tokenExpiry || !isAuthenticated) {
          return false;
        }
        
        // Check if token is expired
        if (isTokenExpired(tokenExpiry)) {
          // Clear auth state if token is expired
          set({ 
            user: null,
            isAuthenticated: false,
            token: null,
            tokenExpiry: null
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
        tokenExpiry: state.tokenExpiry,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
