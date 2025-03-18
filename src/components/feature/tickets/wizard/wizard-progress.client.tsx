/**
 * WizardProgress.client.tsx
 * Client component that displays the progress through the ticket submission wizard
 */
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WizardStep } from './WizardContainer.client';

interface WizardProgressProps {
  currentStep: WizardStep;
}

const WizardProgress = ({ currentStep }: WizardProgressProps) => {
  const shouldReduceMotion = useReducedMotion();
  
  const steps = [
    { id: 'basic-info', label: 'Basic Info' },
    { id: 'categories', label: 'Categories' },
    { id: 'image-upload', label: 'Image Upload' },
    { id: 'confirmation', label: 'Confirmation' },
  ];

  // Get the current step index
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  // Calculate progress percentage
  const progressPercentage = ((currentIndex) / (steps.length - 1)) * 100;

  return (
    <div className="py-4 px-2 mb-4" role="region" aria-label="Ticket Submission Wizard Progress">
      <div className="flex justify-between mb-2">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = step.id === currentStep;
          
          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <motion.div 
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  isActive ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                )}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  backgroundColor: isActive ? 'var(--primary)' : '#e5e7eb',
                  color: isActive ? '#ffffff' : '#6b7280',
                }}
                transition={{
                  type: 'spring',
                  stiffness: shouldReduceMotion ? 300 : 200,
                  damping: 25
                }}
              >
                {index + 1}
              </motion.div>
              <span className={cn(
                "text-xs mt-1",
                isCurrent ? "font-medium" : "font-normal",
                isActive ? "text-primary" : "text-gray-500"
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ 
            type: 'spring', 
            stiffness: shouldReduceMotion ? 300 : 200, 
            damping: 30 
          }}
        />
      </div>
    </div>
  );
};

export default WizardProgress;
