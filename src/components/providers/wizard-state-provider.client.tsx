'use client';

/**
 * WizardStateProvider.client.tsx
 * Client component that provides wizard state management functionality
 * Handles auto-saving, session recovery, and connection status detection
 */

import { useEffect } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import ConnectionStatusDetector from '@/components/common/ConnectionStatusDetector.client';
import SessionRecoveryPrompt from '@/components/feature/tickets/wizard/SessionRecoveryPrompt.client';

interface WizardStateProviderProps {
  children: React.ReactNode;
}

/**
 * Wizard state provider component
 * Wraps application with wizard state management functionality
 * Includes connection status detection and session recovery
 */
const WizardStateProvider = ({ children }: WizardStateProviderProps) => {
  const { 
    enableAutoSave, 
    disableAutoSave,
    saveWizardState,
    isAutoSaving
  } = useWizardStore();
  
  // Set up auto-save functionality
  useEffect(() => {
    // Enable auto-save on mount
    enableAutoSave();
    
    // Set up auto-save interval
    const autoSaveInterval = setInterval(() => {
      if (isAutoSaving) {
        saveWizardState();
      }
    }, 30000); // Auto-save every 30 seconds
    
    // Clean up on unmount
    return () => {
      disableAutoSave();
      clearInterval(autoSaveInterval);
    };
  }, [enableAutoSave, disableAutoSave, saveWizardState, isAutoSaving]);
  
  return (
    <>
      {/* Connection status detector (invisible component) */}
      <ConnectionStatusDetector />
      
      {/* Session recovery prompt (appears when needed) */}
      <SessionRecoveryPrompt />
      
      {/* Render children */}
      {children}
    </>
  );
};

export default WizardStateProvider;
