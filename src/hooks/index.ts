/**
 * Custom React Hooks Index
 * 
 * This file exports all custom hooks used in the Simple Tracker application,
 * organized by their purpose for easy imports throughout the codebase.
 * 
 * @source directory-structure.md - "Custom Hooks" section
 */

// ===== Authentication Hooks =====
/**
 * Authentication and user management
 */
export * from './useAuth';

// ===== Data Fetching Hooks =====
/**
 * TanStack Query-based data fetching hooks
 */
export * from './queries';

/**
 * Data management hooks
 * Note: These are being migrated to TanStack Query patterns
 */
export * from './useTickets';
export * from './useWorkdays';
export * from './useJobsites';
export * from './useTrucks';

// ===== Admin Data Management Hooks =====
/**
 * Admin interface data grid management
 */
export * from './useAdminDataGrid';

// ===== UI and Responsive Design Hooks =====
/**
 * Device and performance optimization
 */
export * from './useDevicePerformance';

/**
 * Responsive design and media queries
 */
export * from './useMediaQuery';

/**
 * Accessibility hooks
 */
export * from './useReducedMotion';

/**
 * Animation hooks
 */
export * from './useWizardAnimations';

// ===== Feature-specific Hooks =====
/**
 * Image upload and management
 */
export * from './useImageUpload';

/**
 * Wizard flow API integration
 */
export * from './useWizardApi';
