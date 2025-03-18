/**
 * WizardNavigation.client.tsx
 * Client component that handles navigation between wizard steps
 */
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button.client';
import { WizardStep } from './WizardContainer.client';
import { useWizardStore } from '@/stores/wizardStore';

interface WizardNavigationProps {
  currentStep: WizardStep;
  onChangeStep: (step: WizardStep) => void;
}

const WizardNavigation = ({ currentStep, onChangeStep }: WizardNavigationProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const { 
    isStepValid, 
    submitTicket,
    isSubmitting
  } = useWizardStore();
  
  // Define step order
  const stepOrder: WizardStep[] = [
    'basic-info',
    'categories',
    'image-upload',
    'confirmation'
  ];
  
  // Get current step index
  const currentIndex = stepOrder.findIndex(step => step === currentStep);
  
  // Determine if there's a previous or next step
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < stepOrder.length - 1;
  const isLastStep = currentIndex === stepOrder.length - 1;
  
  // Handle navigation
  const handlePrevious = () => {
    if (hasPrevious && !isTransitioning) {
      setIsTransitioning(true);
      const previousStep = stepOrder[currentIndex - 1];
      onChangeStep(previousStep);
      
      // Add small delay to prevent double-clicks
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };
  
  const handleNext = () => {
    if (hasNext && !isTransitioning && isStepValid(currentStep)) {
      setIsTransitioning(true);
      const nextStep = stepOrder[currentIndex + 1];
      onChangeStep(nextStep);
      
      // Add small delay to prevent double-clicks
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };
  
  const handleSubmit = () => {
    if (isStepValid(currentStep) && !isSubmitting) {
      submitTicket();
    }
  };
  
  // Button animation
  const buttonVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  };
  
  return (
    <div className="flex justify-between items-center py-4 mt-4 border-t border-gray-200">
      {/* Back button */}
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={buttonVariants}
        transition={{ 
          type: 'spring', 
          stiffness: shouldReduceMotion ? 300 : 200, 
          damping: 25 
        }}
      >
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPrevious || isTransitioning}
          className="touch-target"
          aria-label="Go to previous step"
        >
          Back
        </Button>
      </motion.div>
      
      {/* Next/Submit button */}
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={buttonVariants}
        transition={{ 
          type: 'spring', 
          stiffness: shouldReduceMotion ? 300 : 200, 
          damping: 25 
        }}
      >
        {isLastStep ? (
          <Button
            onClick={handleSubmit}
            disabled={!isStepValid(currentStep) || isSubmitting}
            className="touch-target"
            aria-label="Submit ticket"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isStepValid(currentStep) || isTransitioning}
            className="touch-target"
            aria-label="Go to next step"
          >
            Next
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default WizardNavigation;
