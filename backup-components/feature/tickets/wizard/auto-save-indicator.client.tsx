'use client';

/**
 * AutoSaveIndicator.client.tsx
 * Client component that shows auto-save status in the wizard footer
 * Provides subtle feedback when changes are saved automatically
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
import { useWizardStore } from '@/stores/wizardStore';
import { fadeVariants } from '@/lib/animations/variants';
import { quickTransition } from '@/lib/animations/transitions';

/**
 * Auto-save indicator component
 * Shows a subtle indicator when changes are auto-saved
 */
const AutoSaveIndicator = () => {
  const [showIndicator, setShowIndicator] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  
  const { 
    lastUpdated, 
    sessionMetadata,
    isAutoSaving,
    isOnline
  } = useWizardStore();
  
  // Show indicator when lastUpdated changes and auto-save is active
  useEffect(() => {
    if (lastUpdated && isAutoSaving && sessionMetadata?.autoSaved) {
      setLastSaved(lastUpdated);
      setShowIndicator(true);
      
      // Hide indicator after 3 seconds
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [lastUpdated, isAutoSaving, sessionMetadata]);
  
  // Format the last saved time
  const formattedTime = lastSaved 
    ? format(new Date(lastSaved), 'h:mm a')
    : '';
  
  return (
    <div className="flex items-center text-xs text-gray-500">
      {/* Connection status indicator */}
      <div className="flex items-center mr-3">
        <div 
          className={`w-2 h-2 rounded-full mr-1.5 ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span>{isOnline ? 'Online' : 'Offline'}</span>
      </div>
      
      {/* Auto-save indicator */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            className="flex items-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={shouldReduceMotion ? {} : fadeVariants}
            transition={quickTransition}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="mr-1 text-green-500"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <span>Saved at {formattedTime}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutoSaveIndicator;
