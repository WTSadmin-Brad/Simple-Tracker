'use client';

/**
 * SessionRecoveryPrompt.client.tsx
 * Client component that prompts users to recover an abandoned session
 * Displays when a previous session is detected in localStorage
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWizardStore } from '@/stores/wizardStore';
import { slideUpVariants } from '@/lib/animations/variants';

export function SessionRecoveryPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<{
    lastUpdated: string | null;
    step: string;
    hasBasicInfo: boolean;
    hasCategories: boolean;
    imageCount: number;
  }>({
    lastUpdated: null,
    step: '',
    hasBasicInfo: false,
    hasCategories: false,
    imageCount: 0
  });
  
  const shouldReduceMotion = useReducedMotion();
  
  const { 
    basicInfo, 
    categories, 
    imageUpload, 
    currentStep,
    lastUpdated: storeLastUpdated,
    hasActiveSession,
    clearWizard,
    initSession
  } = useWizardStore();
  
  // Check for session on component mount
  useEffect(() => {
    const checkForSession = () => {
      if (hasActiveSession()) {
        // Get session details for display
        setSessionDetails({
          lastUpdated: storeLastUpdated,
          step: currentStep,
          hasBasicInfo: !!basicInfo && !!basicInfo.date && !!basicInfo.truckId && !!basicInfo.jobsiteId,
          hasCategories: !!categories && Object.values(categories).some(v => v > 0),
          imageCount: imageUpload?.images.length || 0
        });
        
        setIsVisible(true);
      }
    };
    
    // Small delay to allow store to hydrate from localStorage
    const timer = setTimeout(checkForSession, 500);
    return () => clearTimeout(timer);
  }, [
    hasActiveSession, 
    storeLastUpdated, 
    basicInfo, 
    categories, 
    imageUpload, 
    currentStep
  ]);
  
  const handleRecover = () => {
    setIsVisible(false);
    // Initialize the session with proper metadata
    initSession();
  };
  
  const handleDiscard = () => {
    setIsVisible(false);
    clearWizard();
  };
  
  // Format the last updated time
  const getFormattedTime = () => {
    if (!sessionDetails.lastUpdated) return { relative: '', absolute: '' };
    
    try {
      const date = new Date(sessionDetails.lastUpdated);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        absolute: format(date, 'PPpp')
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { relative: 'some time ago', absolute: 'unknown time' };
    }
  };
  
  const formattedTime = getFormattedTime();
  
  // Get human-readable step name
  const getStepName = (step: string) => {
    switch (step) {
      case 'basic-info': return 'Basic Information';
      case 'categories': return 'Categories';
      case 'image-upload': return 'Image Upload';
      case 'confirmation': return 'Confirmation';
      default: return 'Unknown Step';
    }
  };
  
  // Get session progress summary
  const getProgressSummary = () => {
    const { hasBasicInfo, hasCategories, imageCount } = sessionDetails;
    
    const parts = [];
    if (hasBasicInfo) parts.push('basic information');
    if (hasCategories) parts.push('category counts');
    if (imageCount > 0) parts.push(`${imageCount} image${imageCount !== 1 ? 's' : ''}`);
    
    if (parts.length === 0) return 'with minimal progress';
    if (parts.length === 1) return `with ${parts[0]}`;
    if (parts.length === 2) return `with ${parts[0]} and ${parts[1]}`;
    
    const lastPart = parts.pop();
    return `with ${parts.join(', ')}, and ${lastPart}`;
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={shouldReduceMotion ? {} : slideUpVariants}
          transition={{
            type: 'spring',
            stiffness: shouldReduceMotion ? 300 : 200,
            damping: 25
          }}
        >
          <Card className="bg-white border border-amber-200 shadow-lg p-4 max-w-md mx-auto">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-amber-100 rounded-full p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <path d="M12 8v4l3 3"></path>
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Resume your ticket?</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We found an unfinished ticket from {formattedTime.relative}.
                    <span className="block text-xs mt-1">{formattedTime.absolute}</span>
                  </p>
                  
                  {/* Session details */}
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    <p>You were on the <span className="font-medium">{getStepName(sessionDetails.step)}</span> step {getProgressSummary()}.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleRecover}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Resume Ticket
                </Button>
                <Button
                  onClick={handleDiscard}
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700"
                >
                  Start New
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
