'use client';

/**
 * Calendar Content Component (Client Component)
 * Displays the calendar content with data from the calendar store
 */

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import DayCell from '@/components/feature/calendar/DayCell.client';
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
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={monthKey}
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1 }}
        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 rounded-md">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        )}
        
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center font-medium text-gray-700 dark:text-gray-300 py-2 text-sm">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
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
  );
}

export default CalendarContent;
