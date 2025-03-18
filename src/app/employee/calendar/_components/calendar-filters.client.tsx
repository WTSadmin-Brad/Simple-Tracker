'use client';

/**
 * Calendar Filters Component (Client Component)
 * Provides filtering options for the calendar view
 * 
 * Enhanced with better responsive behavior:
 * - Improved mobile layout with proper spacing
 * - Tablet and desktop optimizations
 * - Better touch targets for all filter elements
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WorkdayType } from '@/types/workday';
import useCalendarStore from '@/stores/calendarStore';
import { Filter, X } from 'lucide-react';

export function CalendarFilters() {
  const { filters, setFilters, resetFilters } = useCalendarStore();
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
  
  // Toggle the filter section on small screens
  const toggleFilterExpansion = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="mb-2 md:mb-4 rounded-md border border-border p-2 md:p-3">
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
          >
            {isExpanded ? 'Hide' : 'Show'}
          </Button>
        </div>
      </div>
      
      {/* Filter content - responsive layout */}
      <div className={`${isExpanded ? 'block' : 'hidden'} md:block`}>
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
              className={`cursor-pointer h-8 flex items-center justify-center px-3 touch-target ${
                filters.workTypes.includes(type) 
                  ? getWorkTypeColor(type)
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
