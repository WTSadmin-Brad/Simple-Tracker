/**
 * MonthView.tsx
 * Server Component for displaying a month view calendar
 * 
 * @source Employee_Flows.md - "Workday Logging Flow" section
 */

import { addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isSameMonth } from 'date-fns';
import { WorkdayType } from '@/types/workday';

interface MonthViewProps {
  month: Date;
  workdays?: {
    date: string;
    workType: WorkdayType;
    hasTickets: boolean;
  }[];
}

/**
 * Server Component for displaying a month view calendar grid
 * Used by the CalendarView component in the employee calendar route
 */
const MonthView = ({ month, workdays = [] }: MonthViewProps) => {
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
  
  // Get workday data for a specific date
  const getWorkdayForDate = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return workdays?.find(workday => workday.date === dateString);
  };
  
  // Get appropriate color class based on work type
  const getWorkTypeColorClass = (workType?: WorkdayType) => {
    switch (workType) {
      case 'full': return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
      case 'half': return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
      case 'off': return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
      default: return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };
  
  const days = getDaysInMonthView(month);
  
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center font-medium text-gray-700 dark:text-gray-300 py-2 text-sm">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {days.map((day, index) => {
        const isCurrentMonth = isSameMonth(day, month);
        const workday = getWorkdayForDate(day);
        const colorClass = getWorkTypeColorClass(workday?.workType);
        
        return (
          <div
            key={index}
            data-date={format(day, 'yyyy-MM-dd')}
            className={`
              border rounded-md overflow-hidden
              ${isCurrentMonth ? colorClass : 'bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600'}
            `}
          >
            <div className="p-1 h-full flex flex-col">
              <div className="text-xs font-medium">
                {format(day, 'd')}
              </div>
              
              {/* Ticket indicator */}
              {workday?.hasTickets && (
                <div className="mt-auto self-end">
                  <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full mr-1 mb-1"></div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthView;
