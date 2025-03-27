/**
 * data-grid-header.client.tsx
 * Header component for data grid with sorting functionality
 */

import React from 'react';
import { DataGridColumn } from '../types';

interface DataGridHeaderProps<T = any> {
  columns: DataGridColumn<T>[];
  sortKey: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (key: string) => void;
  selectable?: boolean;
  onSelectAll?: (selected: boolean) => void;
  allSelected?: boolean;
  someSelected?: boolean;
}

export function DataGridHeader<T = any>({
  columns,
  sortKey,
  sortDirection,
  onSort,
  selectable = false,
  onSelectAll,
  allSelected = false,
  someSelected = false
}: DataGridHeaderProps<T>) {
  // Handle header click for sorting
  const handleHeaderClick = (column: DataGridColumn<T>) => {
    if (column.sortable) {
      onSort(column.key);
    }
  };

  // Handle select all checkbox change
  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectAll) {
      onSelectAll(e.target.checked);
    }
  };

  return (
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        {selectable && (
          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
                checked={allSelected}
                ref={input => {
                  // Handle indeterminate state
                  if (input) {
                    input.indeterminate = someSelected && !allSelected;
                  }
                }}
                onChange={handleSelectAllChange}
              />
            </div>
          </th>
        )}
        
        {columns.map(column => (
          <th
            key={column.key}
            scope="col"
            className={`px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-200 ${
              column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600' : ''
            }`}
            style={{ width: column.width }}
            onClick={() => column.sortable && handleHeaderClick(column)}
          >
            <div className="flex items-center">
              <span>{column.header}</span>
              
              {column.sortable && sortKey === column.key && (
                <span className="ml-2">
                  {sortDirection === 'asc' ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </span>
              )}
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );
}

export default DataGridHeader;
