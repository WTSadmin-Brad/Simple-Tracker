/**
 * WizardContainer.client.tsx
 * Client component that manages the overall ticket submission wizard flow
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useWizardStore } from '@/stores/wizardStore';
import WizardProgress from './WizardProgress.client';
import WizardNavigation from './WizardNavigation.client';
import BasicInfoStep from './BasicInfoStep.client';
import CategoriesStep from './CategoriesStep.client';
import ImageUploadStep from './ImageUploadStep.client';
import ConfirmationStep from './ConfirmationStep.client';
import SessionRecoveryPrompt from './SessionRecoveryPrompt.client';
import { defaultTransition, smoothTransition, quickTransition } from '@/lib/animations/transitions';
import { fadeVariants } from '@/lib/animations/variants';

export type WizardStep = 'basic-info' | 'categories' | 'image-upload' | 'confirmation';

const WizardContainer = () => {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(0);
  
  const { 
    currentStep, 
    setCurrentStep, 
    isComplete, 
    clearWizard
  } = useWizardStore();
  
  // Step order for navigation
  const stepOrder: WizardStep[] = [
    'basic-info',
    'categories',
    'image-upload',
    'confirmation'
  ];
  
  // Get current step index
  const currentIndex = stepOrder.findIndex(step => step === currentStep);
  
  // Custom slide variants with direction
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
    }),
  };

  // Transition with spring physics
  const transition = shouldReduceMotion 
    ? quickTransition 
    : smoothTransition;

  // Handle step changes with direction tracking
  const handleStepChange = (newStep: WizardStep) => {
    const newIndex = stepOrder.findIndex(step => step === newStep);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setCurrentStep(newStep);
  };

  // Handle step rendering
  const renderStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return <BasicInfoStep />;
      case 'categories':
        return <CategoriesStep />;
      case 'image-upload':
        return <ImageUploadStep />;
      case 'confirmation':
        return <ConfirmationStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  // Handle wizard completion
  useEffect(() => {
    if (isComplete) {
      // Redirect or show success message
      router.push('/employee/tickets');
      // Reset wizard state
      clearWizard();
    }
  }, [isComplete, router, clearWizard]);

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto">
      {/* Session Recovery Prompt */}
      <SessionRecoveryPrompt />
      
      {/* Wizard Progress Indicator */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        transition={defaultTransition}
      >
        <WizardProgress currentStep={currentStep} />
      </motion.div>
      
      {/* Step Content */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence initial={false} mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transition}
            className="absolute inset-0"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Navigation Controls */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeVariants}
        transition={defaultTransition}
      >
        <WizardNavigation 
          currentStep={currentStep} 
          onChangeStep={handleStepChange} 
        />
      </motion.div>
    </div>
  );
};

export default WizardContainer;
