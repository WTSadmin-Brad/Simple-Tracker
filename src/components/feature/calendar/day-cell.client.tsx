/**
 * DayCell.client.tsx
 * Client Component for interactive day cells in the calendar
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */
'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { format } from 'date-fns';
import { WorkdayType } from '@/types/workday';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  workType?: WorkdayType;
  hasTickets?: boolean;
  isToday?: boolean;
  onClick?: (date: Date) => void;
}

/**
 * Interactive day cell component for the calendar
 * Displays day number, work type color, and ticket indicator
 */
const DayCell = ({ 
  date, 
  isCurrentMonth, 
  workType, 
  hasTickets = false,
  isToday = false,
  onClick 
}: DayCellProps) => {
  const shouldReduceMotion = useReducedMotion();
  const dayNumber = format(date, 'd');
  
  // Get appropriate color class based on work type
  const getWorkTypeColorClass = (type?: WorkdayType) => {
    switch (type) {
      case 'full': return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
      case 'half': return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
      case 'off': return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
      default: return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };
  
  const colorClass = getWorkTypeColorClass(workType);
  
  const handleClick = () => {
    if (onClick) {
      onClick(date);
    }
  };
  
  return (
    <motion.div
      whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
      whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
      onClick={handleClick}
      className={`
        aspect-square border rounded-md overflow-hidden cursor-pointer touch-target
        ${isCurrentMonth ? colorClass : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600'}
        ${isToday ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900' : ''}
      `}
      data-date={format(date, 'yyyy-MM-dd')}
    >
      <div className="p-1 h-full flex flex-col">
        <div className={`text-xs font-medium ${isToday ? 'text-primary font-bold' : ''}`}>
          {dayNumber}
        </div>
        
        {/* Ticket indicator */}
        {hasTickets && (
          <div className="mt-auto self-end">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-1 mb-1"></div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DayCell;
