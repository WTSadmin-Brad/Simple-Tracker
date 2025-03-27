/**
 * Archive Search Bar Component
 * 
 * Client component for searching archived tickets and data.
 * Provides search input and filter controls for archive management.
 */

'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input.client';
import { Button } from '@/components/ui/button.client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.client';
import { SearchIcon, Loader2 } from 'lucide-react';

export type ArchiveType = 'all' | 'tickets' | 'workdays';
export type DateRange = 'all' | 'last-30-days' | 'last-90-days' | 'last-year' | 'custom';

export interface ArchiveSearchFilters {
  query: string;
  archiveType: ArchiveType;
  dateRange: DateRange;
}

interface ArchiveSearchBarProps {
  onSearch: (filters: ArchiveSearchFilters) => Promise<void>;
  isLoading?: boolean;
}

export default function ArchiveSearchBar({ onSearch, isLoading = false }: ArchiveSearchBarProps) {
  const [filters, setFilters] = useState<ArchiveSearchFilters>({
    query: '',
    archiveType: 'all',
    dateRange: 'all'
  });

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, query: e.target.value }));
  }, []);

  const handleArchiveTypeChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, archiveType: value as ArchiveType }));
  }, []);

  const handleDateRangeChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, dateRange: value as DateRange }));
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await onSearch(filters);
  }, [onSearch, filters]);

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Archives
          </label>
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search by ID, jobsite, truck, etc." 
              className="w-full pl-10"
              value={filters.query}
              onChange={handleQueryChange}
              disabled={isLoading}
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archive Type
          </label>
          <Select 
            value={filters.archiveType} 
            onValueChange={handleArchiveTypeChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="tickets">Tickets</SelectItem>
              <SelectItem value="workdays">Workdays</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <Select 
            value={filters.dateRange} 
            onValueChange={handleDateRangeChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          type="submit" 
          className="md:self-end"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search Archives'
          )}
        </Button>
      </div>
    </form>
  );
}
