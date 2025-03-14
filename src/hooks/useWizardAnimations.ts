/**
 * Hook for wizard animations using Framer Motion
 * 
 * @source directory-structure.md - "Custom Hooks" section
 * @source MEMORY - "All animations must use Framer Motion with spring physics"
 */

import { useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * Animation variants for wizard steps
 */
type AnimationDirection = 'forward' | 'backward';

/**
 * Hook for managing wizard animations with Framer Motion
 * 
 * TODO: Implement actual animation variants with Framer Motion
 */
export function useWizardAnimations() {
  // Use reduced motion hook to respect user preferences
  const prefersReducedMotion = useReducedMotion();

  /**
   * Get step transition variants based on direction
   */
  const getStepTransition = useCallback((direction: AnimationDirection) => {
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
   */
  const getCounterColorTransition = useCallback((count: number) => {
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
   */
  const getProgressAnimation = useCallback((step: number, totalSteps: number) => {
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
