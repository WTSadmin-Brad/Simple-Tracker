'use client';

/**
 * Wizard Progress Component (Client Component)
 * Displays the progress through the wizard steps
 */

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { WizardStep } from './WizardContainer.client';

type WizardProgressProps = {
  steps: { id: WizardStep; label: string }[];
  currentStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
};

export function WizardProgress({ 
  steps, 
  currentStep, 
  onStepClick 
}: WizardProgressProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <div className="relative">
      {/* Progress line */}
      <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700" />
      
      {/* Progress fill */}
      <motion.div 
        className="absolute top-4 left-0 h-0.5 bg-primary"
        initial={{ width: '0%' }}
        animate={{ 
          width: `${(currentStepIndex / (steps.length - 1)) * 100}%` 
        }}
        transition={{ 
          duration: shouldReduceMotion ? 0 : 0.3,
          ease: 'easeInOut'
        }}
      />
      
      {/* Step indicators */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isClickable = index <= currentStepIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={`
                  relative z-10 flex items-center justify-center w-8 h-8 rounded-full 
                  transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                  ${isCompleted ? 'bg-primary text-primary-foreground' : 
                    isCurrent ? 'bg-primary text-primary-foreground' : 
                    'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                  ${isClickable ? 'cursor-pointer hover:bg-primary/90' : 'cursor-not-allowed'}
                `}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${step.label} ${
                  isCompleted ? '(completed)' : 
                  isCurrent ? '(current)' : 
                  '(upcoming)'
                }`}
              >
                {isCompleted ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </button>
              
              <span className={`
                mt-2 text-xs font-medium
                ${isCurrent ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
