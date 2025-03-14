'use client';

/**
 * ConnectionStatusDetector.client.tsx
 * Client component that detects and manages connection status
 * Updates the UI and store when connection status changes
 */

import { useEffect } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { useUIStore } from '@/stores/uiStore';

/**
 * Connection status detector component
 * Monitors online/offline status and updates stores accordingly
 * Renders nothing in the DOM
 */
const ConnectionStatusDetector = () => {
  const { setOnlineStatus, isOnline } = useWizardStore();
  const { addToast } = useUIStore();
  
  useEffect(() => {
    // Initialize with current status
    setOnlineStatus(navigator.onLine);
    
    // Handle online event
    const handleOnline = () => {
      // Only show toast if we were previously offline
      if (!isOnline) {
        addToast('Connection restored. Your changes will be saved.', 'success');
      }
      setOnlineStatus(true);
    };
    
    // Handle offline event
    const handleOffline = () => {
      addToast('You are offline. Some features may be limited.', 'warning');
      setOnlineStatus(false);
    };
    
    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, addToast, isOnline]);
  
  // This component doesn't render anything
  return null;
};

export default ConnectionStatusDetector;
