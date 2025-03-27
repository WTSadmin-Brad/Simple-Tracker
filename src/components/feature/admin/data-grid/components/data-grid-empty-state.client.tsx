/**
 * data-grid-empty-state.client.tsx
 * Empty state component for data grid when no data is available
 */

import React from 'react';

interface DataGridEmptyStateProps {
  message?: string;
  icon?: React.ReactNode;
  actionButton?: React.ReactNode;
}

export function DataGridEmptyState({
  message = 'No data available',
  icon,
  actionButton
}: DataGridEmptyStateProps) {
  return (
    <tr>
      <td className="px-6 py-12 text-center" colSpan={100}>
        <div className="flex flex-col items-center justify-center">
          {icon || (
            <svg
              className="h-12 w-12 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          )}
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{message}</p>
          {actionButton && <div className="mt-4">{actionButton}</div>}
        </div>
      </td>
    </tr>
  );
}

export default DataGridEmptyState;
