/**
 * Admin Action Button Component
 * 
 * This client component provides a standardized action button for admin interfaces,
 * with support for different variants and loading states.
 * 
 * @source Project Requirements - Admin Section
 */

'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';

interface AdminActionButtonProps {
  label: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  isLoading?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function AdminActionButton({
  label,
  variant = 'primary',
  icon,
  isLoading = false,
  onClick,
  disabled = false
}: AdminActionButtonProps) {
  // Map variants to appropriate Tailwind classes
  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700'
  };
  
  return (
    <button
      className={`px-4 py-2 rounded flex items-center justify-center gap-2 transition-colors ${variantClasses[variant]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
      ) : icon ? (
        <span>{icon}</span>
      ) : null}
      <span>{label}</span>
    </button>
  );
}
