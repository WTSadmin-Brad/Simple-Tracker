/**
 * Accessibility-focused animation utilities
 * 
 * @source directory-structure.md - "Animation Utilities" section
 * @source Employee_Flows.md - "Accessibility" section
 */

import { Transition, Variants } from 'framer-motion';

/**
 * Generate accessible variants based on reduced motion preference
 * 
 * @param standardVariants - Standard animation variants
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Appropriate variants based on preference
 */
export function getAccessibleVariants(
  standardVariants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (!prefersReducedMotion) {
    return standardVariants;
  }
  
  // Create reduced motion variants by removing transform properties
  // and keeping only opacity changes with minimal duration
  const reducedVariants: Variants = {};
  
  // Process each animation state in the standard variants
  Object.keys(standardVariants).forEach(key => {
    const variant = standardVariants[key];
    
    // Skip if variant is a function
    if (typeof variant === 'function') {
      reducedVariants[key] = variant;
      return;
    }
    
    // Create a reduced motion version that only uses opacity
    reducedVariants[key] = {
      opacity: variant.opacity,
      transition: {
        type: 'tween',
        duration: 0.1,
        ease: 'linear'
      }
    };
  });
  
  return reducedVariants;
}

/**
 * Get accessible transition based on reduced motion preference
 * 
 * @param standardTransition - Standard animation transition
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Appropriate transition based on preference
 */
export function getAccessibleTransition(
  standardTransition: Transition,
  prefersReducedMotion: boolean
): Transition {
  if (!prefersReducedMotion) {
    return standardTransition;
  }
  
  // Return minimal transition for reduced motion
  return {
    type: 'tween',
    duration: 0.1,
    ease: 'linear'
  };
}

/**
 * Generate screen reader announcement for wizard step changes
 * 
 * @param stepNumber - Current wizard step number (1-4)
 * @returns Announcement text for screen readers
 */
export function getWizardStepAnnouncement(stepNumber: number): string {
  switch (stepNumber) {
    case 1:
      return 'Step 1 of 4: Basic Info. Enter date, truck, and jobsite information.';
    case 2:
      return 'Step 2 of 4: Categories. Enter counts for each category.';
    case 3:
      return 'Step 3 of 4: Image Upload. Upload up to 10 images.';
    case 4:
      return 'Step 4 of 4: Confirmation. Review and submit your ticket.';
    default:
      return `Step ${stepNumber} of 4.`;
  }
}
