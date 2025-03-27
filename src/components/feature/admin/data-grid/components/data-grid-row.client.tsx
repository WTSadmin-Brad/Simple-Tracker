/**
 * data-grid-row.client.tsx
 * Row component for data grid with selection functionality
 */

import React from 'react';
import { DataGridColumn } from '../types';

interface DataGridRowProps<T = any> {
  item: T;
  columns: DataGridColumn<T>[];
  keyField: keyof T;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (item: T, selected: boolean) => void;
  onClick?: (item: T) => void;
}

export function DataGridRow<T = any>({
  item,
  columns,
  keyField,
  selectable = false,
  selected = false,
  onSelect,
  onClick
}: DataGridRowProps<T>) {
  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(item, e.target.checked);
    }
    
    // Prevent row click when clicking checkbox
    e.stopPropagation();
  };
  
  // Handle row click
  const handleRowClick = () => {
    if (onClick) {
      onClick(item);
    }
  };
  
  return (
    <tr 
      className={`${
        selected ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-gray-800'
      } ${
        onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''
      }`}
      onClick={handleRowClick}
    >
      {selectable && (
        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800"
              checked={selected}
              onChange={handleCheckboxChange}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </td>
      )}
      
      {columns.map(column => (
        <td 
          key={column.key} 
          className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
        >
          {column.renderCell ? column.renderCell(item) : (item as any)[column.key]}
        </td>
      ))}
    </tr>
  );
}

export default DataGridRow;
