/**
 * filter-bar.client.tsx
 * Filter bar component for admin data management pages
 * 
 * @source Admin_Flows.md - "Data Management" section
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button.client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input.client';
import { Checkbox } from '@/components/ui/checkbox.client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.client';
import { cn } from '@/lib/utils';
import { SearchIcon, FilterIcon, XIcon } from 'lucide-react';
import { FilterConfig, FilterBarProps } from './types';

/**
 * Filter bar component for admin data management pages
 */
export default function FilterBar({
  filters,
  onFilterChange,
  onSearch,
  initialFilters = {},
  initialSearchTerm = '',
  className
}: FilterBarProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>(initialFilters);
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilterValues(prevValues => {
      const newValues = { ...prevValues, [key]: value };
      
      // Remove empty values
      if (value === '' || value === null || value === undefined) {
        delete newValues[key];
      }
      
      // Call the parent handler
      onFilterChange(newValues);
      
      return newValues;
    });
  }, [onFilterChange]);
  
  // Handle search
  const handleSearch = useCallback(() => {
    if (onSearch) {
      onSearch(searchTerm);
    }
  }, [onSearch, searchTerm]);
  
  // Handle search input keydown
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);
  
  // Handle reset
  const handleReset = useCallback(() => {
    setFilterValues({});
    setSearchTerm('');
    
    onFilterChange({});
    if (onSearch) {
      onSearch('');
    }
  }, [onFilterChange, onSearch]);
  
  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);
  
  // Memoize active filter count
  const activeFilterCount = useMemo(() => {
    return Object.keys(filterValues).length;
  }, [filterValues]);
  
  // Render filter control based on type
  const renderFilterControl = useCallback((filter: FilterConfig) => {
    const value = filterValues[filter.key] !== undefined ? filterValues[filter.key] : '';
    
    switch (filter.type) {
      case 'text':
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder || `Filter by ${filter.label}`}
            className="w-full"
          />
        );
        
      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(val) => handleFilterChange(filter.key, val)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`All ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {filter.label}</SelectItem>
              {filter.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        
      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full"
          />
        );
        
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`filter-${filter.key}`}
              checked={value === true}
              onCheckedChange={(checked) => handleFilterChange(filter.key, checked)}
            />
            <label 
              htmlFor={`filter-${filter.key}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {filter.label}
            </label>
          </div>
        );
        
      default:
        return null;
    }
  }, [filterValues, handleFilterChange]);
  
  // Memoize filter badges for better performance
  const filterBadges = useMemo(() => {
    if (Object.keys(filterValues).length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(filterValues).map(([key, value]) => {
          const filter = filters.find(f => f.key === key);
          if (!filter) return null;
          
          let displayValue = value;
          
          // Format display value based on filter type
          if (filter.type === 'select' && filter.options) {
            const option = filter.options.find(opt => opt.value === value);
            if (option) displayValue = option.label;
          } else if (filter.type === 'boolean') {
            displayValue = value ? 'Yes' : 'No';
          }
          
          return (
            <div 
              key={key}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300"
            >
              <span>{filter.label}: {displayValue}</span>
              <button
                type="button"
                className="ml-1 h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary-200 dark:hover:bg-primary-800"
                onClick={() => handleFilterChange(key, undefined)}
              >
                <XIcon className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        
        <button
          type="button"
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={handleReset}
        >
          Clear all
        </button>
      </div>
    );
  }, [filterValues, filters, handleFilterChange, handleReset]);
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Search and expand/collapse */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-2">
        <div className="w-full sm:max-w-xs flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={Object.keys(filterValues).length === 0 && searchTerm === ''}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleExpanded}
            className={cn(
              "flex items-center",
              activeFilterCount > 0 && "border-primary text-primary"
            )}
          >
            <FilterIcon className="h-4 w-4 mr-1" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>
      
      {/* Filter badges */}
      {filterBadges && (
        <div className="px-4 pb-2">
          {filterBadges}
        </div>
      )}
      
      {/* Filter controls */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filters.map(filter => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {filter.label}
              </label>
              {renderFilterControl(filter)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
