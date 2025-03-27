/**
 * workdayHelpers.ts
 * Helper functions for workday-related operations and styling
 */

import { WorkdayType } from '@/types/workday';

/**
 * Returns appropriate color classes based on work type for calendar cells
 * Used by calendar components to maintain consistent styling
 */
export const getWorkTypeColorClass = (type?: WorkdayType): string => {
  switch (type) {
    case 'full': 
      return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
    case 'half': 
      return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
    case 'off': 
      return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
    default: 
      return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }
};

/**
 * Returns color classes for filter buttons based on work type
 */
export const getWorkTypeFilterColor = (type: WorkdayType): string => {
  switch (type) {
    case 'full': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
    case 'half': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
    case 'off': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
    default: return '';
  }
};

/**
 * Returns color classes for badges and indicators based on work type
 */
export const getWorkTypeBadgeColor = (type: WorkdayType): string => {
  switch (type) {
    case 'full': return 'bg-green-100 text-green-800 border-green-200';
    case 'half': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'off': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

/**
 * Returns a descriptive label for each work type
 */
export const getWorkTypeLabel = (type?: WorkdayType): string => {
  switch (type) {
    case 'full': return 'Full Day';
    case 'half': return 'Half Day';
    case 'off': return 'Day Off';
    default: return 'Not Set';
  }
};
