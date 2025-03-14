/**
 * Framer Motion animation variants
 * 
 * @source directory-structure.md - "Animation Utilities" section
 * @source Employee_Flows.md - "Animation Guidelines" section
 */

import { Variants } from 'framer-motion';
import { defaultSpring, softSpring, stiffSpring, wizardTransitionSpring } from './springs';

/**
 * Fade in/out animation variants
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: defaultSpring
  },
  exit: { 
    opacity: 0,
    transition: { ...defaultSpring, damping: 25 }
  }
};

/**
 * Slide up animation variants
 */
export const slideUpVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: defaultSpring
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { ...defaultSpring, damping: 25 }
  }
};

/**
 * Slide down animation variants
 */
export const slideDownVariants: Variants = {
  hidden: { y: -20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: defaultSpring
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { ...defaultSpring, damping: 25 }
  }
};

/**
 * Scale animation variants
 */
export const scaleVariants: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: defaultSpring
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { ...defaultSpring, damping: 25 }
  }
};

/**
 * Wizard step transition variants
 * For animating between wizard steps
 */
export const wizardStepVariants: Variants = {
  // Initial state (entering from right)
  enterFromRight: { 
    x: '100%', 
    opacity: 0 
  },
  // Initial state (entering from left)
  enterFromLeft: { 
    x: '-100%', 
    opacity: 0 
  },
  // Active/visible state
  active: { 
    x: 0, 
    opacity: 1,
    transition: wizardTransitionSpring
  },
  // Exit to left
  exitToLeft: { 
    x: '-100%', 
    opacity: 0,
    transition: wizardTransitionSpring
  },
  // Exit to right
  exitToRight: { 
    x: '100%', 
    opacity: 0,
    transition: wizardTransitionSpring
  }
};

/**
 * Bottom sheet animation variants
 */
export const bottomSheetVariants: Variants = {
  hidden: { y: '100%' },
  visible: { 
    y: 0,
    transition: stiffSpring
  },
  exit: { 
    y: '100%',
    transition: { ...softSpring, damping: 40 }
  }
};

/**
 * Counter animation variants
 * For animating counter value changes
 */
export const counterVariants: Variants = {
  initial: { scale: 1 },
  increment: { 
    scale: [1, 1.1, 1],
    transition: { duration: 0.3, times: [0, 0.5, 1] }
  },
  decrement: { 
    scale: [1, 0.9, 1],
    transition: { duration: 0.3, times: [0, 0.5, 1] }
  }
};

/**
 * List item animation variants
 * For animating items in a list
 */
export const listItemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      ...defaultSpring,
      delay: custom * 0.05 // Stagger based on item index
    }
  }),
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { ...defaultSpring, damping: 25 }
  }
};
