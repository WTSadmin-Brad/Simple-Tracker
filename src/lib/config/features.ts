/**
 * Feature flags and configuration
 * 
 * @source directory-structure.md - "Shared Utilities" section
 */

/**
 * Feature flag configuration
 * Enables or disables specific features in the application
 */
export const FEATURES = {
  // Core features
  TICKET_WIZARD: true,
  WORKDAY_CALENDAR: true,
  
  // Animation features
  REDUCED_MOTION_SUPPORT: true,
  COUNTER_COLOR_TRANSITIONS: true,
  WIZARD_STEP_ANIMATIONS: true,
  
  // Persistence features
  WIZARD_STATE_PERSISTENCE: true,
  WIZARD_STATE_EXPIRATION: true,
  
  // Performance features
  DEVICE_PERFORMANCE_DETECTION: true,
  RESPONSIVE_ANIMATIONS: true,
  
  // Accessibility features
  SCREEN_READER_ANNOUNCEMENTS: true,
  FOCUS_MANAGEMENT: true,
  
  // Mobile-specific features
  HAPTIC_FEEDBACK: true,
  SWIPE_NAVIGATION: true,
  BOTTOM_SHEETS: true,
};

/**
 * Feature configuration
 * Configuration options for enabled features
 */
export const FEATURE_CONFIG = {
  // Wizard configuration
  WIZARD: {
    STEPS: 4,
    PERSISTENCE_KEY: 'ticket-wizard-state',
    EXPIRATION_HOURS: 24,
  },
  
  // Counter configuration
  COUNTERS: {
    MIN_VALUE: 0,
    MAX_VALUE: 150,
    COLOR_THRESHOLDS: {
      RED: 0,
      YELLOW: 1,
      GREEN: 85,
      GOLD: 125,
    },
  },
  
  // Animation configuration
  ANIMATIONS: {
    DEFAULT_DURATION: 0.3,
    REDUCED_MOTION_DURATION: 0.1,
  },
  
  // Touch target configuration
  TOUCH_TARGETS: {
    MIN_SIZE: 44, // 44×44px minimum touch target size
  },
};

/**
 * Check if a feature is enabled
 * 
 * @param featureName - Name of the feature to check
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(featureName: keyof typeof FEATURES): boolean {
  return FEATURES[featureName];
}

/**
 * Get configuration for a feature
 * 
 * @param configSection - Configuration section to retrieve
 * @returns Configuration object for the specified section
 */
export function getFeatureConfig<K extends keyof typeof FEATURE_CONFIG>(
  configSection: K
): typeof FEATURE_CONFIG[K] {
  return FEATURE_CONFIG[configSection];
}
