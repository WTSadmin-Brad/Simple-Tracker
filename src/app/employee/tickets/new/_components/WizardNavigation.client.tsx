'use client';

/**
 * Wizard Navigation Component (Client Component)
 * Provides navigation controls for the wizard
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { WizardStep } from './WizardContainer.client';
import { Loader2 } from 'lucide-react';

type WizardNavigationProps = {
  currentStep: WizardStep;
  steps: { id: WizardStep; label: string }[];
  onNext: () => void;
  onPrevious: () => void;
  isNextDisabled: boolean;
  isPreviousDisabled: boolean;
  isLoading?: boolean;
};

export function WizardNavigation({
  currentStep,
  steps,
  onNext,
  onPrevious,
  isNextDisabled,
  isPreviousDisabled,
  isLoading = false,
}: WizardNavigationProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="flex justify-between mt-8">
      <motion.button
        onClick={onPrevious}
        disabled={isPreviousDisabled || isLoading}
        className={`
          px-4 py-2 rounded-md border border-border
          ${isPreviousDisabled || isLoading
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600' 
            : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'}
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          touch-target
        `}
        whileTap={shouldReduceMotion || isPreviousDisabled || isLoading ? {} : { scale: 0.95 }}
        aria-label="Previous step"
      >
        <span className="flex items-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
          Back
        </span>
      </motion.button>
      
      <motion.button
        onClick={onNext}
        disabled={isNextDisabled || isLoading}
        className={`
          px-4 py-2 rounded-md
          ${isNextDisabled || isLoading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
            : 'bg-primary text-white hover:bg-primary/90 dark:hover:bg-primary/80'}
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          touch-target
        `}
        whileTap={shouldReduceMotion || isNextDisabled || isLoading ? {} : { scale: 0.95 }}
        aria-label="Next step"
      >
        <span className="flex items-center">
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-1 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              {isLastStep ? 'Review' : 'Next'}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 ml-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </>
          )}
        </span>
      </motion.button>
    </div>
  );
}
