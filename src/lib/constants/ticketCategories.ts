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
