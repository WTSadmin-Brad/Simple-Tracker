/**
 * Counter.client.tsx
 * Client Component for interactive counters with color transitions
 * Color transitions: Red(0) → Yellow(1-84) → Green(85-124) → Gold(125-150)
 */
'use client';

import { useState, useCallback, useId } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { getCounterColorClass, COLOR_THRESHOLDS } from '@/lib/constants/ticketCategories';
import { counterSpring } from '@/lib/animations/springs';
import { CounterProps } from './ticket-types';

const Counter = ({
  label,
  value,
  onChange,
  min = 0,
  max = COLOR_THRESHOLDS.MAX,
  className,
  size = 'md'
}: CounterProps) => {
  const prefersReducedMotion = useReducedMotion();
  const counterLabelId = useId();
  
  const handleIncrement = useCallback(() => {
    if (value < max) {
      onChange(value + 1);
    }
  }, [value, max, onChange]);
  
  const handleDecrement = useCallback(() => {
    if (value > min) {
      onChange(value - 1);
    }
  }, [value, min, onChange]);

  // Size-based classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'gap-1',
          counter: 'w-12 h-12 text-lg',
          button: 'h-9 w-9'
        };
      case 'lg':
        return {
          container: 'gap-3',
          counter: 'w-20 h-20 text-2xl',
          button: 'h-12 w-12'
        };
      default: // 'md'
        return {
          container: 'gap-2',
          counter: 'w-16 h-16 text-xl',
          button: 'h-11 w-11'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={cn("flex flex-col items-center", className)} role="group" aria-labelledby={counterLabelId}>
      <span id={counterLabelId} className="text-sm font-medium mb-1">{label}</span>
      <div className={cn("flex items-center", sizeClasses.container)}>
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleDecrement}
          disabled={value <= min}
          className={cn("touch-target", sizeClasses.button)}
          aria-label={`Decrease ${label}`}
          aria-controls={`counter-${counterLabelId}`}
        >
          <span aria-hidden="true">-</span>
        </Button>
        
        <motion.div
          id={`counter-${counterLabelId}`}
          className={cn(
            "rounded-full flex items-center justify-center font-bold transition-colors",
            getCounterColorClass(value),
            sizeClasses.counter
          )}
          initial={false}
          animate={{ 
            scale: prefersReducedMotion ? 1 : value === 0 ? 0.95 : 1
          }}
          transition={counterSpring}
          role="status"
          aria-label={`${label} count: ${value}`}
          aria-live="polite"
        >
          {value}
        </motion.div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={handleIncrement}
          disabled={value >= max}
          className={cn("touch-target", sizeClasses.button)}
          aria-label={`Increase ${label}`}
          aria-controls={`counter-${counterLabelId}`}
        >
          <span aria-hidden="true">+</span>
        </Button>
      </div>
    </div>
  );
};

export default Counter;
