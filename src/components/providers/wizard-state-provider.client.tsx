'use client';

/**
 * wizard-state-provider.client.tsx
 * Client component that provides wizard state management functionality
 * Handles auto-saving, session recovery, and connection status detection
 */

import { useEffect } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import ConnectionStatusDetector from '@/components/common/connection-status-detector.client';
import { SessionRecoveryPrompt } from '@/app/employee/tickets/new/_components/session-recovery-prompt.client';

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
    
    // Set up auto-save interval with a constant for better maintainability
    const AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds
    
    const autoSaveInterval = setInterval(() => {
      if (isAutoSaving) {
        saveWizardState();
      }
    }, AUTO_SAVE_INTERVAL_MS);
    
    // Clean up on unmount
    return () => {
      disableAutoSave();
      clearInterval(autoSaveInterval);
    };
  }, [enableAutoSave, disableAutoSave, saveWizardState, isAutoSaving]);
  
  return (
    <>
      {/* Connection status detector - monitors online/offline status */}
      <ConnectionStatusDetector />
      
      {/* Session recovery prompt - appears when a previous session is detected */}
      <SessionRecoveryPrompt />
      
      {/* Render children components */}
      {children}
    </>
  );
};

export default WizardStateProvider;
