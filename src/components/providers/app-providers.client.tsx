'use client';

/**
 * AppProviders.client.tsx
 * Client component that wraps the application with all providers
 * Centralizes provider management for better organization
 */

import { ReactNode } from 'react';
import WizardStateProvider from './WizardStateProvider.client';
import Toast from '@/components/common/toast.client';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Application providers component
 * Wraps the application with all necessary providers
 * Includes state management, UI components, and more
 */
const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <>
      {/* State providers */}
      <WizardStateProvider>
        {/* UI components that need to be available globally */}
        <Toast />
        
        {/* Application content */}
        {children}
      </WizardStateProvider>
    </>
  );
};

export default AppProviders;
