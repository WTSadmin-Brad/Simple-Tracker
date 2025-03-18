'use client';

/**
 * Calendar Content Component (Client Component)
 * Displays the calendar content with data from the calendar store
 * 
 * Enhanced with improved responsive behavior:
 * - Better spacing and sizing for calendar grid
 * - Optimized day headers for all screen sizes
 * - Improved loading state display
 */

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import useCalendarStore from '@/stores/calendarStore';

export function CalendarContent() {
  const shouldReduceMotion = useReducedMotion();
  const { 
    currentDate, 
    filters,
    fetchMonthData, 
    getWorkdayForDate,
    setSelectedDate,
    monthsData,
    isLoading
  } = useCalendarStore();
  
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(currentDate));
  
  // Update local state when store changes
  useEffect(() => {
    setCurrentMonthDate(new Date(currentDate));
  }, [currentDate]);
  
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
    setSelectedDate(date);
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
  const monthKey = format(currentMonthDate, 'yyyy-MM');
  const hasData = monthsData[monthKey] !== undefined;
  
  // Get day name display based on screen size
  const getDayNameDisplay = (day: string) => {
    return { full: day, short: day.substring(0, 1) };
  };
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    .map(getDayNameDisplay);
  
  return (
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
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-md backdrop-blur-sm">
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
            
            // Handle DayCell component import manually since we were having an issue
            // Previously imported as: import DayCell from '@/components/feature/calendar/DayCell.client';
            // Now directly implementing the cell rendering:
            
            // Get appropriate color class based on work type
            const getWorkTypeColorClass = (type?: string) => {
              switch (type) {
                case 'full': return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
                case 'half': return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
                case 'off': return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
                default: return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
              }
            };
            
            const colorClass = getWorkTypeColorClass(workType);
            const dayNumber = format(day, 'd');
            
            return (
              <div 
                key={index}
                className={`${!isVisible && isCurrentMonth ? 'opacity-30' : 'opacity-100'} transition-opacity duration-200`}
              >
                <motion.div
                  whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.98 }}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square border rounded-md overflow-hidden cursor-pointer touch-target
                    ${isCurrentMonth ? colorClass : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600'}
                    ${isToday ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : ''}
                  `}
                  data-date={format(day, 'yyyy-MM-dd')}
                >
                  <div className="p-1 sm:p-2 h-full flex flex-col">
                    <div className={`text-xs sm:text-sm font-medium ${isToday ? 'text-primary font-bold' : ''}`}>
                      {dayNumber}
                    </div>
                    
                    {/* Ticket indicator */}
                    {hasTickets && (
                      <div className="mt-auto self-end">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-blue-500 dark:bg-blue-400 rounded-full mr-1 mb-1"></div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default CalendarContent;
