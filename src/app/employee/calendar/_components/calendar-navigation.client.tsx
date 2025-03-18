'use client';

/**
 * Calendar Navigation Component (Client Component)
 * Provides controls for navigating between months in the calendar
 * 
 * Enhanced with better responsive behavior for all screen sizes:
 * - Stacked layout on mobile (< 640px)
 * - Optimized layout for tablets and small laptops (640px-1024px)
 * - Horizontal layout for larger screens (> 1024px)
 */

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, setYear } from 'date-fns';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import useCalendarStore from '@/stores/calendarStore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

export function CalendarNavigation() {
  const shouldReduceMotion = useReducedMotion();
  const { currentDate, setCurrentDate } = useCalendarStore();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(currentDate));
  
  // Update local state when store changes
  useEffect(() => {
    setCurrentMonth(new Date(currentDate));
  }, [currentDate]);
  
  const navigateToPreviousMonth = () => {
    const newDate = subMonths(currentMonth, 1);
    setCurrentDate(newDate);
  };
  
  const navigateToNextMonth = () => {
    const newDate = addMonths(currentMonth, 1);
    setCurrentDate(newDate);
  };
  
  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate a list of years (5 years back, current year, 5 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  
  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr, 10);
    const newDate = setYear(currentMonth, year);
    setCurrentDate(newDate);
  };
  
  return (
    <div className="flex flex-col sm:flex-row md:items-center justify-between gap-3 sm:gap-2 md:gap-4 p-1 md:p-2">
      {/* Month navigation - optimized for all breakpoints */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToPreviousMonth}
          aria-label="Previous month"
          className="touch-target h-10 w-10 sm:h-9 sm:w-9"
        >
          <span className="sr-only">Previous month</span>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <motion.h2 
          className="text-lg font-semibold min-w-[140px] text-center"
          key={format(currentMonth, 'yyyy-MM')}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {format(currentMonth, 'MMMM yyyy')}
        </motion.h2>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToNextMonth}
          aria-label="Next month"
          className="touch-target h-10 w-10 sm:h-9 sm:w-9"
        >
          <span className="sr-only">Next month</span>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Year selector and Today button - improved layout for all sizes */}
      <div className="flex items-center justify-between sm:justify-end gap-2 mt-2 sm:mt-0">
        <Select
          value={format(currentMonth, 'yyyy')}
          onValueChange={handleYearChange}
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
          <CalendarDays className="h-4 w-4 mr-1 hidden sm:inline" />
          Today
        </Button>
      </div>
    </div>
  );
}

export default CalendarNavigation;
