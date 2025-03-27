'use client';

/**
 * Day Selector Component (Client Component)
 * 
 * Interactive component for selecting days in a weekly view.
 * Displays a week of dates with navigation controls for moving between weeks.
 * 
 * Features:
 * - Week navigation with previous/next buttons
 * - Visual indicators for today and selected day
 * - Animation effects for interactions (with reduced motion support)
 * - Full accessibility support
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isSameDay, addDays, startOfWeek } from 'date-fns';
import { DATE_FORMATS } from '@/lib/constants/dateFormats';

/**
 * Props for the Day Selector component
 */
interface DaySelectorProps {
  /** Callback function when a day is selected */
  onDaySelect?: (date: Date) => void;
  /** Initial date to center the week view on */
  initialDate?: Date;
  /** CSS class name to apply to the container */
  className?: string;
}

/**
 * Interactive week day selector with navigation
 */
export function DaySelector({ 
  onDaySelect, 
  initialDate = new Date(),
  className = ""
}: DaySelectorProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [weekDays, setWeekDays] = useState<Date[]>([]);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();
  
  // Generate array of dates for the current week
  useEffect(() => {
    try {
      const sunday = startOfWeek(selectedDate);
      const days = Array(7).fill(0).map((_, i) => addDays(sunday, i));
      setWeekDays(days);
      setError(null);
    } catch (err) {
      setError("Error generating week dates");
      console.error("Week generation error:", err);
    }
  }, [selectedDate]);
  
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
    return format(date, DATE_FORMATS.DAY_NUMBER);
  };
  
  const formatDayName = (date: Date) => {
    return format(date, DATE_FORMATS.WEEKDAY_SHORT);
  };
  
  const isToday = (date: Date) => {
    return isSameDay(date, new Date());
  };
  
  const isSelected = (date: Date) => {
    return isSameDay(date, selectedDate);
  };
  
  // Error state
  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 border border-red-200 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-4" role="navigation">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToPreviousWeek}
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous week</span>
        </Button>
        
        <h3 className="text-sm font-medium">
          {format(selectedDate, DATE_FORMATS.MONTH_YEAR)}
        </h3>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={navigateToNextWeek}
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next week</span>
        </Button>
      </div>
      
      <div 
        className="grid grid-cols-7 gap-1" 
        role="grid"
        aria-label="Day selector"
      >
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
            aria-label={format(date, DATE_FORMATS.ARIA_DATE)}
            aria-selected={isSelected(date)}
            role="gridcell"
          >
            <span className="text-xs font-medium">{formatDayName(date)}</span>
            <span className="text-base">{formatDayNumber(date)}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default DaySelector;