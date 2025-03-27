'use client';

/**
 * Calendar Filters Component (Client Component)
 * 
 * Provides interactive filtering options for the calendar view with:
 * - Work type filters (full day, half day, off day)
 * - Ticket status filter
 * - Filter reset functionality
 * - Responsive design for all screen sizes
 * 
 * @source Employee_Flows.md - "Workday Filtering" section
 */

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkdayType } from '@/types/workday';
import { useCalendarFilters } from '@/stores/calendarStore';
import { getWorkTypeLabel, getWorkTypeFilterColor } from '@/lib/helpers/workdayHelpers';

/**
 * Props for the Calendar Filters component
 */
interface CalendarFiltersProps {
  className?: string;
}

/**
 * Calendar Filters component for controlling calendar view filters
 */
export function CalendarFilters({ 
  className 
}: CalendarFiltersProps = {}) {
  const { filters, setFilters, resetFilters } = useCalendarFilters();
  const [activeFilters, setActiveFilters] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // Count active filters whenever filters change
  useEffect(() => {
    let count = 0;
    
    // Count work type filters (if not all types are selected)
    if (filters.workTypes.length < 3) {
      count += 1;
    }
    
    // Count other filters
    if (filters.hasTickets) count += 1;
    if (filters.jobsite) count += 1;
    
    setActiveFilters(count);
  }, [filters]);
  
  const toggleWorkType = (type: WorkdayType) => {
    const currentTypes = [...filters.workTypes];
    
    if (currentTypes.includes(type)) {
      // Remove type if it's already selected (but don't allow empty selection)
      if (currentTypes.length > 1) {
        setFilters({
          workTypes: currentTypes.filter(t => t !== type)
        });
      }
    } else {
      // Add type if it's not selected
      setFilters({
        workTypes: [...currentTypes, type]
      });
    }
  };
  
  const toggleTicketFilter = () => {
    setFilters({
      hasTickets: filters.hasTickets ? undefined : true
    });
  };
  
  // Toggle the filter section on small screens
  const toggleFilterExpansion = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className={`mb-2 md:mb-4 rounded-md border border-border p-2 md:p-3 ${className || ''}`}>
      {/* Filter header with toggle for mobile */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium">Filters</h3>
          {activeFilters > 0 && (
            <Badge className="text-xs">{activeFilters}</Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Reset filters button */}
          {activeFilters > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs md:text-sm"
              onClick={resetFilters}
              aria-label="Reset all filters"
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Button>
          )}
          
          {/* Mobile toggle button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-8"
            onClick={toggleFilterExpansion}
            aria-expanded={isExpanded}
            aria-controls="filter-content"
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>
      
      {/* Filter content - responsive layout */}
      <div 
        id="filter-content"
        className={`${isExpanded ? 'block' : 'hidden'} md:block`}
        role="group"
        aria-label="Calendar filters"
      >
        <Separator className="mb-2" />
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:flex gap-2 mb-2">
          <span className="text-sm font-medium text-muted-foreground col-span-2 sm:col-span-4 md:col-span-1">
            Work Type:
          </span>
          
          {/* Work Type Filters with improved touch targets */}
          {(['full', 'half', 'off'] as WorkdayType[]).map(type => (
            <Badge
              key={type}
              variant="outline"
              role="checkbox"
              aria-checked={filters.workTypes.includes(type)}
              aria-label={`${getWorkTypeLabel(type)} filter`}
              className={`cursor-pointer h-8 flex items-center justify-center px-3 touch-target ${
                filters.workTypes.includes(type) 
                  ? getWorkTypeFilterColor(type)
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
              onClick={() => toggleWorkType(type)}
            >
              {getWorkTypeLabel(type)}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:flex gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground col-span-2 sm:col-span-4 md:col-span-1">
            Status:
          </span>
          
          {/* Ticket Filter with improved touch target */}
          <Badge
            variant="outline"
            role="checkbox"
            aria-checked={!!filters.hasTickets}
            aria-label="Has tickets filter"
            className={`cursor-pointer h-8 flex items-center justify-center px-3 touch-target ${
              filters.hasTickets 
                ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
            onClick={toggleTicketFilter}
          >
            Has Tickets
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default CalendarFilters;