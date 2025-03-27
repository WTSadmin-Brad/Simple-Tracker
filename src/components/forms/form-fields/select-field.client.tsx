/**
 * Select Field Component
 * 
 * A reusable select input field with validation and error handling.
 * 
 * @source directory-structure.md - "Form Components" section
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label.client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select.client';
import { cn } from '@/lib/utils';

/**
 * Interface for select options
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Interface for select field props
 */
interface SelectFieldProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/**
 * SelectField component
 * 
 * A reusable select input field with validation and error handling.
 */
export function SelectField({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  required = false,
  placeholder = 'Select an option',
  disabled = false,
  className,
  id,
}: SelectFieldProps) {
  // Generate a unique ID if none is provided
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  
  return (
    <div className="space-y-2">
      {/* Field label */}
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
      
      {/* Select dropdown */}
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id={fieldId}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive",
            "min-h-10",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {/* Error message */}
      {error && (
        <p 
          id={errorId}
          className="text-sm font-medium text-destructive"
        >
          {error}
        </p>
      )}
      
      {/* Hint text */}
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
