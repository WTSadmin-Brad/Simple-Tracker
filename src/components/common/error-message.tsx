/**
 * Error Message Component
 * 
 * A standardized way to display error messages throughout the application with
 * consistent styling, icons, and accessibility features.
 * 
 * @example
 * // Basic usage
 * <ErrorMessage message="Something went wrong" />
 * 
 * // With custom ID for aria-describedby
 * <ErrorMessage id="password-error" message="Password must be at least 8 characters" />
 * 
 * // With icon disabled
 * <ErrorMessage message="Invalid input" showIcon={false} />
 * 
 * // With custom severity
 * <ErrorMessage message="Please check your input" severity="warning" />
 */

import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

export interface ErrorMessageProps {
  /** The error message to display */
  message?: string;
  /** Optional ID for accessibility (used with aria-describedby) */
  id?: string;
  /** Whether to show the icon (default: true) */
  showIcon?: boolean;
  /** The severity of the error (default: 'error') */
  severity?: ErrorSeverity;
  /** Optional additional CSS classes */
  className?: string;
}

export function ErrorMessage({
  message,
  id,
  showIcon = true,
  severity = 'error',
  className,
}: ErrorMessageProps) {
  // If no message is provided, don't render anything
  if (!message) return null;

  // Map severity to icon and colors
  const severityConfig = {
    error: {
      icon: AlertCircle,
      textColor: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    warning: {
      icon: AlertTriangle,
      textColor: 'text-warning-foreground',
      bgColor: 'bg-warning/10',
    },
    info: {
      icon: Info,
      textColor: 'text-info-foreground',
      bgColor: 'bg-info/10',
    },
    success: {
      icon: CheckCircle,
      textColor: 'text-success-foreground',
      bgColor: 'bg-success/10',
    },
  };

  const { icon: Icon, textColor, bgColor } = severityConfig[severity];

  return (
    <div
      id={id}
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
        bgColor,
        textColor,
        className
      )}
      role={severity === 'error' ? 'alert' : 'status'}
      aria-live={severity === 'error' ? 'assertive' : 'polite'}
    >
      {showIcon && <Icon className="h-4 w-4" />}
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;
