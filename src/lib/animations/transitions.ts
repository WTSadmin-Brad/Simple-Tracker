/**
 * Framer Motion transition presets
 * 
 * @source directory-structure.md - "Animation Utilities" section
 * @source Employee_Flows.md - "Animation Guidelines" section
 */

import { Transition } from 'framer-motion';
import { defaultSpring, softSpring, stiffSpring } from './springs';

/**
 * Default transition
 * General-purpose transition for most UI elements
 */
export const defaultTransition: Transition = {
  ...defaultSpring
};

/**
 * Quick transition
 * For immediate feedback animations
 */
export const quickTransition: Transition = {
  ...stiffSpring
};

/**
 * Smooth transition
 * For subtle, gentle animations
 */
export const smoothTransition: Transition = {
  ...softSpring
};

/**
 * Staggered children transition
 * For animating lists of items with a stagger effect
 */
export const staggeredChildrenTransition: Transition = {
  ...defaultSpring,
  staggerChildren: 0.05,
  delayChildren: 0.1
};

/**
 * Color transition
 * Specifically for color changes, uses tween instead of spring
 */
export const colorTransition: Transition = {
  type: 'tween',
  duration: 0.3,
  ease: 'easeInOut'
};

/**
 * Counter color transition
 * Specifically for counter color changes based on value
 * Red(0) → Yellow(1-84) → Green(85-124) → Gold(125-150)
 */
export const counterColorTransition: Transition = {
  type: 'tween',
  duration: 0.4,
  ease: 'easeOut'
};

/**
 * Delayed transition
 * For elements that should animate after others
 * 
 * @param delay - Delay in seconds before animation starts
 * @returns Transition with the specified delay
 */
export function delayedTransition(delay: number): Transition {
  return {
    ...defaultSpring,
    delay
  };
}

/**
 * Responsive transition
 * Adjusts based on reduced motion preferences
 * 
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Appropriate transition based on preference
 */
export function accessibleTransition(prefersReducedMotion: boolean): Transition {
  if (prefersReducedMotion) {
    // Use minimal animation for reduced motion preference
    return {
      type: 'tween',
      duration: 0.1,
      ease: 'linear'
    };
  }
  
  // Use default spring animation otherwise
  return defaultTransition;
}
