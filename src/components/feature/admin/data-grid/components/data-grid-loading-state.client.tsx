/**
 * data-grid-loading-state.client.tsx
 * Loading state component for data grid
 */

import React from 'react';

interface DataGridLoadingStateProps {
  columnCount: number;
  rowCount?: number;
}

export function DataGridLoadingState({
  columnCount,
  rowCount = 5
}: DataGridLoadingStateProps) {
  // Create an array of the specified length for rows
  const rows = Array.from({ length: rowCount }, (_, i) => i);
  
  return (
    <>
      {rows.map((_, rowIndex) => (
        <tr key={`loading-row-${rowIndex}`} className="animate-pulse">
          {/* Create cells for each column */}
          {Array.from({ length: columnCount }, (_, colIndex) => (
            <td 
              key={`loading-cell-${rowIndex}-${colIndex}`} 
              className="px-3 py-4 whitespace-nowrap"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default DataGridLoadingState;
