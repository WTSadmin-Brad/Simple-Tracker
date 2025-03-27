/**
 * useDataGrid.ts
 * Custom hook for managing data grid state and operations
 * 
 * This hook centralizes common data grid functionality including
 * sorting and row click handling.
 */

import { useState, useCallback } from 'react';

interface UseDataGridProps<T> {
  data: T[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  initialSort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
}

/**
 * Custom hook for managing data grid state and operations
 */
export function useDataGrid<T>({
  data,
  keyField,
  onRowClick,
  initialSort = { key: null, direction: 'asc' }
}: UseDataGridProps<T>) {
  // State for sorting
  const [sortKey, setSortKey] = useState<string | null>(initialSort.key);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSort.direction);
  
  // Handle sort
  const handleSort = useCallback((key: string) => {
    setSortDirection(prev => {
      if (sortKey === key) {
        return prev === 'asc' ? 'desc' : 'asc';
      }
      return 'asc';
    });
    
    setSortKey(key);
  }, [sortKey]);
  
  // Handle row click
  const handleRowClick = useCallback((item: T) => {
    if (onRowClick) {
      onRowClick(item);
    }
  }, [onRowClick]);
  
  return {
    // State
    sortKey,
    sortDirection,
    
    // Actions
    handleSort,
    handleRowClick
  };
}

export default useDataGrid;
