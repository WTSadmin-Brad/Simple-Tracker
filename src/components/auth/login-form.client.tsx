/**
 * Login Form Component
 * 
 * This client component provides the authentication form for users to log in
 * to the Simple Tracker application.
 * 
 * @source Project Requirements - Authentication Section
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// Removed direct store import for actions, will use useAuth hook
// import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth hook
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Removed unused Checkbox import
import { Alert, AlertDescription } from '@/components/ui/alert';

// Define form schema with Zod
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'), // Changed from email
  password: z.string().min(6, 'Password must be at least 6 characters'),
  // Removed rememberMe
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '';
  
  // Use the Zustand auth store
  // Use the useAuth hook to get state and actions
  const { login, isLoading, error, isAuthenticated, user } = useAuth();
  // Removed clearError as it's not directly exposed by useAuth anymore
  
  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '', // Changed from email
      password: '',
      // Removed rememberMe
    },
  });
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = returnUrl || (user.role === 'admin' ? '/admin/dashboard' : '/employee/calendar');
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router, returnUrl]);
  
  const onSubmit = async (data: LoginFormValues) => {
    try {
      // Call login from useAuth hook with username and password
      await login(data.username, data.password);
      // Successful login will trigger the useEffect above for redirection
    } catch (err) {
      // Error is already handled in the auth store
      console.error('Login submission error:', err);
    }
  };
  
  return (
    <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text" // Changed type to text
            autoComplete="username" // Changed autocomplete
            disabled={isLoading}
            {...register('username')} // Register username field
            aria-invalid={errors.username ? 'true' : 'false'} // Check username errors
          />
          {errors.username && ( // Check username errors
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            disabled={isLoading}
            {...register('password')}
            aria-invalid={errors.password ? 'true' : 'false'}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        
        {/* Removed Remember Me checkbox */}
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>
    </div>
  );
}
