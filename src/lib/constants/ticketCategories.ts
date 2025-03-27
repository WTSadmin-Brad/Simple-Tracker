/**
 * Ticket category definitions
 * 
 * @source directory-structure.md - "Shared Utilities" section
 * @source Employee_Flows.md - "Ticket Submission Wizard Flow" section
 */

import { CounterColorState } from '../../types/tickets';

/**
 * Ticket categories
 * The 6 specific categories used in the Categories step of the wizard
 */
export const TICKET_CATEGORIES = [
  'Hangers',
  'Leaners',
  'Downs',
  'Broken',
  'Damaged',
  'Other',
] as const;

export type TicketCategory = typeof TICKET_CATEGORIES[number];

/**
 * Category descriptions
 * Descriptions for each category to display in the UI
 */
export const CATEGORY_DESCRIPTIONS: Record<TicketCategory, string> = {
  'Hangers': 'Signs hanging properly on poles',
  'Leaners': 'Signs leaning but still visible',
  'Downs': 'Signs that have fallen down',
  'Broken': 'Signs with broken components',
  'Damaged': 'Signs with visible damage',
  'Other': 'Other sign conditions',
};

/**
 * Category limits
 * Min and max values for each category counter
 */
export const CATEGORY_LIMITS: Record<TicketCategory, { min: number; max: number }> = {
  'Hangers': { min: 0, max: 150 },
  'Leaners': { min: 0, max: 150 },
  'Downs': { min: 0, max: 150 },
  'Broken': { min: 0, max: 150 },
  'Damaged': { min: 0, max: 150 },
  'Other': { min: 0, max: 150 },
};

/**
 * Color transition thresholds
 * Thresholds for counter color transitions
 * Red(0) → Yellow(1-84) → Green(85-124) → Gold(125-150)
 */
export const COLOR_THRESHOLDS = {
  RED: 0,
  YELLOW: 1,
  GREEN: 85,
  GOLD: 125,
  MAX: 150,
};

/**
 * Get counter color state based on value
 * 
 * @param value - Counter value
 * @returns Color state (red, yellow, green, gold)
 */
export function getCounterColorState(value: number): CounterColorState {
  if (value === COLOR_THRESHOLDS.RED) return 'red';
  if (value >= COLOR_THRESHOLDS.GOLD) return 'gold';
  if (value >= COLOR_THRESHOLDS.GREEN) return 'green';
  if (value >= COLOR_THRESHOLDS.YELLOW) return 'yellow';
  return 'red';
}

/**
 * Get counter color CSS class based on value
 * 
 * @param value - Counter value
 * @returns CSS class string for the counter
 */
export function getCounterColorClass(value: number): string {
  const colorState = getCounterColorState(value);
  
  switch (colorState) {
    case 'red':
      return 'bg-counter-red text-white';
    case 'yellow':
      return 'bg-counter-yellow text-black';
    case 'green':
      return 'bg-counter-green text-white';
    case 'gold':
      return 'bg-counter-gold text-black';
    default:
      return 'bg-counter-red text-white';
  }
}

/**
 * Get counter gradient based on value
 * 
 * @param value - Counter value
 * @returns CSS gradient string for the counter
 */
export function getCounterGradient(value: number): string {
  if (value === COLOR_THRESHOLDS.RED) {
    // Red gradient for 0
    return 'linear-gradient(135deg, hsl(0, 84%, 55%), hsl(0, 84%, 65%))';
  } else if (value >= COLOR_THRESHOLDS.YELLOW && value < COLOR_THRESHOLDS.GREEN) {
    // Calculate a gradient that shifts from red to yellow based on position in range
    const percentage = (value - COLOR_THRESHOLDS.YELLOW) / (COLOR_THRESHOLDS.GREEN - COLOR_THRESHOLDS.YELLOW - 1);
    return `linear-gradient(135deg, 
      hsl(${Math.round(percentage * 45)}, 90%, 55%), 
      hsl(${Math.round(percentage * 45 + 5)}, 90%, 65%))`;
  } else if (value >= COLOR_THRESHOLDS.GREEN && value < COLOR_THRESHOLDS.GOLD) {
    // Calculate a gradient that shifts from yellow to green based on position in range
    const percentage = (value - COLOR_THRESHOLDS.GREEN) / (COLOR_THRESHOLDS.GOLD - COLOR_THRESHOLDS.GREEN - 1);
    return `linear-gradient(135deg, 
      hsl(${Math.round(45 + percentage * 97)}, 80%, 45%), 
      hsl(${Math.round(45 + percentage * 97 + 5)}, 80%, 55%))`;
  } else {
    // Gold gradient for 125-150
    return 'linear-gradient(135deg, hsl(43, 96%, 50%), hsl(43, 96%, 60%))';
  }
}

/**
 * Get solid counter color for fallback and compatibility
 * 
 * @param value - Counter value
 * @returns CSS color variable for the counter
 */
export function getCounterSolidColor(value: number): string {
  const colorState = getCounterColorState(value);
  
  switch (colorState) {
    case 'red':
      return 'var(--counter-red)';
    case 'yellow':
      return 'var(--counter-yellow)';
    case 'green':
      return 'var(--counter-green)';
    case 'gold':
      return 'var(--counter-gold)';
    default:
      return 'var(--counter-red)';
  }
}

/**
 * Initial category values
 * Default values for each category counter
 */
export const INITIAL_CATEGORY_VALUES: Record<TicketCategory, number> = {
  'Hangers': 0,
  'Leaners': 0,
  'Downs': 0,
  'Broken': 0,
  'Damaged': 0,
  'Other': 0,
};
