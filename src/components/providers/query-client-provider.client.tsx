/**
 * query-client-provider.client.tsx
 * Client component that provides the TanStack Query client to the application
 * Centralized query configuration and React Query DevTools setup
 */

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, ReactNode } from 'react';
import { errorHandler } from '@/lib/errors';

interface QueryClientProviderProps {
  children: ReactNode;
}

/**
 * QueryClientProvider component
 * Creates and configures the QueryClient with application-wide defaults
 * Includes development tools in non-production environments
 */
export default function QueryClientProvider({ children }: QueryClientProviderProps) {
  // Create a new QueryClient instance only once using useState
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Cache configuration
          staleTime: 60 * 1000, // 1 minute
          gcTime: 5 * 60 * 1000, // 5 minutes
          
          // Error handling
          retry: 1, // Only retry failed queries once
          
          // Refetch behavior
          refetchOnWindowFocus: process.env.NODE_ENV === 'production',
          refetchOnReconnect: true,
        },
        mutations: {
          onError: (error) => {
            // Log all mutation errors by default
            errorHandler.logError(error, { source: 'mutation' });
          },
        },
      },
    })
  );

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      
      {/* Only include DevTools in non-production environments */}
      {process.env.NODE_ENV !== 'production' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </TanStackQueryClientProvider>
  );
}
