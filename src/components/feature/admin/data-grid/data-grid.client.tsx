/**
 * data-grid.client.tsx
 * Reusable data grid component for admin data management
 * 
 * @source Admin_Flows.md - "Data Management" section
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DataGridHeader, 
  DataGridRow, 
  DataGridPagination,
  DataGridEmptyState,
  DataGridLoadingState,
  DataGridErrorState
} from './components';
import { useDataGrid } from './hooks';
import { DataGridProps, DataGridField, SortDirection } from './types';
import { cn } from '@/lib/utils';

/**
 * Reusable data grid component for admin data management
 */
export default function DataGrid<T = any>({
  columns,
  data,
  keyField,
  onRowClick,
  onSelectionChange,
  isLoading = false,
  error = null,
  emptyMessage = "No items found",
  pagination,
  className,
  selectable = false,
  initialSelectedRows = []
}: DataGridProps<T>) {
  // Use the data grid hook for state management
  const {
    sortKey,
    sortDirection,
    handleSort,
    handleRowClick,
    selectedRows,
    handleRowSelection,
    handleSelectAll,
    isAllSelected,
    isPartiallySelected
  } = useDataGrid<T>({
    data,
    keyField,
    onRowClick,
    onSelectionChange,
    selectable,
    initialSelectedRows
  });
  
  // Memoize sorted data for better performance
  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    
    return [...data].sort((a, b) => {
      const aValue = typeof sortKey === 'function' ? sortKey(a) : a[sortKey as keyof T];
      const bValue = typeof sortKey === 'function' ? sortKey(b) : b[sortKey as keyof T];
      
      if (aValue === bValue) return 0;
      
      const compareResult = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [data, sortKey, sortDirection]);

  // Memoize the table header for better performance
  const tableHeader = useMemo(() => (
    <thead className="bg-gray-50 dark:bg-gray-700">
      <tr>
        {selectable && (
          <th scope="col" className="relative px-3 py-3.5 w-12">
            <input
              type="checkbox"
              className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={isAllSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isPartiallySelected;
                }
              }}
              onChange={handleSelectAll}
            />
          </th>
        )}
        {columns.map((column, index) => (
          <th 
            key={index}
            scope="col" 
            className={cn(
              "px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-100",
              column.className
            )}
            style={{ width: column.width }}
          >
            {column.sortable ? (
              <button
                type="button"
                className="group inline-flex items-center"
                onClick={() => handleSort(column.key as string)}
              >
                {column.label}
                <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible group-focus:visible">
                  {sortKey === column.key ? (
                    sortDirection === 'asc' ? (
                      <span className="text-gray-900 dark:text-gray-100">↑</span>
                    ) : (
                      <span className="text-gray-900 dark:text-gray-100">↓</span>
                    )
                  ) : (
                    <span className="invisible text-gray-400 group-hover:visible group-focus:visible">↓</span>
                  )}
                </span>
              </button>
            ) : (
              column.label
            )}
          </th>
        ))}
      </tr>
    </thead>
  ), [columns, sortKey, sortDirection, handleSort, selectable, isAllSelected, isPartiallySelected, handleSelectAll]);

  // Render loading state
  const renderLoadingState = useCallback(() => (
    <tr>
      <td colSpan={selectable ? columns.length + 1 : columns.length} className="py-10 text-center">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading data...</div>
      </td>
    </tr>
  ), [columns.length, selectable]);

  // Render error state
  const renderErrorState = useCallback(() => (
    <tr>
      <td colSpan={selectable ? columns.length + 1 : columns.length} className="py-10 text-center">
        <div className="text-red-500 dark:text-red-400 mb-2">{error}</div>
        <button 
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:text-primary-dark"
        >
          Try again
        </button>
      </td>
    </tr>
  ), [columns.length, error, selectable]);

  // Render empty state
  const renderEmptyState = useCallback(() => (
    <tr>
      <td colSpan={selectable ? columns.length + 1 : columns.length} className="py-10 text-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</div>
      </td>
    </tr>
  ), [columns.length, emptyMessage, selectable]);

  // Render data rows
  const renderDataRows = useCallback(() => (
    sortedData.map((item, rowIndex) => {
      const rowKey = String(item[keyField as keyof T]) || `row-${rowIndex}`;
      const isSelected = selectedRows.includes(rowKey);
      
      return (
        <tr 
          key={rowKey}
          className={cn(
            "hover:bg-gray-50 dark:hover:bg-gray-700",
            isSelected && "bg-blue-50 dark:bg-blue-900/20",
            onRowClick && "cursor-pointer"
          )}
          onClick={onRowClick ? () => handleRowClick(item) : undefined}
        >
          {selectable && (
            <td className="relative w-12 px-3 py-4">
              <input
                type="checkbox"
                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={isSelected}
                onChange={(e) => handleRowSelection(rowKey, e.target.checked)}
                onClick={(e) => e.stopPropagation()}
              />
            </td>
          )}
          {columns.map((column, colIndex) => {
            // Get the value using the key or function
            let content: React.ReactNode;
            
            if (typeof column.key === 'function') {
              content = column.key(item);
            } else {
              const value = item[column.key as keyof T];
              content = column.format ? column.format(value, item) : value;
            }
            
            return (
              <td 
                key={colIndex} 
                className={cn(
                  "whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400",
                  column.className
                )}
              >
                {content}
              </td>
            );
          })}
        </tr>
      );
    })
  ), [sortedData, columns, keyField, onRowClick, handleRowClick, selectable, selectedRows, handleRowSelection]);

  // Memoize pagination component
  const paginationComponent = useMemo(() => {
    if (!pagination || pagination.totalPages <= 1) return null;
    
    return (
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            type="button"
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage <= 1}
            className={cn(
              "relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200",
              pagination.currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-600"
            )}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage >= pagination.totalPages}
            className={cn(
              "relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200",
              pagination.currentPage >= pagination.totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-600"
            )}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
              <span className="font-medium">{pagination.totalPages}</span>
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                type="button"
                onClick={() => pagination.onPageChange(1)}
                disabled={pagination.currentPage <= 1}
                className={cn(
                  "relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 focus:outline-offset-0",
                  pagination.currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <span className="sr-only">First</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M15.79 14.77a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L11.832 10l3.938 3.71a.75.75 0 01.02 1.06zm-6 0a.75.75 0 01-1.06.02l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 111.04 1.08L5.832 10l3.938 3.71a.75.75 0 01.02 1.06z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className={cn(
                  "relative inline-flex items-center px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 focus:outline-offset-0",
                  pagination.currentPage <= 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNumber: number;
                
                if (pagination.totalPages <= 5) {
                  // Show all pages if 5 or fewer
                  pageNumber = i + 1;
                } else if (pagination.currentPage <= 3) {
                  // Show first 5 pages
                  pageNumber = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  // Show last 5 pages
                  pageNumber = pagination.totalPages - 4 + i;
                } else {
                  // Show current page and 2 pages on each side
                  pageNumber = pagination.currentPage - 2 + i;
                }
                
                return (
                  <button
                    type="button"
                    key={pageNumber}
                    onClick={() => pagination.onPageChange(pageNumber)}
                    className={cn(
                      "relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 focus:outline-offset-0",
                      pageNumber === pagination.currentPage
                        ? "bg-primary text-white focus-visible:outline-primary"
                        : "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className={cn(
                  "relative inline-flex items-center px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 focus:outline-offset-0",
                  pagination.currentPage >= pagination.totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => pagination.onPageChange(pagination.totalPages)}
                disabled={pagination.currentPage >= pagination.totalPages}
                className={cn(
                  "relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 dark:text-gray-500 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 focus:z-20 focus:outline-offset-0",
                  pagination.currentPage >= pagination.totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <span className="sr-only">Last</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M4.21 14.77a.75.75 0 01.02-1.06L8.168 10 4.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02zm6 0a.75.75 0 01.02-1.06L14.168 10 10.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  }, [pagination]);

  return (
    <div className={cn("overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg", className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
          {tableHeader}
          
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
            {isLoading && renderLoadingState()}
            {!isLoading && error && renderErrorState()}
            {!isLoading && !error && sortedData.length === 0 && renderEmptyState()}
            {!isLoading && !error && sortedData.length > 0 && renderDataRows()}
          </tbody>
        </table>
      </div>
      
      {paginationComponent}
    </div>
  );
}
