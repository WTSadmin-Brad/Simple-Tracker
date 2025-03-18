'use client';

/**
 * Day Selector Component (Client Component)
 * Interactive component for selecting days in the calendar
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from 'framer-motion';

type DaySelectorProps = {
  onDaySelect?: (date: Date) => void;
  initialDate?: Date;
};

export function DaySelector({ 
  onDaySelect, 
  initialDate = new Date() 
}: DaySelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const shouldReduceMotion = useReducedMotion();
  
  // Get array of dates for the current week
  const getDaysOfWeek = (date: Date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    
    return Array(7).fill(0).map((_, i) => {
      const newDate = new Date(date);
      newDate.setDate(diff + i);
      return newDate;
    });
  };
  
  const weekDays = getDaysOfWeek(selectedDate);
  
  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
    if (onDaySelect) {
      onDaySelect(date);
    }
  };
  
  const navigateToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };
  
  const navigateToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };
  
  // Format date for display
  const formatDayNumber = (date: Date) => {
    return date.getDate();
  };
  
  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToPreviousWeek}
          aria-label="Previous week"
        >
          <span className="sr-only">Previous week</span>
          ←
        </Button>
        
        <h3 className="text-sm font-medium">
          {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h3>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToNextWeek}
          aria-label="Next week"
        >
          <span className="sr-only">Next week</span>
          →
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date) => (
          <motion.button
            key={date.toISOString()}
            onClick={() => handleDaySelect(date)}
            className={`
              touch-target aspect-square flex flex-col items-center justify-center rounded-full
              ${isToday(date) ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
              ${isSelected(date) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
            `}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
            aria-label={date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            aria-selected={isSelected(date)}
          >
            <span className="text-xs font-medium">{formatDayName(date)}</span>
            <span className="text-base">{formatDayNumber(date)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
