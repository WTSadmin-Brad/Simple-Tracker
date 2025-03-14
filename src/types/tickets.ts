/**
 * Ticket type definitions
 * 
 * @source Employee_Flows.md - "Ticket Submission Wizard Flow" section
 * @source MEMORY - "Simple Tracker is a mobile-first PWA for field workers to log workdays and submit tickets with images"
 */

/**
 * Ticket category with color thresholds
 */
export interface TicketCategory {
  id: string;
  name: string;
  count: number;
  min: number;
  max: number;
}

/**
 * Color states for counters based on count values
 * Red(0) → Yellow(1-84) → Green(85-124) → Gold(125-150)
 */
export type CounterColorState = 'red' | 'yellow' | 'green' | 'gold';

/**
 * Ticket data structure
 */
export interface Ticket {
  id: string;
  date: string;
  jobsite: string;
  jobsiteName: string;
  truck: string;
  truckName: string;
  categories: {
    id: string;
    name: string;
    count: number;
  }[];
  images: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Wizard step data for Basic Info (Step 1)
 */
export interface WizardStep1Data {
  date: string;
  jobsite: string;
  truck: string;
}

/**
 * Wizard step data for Categories (Step 2)
 */
export interface WizardStep2Data {
  categories: {
    id: string;
    name: string;
    count: number;
  }[];
}

/**
 * Wizard step data for Image Upload (Step 3)
 */
export interface WizardStep3Data {
  images: string[];
}

/**
 * Complete wizard data structure
 */
export interface WizardData {
  step1: WizardStep1Data;
  step2: WizardStep2Data;
  step3: WizardStep3Data;
  currentStep: 1 | 2 | 3 | 4;
  lastUpdated: string;
  expiresAt: string;
}

/**
 * Temporary image upload response
 */
export interface TempImageUploadResponse {
  tempId: string;
  url: string;
  expiresAt: string;
}
