/**
 * loading-spinner.tsx
 * Common component for displaying loading states for operations in progress
 */

import React from 'react';
import { cn } from "@/lib/utils";

/**
 * Props for the LoadingSpinner component
 */
interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Optional text label to display alongside the spinner */
  label?: string;
  /** Additional classes to apply to the container */
  className?: string;
  /** Position of the label relative to the spinner */
  labelPosition?: 'left' | 'right';
  /** Spinner color - defaults to primary color from theme */
  color?: 'primary' | 'secondary' | 'destructive' | 'muted' | 'white';
  /** Whether the spinner should take up the full width of its container */
  fullWidth?: boolean;
  /** For accessibility - describes what is loading */
  ariaLabel?: string;
}

/**
 * A versatile loading spinner component that can be used for various loading states
 * across the application, such as form submissions, data fetching, and file operations.
 * 
 * @example
 * // Basic usage
 * <LoadingSpinner />
 * 
 * @example
 * // With label
 * <LoadingSpinner label="Loading data..." />
 * 
 * @example
 * // Different size and color
 * <LoadingSpinner size="lg" color="secondary" />
 * 
 * @example
 * // Inside a button
 * <Button disabled={isLoading}>
 *   {isLoading ? <LoadingSpinner size="sm" color="white" /> : "Submit"}
 * </Button>
 */
const LoadingSpinner = ({
  size = 'md',
  label,
  className,
  labelPosition = 'right',
  color = 'primary',
  fullWidth = false,
  ariaLabel = 'Loading',
}: LoadingSpinnerProps) => {
  // Size mappings
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  // Color mappings
  const colorClasses = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    destructive: 'text-destructive',
    muted: 'text-muted-foreground',
    white: 'text-white',
  };
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center",
        fullWidth && "w-full",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {label && labelPosition === 'left' && (
        <span className={cn("mr-2 text-sm", colorClasses[color])}>{label}</span>
      )}
      
      <svg 
        className={cn("animate-spin", sizeClasses[size], colorClasses[color])} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      
      {label && labelPosition === 'right' && (
        <span className={cn("ml-2 text-sm", colorClasses[color])}>{label}</span>
      )}
      
      {/* Visually hidden text for screen readers */}
      <span className="sr-only">{ariaLabel}</span>
    </div>
  );
};

export default LoadingSpinner;
