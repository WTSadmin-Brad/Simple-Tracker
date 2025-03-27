'use client';

/**
 * app-providers.client.tsx
 * Client component that wraps the application with all providers
 * Centralizes provider management for better organization
 */

import { ReactNode } from 'react';
import WizardStateProvider from './wizard-state-provider.client';
import QueryClientProvider from './query-client-provider.client';
import Toast from '@/components/common/toast.client';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Application providers component
 * Wraps the application with all necessary providers in the correct order
 * 
 * Provider order matters:
 * 1. QueryClientProvider - Data fetching (outermost)
 * 2. WizardStateProvider - Wizard state management
 * 3. Global UI components (Toast, etc.)
 */
const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider>
      <WizardStateProvider>
        {/* Global UI components */}
        <Toast />
        
        {/* Application content */}
        {children}
      </WizardStateProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
