/**
 * FilterBar.client.tsx
 * Filter bar component for admin data management pages
 * 
 * @source Admin_Flows.md - "Data Management" section
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Filter option type
export interface FilterOption {
  id: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange' | 'boolean';
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

// Filter bar props
export interface FilterBarProps {
  filters: FilterOption[];
  onFilterChange: (filters: Record<string, any>) => void;
  onReset?: () => void;
  onSearch?: (searchTerm: string) => void;
  searchPlaceholder?: string;
  actionButtons?: React.ReactNode;
  isCollapsible?: boolean;
}

/**
 * Filter bar component for admin data management pages
 * 
 * TODO: Implement the following features:
 * - Text search
 * - Filter controls based on filter type
 * - Filter reset
 * - Collapsible filter panel
 * - Responsive design
 */
export function FilterBar({
  filters,
  onFilterChange,
  onReset,
  onSearch,
  searchPlaceholder = 'Search...',
  actionButtons,
  isCollapsible = true
}: FilterBarProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);
  
  // Initialize filter values with defaults
  useEffect(() => {
    const initialValues: Record<string, any> = {};
    
    filters.forEach(filter => {
      if (filter.defaultValue !== undefined) {
        initialValues[filter.id] = filter.defaultValue;
      }
    });
    
    setFilterValues(initialValues);
  }, [filters]);
  
  // Handle filter change
  const handleFilterChange = (id: string, value: any) => {
    const newValues = {
      ...filterValues,
      [id]: value
    };
    
    // Remove empty values
    if (value === '' || value === null || value === undefined) {
      delete newValues[id];
    }
    
    setFilterValues(newValues);
    onFilterChange(newValues);
  };
  
  // Handle search
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  };
  
  // Handle search input keydown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Handle reset
  const handleReset = () => {
    const initialValues: Record<string, any> = {};
    
    filters.forEach(filter => {
      if (filter.defaultValue !== undefined) {
        initialValues[filter.id] = filter.defaultValue;
      }
    });
    
    setFilterValues(initialValues);
    setSearchTerm('');
    
    if (onReset) {
      onReset();
    } else {
      onFilterChange(initialValues);
      if (onSearch) {
        onSearch('');
      }
    }
  };
  
  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Render filter control based on type
  const renderFilterControl = (filter: FilterOption) => {
    const value = filterValues[filter.id] !== undefined ? filterValues[filter.id] : '';
    
    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            placeholder={filter.label}
          />
        );
        
      case 'select':
        return (
          <select
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          >
            <option value="">All {filter.label}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'date':
        return (
          <input
            type="date"
            className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300"
            value={value}
            onChange={(e) => handleFilterChange(filter.id, e.target.value)}
          />
        );
        
      case 'dateRange':
        return (
          <div className="flex space-x-2">
            <input
              type="date"
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300"
              value={value?.from || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, from: e.target.value })}
              placeholder="From"
            />
            <input
              type="date"
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300"
              value={value?.to || ''}
              onChange={(e) => handleFilterChange(filter.id, { ...value, to: e.target.value })}
              placeholder="To"
            />
          </div>
        );
        
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              checked={value === true}
              onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {filter.label}
            </span>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
      {/* Search and toggle bar */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
        {/* Search */}
        <div className="flex-grow max-w-md">
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-300 pr-10"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                onClick={handleSearch}
              >
                🔍
              </button>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {actionButtons}
          
          {/* Reset button */}
          <button
            type="button"
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            onClick={handleReset}
          >
            Reset
          </button>
          
          {/* Toggle button */}
          {isCollapsible && (
            <button
              type="button"
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={toggleExpanded}
            >
              {isExpanded ? 'Hide Filters' : 'Show Filters'}
            </button>
          )}
        </div>
      </div>
      
      {/* Filter controls */}
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filters.map(filter => (
            <div key={filter.id} className="space-y-1">
              {filter.type !== 'boolean' && (
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filter.label}
                </label>
              )}
              {renderFilterControl(filter)}
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default FilterBar;
