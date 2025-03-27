/**
 * ArchiveFilterControls Component
 * 
 * Provides filtering controls for archive search results including:
 * - Item type filtering (tickets, workdays, images)
 * - Date range filtering
 */

'use client';

import { useState } from 'react';
import { CalendarIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Archive item types
const ARCHIVE_TYPES = [
  { id: 'all', label: 'All Items' },
  { id: 'tickets', label: 'Tickets' },
  { id: 'workdays', label: 'Workdays' },
  { id: 'images', label: 'Images' }
];

export interface ArchiveFilters {
  type: 'all' | 'tickets' | 'workdays' | 'images';
  dateFrom?: Date;
  dateTo?: Date;
}

interface ArchiveFilterControlsProps {
  filters: ArchiveFilters;
  onFilterChange: (filters: ArchiveFilters) => void;
  onResetFilters: () => void;
  totalFilters: number;
}

export function ArchiveFilterControls({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilters
}: ArchiveFilterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle type selection
  const handleTypeChange = (type: string) => {
    onFilterChange({
      ...filters,
      type: type as ArchiveFilters['type']
    });
  };

  // Handle date from change
  const handleDateFromChange = (date: Date | undefined) => {
    onFilterChange({
      ...filters,
      dateFrom: date
    });
  };

  // Handle date to change
  const handleDateToChange = (date: Date | undefined) => {
    onFilterChange({
      ...filters,
      dateTo: date
    });
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Filters</span>
            {totalFilters > 0 && (
              <Badge variant="secondary" className="ml-1 rounded-full h-5 min-w-5 px-1">
                {totalFilters}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Item Type</h4>
              <RadioGroup 
                value={filters.type} 
                onValueChange={handleTypeChange}
                className="flex flex-col space-y-1"
              >
                {ARCHIVE_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.id} id={`type-${type.id}`} />
                    <Label htmlFor={`type-${type.id}`}>{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Date Range</h4>
              <div className="grid gap-2">
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="dateFrom" className="col-span-1">From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dateFrom"
                        variant="outline"
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !filters.dateFrom && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? (
                          format(filters.dateFrom, "MMM d, yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom}
                        onSelect={handleDateFromChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-2">
                  <Label htmlFor="dateTo" className="col-span-1">To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="dateTo"
                        variant="outline"
                        className={cn(
                          "col-span-3 justify-start text-left font-normal",
                          !filters.dateTo && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? (
                          format(filters.dateTo, "MMM d, yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo}
                        onSelect={handleDateToChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="pt-2 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onResetFilters}
                disabled={totalFilters === 0}
              >
                Reset Filters
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Date range quick filters */}
      {filters.dateFrom && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1"
        >
          <span>From: {format(filters.dateFrom, "MMM d, yyyy")}</span>
          <button 
            className="ml-1 rounded-full hover:bg-muted p-0.5" 
            onClick={() => handleDateFromChange(undefined)}
          >
            <span className="sr-only">Remove from date filter</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </Badge>
      )}
      
      {filters.dateTo && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1"
        >
          <span>To: {format(filters.dateTo, "MMM d, yyyy")}</span>
          <button 
            className="ml-1 rounded-full hover:bg-muted p-0.5" 
            onClick={() => handleDateToChange(undefined)}
          >
            <span className="sr-only">Remove to date filter</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </Badge>
      )}
      
      {filters.type !== 'all' && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1"
        >
          <span>Type: {ARCHIVE_TYPES.find(t => t.id === filters.type)?.label}</span>
          <button 
            className="ml-1 rounded-full hover:bg-muted p-0.5" 
            onClick={() => handleTypeChange('all')}
          >
            <span className="sr-only">Remove type filter</span>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </Badge>
      )}
    </div>
  );
}
