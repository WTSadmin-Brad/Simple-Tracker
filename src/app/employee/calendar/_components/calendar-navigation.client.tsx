'use client';

/**
 * Calendar Navigation Component (Client Component)
 * 
 * Provides controls for navigating between months and years in the calendar.
 * Features month navigation buttons, year selector dropdown, and a "today" button
 * for quick navigation to the current date.
 * 
 * Enhanced with responsive behaviors for all screen sizes:
 * - Stacked layout on mobile (< 640px)
 * - Optimized layout for tablets and small laptops (640px-1024px)
 * - Horizontal layout for larger screens (> 1024px)
 * 
 * @source Employee_Flows.md - "Calendar Navigation" section
 */

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, setYear, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalendarViewState } from '@/stores/calendarStore';
import { DATE_FORMATS } from '@/lib/constants/dateFormats';

/**
 * Props for the Calendar Navigation component
 */
interface CalendarNavigationProps {
  /** CSS class name to apply to the container */
  className?: string;
  /** Optional callback for when the date changes */
  onDateChange?: (date: Date) => void;
}

/**
 * Calendar Navigation component with month/year controls
 */
export function CalendarNavigation({
  className = "",
  onDateChange
}: CalendarNavigationProps) {
  const shouldReduceMotion = useReducedMotion();
  const { currentDate, setCurrentDate } = useCalendarViewState();
  const [currentMonth, setCurrentMonth] = useState<Date>(parseISO(currentDate));
  const [error, setError] = useState<string | null>(null);
  
  // Update local state when store changes
  useEffect(() => {
    try {
      setCurrentMonth(parseISO(currentDate));
      setError(null);
    } catch (err) {
      console.error("Error parsing date:", err);
      setError("Invalid date format");
    }
  }, [currentDate]);
  
  const navigateToPreviousMonth = () => {
    try {
      const newDate = subMonths(currentMonth, 1);
      setCurrentDate(newDate);
      if (onDateChange) onDateChange(newDate);
    } catch (err) {
      setError("Navigation error");
      console.error("Error navigating to previous month:", err);
    }
  };
  
  const navigateToNextMonth = () => {
    try {
      const newDate = addMonths(currentMonth, 1);
      setCurrentDate(newDate);
      if (onDateChange) onDateChange(newDate);
    } catch (err) {
      setError("Navigation error");
      console.error("Error navigating to next month:", err);
    }
  };
  
  const navigateToToday = () => {
    try {
      const today = new Date();
      setCurrentDate(today);
      if (onDateChange) onDateChange(today);
    } catch (err) {
      setError("Navigation error");
      console.error("Error navigating to today:", err);
    }
  };

  // Generate a list of years (5 years back, current year, 5 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  const handleYearChange = (yearStr: string) => {
    try {
      const year = parseInt(yearStr, 10);
      const newDate = setYear(currentMonth, year);
      setCurrentDate(newDate);
      if (onDateChange) onDateChange(newDate);
    } catch (err) {
      setError("Year selection error");
      console.error("Error changing year:", err);
    }
  };
  
  // Display error if there is one
  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 border border-red-200 rounded-md">
        {error} - Please refresh the page.
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col sm:flex-row md:items-center justify-between gap-3 sm:gap-2 md:gap-4 p-1 md:p-2 ${className}`}>
      {/* Month navigation - optimized for all breakpoints */}
      <div className="flex items-center gap-2" role="group" aria-label="Month navigation">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToPreviousMonth}
          aria-label="Previous month"
          className="touch-target h-10 w-10 sm:h-9 sm:w-9"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Previous month</span>
        </Button>
        
        <motion.h2 
          className="text-lg font-semibold min-w-[140px] text-center"
          key={format(currentMonth, DATE_FORMATS.MONTH_KEY || 'yyyy-MM')}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          aria-live="polite"
        >
          {format(currentMonth, DATE_FORMATS.MONTH_YEAR)}
        </motion.h2>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToNextMonth}
          aria-label="Next month"
          className="touch-target h-10 w-10 sm:h-9 sm:w-9"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Next month</span>
        </Button>
      </div>
      
      {/* Year selector and Today button - improved layout for all sizes */}
      <div className="flex items-center justify-between sm:justify-end gap-2 mt-2 sm:mt-0">
        <Select
          value={format(currentMonth, 'yyyy')}
          onValueChange={handleYearChange}
          aria-label="Select year"
        >
          <SelectTrigger className="w-[120px] h-10 sm:h-9 touch-target">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToToday}
          className="h-10 sm:h-9 text-sm touch-target flex items-center gap-1 px-3"
        >
          <CalendarDays className="h-4 w-4 mr-1 hidden sm:inline" aria-hidden="true" />
          Today
        </Button>
      </div>
    </div>
  );
}

export default CalendarNavigation;