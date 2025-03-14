/**
 * Login Page
 * 
 * This page provides the authentication interface for users to log in
 * to the Simple Tracker application.
 * 
 * @source Project Requirements - Authentication Section
 */

import React from 'react';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Simple Tracker</h1>
          <h2 className="mt-6 text-xl font-bold text-gray-900">Sign in to your account</h2>
        </div>
        
        {/* Login form component will handle the authentication logic */}
        <LoginForm />
      </div>
    </div>
  );
}
