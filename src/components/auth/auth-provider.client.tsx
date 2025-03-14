/**
 * Auth Provider Component
 * 
 * This client component provides authentication context for the application.
 * It manages user authentication state and provides authentication methods.
 * 
 * @source Project Requirements - Authentication Section
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already authenticated on mount
    const checkAuthStatus = async () => {
      try {
        // TODO: Implement actual authentication check
        // This is a placeholder for the authentication check
        
        const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
        
        if (isAuthenticated) {
          // TODO: Get actual user data from API or local storage
          const userData = JSON.parse(localStorage.getItem('userData') || '{}');
          setUser(userData as User);
        }
      } catch (error) {
        console.error('Auth status check error:', error);
        // Clear any potentially corrupted auth data
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual login API call
      // This is a placeholder for the login API call
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login for development
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: email.includes('admin') ? 'admin' : 'employee',
      };
      
      // Store auth data
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(mockUser));
      localStorage.setItem('userRole', mockUser.role);
      
      setUser(mockUser);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual logout API call
      // This is a placeholder for the logout API call
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Clear auth data
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
