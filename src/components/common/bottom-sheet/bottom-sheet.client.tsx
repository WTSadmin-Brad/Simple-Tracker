/**
 * BottomSheet.client.tsx
 * Base bottom sheet component for mobile interfaces
 * 
 * @source Employee_Flows.md - "Bottom sheets for selection interfaces"
 */

import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface BottomSheetProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  height?: 'small' | 'medium' | 'large' | 'full';
  showHandle?: boolean;
}

/**
 * Base bottom sheet component used across the application
 * 
 * TODO: Implement the following features:
 * - Swipe down to dismiss
 * - Backdrop tap to dismiss
 * - Hardware-accelerated animations
 * - Haptic feedback on open/close
 * - Proper focus management for accessibility
 * - Support for reduced motion preferences
 */
const BottomSheet = ({ 
  children, 
  isOpen, 
  onClose, 
  title = '', 
  height = 'medium',
  showHandle = true 
}: BottomSheetProps) => {
  const prefersReducedMotion = useReducedMotion();
  
  // Close on escape key
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose]);

  // Map height prop to actual height values
  const heightMap = {
    small: '30vh',
    medium: '50vh',
    large: '75vh',
    full: '100vh'
  };

  // Animation variants
  const sheetVariants = {
    hidden: { y: '100%', transition: { duration: prefersReducedMotion ? 0.1 : 0.3 } },
    visible: { y: 0, transition: { duration: prefersReducedMotion ? 0.1 : 0.3 } }
  };

  const backdropVariants = {
    hidden: { opacity: 0, transition: { duration: prefersReducedMotion ? 0.1 : 0.2 } },
    visible: { opacity: 1, transition: { duration: prefersReducedMotion ? 0.1 : 0.2 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={backdropVariants}
            onClick={onClose}
          />
          
          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 rounded-t-2xl shadow-lg"
            style={{ maxHeight: heightMap[height] }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={sheetVariants}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
              </div>
            )}
            
            {/* Title */}
            {title && (
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>
            )}
            
            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: `calc(${heightMap[height]} - ${title ? '4rem' : '1rem'})` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;
