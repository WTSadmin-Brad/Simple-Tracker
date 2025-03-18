/**
 * Counter Field Component
 * 
 * A specialized counter input field for ticket categories with color transitions.
 * Color transitions: Red(0) → Yellow(1-84) → Green(85-124) → Gold(125-150)
 * 
 * @source directory-structure.md - "Form Components" section
 * @source Employee_Flows.md - "Ticket Submission Wizard Flow" section
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label.client';
import { Button } from '@/components/ui/button.client';
import { Input } from '@/components/ui/input.client';
import { cn } from '@/lib/utils';
import { MinusIcon, PlusIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { CounterColorState } from '@/types/tickets';
import { getCounterColorState } from '@/lib/constants/ticketCategories';

interface CounterFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function CounterField({
  label,
  value,
  onChange,
  min = 0,
  max = 150,
  step = 1,
  error,
  hint,
  disabled = false,
  className,
  id,
}: CounterFieldProps) {
  // Generate a unique ID if none is provided
  const fieldId = id || `counter-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  
  // Track the color state based on value
  const [colorState, setColorState] = useState<CounterColorState>(
    getCounterColorState(value)
  );
  
  // Update color state when value changes
  useEffect(() => {
    setColorState(getCounterColorState(value));
  }, [value]);
  
  // Check if reduced motion is preferred
  const prefersReducedMotion = useReducedMotion();
  
  // Handle increment
  const handleIncrement = () => {
    if (value < max) {
      onChange(Math.min(value + step, max));
    }
  };
  
  // Handle decrement
  const handleDecrement = () => {
    if (value > min) {
      onChange(Math.max(value - step, min));
    }
  };
  
  // Handle direct input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    
    if (!isNaN(newValue)) {
      // Clamp value between min and max
      const clampedValue = Math.max(min, Math.min(newValue, max));
      onChange(clampedValue);
    }
  };
  
  // Get color classes based on color state
  const getColorClasses = (state: CounterColorState) => {
    switch (state) {
      case 'red':
        return 'bg-counter-red text-white';
      case 'yellow':
        return 'bg-counter-yellow text-black';
      case 'green':
        return 'bg-counter-green text-white';
      case 'gold':
        return 'bg-counter-gold text-black';
      default:
        return 'bg-counter-red text-white';
    }
  };
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            error ? "text-destructive" : "text-foreground"
          )}
        >
          {label}
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
          className="touch-target h-11 w-11"
          aria-label={`Decrease ${label}`}
        >
          <MinusIcon className="h-4 w-4" />
        </Button>
        
        <motion.div
          className="relative flex-1"
          animate={{ scale: value === 0 ? 1 : 1.05 }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 30,
            duration: prefersReducedMotion ? 0.1 : 0.3
          }}
        >
          <Input
            id={fieldId}
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className={cn(
              "text-center text-lg font-medium h-11",
              error && "border-destructive focus-visible:ring-destructive"
            )}
            aria-invalid={!!error}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
          />
          
          <motion.div
            className={cn(
              "absolute inset-0 -z-10 rounded-md opacity-20",
              getColorClasses(colorState)
            )}
            animate={{ 
              opacity: prefersReducedMotion ? 0.2 : 0.3,
              scale: prefersReducedMotion ? 1 : 1.05
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 500, 
              damping: 30 
            }}
          />
        </motion.div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
          className="touch-target h-11 w-11"
          aria-label={`Increase ${label}`}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      
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
