/**
 * Date Field Component
 * 
 * A reusable date input field with validation and error handling.
 * 
 * @source directory-structure.md - "Form Components" section
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label.client';
import { Input } from '@/components/ui/input.client';
import { Calendar } from '@/components/ui/calendar.client';
import { Button } from '@/components/ui/button.client';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.client';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateFieldProps {
  label: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  id?: string;
}

export function DateField({
  label,
  value,
  onChange,
  error,
  hint,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  className,
  id,
}: DateFieldProps) {
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
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={fieldId}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal min-h-10",
              !value && "text-muted-foreground",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, 'PPP') : <span>Select a date</span>}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={disabled || ((date) => {
              const isBeforeMin = minDate && date < minDate;
              const isAfterMax = maxDate && date > maxDate;
              return isBeforeMin || isAfterMax;
            })}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
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
