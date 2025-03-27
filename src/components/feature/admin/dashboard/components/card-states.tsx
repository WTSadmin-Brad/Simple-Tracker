/**
 * card-states.tsx
 * Shared UI components for different card states (loading, error, empty)
 */

import { Button } from '@/components/ui/button';

/**
 * Loading state component for dashboard cards
 */
export function CardLoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  );
}

/**
 * Error state component for dashboard cards
 */
export function CardErrorState({ 
  error, 
  onRetry 
}: { 
  error: string | null; 
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-500 p-4">
      <div className="text-2xl mb-2">⚠️</div>
      <div className="mb-2">{error || 'An error occurred'}</div>
      <Button 
        onClick={onRetry}
        variant="outline"
        size="sm"
      >
        Retry
      </Button>
    </div>
  );
}

/**
 * Empty state component for dashboard cards
 */
export function CardEmptyState({ 
  message, 
  onRefresh 
}: { 
  message: string; 
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
      <div className="text-2xl mb-2">📋</div>
      <div className="mb-2">{message}</div>
      <Button 
        onClick={onRefresh}
        variant="outline"
        size="sm"
      >
        Refresh
      </Button>
    </div>
  );
}

/**
 * Card footer with last updated timestamp and refresh button
 */
export function CardFooterWithRefresh({
  lastUpdated,
  onRefresh
}: {
  lastUpdated: Date;
  onRefresh: () => void;
}) {
  return (
    <div className="flex justify-between items-center text-xs text-gray-500">
      <div>
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 rounded-full"
        onClick={onRefresh}
        title="Refresh"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3 w-3"
        >
          <path d="M21 2v6h-6" />
          <path d="M3 12a9 9 0 0 1 15-6.7l3-3" />
          <path d="M3 22v-6h6" />
          <path d="M21 12a9 9 0 0 1-15 6.7l-3 3" />
        </svg>
      </Button>
    </div>
  );
}
