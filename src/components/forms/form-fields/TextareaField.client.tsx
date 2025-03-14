/**
 * Textarea Field Component
 * 
 * A reusable textarea input field with validation and error handling.
 * 
 * @source directory-structure.md - "Form Components" section
 */

'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea.client';
import { Label } from '@/components/ui/label.client';
import { cn } from '@/lib/utils';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function TextareaField({
  label,
  error,
  hint,
  required = false,
  className,
  id,
  ...props
}: TextareaFieldProps) {
  // Generate a unique ID if none is provided
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            error ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      
      <Textarea
        id={fieldId}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        aria-invalid={!!error}
        aria-describedby={
          error ? errorId : hint ? hintId : undefined
        }
        {...props}
      />
      
      {error && (
        <p 
          id={errorId}
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}
      
      {hint && !error && (
        <p 
          id={hintId}
          className="text-sm text-muted-foreground"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
