'use client';

/**
 * Calendar Navigation Component (Client Component)
 * Provides controls for navigating between months in the calendar
 */

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import useCalendarStore from '@/stores/calendarStore';

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
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToPreviousMonth}
          aria-label="Previous month"
          className="touch-target"
        >
          <span className="sr-only">Previous month</span>
          ←
        </Button>
        
        <motion.h2 
          className="text-lg font-semibold"
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
          className="touch-target"
        >
          <span className="sr-only">Next month</span>
          →
        </Button>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={navigateToToday}
        className="text-sm touch-target"
      >
        Today
      </Button>
    </div>
  );
}

export default CalendarNavigation;
