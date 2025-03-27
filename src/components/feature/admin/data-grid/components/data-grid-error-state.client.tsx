/**
 * data-grid-error-state.client.tsx
 * Error state component for data grid when an error occurs
 */

import React from 'react';

interface DataGridErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function DataGridErrorState({
  error,
  onRetry
}: DataGridErrorStateProps) {
  return (
    <tr>
      <td className="px-6 py-12 text-center" colSpan={100}>
        <div className="flex flex-col items-center justify-center">
          <svg
            className="h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mt-2 text-sm text-red-500">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Retry
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default DataGridErrorState;
