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
import { getWorkTypeColorClass } from '@/lib/helpers/workdayHelpers';
import { DATE_FORMATS } from '@/lib/constants/dateFormats';
import TicketIndicator from './ticket-indicator';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  workType?: WorkdayType;
  hasTickets?: boolean;
  isToday?: boolean;
  onClick?: (date: Date) => void;
  ariaLabel?: string;
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
  onClick,
  ariaLabel
}: DayCellProps) => {
  const shouldReduceMotion = useReducedMotion();
  const dayNumber = format(date, DATE_FORMATS.DAY_NUMBER);
  const formattedDate = format(date, DATE_FORMATS.ARIA_DATE);
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
      data-date={format(date, DATE_FORMATS.API_DATE)}
      role="button"
      aria-label={ariaLabel || `${formattedDate}${workType ? `, ${workType} day` : ''}${hasTickets ? ', has tickets' : ''}`}
      tabIndex={isCurrentMonth ? 0 : -1}
    >
      <div className="p-1 h-full flex flex-col">
        <div className={`text-xs font-medium ${isToday ? 'text-primary font-bold' : ''}`}>
          {dayNumber}
        </div>
        
        {/* Ticket indicator */}
        {hasTickets && <TicketIndicator />}
      </div>
    </motion.div>
  );
};

export default DayCell;
