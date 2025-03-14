'use client';

/**
 * New Ticket Submission Page Error UI
 * Displayed when an error occurs in the page
 */

import { useEffect } from 'react';

export default function NewTicketError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('New ticket page error:', error);
  }, [error]);

  return (
    <div className="container py-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">
          Something went wrong
        </h2>
        <p className="text-red-700 mb-4">
          There was an error loading the ticket submission form. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
