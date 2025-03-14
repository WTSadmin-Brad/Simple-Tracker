'use client';

/**
 * Calendar Filters Component (Client Component)
 * Provides filtering options for the calendar view
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkdayType } from '@/types/workday';
import useCalendarStore from '@/stores/calendarStore';

export function CalendarFilters() {
  const { filters, setFilters, resetFilters } = useCalendarStore();
  const [activeFilters, setActiveFilters] = useState<number>(0);
  
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
  
  const getWorkTypeLabel = (type: WorkdayType): string => {
    switch (type) {
      case 'full': return 'Full Day';
      case 'half': return 'Half Day';
      case 'off': return 'Off Day';
      default: return '';
    }
  };
  
  const getWorkTypeColor = (type: WorkdayType): string => {
    switch (type) {
      case 'full': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
      case 'half': return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200';
      case 'off': return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
      default: return '';
    }
  };
  
  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
        Filter:
      </span>
      
      {/* Work Type Filters */}
      {(['full', 'half', 'off'] as WorkdayType[]).map(type => (
        <Badge
          key={type}
          variant="outline"
          className={`cursor-pointer touch-target ${
            filters.workTypes.includes(type) 
              ? getWorkTypeColor(type)
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          onClick={() => toggleWorkType(type)}
        >
          {getWorkTypeLabel(type)}
        </Badge>
      ))}
      
      {/* Ticket Filter */}
      <Badge
        variant="outline"
        className={`cursor-pointer touch-target ${
          filters.hasTickets 
            ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
        onClick={toggleTicketFilter}
      >
        Has Tickets
      </Badge>
      
      {/* Reset Filters button (only show if filters are active) */}
      {activeFilters > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto text-xs"
          onClick={resetFilters}
        >
          Reset
        </Button>
      )}
    </div>
  );
}

export default CalendarFilters;
