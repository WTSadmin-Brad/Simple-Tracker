/**
 * Hook for wizard animations using Framer Motion
 * Provides consistent animation patterns with accessibility support
 * for the ticket submission wizard.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source Ticket_Submission.md - "Animation Guidelines" section
 */

import { useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Animation direction for transitions
 */
type AnimationDirection = 'forward' | 'backward';

/**
 * Animation variants for step transitions
 */
interface StepTransitionVariants {
  /** Initial state (before animation starts) */
  initial: {
    x?: string;
    opacity: number;
  };
  /** Animate to state */
  animate: {
    x?: number | string;
    opacity: number;
  };
  /** Exit state (when component is removed) */
  exit: {
    x?: string;
    opacity: number;
  };
  /** Transition configuration */
  transition: {
    type: string;
    stiffness?: number;
    damping?: number;
    duration?: number;
  };
}

/**
 * Color transition properties
 */
interface ColorTransition {
  /** Background color to transition to */
  backgroundColor: string;
  /** Transition configuration */
  transition: {
    type: string;
    stiffness: number;
    damping: number;
  };
}

/**
 * Progress animation properties
 */
interface ProgressAnimation {
  /** Width of progress bar (as percentage) */
  width: string;
  /** Transition configuration */
  transition: {
    type: string;
    stiffness: number;
    damping: number;
  };
}

/**
 * Return type for useWizardAnimations hook
 */
interface UseWizardAnimationsReturn {
  /** Get step transition variants based on direction */
  getStepTransition: (direction: AnimationDirection) => StepTransitionVariants;
  /** Get counter color transition based on count value */
  getCounterColorTransition: (count: number) => ColorTransition;
  /** Get progress indicator animation */
  getProgressAnimation: (step: number, totalSteps: number) => ProgressAnimation;
}

/**
 * Hook for managing wizard animations with Framer Motion
 * Provides consistent animation patterns with accessibility support
 * 
 * @returns Animation utility functions for wizard components
 */
export function useWizardAnimations(): UseWizardAnimationsReturn {
  // Use reduced motion hook to respect user preferences
  const prefersReducedMotion = useReducedMotion();

  /**
   * Get step transition variants based on direction
   * 
   * @param direction - Direction of animation (forward or backward)
   * @returns Framer Motion variants for step transitions
   */
  const getStepTransition = useCallback((direction: AnimationDirection): StepTransitionVariants => {
    // Return simplified variants if reduced motion is preferred
    if (prefersReducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2 }
      };
    }

    // Full animation variants based on direction
    return {
      initial: { 
        x: direction === 'forward' ? '100%' : '-100%',
        opacity: 0 
      },
      animate: { 
        x: 0,
        opacity: 1 
      },
      exit: { 
        x: direction === 'forward' ? '-100%' : '100%',
        opacity: 0 
      },
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    };
  }, [prefersReducedMotion]);

  /**
   * Get counter color transition based on count value
   * Red(0) → Yellow(1-84) → Green(85-124) → Gold(125-150)
   * 
   * @param count - Current counter value
   * @returns Color transition properties for Framer Motion
   */
  const getCounterColorTransition = useCallback((count: number): ColorTransition => {
    // Determine color based on count ranges
    let color = '';
    if (count === 0) {
      color = 'var(--counter-red)';
    } else if (count >= 1 && count <= 84) {
      color = 'var(--counter-yellow)';
    } else if (count >= 85 && count <= 124) {
      color = 'var(--counter-green)';
    } else if (count >= 125) {
      color = 'var(--counter-gold)';
    }

    return {
      backgroundColor: color,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 20
      }
    };
  }, []);

  /**
   * Get progress indicator animation
   * 
   * @param step - Current step (1-indexed)
   * @param totalSteps - Total number of steps
   * @returns Progress animation properties for Framer Motion
   */
  const getProgressAnimation = useCallback((step: number, totalSteps: number): ProgressAnimation => {
    const progress = (step / totalSteps) * 100;
    
    return {
      width: `${progress}%`,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    };
  }, []);

  return {
    getStepTransition,
    getCounterColorTransition,
    getProgressAnimation
  };
}
