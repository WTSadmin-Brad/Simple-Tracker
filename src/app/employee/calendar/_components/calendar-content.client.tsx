'use client';

/**
 * Calendar Content Component (Client Component)
 * 
 * Displays the monthly calendar grid with days, workday information, and filter states.
 * Handles grid layout, day rendering, and interactions with the calendar data.
 * 
 * Features:
 * - Responsive grid layout for all device sizes
 * - Visual indicators for work types and ticket status
 * - Filtered view based on selected criteria
 * - Motion transitions between months
 * - Accessible navigation and interaction
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useCalendarDataFetching } from '@/stores/calendarStore';
import DayCell from '@/components/feature/calendar/day-cell.client';
import { DATE_FORMATS } from '@/lib/constants/dateFormats';
import { WorkdayType } from '@/types/workday';

/**
 * Props for the Calendar Content component
 */
interface CalendarContentProps {
  currentDate?: string;
  onDaySelect?: (date: Date) => void;
}

/**
 * Calendar Content displays the main calendar grid with days and workday information
 */
export function CalendarContent({ 
  currentDate: externalCurrentDate,
  onDaySelect
}: CalendarContentProps = {}) {
  const shouldReduceMotion = useReducedMotion();
  const { 
    isLoading,
    error,
    fetchMonthData, 
    getWorkdayForDate,
    monthsData
  } = useCalendarDataFetching();
  
  const { 
    currentDate,
    filters,
    setSelectedDate
  } = useCalendarDataFetching();
  
  // Use either the external currentDate or the one from the store
  const activeDate = externalCurrentDate || currentDate;
  
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(activeDate));
  
  // Update local state when store changes
  useEffect(() => {
    setCurrentMonthDate(new Date(activeDate));
  }, [activeDate]);
  
  // Fetch data for the current month when it changes
  useEffect(() => {
    fetchMonthData(currentMonthDate);
  }, [currentMonthDate, fetchMonthData]);
  
  // Get all days in the current month view (including days from adjacent months)
  const getDaysInMonthView = (date: Date) => {
    const start = startOfWeek(startOfMonth(date));
    const end = endOfWeek(endOfMonth(date));
    
    const days = [];
    let day = start;
    
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    
    return days;
  };
  
  const handleDayClick = (date: Date) => {
    if (onDaySelect) {
      onDaySelect(date);
    } else {
      setSelectedDate(date);
    }
  };
  
  // Filter workdays based on current filters
  const shouldShowDay = (date: Date) => {
    const workday = getWorkdayForDate(date);
    
    // If no workday, only show if we're not filtering
    if (!workday) {
      return true;
    }
    
    // Filter by work type
    if (!filters.workTypes.includes(workday.workType)) {
      return false;
    }
    
    // Filter by has tickets
    if (filters.hasTickets && !workday.ticketSummary) {
      return false;
    }
    
    // Filter by jobsite
    if (filters.jobsite && workday.jobsite !== filters.jobsite) {
      return false;
    }
    
    return true;
  };
  
  const days = getDaysInMonthView(currentMonthDate);
  const monthKey = format(currentMonthDate, DATE_FORMATS.MONTH_KEY || 'yyyy-MM');
  const hasData = monthsData[monthKey] !== undefined;
  
  // Get day name display based on screen size
  const getDayNameDisplay = (day: string) => {
    return { full: day, short: day.substring(0, 1) };
  };
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    .map(getDayNameDisplay);
  
  // Handle error state
  if (error) {
    return (
      <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-md border border-red-200 dark:border-red-800">
        <p className="text-red-800 dark:text-red-300 text-sm">
          Error loading calendar data: {error}
        </p>
      </div>
    );
  }
  
  return (
    <div role="grid" aria-label="Monthly calendar" className="relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative mt-2 md:mt-4 rounded-md overflow-hidden"
        >
          {/* Loading overlay with improved visual feedback */}
          {isLoading && (
            <div 
              className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-md backdrop-blur-sm"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="flex flex-col items-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading calendar data...</p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
            {/* Day headers - responsive for all screen sizes */}
            {dayNames.map((day, index) => (
              <div 
                key={index} 
                className="text-center font-medium text-gray-700 dark:text-gray-300 py-2 text-xs sm:text-sm"
                role="columnheader"
                aria-label={day.full}
              >
                <span className="hidden sm:inline">{day.full}</span>
                <span className="sm:hidden">{day.short}</span>
              </div>
            ))}
            
            {/* Calendar days - with improved spacing and sizing */}
            {days.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentMonthDate);
              const isToday = isSameDay(day, new Date());
              
              // Get workday data for this day
              const workday = hasData ? getWorkdayForDate(day) : undefined;
              const workType = workday?.workType;
              const hasTickets = !!workday?.ticketSummary;
              
              // Check if this day should be shown based on filters
              const isVisible = shouldShowDay(day);
              
              return (
                <div 
                  key={index}
                  className={`${!isVisible && isCurrentMonth ? 'opacity-30' : 'opacity-100'} transition-opacity duration-200`}
                  role="gridcell"
                >
                  <DayCell
                    date={day}
                    isCurrentMonth={isCurrentMonth}
                    workType={workType}
                    hasTickets={hasTickets}
                    isToday={isToday}
                    onClick={handleDayClick}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default CalendarContent;