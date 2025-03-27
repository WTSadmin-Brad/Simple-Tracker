/**
 * checkbox-field.client.tsx
 * 
 * A reusable checkbox input field with validation and error handling.
 * 
 * @source directory-structure.md - "Form Components" section
 */

'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox.client';
import { Label } from '@/components/ui/label.client';
import { cn } from '@/lib/utils';

interface CheckboxFieldProps {
  label: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function CheckboxField({
  label,
  checked = false,
  onChange,
  error,
  hint,
  disabled = false,
  className,
  id,
}: CheckboxFieldProps) {
  // Generate a unique ID if none is provided
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  
  return (
    <div className={cn("space-y-2", className)}>
      {/* Checkbox with label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id={fieldId}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            "touch-target"
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
        />
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            error ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </Label>
      </div>
      
      {/* Error message */}
      {error && (
        <p 
          id={errorId}
          className="text-sm font-medium text-destructive pl-6"
        >
          {error}
        </p>
      )}
      
      {/* Hint text */}
      {hint && !error && (
        <p 
          id={hintId}
          className="text-sm text-muted-foreground pl-6"
        >
          {hint}
        </p>
      )}
    </div>
  );
}
