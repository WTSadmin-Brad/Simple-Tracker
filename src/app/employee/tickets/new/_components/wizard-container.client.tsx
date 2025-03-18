'use client';

/**
 * Wizard Container Component (Client Component)
 * Manages the overall state and flow of the 4-step wizard
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { WizardProgress } from './wizard-progress.client';
import { WizardNavigation } from './wizard-navigation.client';
import { BasicInfoStep } from './basic-info-step.client';
import { CategoriesStep } from './categories-step.client';
import { ImageUploadStep } from './image-upload-step.client';
import { ConfirmationStep } from './confirmation-step.client';
import { SessionRecoveryPrompt } from './session-recovery-prompt.client';
import { useWizardStore } from '@/stores/wizardStore';
import { useWizardApi } from '@/hooks/useWizardApi';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

// Wizard step types
export type WizardStep = 'basic-info' | 'categories' | 'image-upload' | 'confirmation';

// Wizard step configuration
const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'categories', label: 'Categories' },
  { id: 'image-upload', label: 'Images' },
  { id: 'confirmation', label: 'Confirm' },
];

export function WizardContainer() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Wizard API hook
  const { isLoading, error: apiError, saveBasicInfo, saveCategories, saveImageUpload, completeWizard, clearError } = useWizardApi();
  
  // Wizard store
  const {
    currentStep,
    basicInfo,
    categories,
    imageUpload,
    setCurrentStep,
    isStepValid,
    canProceedToNextStep,
    clearWizard
  } = useWizardStore();

  // Combine API errors with local errors
  const error = apiError || localError;
  
  // Clear errors when changing steps
  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [currentStep, clearError]);
  
  // Get current step index
  const currentStepIndex = WIZARD_STEPS.findIndex(step => step.id === currentStep);
  
  // Navigate to next step
  const goToNextStep = async () => {
    if (currentStepIndex < WIZARD_STEPS.length - 1 && canProceedToNextStep()) {
      // Validate current step data
      if (!isStepValid(currentStep)) {
        setLocalError(`Please complete all required fields in the ${WIZARD_STEPS[currentStepIndex].label} step.`);
        return;
      }
      
      // Save current step data to API
      let success = false;
      
      try {
        switch (currentStep) {
          case 'basic-info':
            if (basicInfo) {
              success = await saveBasicInfo(basicInfo);
            }
            break;
          case 'categories':
            if (categories) {
              success = await saveCategories(categories);
            }
            break;
          case 'image-upload':
            if (imageUpload) {
              success = await saveImageUpload(imageUpload);
            } else {
              // Image upload is optional, so we can proceed without saving
              success = true;
            }
            break;
        }
        
        if (success) {
          setDirection(1);
          setCurrentStep(WIZARD_STEPS[currentStepIndex + 1].id);
        } else if (apiError) {
          toast({
            title: 'Error',
            description: `Failed to save data: ${apiError}`,
            variant: 'destructive',
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setLocalError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStep(WIZARD_STEPS[currentStepIndex - 1].id);
    }
  };
  
  // Navigate to specific step
  const goToStep = (step: WizardStep) => {
    // Only allow navigation to steps that come before the current step
    // or the next step if the current step is valid
    const targetStepIndex = WIZARD_STEPS.findIndex(s => s.id === step);
    
    if (targetStepIndex < currentStepIndex) {
      setDirection(targetStepIndex - currentStepIndex);
      setCurrentStep(step);
    } else if (targetStepIndex === currentStepIndex + 1 && canProceedToNextStep()) {
      setDirection(1);
      setCurrentStep(step);
    }
  };
  
  // Handle final submission
  const handleSubmit = async () => {
    if (basicInfo && categories) {
      try {
        const result = await completeWizard({
          basicInfo,
          categories,
          imageUpload: imageUpload || { images: [] }
        });
        
        if (result.success) {
          toast({
            title: 'Success',
            description: `Ticket ${result.ticketId || ''} created successfully!`,
          });
          
          // Clear wizard data
          clearWizard();
          
          // Navigate to success page or home
          router.push('/employee/calendar');
        } else {
          toast({
            title: 'Error',
            description: `Failed to submit ticket. Please try again.`,
            variant: 'destructive',
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setLocalError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    } else {
      setLocalError('Missing required information. Please complete all steps before submitting.');
    }
  };
  
  // Slide animation variants
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
      x: direction < 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'basic-info':
        return <BasicInfoStep />;
      case 'categories':
        return <CategoriesStep />;
      case 'image-upload':
        return <ImageUploadStep />;
      case 'confirmation':
        return <ConfirmationStep onSubmit={handleSubmit} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-border p-6">
      {/* Session Recovery Prompt */}
      <SessionRecoveryPrompt />
      
      <WizardProgress 
        steps={WIZARD_STEPS} 
        currentStep={currentStep} 
        onStepClick={goToStep}
        stepValidation={{
          'basic-info': isStepValid('basic-info'),
          'categories': isStepValid('categories'),
          'image-upload': isStepValid('image-upload'),
          'confirmation': isStepValid('confirmation')
        }}
      />
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="mt-8 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        <AnimatePresence
          initial={false}
          mode="wait"
          custom={direction}
        >
          <motion.div
            key={currentStep}
            custom={direction}
            variants={shouldReduceMotion ? {} : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="w-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
      
      {currentStep !== 'confirmation' && (
        <WizardNavigation 
          currentStep={currentStep}
          steps={WIZARD_STEPS}
          onNext={goToNextStep}
          onPrevious={goToPreviousStep}
          isNextDisabled={!canProceedToNextStep()}
          isPreviousDisabled={currentStepIndex === 0 || isLoading}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
