/**
 * Framer Motion spring animation presets
 * 
 * @source directory-structure.md - "Animation Utilities" section
 * @source Employee_Flows.md - "Animation Guidelines" section
 */

import { type Spring } from 'framer-motion';

/**
 * Default spring configuration
 * Balanced spring for most UI animations
 */
export const defaultSpring: Spring = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 1
};

/**
 * Responsive spring configuration
 * Adjusts based on device performance
 * 
 * @param performanceLevel - Performance level (1-5, where 5 is highest)
 * @returns Appropriate spring configuration
 */
export function responsiveSpring(performanceLevel: number): Spring {
  // Adjust spring parameters based on performance level
  const stiffness = Math.max(200, Math.min(500, performanceLevel * 100));
  const damping = Math.max(20, Math.min(40, 20 + performanceLevel * 4));
  
  return {
    type: 'spring',
    stiffness,
    damping,
    mass: 1
  };
}

/**
 * Soft spring configuration
 * For subtle, gentle animations
 */
export const softSpring: Spring = {
  type: 'spring',
  stiffness: 200,
  damping: 30,
  mass: 1
};

/**
 * Bouncy spring configuration
 * For playful, energetic animations
 */
export const bouncySpring: Spring = {
  type: 'spring',
  stiffness: 400,
  damping: 10,
  mass: 1
};

/**
 * Stiff spring configuration
 * For quick, responsive animations
 */
export const stiffSpring: Spring = {
  type: 'spring',
  stiffness: 600,
  damping: 35,
  mass: 1
};

/**
 * Wizard transition spring
 * Specifically tuned for wizard step transitions
 */
export const wizardTransitionSpring: Spring = {
  type: 'spring',
  stiffness: 350,
  damping: 25,
  mass: 1
};

/**
 * Counter animation spring
 * Specifically tuned for counter animations
 */
export const counterSpring: Spring = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
  mass: 1
};
