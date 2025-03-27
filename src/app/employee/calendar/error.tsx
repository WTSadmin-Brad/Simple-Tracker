'use client';

/**
 * Employee Calendar Page Error UI
 * 
 * Displayed when an error occurs in the calendar page.
 * Provides error details, reporting, and recovery options.
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CalendarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Calendar page error:', error);
  }, [error]);

  return (
    <div className="container py-6">
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6" role="alert" aria-labelledby="error-heading">
        <div className="flex items-center gap-3 mb-3">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
          <h2 id="error-heading" className="text-xl font-semibold text-red-800 dark:text-red-400">
            Calendar Error
          </h2>
        </div>
        
        <p className="text-red-700 dark:text-red-300 mb-4">
          There was an error loading the calendar data. Please try again.
        </p>
        
        <div className="text-sm text-red-600 dark:text-red-300 mb-4 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto">
          <code>{error.message || 'Unknown error'}</code>
          {error.digest && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <Button 
          variant="destructive"
          onClick={reset}
          className="focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}
