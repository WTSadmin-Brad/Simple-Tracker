/**
 * DataGrid.client.tsx
 * Reusable data grid component for admin data management
 * 
 * @source Admin_Flows.md - "Data Management" section
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Column definition type
export interface DataGridColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  renderCell?: (item: T) => React.ReactNode;
}

// Data grid props
export interface DataGridProps<T = any> {
  columns: DataGridColumn<T>[];
  data: T[];
  keyField: keyof T;
  isLoading?: boolean;
  error?: string | null;
  onRowClick?: (item: T) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onRefresh?: () => void;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
  actionButtons?: React.ReactNode;
}

/**
 * Reusable data grid component for admin data management
 * 
 * TODO: Implement the following features:
 * - Pagination controls
 * - Sorting by column
 * - Filtering by column
 * - Row selection
 * - Responsive design
 * - Loading and error states
 * - Empty state
 */
export function DataGrid<T = any>({
  columns,
  data,
  keyField,
  isLoading = false,
  error = null,
  onRowClick,
  onSort,
  onFilter,
  onRefresh,
  onPageChange,
  pageSize = 10,
  currentPage = 1,
  totalItems = 0,
  selectable = false,
  onSelectionChange,
  actionButtons
}: DataGridProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set());
  const [filters, setFilters] = useState<Record<string, any>>({});
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Handle sort
  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };
  
  // Handle row selection
  const handleRowSelect = (item: T, isSelected: boolean) => {
    const key = item[keyField as keyof T];
    const newSelectedRows = new Set(selectedRows);
    
    if (isSelected) {
      newSelectedRows.add(key);
    } else {
      newSelectedRows.delete(key);
    }
    
    setSelectedRows(newSelectedRows);
    
    if (onSelectionChange) {
      const selectedItems = data.filter(row => 
        newSelectedRows.has(row[keyField as keyof T])
      );
      onSelectionChange(selectedItems);
    }
  };
  
  // Handle "select all" checkbox
  const handleSelectAll = (isSelected: boolean) => {
    const newSelectedRows = new Set<any>();
    
    if (isSelected) {
      data.forEach(item => {
        newSelectedRows.add(item[keyField as keyof T]);
      });
    }
    
    setSelectedRows(newSelectedRows);
    
    if (onSelectionChange) {
      const selectedItems = isSelected ? [...data] : [];
      onSelectionChange(selectedItems);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    // Remove empty filters
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    }
    
    setFilters(newFilters);
    
    if (onFilter) {
      onFilter(newFilters);
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    if (onPageChange) {
      onPageChange(page);
    }
  };
  
  // Render loading state
  const renderLoading = () => {
    return (
      <tr>
        <td 
          colSpan={selectable ? columns.length + 1 : columns.length}
          className="px-6 py-12 text-center"
        >
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
          <div className="mt-2 text-gray-500">Loading data...</div>
        </td>
      </tr>
    );
  };
  
  // Render error state
  const renderError = () => {
    return (
      <tr>
        <td 
          colSpan={selectable ? columns.length + 1 : columns.length}
          className="px-6 py-12 text-center"
        >
          <div className="text-red-500 mb-2">{error}</div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-primary-500 text-white rounded-md"
            >
              Retry
            </button>
          )}
        </td>
      </tr>
    );
  };
  
  // Render empty state
  const renderEmpty = () => {
    return (
      <tr>
        <td 
          colSpan={selectable ? columns.length + 1 : columns.length}
          className="px-6 py-12 text-center"
        >
          <div className="text-gray-500 mb-2">No data available</div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Refresh
            </button>
          )}
        </td>
      </tr>
    );
  };
  
  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    const maxPageButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
              currentPage === 1
                ? 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700'
                : 'text-gray-700 bg-white hover:bg-gray-50 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md ${
              currentPage === totalPages
                ? 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700'
                : 'text-gray-700 bg-white hover:bg-gray-50 dark:text-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * pageSize + 1, totalItems)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
              <span className="font-medium">{totalItems}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700'
                    : 'text-gray-500 bg-white hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <span className="sr-only">Previous</span>
                ←
              </button>
              
              {startPage > 1 && (
                <>
                  <button
                    onClick={() => handlePageChange(1)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    1
                  </button>
                  {startPage > 2 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                      ...
                    </span>
                  )}
                </>
              )}
              
              {pageNumbers.map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                    page === currentPage
                      ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-500 dark:text-primary-300'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              {endPage < totalPages && (
                <>
                  {endPage < totalPages - 1 && (
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300">
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 text-sm font-medium ${
                  currentPage === totalPages
                    ? 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-700'
                    : 'text-gray-500 bg-white hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700'
                }`}
              >
                <span className="sr-only">Next</span>
                →
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      {/* Action buttons */}
      {actionButtons && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          {actionButtons}
        </div>
      )}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {/* Selection checkbox */}
              {selectable && (
                <th scope="col" className="relative w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={selectedRows.size === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={data.length === 0}
                  />
                </th>
              )}
              
              {/* Column headers */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    <span>{column.header}</span>
                    {column.sortable && sortKey === column.key && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                  
                  {/* Column filter */}
                  {column.filterable && (
                    <div className="mt-1">
                      <input
                        type="text"
                        className="block w-full text-xs border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300"
                        placeholder={`Filter ${column.header}`}
                        value={filters[column.key] || ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleFilterChange(column.key, e.target.value)}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {isLoading ? (
              renderLoading()
            ) : error ? (
              renderError()
            ) : data.length === 0 ? (
              renderEmpty()
            ) : (
              data.map((item, index) => {
                const key = item[keyField as keyof T];
                const isSelected = selectedRows.has(key);
                
                return (
                  <motion.tr
                    key={String(key)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    className={`${
                      onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''
                    } ${isSelected ? 'bg-primary-50 dark:bg-primary-900' : ''}`}
                    onClick={() => onRowClick && onRowClick(item)}
                  >
                    {/* Selection checkbox */}
                    {selectable && (
                      <td className="relative w-12 px-6 py-4">
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleRowSelect(item, e.target.checked);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    
                    {/* Data cells */}
                    {columns.map((column) => (
                      <td
                        key={`${String(key)}-${column.key}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                      >
                        {column.renderCell
                          ? column.renderCell(item)
                          : (item as any)[column.key] !== undefined
                            ? String((item as any)[column.key])
                            : '-'}
                      </td>
                    ))}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {renderPagination()}
    </div>
  );
}

export default DataGrid;
